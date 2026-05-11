import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { authenticator } from 'otplib';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
import { AppError } from '../middleware/errorHandler';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { env } from '../config/env';
import { ApiResponse, RegisterPayload } from '@crystal/shared';

const REFRESH_COOKIE = 'crystal_refresh';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: !env.isDev,
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 30 }).trim(),
  body('password').isLength({ min: 8 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export async function register(req: Request<object, object, RegisterPayload>, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? 'email' : 'username';
      throw new AppError('Account already exists', 409, { [field]: [`${field} is already taken`] });
    }

    const user = await User.create({ email, username, password, firstName, lastName });

    // Create empty wallet for the new user
    await Wallet.create({ userId: user._id, balances: [] });

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

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, totpCode } = req.body;

    const user = await User.findOne({ email }).select('+password +twoFactorSecret +twoFactorEnabled +refreshTokens');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.twoFactorEnabled) {
      if (!totpCode) throw new AppError('2FA code required', 403);
      const valid = authenticator.verify({ token: totpCode, secret: user.twoFactorSecret! });
      if (!valid) throw new AppError('Invalid 2FA code', 401);
    }

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    user.refreshTokens = [...(user.refreshTokens ?? []).slice(-4), refreshToken];
    await user.save();

    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);

    const response: ApiResponse = {
      success: true,
      data: { accessToken, expiresIn: 15 * 60 },
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

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

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token).concat(newRefresh);
    await user.save();

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
