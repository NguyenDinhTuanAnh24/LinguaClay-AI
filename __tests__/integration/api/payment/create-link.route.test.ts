import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  applyRateLimit: vi.fn(),
  getUser: vi.fn(),
  payosCreate: vi.fn(),
  findAvailableUserCouponAssignment: vi.fn(),
  createPendingOrder: vi.fn(),
  markOrderCreatedWithEvent: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}))

vi.mock('@/lib/rate-limit', () => ({
  applyRateLimit: mocks.applyRateLimit,
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}))

vi.mock('@payos/node', () => ({
  PayOS: class MockPayOS {
    paymentRequests = { create: mocks.payosCreate }
  },
}))

vi.mock('@/repositories/payment.repository', () => ({
  PaymentRepository: {
    findAvailableUserCouponAssignment: mocks.findAvailableUserCouponAssignment,
    createPendingOrder: mocks.createPendingOrder,
    markOrderCreatedWithEvent: mocks.markOrderCreatedWithEvent,
  },
}))

describe('POST /api/payment/create-link', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_DOMAIN = 'https://app.example.com'
    mocks.applyRateLimit.mockResolvedValue({ ok: true })
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    mocks.createPendingOrder.mockResolvedValue({ id: 'o-1' })
    mocks.markOrderCreatedWithEvent.mockResolvedValue(undefined)
    mocks.payosCreate.mockResolvedValue({
      checkoutUrl: 'https://checkout',
      qrCode: 'qr',
      description: 'test',
      amount: 299000,
    })
  })

  it('should return rate limit response when limiter denies request', async () => {
    mocks.applyRateLimit.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 }),
    })
    const { POST } = await import('@/app/api/payment/create-link/route')

    const response = await POST(
      new Request('http://localhost/api/payment/create-link', {
        method: 'POST',
        body: JSON.stringify({ description: 'Pay', planId: '3_MONTHS' }),
      }) as any
    )

    expect(response.status).toBe(429)
  })

  it('should return 401 when user is not authenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('@/app/api/payment/create-link/route')

    const response = await POST(
      new Request('http://localhost/api/payment/create-link', {
        method: 'POST',
        body: JSON.stringify({ description: 'Pay', planId: '3_MONTHS' }),
      }) as any
    )

    expect(response.status).toBe(401)
  })

  it('should return 400 for invalid payload', async () => {
    const { POST } = await import('@/app/api/payment/create-link/route')
    const response = await POST(
      new Request('http://localhost/api/payment/create-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ description: 'x'.repeat(30), planId: '3_MONTHS' }),
      }) as any
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeTruthy()
  })

  it('should return 400 when coupon assignment is invalid', async () => {
    mocks.findAvailableUserCouponAssignment.mockResolvedValue(null)
    const { POST } = await import('@/app/api/payment/create-link/route')

    const response = await POST(
      new Request('http://localhost/api/payment/create-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ description: 'Pay', planId: '3_MONTHS', userCouponId: 'uc-1' }),
      }) as any
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Khuyến mãi')
  })

  it('should create payment link successfully', async () => {
    const { POST } = await import('@/app/api/payment/create-link/route')

    const response = await POST(
      new Request('http://localhost/api/payment/create-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ description: 'Pay monthly', planId: '3_MONTHS' }),
      }) as any
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.checkoutUrl).toBe('https://checkout')
    expect(mocks.createPendingOrder).toHaveBeenCalledTimes(1)
    expect(mocks.markOrderCreatedWithEvent).toHaveBeenCalledTimes(1)
  })
})
