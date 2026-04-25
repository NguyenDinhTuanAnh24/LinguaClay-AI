import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { ensureAdminActor } from '@/lib/admin-auth'
import { CouponRepository } from '@/repositories/coupon.repository'
import { z } from 'zod'

const CouponPayloadSchema = z
  .object({
    code: z.string().trim().min(3).max(32),
    discountPercent: z.number().int().min(1).max(100),
    usageLimit: z.number().int().min(1),
    expiresAt: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .strict()

export async function POST(req: Request) {
  try {
    const adminUser = await ensureAdminActor()
    if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    let bodyRaw: unknown
    try {
      bodyRaw = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    const parseResult = CouponPayloadSchema.safeParse(bodyRaw)
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parseResult.error.flatten() }, { status: 400 })
    }

    const code = parseResult.data.code.toUpperCase()
    const discountPercent = parseResult.data.discountPercent
    const usageLimit = parseResult.data.usageLimit
    const expiresAt = new Date(`${parseResult.data.expiresAt}T23:59:59.999+07:00`)

    if (Number.isNaN(expiresAt.getTime())) {
      return NextResponse.json({ error: 'Ngày hết hạn không hợp lệ' }, { status: 400 })
    }

    const created = await CouponRepository.createCoupon({
      code,
      discountPercent,
      usageLimit,
      expiresAt,
    })

    return NextResponse.json({ ok: true, coupon: created })
  } catch (error) {
    logger.error('Create coupon error:', error)
    return NextResponse.json({ error: 'Không thể tạo mã khuyến mãi' }, { status: 500 })
  }
}

