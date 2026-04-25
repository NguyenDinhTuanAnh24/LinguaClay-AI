import { ReportingRepository } from '@/repositories/reporting.repository'

type DayPoint = { dayKey: string; label: string; value: number }
type RevenueBar = { label: string; amount: number; isEmpty: boolean }
type RangeKey = 'today' | '7d' | '30d' | 'custom'

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

function normalizePlanLabel(planId: string): string {
  const key = (planId || '').toUpperCase()
  if (key.includes('3_MONTHS') || key.includes('TRIAL')) return 'Bản tiêu chuẩn (3 tháng)'
  if (key.includes('6_MONTHS') || key.includes('FLEX')) return 'Bản chuyên sâu (6 tháng)'
  if (key.includes('1_YEAR') || key.includes('12') || key.includes('YEAR')) return 'Bản toàn diện (1 năm)'
  const adminMatch = key.match(/ADMIN_GRANTED_(\d+)M/)
  if (adminMatch) return `Gói ADMIN cấp (${adminMatch[1]} tháng)`
  return planId || 'Khác'
}

function estimatePlanMonths(planId: string): number {
  const key = (planId || '').toUpperCase()
  if (key.includes('3') || key.includes('TRIAL')) return 3
  if (key.includes('6') || key.includes('FLEX')) return 6
  if (key.includes('1_YEAR') || key.includes('12') || key.includes('YEAR')) return 12
  return 1
}

function buildDaySeries(startAt: Date, endAt: Date): DayPoint[] {
  const list: DayPoint[] = []
  const cursor = new Date(startAt)
  while (cursor <= endAt) {
    const key = getVNDayKey(cursor)
    list.push({ dayKey: key, label: `${key.slice(8, 10)}/${key.slice(5, 7)}`, value: 0 })
    cursor.setDate(cursor.getDate() + 1)
  }
  return list
}

function buildRevenueBars(planRevenueMap: Map<string, number>): RevenueBar[] {
  const canonicalPlans = ['Bản tiêu chuẩn (3 tháng)', 'Bản chuyên sâu (6 tháng)', 'Bản toàn diện (1 năm)']
  return canonicalPlans.map((label) => {
    const amount = planRevenueMap.get(label) || 0
    return { label, amount, isEmpty: amount <= 0 }
  })
}

export async function loadAdminOverviewData(input: {
  startAt: Date
  endAt: Date
  userPage: number
}) {
  const mauStart = (() => {
    const d = new Date(input.endAt)
    d.setDate(d.getDate() - 29)
    d.setHours(0, 0, 0, 0)
    return d
  })()

  const vnToday = getVNDayKey(new Date())
  const todayStart = getVNDayBoundary(vnToday)
  const todayEnd = getVNDayBoundary(vnToday, true)

  const raw = await ReportingRepository.getAdminOverviewRaw({
    startAt: input.startAt,
    endAt: input.endAt,
    mauStart,
    todayStart,
    todayEnd,
  })

  const totalRevenue = raw.successfulOrders.reduce((sum: number, row) => sum + row.amount, 0)
  const mrr = Math.round(raw.successfulOrders.reduce((sum: number, row) => sum + row.amount / estimatePlanMonths(row.planId), 0))
  const dau = raw.dauRows.length
  const mau = raw.mauRows.length
  const dauMauPct = mau > 0 ? Math.round((dau / mau) * 100) : 0
  const completedGrammarPoints = raw.completedGrammarRows.length
  const grammarCompletionRate = raw.totalGrammarPoints > 0 ? Math.round((completedGrammarPoints / raw.totalGrammarPoints) * 100) : 0

  const userSeries = buildDaySeries(input.startAt, input.endAt)
  const seriesMap = new Map(userSeries.map((x) => [x.dayKey, x]))
  for (const row of raw.createdUsers) {
    const key = getVNDayKey(row.createdAt)
    const target = seriesMap.get(key)
    if (target) target.value += 1
  }

  const planRevenueMap = new Map<string, number>()
  for (const row of raw.successfulOrders) {
    const label = normalizePlanLabel(row.planId)
    planRevenueMap.set(label, (planRevenueMap.get(label) || 0) + row.amount)
  }
  const revenueBars = buildRevenueBars(planRevenueMap)
  const maxPlanRevenue = Math.max(1, ...revenueBars.map((x) => x.amount))

  const userRows = userSeries.map((row, idx) => {
    const prev = idx > 0 ? userSeries[idx - 1].value : 0
    const delta = row.value - prev
    const cumulative = (idx > 0 ? userSeries.slice(0, idx).reduce((sum, x) => sum + x.value, 0) : 0) + row.value
    return { ...row, delta, cumulative }
  })
  const userRowsNewestFirst = [...userRows].reverse()
  const userRowsPerPage = 5
  const totalUserPages = Math.max(1, Math.ceil(userRowsNewestFirst.length / userRowsPerPage))
  const userPage = Math.min(totalUserPages, Math.max(1, input.userPage))
  const userPageStart = (userPage - 1) * userRowsPerPage
  const pagedUserRows = userRowsNewestFirst.slice(userPageStart, userPageStart + userRowsPerPage)

  return {
    summary: {
      newUsers: raw.newUsers,
      totalRevenue,
      mrr,
      dau,
      mau,
      dauMauPct,
      flashcardsReviewedToday: raw.flashcardsReviewedToday,
      grammarCompletionRate,
      completedGrammarPoints,
      totalGrammarPoints: raw.totalGrammarPoints,
      tutorListeningTotal: raw.tutorListeningTotal,
      tutorReadingTotal: raw.tutorReadingTotal,
      tutorSpeakingTotal: raw.tutorSpeakingTotal,
      tutorWritingTotal: raw.tutorWritingTotal,
    },
    revenueBars,
    maxPlanRevenue,
    userRows: pagedUserRows,
    userPage,
    totalUserPages,
    userRowsCount: pagedUserRows.length,
  }
}

export type { RangeKey }
