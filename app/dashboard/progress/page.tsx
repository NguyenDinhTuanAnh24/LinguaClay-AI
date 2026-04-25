import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { formatVNTime } from '@/utils/timezone'
import { MS_PER_DAY } from '@/lib/constants'
import MasteryDetails from '@/components/dashboard/MasteryDetails'
import ProgressSectionTabs from '@/components/dashboard/ProgressSectionTabs'
import { 
  BookOpen, 
  Gem, 
  Flame, 
  Clock, 
  Activity,
  History,
  TrendingUp,
  Brain
} from 'lucide-react'

// ---- Helpers ----
const toVNDate = (d: Date) => formatVNTime(d, 'yyyy-MM-dd')

// SVG Donut Chart — Brutalist Version
function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[]
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const r = 52
  const cx = 70
  const cy = 70
  const circumference = 2 * Math.PI * r

  const arcs = segments.reduce<
    { label: string; value: number; color: string; dash: number; gap: number; offset: number; pct: number }[]
  >((acc, seg) => {
    const pct = total > 0 ? seg.value / total : 0
    const dash = pct * circumference
    const currentOffset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0
    acc.push({ ...seg, dash, gap: circumference - dash, offset: currentOffset, pct })
    return acc
  }, [])

  return (
    <svg viewBox="0 0 140 140" className="w-full max-w-[200px] mx-auto scale-110">
      <circle cx={cx} cy={cy} r={r + 6} fill="#F5F0E8" stroke="#141414" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={14} />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth={14}
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeDashoffset={-arc.offset + circumference * 0.25}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" className="font-serif font-black" fontSize={24} fill="#141414">
        {total}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" className="font-sans font-black" fontSize={7} fill="#4B4B4B" letterSpacing={1.5}>
        TỪ ĐÃ HỌC
      </text>
    </svg>
  )
}

