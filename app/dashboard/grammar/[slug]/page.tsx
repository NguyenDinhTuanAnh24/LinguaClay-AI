import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import GrammarInteraction from '@/components/study/GrammarInteraction'

interface BreakdownItem { key: string; label: string; desc: string }
interface GrammarContent {
  structure: string
  breakdown: BreakdownItem[]
  usage: string[]
  signs: string[]
  notes: string
  example_en: string
  example_vi: string
  scramble_sentences: string[]
}

const PILL_COLORS: Record<string, string> = {
  S: 'bg-newsprint-black text-white px-3 py-1',
  V: 'bg-red-600 text-white px-3 py-1',
  O: 'bg-white text-newsprint-black border-2 border-newsprint-black px-3 py-1',
  Adj: 'bg-newsprint-paper text-newsprint-black border-2 border-newsprint-black px-3 py-1',
  Adv: 'bg-white text-newsprint-black border-2 border-newsprint-black px-3 py-1',
  N: 'bg-newsprint-black text-white px-3 py-1',
  default: 'bg-newsprint-paper text-newsprint-black border-2 border-newsprint-black px-3 py-1',
}

const levelBadge: Record<string, string> = {
  Beginner: 'bg-newsprint-black text-white',
  Elementary: 'bg-white text-newsprint-black border-2 border-newsprint-black',
  Intermediate: 'bg-red-600 text-white',
}

