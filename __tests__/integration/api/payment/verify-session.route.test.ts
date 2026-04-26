import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  payosGet: vi.fn(),
  findOrderForVerify: vi.fn(),
  touchOrderVerifiedAt: vi.fn(),
  markVerifyPaid: vi.fn(),
  markVerifyNonPaid: vi.fn(),
  createUserNotification: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mocks.getUser,
    },
  })),
}))

vi.mock('@payos/node', () => ({
  PayOS: class MockPayOS {
    paymentRequests = {
      get: mocks.payosGet,
    }
  },
}))

vi.mock('@/repositories/payment.repository', () => ({
  PaymentRepository: {
    findOrderForVerify: mocks.findOrderForVerify,
    touchOrderVerifiedAt: mocks.touchOrderVerifiedAt,
    markVerifyPaid: mocks.markVerifyPaid,
    markVerifyNonPaid: mocks.markVerifyNonPaid,
  },
}))

vi.mock('@/lib/user-notifications', () => ({
  createUserNotification: mocks.createUserNotification,
}))

describe('GET/POST /api/payment/verify-session', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    mocks.touchOrderVerifiedAt.mockResolvedValue(undefined)
    mocks.markVerifyPaid.mockResolvedValue(undefined)
    mocks.markVerifyNonPaid.mockResolvedValue(undefined)
    mocks.createUserNotification.mockResolvedValue(undefined)
  })

  it('GET should return 400 when orderCode is invalid', async () => {
    const { GET } = await import('@/app/api/payment/verify-session/route')
    const response = await GET(new Request('http://localhost/api/payment/verify-session?orderCode=abc'))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing or invalid orderCode')
  })

  it('POST should return 404 when order is not found', async () => {
    mocks.findOrderForVerify.mockResolvedValue(null)
    const { POST } = await import('@/app/api/payment/verify-session/route')
    const request = new Request('http://localhost/api/payment/verify-session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orderCode: 12345 }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Order not found')
    expect(mocks.findOrderForVerify).toHaveBeenCalledWith(12345, 'u-1')
  })

  it('POST should mark order as paid when payos status is PAID', async () => {
    mocks.findOrderForVerify.mockResolvedValue({
      id: 'o-1',
      userId: 'u-1',
      planId: '3_MONTHS',
      userCouponId: null,
      status: 'PENDING',
      paidAt: null,
      cancelledAt: null,
      expiredAt: null,
    })
    mocks.payosGet.mockResolvedValue({
      status: 'PAID',
      transactionId: 'tx-1',
      reference: 'ref-1',
    })

    const { POST } = await import('@/app/api/payment/verify-session/route')
    const request = new Request('http://localhost/api/payment/verify-session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orderCode: 56789 }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.status).toBe('PAID')
    expect(mocks.touchOrderVerifiedAt).toHaveBeenCalledTimes(1)
    expect(mocks.markVerifyPaid).toHaveBeenCalledTimes(1)
    expect(mocks.createUserNotification).toHaveBeenCalledTimes(1)
  })
})
