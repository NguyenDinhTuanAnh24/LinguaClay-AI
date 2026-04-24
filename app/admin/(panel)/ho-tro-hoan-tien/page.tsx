import { prisma } from '@/lib/prisma'
import {
  HoTroHoanTienClient,
  type ChurnPlanView,
  type ChurnReasonView,
  type RefundHistoryItemView,
  type RefundQueueItemView,
  type SupportTicketView,
} from './ui-client'

type TicketCategory = 'TECHNICAL' | 'CONTENT' | 'PAYMENT' | 'FEEDBACK'

const DAY_MS = 24 * 60 * 60 * 1000

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

function classifyTicket(rawText: string): TicketCategory {
  const text = rawText.toLowerCase()
  if (/(lỗi|bug|crash|treo|không vào|không dùng được|app)/i.test(text)) return 'TECHNICAL'
  if (/(từ vựng|ngữ pháp|nội dung|sai đáp án|bài học)/i.test(text)) return 'CONTENT'
  if (/(thanh toán|hoàn tiền|mua nhầm|gói|pay|billing|payment)/i.test(text)) return 'PAYMENT'
  return 'FEEDBACK'
}

function labelForCategory(category: string): string {
  const normalized = (category || '').trim().toUpperCase()
  if (normalized === 'TECHNICAL') return 'Lỗi kỹ thuật'
  if (normalized === 'CONTENT') return 'Lỗi nội dung'
  if (normalized === 'PAYMENT') return 'Thắc mắc thanh toán'
  return 'Góp ý'
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

function readRefundAmountFromPayload(payload: unknown): number | null {
  if (!payload || typeof payload !== 'object') return null
  const amount = (payload as { refundAmount?: unknown }).refundAmount
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) return null
  return Math.round(amount)
}

