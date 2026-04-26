import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { signOut: mocks.signOut },
  })),
}))

describe('GET /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.signOut.mockResolvedValue(undefined)
  })

  it('should sign out and redirect to root', async () => {
    const { GET } = await import('@/app/api/auth/logout/route')
    const response = await GET(new Request('http://localhost/api/auth/logout?next=/dashboard'))

    expect(mocks.signOut).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/')
  })
})
