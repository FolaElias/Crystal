import { Response, NextFunction } from 'express';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse } from '@crystal/shared';

export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.userId);
    if (!user) throw new AppError('User not found', 404);

    const response: ApiResponse = {
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function setup2FA(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.userId);
    if (!user) throw new AppError('User not found', 404);
    if (user.twoFactorEnabled) throw new AppError('2FA already enabled', 400);

    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(user.email, 'Crystal', secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl);

    await User.findByIdAndUpdate(req.userId, { twoFactorSecret: secret });

    res.json({ success: true, data: { qrCode: qrCodeDataUrl, secret } });
  } catch (err) {
    next(err);
  }
}

export async function confirm2FA(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { totpCode } = req.body;
    const user = await User.findById(req.userId).select('+twoFactorSecret');
    if (!user) throw new AppError('User not found', 404);
    if (!user.twoFactorSecret) throw new AppError('2FA setup not initiated', 400);

    const valid = authenticator.verify({ token: totpCode, secret: user.twoFactorSecret });
    if (!valid) throw new AppError('Invalid 2FA code', 401);

    await User.findByIdAndUpdate(req.userId, { twoFactorEnabled: true });
    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (err) {
    next(err);
  }
}