export default async function HoTroHoanTienPage() {
  const supportRowsPromise = prisma.supportTicket.findMany({
    orderBy: { createdAt: 'desc' },
    take: 220,
    select: {
      id: true,
      userId: true,
      category: true,
      subject: true,
      message: true,
      attachmentUrl: true,
      status: true,
      device: true,
      blockedLesson: true,
      internalNote: true,
      adminReply: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isPro: true,
          proType: true,
          updatedAt: true,
        },
      },
    },
  })

  const refundRowsPromise = prisma.refundRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 220,
    select: {
      id: true,
      status: true,
      reason: true,
      bankName: true,
      accountNumber: true,
      accountName: true,
      note: true,
      processedBy: true,
      processedAt: true,
      createdAt: true,
      userId: true,
      orderId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isPro: true,
          proType: true,
          updatedAt: true,
        },
      },
      order: {
        select: {
          id: true,
          planId: true,
          amount: true,
          createdAt: true,
          status: true,
        },
      },
    },
  })

  const [supportRows, refundRows] = await Promise.all([supportRowsPromise, refundRowsPromise])

  const refundOrderIds = Array.from(new Set(refundRows.map((row) => row.orderId)))
  const refundApprovedEvents = refundOrderIds.length
    ? await prisma.paymentEvent.findMany({
        where: {
          orderId: { in: refundOrderIds },
          eventType: 'REFUND_APPROVED',
        },
        orderBy: { createdAt: 'desc' },
        select: {
          orderId: true,
          payload: true,
        },
      })
    : []

  const approvedAmountByOrderId = new Map<string, number>()
  for (const event of refundApprovedEvents) {
    if (approvedAmountByOrderId.has(event.orderId)) continue
    const amount = readRefundAmountFromPayload(event.payload)
    if (amount) approvedAmountByOrderId.set(event.orderId, amount)
  }

  const userIds = Array.from(new Set([...supportRows.map((row) => row.userId), ...refundRows.map((row) => row.userId)]))
  const [writingRows, studyRows] = userIds.length
    ? await Promise.all([
        prisma.writingSession.findMany({
          where: { userId: { in: userIds } },
          orderBy: { createdAt: 'desc' },
          take: 2000,
          select: {
            userId: true,
            createdAt: true,
            score: true,
            topic: { select: { name: true } },
          },
        }),
        prisma.userDailyStudy.findMany({
          where: { userId: { in: userIds } },
          orderBy: { date: 'desc' },
          take: 3000,
          select: {
            userId: true,
            date: true,
            lastActiveAt: true,
            activeSeconds: true,
          },
        }),
      ])
    : [[], []]

  const latestWritingByUser = new Map<
    string,
    { createdAt: Date; score: number | null; topicName: string | null }
  >()
  const writingCountByUser = new Map<string, number>()
  for (const row of writingRows) {
    if (!latestWritingByUser.has(row.userId)) {
      latestWritingByUser.set(row.userId, {
        createdAt: row.createdAt,
        score: row.score,
        topicName: row.topic?.name ?? null,
      })
    }
    writingCountByUser.set(row.userId, (writingCountByUser.get(row.userId) || 0) + 1)
  }

  const lastActiveByUser = new Map<string, Date>()
  const activeSecondsByUser = new Map<string, number>()
  for (const row of studyRows) {
    const activityAt = row.lastActiveAt ?? row.date
    const current = lastActiveByUser.get(row.userId)
    if (!current || activityAt > current) lastActiveByUser.set(row.userId, activityAt)
    activeSecondsByUser.set(row.userId, (activeSecondsByUser.get(row.userId) || 0) + row.activeSeconds)
  }

  const historyByUser = new Map<
    string,
    Array<{ id: string; createdAt: string; reason: string; status: string }>
  >()
  for (const row of supportRows) {
    const arr = historyByUser.get(row.userId) || []
    arr.push({
      id: row.id,
      createdAt: formatDateTime(row.createdAt),
      reason: row.message || 'Không có nội dung',
      status: row.status,
    })
    historyByUser.set(row.userId, arr)
  }

  const supportTickets: SupportTicketView[] = supportRows.slice(0, 120).map((row) => {
    const fallbackCategory = classifyTicket(row.message || '')
    const historyRows = historyByUser.get(row.userId) || []
    const latestWriting = latestWritingByUser.get(row.userId)
    const lastActive = lastActiveByUser.get(row.userId) ?? row.user.updatedAt
    const packageStatus = row.user.isPro
      ? row.user.proType
        ? normalizePlanLabel(row.user.proType)
        : 'Đã nâng cấp'
      : 'Bản miễn phí'

    return {
      id: row.id,
      userId: row.userId,
      userName: row.user.name || row.user.email,
      userEmail: row.user.email,
      subject: row.subject || '',
      message: row.message || 'Không có nội dung mô tả',
      attachmentUrl: row.attachmentUrl || '',
      createdAt: formatDateTime(row.createdAt),
      status: row.status,
      autoTag: labelForCategory(row.category || fallbackCategory),
      packageStatus,
      device: row.device || 'Web/Ứng dụng',
      lastActiveAt: formatDateTime(lastActive),
      blockedLesson:
        row.blockedLesson ||
        (latestWriting && (latestWriting.score === null || latestWriting.score < 70)
          ? latestWriting.topicName || 'Bài viết gần nhất'
          : latestWriting?.topicName || 'Chưa xác định'),
      history: historyRows.filter((h) => h.id !== row.id).slice(0, 6),
      internalNote: row.internalNote || '',
      adminReply: row.adminReply || '',
    }
  })

  const refundQueue: RefundQueueItemView[] = refundRows
    .filter((row) => row.status === 'PENDING')
    .map((row) => {
      const daysSincePurchase = Math.floor((row.createdAt.getTime() - row.order.createdAt.getTime()) / DAY_MS)
      const sessionCount = writingCountByUser.get(row.userId) || 0
      const activeSeconds = activeSecondsByUser.get(row.userId) || 0
      const activeHours = Math.round((activeSeconds / 3600) * 10) / 10
      const highUsage = sessionCount > 20 || activeSeconds > 8 * 3600
      const eligible = daysSincePurchase < 7 && !highUsage
      const eligibilityLabel = eligible ? 'Hợp lệ' : 'Cảnh báo'
      const eligibilityReason =
        daysSincePurchase >= 7
          ? 'Đơn hàng đã quá 7 ngày.'
          : highUsage
            ? 'Người dùng đã dùng nhiều bài học/AI.'
            : 'Trong ngưỡng chính sách.'

      const deduction = Math.min(row.order.amount * 0.8, daysSincePurchase * 10000 + sessionCount * 2000)
      const suggestedPartialAmount = Math.max(1000, row.order.amount - Math.round(deduction))

      return {
        id: row.id,
        userId: row.userId,
        userName: row.user.name || row.user.email,
        userEmail: row.user.email,
        bankName: (row.bankName || '').trim(),
        accountNumber: (row.accountNumber || '').trim(),
        accountName: (row.accountName || '').trim(),
        reason: row.reason || 'Không có lý do',
        requestedAt: formatDateTime(row.createdAt),
        planId: normalizePlanLabel(row.order.planId),
        amount: row.order.amount,
        eligibilityLabel,
        eligibilityReason,
        usageSignal: `${sessionCount} phiên viết • ${activeHours}h học`,
        suggestedPartialAmount: Math.min(suggestedPartialAmount, row.order.amount),
      }
    })

  const refundHistory: RefundHistoryItemView[] = refundRows
    .filter((row) => row.status !== 'PENDING')
    .sort((a, b) => (b.processedAt || b.createdAt).getTime() - (a.processedAt || a.createdAt).getTime())
    .slice(0, 140)
    .map((row) => ({
      id: row.id,
      userName: row.user.name || row.user.email,
      userEmail: row.user.email,
      planId: normalizePlanLabel(row.order.planId),
      reason: row.reason || 'KhÃ´ng cÃ³ lÃ½ do',
      requestedAmount: row.order.amount,
      refundedAmount: approvedAmountByOrderId.get(row.orderId) || null,
      requestedAt: formatDateTime(row.createdAt),
      processedAt: row.processedAt ? formatDateTime(row.processedAt) : null,
      status: row.status,
      processedBy: row.processedBy || null,
      note: row.note || null,
    }))

  const churnPlanMap = new Map<string, number>()
  const churnReasonMap = new Map<string, number>()
  for (const row of refundRows) {
    const planLabel = normalizePlanLabel(row.order.planId)
    churnPlanMap.set(planLabel, (churnPlanMap.get(planLabel) || 0) + 1)
    const label = labelForCategory(classifyTicket(row.reason || ''))
    churnReasonMap.set(label, (churnReasonMap.get(label) || 0) + 1)
  }

  const churnByPlan: ChurnPlanView[] = Array.from(churnPlanMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([planId, count]) => ({ planId, count }))

  const churnByReason: ChurnReasonView[] = Array.from(churnReasonMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => ({ reason, count }))

  return (
    <HoTroHoanTienClient
      supportTickets={supportTickets}
      refundQueue={refundQueue}
      refundHistory={refundHistory}
      churnByPlan={churnByPlan}
      churnByReason={churnByReason}
    />
  )
}
