import { prisma } from '@/lib/prisma'

export class CouponRepository {
  static async createCoupon(input: {
    code: string
    discountPercent: number
    usageLimit: number
    expiresAt: Date
  }) {
    return prisma.coupon.create({
      data: {
        code: input.code,
        discountPercent: input.discountPercent,
        usageLimit: input.usageLimit,
        expiresAt: input.expiresAt,
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        discountPercent: true,
        usageLimit: true,
        usedCount: true,
        expiresAt: true,
      },
    })
  }

  static async findCouponByIdOrCode(input: { couponId?: string; couponCode?: string }) {
    return prisma.coupon.findFirst({
      where: input.couponId ? { id: input.couponId } : { code: input.couponCode },
      select: {
        id: true,
        code: true,
        isActive: true,
        expiresAt: true,
      },
    })
  }

  static async findAvailableAssignment(userId: string, couponId: string) {
    return prisma.userCoupon.findFirst({
      where: {
        userId,
        couponId,
        status: 'AVAILABLE',
      },
      select: { id: true },
    })
  }

  static async createAssignment(userId: string, couponId: string) {
    return prisma.userCoupon.create({
      data: {
        userId,
        couponId,
        status: 'AVAILABLE',
      },
      select: {
        id: true,
        status: true,
        assignedAt: true,
      },
    })
  }
}

