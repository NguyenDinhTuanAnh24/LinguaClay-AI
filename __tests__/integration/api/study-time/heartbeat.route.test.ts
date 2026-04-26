import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  findDailyActiveSeconds: vi.fn(),
  upsertDailyActiveSeconds: vi.fn(),
  createUserNotification: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}))

vi.mock('@/repositories/study-time.repository', () => ({
  StudyTimeRepository: {
    findDailyActiveSeconds: mocks.findDailyActiveSeconds,
    upsertDailyActiveSeconds: mocks.upsertDailyActiveSeconds,
  },
}))

vi.mock('@/lib/user-notifications', () => ({
  createUserNotification: mocks.createUserNotification,
}))

describe('POST /api/study-time/heartbeat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    mocks.createUserNotification.mockResolvedValue(undefined)
  })

  it('should return 401 when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('@/app/api/study-time/heartbeat/route')
    const response = await POST(new Request('http://localhost/api/study-time/heartbeat', { method: 'POST', body: '{}' }))

    expect(response.status).toBe(401)
  })

  it('should return 400 for invalid json payload', async () => {
    const { POST } = await import('@/app/api/study-time/heartbeat/route')
    const response = await POST(
      new Request('http://localhost/api/study-time/heartbeat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{bad-json',
      })
    )

    expect(response.status).toBe(400)
  })

  it('should short-circuit when increment is <= 0', async () => {
    const { POST } = await import('@/app/api/study-time/heartbeat/route')
    const response = await POST(
      new Request('http://localhost/api/study-time/heartbeat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ activeSeconds: 0 }),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.activeSeconds).toBe(0)
    expect(mocks.upsertDailyActiveSeconds).not.toHaveBeenCalled()
  })

  it('should upsert active time and create notification when goal is crossed', async () => {
    mocks.findDailyActiveSeconds.mockResolvedValue({ activeSeconds: 10790 })
    mocks.upsertDailyActiveSeconds.mockResolvedValue({ activeSeconds: 10810 })
    const { POST } = await import('@/app/api/study-time/heartbeat/route')
    const response = await POST(
      new Request('http://localhost/api/study-time/heartbeat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ activeSeconds: 30 }),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.activeSeconds).toBe(10810)
    expect(mocks.upsertDailyActiveSeconds).toHaveBeenCalledTimes(1)
    expect(mocks.createUserNotification).toHaveBeenCalledTimes(1)
  })
})
