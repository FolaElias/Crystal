import { AssetSymbol } from './wallet';

export interface MarketTicker {
  symbol: AssetSymbol;
  pair: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap?: number;
}

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';
export type OrderStatus = 'open' | 'filled' | 'partially_filled' | 'cancelled';

export interface Order {
  _id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface PlaceOrderPayload {
  side: OrderSide;
  type: OrderType;
  baseAsset: AssetSymbol;
  quoteAsset: AssetSymbol;
  amount: number;
  price?: number;
}
