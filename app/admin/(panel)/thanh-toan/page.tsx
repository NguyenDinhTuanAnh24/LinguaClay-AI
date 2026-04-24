import { prisma } from '@/lib/prisma'
import { ThanhToanClient, type TransactionView, type CouponView } from './ui-client'

function getVNDayBoundary(day: string, endOfDay = false): Date {
  return new Date(`${day}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}+07:00`)
}

function getVNDayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

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

export default async function ThanhToanPage() {
  const vnToday = getVNDayKey(new Date())
  const todayStart = getVNDayBoundary(vnToday)
  const todayEnd = getVNDayBoundary(vnToday, true)
  const couponDelegate = (prisma as unknown as {
    coupon?: {
      findMany: (args: {
        orderBy: { createdAt: 'desc' }
        take: number
        select: {
          id: true
          code: true
          discountPercent: true
          usageLimit: true
          usedCount: true
          expiresAt: true
        }
      }) => Promise<
        Array<{
          id: string
          code: string
          discountPercent: number
          usageLimit: number
          usedCount: number
          expiresAt: Date
        }>
      >
    }
  }).coupon
  const couponRowsPromise = couponDelegate
    ? couponDelegate.findMany({
        orderBy: { createdAt: 'desc' },
        take: 120,
        select: {
          id: true,
          code: true,
          discountPercent: true,
          usageLimit: true,
          usedCount: true,
          expiresAt: true,
        },
      })
    : Promise.resolve([])

  const [todayCount, successCount, pendingCount, orders, couponRows] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.order.count({ where: { status: 'SUCCESS' } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 120,
      select: {
        id: true,
        orderCode: true,
        planId: true,
        amount: true,
        createdAt: true,
        status: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    couponRowsPromise,
  ])

  const transactions: TransactionView[] = orders.map((o) => ({
    id: o.id,
    code: `OD-${o.orderCode}`,
    userId: o.user.id,
    userEmail: o.user.email,
    user: o.user.name || o.user.email,
    plan: normalizePlanLabel(o.planId),
    amount: o.amount,
    createdAt: formatDateTime(o.createdAt),
    status: o.status || 'PENDING',
  }))

  const coupons: CouponView[] = couponRows.map((c) => ({
    id: c.id,
    code: c.code,
    discount: c.discountPercent,
    expiresAt: formatDateTime(c.expiresAt),
    expiresAtDate: getVNDayKey(c.expiresAt),
    used: c.usedCount,
    limit: c.usageLimit,
  }))

  const couponSummary = {
    totalCoupons: coupons.length,
    totalUsed: coupons.reduce((sum, c) => sum + c.used, 0),
    totalRemaining: coupons.reduce((sum, c) => sum + Math.max(0, c.limit - c.used), 0),
  }

  return (
    <ThanhToanClient
      summary={{ today: todayCount, success: successCount, pending: pendingCount }}
      couponSummary={couponSummary}
      transactions={transactions}
      coupons={coupons}
    />
  )
}
