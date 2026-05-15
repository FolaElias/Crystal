export type AssetSymbol = 'BTC' | 'ETH' | 'USDT' | 'BNB' | 'SOL' | 'XRP' | 'ADA' | 'DOGE' | 'SUI';

export interface Asset {
  symbol: AssetSymbol;
  name: string;
  decimals: number;
  network: string;
  contractAddress?: string;
}

export interface WalletBalance {
  symbol: AssetSymbol;
  available: number;
  locked: number;
  total: number;
  usdValue: number;
}

export interface Wallet {
  _id: string;
  userId: string;
  balances: WalletBalance[];
  totalUsdValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepositAddress {
  symbol: AssetSymbol;
  network: string;
  address: string;
  qrCode?: string;
}

export interface PriceInfo {
  usd: number;
  usd_24h_change: number;
  usd_24h_vol: number;
}

export type PriceMap = Partial<Record<AssetSymbol, PriceInfo>>;
