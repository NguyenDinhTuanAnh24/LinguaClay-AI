import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import MasteryDetails from '@/components/dashboard/MasteryDetails'

// ---- Helpers ----
const toVNDate = (d: Date) =>
  new Date(d.getTime() + 7 * 3600_000).toISOString().split('T')[0]

// SVG Donut Chart — thuần SVG
function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[]
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const r = 58
  const cx = 70
  const cy = 70
  const circumference = 2 * Math.PI * r

  let offset = 0
  const arcs = segments.map(seg => {
    const pct   = total > 0 ? seg.value / total : 0
    const dash  = pct * circumference
    const arc   = { ...seg, dash, gap: circumference - dash, offset, pct }
    offset += dash
    return arc
  })

  return (
    <svg viewBox="0 0 140 140" className="w-full max-w-[200px] mx-auto scale-110">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0ebe4" strokeWidth={18} />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth={18}
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeDashoffset={-arc.offset + circumference * 0.25}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      ))}
      <text x={cx} y={cy - 8} textAnchor="middle" className="font-bold" fontSize={22} fontWeight={800} fill="#3D3027">
        {total}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={9} fontWeight={700} fill="#9b8ea0" letterSpacing={1}>
        TỪ ĐÃ HỌC
      </text>
    </svg>
  )
}

