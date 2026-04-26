import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  findOrderForRefund: vi.fn(),
  findPendingRefundByOrderId: vi.fn(),
  createRefundRequestFlow: vi.fn(),
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
    findOrderForRefund: mocks.findOrderForRefund,
    findPendingRefundByOrderId: mocks.findPendingRefundByOrderId,
    createRefundRequestFlow: mocks.createRefundRequestFlow,
  },
}))

describe('POST /api/payment/request-refund', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    mocks.createRefundRequestFlow.mockResolvedValue(undefined)
  })

  it('should return 400 when orderId is missing', async () => {
    const { POST } = await import('@/app/api/payment/request-refund/route')
    const response = await POST(
      new Request('http://localhost/api/payment/request-refund', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
    )
    expect(response.status).toBe(400)
  })

  it('should return 400 when bank info is incomplete', async () => {
    const { POST } = await import('@/app/api/payment/request-refund/route')
    const response = await POST(
      new Request('http://localhost/api/payment/request-refund', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderId: 'o-1', bankName: 'VCB' }),
      })
    )
    expect(response.status).toBe(400)
  })

  it('should return 404 for missing order or non-owner', async () => {
    mocks.findOrderForRefund.mockResolvedValue(null)
    const { POST } = await import('@/app/api/payment/request-refund/route')
    const response = await POST(
      new Request('http://localhost/api/payment/request-refund', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          orderId: 'o-2',
          bankName: 'VCB',
          accountNumber: '123',
          accountName: 'A',
        }),
      })
    )
    expect(response.status).toBe(404)
  })

  it('should return 409 when pending refund already exists', async () => {
    mocks.findOrderForRefund.mockResolvedValue({
      id: 'o-3',
      userId: 'u-1',
      status: 'SUCCESS',
      createdAt: new Date(),
    })
    mocks.findPendingRefundByOrderId.mockResolvedValue({ id: 'r-1' })
    const { POST } = await import('@/app/api/payment/request-refund/route')
    const response = await POST(
      new Request('http://localhost/api/payment/request-refund', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          orderId: 'o-3',
          bankName: 'VCB',
          accountNumber: '123',
          accountName: 'A',
        }),
      })
    )

    expect(response.status).toBe(409)
  })

  it('should create refund request successfully', async () => {
    mocks.findOrderForRefund.mockResolvedValue({
      id: 'o-4',
      userId: 'u-1',
      status: 'SUCCESS',
      createdAt: new Date(),
    })
    mocks.findPendingRefundByOrderId.mockResolvedValue(null)
    const { POST } = await import('@/app/api/payment/request-refund/route')
    const response = await POST(
      new Request('http://localhost/api/payment/request-refund', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          orderId: 'o-4',
          reason: 'Need refund',
          bankName: 'VCB',
          accountNumber: '123',
          accountName: 'A',
        }),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mocks.createRefundRequestFlow).toHaveBeenCalledTimes(1)
  })
})
