import mongoose, { Document, Schema } from 'mongoose';
import { AssetSymbol, OrderSide, OrderType, OrderStatus } from '@crystal/shared';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  baseAsset: AssetSymbol;
  quoteAsset: AssetSymbol;
  amount: number;
  price?: number;
  filledAmount: number;
  avgFillPrice?: number;
  fee: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    side: { type: String, enum: ['buy', 'sell'], required: true },
    type: { type: String, enum: ['market', 'limit'], required: true },
    status: { type: String, enum: ['open', 'filled', 'partially_filled', 'cancelled'], default: 'open' },
    baseAsset: { type: String, required: true },
    quoteAsset: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    price: { type: Number, min: 0 },
    filledAmount: { type: Number, default: 0, min: 0 },
    avgFillPrice: { type: Number, min: 0 },
    fee: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
