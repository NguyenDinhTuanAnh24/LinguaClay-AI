/**
 * @fileoverview Central rate limiter configuration.
 *
 * Uses in-memory sliding window strategy when Upstash credentials are absent
 * (local dev), and Upstash Redis in production for distributed enforcement.
 *
 * Usage in API routes:
 *   const result = await applyRateLimit(request, 'ai')
 *   if (!result.ok) return result.response
 */

import { NextRequest, NextResponse } from 'next/server'

// ─── Types ─────────────────────────────────────────────────────────────────

type RateLimitPreset = 'ai' | 'payment' | 'auth' | 'api'

interface RateLimitResult {
  ok: true
  remaining: number
  limit: number
  reset: number
}

interface RateLimitDenied {
  ok: false
  response: NextResponse
}

// ─── Preset Configuration ──────────────────────────────────────────────────

const PRESETS: Record<RateLimitPreset, { requests: number; windowMs: number }> = {
  // AI endpoints — expensive, restrict aggressively
  ai:      { requests: 20,  windowMs: 60_000 },       // 20 req/min
  // Payment creation — prevent abuse/fraud
  payment: { requests: 10,  windowMs: 60_000 },       // 10 req/min
  // Auth (login, signup) — prevent brute force
  auth:    { requests: 10,  windowMs: 900_000 },      // 10 req/15 min
  // Generic API routes
  api:     { requests: 120, windowMs: 60_000 },       // 120 req/min
}

// ─── In-Memory Fallback ────────────────────────────────────────────────────
// Used in local dev when Upstash env vars are not configured.

const memoryStore = new Map<string, { count: number; resetAt: number }>()

function inMemoryLimit(
  key: string,
  { requests, windowMs }: { requests: number; windowMs: number }
): RateLimitResult | null {
  const now = Date.now()
  const entry = memoryStore.get(key)

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: requests - 1, limit: requests, reset: now + windowMs }
  }

  entry.count += 1
  if (entry.count > requests) return null

  return {
    ok: true,
    remaining: requests - entry.count,
    limit: requests,
    reset: entry.resetAt,
  }
}

// ─── Upstash Redis Limiter ─────────────────────────────────────────────────

let upstashLimiter: Map<RateLimitPreset, import('@upstash/ratelimit').Ratelimit> | null = null

async function getUpstashLimiter() {
  if (upstashLimiter) return upstashLimiter

  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  const { Ratelimit } = await import('@upstash/ratelimit')
  const { Redis }     = await import('@upstash/redis')
  const redis         = new Redis({ url, token })

  upstashLimiter = new Map(
    (Object.entries(PRESETS) as [RateLimitPreset, { requests: number; windowMs: number }][]).map(
      ([preset, { requests, windowMs }]) => [
        preset,
        new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(requests, `${windowMs / 1000} s`),
          prefix: `rl:${preset}`,
        }),
      ]
    )
  )

  return upstashLimiter
}

// ─── Main Export ───────────────────────────────────────────────────────────

/**
 * Apply rate limit to an incoming Next.js request.
 *
 * @param request — The incoming request object.
 * @param preset  — Which rate limit bucket to use.
 * @param identifier — Optional custom key (defaults to IP).
 */
export async function applyRateLimit(
  request: NextRequest,
  preset: RateLimitPreset = 'api',
  identifier?: string
): Promise<RateLimitResult | RateLimitDenied> {
  const ip = identifier
    ?? request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? request.headers.get('x-real-ip')
    ?? 'anonymous'

  const key = `${ip}:${preset}`
  const cfg = PRESETS[preset]

  // Try Upstash first (production)
  const limiters = await getUpstashLimiter()
  if (limiters) {
    const limiter = limiters.get(preset)!
    const { success, remaining, limit, reset } = await limiter.limit(key)

    if (!success) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.', retryAfter: Math.ceil((reset - Date.now()) / 1000) },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
              'X-RateLimit-Limit':     String(limit),
              'X-RateLimit-Remaining': String(remaining),
              'X-RateLimit-Reset':     String(reset),
            },
          }
        ),
      }
    }

    return { ok: true, remaining, limit, reset }
  }

  // Fallback to in-memory (local dev)
  const result = inMemoryLimit(key, cfg)
  if (!result) {
    const resetAt = memoryStore.get(key)?.resetAt ?? Date.now() + cfg.windowMs
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.', retryAfter: Math.ceil((resetAt - Date.now()) / 1000) },
        {
          status: 429,
          headers: {
            'Retry-After':           String(Math.ceil((resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit':     String(cfg.requests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset':     String(resetAt),
          },
        }
      ),
    }
  }

  return result
}
