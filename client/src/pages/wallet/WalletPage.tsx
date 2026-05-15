import { useState } from 'react';
import { Eye, EyeOff, Plus, ArrowDownToLine, ArrowUpFromLine, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGetWalletQuery } from '@/features/wallet/walletApi';
import { useLivePrices } from '@/hooks/useLivePrices';
import { formatCurrency, formatCrypto, formatPercent } from '@/lib/utils';
import type { AssetSymbol } from '@crystal/shared';

const COIN_META: Record<string, { name: string; color: string; bg: string }> = {
  BTC:  { name: 'Bitcoin',  color: '#F7931A', bg: 'rgba(247,147,26,0.12)'  },
  ETH:  { name: 'Ethereum', color: '#627EEA', bg: 'rgba(98,126,234,0.12)'  },
  USDT: { name: 'Tether',   color: '#26A17B', bg: 'rgba(38,161,123,0.12)'  },
  BNB:  { name: 'BNB',      color: '#F0B90B', bg: 'rgba(240,185,11,0.12)'  },
  SOL:  { name: 'Solana',   color: '#9945FF', bg: 'rgba(153,69,255,0.12)'  },
  XRP:  { name: 'XRP',      color: '#00AAE4', bg: 'rgba(0,170,228,0.12)'   },
  ADA:  { name: 'Cardano',  color: '#0033AD', bg: 'rgba(0,51,173,0.12)'    },
  DOGE: { name: 'Dogecoin', color: '#C2A633', bg: 'rgba(194,166,51,0.12)'  },
  SUI:  { name: 'Sui',      color: '#4CA3FF', bg: 'rgba(76,163,255,0.12)'  },
};

