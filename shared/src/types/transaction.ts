import { AssetSymbol } from './wallet';

export type TransactionType = 'deposit' | 'withdrawal' | 'buy' | 'sell' | 'transfer';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  _id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalPayload {
  asset: AssetSymbol;
  amount: number;
  toAddress: string;
  network: string;
}
