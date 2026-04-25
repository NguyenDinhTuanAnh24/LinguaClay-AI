import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { ensureAdminActor } from '@/lib/admin-auth'
import { loadUserPaymentReport } from '@/services/reporting/user-payment-report.loader'

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

    const report = await loadUserPaymentReport(userId)
    if (!report) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { user, orders, summary } = report

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name || 'Chưa cập nhật',
        email: user.email,
      },
      summary,
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
