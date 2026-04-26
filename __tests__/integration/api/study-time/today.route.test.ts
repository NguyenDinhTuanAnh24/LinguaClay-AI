import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  findDailyActiveSeconds: vi.fn(),
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}))

vi.mock('@/repositories/study-time.repository', () => ({
  StudyTimeRepository: {
    findDailyActiveSeconds: mocks.findDailyActiveSeconds,
  },
}))

describe('GET /api/study-time/today', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
  })

  it('should return 401 when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('@/app/api/study-time/today/route')
    const response = await GET()

    expect(response.status).toBe(401)
  })

  it('should return activeSeconds fallback to 0 when no stat exists', async () => {
    mocks.findDailyActiveSeconds.mockResolvedValue(null)
    const { GET } = await import('@/app/api/study-time/today/route')
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.activeSeconds).toBe(0)
    expect(data.goalSeconds).toBe(10800)
    expect(typeof data.date).toBe('string')
  })

  it('should return activeSeconds from repository', async () => {
    mocks.findDailyActiveSeconds.mockResolvedValue({ activeSeconds: 3600 })
    const { GET } = await import('@/app/api/study-time/today/route')
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.activeSeconds).toBe(3600)
  })
})
