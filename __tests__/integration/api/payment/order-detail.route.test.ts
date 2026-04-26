import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  payosGet: vi.fn(),
  findOrderByCode: vi.fn(),
  findOwnedOrder: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}))

vi.mock('@payos/node', () => ({
  PayOS: class MockPayOS {
    paymentRequests = { get: mocks.payosGet }
  },
}))

vi.mock('@/repositories/payment.repository', () => ({
  PaymentRepository: {
    findOrderByCode: mocks.findOrderByCode,
    findOwnedOrder: mocks.findOwnedOrder,
  },
}))

describe('GET /api/payment/order-detail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
  })

  it('should return 400 for invalid orderCode', async () => {
    const { GET } = await import('@/app/api/payment/order-detail/route')
    const response = await GET(new Request('http://localhost/api/payment/order-detail?orderCode=abc'))

    expect(response.status).toBe(400)
  })

  it('should return 403 when order is not owned by user', async () => {
    mocks.findOrderByCode.mockResolvedValue({ id: 'o-1' })
    mocks.findOwnedOrder.mockResolvedValue(null)
    const { GET } = await import('@/app/api/payment/order-detail/route')
    const response = await GET(new Request('http://localhost/api/payment/order-detail?orderCode=101'))

    expect(response.status).toBe(403)
  })

  it('should return order detail and payos data', async () => {
    mocks.findOrderByCode.mockResolvedValue({
      id: 'o-2',
      orderCode: 202,
      planId: '3_MONTHS',
      amount: 299000,
      originalAmount: 299000,
      discountAmount: 0,
      couponCode: null,
      status: 'PENDING',
      createdAt: '2026-04-26T00:00:00.000Z',
    })
    mocks.findOwnedOrder.mockResolvedValue({ id: 'o-2' })
    mocks.payosGet.mockResolvedValue({ status: 'PENDING', checkoutUrl: 'https://checkout', amount: 299000 })
    const { GET } = await import('@/app/api/payment/order-detail/route')
    const response = await GET(new Request('http://localhost/api/payment/order-detail?orderCode=202'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.order.orderCode).toBe(202)
    expect(data.payos.checkoutUrl).toBe('https://checkout')
  })
})
