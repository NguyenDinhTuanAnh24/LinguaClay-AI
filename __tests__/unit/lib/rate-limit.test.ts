import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  limitFn: vi.fn(),
  slidingWindowFn: vi.fn(),
}))

vi.mock('@upstash/redis', () => ({
  Redis: class MockRedis {
    constructor(_args: unknown) {}
  },
}))

vi.mock('@upstash/ratelimit', () => {
  class MockRatelimit {
    static slidingWindow = mocks.slidingWindowFn
    limit = mocks.limitFn
    constructor(_args: unknown) {}
  }
  return { Ratelimit: MockRatelimit }
})

function makeRequest(headers?: Record<string, string>) {
  return new Request('http://localhost/api/test', { headers }) as any
}

describe('applyRateLimit', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
  })

  it('should enforce in-memory limits and return 429 when exceeded', async () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1_000)
    const { applyRateLimit } = await import('@/lib/rate-limit')
    const req = makeRequest({ 'x-forwarded-for': '1.1.1.1' })

    for (let i = 0; i < 10; i += 1) {
      const result = await applyRateLimit(req, 'payment')
      expect(result.ok).toBe(true)
    }

    const denied = await applyRateLimit(req, 'payment')
    expect(denied.ok).toBe(false)
    if (!denied.ok) {
      expect(denied.response.status).toBe(429)
      expect(denied.response.headers.get('X-RateLimit-Limit')).toBe('10')
      expect(denied.response.headers.get('X-RateLimit-Remaining')).toBe('0')
    }

    nowSpy.mockRestore()
  })

  it('should reset in-memory window after expiration', async () => {
    const nowSpy = vi.spyOn(Date, 'now')
    nowSpy.mockReturnValue(10_000)
    const { applyRateLimit } = await import('@/lib/rate-limit')
    const req = makeRequest({ 'x-real-ip': '2.2.2.2' })

    const first = await applyRateLimit(req, 'ai')
    expect(first.ok).toBe(true)
    if (first.ok) {
      expect(first.limit).toBe(20)
      expect(first.remaining).toBe(19)
    }

    nowSpy.mockReturnValue(80_500) // past 60s window
    const second = await applyRateLimit(req, 'ai')
    expect(second.ok).toBe(true)
    if (second.ok) {
      expect(second.remaining).toBe(19)
    }

    nowSpy.mockRestore()
  })

  it('should isolate counters by identifier and preset', async () => {
    const { applyRateLimit } = await import('@/lib/rate-limit')
    const req = makeRequest({ 'x-forwarded-for': '3.3.3.3' })

    for (let i = 0; i < 10; i += 1) {
      await applyRateLimit(req, 'auth', 'user-a')
    }
    const deniedA = await applyRateLimit(req, 'auth', 'user-a')
    const allowedB = await applyRateLimit(req, 'auth', 'user-b')
    const allowedOtherPreset = await applyRateLimit(req, 'api', 'user-a')

    expect(deniedA.ok).toBe(false)
    expect(allowedB.ok).toBe(true)
    expect(allowedOtherPreset.ok).toBe(true)
  })

  it('should use Upstash limiter when credentials exist and pass success response', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.com'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token'
    mocks.limitFn.mockResolvedValue({
      success: true,
      remaining: 9,
      limit: 10,
      reset: 20_000,
    })

    const { applyRateLimit } = await import('@/lib/rate-limit')
    const result = await applyRateLimit(makeRequest({ 'x-forwarded-for': '4.4.4.4' }), 'payment')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.remaining).toBe(9)
      expect(result.limit).toBe(10)
      expect(result.reset).toBe(20_000)
    }
    expect(mocks.slidingWindowFn).toHaveBeenCalled()
    expect(mocks.limitFn).toHaveBeenCalledWith('4.4.4.4:payment')
  })

  it('should return denied response from Upstash limiter with retry headers', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.com'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token'
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(25_000)
    mocks.limitFn.mockResolvedValue({
      success: false,
      remaining: 0,
      limit: 10,
      reset: 35_000,
    })

    const { applyRateLimit } = await import('@/lib/rate-limit')
    const denied = await applyRateLimit(makeRequest({ 'x-forwarded-for': '5.5.5.5' }), 'payment')

    expect(denied.ok).toBe(false)
    if (!denied.ok) {
      expect(denied.response.status).toBe(429)
      expect(denied.response.headers.get('Retry-After')).toBe('10')
      expect(denied.response.headers.get('X-RateLimit-Limit')).toBe('10')
      expect(denied.response.headers.get('X-RateLimit-Remaining')).toBe('0')
      expect(denied.response.headers.get('X-RateLimit-Reset')).toBe('35000')
    }

    nowSpy.mockRestore()
  })
})
