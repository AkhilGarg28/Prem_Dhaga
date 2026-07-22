import rateLimit from 'express-rate-limit';
import type { Options } from 'express-rate-limit';
import { getRedis } from '../config/redis';

/**
 * Returns a base rate-limit config.
 * When Redis is available we'd swap the store to a Redis store;
 * for now we use the default in-memory store (acceptable for single-instance
 * local dev) and log a clear note about upgrading for multi-instance deployments.
 */
const createLimiter = (options: Partial<Options>) => {
  if (!getRedis()) {
    // In-memory store is reset on process restart — fine for dev, not for
    // multi-instance production. Upgrade to rate-limit-redis when REDIS_URL is set.
  }

  return rateLimit({
    standardHeaders: true, // Return RateLimit-* headers
    legacyHeaders: false,  // Disable X-RateLimit-* headers
    message: {
      error: 'Too many requests. Please wait a moment and try again.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    ...options,
  });
};

/**
 * Auth endpoints — 10 attempts per 15 minutes.
 * Tight limit to mitigate credential-stuffing and brute-force attacks.
 */
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many authentication attempts. Please wait 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});

/**
 * OTP endpoints — 5 requests per 10 minutes to prevent SMS bombing.
 */
export const otpLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many OTP requests. Please wait 10 minutes.',
    code: 'OTP_RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Checkout / order creation — 20 requests per minute.
 * Prevents cart/order spam while allowing reasonable retry behaviour.
 */
export const checkoutLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    error: 'Too many order requests. Please slow down.',
    code: 'CHECKOUT_RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Global fallback — 200 requests per 15 minutes per IP.
 * Provides a safety net for endpoints without a specific limiter.
 */
export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
