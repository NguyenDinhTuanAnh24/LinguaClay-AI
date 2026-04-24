import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Activity, TrendingUp, Wallet, Users, BookOpenCheck, GraduationCap, Bot, Mic, Headphones, BookA, PencilLine } from 'lucide-react'

export const dynamic = 'force-dynamic'

type RangeKey = 'today' | '7d' | '30d' | 'custom'
type SearchParams = { range?: string; start?: string; end?: string; userPage?: string }
type DayPoint = { dayKey: string; label: string; value: number }
type RevenueBar = { label: string; amount: number; isEmpty: boolean }
const ADMIN_EMAILS = ['admin@gmail.com']

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

function parseDateInput(value?: string): string | null {
  if (!value) return null
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

function resolveRange(searchParams: SearchParams): {
  range: RangeKey
  startAt: Date
  endAt: Date
  startInput: string
  endInput: string
} {
  const requested = (searchParams.range || '7d') as RangeKey
  const range: RangeKey = ['today', '7d', '30d', 'custom'].includes(requested) ? requested : '7d'
  const vnToday = getVNDayKey(new Date())
  const endDefault = getVNDayBoundary(vnToday, true)

  if (range === 'today') {
    return {
      range,
      startAt: getVNDayBoundary(vnToday),
      endAt: endDefault,
      startInput: vnToday,
      endInput: vnToday,
    }
  }

  if (range === '7d' || range === '30d') {
    const days = range === '7d' ? 7 : 30
    const startAt = new Date(endDefault)
    startAt.setDate(startAt.getDate() - (days - 1))
    startAt.setHours(0, 0, 0, 0)
    return { range, startAt, endAt: endDefault, startInput: getVNDayKey(startAt), endInput: vnToday }
  }

  const parsedStart = parseDateInput(searchParams.start) || vnToday
  const parsedEnd = parseDateInput(searchParams.end) || vnToday
  const startAt = getVNDayBoundary(parsedStart)
  const endAt = getVNDayBoundary(parsedEnd, true)
  if (startAt > endAt) {
    return {
      range,
      startAt: getVNDayBoundary(vnToday),
      endAt: endDefault,
      startInput: vnToday,
      endInput: vnToday,
    }
  }
  return { range, startAt, endAt, startInput: parsedStart, endInput: parsedEnd }
}

function formatCurrencyVND(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value)
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

function parsePositiveInt(value?: string): number | null {
  if (!value) return null
  const num = Number.parseInt(value, 10)
  if (!Number.isFinite(num) || num <= 0) return null
  return num
}

export default async function AdminOverviewPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const { range, startAt, endAt, startInput, endInput } = resolveRange(params)

  const mauStart = (() => {
    const d = new Date(endAt)
    d.setDate(d.getDate() - 29)
    d.setHours(0, 0, 0, 0)
    return d
  })()

  const vnToday = getVNDayKey(new Date())
  const todayStart = getVNDayBoundary(vnToday)
  const todayEnd = getVNDayBoundary(vnToday, true)

  const [
    newUsers,
    successfulOrders,
    dauRows,
    mauRows,
    createdUsers,
    flashcardsReviewedToday,
    totalGrammarPoints,
    completedGrammarRows,
    tutorListeningTotal,
    tutorReadingTotal,
    tutorSpeakingTotal,
    tutorWritingTotal,
  ] = await Promise.all([
    prisma.user.count({ where: { email: { notIn: ADMIN_EMAILS }, createdAt: { gte: startAt, lte: endAt } } }),
    prisma.order.findMany({
      where: { status: 'SUCCESS', createdAt: { gte: startAt, lte: endAt } },
      select: { amount: true, planId: true },
    }),
    prisma.userProgress.findMany({
      where: { user: { email: { notIn: ADMIN_EMAILS } }, lastReviewed: { gte: startAt, lte: endAt } },
      distinct: ['userId'],
      select: { userId: true },
    }),
    prisma.userProgress.findMany({
      where: { user: { email: { notIn: ADMIN_EMAILS } }, lastReviewed: { gte: mauStart, lte: endAt } },
      distinct: ['userId'],
      select: { userId: true },
    }),
    prisma.user.findMany({
      where: { email: { notIn: ADMIN_EMAILS }, createdAt: { gte: startAt, lte: endAt } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.userProgress.count({
      where: { user: { email: { notIn: ADMIN_EMAILS } }, lastReviewed: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.grammarPoint.count(),
    prisma.exercise.findMany({
      where: {
        grammarPointId: { not: null },
        userId: { not: null },
      },
      distinct: ['grammarPointId'],
      select: { grammarPointId: true },
    }),
    prisma.tutorListeningSession.count({ where: { user: { email: { notIn: ADMIN_EMAILS } }, createdAt: { gte: startAt, lte: endAt } } }),
    prisma.tutorReadingSession.count({ where: { user: { email: { notIn: ADMIN_EMAILS } }, createdAt: { gte: startAt, lte: endAt } } }),
    prisma.tutorSpeakingSession.count({ where: { user: { email: { notIn: ADMIN_EMAILS } }, createdAt: { gte: startAt, lte: endAt } } }),
    prisma.tutorEditorSession.count({ where: { user: { email: { notIn: ADMIN_EMAILS } }, createdAt: { gte: startAt, lte: endAt } } }),
  ])

  const totalRevenue = successfulOrders.reduce((sum: number, row) => sum + row.amount, 0)
  const mrr = Math.round(
    successfulOrders.reduce((sum: number, row) => sum + row.amount / estimatePlanMonths(row.planId), 0)
  )
  const dau = dauRows.length
  const mau = mauRows.length
  const dauMauPct = mau > 0 ? Math.round((dau / mau) * 100) : 0

  const completedGrammarPoints = completedGrammarRows.length
  const grammarCompletionRate = totalGrammarPoints > 0 ? Math.round((completedGrammarPoints / totalGrammarPoints) * 100) : 0

  const userSeries = buildDaySeries(startAt, endAt)
  const seriesMap = new Map(userSeries.map((x) => [x.dayKey, x]))
  for (const row of createdUsers) {
    const key = getVNDayKey(row.createdAt)
    const target = seriesMap.get(key)
    if (target) target.value += 1
  }

  const planRevenueMap = new Map<string, number>()
  for (const row of successfulOrders) {
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
  const requestedUserPage = parsePositiveInt(params.userPage) || 1
  const userPage = Math.min(totalUserPages, requestedUserPage)
  const userPageStart = (userPage - 1) * userRowsPerPage
  const pagedUserRows = userRowsNewestFirst.slice(userPageStart, userPageStart + userRowsPerPage)

  const buildUserPageHref = (targetPage: number) => {
    const query = new URLSearchParams()
    query.set('range', range)
    if (range === 'custom') {
      query.set('start', startInput)
      query.set('end', endInput)
    }
    query.set('userPage', String(targetPage))
    return `/admin?${query.toString()}`
  }

  const filters: Array<{ key: RangeKey; label: string; href: string }> = [
    { key: 'today', label: 'Hôm nay', href: '/admin?range=today' },
    { key: '7d', label: '7 ngày', href: '/admin?range=7d' },
    { key: '30d', label: '30 ngày', href: '/admin?range=30d' },
  ]

  return (
    <div className="space-y-6">
      <section
        className="border border-[#141414] bg-[#F5F0E8] p-6 transition-all hover:-translate-y-px hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,0.95)]"
        style={{ boxShadow: '8px 8px 0 0 rgba(20,20,20,0.92)' }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4B4B4B]">Module 01</p>
            <h1 className="mt-2 text-4xl font-serif font-black text-[#141414]">Tổng quan & Thống kê</h1>
            <p className="mt-2 text-sm font-semibold text-[#4B4B4B]">Theo dõi tăng trưởng user và doanh thu theo phạm vi thời gian.</p>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {filters.map((item) => {
                const active = item.key === range
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="border px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition-all hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_rgba(20,20,20,0.9)]"
                    style={{
                      borderColor: '#141414',
                      background: active ? '#141414' : '#F5F0E8',
                      color: active ? '#F5F0E8' : '#141414',
                    }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
            <form action="/admin" method="get" className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="range" value="custom" />
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#4B4B4B]">Từ ngày</span>
                <input type="date" name="start" defaultValue={startInput} className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#4B4B4B]">Đến ngày</span>
                <input type="date" name="end" defaultValue={endInput} className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm" />
              </label>
              <button
                type="submit"
                className="h-9 border border-[#141414] bg-[#141414] px-4 text-[11px] font-black uppercase tracking-[0.14em] text-[#F5F0E8] transition-all hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_rgba(20,20,20,0.9)]"
              >
                Tùy chỉnh
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'User mới', value: formatCompact(newUsers), note: `${startInput} → ${endInput}`, icon: Users },
          { title: 'DAU/MAU', value: `${dauMauPct}% (${dau}/${mau})`, note: 'Tỷ lệ người dùng hoạt động', icon: Activity },
          { title: 'MRR', value: formatCurrencyVND(mrr), icon: TrendingUp },
          { title: 'Tổng doanh thu', value: formatCurrencyVND(totalRevenue), icon: Wallet },
        ].map((card) => {
          const Icon = card.icon
          return (
            <article
              key={card.title}
              className="border border-[#141414] bg-[#F5F0E8] p-5 transition-all hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_rgba(20,20,20,0.95)]"
              style={{ boxShadow: '5px 5px 0 0 rgba(20,20,20,0.9)' }}
            >
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#4B4B4B]">
                <Icon size={14} />
                {card.title}
              </p>
              <p className="mt-3 text-3xl font-serif font-black text-[#141414]">{card.value}</p>
              {card.note ? <p className="mt-2 text-xs font-semibold text-[#4B4B4B]">{card.note}</p> : null}
            </article>
          )
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          {
            title: 'Flashcard đã review hôm nay',
            value: String(flashcardsReviewedToday),
            note: 'Tổng lượt ôn tập từ UserProgress trong ngày',
            icon: BookOpenCheck,
          },
          {
            title: 'Tỷ lệ hoàn thành ngữ pháp',
            value: `${grammarCompletionRate}%`,
            note: `${completedGrammarPoints}/${totalGrammarPoints} điểm ngữ pháp đã có hoạt động`,
            icon: GraduationCap,
          },
        ].map((card) => {
          const Icon = card.icon
          return (
            <article
              key={card.title}
              className="border border-[#141414] bg-[#F5F0E8] p-4 transition-all hover:-translate-y-px hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,0.9)]"
              style={{ boxShadow: '4px 4px 0 0 rgba(20,20,20,0.85)' }}
            >
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#4B4B4B]">
                <Icon size={13} />
                {card.title}
              </p>
              <p className="mt-2 text-2xl font-serif font-black text-[#141414]">{card.value}</p>
              <p className="mt-1 text-[11px] font-semibold text-[#4B4B4B]">{card.note}</p>
            </article>
          )
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          {
            title: 'Lượt luyện Nghe',
            value: String(tutorListeningTotal),
            note: 'Tổng số bài giải',
            icon: Headphones,
          },
          {
            title: 'Lượt luyện Nói',
            value: String(tutorSpeakingTotal),
            note: 'Tổng số phiên nói',
            icon: Mic,
          },
          {
            title: 'Lượt luyện Đọc',
            value: String(tutorReadingTotal),
            note: 'Tổng số bài đọc',
            icon: BookA,
          },
          {
            title: 'Lượt luyện Viết',
            value: String(tutorWritingTotal),
            note: 'Tổng số bài viết',
            icon: PencilLine,
          },
        ].map((card) => {
          const Icon = card.icon
          return (
            <article
              key={card.title}
              className="border border-[#141414] bg-[#F5F0E8] p-4 transition-all hover:-translate-y-px hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,0.9)]"
              style={{ boxShadow: '4px 4px 0 0 rgba(20,20,20,0.85)' }}
            >
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#4B4B4B]">
                <Icon size={13} />
                {card.title}
              </p>
              <p className="mt-2 text-2xl font-serif font-black text-[#141414]">{card.value}</p>
              <p className="mt-1 text-[11px] font-semibold text-[#4B4B4B]">{card.note}</p>
            </article>
          )
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article
          className="border border-[#141414] bg-[#F5F0E8] p-5 transition-all hover:-translate-y-px hover:shadow-[9px_9px_0px_0px_rgba(20,20,20,0.95)]"
          style={{ boxShadow: '6px 6px 0 0 rgba(20,20,20,0.9)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-serif font-black text-[#141414]">Tăng trưởng user theo ngày</h2>
            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#4B4B4B]">Bảng thống kê</span>
          </div>
          <div className="overflow-x-auto border border-[#141414]">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[#ECE6DB]">
                <tr>
                  <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Ngày</th>
                  <th className="border border-[#141414] px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">User mới</th>
                  <th className="border border-[#141414] px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">So với hôm trước</th>
                  <th className="border border-[#141414] px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">Lũy kế kỳ này</th>
                </tr>
              </thead>
              <tbody>
                {pagedUserRows.map((row) => {
                  return (
                    <tr key={row.dayKey} className="odd:bg-[#F5F0E8] even:bg-[#EFEAE0]">
                      <td className="border border-[#141414] px-3 py-2 font-semibold text-[#141414]">{row.label}</td>
                      <td className="border border-[#141414] px-3 py-2 text-right font-bold tabular-nums">{row.value}</td>
                      <td
                        className={`border border-[#141414] px-3 py-2 text-right font-bold tabular-nums ${
                          row.delta > 0 ? 'text-[#166534]' : row.delta < 0 ? 'text-[#B91C1C]' : 'text-[#4B4B4B]'
                        }`}
                      >
                        {row.delta >= 0 ? '+' : ''}
                        {row.delta}
                      </td>
                      <td className="border border-[#141414] px-3 py-2 text-right font-bold tabular-nums">{row.cumulative}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-[#4B4B4B]">
            <span>
              Trang {userPage}/{totalUserPages} • Hiển thị {pagedUserRows.length} ngày/trang
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={buildUserPageHref(Math.max(1, userPage - 1))}
                className={`border px-3 py-1 uppercase tracking-[0.08em] ${
                  userPage <= 1 ? 'pointer-events-none opacity-40' : ''
                }`}
                style={{ borderColor: '#141414' }}
              >
                Trước
              </Link>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalUserPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={buildUserPageHref(pageNum)}
                    className="border px-2 py-1 tabular-nums"
                    style={{
                      borderColor: '#141414',
                      background: pageNum === userPage ? '#141414' : '#F5F0E8',
                      color: pageNum === userPage ? '#F5F0E8' : '#141414',
                    }}
                  >
                    {pageNum}
                  </Link>
                ))}
              </div>
              <Link
                href={buildUserPageHref(Math.min(totalUserPages, userPage + 1))}
                className={`border px-3 py-1 uppercase tracking-[0.08em] ${
                  userPage >= totalUserPages ? 'pointer-events-none opacity-40' : ''
                }`}
                style={{ borderColor: '#141414' }}
              >
                Sau
              </Link>
            </div>
          </div>
        </article>

        <article
          className="border border-[#141414] bg-[#F5F0E8] p-5 transition-all hover:-translate-y-px hover:shadow-[9px_9px_0px_0px_rgba(20,20,20,0.95)]"
          style={{ boxShadow: '6px 6px 0 0 rgba(20,20,20,0.9)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-serif font-black text-[#141414]">Doanh thu theo gói</h2>
            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#4B4B4B]">Bảng thống kê</span>
          </div>
          <div className="overflow-x-auto border border-[#141414]">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[#ECE6DB]">
                <tr>
                  <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Gói</th>
                  <th className="border border-[#141414] px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">Doanh thu</th>
                  <th className="border border-[#141414] px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">Tỷ trọng</th>
                </tr>
              </thead>
              <tbody>
                {revenueBars.map((item) => {
                  const ratio = Math.round((item.amount / maxPlanRevenue) * 100)
                  return (
                    <tr key={item.label} className="odd:bg-[#F5F0E8] even:bg-[#EFEAE0]">
                      <td className="border border-[#141414] px-3 py-2 font-semibold text-[#141414]">{item.label}</td>
                      <td className="border border-[#141414] px-3 py-2 text-right font-bold tabular-nums">
                        {item.isEmpty ? 'Chua co' : formatCurrencyVND(item.amount)}
                      </td>
                      <td className="border border-[#141414] px-3 py-2 text-right font-bold tabular-nums">
                        {item.isEmpty ? '0%' : `${ratio}%`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  )
}
