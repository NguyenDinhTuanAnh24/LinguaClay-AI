import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CouponRepository } from '@/repositories/coupon.repository'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    coupon: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    userCoupon: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('CouponRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createCoupon should create active coupon and return selected fields', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.coupon.create).mockResolvedValue({ id: 'c-1' } as never)
    const expiresAt = new Date('2026-12-31T00:00:00.000Z')

    await CouponRepository.createCoupon({
      code: 'SAVE30',
      discountPercent: 30,
      usageLimit: 100,
      expiresAt,
    })

    expect(prisma.coupon.create).toHaveBeenCalledWith({
      data: {
        code: 'SAVE30',
        discountPercent: 30,
        usageLimit: 100,
        expiresAt,
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
  })

  it('findCouponByIdOrCode should prefer couponId when provided', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.coupon.findFirst).mockResolvedValue({ id: 'c-1' } as never)

    await CouponRepository.findCouponByIdOrCode({ couponId: 'c-1', couponCode: 'SAVE10' })

    expect(prisma.coupon.findFirst).toHaveBeenCalledWith({
      where: { id: 'c-1' },
      select: {
        id: true,
        code: true,
        isActive: true,
        expiresAt: true,
      },
    })
  })

  it('findCouponByIdOrCode should query by code when id is missing', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.coupon.findFirst).mockResolvedValue({ id: 'c-2' } as never)

    await CouponRepository.findCouponByIdOrCode({ couponCode: 'SAVE10' })

    expect(prisma.coupon.findFirst).toHaveBeenCalledWith({
      where: { code: 'SAVE10' },
      select: {
        id: true,
        code: true,
        isActive: true,
        expiresAt: true,
      },
    })
  })

  it('findAvailableAssignment should query user available coupon assignment', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.userCoupon.findFirst).mockResolvedValue({ id: 'uc-1' } as never)

    await CouponRepository.findAvailableAssignment('u-1', 'c-1')

    expect(prisma.userCoupon.findFirst).toHaveBeenCalledWith({
      where: {
        userId: 'u-1',
        couponId: 'c-1',
        status: 'AVAILABLE',
      },
      select: { id: true },
    })
  })

  it('createAssignment should create AVAILABLE assignment', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.userCoupon.create).mockResolvedValue({ id: 'uc-1' } as never)

    await CouponRepository.createAssignment('u-1', 'c-1')

    expect(prisma.userCoupon.create).toHaveBeenCalledWith({
      data: {
        userId: 'u-1',
        couponId: 'c-1',
        status: 'AVAILABLE',
      },
      select: {
        id: true,
        status: true,
        assignedAt: true,
      },
    })
  })
})
