import { Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import { Wallet as WalletModel } from '../models/Wallet';
import { Transaction } from '../models/Transaction';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { AssetSymbol, ApiResponse } from '@crystal/shared';

export async function getWallet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const wallet = await WalletModel.findOne({ userId: req.userId });
    if (!wallet) throw new AppError('Wallet not found', 404);

    const response: ApiResponse = { success: true, data: wallet };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function getDepositAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { symbol } = req.params as { symbol: AssetSymbol };
    let wallet = await WalletModel.findOne({ userId: req.userId });
    if (!wallet) throw new AppError('Wallet not found', 404);

    let balance = wallet.balances.find((b) => b.symbol === symbol);

    if (!balance?.depositAddress) {
      // Generate a deterministic address per user+asset (demo — use HD wallet in production)
      const wallet_eth = ethers.Wallet.createRandom();
      const address = wallet_eth.address;

      if (!balance) {
        wallet.balances.push({ symbol, available: 0, locked: 0, depositAddress: address });
      } else {
        balance.depositAddress = address;
      }
      await wallet.save();
      balance = wallet.balances.find((b) => b.symbol === symbol)!;
    }

    const response: ApiResponse = {
      success: true,
      data: { symbol, address: balance.depositAddress, network: 'ERC-20' },
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function getTransactions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string ?? '1', 10);
    const limit = parseInt(req.query.limit as string ?? '20', 10);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Transaction.find({ userId: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments({ userId: req.userId }),
    ]);

    const response: ApiResponse = {
      success: true,
      data: { items, total, page, limit, totalPages: Math.ceil(total / limit) },
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
}
