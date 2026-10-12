import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { connectDatabase } from './database/prisma.js';

const startServer = async () => {
  await connectDatabase();

  const app = createApp();

  const server = app.listen(config.port, () => {
    logger.info(`🚀 EJC API Gateway running on port ${config.port} in ${config.env} mode`);
    logger.info(`👉 Health Check: http://localhost:${config.port}/api/health`);
  });

  const shutdown = async () => {
    logger.info('Shutting down EJC server gracefully...');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((err) => {
  logger.error('Failed to start EJC API', { err });
  process.exit(1);
});
