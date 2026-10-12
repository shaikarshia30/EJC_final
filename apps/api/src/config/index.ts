import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  jwt: {
    secret: process.env.JWT_SECRET || 'ejc-enterprise-jwt-super-secret-key-32-chars-min',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'ejc-enterprise-jwt-refresh-super-secret-key-min',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  ai: {
    gatewayUrl: process.env.AI_GATEWAY_URL || (process.env.OPENAI_API_KEY ? 'https://api.openai.com/v1' : 'https://openrouter.ai/api/v1'),
    apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '',
    chatModel: process.env.OPENAI_CHAT_MODEL || process.env.AI_CHAT_MODEL || (process.env.OPENAI_API_KEY ? 'gpt-4o-mini' : 'google/gemini-2.5-flash'),
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || process.env.AI_EMBEDDING_MODEL || 'text-embedding-3-small',
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
  },
};
