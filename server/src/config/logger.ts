import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Winston logger:
 *   - Production  → JSON lines to stdout (structured, parseable by log aggregators)
 *   - Development → Colourised pretty-print for readability
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  format: isProduction
    ? winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${level}: ${message}${metaStr}`;
        })
      ),
  transports: [new winston.transports.Console()],
  // Do not exit on uncaught exception inside logger itself
  exitOnError: false,
});
