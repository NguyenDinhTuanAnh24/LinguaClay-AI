/**
 * @fileoverview App-level cache layer using an in-process LRU strategy.
 *
 * Automatically uses Upstash Redis when env vars are present,
 * falling back to a simple in-memory TTL cache for local development.
 *
 * Designed for caching expensive Prisma queries that change infrequently:
 * - flashcard topic lists
 * - grammar point lists
 * - user plan status
 *
 * Usage:
 *   const data = await cache.get('flashcards:all', () => prisma.topic.findMany(...), 300)
 */

// ─── Types ─────────────────────────────────────────────────────────────────

type Fetcher<T> = () => Promise<T>

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

// ─── In-Memory Cache ───────────────────────────────────────────────────────

const memCache = new Map<string, CacheEntry<unknown>>()

/** Simple in-process TTL cache (used in local dev or when Redis is unavailable) */
function memGet<T>(key: string): T | null {
  const entry = memCache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memCache.delete(key)
    return null
  }
  return entry.value
}

function memSet<T>(key: string, value: T, ttlSeconds: number): void {
  memCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

// ─── Redis client (lazy singleton) ────────────────────────────────────────

let redisClient: import('@upstash/redis').Redis | null | undefined = undefined // undefined = not tried yet

async function getRedis(): Promise<import('@upstash/redis').Redis | null> {
  if (redisClient !== undefined) return redisClient

  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    redisClient = null
    return null
  }

  const { Redis } = await import('@upstash/redis')
  redisClient = new Redis({ url, token })
  return redisClient
}

// ─── Main Cache API ───────────────────────────────────────────────────────

export const cache = {
  /**
   * Get a value from cache, or compute and store it.
   *
   * @param key       — Unique cache key (e.g. "flashcards:all")
   * @param fetcher   — Async function to compute the value on cache miss
   * @param ttl       — Time-to-live in seconds (default: 5 minutes)
   */
  async get<T>(key: string, fetcher: Fetcher<T>, ttl = 300): Promise<T> {
    const redis = await getRedis()

    if (redis) {
      // Redis path
      const cached = await redis.get<T>(key)
      if (cached !== null) return cached

      const fresh = await fetcher()
      await redis.setex(key, ttl, JSON.stringify(fresh))
      return fresh
    }

    // In-memory path
    const cached = memGet<T>(key)
    if (cached !== null) return cached

    const fresh = await fetcher()
    memSet(key, fresh, ttl)
    return fresh
  },

  /**
   * Invalidate (delete) one or more cache keys.
   * Useful after mutations (e.g., after importing flashcards, bust 'flashcards:all').
   */
  async invalidate(...keys: string[]): Promise<void> {
    const redis = await getRedis()
    if (redis) {
      await Promise.all(keys.map((k) => redis.del(k)))
    } else {
      keys.forEach((k) => memCache.delete(k))
    }
  },

  /**
   * Invalidate all keys matching a prefix pattern.
   * Only effective with Redis; in-memory scan.
   */
  async invalidatePrefix(prefix: string): Promise<void> {
    const redis = await getRedis()
    if (redis) {
      const keys = await redis.keys(`${prefix}*`)
      if (keys.length > 0) await Promise.all(keys.map((k) => redis.del(k)))
    } else {
      for (const k of memCache.keys()) {
        if (k.startsWith(prefix)) memCache.delete(k)
      }
    }
  },
}

// ─── Cache Key Constants ──────────────────────────────────────────────────
// Centralise all cache keys to avoid typos across the codebase.

export const CACHE_KEYS = {
  flashcardsAll:        'flashcards:all',
  grammarAll:           'grammar:all',
  userProgress:         (userId: string) => `user:${userId}:progress`,
  userPlan:             (userId: string) => `user:${userId}:plan`,
  grammarQuiz:          'grammar:quiz',
} as const
