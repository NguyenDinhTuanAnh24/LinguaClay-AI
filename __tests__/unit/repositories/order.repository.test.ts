import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OrderRepository } from '@/repositories/order.repository'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
  },
}))

describe('OrderRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('findManyByUserId should query with default ordering and select', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.findMany).mockResolvedValue([] as never)

    await OrderRepository.findManyByUserId('u-1')

    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: { userId: 'u-1' },
      orderBy: { createdAt: 'desc' },
      take: undefined,
      skip: undefined,
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
  })

  it('findManyByUserId should pass pagination options', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.findMany).mockResolvedValue([] as never)

    await OrderRepository.findManyByUserId('u-1', { take: 20, skip: 40 })

    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: { userId: 'u-1' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: 40,
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
  })

  it('countByUserId should count orders by user id', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.count).mockResolvedValue(9)

    const result = await OrderRepository.countByUserId('u-1')

    expect(result).toBe(9)
    expect(prisma.order.count).toHaveBeenCalledWith({ where: { userId: 'u-1' } })
  })

  it('findForAdminUserHistory should return modern shape when query succeeds', async () => {
    const { prisma } = await import('@/lib/prisma')
    const rows = [
      {
        id: 'o-1',
        orderCode: 1,
        planId: 'pro',
        amount: 100,
        status: 'SUCCESS',
        createdAt: new Date(),
        paidAt: new Date(),
        cancelledAt: null,
      },
    ]
    vi.mocked(prisma.order.findMany).mockResolvedValue(rows as never)

    const result = await OrderRepository.findForAdminUserHistory('u-1', 10)

    expect(result).toEqual(rows)
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: { userId: 'u-1' },
      orderBy: { createdAt: 'desc' },
      take: 10,
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
  })

  it('findForAdminUserHistory should fallback to legacy query when first query fails', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.findMany)
      .mockRejectedValueOnce(new Error('paidAt column missing') as never)
      .mockResolvedValueOnce([
        {
          id: 'o-legacy',
          orderCode: 2,
          planId: 'basic',
          amount: 50,
          status: 'PENDING',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ] as never)

    const result = await OrderRepository.findForAdminUserHistory('u-2')

    expect(result).toEqual([
      {
        id: 'o-legacy',
        orderCode: 2,
        planId: 'basic',
        amount: 50,
        status: 'PENDING',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        paidAt: null,
        cancelledAt: null,
      },
    ])
    expect(prisma.order.findMany).toHaveBeenCalledTimes(2)
  })

  it('findLatestSuccessByUserId should query latest successful order', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.order.findFirst).mockResolvedValue({ id: 'o-1' } as never)

    await OrderRepository.findLatestSuccessByUserId('u-1')

    expect(prisma.order.findFirst).toHaveBeenCalledWith({
      where: { userId: 'u-1', status: 'SUCCESS' },
      select: { id: true, orderCode: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
  })
})
