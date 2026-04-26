import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  update: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}))

vi.mock('@/repositories/user.repository', () => ({
  UserRepository: {
    update: mocks.update,
  },
}))

describe('POST /api/user/update-profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    mocks.update.mockResolvedValue({ id: 'u-1', name: 'New Name' })
  })

  it('should return 401 when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('@/app/api/user/update-profile/route')
    const response = await POST(
      new Request('http://localhost/api/user/update-profile', {
        method: 'POST',
        body: JSON.stringify({}),
      }) as any
    )

    expect(response.status).toBe(401)
  })

  it('should return 400 for invalid json', async () => {
    const { POST } = await import('@/app/api/user/update-profile/route')
    const response = await POST(
      new Request('http://localhost/api/user/update-profile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{bad-json',
      }) as any
    )

    expect(response.status).toBe(400)
  })

  it('should return 400 for invalid payload schema', async () => {
    const { POST } = await import('@/app/api/user/update-profile/route')
    const response = await POST(
      new Request('http://localhost/api/user/update-profile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phoneNumber: 'abc#' }),
      }) as any
    )

    expect(response.status).toBe(400)
  })

  it('should update user profile with normalized proficiency level', async () => {
    const { POST } = await import('@/app/api/user/update-profile/route')
    const response = await POST(
      new Request('http://localhost/api/user/update-profile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Alice',
          proficiencyLevel: 'upper intermediate',
          birthday: '2020-01-02',
          phoneNumber: '+84 123 456',
        }),
      }) as any
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(mocks.update).toHaveBeenCalledWith(
      'u-1',
      expect.objectContaining({
        name: 'Alice',
        proficiencyLevel: 'B2',
        phoneNumber: '+84 123 456',
        birthday: new Date('2020-01-02'),
      })
    )
  })
})
