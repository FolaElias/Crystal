import type { Server as SocketServer } from 'socket.io';
import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { env } from '../config/env';
import type { AssetSymbol, PriceInfo, PriceMap } from '@crystal/shared';

const COINGECKO_IDS: Record<AssetSymbol, string> = {
  BTC:  'bitcoin',
  ETH:  'ethereum',
  USDT: 'tether',
  BNB:  'binancecoin',
  SOL:  'solana',
  XRP:  'ripple',
  ADA:  'cardano',
  DOGE: 'dogecoin',
  SUI:  'sui',
};

const SYMBOL_BY_ID: Record<string, AssetSymbol> = Object.fromEntries(
  Object.entries(COINGECKO_IDS).map(([sym, id]) => [id, sym as AssetSymbol])
);

const PRICE_CACHE_KEY = 'crystal:prices';
const POLL_INTERVAL_MS = 60_000;

type GeckoResponse = Record<string, { usd: number; usd_24h_change: number; usd_24h_vol: number }>;

async function fetchFromCoinGecko(): Promise<PriceMap> {
  const ids = Object.values(COINGECKO_IDS).join(',');
  const url =
    `https://api.coingecko.com/api/v3/simple/price` +
    `?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (env.COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = env.COINGECKO_API_KEY;
  }

  const res = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`CoinGecko ${res.status}: ${res.statusText}`);

  const data = (await res.json()) as GeckoResponse;

  const prices: PriceMap = {};
  for (const [geckoId, info] of Object.entries(data)) {
    const symbol = SYMBOL_BY_ID[geckoId];
    if (symbol) {
      prices[symbol] = {
        usd: info.usd ?? 0,
        usd_24h_change: info.usd_24h_change ?? 0,
        usd_24h_vol: info.usd_24h_vol ?? 0,
      } satisfies PriceInfo;
    }
  }
  return prices;
}

export async function getCachedPrices(): Promise<PriceMap> {
  try {
    const cached = await redis.get(PRICE_CACHE_KEY);
    if (cached) return JSON.parse(cached) as PriceMap;
  } catch {
    // Redis unavailable — return empty, client will retry via socket
  }
  return {};
}

export function startPriceService(io: SocketServer): void {
  let lastPrices: PriceMap = {};

  const poll = async () => {
    try {
      const prices = await fetchFromCoinGecko();
      lastPrices = prices;
      try {
        await redis.setex(PRICE_CACHE_KEY, 120, JSON.stringify(prices));
      } catch {
        // Redis unavailable — continue without cache
      }
      io.emit('price:update', prices);
      logger.info(`Prices updated: ${Object.keys(prices).join(', ')}`);
    } catch (err) {
      logger.warn(`Price fetch failed: ${(err as Error).message}`);
      // Re-emit last known prices so new socket connections still get data
      if (Object.keys(lastPrices).length) io.emit('price:update', lastPrices);
    }
  };

  // Emit last known prices to each newly connected socket
  io.on('connection', (socket) => {
    if (Object.keys(lastPrices).length) {
      socket.emit('price:update', lastPrices);
    }
  });

  poll();
  setInterval(poll, POLL_INTERVAL_MS);
}
