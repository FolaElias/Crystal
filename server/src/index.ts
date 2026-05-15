import { createServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { createApp } from './app';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { env } from './config/env';
import { logger } from './config/logger';
import { startPriceService } from './services/priceService';

async function bootstrap() {
  await connectDatabase();
  await connectRedis();

  const app = createApp();
  const httpServer = createServer(app);

  const io = new SocketServer(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
    transports: ['websocket', 'polling'],
  });

  startPriceService(io);

  httpServer.listen(env.PORT, () => {
    logger.info(`Crystal server running on http://localhost:${env.PORT}`);
  });

  const shutdown = async () => {
    logger.info('Shutting down...');
    io.close();
    httpServer.close(() => process.exit(0));
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
