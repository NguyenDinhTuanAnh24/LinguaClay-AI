import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  BookOpen,
  Flame,
  Trophy,
  Clock,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Plus,
  Play
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userData = await prisma.user.findUnique({
    where: { id: user?.id || "" },
    include: {
      progress: true,
      exercises: true
    }
  })

  // Mastery scale: 0–5 (SRS)
  const totalMastered = userData?.progress.filter((p: any) => p.masteryLevel >= 4).length || 0
  const totalToReview = userData?.progress.filter((p: any) => p.masteryLevel < 4).length || 0

  const allReviewed = await prisma.userProgress.findMany({
    where: { userId: user?.id || "", lastReviewed: { not: null } },
    select: { lastReviewed: true },
    orderBy: { lastReviewed: 'desc' },
  })

  const toVNDate = (d: Date) =>
    new Date(d.getTime() + 7 * 3600_000).toISOString().split('T')[0]
  const uniqueDays = [...new Set(allReviewed.map((p: any) => toVNDate(p.lastReviewed!)))] as string[]

  let streak = 0
  if (uniqueDays.length > 0) {
    const todayVN = toVNDate(new Date())
    const msPerDay = 86_400_000
    const newestMs = new Date(uniqueDays[0]).getTime()
    const todayMs = new Date(todayVN).getTime()
    if (todayMs - newestMs <= msPerDay) {
      streak = 1
      for (let i = 1; i < uniqueDays.length; i++) {
        const diff = new Date(uniqueDays[i - 1]).getTime() - new Date(uniqueDays[i]).getTime()
        if (diff <= msPerDay + 1) {
          streak++
        } else {
          break
        }
      }
    }
  }

  const now = new Date()
  const dueProgress = await prisma.userProgress.findMany({
    where: {
      userId: user?.id || "",
      nextReview: { lte: now },
      masteryLevel: { lt: 5 },
      word: { topicId: { not: null } },
    },
    select: { word: { select: { topicId: true } } }
  })

  const dueByTopic: Record<string, number> = {}
  dueProgress.forEach((p: any) => {
    const tid = p.word?.topicId
    if (tid) dueByTopic[tid] = (dueByTopic[tid] || 0) + 1
  })

  const lastProgress = await prisma.userProgress.findFirst({
    where: {
      userId: user?.id || "",
      lastReviewed: { not: null },
      word: { topicId: { not: null } },
    },
    orderBy: { lastReviewed: 'desc' },
    include: {
      word: {
        include: { topic: true }
      }
    }
  })
  const recentTopic = lastProgress?.word?.topic || null

  const displayName = userData?.name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Học viên'

  const recentTopics = await prisma.topic.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { words: true } } }
  })
  const masteredProgressList = await prisma.userProgress.findMany({
    where: {
      userId: user?.id || "",
      masteryLevel: { gte: 1 },
      word: { topicId: { in: recentTopics.map((t: any) => t.id) } },
    },
    select: { word: { select: { topicId: true } } }
  })
  const masteredByTopic: Record<string, number> = {}
  masteredProgressList.forEach((p: any) => {
    const tid = p.word?.topicId
    if (tid) masteredByTopic[tid] = (masteredByTopic[tid] || 0) + 1
  })

  return (
    <div className="space-y-12 pb-12">

      {/* ========== BANNER: HỌC TIẾP ========== */}
      {recentTopic ? (
        <div className="relative overflow-hidden border-[3px] border-newsprint-black bg-[#F5F0E8] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-brutalist-card">
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white border-[3px] border-newsprint-black flex items-center justify-center text-newsprint-black flex-shrink-0 shadow-brutalist-soft">
              <BookOpen size={32} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-1">TIẾP TỤC HÀNH TRÌNH</p>
              <h3 className="text-xl md:text-2xl font-serif font-black text-newsprint-black leading-tight uppercase">
                Bạn đang học dở chủ đề{' '}
                <span className="bg-red-600 text-white px-2 italic">"{recentTopic.name}"</span>
              </h3>
              <p className="text-[11px] font-sans font-bold text-newsprint-gray-dark mt-1 uppercase tracking-widest">Tiếp tục chứ? Bạn đang làm rất tốt!</p>
            </div>
          </div>

          <Link
            href={`/study/${recentTopic.slug}`}
            className="group relative z-10 flex-shrink-0 px-8 py-4 bg-newsprint-black text-white font-sans font-black uppercase tracking-widest text-xs border-[3px] border-newsprint-black hover:bg-white hover:text-newsprint-black transition-all shadow-brutalist-soft active:translate-y-1 active:shadow-none flex items-center gap-3"
          >
            HỌC TIẾP <Play size={16} fill="currentColor" />
          </Link>
        </div>
      ) : (
        <div className="relative overflow-hidden border-[3px] border-newsprint-black bg-[#F5F0E8] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-brutalist-card">
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white border-[3px] border-newsprint-black flex items-center justify-center text-newsprint-black flex-shrink-0 shadow-brutalist-soft">
              <TrendingUp size={32} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-1">DÀNH CHO BẠN</p>
              <h3 className="text-xl md:text-2xl font-serif font-black text-newsprint-black leading-tight uppercase">
                Khởi đầu ngày mới với {' '}
                <span className="italic underline decoration-[4px] decoration-red-600 underline-offset-4">mục tiêu 10 từ</span>
              </h3>
              <p className="text-[11px] font-sans font-bold text-newsprint-gray-dark mt-1 uppercase tracking-widest">Khám phá thư viện ngay bây giờ!</p>
            </div>
          </div>

          <Link
            href="/dashboard/flashcards"
            className="relative z-10 flex-shrink-0 px-8 py-4 bg-red-600 text-white font-sans font-black uppercase tracking-widest text-xs border-[3px] border-newsprint-black hover:bg-white hover:text-red-600 transition-all shadow-brutalist-soft active:translate-y-1 active:shadow-none flex items-center gap-3"
          >
            BẮT ĐẦU NGAY <ArrowRight size={16} strokeWidth={3} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - Main Activity */}
        <div className="lg:col-span-2 space-y-6">

          {/* WELCOME / MAIN CARD */}
          <div className="bg-white/40 backdrop-blur-3xl rounded-[40px] shadow-clay-card p-8 md:p-10 relative overflow-hidden border-2 border-white/60">
            <div className="absolute top-0 right-0 w-64 h-64 bg-clay-orange/20 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-clay-blue/20 rounded-full blur-3xl -z-10 pointer-events-none -translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full font-heading font-black text-xs text-clay-blue shadow-clay-inset">
                <span className="w-2 h-2 rounded-full bg-clay-blue animate-pulse"></span>
                Sẵn sàng học mới
              </div>

              <h2 className="text-3xl md:text-5xl font-heading font-black text-clay-deep leading-tight">
                Chào {displayName}, <br />
                <span className="text-clay-orange">chinh phục</span> từ mới ngay! <span className="inline-block animate-bounce">🚀</span>
              </h2>

              <div className="space-y-3 max-w-sm">
                <div className="flex justify-between font-bold text-xs uppercase text-clay-muted">
                  <span>Tiến độ tổng</span>
                  <span>{userData?.progress.length ? Math.round((totalMastered / userData.progress.length) * 100) : 0}%</span>
                </div>
                <div className="h-4 bg-clay-cream/50 rounded-full shadow-clay-inset p-1">
                  <div
                    className="h-full bg-gradient-to-r from-clay-orange to-clay-yellow rounded-full transition-all duration-1000"
                    style={{ width: `${userData?.progress.length ? Math.round((totalMastered / userData.progress.length) * 100) : 0}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/dashboard/flashcards" className="px-8 py-4 bg-clay-blue text-white rounded-2xl font-heading font-black shadow-clay-button hover:shadow-clay-button-hover active:scale-95 transition-all">
                  Vào thư viện ✨
                </Link>
                <Link href="/dashboard/flashcards" className="px-6 py-4 bg-white text-clay-blue rounded-2xl font-heading font-black shadow-clay-button hover:shadow-clay-button-hover active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={18} strokeWidth={3} /> Tạo thẻ mới
                </Link>
              </div>
            </div>
          </div>

          {/* STATS GRID */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/40 backdrop-blur-3xl rounded-[30px] shadow-clay-card p-6 flex justify-between items-center border-2 border-white/60 group hover:-translate-y-1 transition-all">
              <div className="space-y-1">
                <span className="text-xs font-bold text-clay-muted uppercase tracking-wider">Đã thuộc</span>
                <div className="text-4xl font-heading font-black text-clay-deep">{totalMastered}</div>
              </div>
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-clay-orange shadow-clay-button group-hover:rotate-12 transition-transform">
                🏆
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-3xl rounded-[30px] shadow-clay-card p-6 flex justify-between items-center border-2 border-white/60 group hover:-translate-y-1 transition-all">
              <div className="space-y-1">
                <span className="text-xs font-bold text-clay-muted uppercase tracking-wider">Cần ôn tập</span>
                <div className="text-4xl font-heading font-black text-clay-pink">{totalToReview}</div>
              </div>
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-clay-pink shadow-clay-button group-hover:-rotate-12 transition-transform">
                ⏱️
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* STREAK CARD */}
          <div className="bg-gradient-to-br from-clay-orange to-clay-yellow rounded-[40px] shadow-[0_20px_40px_rgba(244,164,96,0.3)] p-8 text-center relative overflow-hidden group border-4 border-white/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -z-10 translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto shadow-clay-inset backdrop-blur-sm group-hover:scale-110 transition-transform">
                <span className="text-3xl text-white">🔥</span>
              </div>
              <div>
                <div className="text-4xl font-heading font-black text-white mb-1 drop-shadow-md">{streak} ngày</div>
                <p className="text-xs text-white/80 font-bold uppercase tracking-wider">Chuỗi liên tiếp</p>
              </div>
              <div className="h-1 bg-white/20 w-1/2 mx-auto rounded-full" />
              <p className="text-white/90 font-bold text-[10px] uppercase tracking-widest bg-white/20 inline-block px-3 py-1 rounded-full">Top 5% chăm chỉ</p>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-3xl rounded-[40px] shadow-clay-card p-8 text-center border-2 border-white/60 group">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-clay-button group-hover:-translate-y-2 transition-transform">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-lg font-heading font-black text-clay-deep mb-2">AI Partner</h3>
            <p className="text-xs font-bold text-clay-muted mb-6">Luyện nói tiếng Anh/Trung mỗi ngày để tự tin giao tiếp.</p>
            <Link href="/dashboard/ai-chat" className="block w-full py-3 bg-white text-clay-blue rounded-xl font-heading font-black shadow-clay-button hover:shadow-clay-button-hover active:scale-95 transition-all">
              Bắt đầu Chat ✨
            </Link>
          </div>
        </div>
      </div>

      {/* EXPLORE TOPICS SECTION */}
      <div className="space-y-6 pt-6">
        <div className="flex items-end justify-between px-2">
          <h2 className="text-2xl md:text-3xl font-heading font-black text-clay-deep tracking-tight">Chủ đề nổi bật</h2>
          <Link href="/dashboard/flashcards" className="text-sm font-bold text-clay-blue hover:text-clay-orange transition-colors flex items-center gap-1 group">
            Xem tất cả <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentTopics.length > 0 ? (
            recentTopics.map((topic: any) => {
              const dueCount = dueByTopic[topic.id] || 0
              return (
                <div key={topic.id} className="relative bg-white/60 backdrop-blur-md border-2 border-white/70 rounded-[30px] p-6 shadow-clay-card hover:shadow-clay-button-hover transition-all group flex flex-col gap-5 hover:-translate-y-2">
                  {/* Badge ôn tập */}
                  {dueCount > 0 && (
                    <div className="absolute -top-3 -right-3 z-10 h-8 w-8 bg-clay-pink text-white text-xs font-black rounded-full flex items-center justify-center shadow-clay-float animate-pulse">
                      {dueCount > 99 ? '99+' : dueCount}
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-clay-button flex items-center justify-center text-3xl flex-shrink-0 group-hover:rotate-12 transition-transform">
                      {topic.language === 'CN' ? '🏮' : '🇬🇧'}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-clay-orange uppercase tracking-wider">{topic.level}</span>
                        {topic.isAIGenerated && (
                          <span className="text-[10px] bg-clay-blue/10 text-clay-blue px-2 py-0.5 rounded-md font-black">AI</span>
                        )}
                      </div>
                      <h3 className="text-lg font-heading font-black text-clay-deep leading-tight group-hover:text-clay-blue transition-colors line-clamp-1">{topic.name}</h3>
                      <p className="text-xs font-bold text-clay-muted line-clamp-1">{topic.description || 'Bắt đầu học ngay.'}</p>
                    </div>
                  </div>

                  {/* ---- Progress Bar ---- */}
                  {(() => {
                    const total    = topic._count.words
                    const mastered = masteredByTopic[topic.id] || 0
                    const pct      = total > 0 ? Math.round((mastered / total) * 100) : 0
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between font-bold text-[10px] text-clay-muted">
                          <span>Tiến độ: {mastered}/{total} từ</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-3 bg-clay-cream/50 rounded-full shadow-clay-inset p-0.5">
                          <div
                            className="h-full bg-clay-blue rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })()}

                  {/* Mode Selection Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <Link 
                      href={`/study/${topic.slug}`}
                      className="py-2.5 bg-white text-clay-blue text-[11px] font-heading font-black uppercase rounded-xl hover:bg-clay-blue hover:text-white transition-colors text-center shadow-clay-button"
                    >
                      Flashcard 🎴
                    </Link>
                    <Link 
                      href={`/study/${topic.slug}/write`}
                      className="py-2.5 bg-clay-cream text-clay-deep text-[11px] font-heading font-black uppercase rounded-xl hover:bg-clay-orange hover:text-white transition-colors text-center shadow-clay-button"
                    >
                      Luyện viết ✍️
                    </Link>
                  </div>
                </div>
              )
            })
          ) : (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white/30 border-2 border-white/50 border-dashed rounded-[30px] h-64 flex items-center justify-center text-clay-muted font-heading font-black tracking-widest animate-pulse shadow-clay-inset">
                CHƯA CÓ DỮ LIỆU
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function formatDashboardNumbers(text: string) {
  const parts = text.split(/(\d+)/)
  return parts.map((part, i) => {
    if (/\d+/.test(part)) {
      return (
        <span key={i} className="font-heading font-black text-clay-blue">
          {part}
        </span>
      )
    }
    return <span key={i} className="font-bold">{part}</span>
  })
}
