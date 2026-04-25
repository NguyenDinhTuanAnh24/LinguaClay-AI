import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const rows = await prisma.userCoupon.findMany({
      where: {
        userId: user.id,
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

    return NextResponse.json({
      coupons: rows
        .filter((row) => row.coupon.usedCount < row.coupon.usageLimit)
        .map((row) => ({
          userCouponId: row.id,
          code: row.coupon.code,
          discountPercent: row.coupon.discountPercent,
          expiresAt: row.coupon.expiresAt,
          assignedAt: row.assignedAt,
        })),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    logger.error('My coupons error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
