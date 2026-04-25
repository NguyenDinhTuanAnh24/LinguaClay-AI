import Link from 'next/link'
import { Activity, TrendingUp, Wallet, Users, BookOpenCheck, GraduationCap, Mic, Headphones, BookA, PencilLine } from 'lucide-react'
import { loadAdminOverviewData } from '@/services/reporting/admin-overview.loader'

export const dynamic = 'force-dynamic'

type RangeKey = 'today' | '7d' | '30d' | 'custom'
type SearchParams = { range?: string; start?: string; end?: string; userPage?: string }
type UserRow = { dayKey: string; label: string; value: number; delta: number; cumulative: number }
type RevenueBar = { label: string; amount: number; isEmpty: boolean }

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

function parsePositiveInt(value?: string): number | null {
  if (!value) return null
  const num = Number.parseInt(value, 10)
  if (!Number.isFinite(num) || num <= 0) return null
  return num
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

export default async function AdminOverviewPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const { range, startAt, endAt, startInput, endInput } = resolveRange(params)
  const requestedUserPage = parsePositiveInt(params.userPage) || 1

  const overview = await loadAdminOverviewData({
    startAt,
    endAt,
    userPage: requestedUserPage,
  })

  const summary = overview.summary
  const revenueBars = overview.revenueBars as RevenueBar[]
  const maxPlanRevenue = overview.maxPlanRevenue
  const pagedUserRows = overview.userRows as UserRow[]
  const userPage = overview.userPage
  const totalUserPages = overview.totalUserPages
  const userRowsCount = overview.userRowsCount

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
          { title: 'User mới', value: formatCompact(summary.newUsers), note: `${startInput} → ${endInput}`, icon: Users },
          { title: 'DAU/MAU', value: `${summary.dauMauPct}% (${summary.dau}/${summary.mau})`, note: 'Tỷ lệ người dùng hoạt động', icon: Activity },
          { title: 'MRR', value: formatCurrencyVND(summary.mrr), icon: TrendingUp },
          { title: 'Tổng doanh thu', value: formatCurrencyVND(summary.totalRevenue), icon: Wallet },
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
            value: String(summary.flashcardsReviewedToday),
            note: 'Tổng lượt ôn tập từ UserProgress trong ngày',
            icon: BookOpenCheck,
          },
          {
            title: 'Tỷ lệ hoàn thành ngữ pháp',
            value: `${summary.grammarCompletionRate}%`,
            note: `${summary.completedGrammarPoints}/${summary.totalGrammarPoints} điểm ngữ pháp đã có hoạt động`,
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
          { title: 'Lượt luyện Nghe', value: String(summary.tutorListeningTotal), note: 'Tổng số bài giải', icon: Headphones },
          { title: 'Lượt luyện Nói', value: String(summary.tutorSpeakingTotal), note: 'Tổng số phiên nói', icon: Mic },
          { title: 'Lượt luyện Đọc', value: String(summary.tutorReadingTotal), note: 'Tổng số bài đọc', icon: BookA },
          { title: 'Lượt luyện Viết', value: String(summary.tutorWritingTotal), note: 'Tổng số bài viết', icon: PencilLine },
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
                {pagedUserRows.map((row) => (
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
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-[#4B4B4B]">
            <span>
              Trang {userPage}/{totalUserPages} • Hiển thị {userRowsCount} ngày/trang
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={buildUserPageHref(Math.max(1, userPage - 1))}
                className={`border px-3 py-1 uppercase tracking-[0.08em] ${userPage <= 1 ? 'pointer-events-none opacity-40' : ''}`}
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
                className={`border px-3 py-1 uppercase tracking-[0.08em] ${userPage >= totalUserPages ? 'pointer-events-none opacity-40' : ''}`}
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
                        {item.isEmpty ? 'Chưa có' : formatCurrencyVND(item.amount)}
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
