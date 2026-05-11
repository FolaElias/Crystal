import mongoose, { Document, Schema } from 'mongoose';
import { AssetSymbol } from '@crystal/shared';

interface IBalance {
  symbol: AssetSymbol;
  available: number;
  locked: number;
  depositAddress?: string;
}

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balances: IBalance[];
  createdAt: Date;
  updatedAt: Date;
}

const balanceSchema = new Schema<IBalance>(
  {
    symbol: { type: String, required: true },
    available: { type: Number, default: 0, min: 0 },
    locked: { type: Number, default: 0, min: 0 },
    depositAddress: { type: String },
  },
  { _id: false }
);

const walletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balances: { type: [balanceSchema], default: [] },
  },
  { timestamps: true }
);

export const Wallet = mongoose.model<IWallet>('Wallet', walletSchema);