export function WalletPage() {
  const [hideBalance, setHideBalance] = useState(false);
  const { data: walletData, isLoading, refetch } = useGetWalletQuery();
  const { prices } = useLivePrices();
  const wallet = walletData?.data;

  // Compute live USD values
  const balancesWithLiveValue = wallet?.balances?.map((b) => {
    const price = prices[b.symbol]?.usd ?? 0;
    const total = b.available + b.locked;
    return { ...b, total, liveUsdValue: total * price, livePrice: price };
  }) ?? [];

  const totalLiveValue = balancesWithLiveValue.reduce((sum, b) => sum + b.liveUsdValue, 0);

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="animate-slide-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mb-1">Asset Management</p>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text-cyan">Wallet</h1>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button variant="secondary" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Asset</span>
          </Button>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="animate-slide-up delay-100 relative rounded-2xl overflow-hidden border border-neon-gold/20 shadow-neon-gold">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-gold/8 via-transparent to-neon-purple/5" />
        <div className="absolute -right-12 -bottom-12 w-40 sm:w-48 h-40 sm:h-48 rounded-full border border-neon-gold/10 animate-spin-slow" />

        <div className="relative p-5 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground tracking-widest uppercase mb-2">Total Balance</p>
              <div className="flex items-end gap-3 flex-wrap">
                <p className="text-3xl sm:text-5xl font-bold font-mono text-white break-all">
                  {hideBalance ? '••••••' : formatCurrency(totalLiveValue > 0 ? totalLiveValue : (wallet?.totalUsdValue ?? 0))}
                </p>
                <button
                  onClick={() => setHideBalance((p) => !p)}
                  className="mb-1 text-muted-foreground hover:text-neon-cyan transition-colors"
                >
                  {hideBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {wallet?.balances?.length ?? 0} assets in portfolio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5 flex-wrap">
            <Button variant="success" size="sm" className="gap-2">
              <ArrowDownToLine className="w-4 h-4" />
              Deposit
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpFromLine className="w-4 h-4" />
              Withdraw
            </Button>
          </div>
        </div>
      </div>

      {/* Assets */}
      <div className="animate-slide-up delay-200">
        <p className="text-xs text-muted-foreground tracking-widest uppercase mb-3">Your Assets</p>

        {/* Desktop table */}
        <Card className="overflow-hidden hidden sm:block">
          <div className="grid grid-cols-5 px-5 py-3 border-b border-crystal-border">
            {['Asset', 'Price', 'Available', 'Locked', 'USD Value'].map((h) => (
              <span key={h} className="text-xs text-muted-foreground tracking-widest uppercase">{h}</span>
            ))}
          </div>

          {isLoading ? (
            <EmptyState loading />
          ) : !balancesWithLiveValue.length ? (
            <EmptyState />
          ) : (
            balancesWithLiveValue.map((balance, i) => {
              const meta = COIN_META[balance.symbol] ?? { name: balance.symbol, color: '#888', bg: 'rgba(128,128,128,0.1)' };
              const change = prices[balance.symbol as AssetSymbol]?.usd_24h_change ?? 0;
              return (
                <div
                  key={balance.symbol}
                  className="grid grid-cols-5 items-center px-5 py-4 border-b border-crystal-border/50 hover:bg-crystal-hover transition-colors duration-150 cursor-pointer group"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: meta.bg, color: meta.color, boxShadow: `0 0 12px ${meta.color}30` }}
                    >
                      {(balance.symbol as AssetSymbol).slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{balance.symbol}</p>
                      <p className="text-xs text-muted-foreground">{meta.name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-mono font-semibold">
                      {balance.livePrice ? formatCurrency(balance.livePrice) : '—'}
                    </p>
                    <div className={`flex items-center gap-0.5 text-xs font-mono ${change >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                      {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {formatPercent(change)}
                    </div>
                  </div>
                  <p className="text-sm font-mono font-semibold">{hideBalance ? '••••' : formatCrypto(balance.available)}</p>
                  <p className="text-sm font-mono text-muted-foreground">{hideBalance ? '••••' : formatCrypto(balance.locked)}</p>
                  <p className="text-sm font-mono font-semibold" style={{ color: meta.color }}>
                    {hideBalance ? '••••' : formatCurrency(balance.liveUsdValue)}
                  </p>
                </div>
              );
            })
          )}
        </Card>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-3">
          {isLoading ? (
            <EmptyState loading />
          ) : !balancesWithLiveValue.length ? (
            <EmptyState />
          ) : (
            balancesWithLiveValue.map((balance) => {
              const meta = COIN_META[balance.symbol] ?? { name: balance.symbol, color: '#888', bg: 'rgba(128,128,128,0.1)' };
              const change = prices[balance.symbol as AssetSymbol]?.usd_24h_change ?? 0;
              return (
                <Card key={balance.symbol} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0"
                        style={{ backgroundColor: meta.bg, color: meta.color, boxShadow: `0 0 12px ${meta.color}30` }}
                      >
                        {(balance.symbol as AssetSymbol).slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{balance.symbol}</p>
                        <p className="text-xs text-muted-foreground">{meta.name}</p>
                        {balance.livePrice > 0 && (
                          <div className={`flex items-center gap-0.5 text-xs font-mono ${change >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {formatPercent(change)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-semibold" style={{ color: meta.color }}>
                        {hideBalance ? '••••' : formatCurrency(balance.liveUsdValue)}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {hideBalance ? '••••' : formatCrypto(balance.available)} {balance.symbol}
                      </p>
                      {balance.livePrice > 0 && (
                        <p className="text-xs text-muted-foreground font-mono">
                          @ {formatCurrency(balance.livePrice)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ loading }: { loading?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-3">
      {loading ? (
        <>
          <RefreshCw className="w-5 h-5 text-neon-cyan animate-spin" />
          <span className="text-sm text-muted-foreground">Loading assets...</span>
        </>
      ) : (
        <>
          <div className="w-14 h-14 rounded-full bg-neon-cyan/5 border border-neon-cyan/15 flex items-center justify-center">
            <ArrowDownToLine className="w-6 h-6 text-neon-cyan/50" />
          </div>
          <p className="text-sm text-muted-foreground">No assets yet</p>
          <p className="text-xs text-muted-foreground/60">Make a deposit to get started</p>
          <Button size="sm" className="mt-2 gap-2">
            <ArrowDownToLine className="w-3.5 h-3.5" />
            Make First Deposit
          </Button>
        </>
      )}
    </div>
  );
}
