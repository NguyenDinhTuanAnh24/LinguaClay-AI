import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PaymentRepository } from '@/repositories/payment.repository'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
    paymentEvent: {
      create: vi.fn(),
    },
    userCoupon: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    refundRequest: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

describe('PaymentRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('findAvailableUserCouponAssignment should query available assignment', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.userCoupon.findFirst).mockResolvedValue({ id: 'uc-1' } as never)

    await PaymentRepository.findAvailableUserCouponAssignment({ userCouponId: 'uc-1', userId: 'u-1' })

    expect(prisma.userCoupon.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'uc-1',
        userId: 'u-1',
        status: 'AVAILABLE',
      },
      select: {
        id: true,
        coupon: {
          select: {
            code: true,
            discountPercent: true,
            usageLimit: true,
            usedCount: true,
            isActive: true,
            expiresAt: true,
          },
        },
      },
    })
  })

  it('createPendingOrder should create order', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.create).mockResolvedValue({ id: 'o-1' } as never)
    const data = {
      orderCode: 123,
      userId: 'u-1',
      planId: 'pro',
      amount: 100,
      originalAmount: 120,
      discountAmount: 20,
      couponCode: 'SAVE20',
      userCouponId: 'uc-1',
    }

    await PaymentRepository.createPendingOrder(data)

    expect(prisma.order.create).toHaveBeenCalledWith({ data })
  })

  it('markOrderCreatedWithEvent should wrap order update and event in transaction', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.update).mockResolvedValue({ id: 'o-1' } as never)
    vi.mocked(prisma.paymentEvent.create).mockResolvedValue({ id: 'e-1' } as never)
    vi.mocked(prisma.$transaction).mockResolvedValue([{ id: 'o-1' }, { id: 'e-1' }] as never)

    await PaymentRepository.markOrderCreatedWithEvent({
      orderId: 'o-1',
      payosReference: 'ref-1',
      requestPayload: { a: 1 },
      responsePayload: { b: 2 },
    })

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'o-1' },
      data: { payosReference: 'ref-1', verifiedAt: expect.any(Date) },
    })
    expect(prisma.paymentEvent.create).toHaveBeenCalledWith({
      data: {
        orderId: 'o-1',
        eventType: 'ORDER_CREATED',
        payosStatus: 'PENDING',
        source: 'CREATE_LINK',
        payload: { request: { a: 1 }, response: { b: 2 } },
      },
    })
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
  })

  it('findOrderForVerify should query selected order fields', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.findFirst).mockResolvedValue({ id: 'o-1' } as never)

    await PaymentRepository.findOrderForVerify(1001, 'u-1')

    expect(prisma.order.findFirst).toHaveBeenCalledWith({
      where: { orderCode: 1001, userId: 'u-1' },
      select: {
        id: true,
        userId: true,
        planId: true,
        userCouponId: true,
        status: true,
        paidAt: true,
        cancelledAt: true,
        expiredAt: true,
      },
    })
  })

  it('touchOrderVerifiedAt should update verifiedAt', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.update).mockResolvedValue({ id: 'o-1' } as never)
    const at = new Date('2026-01-01T00:00:00.000Z')

    await PaymentRepository.touchOrderVerifiedAt('o-1', at)

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'o-1' },
      data: { verifiedAt: at },
    })
  })

  it('markVerifyPaid should include coupon update when userCouponId exists', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.update).mockResolvedValue({ id: 'o-1' } as never)
    vi.mocked(prisma.user.update).mockResolvedValue({ id: 'u-1' } as never)
    vi.mocked(prisma.paymentEvent.create).mockResolvedValue({ id: 'e-1' } as never)
    vi.mocked(prisma.userCoupon.update).mockResolvedValue({ id: 'uc-1' } as never)
    vi.mocked(prisma.$transaction).mockResolvedValue([] as never)
    const now = new Date('2026-01-01T10:00:00.000Z')

    await PaymentRepository.markVerifyPaid({
      orderId: 'o-1',
      orderUserId: 'u-1',
      planId: 'pro',
      paidAt: null,
      userCouponId: 'uc-1',
      now,
      proEndDate: new Date('2026-02-01T00:00:00.000Z'),
      payosTransactionId: 'tx-1',
      payosReference: 'ref-1',
      payosRaw: { ok: true },
    })

    expect(prisma.userCoupon.update).toHaveBeenCalledWith({
      where: { id: 'uc-1' },
      data: {
        status: 'USED',
        usedAt: now,
        usedOrderId: 'o-1',
        coupon: { update: { usedCount: { increment: 1 } } },
      },
    })
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
  })

  it('markVerifyPaid should skip coupon update when userCouponId is null', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.update).mockResolvedValue({ id: 'o-1' } as never)
    vi.mocked(prisma.user.update).mockResolvedValue({ id: 'u-1' } as never)
    vi.mocked(prisma.paymentEvent.create).mockResolvedValue({ id: 'e-1' } as never)
    vi.mocked(prisma.$transaction).mockResolvedValue([] as never)
    const paidAt = new Date('2026-01-02T00:00:00.000Z')
    const now = new Date('2026-01-03T00:00:00.000Z')

    await PaymentRepository.markVerifyPaid({
      orderId: 'o-1',
      orderUserId: 'u-1',
      planId: 'pro',
      paidAt,
      userCouponId: null,
      now,
      proEndDate: new Date('2026-02-03T00:00:00.000Z'),
      payosTransactionId: 'tx-2',
      payosReference: null,
      payosRaw: { ok: true },
    })

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'o-1' },
      data: {
        status: 'SUCCESS',
        paidAt,
        verifiedAt: now,
        payosTransactionId: 'tx-2',
        payosReference: null,
      },
    })
    expect(prisma.userCoupon.update).not.toHaveBeenCalled()
  })

  it('markVerifyNonPaid should mark cancelled flow', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.update).mockResolvedValue({ id: 'o-1' } as never)
    vi.mocked(prisma.paymentEvent.create).mockResolvedValue({ id: 'e-1' } as never)
    vi.mocked(prisma.$transaction).mockResolvedValue([] as never)
    const now = new Date('2026-01-01T00:00:00.000Z')

    await PaymentRepository.markVerifyNonPaid({
      orderId: 'o-1',
      paymentStatus: 'CANCELLED',
      cancelledAt: null,
      expiredAt: null,
      now,
      payosRaw: { code: 1 },
    })

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'o-1' },
      data: {
        status: 'CANCELLED',
        cancelledAt: now,
        expiredAt: null,
        verifiedAt: now,
      },
    })
    expect(prisma.paymentEvent.create).toHaveBeenCalledWith({
      data: {
        orderId: 'o-1',
        eventType: 'VERIFY_CANCELLED',
        payosStatus: 'CANCELLED',
        source: 'VERIFY_SESSION',
        payload: { code: 1 },
      },
    })
  })

  it('markVerifyNonPaid should mark expired flow', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.update).mockResolvedValue({ id: 'o-1' } as never)
    vi.mocked(prisma.paymentEvent.create).mockResolvedValue({ id: 'e-1' } as never)
    vi.mocked(prisma.$transaction).mockResolvedValue([] as never)
    const now = new Date('2026-01-01T00:00:00.000Z')

    await PaymentRepository.markVerifyNonPaid({
      orderId: 'o-1',
      paymentStatus: 'EXPIRED',
      cancelledAt: null,
      expiredAt: null,
      now,
      payosRaw: { code: 2 },
    })

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'o-1' },
      data: {
        status: 'CANCELLED',
        cancelledAt: null,
        expiredAt: now,
        verifiedAt: now,
      },
    })
    expect(prisma.paymentEvent.create).toHaveBeenCalledWith({
      data: {
        orderId: 'o-1',
        eventType: 'VERIFY_EXPIRED',
        payosStatus: 'EXPIRED',
        source: 'VERIFY_SESSION',
        payload: { code: 2 },
      },
    })
  })

  it('findOrderByCode should call findUnique with select shape', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.findUnique).mockResolvedValue({ id: 'o-1' } as never)

    await PaymentRepository.findOrderByCode(2002)

    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { orderCode: 2002 },
      select: {
        id: true,
        orderCode: true,
        userId: true,
        planId: true,
        amount: true,
        originalAmount: true,
        discountAmount: true,
        couponCode: true,
        status: true,
        createdAt: true,
        paidAt: true,
        cancelledAt: true,
      },
    })
  })

  it('findOwnedOrder should query order by code and user', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.findFirst).mockResolvedValue({ id: 'o-1' } as never)

    await PaymentRepository.findOwnedOrder(1, 'u-1')

    expect(prisma.order.findFirst).toHaveBeenCalledWith({
      where: { orderCode: 1, userId: 'u-1' },
      select: { id: true },
    })
  })

  it('findOrderForCancel should query status fields', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.findFirst).mockResolvedValue({ id: 'o-1' } as never)

    await PaymentRepository.findOrderForCancel(2, 'u-2')

    expect(prisma.order.findFirst).toHaveBeenCalledWith({
      where: { orderCode: 2, userId: 'u-2' },
      select: { id: true, status: true, cancelledAt: true },
    })
  })

  it('markUserCancelled should create cancellation event in transaction', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.update).mockResolvedValue({ id: 'o-1' } as never)
    vi.mocked(prisma.paymentEvent.create).mockResolvedValue({ id: 'e-1' } as never)
    vi.mocked(prisma.$transaction).mockResolvedValue([] as never)

    await PaymentRepository.markUserCancelled({
      orderId: 'o-1',
      cancelledAt: null,
      payosStatus: 'CANCELLED',
      payload: { reason: 'user_cancelled' },
    })

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'o-1' },
      data: {
        status: 'CANCELLED',
        cancelledAt: expect.any(Date),
        verifiedAt: expect.any(Date),
      },
    })
    expect(prisma.paymentEvent.create).toHaveBeenCalledWith({
      data: {
        orderId: 'o-1',
        eventType: 'USER_CANCELLED',
        payosStatus: 'CANCELLED',
        source: 'CANCEL_API',
        payload: { reason: 'user_cancelled' },
      },
    })
  })

  it('findOrderForRefund should query refund-ready fields', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.findUnique).mockResolvedValue({ id: 'o-1' } as never)

    await PaymentRepository.findOrderForRefund('o-1')

    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { id: 'o-1' },
      select: { id: true, userId: true, status: true, createdAt: true },
    })
  })

  it('findPendingRefundByOrderId should find pending refund request', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.refundRequest.findFirst).mockResolvedValue({ id: 'r-1' } as never)

    await PaymentRepository.findPendingRefundByOrderId('o-1')

    expect(prisma.refundRequest.findFirst).toHaveBeenCalledWith({
      where: { orderId: 'o-1', status: 'PENDING' },
      select: { id: true },
    })
  })

  it('createRefundRequestFlow should execute refund flow transaction', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.refundRequest.create).mockResolvedValue({ id: 'r-1' } as never)
    vi.mocked(prisma.order.update).mockResolvedValue({ id: 'o-1' } as never)
    vi.mocked(prisma.paymentEvent.create).mockResolvedValue({ id: 'e-1' } as never)
    vi.mocked(prisma.$transaction).mockResolvedValue([] as never)

    await PaymentRepository.createRefundRequestFlow({
      orderId: 'o-1',
      userId: 'u-1',
      reason: 'Not needed',
      bankName: 'VCB',
      accountNumber: '123',
      accountName: 'Test User',
    })

    expect(prisma.refundRequest.create).toHaveBeenCalledWith({
      data: {
        orderId: 'o-1',
        userId: 'u-1',
        status: 'PENDING',
        reason: 'Not needed',
        bankName: 'VCB',
        accountNumber: '123',
        accountName: 'Test User',
      },
    })
    expect(prisma.paymentEvent.create).toHaveBeenCalledWith({
      data: {
        orderId: 'o-1',
        eventType: 'REFUND_REQUESTED',
        payosStatus: 'SUCCESS',
        source: 'REFUND_API',
        payload: {
          reason: 'Not needed',
          bankName: 'VCB',
          accountNumber: '123',
          accountName: 'Test User',
        },
      },
    })
  })

  it('createWebhookDuplicatedEvent should create duplicated webhook event', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.paymentEvent.create).mockResolvedValue({ id: 'e-1' } as never)

    await PaymentRepository.createWebhookDuplicatedEvent({
      orderId: 'o-1',
      payosStatus: 'PAID',
      payload: { duplicated: true },
    })

    expect(prisma.paymentEvent.create).toHaveBeenCalledWith({
      data: {
        orderId: 'o-1',
        eventType: 'WEBHOOK_DUPLICATED',
        payosStatus: 'PAID',
        source: 'WEBHOOK',
        payload: { duplicated: true },
      },
    })
  })

  it('markWebhookPaid should update order, user and event in transaction', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.update).mockResolvedValue({ id: 'o-1' } as never)
    vi.mocked(prisma.user.update).mockResolvedValue({ id: 'u-1' } as never)
    vi.mocked(prisma.paymentEvent.create).mockResolvedValue({ id: 'e-1' } as never)
    vi.mocked(prisma.$transaction).mockResolvedValue([] as never)
    const now = new Date('2026-02-01T00:00:00.000Z')

    await PaymentRepository.markWebhookPaid({
      orderId: 'o-1',
      orderUserId: 'u-1',
      planId: 'pro',
      paidAt: null,
      now,
      proEndDate: new Date('2026-03-01T00:00:00.000Z'),
      payosTransactionId: 'tx-99',
      payosReference: 'ref-99',
      payosStatus: 'PAID',
      payload: { source: 'webhook' },
    })

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'o-1' },
      data: {
        status: 'SUCCESS',
        paidAt: now,
        verifiedAt: now,
        payosTransactionId: 'tx-99',
        payosReference: 'ref-99',
      },
    })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u-1' },
      data: {
        isPro: true,
        proType: 'pro',
        proStartDate: now,
        proEndDate: new Date('2026-03-01T00:00:00.000Z'),
      },
    })
    expect(prisma.paymentEvent.create).toHaveBeenCalledWith({
      data: {
        orderId: 'o-1',
        eventType: 'WEBHOOK_PAID',
        payosStatus: 'PAID',
        source: 'WEBHOOK',
        payload: { source: 'webhook' },
      },
    })
  })

  it('findAvailableCouponsByUserId should query active non-expired coupons', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.userCoupon.findMany).mockResolvedValue([] as never)
    const now = new Date('2026-04-01T00:00:00.000Z')

    await PaymentRepository.findAvailableCouponsByUserId('u-1', now)

    expect(prisma.userCoupon.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'u-1',
        status: 'AVAILABLE',
        coupon: {
          isActive: true,
          expiresAt: { gt: now },
        },
      },
      orderBy: { assignedAt: 'desc' },
      select: {
        id: true,
        assignedAt: true,
        coupon: {
          select: {
            code: true,
            discountPercent: true,
            expiresAt: true,
            usedCount: true,
            usageLimit: true,
          },
        },
      },
    })
  })
})
