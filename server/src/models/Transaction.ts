import mongoose, { Document, Schema } from 'mongoose';
import { AssetSymbol, TransactionType, TransactionStatus } from '@crystal/shared';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  status: TransactionStatus;
  asset: AssetSymbol;
  amount: number;
  fee: number;
  usdValue: number;
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['deposit', 'withdrawal', 'buy', 'sell', 'transfer'], required: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'], default: 'pending' },
    asset: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    fee: { type: Number, default: 0, min: 0 },
    usdValue: { type: Number, default: 0 },
    txHash: { type: String },
    fromAddress: { type: String },
    toAddress: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, createdAt: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
