import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  findAvailableCouponsByUserId: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}))

vi.mock('@/repositories/payment.repository', () => ({
  PaymentRepository: {
    findAvailableCouponsByUserId: mocks.findAvailableCouponsByUserId,
  },
}))

describe('GET /api/payment/my-coupons', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
  })

  it('should return 401 when user is not logged in', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('@/app/api/payment/my-coupons/route')
    const response = await GET()

    expect(response.status).toBe(401)
  })

  it('should filter out exhausted coupons', async () => {
    mocks.findAvailableCouponsByUserId.mockResolvedValue([
      {
        id: 'uc-1',
        assignedAt: '2026-04-26T00:00:00.000Z',
        coupon: { code: 'A', discountPercent: 10, expiresAt: '2026-05-01', usedCount: 0, usageLimit: 3 },
      },
      {
        id: 'uc-2',
        assignedAt: '2026-04-26T00:00:00.000Z',
        coupon: { code: 'B', discountPercent: 20, expiresAt: '2026-05-01', usedCount: 5, usageLimit: 5 },
      },
    ])
    const { GET } = await import('@/app/api/payment/my-coupons/route')
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.coupons).toHaveLength(1)
    expect(data.coupons[0].code).toBe('A')
  })
})
