import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  cookiesFn: vi.fn(),
  createServerClientFn: vi.fn(),
  cookieGet: vi.fn(),
  cookieSet: vi.fn(),
  cookieDelete: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: mocks.cookiesFn,
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: mocks.createServerClientFn,
}))

vi.unmock('@/utils/supabase/server')

describe('utils/supabase/server createClient', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

    mocks.cookiesFn.mockResolvedValue({
      get: mocks.cookieGet,
      set: mocks.cookieSet,
      delete: mocks.cookieDelete,
    })
    mocks.createServerClientFn.mockReturnValue({ client: true })
  })

  it('should initialize server client with env values and cookie adapter', async () => {
    const { createClient } = await import('@/utils/supabase/server')
    const result = await createClient()

    expect(result).toEqual({ client: true })
    expect(mocks.createServerClientFn).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key',
      expect.objectContaining({
        cookies: expect.objectContaining({
          get: expect.any(Function),
          set: expect.any(Function),
          remove: expect.any(Function),
        }),
      })
    )
  })

  it('cookie adapter should map get/set/remove to next cookies store', async () => {
    mocks.cookieGet.mockReturnValue({ value: 'abc' })
    const { createClient } = await import('@/utils/supabase/server')
    await createClient()

    const adapter = mocks.createServerClientFn.mock.calls[0]?.[2]?.cookies
    expect(adapter.get('token')).toBe('abc')
    adapter.set('token', 'new', {})
    adapter.remove('token', { path: '/' })

    expect(mocks.cookieGet).toHaveBeenCalledWith('token')
    expect(mocks.cookieSet).toHaveBeenCalledWith({ name: 'token', value: 'new', path: '/' })
    expect(mocks.cookieDelete).toHaveBeenCalledWith('token')
  })

  it('cookie adapter should honor explicit path option in set', async () => {
    const { createClient } = await import('@/utils/supabase/server')
    await createClient()

    const adapter = mocks.createServerClientFn.mock.calls[0]?.[2]?.cookies
    adapter.set('session', 'value', { path: '/dashboard', maxAge: 10 })

    expect(mocks.cookieSet).toHaveBeenCalledWith({ name: 'session', value: 'value', path: '/dashboard' })
  })
})
