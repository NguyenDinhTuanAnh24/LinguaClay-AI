import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import MasteryDetails from '@/components/dashboard/MasteryDetails'
import { 
  BookOpen, 
  Gem, 
  Flame, 
  Clock, 
  ArrowLeft,
  Activity,
  History,
  TrendingUp,
  Brain
} from 'lucide-react'

// ---- Helpers ----
const toVNDate = (d: Date) =>
  new Date(d.getTime() + 7 * 3600_000).toISOString().split('T')[0]

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
      <circle cx={cx} cy={cy} r={r + 6} fill="white" stroke="#141414" strokeWidth={3} />
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
      <text x={cx} y={cy + 10} textAnchor="middle" className="font-sans font-black" fontSize={7} fill="#6B7280" letterSpacing={1.5}>
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
        fill="none" stroke="#141414" strokeWidth={2}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" className="font-serif font-black" fontSize={28} fill="#141414">
        {pct}%
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" className="font-sans font-black" fontSize={7} fill="#6B7280" letterSpacing={1.5}>
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
        const newPct = total > 0 ? (day.new / total) * 100 : 0
        const revPct = total > 0 ? (day.review / total) * 100 : 0
        
        const d = new Date(day.date + 'T00:00:00')
        const dayLabel = dayNames[d.getDay()]
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full">
            <div className="flex-1 w-full flex flex-col justify-end items-center relative group">
              <div 
                className="w-full border-[2px] border-newsprint-black overflow-hidden flex flex-col transition-all duration-700 shadow-brutalist-soft"
                style={{ height: `${Math.max(heightPct, total > 0 ? 10 : 2)}%` }}
              >
                {/* Review part (Top) */}
                <div className="bg-red-600 w-full" style={{ height: `${revPct}%` }} title="Ôn tập" />
                {/* New part (Bottom) */}
                <div className="bg-newsprint-black w-full flex-1" title="Từ mới" />
              </div>
            </div>
            <span className="text-[10px] font-sans font-black text-newsprint-black uppercase tracking-tighter">{dayLabel}</span>
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

  // ---- 2. Retention Rate logic ----
  const studiedWords = allProgress.length
  const rememberedWords = allProgress.filter(p => p.masteryLevel > 0).length
  const retentionRate   = studiedWords > 0 ? Math.round((rememberedWords / studiedWords) * 100) : 0

  // ---- 3. Velocity Logic ----
  const days7Ago = new Date(now.getTime() - 7 * 86_400_000)
  const recentActivity = allProgress.filter(p => p.lastReviewed && p.lastReviewed >= days7Ago)

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d   = new Date(now.getTime() - (6 - i) * 86_400_000)
    const key = toVNDate(d)
    const dayActs = recentActivity.filter(p => p.lastReviewed && toVNDate(p.lastReviewed) === key)
    
    // New if learned today
    const newCount = dayActs.filter(p => toVNDate((p as any).createdAt) === key).length
    const revCount = dayActs.length - newCount
    
    return { date: key, new: newCount, review: revCount }
  })

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
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 border-[2px] border-newsprint-black bg-newsprint-paper px-3 py-1 font-sans font-black text-[9px] uppercase tracking-widest">
            REPORT • {toVNDate(now).toUpperCase()}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-newsprint-black uppercase tracking-tighter">Báo cáo <span className="text-red-600 italic">Progress</span></h1>
          <p className="text-newsprint-gray-dark text-xs font-sans font-bold uppercase tracking-widest opacity-60">Phân tích khả năng ghi nhớ dài hạn (SRS Analytics).</p>
        </div>
        <Link href="/dashboard" className="px-8 py-4 bg-newsprint-black text-white font-sans font-black text-[10px] border-[3px] border-newsprint-black shadow-brutalist-soft hover:bg-white hover:text-newsprint-black active:translate-y-1 transition-all flex items-center gap-2 uppercase tracking-widest">
          <ArrowLeft size={16} strokeWidth={3} /> DASHBOARD
        </Link>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'TỔNG TỪ ĐÃ HỌC', value: studiedWords, unit: 'WORDS', Icon: BookOpen, color: 'text-newsprint-black' },
          { label: 'ĐÃ THUỘC LÒNG', value: masteredCount, unit: 'MASTERED', Icon: Gem, color: 'text-green-600' },
          { label: 'CHUỖI HỌC TẬP', value: streak, unit: 'STREAK DAYS', Icon: Flame, color: 'text-red-600' },
          { label: 'CẦN ÔN TẬP', value: dueNow, unit: 'DUE NOW', Icon: Clock, color: 'text-blue-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border-[3px] border-newsprint-black shadow-brutalist-card p-6 flex flex-col gap-2 hover:-translate-y-1 transition-all group active:shadow-none active:translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-black text-newsprint-gray-dark tracking-[0.15em] uppercase">{stat.label}</span>
              <div className="w-10 h-10 bg-newsprint-paper border-[2px] border-newsprint-black flex items-center justify-center shadow-brutalist-soft group-hover:rotate-6 transition-transform">
                <stat.Icon size={18} strokeWidth={3} className={stat.color} />
              </div>
            </div>
            <div className={`text-5xl font-serif font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-[9px] font-sans font-black text-newsprint-gray uppercase tracking-widest">{stat.unit}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MASTERY DONUT */}
        <div className="bg-white border-[3px] border-newsprint-black shadow-brutalist-card p-8 flex flex-col items-center gap-8 h-fit">
           <div className="text-center border-b-[2px] border-newsprint-black pb-4 w-full">
             <h2 className="text-xl font-serif font-black text-newsprint-black uppercase">Phân bổ Mastery</h2>
             <p className="text-[9px] font-sans font-black text-newsprint-gray-dark uppercase tracking-widest mt-1 opacity-60">MEMORY DISTRIBUTION</p>
           </div>
           
           <DonutChart segments={donutSegments.length > 0 ? donutSegments : [{ label: 'Empty', value: 1, color: '#E5E7EB' }]} />
           
           <div className="w-full space-y-3 pt-4 border-t-[2px] border-newsprint-black/10">
             {buckets.filter(b => b.count > 0).map(b => (
               <div key={b.level} className="flex items-center justify-between group">
                 <div className="flex items-center gap-3">
                   <div className="w-3 h-3 border-[2px] border-newsprint-black shadow-sm" style={{ background: b.bar }} />
                   <span className="text-[10px] font-sans font-black text-newsprint-black uppercase tracking-tight group-hover:text-red-600 transition-colors">{b.label}</span>
                 </div>
                 <span className="text-[10px] font-sans font-black bg-newsprint-paper px-2 py-0.5 border-[1.5px] border-newsprint-black">{b.count}</span>
               </div>
             ))}
           </div>
        </div>

        {/* RETENTION ARC + VELOCITY BARS */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-white border-[3px] border-newsprint-black shadow-brutalist-card p-8 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Activity size={24} strokeWidth={3} className="text-red-600" />
                  <h2 className="text-2xl font-serif font-black text-newsprint-black uppercase leading-none">Retention Rate</h2>
                </div>
                <p className="text-[11px] font-sans font-bold text-newsprint-gray-dark uppercase tracking-tighter italic pl-9">Khả năng ghi nhớ dựa trên thuật toán SRS.</p>
              </div>
              <GaugeChart pct={retentionRate} />
            </div>
            
            <div className="w-full md:w-56 flex flex-col gap-5">
              <div className="bg-newsprint-paper border-[3px] border-newsprint-black p-5 text-center shadow-brutalist-soft group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1 opacity-5"><Brain size={40} /></div>
                <div className="text-4xl font-serif font-black text-newsprint-black relative z-10">{rememberedWords}</div>
                <div className="text-[9px] font-sans font-black text-newsprint-gray-dark uppercase tracking-widest mt-1 relative z-10">TỪ CÒN NHỚ</div>
              </div>
              <div className="bg-newsprint-black border-[3px] border-newsprint-black p-5 text-center shadow-brutalist-soft group">
                <div className="text-4xl font-serif font-black text-white">{studiedWords - rememberedWords}</div>
                <div className="text-[9px] font-sans font-black text-white/60 uppercase tracking-widest mt-1">BỊ LÃNG QUÊN</div>
              </div>
            </div>
          </div>

          <div className="bg-white border-[3px] border-newsprint-black shadow-brutalist-card p-8 space-y-8 relative overflow-hidden">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-[2px] border-newsprint-black pb-6">
               <div className="space-y-1">
                 <div className="flex items-center gap-3">
                   <TrendingUp size={24} strokeWidth={3} className="text-newsprint-black" />
                   <h2 className="text-2xl font-serif font-black text-newsprint-black uppercase leading-none">Hoạt động tuần</h2>
                 </div>
                 <p className="text-[11px] font-sans font-bold text-newsprint-gray-dark uppercase tracking-widest pl-9">NEW VS REVIEW FREQUENCY</p>
               </div>
               <div className="flex gap-6 pl-9 md:pl-0">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-newsprint-black border border-white" /><span className="text-[9px] font-sans font-black text-newsprint-black uppercase tracking-widest">MỚI</span></div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-600 border border-white" /><span className="text-[9px] font-sans font-black text-newsprint-black uppercase tracking-widest">ÔN LẠI</span></div>
               </div>
             </div>
             
             <div className="pt-2">
               <BarChart days={last7Days} />
             </div>

             <div className="absolute bottom-0 right-0 opacity-[0.02] pointer-events-none pr-8 pb-8">
               <History size={120} strokeWidth={3} />
             </div>
          </div>
        </div>
      </div>


      {/* MASTERY DETAILS TABLE */}
      <MasteryDetails buckets={buckets} />
    </div>
  )
}
