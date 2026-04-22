import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowRight, Plus, Bot, Flame } from 'lucide-react'
import DashboardFlashcard from '@/components/dashboard/DashboardFlashcard'

/* ─────────────── helpers ─────────────── */
const toVNDate = (d: Date) =>
  new Date(d.getTime() + 7 * 3600_000).toISOString().split('T')[0]

function relativeTime(nextReview: Date | null): string {
  if (!nextReview) return '—'
  const diff = nextReview.getTime() - Date.now()
  if (diff <= 0) return 'Đến hạn'
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d} ngày`
  if (h > 0) return `${h}h`
  return 'Sắp hạn'
}

/* ─────────────── page ─────────────── */
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userData = await (prisma as any).user.findUnique({
    where: { id: user?.id || '' },
    include: { progress: true, exercises: true },
  })

  const totalMastered  = userData?.progress.filter((p: any) => p.masteryLevel >= 4).length || 0
  const totalToReview  = userData?.progress.filter((p: any) => p.masteryLevel < 4).length  || 0
  const totalProgress  = userData?.progress.length || 0
  const progressPct    = totalProgress > 0 ? Math.round((totalMastered / totalProgress) * 100) : 0

  /* streak */
  const allReviewed = await (prisma as any).userProgress.findMany({
    where: { userId: user?.id || '', lastReviewed: { not: null } },
    select: { lastReviewed: true },
    orderBy: { lastReviewed: 'desc' },
  })
  const uniqueDays = [...new Set(allReviewed.map((p: any) => toVNDate(p.lastReviewed!)))] as string[]

  let streak = 0
  if (uniqueDays.length > 0) {
    const todayVN  = toVNDate(new Date())
    const msPerDay = 86_400_000
    if (new Date(todayVN).getTime() - new Date(uniqueDays[0]).getTime() <= msPerDay) {
      streak = 1
      for (let i = 1; i < uniqueDays.length; i++) {
        const diff = new Date(uniqueDays[i - 1]).getTime() - new Date(uniqueDays[i]).getTime()
        if (diff <= msPerDay + 1) streak++
        else break
      }
    }
  }

  // Các ngày thuộc chuỗi liên tiếp hiện tại (tính lùi từ hôm nay)
  const streakDaySet = new Set<string>()
  if (streak > 0) {
    for (let i = 0; i < streak; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      streakDaySet.add(toVNDate(d))
    }
  }

  /* 7-day week boxes */
  const todayVN = toVNDate(new Date())
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 6 + i)
    const iso = toVNDate(d)
    const dow = d.getDay() // 0=Sun, 1=Mon...
    const labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    return {
      label: labels[dow],
      dayNum: d.getDate(),
      iso,
      studied: uniqueDays.includes(iso),
      isStreakDay: streakDaySet.has(iso),
      isToday: iso === todayVN,
    }
  })

  /* words due for review — top 5 */
  const dueWords = await (prisma as any).userProgress.findMany({
    where: { userId: user?.id || '', masteryLevel: { lt: 5 } },
    orderBy: { nextReview: 'asc' },
    take: 5,
    include: { word: true },
  })

  const displayName = userData?.name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Học viên'

  /* words studied today */
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const wordsToday = await (prisma as any).userProgress.count({
    where: {
      userId: user?.id || '',
      lastReviewed: { gte: today }
    }
  })

  const previewWord = await (prisma as any).word.findFirst({
    where: { topicId: { not: null } },
    include: { userProgress: { where: { userId: user?.id || '' }, take: 1 } },
    orderBy: { createdAt: 'asc' },
  })

  /* SRS label for preview */
  const srsLabel = (() => {
    const prog = previewWord?.userProgress?.[0]
    if (!prog || !prog.nextReview) return 'SRS: Mới'
    const diffMin = Math.max(0, Math.round((new Date(prog.nextReview).getTime() - Date.now()) / 60_000))
    if (diffMin < 60) return `SRS: ${diffMin}p`
    const diffH = Math.round(diffMin / 60)
    if (diffH < 24) return `SRS: ${diffH}H`
    return `SRS: ${Math.round(diffH / 24)}N`
  })()

  const isGoalAchieved = wordsToday >= 10

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>

      {/* ── BANNER ── */}
      <div
        className="group transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(220,38,38,0.2)]"
        style={{
          background: isGoalAchieved ? '#EEF4ED' : '#EDE8DF',
          borderLeft: isGoalAchieved ? '4px solid #16a34a' : '4px solid #dc2626',
          borderTop: '1px solid #141414',
          borderRight: '1px solid #141414',
          borderBottom: '1px solid #141414',
          padding: '24px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          minWidth: 0,
        }}
      >
        <div>
          <p 
            className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${isGoalAchieved ? 'text-green-600' : 'text-red-600'}`}
          >
            {isGoalAchieved ? 'Mục tiêu hoàn thành' : 'Dành cho bạn'}
          </p>
          <p className="text-lg font-serif font-black text-[#141414] leading-snug vietnamese-text">
            {isGoalAchieved ? (
              <>Hôm nay bạn đã rất <span className="italic underline underline-offset-4 decoration-2 decoration-[#16a34a]">tuyệt vời!</span></>
            ) : (
              <>Khởi đầu ngày mới với <span className="italic underline underline-offset-4 decoration-2 decoration-[#dc2626]">mục tiêu 10 từ</span></>
            )}
          </p>
          <p className="text-[10px] text-[#4B4B4B] font-semibold uppercase tracking-widest mt-1">
            {isGoalAchieved ? 'Duy trì phong độ học thêm nữa nhé!' : 'Khám phá thư viện ngay bây giờ'}
          </p>
        </div>
        <Link
          href="/dashboard/flashcards"
          className={`flex-shrink-0 flex items-center gap-2 text-white text-[11px] font-black uppercase tracking-widest px-6 py-3 border-[2px] transition-all transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-y-0 ${
            isGoalAchieved 
              ? 'bg-green-600 border-green-600 hover:bg-[#141414] hover:border-[#141414]' 
              : 'bg-red-600 border-red-600 hover:bg-[#141414] hover:border-[#141414]'
          }`}
        >
          {isGoalAchieved ? 'Tiếp tục luyện tập' : 'Bắt đầu ngay'} <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Refined Row 1 Implementation */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Card 1: Tiến độ (2 units/span 2) */}
        <div className="xl:col-span-2 bg-[#F5F0E8] border-[1px] border-[#141414] p-7 flex flex-col gap-4 transition-all duration-300 hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#141414] flex items-center gap-2">
            <span className="w-6 border-t border-[#141414]" /> Tiến độ hôm nay
          </p>
          <div className="flex items-end gap-1 leading-none mt-2">
            <span className="text-6xl font-serif font-black text-[#141414]">{progressPct}</span>
            <span className="text-lg font-bold text-[#4B4B4B] pb-1">%</span>
          </div>
          <p className="text-[11px] text-[#4B4B4B] font-medium vietnamese-text">Chào {displayName.split(' ').pop()}, chinh phục từ mới ngay!</p>
          
          <div className="mt-2">
            <div className="flex justify-between text-[9px] text-[#4B4B4B] font-black uppercase tracking-widest mb-1.5">
              <span>Tiến độ tổng</span>
              <span className="text-[#141414]">{totalMastered} / {totalProgress}</span>
            </div>
            <div className="h-[2.5px] bg-[#EDE8DF] border border-[#141414]/5">
              <div className="h-full bg-red-600 transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#141414]/10 mt-auto pt-4 border-t border-[#141414]/5">
            {[
              { label: 'Đã thuộc', value: totalMastered },
              { label: 'Cần ôn',   value: totalToReview  },
              { label: 'Streak',   value: streak > 0 ? `${streak}🔥` : '—' },
            ].map(s => (
              <div key={s.label} className="text-center px-2">
                <div className="text-2xl font-serif font-black text-[#141414]">{s.value}</div>
                <div className="text-[9px] font-bold text-[#4B4B4B] uppercase tracking-widest mt-1 vietnamese-text">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Flashcard (1 unit/span 1) */}
        <div className="xl:col-span-1 bg-[#F5F0E8] border-[1px] border-[#141414] p-7 flex flex-col gap-4 transition-all duration-300 hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#141414] flex items-center gap-2">
            <span className="w-6 border-t border-[#141414]" /> Trải nghiệm
          </p>
          <DashboardFlashcard
            original={previewWord?.original || 'perseverance'}
            translation={previewWord?.translation || 'sự kiên trì'}
            pronunciation={previewWord?.pronunciation}
            srsLabel={srsLabel}
          />
          <Link
            href="/dashboard/flashcards"
            className="mt-auto flex items-center justify-center gap-2 border-[2px] border-[#141414] py-3 text-[10px] font-black uppercase tracking-widest text-[#141414] hover:bg-[#141414] hover:text-white transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            <Plus size={12} strokeWidth={2.5} /> Tạo thẻ
          </Link>
        </div>

        {/* Card 3: AI Assistant (1 unit/span 1) */}
        <div className="xl:col-span-1 bg-[#F5F0E8] border-[1px] border-[#141414] p-7 flex flex-col gap-4 transition-all duration-300 hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#141414] flex items-center gap-2">
            <span className="w-6 border-t border-[#141414]" /> AI Partner
          </p>
          <div className="w-12 h-12 bg-white border-[2px] border-[#141414] overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] flex items-center justify-center p-0">
            <img src="/ai-partner.png" alt="AI AI" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-serif font-black text-[#141414] uppercase tracking-tight">AI Partner</h3>
            <p className="text-[11px] text-[#4B4B4B] font-medium leading-relaxed line-clamp-3 vietnamese-text">Luyện nói tiếng Anh mỗi ngày để tự tin giao tiết. AI sẵn sàng 24/7.</p>
          </div>
          <Link
            href="/dashboard/ai-chat"
            className="mt-auto flex items-center justify-center gap-2 border-[2px] border-[#141414] py-3 text-[10px] font-black uppercase tracking-widest text-[#141414] hover:bg-[#141414] hover:text-white transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            Luyện nói <ArrowRight size={12} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      {/* ROW 2 - Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24 }}>
        <div className="transition-all duration-300 hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)]" style={{ background: '#F5F0E8', border: '1px solid #141414', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#141414] flex items-center gap-2">
              <span className="w-6 border-t border-[#141414]" /> Chuỗi học tập
            </p>
          </div>
          <div className="flex items-end gap-2 leading-none">
            <span className="text-7xl font-serif font-black text-[#141414]">{streak}</span>
            <div className="pb-2">
              <p className="text-[13px] font-black text-[#141414] uppercase flex items-center gap-1">ngày liên tiếp <Flame size={16} className="text-red-600" fill="currentColor" /></p>
            </div>
          </div>
          <div className="flex gap-1.5 mt-2">
            {weekDays.map((day) => (
              <div key={day.iso} className="flex-1 flex flex-col items-center gap-1 group/day">
                <div 
                  className={`relative transition-all duration-200 cursor-pointer hover:scale-110 ${
                    day.isStreakDay ? 'animate-pulse' : ''
                  }`}
                  style={{
                    width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 900, background: day.studied ? '#141414' : 'transparent',
                    color: day.studied ? '#fff' : day.isToday ? '#dc2626' : '#141414',
                    border: day.isToday ? '2px solid #dc2626' : '1px solid #141414',
                    transform: day.isStreakDay ? 'translateY(-2px)' : 'none',
                    boxShadow: day.isStreakDay
                      ? '0 0 0 2px rgba(220,38,38,0.25), 3px 3px 0px 0px rgba(20,20,20,0.15)'
                      : day.studied
                        ? '2px 2px 0px 0px rgba(20,20,20,0.15)'
                        : 'none',
                  }}
                >
                  {day.dayNum}
                  {day.studied && (
                    <span
                      className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full"
                      style={{ background: day.isStreakDay ? '#ef4444' : '#fff' }}
                    />
                  )}
                </div>
                <span style={{ fontSize: 8, color: '#4B4B4B', fontWeight: 800, textTransform: 'uppercase' }}>{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="transition-all duration-300 hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)]" style={{ background: '#F5F0E8', border: '1px solid #141414', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#141414] flex items-center gap-2">
              <span className="w-6 border-t border-[#141414]" /> Từ cần ôn tập
            </p>
          </div>
          <div className="space-y-0 divide-y divide-[#141414]/5">
            {dueWords.length > 0 ? dueWords.map((pw: any) => {
              const isDue = !pw.nextReview || pw.nextReview <= new Date()
              const timeLabel = relativeTime(pw.nextReview)
              return (
                <div key={pw.word.id} className="flex items-center justify-between py-3 hover:bg-[#141414]/5 px-2 -mx-2 transition-colors">
                  <div>
                    <p className="text-[13px] font-black text-[#141414] uppercase tracking-tight">{pw.word?.original || '—'}</p>
                    <p className="text-[12px] leading-snug text-[#4B4B4B] font-bold mt-0.5">{pw.word?.translation || '—'}</p>
                  </div>
                  {isDue ? (
                    <span className="text-[8px] font-black uppercase tracking-widest border-[2px] border-red-600 text-red-600 px-2 py-0.5 bg-white">Đến hạn</span>
                  ) : (
                    <span className="text-[8px] font-bold text-[#4B4B4B] uppercase">{timeLabel}</span>
                  )}
                </div>
              )
            }) : (
              <div className="py-10 text-center">
                <p className="text-[11px] text-[#4B4B4B] font-black uppercase tracking-widest">Tuyệt vời! Không có từ nào cần ôn 🎉</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
