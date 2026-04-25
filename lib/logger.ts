/**
 * @fileoverview Structured logger with correlation ID support.
 *
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   logger.info('order.created', { orderId, userId }, '  req-123')
 *   logger.error('payment.failed', error, reqId)
 */

import pino from 'pino'

// ─── Base pino instance ────────────────────────────────────────────────────

const pinoInstance = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  // Redact sensitive fields from logs in all environments
  redact: {
    paths: ['password', 'token', 'authorization', 'email', 'phone', '*.email', '*.password'],
    censor: '[REDACTED]',
  },
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
})

// ─── Correlation-ID-aware wrapper ─────────────────────────────────────────

function makeChild(requestId?: string) {
  if (requestId) return pinoInstance.child({ requestId })
  return pinoInstance
}

// ─── Exported logger ───────────────────────────────────────────────────────

export const logger = {
  /**
   * Log informational messages.
   * @param event  — Dot-notation event name, e.g. "order.created"
   * @param data   — Structured data payload (must be a plain object)
   * @param reqId  — Optional correlation request ID
   */
  info(event: string, data?: Record<string, unknown>, reqId?: string): void {
    makeChild(reqId).info(data ?? {}, event)
  },

  /**
   * Log errors with full stack traces.
   * @param event  — Dot-notation event name, e.g. "payment.failed"
   * @param error  — The error object or structured data
   * @param reqId  — Optional correlation request ID
   */
  error(event: string, error?: unknown, reqId?: string): void {
    const log = makeChild(reqId)
    if (error instanceof Error) {
      log.error({ err: { message: error.message, stack: error.stack, name: error.name } }, event)
    } else {
      log.error({ err: error }, event)
    }
  },

  /**
   * Log warnings.
   */
  warn(event: string, data?: Record<string, unknown>, reqId?: string): void {
    makeChild(reqId).warn(data ?? {}, event)
  },

  /**
   * Log debug-level messages (only emitted in non-production).
   */
  debug(event: string, data?: Record<string, unknown>, reqId?: string): void {
    makeChild(reqId).debug(data ?? {}, event)
  },

  /**
   * Create a bound child logger for a specific request.
   * Useful in API route handlers to avoid passing reqId on every call.
   *
   * @example
   *   const log = logger.withRequest(requestId)
   *   log.info('order.created', { orderId })
   *   log.error('payment.failed', err)
   */
  withRequest(requestId: string) {
    const child = pinoInstance.child({ requestId })
    return {
      info:  (event: string, data?: Record<string, unknown>) => child.info(data ?? {}, event),
      error: (event: string, error?: unknown) => {
        if (error instanceof Error) {
          child.error({ err: { message: error.message, stack: error.stack } }, event)
        } else {
          child.error({ err: error }, event)
        }
      },
      warn:  (event: string, data?: Record<string, unknown>) => child.warn(data ?? {}, event),
      debug: (event: string, data?: Record<string, unknown>) => child.debug(data ?? {}, event),
    }
  },
}
