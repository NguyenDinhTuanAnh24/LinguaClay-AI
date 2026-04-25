import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureAdminActor } from '@/lib/admin-auth'

type CouponPayload = {
  code?: string
  discountPercent?: number
  usageLimit?: number
  expiresAt?: string
}

export async function POST(req: Request) {
  try {
    const adminUser = await ensureAdminActor()
    if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = (await req.json()) as CouponPayload
    const code = (body.code || '').trim().toUpperCase()
    const discountPercent = Number(body.discountPercent)
    const usageLimit = Number(body.usageLimit)
    const expiresAt = body.expiresAt ? new Date(`${body.expiresAt}T23:59:59.999+07:00`) : null

    if (!code || code.length < 3 || code.length > 32) {
      return NextResponse.json({ error: 'Mã khuyến mãi không hợp lệ' }, { status: 400 })
    }
    if (!Number.isFinite(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      return NextResponse.json({ error: 'Phần trăm giảm phải từ 1 đến 100' }, { status: 400 })
    }
    if (!Number.isFinite(usageLimit) || usageLimit < 1) {
      return NextResponse.json({ error: 'Giới hạn sử dụng phải lớn hơn 0' }, { status: 400 })
    }
    if (!expiresAt || Number.isNaN(expiresAt.getTime())) {
      return NextResponse.json({ error: 'Ngày hết hạn không hợp lệ' }, { status: 400 })
    }

    const created = await prisma.coupon.create({
      data: {
        code,
        discountPercent,
        usageLimit,
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

    return NextResponse.json({ ok: true, coupon: created })
  } catch (error) {
    logger.error('Create coupon error:', error)
    return NextResponse.json({ error: 'Không thể tạo mã khuyến mãi' }, { status: 500 })
  }
}
