import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  findProfileById: vi.fn(),
  findLatestSuccessByUserId: vi.fn(),
  findLatestRefundRequestByOrderId: vi.fn(),
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
    findProfileById: mocks.findProfileById,
    findLatestRefundRequestByOrderId: mocks.findLatestRefundRequestByOrderId,
  },
}))

vi.mock('@/repositories/order.repository', () => ({
  OrderRepository: {
    findLatestSuccessByUserId: mocks.findLatestSuccessByUserId,
  },
}))

describe('GET /api/user/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
  })

  it('should return 401 when user is unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('@/app/api/user/me/route')
    const response = await GET()

    expect(response.status).toBe(401)
  })

  it('should return 404 when db user does not exist', async () => {
    mocks.findProfileById.mockResolvedValue(null)
    const { GET } = await import('@/app/api/user/me/route')
    const response = await GET()

    expect(response.status).toBe(404)
  })

  it('should return profile with lastOrder and refund info', async () => {
    mocks.findProfileById.mockResolvedValue({
      id: 'u-1',
      email: 'u@example.com',
      name: 'User',
      image: null,
      targetLanguage: 'EN',
      proficiencyLevel: 'beginner',
      isPro: true,
      proType: '3_MONTHS',
      proStartDate: null,
      proEndDate: null,
      phoneNumber: null,
      birthday: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      themePreference: 'light',
    })
    mocks.findLatestSuccessByUserId.mockResolvedValue({
      id: 'o-1',
      orderCode: 123,
      createdAt: new Date('2026-01-10T00:00:00.000Z'),
    })
    mocks.findLatestRefundRequestByOrderId.mockResolvedValue({
      id: 'r-1',
      status: 'PENDING',
      createdAt: new Date('2026-01-11T00:00:00.000Z'),
    })
    const { GET } = await import('@/app/api/user/me/route')
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe('u-1')
    expect(data.proficiencyLevel).toBe('A1')
    expect(data.lastOrder.orderCode).toBe(123)
    expect(data.lastOrder.latestRefundRequest.id).toBe('r-1')
  })
})
