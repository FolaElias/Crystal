import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, Activity, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useGetWalletQuery } from '@/features/wallet/walletApi';
import { useGetMeQuery } from '@/features/auth/authApi';
import { useLivePrices } from '@/hooks/useLivePrices';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { AssetSymbol } from '@crystal/shared';

const COIN_META: Record<string, { name: string; color: string }> = {
  BTC:  { name: 'Bitcoin',  color: '#F7931A' },
  ETH:  { name: 'Ethereum', color: '#627EEA' },
  USDT: { name: 'Tether',   color: '#26A17B' },
  BNB:  { name: 'BNB',      color: '#F0B90B' },
  SOL:  { name: 'Solana',   color: '#9945FF' },
  XRP:  { name: 'XRP',      color: '#00AAE4' },
  ADA:  { name: 'Cardano',  color: '#0033AD' },
  DOGE: { name: 'Dogecoin', color: '#C2A633' },
  SUI:  { name: 'Sui',      color: '#4CA3FF' },
};

const QUICK_ACTIONS = [
  { label: 'Buy',      sub: 'Purchase crypto',  color: 'neon-green'  },
  { label: 'Sell',     sub: 'Convert to cash',  color: 'neon-red'    },
  { label: 'Deposit',  sub: 'Add funds',         color: 'neon-cyan'   },
  { label: 'Withdraw', sub: 'Send to wallet',    color: 'neon-purple' },
];

const DISPLAY_COINS: AssetSymbol[] = ['BTC', 'ETH', 'BNB', 'SOL', 'SUI', 'XRP', 'ADA', 'DOGE', 'USDT'];

export function DashboardPage() {
  const { data: meData }     = useGetMeQuery();
  const { data: walletData } = useGetWalletQuery();
  const { prices, connected } = useLivePrices();

  const user   = meData?.data;
  const wallet = walletData?.data;

  // Compute portfolio value from live prices
  const portfolioValue = wallet?.balances?.reduce((sum, b) => {
    const price = prices[b.symbol]?.usd ?? 0;
    return sum + (b.available + b.locked) * price;
  }, 0) ?? wallet?.totalUsdValue ?? 0;

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="animate-slide-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mb-1">Portfolio Overview</p>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome, <span className="gradient-text-cyan">{user?.firstName ?? 'Trader'}</span>
          </h1>
        </div>
        <div className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-neon-cyan/15">
          <Activity className="w-3.5 h-3.5 text-neon-cyan" />
          <span className="text-xs text-neon-cyan font-mono tracking-wide">LIVE</span>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-neon-green animate-pulse' : 'bg-muted-foreground'}`} />
        </div>
      </div>

      {/* Total balance hero */}
      <div className="animate-slide-up delay-100 relative rounded-2xl overflow-hidden border border-neon-cyan/20 shadow-neon-cyan">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 via-neon-purple/5 to-transparent" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -right-16 -top-16 w-48 sm:w-64 h-48 sm:h-64 rounded-full border border-neon-cyan/10 animate-spin-slow" />
        <div className="absolute -right-8 -top-8 w-28 sm:w-40 h-28 sm:h-40 rounded-full border border-neon-purple/10 animate-spin-reverse" />

        <div className="relative p-5 sm:p-8 flex items-start sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground tracking-widest uppercase mb-2">Total Portfolio Value</p>
            <p className="text-3xl sm:text-5xl font-bold font-mono text-white text-glow-cyan break-all">
              {formatCurrency(portfolioValue)}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
              <span className="flex items-center gap-1 text-sm text-muted-foreground font-semibold">
                {wallet?.balances?.length ?? 0} assets tracked
              </span>
            </div>
          </div>
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-neon-cyan/20 animate-pulse-ring" />
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center shadow-neon-cyan">
              <Wallet className="w-5 h-5 sm:w-7 sm:h-7 text-neon-cyan" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="animate-slide-up delay-200">
        <p className="text-xs text-muted-foreground tracking-widest uppercase mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ label, sub, color }) => (
            <button
              key={label}
              className={`group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl glass border border-${color}/20 hover:border-${color}/50 hover:bg-${color}/5 transition-all duration-300 card-hover overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-${color}/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
              <ArrowUpRight className={`w-4 h-4 sm:w-5 sm:h-5 text-${color} mb-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform`} />
              <span className={`text-sm font-bold text-${color}`}>{label}</span>
              <span className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Market overview — live prices */}
      <div className="animate-slide-up delay-300">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground tracking-widest uppercase">Market Overview</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="w-3 h-3 text-neon-gold" />
            <span className="hidden sm:inline">CoinGecko</span>
            {connected && <span className="text-neon-green font-mono">• LIVE</span>}
          </div>
        </div>

        {/* Desktop table */}
        <Card className="overflow-hidden hidden sm:block">
          <div className="grid grid-cols-4 px-5 py-3 border-b border-crystal-border">
            {['Asset', 'Price', '24h Change', 'Volume'].map((h) => (
              <span key={h} className="text-xs text-muted-foreground tracking-widest uppercase">{h}</span>
            ))}
          </div>
          {DISPLAY_COINS.map((symbol, i) => {
            const info = prices[symbol];
            const meta = COIN_META[symbol] ?? { name: symbol, color: '#888' };
            const price = info?.usd ?? 0;
            const change = info?.usd_24h_change ?? 0;
            const vol = info?.usd_24h_vol ?? 0;
            return (
              <div
                key={symbol}
                className="grid grid-cols-4 items-center px-5 py-4 border-b border-crystal-border/50 hover:bg-crystal-hover transition-colors duration-150 cursor-pointer group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${meta.color}18`, border: `1px solid ${meta.color}33` }}
                  >
                    <span className="text-xs font-bold font-mono" style={{ color: meta.color }}>
                      {symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{symbol}</p>
                    <p className="text-xs text-muted-foreground">{meta.name}</p>
                  </div>
                </div>
                <p className="text-sm font-mono font-semibold">
                  {price ? formatCurrency(price) : <span className="text-muted-foreground animate-pulse">—</span>}
                </p>
                <div className={`flex items-center gap-1 text-sm font-semibold font-mono ${change >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                  {change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {info ? formatPercent(change) : <span className="text-muted-foreground animate-pulse">—</span>}
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {vol ? `$${(vol / 1e9).toFixed(1)}B` : <span className="animate-pulse">—</span>}
                </p>
              </div>
            );
          })}
        </Card>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-2">
          {DISPLAY_COINS.map((symbol) => {
            const info = prices[symbol];
            const meta = COIN_META[symbol] ?? { name: symbol, color: '#888' };
            const price = info?.usd ?? 0;
            const change = info?.usd_24h_change ?? 0;
            return (
              <Card key={symbol} animated glow="cyan" className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${meta.color}18`, border: `1px solid ${meta.color}33` }}
                    >
                      <span className="text-xs font-bold font-mono" style={{ color: meta.color }}>
                        {symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{symbol}</p>
                      <p className="text-xs text-muted-foreground">{meta.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold">
                      {price ? formatCurrency(price) : '—'}
                    </p>
                    <div className={`flex items-center justify-end gap-1 text-xs font-semibold font-mono ${change >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                      {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {info ? formatPercent(change) : '—'}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