// SVG Arc Gauge — tối ưu spacing
function GaugeChart({ pct }: { pct: number }) {
  const r = 52
  const cx = 70
  const cy = 72
  const startAngle = -Math.PI               
  const endAngle   = 0                      
  const arcLength  = Math.PI * r            
  const filled     = (pct / 100) * arcLength

  const polarToXY = (angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  })

  const start = polarToXY(startAngle)
  const end   = polarToXY(endAngle)
  const pctEnd = polarToXY(startAngle + (pct / 100) * Math.PI)

  return (
    <svg viewBox="0 0 140 110" className="w-full max-w-[220px] mx-auto">
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
        fill="none" stroke="#f0ebe4" strokeWidth={16} strokeLinecap="round"
      />
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${pct > 50 ? 1 : 0} 1 ${pctEnd.x} ${pctEnd.y}`}
        fill="none"
        stroke={pct >= 85 ? '#A8D5BA' : pct >= 50 ? '#F4A460' : '#f87171'}
        strokeWidth={16}
        strokeLinecap="round"
        className="transition-all duration-1000 shadow-lg"
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={26} fontWeight={900} fill="#3D3027">
        {pct}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={8} fontWeight={700} fill="#9b8ea0" letterSpacing={1}>
        RETENTION
      </text>
      {/* Ticks — moved down and positioned correctly */}
      <text x={start.x} y={cy + 22} textAnchor="middle" fontSize={9} fill="#c5b8bc" fontWeight={800}>0%</text>
      <text x={end.x} y={cy + 22} textAnchor="middle" fontSize={9} fill="#c5b8bc" fontWeight={800}>100%</text>
    </svg>
  )
}


// Bar Chart — Split New vs Review
function BarChart({ days }: { days: { date: string; new: number; review: number }[] }) {
  const max = Math.max(...days.map(d => d.new + d.review), 1)
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

  return (
    <div className="flex items-end gap-3 h-32 w-full px-2">
      {days.map((day, i) => {
        const total = day.new + day.review
        const heightPct = (total / max) * 100
        const newPct = total > 0 ? (day.new / total) * 100 : 0
        const revPct = total > 0 ? (day.review / total) * 100 : 0
        
        const d = new Date(day.date + 'T00:00:00')
        const dayLabel = dayNames[d.getDay()]
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
            <div className="flex-1 w-full flex flex-col justify-end items-center relative group">
              {total > 0 && (
                <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-clay-deep text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg z-10 whitespace-nowrap">
                  N: {day.new} | R: {day.review}
                </div>
              )}
              <div 
                className="w-full rounded-t-[10px] rounded-b-[4px] overflow-hidden flex flex-col shadow-clay-card transition-all duration-700"
                style={{ height: `${Math.max(heightPct, total > 0 ? 8 : 4)}%` }}
              >
                {/* Review part (Top) */}
                <div className="bg-clay-blue/70 w-full" style={{ height: `${revPct}%` }} title="Ôn tập" />
                {/* New part (Bottom) */}
                <div className="bg-clay-orange w-full flex-1" title="Từ mới" />
              </div>
            </div>
            <span className="text-[10px] font-black text-clay-muted">{dayLabel}</span>
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
  const allProgress = await prisma.userProgress.findMany({
    where: { userId },
    include: { word: true },
    orderBy: { lastReviewed: 'desc' },
  })

  // ---- 2. Retention Rate logic (Nhớ được / Tổng tương tác) ----
  const studiedWords = allProgress.length
  // Nhớ được = từ có mastery > 0. Quên = từ mastery = 0 sau khi học.
  const rememberedWords = allProgress.filter(p => p.masteryLevel > 0).length
  const retentionRate   = studiedWords > 0 ? Math.round((rememberedWords / studiedWords) * 100) : 0

  // ---- 3. Velocity Logic (New vs Review) ----
  const days7Ago = new Date(now.getTime() - 7 * 86_400_000)
  const recentActivity = allProgress.filter(p => p.lastReviewed && p.lastReviewed >= days7Ago)

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d   = new Date(now.getTime() - (6 - i) * 86_400_000)
    const key = toVNDate(d)
    const dayActs = recentActivity.filter(p => p.lastReviewed && toVNDate(p.lastReviewed) === key)
    
    // New if learned today (lastReviewed day == createdAt day)
    const newCount = dayActs.filter(p => toVNDate((p as any).createdAt) === key).length
    const revCount = dayActs.length - newCount
    
    return { date: key, new: newCount, review: revCount }
  })
  const totalThisWeek = last7Days.reduce((s, d) => s + d.new + d.review, 0)

  // ---- 4. Streak ----
  const uniqueDays = [...new Set(allProgress.filter(p => p.lastReviewed).map(p => toVNDate(p.lastReviewed!)))].sort((a,b)=>b.localeCompare(a))
  let streak = 0
  if (uniqueDays.length > 0) {
    const todayVN  = toVNDate(now)
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

  // ---- 5. Buckets for MasteryDetails ----
  const MASTERY_COLORS = ['#e8e0d8', '#fde68a', '#fed7aa', '#fca5a5', '#A8D5BA', '#6EE7B7']
  const MASTERY_LABELS = ['Chưa thuộc / Cần học lại', 'Mới học', 'Đang học', 'Khá thuộc', 'Gần thuộc', '✨ Thuộc lòng']
  const INTERVAL_LABELS = ['—', '2 ngày', '4 ngày', '8 ngày', '16 ngày', '32 ngày']
  const BUCKET_BG = ['bg-soft-gray/30', 'bg-yellow-50', 'bg-orange-50', 'bg-red-50', 'bg-emerald-50', 'bg-green-50']

  const buckets = [0, 1, 2, 3, 4, 5].map(level => {
    const levelWords = allProgress.filter(p => p.masteryLevel === level)
    return {
      level,
      label: MASTERY_LABELS[level],
      interval: INTERVAL_LABELS[level],
      color: BUCKET_BG[level],
      bar: MASTERY_COLORS[level],
      count: levelWords.length,
      pct: studiedWords > 0 ? Math.round(levelWords.length / studiedWords * 100) : 0,
      words: levelWords.map(p => ({
        id: p.id,
        original: p.word.original,
        translation: p.word.translation,
        masteryLevel: p.masteryLevel
      }))
    }
  })

  const donutSegments = buckets.filter(b => b.count > 0).map(b => ({
    label: b.label,
    value: b.count,
    color: b.bar
  }))

  const dueNow = allProgress.filter(p => p.nextReview && p.nextReview <= now && p.masteryLevel < 5).length
  const masteredCount = allProgress.filter(p => p.masteryLevel >= 4).length

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-heading font-black text-clay-deep uppercase tracking-tight">Tiến độ SRS</h1>
          <p className="text-clay-muted text-sm font-medium">Báo cáo học tập dựa trên bộ nhớ dài hạn.</p>
        </div>
        <Link href="/dashboard" className="px-6 py-2 bg-white rounded-full shadow-clay-button text-clay-muted text-xs font-black hover:shadow-clay-button-hover transition-all border-2 border-white">
          ← DASHBOARD
        </Link>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'TỔNG TỪ ĐÃ HỌC', value: studiedWords, unit: 'từ', icon: '📚', color: 'text-clay-blue' },
          { label: 'ĐÃ THUỘC LÒNG', value: masteredCount, unit: 'từ', icon: '💎', color: 'text-clay-green' },
          { label: 'CHUỖI HỌC TẬP', value: streak, unit: 'ngày', icon: '🔥', color: 'text-clay-orange' },
          { label: 'CẦN ÔN TẬP', value: dueNow, unit: 'từ', icon: '⏳', color: 'text-clay-pink' },
        ].map(stat => (
          <div key={stat.label} className="bg-white/70 backdrop-blur rounded-[35px] shadow-clay-card border-4 border-white p-6 flex flex-col gap-1 hover:scale-[1.03] transition-transform">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black text-clay-muted tracking-widest">{stat.label}</span>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className={`text-4xl font-heading font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-clay-muted font-bold ml-1">{stat.unit}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MASTERY DONUT */}
        <div className="bg-white/70 rounded-[40px] shadow-clay-card border-4 border-white p-8 flex flex-col items-center gap-8 h-fit">
           <div className="text-center">
             <h2 className="text-lg font-heading font-black text-clay-deep">Phân bổ Mastery</h2>
             <p className="text-[10px] text-clay-muted font-bold uppercase tracking-widest">Memory Distribution</p>
           </div>
           <DonutChart segments={donutSegments.length > 0 ? donutSegments : [{ label: 'Empty', value: 1, color: '#f0ebe4' }]} />
           <div className="w-full space-y-2">
             {buckets.filter(b => b.count > 0).map(b => (
               <div key={b.level} className="flex items-center justify-between group cursor-help">
                 <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: b.bar }} />
                   <span className="text-[10px] font-black text-clay-muted group-hover:text-clay-deep transition-colors">{b.label}</span>
                 </div>
                 <span className="text-[11px] font-black">{b.count} ({b.pct}%)</span>
               </div>
             ))}
           </div>
        </div>

        {/* RETENTION ARC + VELOCITY BARS */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-white/70 rounded-[40px] shadow-clay-card border-4 border-white p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left space-y-6">
              <div>
                <h2 className="text-xl font-heading font-black text-clay-deep">Tỷ lệ Retention</h2>
                <p className="text-xs text-clay-muted font-medium mt-1 italic">Khả năng ghi nhớ dựa trên số lần ôn tập thành công.</p>
              </div>
              <GaugeChart pct={retentionRate} />
            </div>
            <div className="w-full md:w-48 grid grid-cols-1 gap-4">
              <div className="bg-clay-blue/10 border-2 border-white rounded-[25px] p-5 text-center shadow-clay-button">
                <div className="text-3xl font-black text-clay-blue">{rememberedWords}</div>
                <div className="text-[10px] font-black text-clay-muted uppercase tracking-widest leading-none mt-1">ĐÃ GHI NHỚ</div>
              </div>
              <div className="bg-clay-orange/10 border-2 border-white rounded-[25px] p-5 text-center shadow-clay-button">
                <div className="text-3xl font-black text-clay-orange">{studiedWords - rememberedWords}</div>
                <div className="text-[10px] font-black text-clay-muted uppercase tracking-widest leading-none mt-1">BỊ LÃNG QUÊN</div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 rounded-[40px] shadow-clay-card border-4 border-white p-8 space-y-6">
             <div className="flex justify-between items-start">
               <div>
                 <h2 className="text-xl font-heading font-black text-clay-deep">Tốc độ học (7 ngày)</h2>
                 <p className="text-xs text-clay-muted font-medium mt-1">Cân bằng giữa học từ mới và ôn lại kiến thức.</p>
               </div>
               <div className="flex gap-4">
                 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-clay-orange rounded-full" /><span className="text-[9px] font-black text-clay-muted uppercase">MỚI</span></div>
                 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-clay-blue/70 rounded-full" /><span className="text-[9px] font-black text-clay-muted uppercase">ÔN LẠI</span></div>
               </div>
             </div>
             <div className="pt-4">
               <BarChart days={last7Days} />
             </div>
          </div>
        </div>
      </div>


      {/* MASTERY DETAILS TABLE (CLIENT COMPONENT) */}
      <MasteryDetails buckets={buckets} />
    </div>
  )
}
