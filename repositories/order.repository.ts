import { prisma } from '@/lib/prisma'

export type UserHistoryOrderRow = {
  id: string
  orderCode: number
  planId: string
  amount: number
  status: string
  createdAt: Date
  paidAt: Date | null
  cancelledAt: Date | null
}

export class OrderRepository {
  static async findManyByUserId(userId: string, options?: { take?: number; skip?: number }) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: options?.take,
      skip: options?.skip,
      select: {
        id: true,
        orderCode: true,
        planId: true,
        amount: true,
        status: true,
        createdAt: true,
        paidAt: true,
        updatedAt: true,
      },
    })
  }

  static async countByUserId(userId: string) {
    return prisma.order.count({ where: { userId } })
  }

  static async findForAdminUserHistory(userId: string, take = 100): Promise<UserHistoryOrderRow[]> {
    try {
      return await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take,
        select: {
          id: true,
          orderCode: true,
          planId: true,
          amount: true,
          status: true,
          createdAt: true,
          paidAt: true,
          cancelledAt: true,
        },
      })
    } catch {
      const legacyOrders = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take,
        select: {
          id: true,
          orderCode: true,
          planId: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      })

      return legacyOrders.map((o) => ({
        ...o,
        paidAt: null,
        cancelledAt: null,
      }))
    }
  }

  static async findLatestSuccessByUserId(userId: string) {
    return prisma.order.findFirst({
      where: { userId, status: 'SUCCESS' },
      select: {
        id: true,
        orderCode: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
