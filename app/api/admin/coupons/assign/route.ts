import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { isAdminEmail, isAdminUser } from '@/lib/admin'
import { createUserNotification } from '@/lib/user-notifications'

type AssignPayload = {
  userId?: string
  couponId?: string
  couponCode?: string
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = (await req.json()) as AssignPayload
    const userId = (body.userId || '').trim()
    const couponId = (body.couponId || '').trim()
    const couponCode = (body.couponCode || '').trim().toUpperCase()

    if (!userId || (!couponId && !couponCode)) {
      return NextResponse.json({ error: 'Thiếu userId hoặc mã khuyến mãi' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    })
    if (!targetUser) {
      return NextResponse.json({ error: 'User không tồn tại' }, { status: 404 })
    }
    if (isAdminEmail(targetUser.email)) {
      return NextResponse.json({ error: 'Không thể cấp mã cho tài khoản admin' }, { status: 400 })
    }

    const coupon = await prisma.coupon.findFirst({
      where: couponId ? { id: couponId } : { code: couponCode },
      select: {
        id: true,
        code: true,
        isActive: true,
        expiresAt: true,
      },
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Khuyến mãi không tồn tại' }, { status: 404 })
    }
    if (!coupon.isActive || coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Khuyến mãi đã hết hiệu lực' }, { status: 400 })
    }

    const existing = await prisma.userCoupon.findFirst({
      where: {
        userId: targetUser.id,
        couponId: coupon.id,
        status: 'AVAILABLE',
      },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json({ error: 'User đã có khuyến mãi này' }, { status: 409 })
    }

    const assigned = await prisma.userCoupon.create({
      data: {
        userId: targetUser.id,
        couponId: coupon.id,
        status: 'AVAILABLE',
      },
      select: {
        id: true,
        status: true,
        assignedAt: true,
      },
    })

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
      console.error('Create voucher notification error:', error)
    })

    return NextResponse.json({
      ok: true,
      assignment: assigned,
      coupon: { id: coupon.id, code: coupon.code },
      user: { id: targetUser.id, email: targetUser.email },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    console.error('Assign coupon error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
