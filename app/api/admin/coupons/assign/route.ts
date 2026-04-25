import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { isAdminEmail, isAdminUser } from '@/lib/admin'
import { createUserNotification } from '@/lib/user-notifications'
import { CouponRepository } from '@/repositories/coupon.repository'
import { UserRepository } from '@/repositories/user.repository'
import { z } from 'zod'

const AssignPayloadSchema = z
  .object({
    userId: z.string().trim().min(1),
    couponId: z.string().trim().optional(),
    couponCode: z.string().trim().optional(),
  })
  .strict()
  .refine((value) => Boolean(value.couponId || value.couponCode), {
    message: 'Thiếu userId hoặc mã khuyến mãi',
    path: ['couponId'],
  })

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let bodyRaw: unknown
    try {
      bodyRaw = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    const parseResult = AssignPayloadSchema.safeParse(bodyRaw)
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parseResult.error.flatten() }, { status: 400 })
    }

    const userId = parseResult.data.userId.trim()
    const couponId = (parseResult.data.couponId || '').trim()
    const couponCode = (parseResult.data.couponCode || '').trim().toUpperCase()

    const targetUser = await UserRepository.findBasicIdentityById(userId)
    if (!targetUser) {
      return NextResponse.json({ error: 'User không tồn tại' }, { status: 404 })
    }
    if (isAdminEmail(targetUser.email)) {
      return NextResponse.json({ error: 'Không thể cấp mã cho tài khoản admin' }, { status: 400 })
    }

    const coupon = await CouponRepository.findCouponByIdOrCode({ couponId, couponCode })

    if (!coupon) {
      return NextResponse.json({ error: 'Khuyến mãi không tồn tại' }, { status: 404 })
    }
    if (!coupon.isActive || coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Khuyến mãi đã hết hiệu lực' }, { status: 400 })
    }

    const existing = await CouponRepository.findAvailableAssignment(targetUser.id, coupon.id)
    if (existing) {
      return NextResponse.json({ error: 'User đã có khuyến mãi này' }, { status: 409 })
    }

    const assigned = await CouponRepository.createAssignment(targetUser.id, coupon.id)

    await createUserNotification({
      userId: targetUser.id,
      type: 'VOUCHER_ASSIGNED',
      title: 'Bạn nhận được voucher mới',
      message: `Admin vừa gửi voucher ${coupon.code} cho bạn.`,
      dedupeKey: `voucher_assigned:${assigned.id}`,
      createdAt: assigned.assignedAt,
      metadata: {
        couponCode: coupon.code,
        assignmentId: assigned.id,
      },
    }).catch((error) => {
      logger.error('Create voucher notification error:', error)
    })

    return NextResponse.json({
      ok: true,
      assignment: assigned,
      coupon: { id: coupon.id, code: coupon.code },
      user: { id: targetUser.id, email: targetUser.email },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    logger.error('Assign coupon error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

