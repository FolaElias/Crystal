import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { authenticator } from 'otplib';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
import { AppError } from '../middleware/errorHandler';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { redis } from '../config/redis';
import { sendLoginOtp } from '../services/email.service';
import { env } from '../config/env';
import { ApiResponse, RegisterPayload, AssetSymbol } from '@crystal/shared';

const ALL_SYMBOLS: AssetSymbol[] = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'SUI'];

const REFRESH_COOKIE = 'crystal_refresh';
const OTP_TTL = 60 * 10;          // 10 minutes
const OTP_MAX_ATTEMPTS = 5;

const COOKIE_OPTS = {
  httpOnly: true,
  secure: !env.isDev,
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Check username availability ───────────────────────────────────────────
export async function checkUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username } = req.query as { username: string };
    if (!username || username.length < 3) {
      res.json({ success: true, data: { available: false } });
      return;
    }
    const exists = await User.findOne({ username: username.toLowerCase().trim() });
    res.json({ success: true, data: { available: !exists } });
  } catch (err) {
    next(err);
  }
}

// ─── Register ──────────────────────────────────────────────────────────────
export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 30 }).trim(),
  body('password').isLength({ min: 8 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
];

export async function register(
  req: Request<object, object, RegisterPayload>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? 'email' : 'username';
      throw new AppError('Account already exists', 409, {
        [field]: [`${field} is already taken`],
      });
    }

    const user = await User.create({ email, username, password, firstName, lastName });
    await Wallet.create({
      userId: user._id,
      balances: ALL_SYMBOLS.map((symbol) => ({ symbol, available: 0, locked: 0 })),
    });

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });

    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
    const response: ApiResponse = {
      success: true,
      data: { accessToken, expiresIn: 15 * 60 },
      message: 'Account created successfully',
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

// ─── Login step 1: validate credentials → send OTP ────────────────────────
export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +twoFactorSecret +twoFactorEnabled');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate OTP and store in Redis
    const otp = generateOtp();
    const sessionId = uuidv4();
    const key = `login_otp:${sessionId}`;

    await redis.set(
      key,
      JSON.stringify({ userId: user._id.toString(), otp, attempts: 0 }),
      'EX',
      OTP_TTL
    );

    // Send email (non-blocking — don't let mail errors fail the request)
    sendLoginOtp(user.email, otp, user.firstName).catch(() => null);

    res.json({
      success: true,
      data: {
        requiresOtp: true,
        sessionId,
        expiresIn: OTP_TTL,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Login step 2: verify OTP → issue tokens ──────────────────────────────
export async function verifyLoginOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId, otp } = req.body as { sessionId: string; otp: string };
    if (!sessionId || !otp) throw new AppError('sessionId and otp are required', 400);

    const key = `login_otp:${sessionId}`;
    const raw = await redis.get(key);
    if (!raw) throw new AppError('Code expired or invalid. Please log in again.', 401);

    const session = JSON.parse(raw) as { userId: string; otp: string; attempts: number };

    if (session.attempts >= OTP_MAX_ATTEMPTS) {
      await redis.del(key);
      throw new AppError('Too many incorrect attempts. Please log in again.', 429);
    }

    if (session.otp !== otp.trim()) {
      session.attempts += 1;
      const ttl = await redis.ttl(key);
      await redis.set(key, JSON.stringify(session), 'EX', ttl > 0 ? ttl : 60);
      const remaining = OTP_MAX_ATTEMPTS - session.attempts;
      throw new AppError(
        `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        401
      );
    }

    // OTP correct — clean up and issue tokens
    await redis.del(key);

    const user = await User.findById(session.userId).select('+refreshTokens +twoFactorEnabled +twoFactorSecret');
    if (!user) throw new AppError('User not found', 404);

    // If user also has TOTP 2FA enabled, handle it
    if (user.twoFactorEnabled) {
      const { totpCode } = req.body as { totpCode?: string };
      if (!totpCode) {
        res.status(403).json({ success: true, data: { requires2FA: true, sessionId } });
        return;
      }
      const valid = authenticator.verify({ token: totpCode, secret: user.twoFactorSecret! });
      if (!valid) throw new AppError('Invalid 2FA code', 401);
    }

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: { $each: [refreshToken], $slice: -5 } },
    });

    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
    res.json({ success: true, data: { accessToken, expiresIn: 15 * 60 } });
  } catch (err) {
    next(err);
  }
}

// ─── Resend OTP ────────────────────────────────────────────────────────────
export async function resendLoginOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId } = req.body as { sessionId: string };
    if (!sessionId) throw new AppError('sessionId is required', 400);

    const key = `login_otp:${sessionId}`;
    const raw = await redis.get(key);
    if (!raw) throw new AppError('Session expired. Please log in again.', 401);

    const session = JSON.parse(raw) as { userId: string; otp: string; attempts: number };
    const user = await User.findById(session.userId);
    if (!user) throw new AppError('User not found', 404);

    // Generate a fresh OTP, reset attempts, reset TTL
    const newOtp = generateOtp();
    await redis.set(
      key,
      JSON.stringify({ userId: session.userId, otp: newOtp, attempts: 0 }),
      'EX',
      OTP_TTL
    );

    sendLoginOtp(user.email, newOtp, user.firstName).catch(() => null);

    res.json({
      success: true,
      data: {
        expiresIn: OTP_TTL,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Refresh & Logout ──────────────────────────────────────────────────────
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw new AppError('No refresh token', 401);

    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.sub).select('+refreshTokens');
    if (!user || !user.refreshTokens?.includes(token)) {
      throw new AppError('Invalid refresh token', 401);
    }

    const newAccess = signAccessToken(user._id.toString());
    const newRefresh = signRefreshToken(user._id.toString());

    await User.findByIdAndUpdate(user._id, { $pull: { refreshTokens: token } });
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: { $each: [newRefresh], $slice: -5 } },
    });

    res.cookie(REFRESH_COOKIE, newRefresh, COOKIE_OPTS);
    res.json({ success: true, data: { accessToken: newAccess, expiresIn: 15 * 60 } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      try {
        const payload = verifyRefreshToken(token);
        await User.findByIdAndUpdate(payload.sub, { $pull: { refreshTokens: token } });
      } catch {
        // token already invalid — just clear cookie
      }
    }
    res.clearCookie(REFRESH_COOKIE);
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}
