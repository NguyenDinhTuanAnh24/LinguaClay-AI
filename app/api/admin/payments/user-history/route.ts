import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureAdminActor } from '@/lib/admin-auth'

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function normalizePlanLabel(planId: string): string {
  const key = (planId || '').toUpperCase()
  if (key.includes('3_MONTHS')) return 'Bản tiêu chuẩn (3 tháng)'
  if (key.includes('6_MONTHS')) return 'Bản chuyên sâu (6 tháng)'
  if (key.includes('1_YEAR') || key.includes('12') || key.includes('YEAR')) return 'Bản toàn diện (1 năm)'
  const adminMatch = key.match(/ADMIN_GRANTED_(\d+)M/)
  if (adminMatch) return `Gói ADMIN cấp (${adminMatch[1]} tháng)`
  return planId || 'Khác'
}

export async function GET(req: Request) {
  try {
    const admin = await ensureAdminActor()

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(req.url)
    const userId = (url.searchParams.get('userId') || '').trim()
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let orders: Array<{
      id: string
      orderCode: number
      planId: string
      amount: number
      status: string
      createdAt: Date
      paidAt: Date | null
      cancelledAt: Date | null
    }> = []

    try {
      orders = await prisma.order.findMany({
        where: { userId: targetUser.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
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
        where: { userId: targetUser.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          orderCode: true,
          planId: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      })

      orders = legacyOrders.map((o) => ({
        ...o,
        paidAt: null,
        cancelledAt: null,
      }))
    }

    const totalPaid = orders
      .filter((o) => o.status === 'SUCCESS')
      .reduce((sum, o) => sum + o.amount, 0)

    return NextResponse.json({
      ok: true,
      user: {
        id: targetUser.id,
        name: targetUser.name || 'Chưa cập nhật',
        email: targetUser.email,
      },
      summary: {
        totalOrders: orders.length,
        successOrders: orders.filter((o) => o.status === 'SUCCESS').length,
        pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
        cancelledOrders: orders.filter((o) => o.status === 'CANCELLED').length,
        totalPaid,
      },
      orders: orders.map((o) => ({
        id: o.id,
        orderCode: `OD-${o.orderCode}`,
        planId: normalizePlanLabel(o.planId),
        amount: o.amount,
        status: o.status || 'PENDING',
        createdAt: formatDateTime(o.createdAt),
        paidAt: o.paidAt ? formatDateTime(o.paidAt) : null,
        cancelledAt: o.cancelledAt ? formatDateTime(o.cancelledAt) : null,
      })),
    })
  } catch (error) {
    logger.error('Fetch user payment history error:', error)
    return NextResponse.json({ error: 'Không thể tải lịch sử thanh toán' }, { status: 500 })
  }
}
