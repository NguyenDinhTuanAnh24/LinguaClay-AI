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
  S: 'bg-clay-blue/15 text-clay-blue border border-clay-blue/20',
  V: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  O: 'bg-clay-pink/15 text-clay-pink border border-clay-pink/20',
  Adj: 'bg-clay-orange/15 text-clay-orange border border-clay-orange/20',
  Adv: 'bg-purple-100 text-purple-600 border border-purple-200',
  N: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  default: 'bg-clay-muted/10 text-clay-muted border border-clay-muted/20',
}

const levelBadge: Record<string, string> = {
  Beginner: 'bg-clay-blue/10 text-clay-blue',
  Elementary: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-clay-pink/10 text-clay-pink',
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
    <div className="max-w-4xl mx-auto space-y-8 pb-24">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/grammar"
          className="w-12 h-12 rounded-2xl bg-white shadow-clay-button border-2 border-white flex items-center justify-center text-clay-muted hover:scale-105 transition-transform"
        >←</Link>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${levelBadge[point.level] || 'bg-clay-muted/10 text-clay-muted'}`}>
              {point.level}
            </span>
            <span className="text-clay-muted font-bold text-xs uppercase tracking-widest">Ngữ pháp</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-clay-deep tracking-tight leading-tight">
            {point.title}
          </h1>
        </div>
      </div>

      {content ? (
        <>
          {/* ── Khối 1: Công thức & Thành phần ── */}
          <div className="bg-white/80 backdrop-blur rounded-[45px] shadow-clay-card border-4 border-white p-8 md:p-10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-clay-blue/10 flex items-center justify-center text-xl">📐</div>
              <h2 className="text-lg font-black text-clay-deep uppercase tracking-wider">Công thức cốt lõi</h2>
            </div>

            {/* Formula Box */}
            <div className="bg-gradient-to-br from-clay-cream to-white rounded-[30px] border-2 border-clay-blue/10 p-6 text-center">
              <code className="text-2xl md:text-3xl font-black text-clay-blue tracking-wide">
                {content.structure}
              </code>
            </div>

            {/* Component Breakdown */}
            {content.breakdown?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.breakdown.map((item) => (
                  <div key={item.key} className="flex items-start gap-3 bg-white rounded-[25px] p-4 border-2 border-white shadow-clay-button">
                    <span className={`px-3 py-1 rounded-xl text-sm font-black flex-shrink-0 ${PILL_COLORS[item.key] || PILL_COLORS.default}`}>
                      {item.key}
                    </span>
                    <div>
                      <p className="text-xs font-black text-clay-deep">{item.label}</p>
                      <p className="text-xs text-clay-muted font-medium leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Khối 2: Cách dùng & Nhận biết ── */}
          <div className="bg-white/80 backdrop-blur rounded-[45px] shadow-clay-card border-4 border-white p-8 md:p-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-clay-green/10 flex items-center justify-center text-xl">📖</div>
              <h2 className="text-lg font-black text-clay-deep uppercase tracking-wider">Hướng dẫn sử dụng</h2>
            </div>

            {/* Usage list */}
            {content.usage?.length > 0 && (
              <ul className="space-y-3">
                {content.usage.map((u, i) => (
                  <li key={i} className="flex items-start gap-3 bg-clay-green/5 rounded-[20px] px-5 py-3">
                    <span className="w-6 h-6 rounded-full bg-clay-green/20 text-clay-green flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-clay-deep font-medium leading-relaxed">{u}</p>
                  </li>
                ))}
              </ul>
            )}

            {/* Signs */}
            {content.signs?.length > 0 && (
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-sm font-black text-clay-muted">
                  <span>🔍</span> Dấu hiệu nhận biết
                </p>
                <div className="flex flex-wrap gap-2">
                  {content.signs.map((s, i) => (
                    <span key={i} className="px-4 py-2 bg-clay-blue/8 text-clay-blue font-black text-sm rounded-full border border-clay-blue/15">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {content.notes && (
              <div className="flex items-start gap-3 bg-clay-orange/8 rounded-[20px] px-5 py-4 border border-clay-orange/15">
                <span className="text-xl flex-shrink-0">⚠️</span>
                <p className="text-sm text-clay-orange font-bold leading-relaxed">{content.notes}</p>
              </div>
            )}
          </div>

        </>
      ) : (
        /* Fallback khi chưa có content từ AI */
        <div className="bg-white/80 backdrop-blur rounded-[45px] shadow-clay-card border-4 border-white p-10 space-y-6 text-center">
          <div className="w-16 h-16 mx-auto bg-clay-muted/10 rounded-full flex items-center justify-center text-3xl animate-pulse">🤖</div>
          <div>
            <h3 className="font-heading font-black text-clay-deep text-xl">AI đang chuẩn bị nội dung...</h3>
            <p className="text-clay-muted font-medium mt-2">Bài học này sẽ sớm được cập nhật chi tiết.</p>
          </div>
          {point.explanation && (
            <div className="bg-warm-white rounded-[30px] p-6 text-left">
              <p className="text-clay-deep font-medium">{point.explanation}</p>
            </div>
          )}
          {point.example && (
            <div className="bg-clay-blue/5 rounded-[25px] p-6">
              <p className="text-xl font-black text-clay-blue">"{point.example}"</p>
            </div>
          )}
        </div>
      )}

      {/* ── Practice ── */}
      <GrammarInteraction point={point} />
    </div>
  )
}