export default async function GrammarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const point = await (prisma as any).grammarPoint.findUnique({
    where: { slug },
    include: { topic: true, exercises: true }
  })

  if (!point) notFound()

  const content = point.content as GrammarContent | null

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 dashboard-theme">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-8 border-b-[4px] border-newsprint-black pb-10">
        <Link
          href="/dashboard/grammar"
          className="w-14 h-14 bg-white border-[3px] border-newsprint-black shadow-brutalist-soft flex items-center justify-center text-newsprint-black font-black text-xl hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex-shrink-0"
        >
          ←
        </Link>
        <div className="flex-1 space-y-3 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
            <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest ${levelBadge[point.level] || 'bg-newsprint-paper text-newsprint-black border-2 border-newsprint-black'}`}>
              {point.level}
            </span>
            <span className="text-newsprint-black/40 font-black text-[10px] uppercase tracking-[0.3em]">NGỮ PHÁP HỌC THUẬT</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-black text-newsprint-black uppercase tracking-tighter leading-tight vietnamese-text">
            {point.title}
          </h1>
        </div>
      </div>

      {content ? (
        <div className="grid grid-cols-1 gap-12">
          {/* ── Khối 1: Công thức & Thành phần ── */}
          <div className="bg-white border-[4px] border-newsprint-black shadow-brutalist-card p-8 md:p-12 space-y-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none pr-6 pt-6">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" /></svg>
             </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-newsprint-paper border-[2px] border-newsprint-black flex items-center justify-center text-2xl shadow-brutalist-soft rotate-3">📐</div>
              <div>
                <h2 className="text-2xl font-serif font-black text-newsprint-black uppercase">CÔNG THỨC CỐT LÕI</h2>
                <p className="text-[9px] font-black text-newsprint-black/40 uppercase tracking-widest">Main Grammar Structure</p>
              </div>
            </div>

            {/* Formula Box */}
            <div className="bg-newsprint-paper border-[3px] border-newsprint-black p-8 text-center shadow-inner relative group">
              <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-[0.02] transition-opacity" />
              <code className="text-3xl md:text-5xl font-black text-red-600 tracking-tight leading-normal">
                {content.structure}
              </code>
            </div>

            {/* Component Breakdown */}
            {content.breakdown?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {content.breakdown.map((item) => (
                  <div key={item.key} className="flex items-start gap-4 bg-white border-[3px] border-newsprint-black p-5 shadow-brutalist-soft hover:translate-x-1 hover:-translate-y-1 transition-all">
                    <span className={`text-xs font-black uppercase tracking-widest flex-shrink-0 ${PILL_COLORS[item.key] || PILL_COLORS.default}`}>
                      {item.key}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-newsprint-black uppercase tracking-tight mb-1 underline decoration-newsprint-paper decoration-4 underline-offset-2">{item.label}</p>
                      <p className="text-xs text-newsprint-black/60 font-bold leading-relaxed vietnamese-text">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Khối 2: Cách dùng & Nhận biết ── */}
          <div className="bg-white border-[4px] border-newsprint-black shadow-brutalist-card p-8 md:p-12 space-y-10 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-48 h-48 opacity-[0.03] pointer-events-none pb-8 pr-8">
               <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 13V11H11V13H13M13 17V15H11V17H13M11 2V4.11C7.06 4.56 4 7.92 4 12C4 16.08 7.06 19.44 11 19.89V22H13V19.89C16.94 19.44 20 16.08 20 12C20 7.92 16.94 4.56 13 4.11V2H11ZM12 6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6Z" /></svg>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-newsprint-paper border-[2px] border-newsprint-black flex items-center justify-center text-2xl shadow-brutalist-soft -rotate-3">📖</div>
              <div>
                <h2 className="text-2xl font-serif font-black text-newsprint-black uppercase">HƯỚNG DẪN SỬ DỤNG</h2>
                <p className="text-[9px] font-black text-newsprint-black/40 uppercase tracking-widest">Usage Scenarios & Context</p>
              </div>
            </div>

            {/* Usage list */}
            {content.usage?.length > 0 && (
              <div className="space-y-4">
                {content.usage.map((u, i) => (
                  <div key={i} className="flex items-start gap-5 bg-newsprint-paper/50 border-l-[6px] border-newsprint-black p-6">
                    <span className="text-xl font-serif font-black text-red-600 flex-shrink-0 mt-0.5">
                      {i + 1}.
                    </span>
                    <p className="text-sm text-newsprint-black font-bold leading-relaxed uppercase tracking-tight vietnamese-text">{u}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Signs & Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t-[3px] border-newsprint-black/10">
              {/* Signs */}
              {content.signs?.length > 0 && (
                <div className="space-y-5">
                  <p className="text-[11px] font-black text-newsprint-black uppercase tracking-[0.2em] border-b-[2px] border-newsprint-black pb-2 inline-block">
                    🔍 DẤU HIỆU NHẬN BIẾT
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {content.signs.map((s, i) => (
                      <span key={i} className="px-4 py-2 bg-newsprint-black text-white font-black text-[10px] uppercase tracking-widest">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {content.notes && (
                <div className="space-y-5">
                  <p className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] border-b-[2px] border-red-600 pb-2 inline-block">
                    ⚠️ LƯU Ý QUAN TRỌNG
                  </p>
                  <div className="bg-white border-[3px] border-red-600 p-5 shadow-brutalist-soft rotate-1 transition-transform hover:rotate-0">
                    <p className="text-xs text-red-600 font-black leading-relaxed uppercase tracking-tight vietnamese-text">{content.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Fallback khi chưa có content từ AI */
        <div className="bg-white border-[4px] border-newsprint-black shadow-brutalist-card p-12 space-y-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 1px, transparent 1px, transparent 10px)' }} />
          <div className="w-16 h-16 mx-auto bg-newsprint-paper border-[3px] border-newsprint-black flex items-center justify-center text-3xl animate-bounce relative z-10">🤖</div>
          <div className="space-y-4 relative z-10">
            <h3 className="text-3xl font-serif font-black text-newsprint-black uppercase italic">Đang phân tích...</h3>
            <p className="text-[10px] text-newsprint-black/40 font-black uppercase tracking-widest">AI đang tối ưu hóa lộ trình kiến thức cho riêng bạn.</p>
          </div>
          {point.explanation && (
            <div className="bg-newsprint-paper border-[3px] border-newsprint-black p-8 text-left relative z-10 shadow-inner">
              <p className="text-sm text-newsprint-black font-bold leading-relaxed uppercase tracking-tight vietnamese-text underline decoration-red-600/10 decoration-8 underline-offset-0">{point.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Practice ── */}
      <div className="space-y-6 pt-10">
        <div className="text-center">
            <h2 className="text-3xl font-serif font-black text-newsprint-black uppercase tracking-tighter">BẮT ĐẦU LUYỆN TẬP</h2>
            <div className="w-20 h-1.5 bg-red-600 mx-auto mt-4" />
        </div>
        <GrammarInteraction point={point} />
      </div>
    </div>
  )
}
