import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class PaymentRepository {
  static async findAvailableUserCouponAssignment(input: { userCouponId: string; userId: string }) {
    return prisma.userCoupon.findFirst({
      where: {
        id: input.userCouponId,
        userId: input.userId,
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
  }

  static async createPendingOrder(data: {
    orderCode: number
    userId: string
    planId: string
    amount: number
    originalAmount: number
    discountAmount: number
    couponCode: string | null
    userCouponId: string | null
  }) {
    return prisma.order.create({ data })
  }

  static async markOrderCreatedWithEvent(input: {
    orderId: string
    payosReference: string | null
    requestPayload: Prisma.InputJsonValue
    responsePayload: Prisma.InputJsonValue
  }) {
    return prisma.$transaction([
      prisma.order.update({
        where: { id: input.orderId },
        data: {
          payosReference: input.payosReference,
          verifiedAt: new Date(),
        },
      }),
      prisma.paymentEvent.create({
        data: {
          orderId: input.orderId,
          eventType: 'ORDER_CREATED',
          payosStatus: 'PENDING',
          source: 'CREATE_LINK',
          payload: {
            request: input.requestPayload,
            response: input.responsePayload,
          } as Prisma.InputJsonValue,
        },
      }),
    ])
  }

  static async findOrderForVerify(orderCode: number, userId: string) {
    return prisma.order.findFirst({
      where: { orderCode, userId },
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
  }

  static async touchOrderVerifiedAt(orderId: string, at: Date) {
    return prisma.order.update({
      where: { id: orderId },
      data: { verifiedAt: at },
    })
  }

  static async markVerifyPaid(input: {
    orderId: string
    orderUserId: string
    planId: string
    paidAt: Date | null
    userCouponId: string | null
    now: Date
    proEndDate: Date
    payosTransactionId: string
    payosReference: string | null
    payosRaw: Prisma.InputJsonValue
  }) {
    const txItems: Prisma.PrismaPromise<unknown>[] = [
      prisma.order.update({
        where: { id: input.orderId },
        data: {
          status: 'SUCCESS',
          paidAt: input.paidAt ?? input.now,
          verifiedAt: input.now,
          payosTransactionId: input.payosTransactionId,
          payosReference: input.payosReference,
        },
      }),
      prisma.user.update({
        where: { id: input.orderUserId },
        data: {
          isPro: true,
          proType: input.planId,
          proStartDate: new Date(),
          proEndDate: input.proEndDate,
        },
      }),
      prisma.paymentEvent.create({
        data: {
          orderId: input.orderId,
          eventType: 'VERIFY_PAID',
          payosStatus: 'PAID',
          source: 'VERIFY_SESSION',
          payload: input.payosRaw,
        },
      }),
    ]

    if (input.userCouponId) {
      txItems.push(
        prisma.userCoupon.update({
          where: { id: input.userCouponId },
          data: {
            status: 'USED',
            usedAt: input.now,
            usedOrderId: input.orderId,
            coupon: {
              update: {
                usedCount: { increment: 1 },
              },
            },
          },
        })
      )
    }

    return prisma.$transaction(txItems)
  }

  static async markVerifyNonPaid(input: {
    orderId: string
    paymentStatus: string
    cancelledAt: Date | null
    expiredAt: Date | null
    now: Date
    payosRaw: Prisma.InputJsonValue
  }) {
    return prisma.$transaction([
      prisma.order.update({
        where: { id: input.orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: input.paymentStatus === 'CANCELLED' ? input.cancelledAt ?? input.now : input.cancelledAt,
          expiredAt: input.paymentStatus === 'EXPIRED' ? input.expiredAt ?? input.now : input.expiredAt,
          verifiedAt: input.now,
        },
      }),
      prisma.paymentEvent.create({
        data: {
          orderId: input.orderId,
          eventType: input.paymentStatus === 'EXPIRED' ? 'VERIFY_EXPIRED' : 'VERIFY_CANCELLED',
          payosStatus: input.paymentStatus,
          source: 'VERIFY_SESSION',
          payload: input.payosRaw,
        },
      }),
    ])
  }

  static async findOrderByCode(orderCode: number) {
    return prisma.order.findUnique({
      where: { orderCode },
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
  }

  static async findOwnedOrder(orderCode: number, userId: string) {
    return prisma.order.findFirst({
      where: { orderCode, userId },
      select: { id: true },
    })
  }

  static async findOrderForCancel(orderCode: number, userId: string) {
    return prisma.order.findFirst({
      where: { orderCode, userId },
      select: { id: true, status: true, cancelledAt: true },
    })
  }

  static async markUserCancelled(input: {
    orderId: string
    cancelledAt: Date | null
    payosStatus: string
    payload: Prisma.InputJsonValue
  }) {
    return prisma.$transaction([
      prisma.order.update({
        where: { id: input.orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: input.cancelledAt ?? new Date(),
          verifiedAt: new Date(),
        },
      }),
      prisma.paymentEvent.create({
        data: {
          orderId: input.orderId,
          eventType: 'USER_CANCELLED',
          payosStatus: input.payosStatus,
          source: 'CANCEL_API',
          payload: input.payload,
        },
      }),
    ])
  }

  static async findOrderForRefund(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        status: true,
        createdAt: true,
      },
    })
  }

  static async findPendingRefundByOrderId(orderId: string) {
    return prisma.refundRequest.findFirst({
      where: { orderId, status: 'PENDING' },
      select: { id: true },
    })
  }

  static async createRefundRequestFlow(input: {
    orderId: string
    userId: string
    reason: string
    bankName: string
    accountNumber: string
    accountName: string
  }) {
    return prisma.$transaction([
      prisma.refundRequest.create({
        data: {
          orderId: input.orderId,
          userId: input.userId,
          status: 'PENDING',
          reason: input.reason,
          bankName: input.bankName,
          accountNumber: input.accountNumber,
          accountName: input.accountName,
        },
      }),
      prisma.order.update({
        where: { id: input.orderId },
        data: {
          refundStatus: 'PENDING',
          refundReason: input.reason,
          refundBankName: input.bankName,
          refundAccountNumber: input.accountNumber,
          refundAccountName: input.accountName,
        },
      }),
      prisma.paymentEvent.create({
        data: {
          orderId: input.orderId,
          eventType: 'REFUND_REQUESTED',
          payosStatus: 'SUCCESS',
          source: 'REFUND_API',
          payload: {
            reason: input.reason,
            bankName: input.bankName,
            accountNumber: input.accountNumber,
            accountName: input.accountName,
          },
        },
      }),
    ])
  }

  static async createWebhookDuplicatedEvent(input: {
    orderId: string
    payosStatus: string
    payload: Prisma.InputJsonValue
  }) {
    return prisma.paymentEvent.create({
      data: {
        orderId: input.orderId,
        eventType: 'WEBHOOK_DUPLICATED',
        payosStatus: input.payosStatus,
        source: 'WEBHOOK',
        payload: input.payload,
      },
    })
  }

  static async markWebhookPaid(input: {
    orderId: string
    orderUserId: string
    planId: string
    paidAt: Date | null
    now: Date
    proEndDate: Date
    payosTransactionId: string
    payosReference: string | null
    payosStatus: string
    payload: Prisma.InputJsonValue
  }) {
    return prisma.$transaction([
      prisma.order.update({
        where: { id: input.orderId },
        data: {
          status: 'SUCCESS',
          paidAt: input.paidAt ?? input.now,
          verifiedAt: input.now,
          payosTransactionId: input.payosTransactionId,
          payosReference: input.payosReference,
        },
      }),
      prisma.user.update({
        where: { id: input.orderUserId },
        data: {
          isPro: true,
          proType: input.planId,
          proStartDate: input.now,
          proEndDate: input.proEndDate,
        },
      }),
      prisma.paymentEvent.create({
        data: {
          orderId: input.orderId,
          eventType: 'WEBHOOK_PAID',
          payosStatus: input.payosStatus,
          source: 'WEBHOOK',
          payload: input.payload,
        },
      }),
    ])
  }

  static async findAvailableCouponsByUserId(userId: string, now: Date) {
    return prisma.userCoupon.findMany({
      where: {
        userId,
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
  }
}
