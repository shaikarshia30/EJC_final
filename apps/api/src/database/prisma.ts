import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database via Prisma');
  } catch (err) {
    logger.warn('Initial database connection failed. Ensure PostgreSQL is running. Continuing in fallback/offline mode if needed.', { err });
  }
};
