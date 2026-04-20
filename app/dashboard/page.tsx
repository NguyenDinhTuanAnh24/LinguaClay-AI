import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch user data từ Prisma
  const userData = await prisma.user.findUnique({
    where: { id: user?.id || "" },
    include: {
      progress: true,   // chỉ lấy số lượng, không cần join word/topic
      exercises: true
    }
  })

  // Mastery scale: 0–5 (SRS)
  const totalMastered = userData?.progress.filter((p: any) => p.masteryLevel >= 4).length || 0
  const totalToReview  = userData?.progress.filter((p: any) => p.masteryLevel < 4).length  || 0

  // ---- Streak thực tế: đếm ngày liên tiếp có hoạt động (GMT+7) ----
  const allReviewed = await prisma.userProgress.findMany({
    where: { userId: user?.id || "", lastReviewed: { not: null } },
    select: { lastReviewed: true },
    orderBy: { lastReviewed: 'desc' },
  })
  // Chuyển sang các ngày duy nhất (YYYY-MM-DD) theo GMT+7
  const toVNDate = (d: Date) =>
    new Date(d.getTime() + 7 * 3600_000).toISOString().split('T')[0]
  const uniqueDays = [...new Set(allReviewed.map((p: any) => toVNDate(p.lastReviewed!)))]
  // Đếm streak liên tiếp từ hôm nay/hôm qua lùi về
  let streak = 0
  if (uniqueDays.length > 0) {
    const todayVN  = toVNDate(new Date())
    const msPerDay = 86_400_000
    // Streak chỉ bắt đầu nếu ngày gần nhất là hôm nay hoặc hôm qua
    const newestMs = new Date(uniqueDays[0]).getTime()
    const todayMs  = new Date(todayVN).getTime()
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

  // ---- Số từ đến hạn ôn theo từng topic (nextReview <= now) ----
  const now = new Date()
  const dueProgress = await prisma.userProgress.findMany({
    where: {
      userId: user?.id || "",
      nextReview: { lte: now },
      masteryLevel: { lt: 5 },          // Đã thuộc lòng (5) không cần ôn
      word: { topicId: { not: null } },
    },
    select: { word: { select: { topicId: true } } }
  })
  // Map: topicId → số từ cần ôn
  const dueByTopic: Record<string, number> = {}
  dueProgress.forEach((p: any) => {
    const tid = p.word?.topicId
    if (tid) dueByTopic[tid] = (dueByTopic[tid] || 0) + 1
  })

  // Query chính xác: lấy UserProgress có lastReviewed gần nhất, join Word → Topic
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

  // Tên hiển thị ưu tiên: name từ Prisma → full_name meta → email prefix
  const displayName = userData?.name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'bạn'

  // ---- Số từ đ đạt mastery >= 1 theo từng topic (cho progress bar) ----
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
        /* Có dữ liệu: hiển banner "Tiếp tục" */
        <div className="relative overflow-hidden rounded-[40px] border-4 border-white shadow-clay-card bg-gradient-to-r from-[#b8f0d8] via-[#c9f5e1] to-[#d4f7e0] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-32 w-32 h-32 bg-[#a0e8c0]/40 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 bg-white/70 rounded-[22px] shadow-clay-button flex items-center justify-center text-3xl flex-shrink-0 border-2 border-white">
              📖
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1">Tiếp tục bài học</p>
              <h3 className="text-xl md:text-2xl font-heading font-black text-clay-deep leading-tight">
                Bạn đang học dở chủ đề{' '}
                <span className="text-emerald-700">"{recentTopic.name}"</span>
              </h3>
              <p className="text-sm text-emerald-700/70 mt-1 font-medium">Tiếp tục chứ? Bạn đang làm rất tốt! 💪</p>
            </div>
          </div>

          <Link
            href={`/study/${recentTopic.slug}`}
            className="relative z-10 flex-shrink-0 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-heading font-black text-base rounded-full shadow-[0_8px_20px_rgba(52,211,153,0.5)] hover:shadow-[0_12px_28px_rgba(52,211,153,0.65)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
          >
            <span>▶</span> Học tiếp
          </Link>
        </div>
      ) : (
        /* Chưa học gì: hiển banner khởi động */
        <div className="relative overflow-hidden rounded-[40px] border-4 border-white shadow-clay-card bg-gradient-to-r from-[#fde8d0] via-[#fdf0e0] to-[#fef6ec] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/40 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-32 w-32 h-32 bg-clay-orange/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 bg-white/80 rounded-[22px] shadow-clay-button flex items-center justify-center text-3xl flex-shrink-0 border-2 border-white">
              🌟
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-clay-orange mb-1">Hành trình bắt đầu</p>
              <h3 className="text-xl md:text-2xl font-heading font-black text-clay-deep leading-tight">
                Bắt đầu chuyến hành trình ngôn ngữ{' '}
                <span className="text-clay-orange">ngay hôm nay!</span>
              </h3>
              <p className="text-sm text-clay-muted mt-1 font-medium">Chọn một chủ đề dưới đây để bắt đầu bài học đầu tiên của bạn! 🚀</p>
            </div>
          </div>

          <Link
            href="/dashboard/flashcards"
            className="relative z-10 flex-shrink-0 px-8 py-4 bg-clay-orange hover:bg-clay-orange/90 text-white font-heading font-black text-base rounded-full shadow-[0_8px_20px_rgba(244,164,96,0.5)] hover:shadow-[0_12px_28px_rgba(244,164,96,0.65)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
          >
            <span>✨</span> Khám phá ngay
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - Main Activity */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* CURRENT LESSON CARD */}
          <div className="bg-gradient-to-br from-warm-white to-white rounded-[45px] shadow-clay-card p-8 md:p-10 border-4 border-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-9xl">📚</span>
            </div>
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 bg-clay-blue/20 text-clay-blue px-4 py-1.5 rounded-full text-xs font-bold">
                <span>Học tập</span> • <span>English Vocabulary</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-clay-deep leading-tight">
                Chào {displayName}, <br/> 
                <span className="text-clay-orange">hôm nay chinh phục thêm vài từ mới nhé! 🚀</span>
              </h2>
              <div className="space-y-3 max-w-sm">
                <div className="flex justify-between text-xs font-bold text-clay-muted">
                  <span>Tiến độ chương trình</span>
                  <span>{userData?.progress.length ? Math.round((totalMastered / userData.progress.length) * 100) : 0}%</span>
                </div>
                <div className="h-4 bg-soft-gray/30 rounded-full shadow-clay-inset p-1">
                  <div 
                    className="h-full bg-gradient-to-r from-clay-orange to-clay-gold rounded-full transition-all duration-1000" 
                    style={{ width: `${userData?.progress.length ? Math.round((totalMastered / userData.progress.length) * 100) : 0}%` }} 
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/dashboard/flashcards" className="px-8 py-4 bg-clay-orange text-white font-heading font-black rounded-full shadow-clay-button hover:shadow-clay-button-hover active:scale-95 transition-all text-sm md:text-base">
                  Khám phá Thư viện
                </Link>
                <Link href="/dashboard/flashcards" className="px-6 py-4 bg-warm-white text-clay-muted font-heading font-bold rounded-full shadow-clay-button flex items-center gap-2 hover:shadow-clay-button-hover active:scale-95 transition-all text-sm">
                  <span>🃏</span> Xem Flashcard
                </Link>
              </div>
            </div>
          </div>

          {/* STATS GRID */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/60 rounded-[40px] shadow-clay-card p-8 border-2 border-white flex justify-between items-center group hover:bg-white/80 transition-all">
              <div className="space-y-2">
                <span className="text-sm font-heading font-bold text-clay-muted uppercase tracking-wider">Đã thuộc</span>
                <div className="text-4xl font-heading font-black text-clay-green">{totalMastered}</div>
                <p className="text-[10px] text-clay-muted">Từ vựng đã ghi nhớ</p>
              </div>
              <div className="w-20 h-20 bg-clay-green/10 rounded-full flex items-center justify-center border-2 border-clay-green/20 group-hover:scale-110 transition-transform">
                 <span className="text-3xl">✅</span>
              </div>
            </div>

            <div className="bg-white/60 rounded-[40px] shadow-clay-card p-8 border-2 border-white flex justify-between items-center group hover:bg-white/80 transition-all">
              <div className="space-y-2">
                <span className="text-sm font-heading font-bold text-clay-muted uppercase tracking-wider">Cần ôn tập</span>
                <div className="text-4xl font-heading font-black text-clay-pink">{totalToReview}</div>
                <p className="text-[10px] text-clay-muted">Hãy ôn lại hôm nay!</p>
              </div>
              <div className="w-20 h-20 bg-clay-pink/10 rounded-full flex items-center justify-center border-2 border-clay-pink/20 group-hover:scale-110 transition-transform">
                 <span className="text-3xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          {/* STREAK CARD */}
          <div className="bg-gradient-to-br from-clay-deep to-clay-brown-dark rounded-[40px] shadow-clay-card p-8 text-center border-4 border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-clay-orange to-transparent blur-2xl" />
            <div className="relative z-10 space-y-4">
               <div className="w-20 h-20 bg-clay-orange/20 rounded-full flex items-center justify-center mx-auto mb-2 animate-breathe shadow-clay-button border-2 border-clay-orange/30">
                 <span className="text-4xl">🔥</span>
               </div>
               <div>
                 <div className="text-5xl font-heading font-black text-white mb-1 tracking-tight">{streak} ngày</div>
                 <p className="text-xs text-clay-orange font-bold uppercase tracking-[0.2em]">Chuỗi liên tiếp</p>
               </div>
               <p className="text-white/60 text-[10px] px-4">Bạn đang nằm trong top 5% học viên chăm chỉ nhất!</p>
            </div>
          </div>

          {/* AI PARTNER CARD */}
          <div className="bg-white/80 rounded-[40px] shadow-clay-card p-8 border-4 border-white relative overflow-hidden group cursor-pointer hover:shadow-clay-button-hover transition-all">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-clay-blue to-clay-green rounded-full blur-xl absolute opacity-30 animate-pulse-slow" />
                <div className="w-24 h-24 bg-gradient-to-br from-clay-blue to-clay-green rounded-full flex items-center justify-center relative shadow-clay-button border-4 border-white">
                  <span className="text-5xl">🤖</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-heading font-black text-clay-deep">AI Language Partner</h3>
                <p className="text-xs text-clay-muted mt-1 px-4">Luyện nói với AI ngay bây giờ để nhận +20 điểm kinh nghiệm.</p>
              </div>
              <Link href="/dashboard/ai-chat" className="w-full py-3 bg-clay-blue/10 text-clay-blue font-heading font-black text-sm rounded-full shadow-clay-pressed hover:bg-clay-blue/20 transition-all">
                Bắt đầu trò chuyện
              </Link>
            </div>
          </div>

          {/* QUICK TIP */}
          <div className="bg-clay-cream/50 rounded-[35px] shadow-clay-inset p-6 border border-soft-gray/30">
            <div className="flex items-start gap-4">
              <span className="text-2xl">💡</span>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-clay-deep uppercase tracking-widest leading-none">Mẹo nhỏ</h4>
                <p className="text-[11px] text-clay-muted leading-relaxed italic">
                  "Học từ vựng vào sáng sớm sẽ giúp não bộ ghi nhớ lâu hơn 30% so với tối muộn."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EXPLORE TOPICS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-heading font-black text-clay-deep">Chủ đề nổi bật</h2>
          <Link href="/dashboard/flashcards" className="text-sm font-bold text-clay-blue hover:underline">Xem tất cả →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentTopics.length > 0 ? (
            recentTopics.map((topic: any) => {
              const dueCount = dueByTopic[topic.id] || 0
              return (
                <div key={topic.id} className="relative bg-white/70 rounded-[35px] shadow-clay-card p-6 border-2 border-white transition-all group flex flex-col gap-5">
                  {/* Badge ôn tập */}
                  {dueCount > 0 && (
                    <div className="absolute -top-2 -right-2 z-10 min-w-[28px] h-7 bg-clay-orange text-white text-[11px] font-black rounded-full flex items-center justify-center px-2 shadow-[0_4px_12px_rgba(244,164,96,0.5)] border-2 border-white">
                      {dueCount > 99 ? '99+' : dueCount}
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-clay-cream rounded-[20px] shadow-clay-button flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                      {topic.language === 'CN' ? '🏮' : '🇬🇧'}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-clay-blue uppercase tracking-widest">{topic.level}</span>
                        <div className="flex items-center gap-1">
                          {topic.isAIGenerated && <span className="text-[10px] bg-clay-green/20 text-clay-green px-2 py-0.5 rounded-full font-bold">AI</span>}
                          {dueCount > 0 && <span className="text-[10px] bg-clay-orange/15 text-clay-orange px-2 py-0.5 rounded-full font-bold">⏰ Ôn tập</span>}
                        </div>
                      </div>
                      <h3 className="font-heading font-black text-clay-deep leading-none">{topic.name}</h3>
                      <p className="text-[11px] text-clay-muted line-clamp-1">{topic.description || 'Bắt đầu học ngay bộ từ vựng này.'}</p>
                    </div>
                  </div>

                  {/* ---- Progress Bar ---- */}
                  {(() => {
                    const total    = topic._count.words
                    const mastered = masteredByTopic[topic.id] || 0
                    const pct      = total > 0 ? Math.round((mastered / total) * 100) : 0
                    return (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold text-clay-muted uppercase tracking-tighter">
                          <span>Tiến độ: {mastered}/{total} từ</span>
                          <span className={pct >= 80 ? 'text-clay-green' : 'text-clay-orange'}>{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-soft-gray/30 rounded-full shadow-clay-inset overflow-hidden border border-white/50">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              pct >= 80 ? 'bg-clay-green shadow-[0_0_8px_#A8D5BA]' : 'bg-clay-orange shadow-[0_0_8px_#F4A460]'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })()}

                  {/* Mode Selection Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Link 
                      href={`/study/${topic.slug}`}
                      className="py-2.5 bg-white rounded-full text-center text-xs font-black text-clay-deep shadow-clay-button border border-soft-gray/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>🃏</span> Flashcard
                    </Link>
                    <Link 
                      href={`/study/${topic.slug}/write`}
                      className="py-2.5 bg-clay-blue text-white rounded-full text-center text-xs font-black shadow-clay-button hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>✍️</span> Luyện viết
                    </Link>
                  </div>
                </div>
              )
            })
          ) : (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white/40 rounded-[35px] shadow-clay-card p-6 border-2 border-white/50 border-dashed animate-pulse">
                <div className="h-24 flex items-center justify-center text-clay-muted font-heading font-black">
                  Chưa có dữ liệu
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
