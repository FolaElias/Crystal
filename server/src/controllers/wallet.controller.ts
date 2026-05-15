import { Response, NextFunction } from 'express';
import { Wallet as WalletModel } from '../models/Wallet';
import { Transaction } from '../models/Transaction';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import type { AssetSymbol, ApiResponse } from '@crystal/shared';
import { getDepositAddress as deriveDepositAddress, CHAIN_NETWORKS } from '../services/walletService';
import { getCachedPrices } from '../services/priceService';

const ALL_SYMBOLS: AssetSymbol[] = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'SUI'];

export async function getWallet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const wallet = await WalletModel.findOne({ userId: req.userId });
    if (!wallet) throw new AppError('Wallet not found', 404);

    // Backfill any coins added after account creation
    const existing = new Set(wallet.balances.map((b) => b.symbol));
    const missing = ALL_SYMBOLS.filter((s) => !existing.has(s));
    if (missing.length) {
      await WalletModel.findByIdAndUpdate(wallet._id, {
        $push: { balances: { $each: missing.map((symbol) => ({ symbol, available: 0, locked: 0 })) } },
      });
      for (const symbol of missing) wallet.balances.push({ symbol, available: 0, locked: 0 });
    }

    const prices = await getCachedPrices();

    const balancesWithValue = wallet.balances.map((b) => {
      const price = prices[b.symbol]?.usd ?? 0;
      const total = b.available + b.locked;
      return {
        symbol: b.symbol,
        available: b.available,
        locked: b.locked,
        total,
        usdValue: total * price,
      };
    });

    const totalUsdValue = balancesWithValue.reduce((sum, b) => sum + b.usdValue, 0);

    const response: ApiResponse = {
      success: true,
      data: {
        _id: wallet._id,
        userId: wallet.userId,
        balances: balancesWithValue,
        totalUsdValue,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      },
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function getDepositAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { symbol } = req.params as { symbol: AssetSymbol };
    const wallet = await WalletModel.findOne({ userId: req.userId });
    if (!wallet) throw new AppError('Wallet not found', 404);

    let balance = wallet.balances.find((b) => b.symbol === symbol);

    if (!balance?.depositAddress) {
      const address = await deriveDepositAddress(req.userId!, symbol);

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
      data: {
        symbol,
        address: balance.depositAddress,
        network: CHAIN_NETWORKS[symbol] ?? 'Unknown',
      },
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function getPrices(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const prices = await getCachedPrices();
    const response: ApiResponse = { success: true, data: prices };
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
