import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

function parsePositiveInt(value: string | null, fallback: number) {
  const num = Number.parseInt(value || '', 10)
  if (!Number.isFinite(num) || num <= 0) return fallback
  return num
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parsePositiveInt(searchParams.get('page'), 1)
    const pageSize = Math.min(20, parsePositiveInt(searchParams.get('pageSize'), 10))
    const skip = (page - 1) * pageSize

    const [total, orders] = await Promise.all([
      prisma.order.count({
        where: { userId: user.id },
      }),
      prisma.order.findMany({
        where: { userId: user.id },
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ])

    return NextResponse.json({
      ok: true,
      orders,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    console.error('Payment History Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
