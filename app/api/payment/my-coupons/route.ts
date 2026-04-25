import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { PaymentRepository } from '@/repositories/payment.repository'

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
    const rows = await PaymentRepository.findAvailableCouponsByUserId(user.id, now)

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
