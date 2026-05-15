import dotenv from 'dotenv';
dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '5000', 10),
  MONGO_URI: required('MONGO_URI'),
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',
  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY ?? '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY ?? '7d',
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  COINGECKO_API_KEY: process.env.COINGECKO_API_KEY ?? '',
  WALLET_SECRET: process.env.WALLET_SECRET ?? 'crystal-hd-wallet-secret-change-in-production',
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? '',
  EMAIL_FROM: process.env.EMAIL_FROM ?? 'Crystal <onboarding@resend.dev>',
  isDev: process.env.NODE_ENV !== 'production',
};
