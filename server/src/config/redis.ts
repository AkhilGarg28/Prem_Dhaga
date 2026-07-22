import Redis from 'ioredis';
import { logger } from './logger';

let redis: Redis | null = null;

/**
 * Initialise the Redis client.
 * Gracefully falls back to null (in-memory fallbacks take over) when
 * REDIS_URL is not set — keeps local dev working without a Redis process.
 */
export const connectRedis = (): Redis | null => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    logger.warn(
      'REDIS_URL is not set. Redis features (session persistence, rate limiting) will use in-memory fallbacks. Set REDIS_URL in production.'
    );
    return null;
  }

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      connectTimeout: 10_000,
    });

    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('ready', () => logger.info('Redis ready'));
    redis.on('error', (err) => logger.error('Redis error', { error: err.message }));
    redis.on('close', () => logger.warn('Redis connection closed'));

    return redis;
  } catch (err: any) {
    logger.error('Redis initialisation failed', { error: err.message });
    return null;
  }
};

/**
 * Returns the active Redis client (or null in local-dev fallback mode).
 */
export const getRedis = (): Redis | null => redis;
