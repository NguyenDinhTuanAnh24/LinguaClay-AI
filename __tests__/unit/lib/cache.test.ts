import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('cache', () => {
  beforeEach(() => {
    vi.resetModules()
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
  })

  it('get should cache value in memory and avoid repeated fetches', async () => {
    const { cache } = await import('@/lib/cache')
    const fetcher = vi.fn(async () => ({ ok: true }))

    const first = await cache.get('test:key:1', fetcher, 60)
    const second = await cache.get('test:key:1', fetcher, 60)

    expect(first).toEqual({ ok: true })
    expect(second).toEqual({ ok: true })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('invalidate should remove key from memory cache', async () => {
    const { cache } = await import('@/lib/cache')
    const fetcher = vi.fn(async () => 'value')

    await cache.get('test:key:2', fetcher, 60)
    await cache.invalidate('test:key:2')
    await cache.get('test:key:2', fetcher, 60)

    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('invalidatePrefix should remove all matching keys', async () => {
    const { cache } = await import('@/lib/cache')
    const firstFetcher = vi.fn(async () => 'v1')
    const secondFetcher = vi.fn(async () => 'v2')

    await cache.get('prefix:a', firstFetcher, 60)
    await cache.get('prefix:b', secondFetcher, 60)
    await cache.invalidatePrefix('prefix:')
    await cache.get('prefix:a', firstFetcher, 60)
    await cache.get('prefix:b', secondFetcher, 60)

    expect(firstFetcher).toHaveBeenCalledTimes(2)
    expect(secondFetcher).toHaveBeenCalledTimes(2)
  })

  it('CACHE_KEYS helpers should generate stable key format', async () => {
    const { CACHE_KEYS } = await import('@/lib/cache')

    expect(CACHE_KEYS.flashcardsAll).toBe('flashcards:all')
    expect(CACHE_KEYS.userProgress('u1')).toBe('user:u1:progress')
    expect(CACHE_KEYS.userPlan('u1')).toBe('user:u1:plan')
  })
})
