import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  verifyWebhook: vi.fn(),
  findOrderByCode: vi.fn(),
  createWebhookDuplicatedEvent: vi.fn(),
  markWebhookPaid: vi.fn(),
  createUserNotification: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn() },
}))

vi.mock('@payos/node', () => ({
  PayOS: class MockPayOS {
    webhooks = { verify: mocks.verifyWebhook }
  },
}))

vi.mock('@/repositories/payment.repository', () => ({
  PaymentRepository: {
    findOrderByCode: mocks.findOrderByCode,
    createWebhookDuplicatedEvent: mocks.createWebhookDuplicatedEvent,
    markWebhookPaid: mocks.markWebhookPaid,
  },
}))

vi.mock('@/lib/user-notifications', () => ({
  createUserNotification: mocks.createUserNotification,
}))

describe('POST /api/payment/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createWebhookDuplicatedEvent.mockResolvedValue(undefined)
    mocks.markWebhookPaid.mockResolvedValue(undefined)
    mocks.createUserNotification.mockResolvedValue(undefined)
  })

  it('should return success true when webhook payload cannot be verified', async () => {
    mocks.verifyWebhook.mockResolvedValue(null)
    const { POST } = await import('@/app/api/payment/webhook/route')

    const response = await POST(
      new Request('http://localhost/api/payment/webhook', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true })
  })

  it('should return 400 for invalid orderCode', async () => {
    mocks.verifyWebhook.mockResolvedValue({ orderCode: 'abc' })
    const { POST } = await import('@/app/api/payment/webhook/route')

    const response = await POST(
      new Request('http://localhost/api/payment/webhook', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
    )

    expect(response.status).toBe(400)
  })

  it('should return 404 when order does not exist', async () => {
    mocks.verifyWebhook.mockResolvedValue({ orderCode: 123 })
    mocks.findOrderByCode.mockResolvedValue(null)
    const { POST } = await import('@/app/api/payment/webhook/route')

    const response = await POST(
      new Request('http://localhost/api/payment/webhook', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
    )

    expect(response.status).toBe(404)
  })

  it('should mark duplicated event when order already success', async () => {
    mocks.verifyWebhook.mockResolvedValue({ orderCode: 123, status: 'PAID' })
    mocks.findOrderByCode.mockResolvedValue({ id: 'o-1', status: 'SUCCESS' })
    const { POST } = await import('@/app/api/payment/webhook/route')

    const response = await POST(
      new Request('http://localhost/api/payment/webhook', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Already processed')
    expect(mocks.createWebhookDuplicatedEvent).toHaveBeenCalledTimes(1)
    expect(mocks.markWebhookPaid).not.toHaveBeenCalled()
  })

  it('should process paid webhook for pending order', async () => {
    mocks.verifyWebhook.mockResolvedValue({ orderCode: 456, status: 'PAID', transactionId: 'tx-1' })
    mocks.findOrderByCode.mockResolvedValue({
      id: 'o-2',
      userId: 'u-1',
      planId: '3_MONTHS',
      paidAt: null,
      status: 'PENDING',
    })
    const { POST } = await import('@/app/api/payment/webhook/route')

    const response = await POST(
      new Request('http://localhost/api/payment/webhook', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mocks.markWebhookPaid).toHaveBeenCalledTimes(1)
    expect(mocks.createUserNotification).toHaveBeenCalledTimes(1)
  })
})