// SVG Arc Gauge — Brutalist Version
function GaugeChart({ pct }: { pct: number }) {
  const r = 50
  const cx = 70
  const cy = 75
  const startAngle = -Math.PI               
  const endAngle   = 0                      
  const polarToXY = (angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  })

  const start = polarToXY(startAngle)
  const end   = polarToXY(endAngle)
  const pctEnd = polarToXY(startAngle + (pct / 100) * Math.PI)

  return (
    <svg viewBox="0 0 140 100" className="w-full max-w-[220px] mx-auto">
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
        fill="none" stroke="#E5E7EB" strokeWidth={14}
      />
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${pct > 50 ? 1 : 0} 1 ${pctEnd.x} ${pctEnd.y}`}
        fill="none"
        stroke={pct >= 85 ? '#16a34a' : pct >= 50 ? '#dc2626' : '#2563eb'}
        strokeWidth={14}
        className="transition-all duration-1000"
      />
      {/* Outer Border */}
      <path
        d={`M ${start.x - 7} ${start.y} A ${r + 7} ${r + 7} 0 0 1 ${end.x + 7} ${end.y}`}
        fill="none" stroke="#141414" strokeWidth={1.5}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" className="font-serif font-black" fontSize={28} fill="#141414">
        {pct}%
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" className="font-sans font-black" fontSize={7} fill="#4B4B4B" letterSpacing={1.5}>
        RETENTION
      </text>
    </svg>
  )
}


// Bar Chart — Brutalist Version
function BarChart({ days }: { days: { date: string; new: number; review: number }[] }) {
  const max = Math.max(...days.map(d => d.new + d.review), 1)
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

  return (
    <div className="flex items-end gap-3 h-32 w-full px-2">
      {days.map((day, i) => {
        const total = day.new + day.review
        const heightPct = (total / max) * 100
        const revPct = total > 0 ? (day.review / total) * 100 : 0
        
        const d = new Date(day.date + 'T00:00:00')
        const dayLabel = dayNames[d.getDay()]
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full">
            <div className="flex-1 w-full flex flex-col justify-end items-center relative group">
              <div 
                className="w-full border border-[#141414] overflow-hidden flex flex-col transition-all duration-700 group-hover:-translate-y-0.5"
                style={{ height: `${Math.max(heightPct, total > 0 ? 10 : 2)}%` }}
              >
                {/* Review part (Top) */}
                <div className="bg-red-600 w-full" style={{ height: `${revPct}%` }} title="Ôn tập" />
                {/* New part (Bottom) */}
                <div className="bg-[#141414] w-full flex-1" title="Từ mới" />
              </div>
            </div>
            <span className="text-[10px] font-sans font-black text-[#141414] uppercase tracking-tighter">{dayLabel}</span>
          </div>
        )
      })}
    </div>
  )
}

// ================================================================
// PAGE COMPONENT
// ================================================================
export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || ''
  const now    = new Date()

  // ---- 1. Fetch data with word info ----
  // ---- 1. Fetch data with word info and tutor stats ----
  const [
    allProgress,
    tutorListeningSessions,
    tutorReadingSessions,
    tutorSpeakingSessions,
    tutorEditorSessions,
  ] = await Promise.all([
    prisma.userProgress.findMany({
      where: { userId },
      include: { word: true },
      orderBy: { lastReviewed: 'desc' },
    }),
    prisma.tutorListeningSession.findMany({ where: { userId }, select: { createdAt: true } }),
    prisma.tutorReadingSession.findMany({ where: { userId }, select: { createdAt: true } }),
    prisma.tutorSpeakingSession.findMany({ where: { userId }, select: { createdAt: true } }),
    prisma.tutorEditorSession.findMany({ where: { userId }, select: { createdAt: true } }),
  ])

  const tutorListeningCount = tutorListeningSessions.length
  const tutorReadingCount = tutorReadingSessions.length
  const tutorSpeakingCount = tutorSpeakingSessions.length
  const tutorWritingCount = tutorEditorSessions.length

  // ---- 2. Retention Rate logic ----
  const studiedWords = allProgress.length
  const rememberedWords = allProgress.filter(p => p.masteryLevel > 0).length
  const retentionRate   = studiedWords > 0 ? Math.round((rememberedWords / studiedWords) * 100) : 0

  // ---- 3. Velocity Logic ----
  const days7Ago = new Date(now.getTime() - 7 * MS_PER_DAY)
  const recentActivity = allProgress.filter(p => p.lastReviewed && p.lastReviewed >= days7Ago)

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d   = new Date(now.getTime() - (6 - i) * MS_PER_DAY)
    const key = toVNDate(d)
    const dayActs = recentActivity.filter(p => p.lastReviewed && toVNDate(p.lastReviewed) === key)
    
    // New if learned today
    const newCount = dayActs.filter(p => toVNDate(p.createdAt) === key).length
    const revCount = dayActs.length - newCount
    
    return { date: key, new: newCount, review: revCount }
  })
  const activeDaysCount = last7Days.filter(day => day.new + day.review > 0).length
  const hasEnoughWeeklyData = activeDaysCount >= 2

  // ---- 4. Streak ----
  const allDates = [
    ...allProgress.filter(p => p.lastReviewed).map(p => p.lastReviewed!),
    ...tutorListeningSessions.map(p => p.createdAt),
    ...tutorReadingSessions.map(p => p.createdAt),
    ...tutorSpeakingSessions.map(p => p.createdAt),
    ...tutorEditorSessions.map(p => p.createdAt),
  ]
  const uniqueDays = [...new Set(allDates.map(p => toVNDate(p)))].sort((a,b)=>b.localeCompare(a))
  let streak = 0
  if (uniqueDays.length > 0) {
    const todayVN  = toVNDate(now)
    if (new Date(todayVN).getTime() - new Date(uniqueDays[0]).getTime() <= MS_PER_DAY) {
      streak = 1
      for (let i = 1; i < uniqueDays.length; i++) {
        const diff = new Date(uniqueDays[i - 1]).getTime() - new Date(uniqueDays[i]).getTime()
        if (diff <= MS_PER_DAY + 1) streak++ 
        else break
      }
    }
  }

  // ---- 5. Buckets for MasteryDetails ----
  const MASTERY_COLORS = ['#E5E7EB', '#60a5fa', '#3b82f6', '#2563eb', '#16a34a', '#141414']
  const MASTERY_LABELS = ['CẦN HỌC LẠI', 'MỚI HỌC', 'ĐANG HỌC', 'KHÁ THUỘC', 'GẦN THUỘC', 'THUỘC LÒNG']
  const INTERVAL_LABELS = ['—', '2 NGÀY', '4 NGÀY', '8 NGÀY', '16 NGÀY', '32 NGÀY']

  const buckets = [0, 1, 2, 3, 4, 5].map(level => {
    const levelWords = allProgress.filter(p => p.masteryLevel === level)
    return {
      level,
      label: MASTERY_LABELS[level],
      interval: INTERVAL_LABELS[level],
      color: 'bg-white',
      bar: MASTERY_COLORS[level],
      count: levelWords.length,
      pct: studiedWords > 0 ? Math.round(levelWords.length / studiedWords * 100) : 0,
      words: levelWords.map(p => ({
        id: p.id,
        original: p.word.original,
        translation: p.word.translation,
        masteryLevel: p.masteryLevel,
        nextReview: p.nextReview,
        lastReviewed: p.lastReviewed,
        reviewCountEstimate: p.lastReviewed ? Math.max(1, p.masteryLevel) : 0,
      }))
    }
  })

  const masteryOverview = [
    { key: 'new', label: 'MỚI HỌC', value: buckets[1].count, color: '#3b82f6' },
    { key: 'learning', label: 'ĐANG HỌC', value: buckets[2].count, color: '#14b8a6' },
    { key: 'almost', label: 'KHÁ THUỘC', value: buckets[3].count + buckets[4].count, color: '#f59e0b' },
    { key: 'mastered', label: 'THUỘC LÒNG', value: buckets[5].count, color: '#141414' },
  ]
  const donutSegments = masteryOverview.filter(segment => segment.value > 0)

  const dueNow = allProgress.filter(p => p.nextReview && p.nextReview <= now && p.masteryLevel < 5).length
  const masteredCount = allProgress.filter(p => p.masteryLevel >= 4).length

  return (
    <div className="w-full space-y-8 pb-16">
      <div
        className="group transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(220,38,38,0.2)]"
        style={{
          background: '#EDE8DF',
          borderLeft: '4px solid #dc2626',
          borderTop: '1px solid #141414',
          borderRight: '1px solid #141414',
          borderBottom: '1px solid #141414',
          padding: '24px 36px',
        }}
      >
        <div className="space-y-2 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">Báo cáo tiến độ</p>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-[#141414] leading-tight vietnamese-text">
            Toàn cảnh ghi nhớ theo <span className="italic underline underline-offset-4 decoration-2 decoration-red-600">SRS</span>
          </h1>
          <p className="text-[10px] text-[#4B4B4B] font-semibold uppercase tracking-widest vietnamese-text">
            REPORT • {toVNDate(now).toUpperCase()}
          </p>
        </div>
      </div>
      <ProgressSectionTabs />

      {/* TOP STATS */}
      <div id="overview-section" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 scroll-mt-28">
        {[
          { label: 'TỔNG TỪ ĐÃ HỌC', value: studiedWords, unit: 'WORDS', Icon: BookOpen, color: 'text-[#141414]' },
          { label: 'ĐÃ THUỘC LÒNG', value: masteredCount, unit: 'MASTERED', Icon: Gem, color: 'text-green-600' },
          { label: 'CHUỖI HỌC TẬP', value: streak, unit: 'STREAK DAYS', Icon: Flame, color: 'text-red-600' },
          { label: 'CẦN ÔN TẬP', value: dueNow, unit: 'DUE NOW', Icon: Clock, color: 'text-blue-600' },
        ].map(stat => (
          <div
            key={stat.label}
            className="bg-[#F5F0E8] border border-[#141414] p-6 flex flex-col gap-2 transition-all duration-300 hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-black text-[#4B4B4B] tracking-[0.15em] uppercase">{stat.label}</span>
              <div className="w-10 h-10 bg-white border border-[#141414] flex items-center justify-center transition-transform group-hover:rotate-6">
                <stat.Icon size={18} strokeWidth={3} className={stat.color} />
              </div>
            </div>
            <div className={`text-5xl font-serif font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-[9px] font-sans font-black text-[#4B4B4B] uppercase tracking-widest">{stat.unit}</div>
            {stat.label === 'CHUỖI HỌC TẬP' && stat.value === 0 ? (
              <p className="text-[10px] font-bold text-[#4B4B4B] vietnamese-text mt-1">Bắt đầu chuỗi hôm nay nhé!</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MASTERY DONUT */}
        <div className="bg-[#F5F0E8] border border-[#141414] p-8 flex flex-col items-center gap-8 h-fit transition-all duration-300 hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1">
           <div className="text-center border-b border-[#141414]/15 pb-4 w-full">
             <h2 className="text-xl font-serif font-black text-[#141414] uppercase">Phân bổ Mastery</h2>
             <p className="text-[9px] font-sans font-black text-[#4B4B4B] uppercase tracking-widest mt-1 opacity-70">MEMORY DISTRIBUTION</p>
           </div>
           
           <DonutChart segments={donutSegments.length > 0 ? donutSegments : [{ label: 'Empty', value: 1, color: '#E5E7EB' }]} />
           
           <div className="w-full space-y-3 pt-4 border-t border-[#141414]/10">
             {masteryOverview.map((segment) => (
               <div key={segment.key} className="flex items-center justify-between group">
                 <div className="flex items-center gap-3">
                   <div className="w-3 h-3 border border-[#141414] shadow-sm" style={{ background: segment.color }} />
                   <span className="text-[10px] font-sans font-black text-[#141414] uppercase tracking-tight group-hover:text-red-600 transition-colors">
                     {segment.label}
                   </span>
                 </div>
                 <span className="text-[10px] font-sans font-black bg-white px-2 py-0.5 border border-[#141414]">{segment.value}</span>
               </div>
             ))}
           </div>
        </div>

        {/* RETENTION ARC + VELOCITY BARS */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-[#F5F0E8] border border-[#141414] p-8 flex flex-col md:flex-row items-center gap-10 transition-all duration-300 hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1">
            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Activity size={24} strokeWidth={3} className="text-red-600" />
                  <h2 className="text-2xl font-serif font-black text-[#141414] uppercase leading-none">Retention Rate</h2>
                </div>
                <p className="text-[11px] font-sans font-bold text-[#4B4B4B] uppercase tracking-tighter italic pl-9">Khả năng ghi nhớ dựa trên thuật toán SRS.</p>
              </div>
              <GaugeChart pct={retentionRate} />
            </div>
            
            <div className="w-full md:w-56 flex flex-col gap-5">
              <div className="bg-white border border-[#141414] p-5 text-center group relative overflow-hidden transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,0.2)]">
                <div className="absolute top-0 right-0 p-1 opacity-5"><Brain size={40} /></div>
                <div className="text-4xl font-serif font-black text-[#141414] relative z-10">{rememberedWords}</div>
                <div className="text-[9px] font-sans font-black text-[#4B4B4B] uppercase tracking-widest mt-1 relative z-10">TỪ CÒN NHỚ</div>
              </div>
              <div className="bg-[#141414] border border-[#141414] p-5 text-center transition-all duration-300 hover:bg-red-600 hover:border-red-600">
                <div className="text-4xl font-serif font-black text-white">{studiedWords - rememberedWords}</div>
                <div className="text-[9px] font-sans font-black text-white/60 uppercase tracking-widest mt-1">BỊ LÃNG QUÊN</div>
              </div>
            </div>
          </div>

          <div className="bg-[#F5F0E8] border border-[#141414] p-8 space-y-8 relative overflow-hidden transition-all duration-300 hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#141414]/15 pb-6">
               <div className="space-y-1">
                 <div className="flex items-center gap-3">
                   <TrendingUp size={24} strokeWidth={3} className="text-[#141414]" />
                   <h2 className="text-2xl font-serif font-black text-[#141414] uppercase leading-none">Hoạt động tuần</h2>
                 </div>
                 <p className="text-[11px] font-sans font-bold text-[#4B4B4B] uppercase tracking-widest pl-9">NEW VS REVIEW FREQUENCY</p>
               </div>
               <div className="flex gap-6 pl-9 md:pl-0">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#141414] border border-white" /><span className="text-[9px] font-sans font-black text-[#141414] uppercase tracking-widest">MỚI</span></div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-600 border border-white" /><span className="text-[9px] font-sans font-black text-[#141414] uppercase tracking-widest">ÔN LẠI</span></div>
               </div>
             </div>
             
             <div className="pt-2">
               {hasEnoughWeeklyData ? (
                 <BarChart days={last7Days} />
               ) : (
                 <div className="h-32 border border-dashed border-[#141414]/30 bg-white/60 flex items-center justify-center px-6">
                   <p className="text-[11px] font-bold text-[#4B4B4B] uppercase tracking-[0.08em] text-center">
                     Chưa đủ dữ liệu để hiển thị xu hướng
                   </p>
                 </div>
               )}
             </div>

             <div className="absolute bottom-0 right-0 opacity-[0.02] pointer-events-none pr-8 pb-8">
               <History size={120} strokeWidth={3} />
             </div>
          </div>
        </div>
      </div>

      {/* AI TUTOR STATS */}
      <div className="bg-[#F5F0E8] border border-[#141414] p-8 space-y-6 transition-all duration-300 hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1">
        <div className="flex items-center gap-3 border-b border-[#141414]/15 pb-4">
          <Brain size={24} strokeWidth={3} className="text-[#141414]" />
          <h2 className="text-2xl font-serif font-black text-[#141414] uppercase leading-none">Hoạt động AI Tutor</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#141414] p-5 text-center transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <div className="text-3xl font-serif font-black text-[#141414]">{tutorListeningCount}</div>
            <div className="text-[10px] font-sans font-black text-[#4B4B4B] uppercase tracking-widest mt-2">BÀI NGHE</div>
          </div>
          <div className="bg-white border border-[#141414] p-5 text-center transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <div className="text-3xl font-serif font-black text-[#141414]">{tutorSpeakingCount}</div>
            <div className="text-[10px] font-sans font-black text-[#4B4B4B] uppercase tracking-widest mt-2">BÀI NÓI</div>
          </div>
          <div className="bg-white border border-[#141414] p-5 text-center transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <div className="text-3xl font-serif font-black text-[#141414]">{tutorReadingCount}</div>
            <div className="text-[10px] font-sans font-black text-[#4B4B4B] uppercase tracking-widest mt-2">BÀI ĐỌC</div>
          </div>
          <div className="bg-white border border-[#141414] p-5 text-center transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <div className="text-3xl font-serif font-black text-[#141414]">{tutorWritingCount}</div>
            <div className="text-[10px] font-sans font-black text-[#4B4B4B] uppercase tracking-widest mt-2">BÀI VIẾT</div>
          </div>
        </div>
      </div>


      {/* MASTERY DETAILS TABLE */}
      <section id="srs-details" className="scroll-mt-28">
        <MasteryDetails buckets={buckets} />
      </section>
    </div>
  )
}
