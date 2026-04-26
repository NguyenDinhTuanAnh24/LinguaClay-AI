import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  payosCancel: vi.fn(),
  findOrderForCancel: vi.fn(),
  markUserCancelled: vi.fn(),
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
    paymentRequests = { cancel: mocks.payosCancel }
  },
}))

vi.mock('@/repositories/payment.repository', () => ({
  PaymentRepository: {
    findOrderForCancel: mocks.findOrderForCancel,
    markUserCancelled: mocks.markUserCancelled,
  },
}))

describe('POST /api/payment/cancel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    mocks.markUserCancelled.mockResolvedValue(undefined)
    mocks.payosCancel.mockResolvedValue({
      status: 'CANCELLED',
      canceledAt: '2026-04-26T00:00:00.000Z',
      cancellationReason: 'test',
    })
  })

  it('should return 401 when user is unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('@/app/api/payment/cancel/route')
    const response = await POST(new Request('http://localhost/api/payment/cancel', { method: 'POST', body: '{}' }))

    expect(response.status).toBe(401)
  })

  it('should return 400 for invalid orderCode', async () => {
    const { POST } = await import('@/app/api/payment/cancel/route')
    const response = await POST(
      new Request('http://localhost/api/payment/cancel', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderCode: 'abc' }),
      })
    )

    expect(response.status).toBe(400)
  })

  it('should return 409 for successful order', async () => {
    mocks.findOrderForCancel.mockResolvedValue({ id: 'o-1', status: 'SUCCESS', cancelledAt: null })
    const { POST } = await import('@/app/api/payment/cancel/route')
    const response = await POST(
      new Request('http://localhost/api/payment/cancel', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderCode: 1001 }),
      })
    )

    expect(response.status).toBe(409)
  })

  it('should cancel pending order successfully', async () => {
    mocks.findOrderForCancel.mockResolvedValue({ id: 'o-2', status: 'PENDING', cancelledAt: null })
    const { POST } = await import('@/app/api/payment/cancel/route')
    const response = await POST(
      new Request('http://localhost/api/payment/cancel', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderCode: 2002, reason: 'Need cancel' }),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mocks.payosCancel).toHaveBeenCalledWith(2002, 'Need cancel')
    expect(mocks.markUserCancelled).toHaveBeenCalledTimes(1)
  })
})
