'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Hand, PartyPopper, RotateCcw, XCircle } from 'lucide-react'
import { updateWordProgress } from '@/app/actions/study'
import Flashcard from './Flashcard'

interface WordWithProgress {
  id: string
  original: string
  pronunciation: string | null
  translation: string
  example: string | null
  exampleTranslation: string | null
  userProgress?: { masteryLevel: number }[]
}

interface FlashcardStudyProps {
  vocabSet: {
    id: string
    title: string
    language?: string
    words: WordWithProgress[]
  }
  userId: string
}

export default function FlashcardStudy({ vocabSet, userId }: FlashcardStudyProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Map wordId → masteryLevel (cập nhật real-time trong session)
  const [masteryMap, setMasteryMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    vocabSet.words.forEach(w => {
      map[w.id] = w.userProgress?.[0]?.masteryLevel ?? 0
    })
    return map
  })

  // ---- State máy 2 bước ----
  // false = Bước 1: đang xem mặt trước (chưa lật)
  // true  = Bước 2: đã lật → hiện nút đánh giá
  const [isFlipped, setIsFlipped] = useState(false)

  // Hiệu ứng flash kết quả (brief feedback trước khi chuyển card)
  const [flashResult, setFlashResult] = useState<'correct' | 'wrong' | null>(null)

  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const currentWord = vocabSet.words[currentIndex]

  // ---- Empty state ----
  if (!currentWord) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6">
        <div className="w-20 h-20 border-[3px] border-newsprint-black bg-white flex items-center justify-center shadow-brutalist-soft">
          <RotateCcw className="w-10 h-10 text-newsprint-black" />
        </div>
        <h2 className="text-2xl font-heading font-black text-newsprint-black">Chủ đề này chưa có từ vựng</h2>
        <Link href="/dashboard/flashcards" className="px-8 py-3 border-[3px] border-newsprint-black bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-[#B42318] transition-colors">
          Quay lại thư viện
        </Link>
      </div>
    )
  }

  const currentMastery = masteryMap[currentWord.id] ?? 0
  const isLastWord = currentIndex === vocabSet.words.length - 1

  // ---- Chuyển sang card tiếp theo ----
  const goNext = () => {
    setIsFlipped(false)
    setFlashResult(null)
    if (isLastWord) {
      router.push('/dashboard')
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false)
      setFlashResult(null)
      setCurrentIndex(prev => prev - 1)
    }
  }

  // ---- Bước 1 → Bước 2: Lật thẻ ----
  const handleFlip = () => {
    setIsFlipped(true) // Chỉ cho phép lật 1 chiều (xem xong rồi đánh giá)
  }

  // ---- Đánh giá SRS ----
  const handleGrade = (isCorrect: boolean) => {
    if (isPending) return

    // Tính và cập nhật mastery optimistically
    const newLevel = isCorrect ? Math.min(5, currentMastery + 1) : 0
    setMasteryMap(prev => ({ ...prev, [currentWord.id]: newLevel }))

    // Hiện flash feedback với level mới ngay lập tức
    setFlashResult(isCorrect ? 'correct' : 'wrong')

    // Gọi server action lưu DB (fire-and-forget, không block UI)
    startTransition(async () => {
      await updateWordProgress(userId, currentWord.id, isCorrect)
    })

    // Tự động chuyển card sau 700ms
    setTimeout(goNext, 700)
  }


  return (
    <div className="relative flex flex-col min-h-screen max-w-2xl mx-auto px-6 py-8 overflow-y-auto dashboard-theme">

      {/* === Header: Exit + Progress bar + Counter === */}
      <div className="flex items-center justify-between mb-10 gap-6">
        <Link
          href="/dashboard/flashcards"
          className="w-14 h-14 bg-white border-[3px] border-newsprint-black shadow-brutalist-soft flex items-center justify-center text-newsprint-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Link>

        <div className="flex-1 h-4 bg-newsprint-paper border-[3px] border-newsprint-black flex p-0.5 shadow-[4px_4px_0px_0px_rgba(20,20,20,0.1)]">
          {vocabSet.words.map((w, idx) => {
            const m = masteryMap[w.id] ?? 0
            return (
              <div
                key={idx}
                className={`h-full flex-1 transition-all duration-500 border-r-[1px] border-newsprint-black/10 last:border-0 ${
                  idx < currentIndex
                    ? m >= 4 ? 'bg-newsprint-black' : 'bg-newsprint-black/40'
                    : idx === currentIndex
                      ? 'bg-red-600 animate-pulse'
                      : 'bg-transparent'
                }`}
              />
            )
          })}
        </div>

        <span className="text-xs font-black text-newsprint-black uppercase tracking-widest flex-shrink-0">
          {currentIndex + 1} / {vocabSet.words.length}
        </span>
      </div>

      {/* === MAIN AREA === */}
      <div className="flex-1 flex flex-col items-center justify-start gap-5 pt-1">

        {/* ===== BƯỚC 1: Thẻ chính (click để lật) ===== */}
        <Flashcard
          key={currentWord.id}
          original={currentWord.original}
          translation={currentWord.translation}
          pronunciation={currentWord.pronunciation}
          example={currentWord.example}
          exampleTranslation={currentWord.exampleTranslation}
          language={vocabSet.language || 'EN'}
          masteryLevel={currentMastery}
          sessionProgress={currentIndex + 1}
          sessionTotal={vocabSet.words.length}
          onFlip={handleFlip}
        />

        {/* ===== BƯỚC 2: Nút đánh giá (chỉ hiện SAU khi lật) ===== */}
        <div
          className={`w-full overflow-hidden transition-all duration-300 ${
            isFlipped
              ? 'max-h-[120px] opacity-100 translate-y-0 scale-100'
              : 'max-h-0 opacity-0 -translate-y-2 scale-95 pointer-events-none'
          }`}
        >
          {/* Flash feedback overlay */}
          {flashResult ? (
            <div className={`w-full h-20 border-[3px] border-newsprint-black flex items-center justify-center font-serif font-black text-lg gap-4 shadow-brutalist-soft ${
              flashResult === 'correct'
                ? 'bg-[#141414] text-white'
                : 'bg-[#F5F0E8] text-newsprint-black border-dashed'
            }`}>
              {flashResult === 'correct'
                ? `LEVEL ${Math.min(5, currentMastery + 1)}/5 - ĐÃ NÂNG CẤP`
                : 'SẼ ÔN LẠI SỚM'}
              {flashResult === 'correct' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {/* ❌ Chưa thuộc → SRS reset */}
              <button
                onClick={() => handleGrade(false)}
                disabled={isPending}
                className="h-20 bg-white border-[3px] border-newsprint-black shadow-brutalist-soft hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <XCircle className="w-7 h-7 group-hover:rotate-6 transition-transform text-newsprint-black" />
                <div className="text-left font-black uppercase tracking-widest">
                  <div className="text-xs leading-none mb-1">CHƯA THUỘC</div>
                  <div className="text-[10px] opacity-40">ÔN LẠI SAU 30P</div>
                </div>
              </button>

              {/* ✅ Đã nhớ → SRS level up */}
              <button
                onClick={() => handleGrade(true)}
                disabled={isPending}
                className="h-20 bg-[#141414] text-white border-[3px] border-newsprint-black shadow-brutalist-soft hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-7 h-7 group-hover:scale-110 transition-transform text-white" />
                <div className="text-left font-black uppercase tracking-widest">
                  <div className="text-xs leading-none mb-1 text-white">ĐÃ NHỚ!</div>
                  <div className="text-[10px] opacity-60">
                    +1 LEVEL UP
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Gợi ý khi chưa lật (Bước 1) */}
        {!isFlipped && (
          <div className="inline-flex items-center gap-2 text-[10px] text-newsprint-black font-black uppercase tracking-[0.3em] animate-pulse">
            <Hand className="w-3.5 h-3.5" />
            <span>CHẠM THẺ ĐỂ XEM NGHĨA</span>
          </div>
        )}
      </div>

      {/* === Nav phụ: Quay lại + Bỏ qua (luôn hiện) === */}
      <div className="mt-4 grid grid-cols-2 gap-6 pb-4">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className={`h-14 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] border-[3px] ${
            currentIndex === 0
              ? 'bg-newsprint-paper/30 text-newsprint-black/20 border-newsprint-black/10 cursor-not-allowed'
              : 'bg-white border-newsprint-black shadow-brutalist-soft hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]'
          }`}
        >
          <span>←</span>
          <span>QUAY LẠI</span>
        </button>

        <button
          onClick={goNext}
          className="h-14 bg-newsprint-paper/50 text-newsprint-black border-[3px] border-newsprint-black border-dashed shadow-brutalist-soft
            hover:bg-white active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <span>
            {isLastWord ? 'KẾT THÚC' : 'BỎ QUA →'}
          </span>
          {isLastWord && <PartyPopper className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
