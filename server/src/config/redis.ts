import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', () => {
  // swallow — redis is optional in dev
});

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch {
    logger.warn('Redis unavailable — queue features disabled. Install Redis to enable.');
  }
}
