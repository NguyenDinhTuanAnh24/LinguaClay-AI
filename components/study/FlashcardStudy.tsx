'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
        <div className="text-8xl">🏜️</div>
        <h2 className="text-2xl font-heading font-black text-clay-deep">Chủ đề này chưa có từ vựng</h2>
        <Link href="/dashboard/flashcards" className="px-8 py-3 bg-clay-blue text-white rounded-full shadow-clay-button">
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
    <div className="relative flex flex-col h-screen max-w-2xl mx-auto px-6 py-8 overflow-hidden">

      {/* === Background decorations === */}
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-clay-blue/8 blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-clay-orange/8 blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
      <div className="absolute top-24 right-8 w-6 h-6 rounded-lg bg-clay-blue/15 rotate-12 animate-bounce pointer-events-none" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-32 left-6 w-4 h-4 rounded-full bg-clay-orange/20 pointer-events-none animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />

      {/* === Header: Exit + Progress pebbles + Counter === */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/dashboard/flashcards"
          className="w-12 h-12 bg-warm-white rounded-full shadow-clay-button flex items-center justify-center text-clay-muted hover:shadow-clay-button-hover active:scale-90 transition-all flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Link>

        <div className="flex-1 mx-4 flex gap-1.5">
          {vocabSet.words.map((w, idx) => {
            const m = masteryMap[w.id] ?? 0
            return (
              <div
                key={idx}
                className={`h-3 flex-1 rounded-full transition-all duration-500 ${
                  idx < currentIndex
                    ? m >= 4 ? 'bg-clay-green shadow-clay-pressed' : 'bg-clay-orange/70'
                    : idx === currentIndex
                      ? 'bg-clay-blue shadow-clay-button animate-pulse'
                      : 'bg-soft-gray/30 shadow-clay-inset'
                }`}
              />
            )
          })}
        </div>

        <span className="text-sm font-heading font-black text-clay-deep flex-shrink-0">
          {currentIndex + 1}/{vocabSet.words.length}
        </span>
      </div>

      {/* === MAIN AREA === */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5">

        {/* ===== BƯỚC 1: Thẻ chính (click để lật) ===== */}
        <Flashcard
          key={currentWord.id}
          original={currentWord.original}
          translation={currentWord.translation}
          pronunciation={currentWord.pronunciation}
          example={currentWord.example}
          exampleTranslation={currentWord.exampleTranslation}
          masteryLevel={currentMastery}
          onFlip={handleFlip}
        />

        {/* ===== BƯỚC 2: Nút đánh giá (chỉ hiện SAU khi lật) ===== */}
        <div className={`w-full transition-all duration-300 ${
          isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}>
          {/* Flash feedback overlay */}
          {flashResult ? (
            <div className={`w-full h-16 rounded-[20px] flex items-center justify-center font-heading font-black text-base gap-3 ${
              flashResult === 'correct'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-600'
            }`}>
              {flashResult === 'correct'
                ? `⭐ Level ${Math.min(5, currentMastery + 1)}/5 — Tuyệt vời!`
                : '💪 Tiếp tục cố gắng! Ôn lại sau 30 phút'}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* ❌ Chưa thuộc → SRS reset */}
              <button
                onClick={() => handleGrade(false)}
                disabled={isPending}
                className="h-16 rounded-[20px] border-2 border-red-200 bg-red-50 text-red-600 font-heading font-black text-sm
                  flex items-center justify-center gap-3
                  hover:bg-red-100 active:scale-95 transition-all shadow-clay-button disabled:opacity-50"
              >
                <span className="text-2xl">😅</span>
                <div className="text-left">
                  <div className="leading-tight">Chưa thuộc</div>
                  <div className="text-[10px] font-normal opacity-60">Ôn lại sau 30 phút</div>
                </div>
              </button>

              {/* ✅ Đã nhớ → SRS level up */}
              <button
                onClick={() => handleGrade(true)}
                disabled={isPending}
                className="h-16 rounded-[20px] border-2 border-emerald-200 bg-emerald-50 text-emerald-700 font-heading font-black text-sm
                  flex items-center justify-center gap-3
                  hover:bg-emerald-100 active:scale-95 transition-all shadow-clay-button disabled:opacity-50"
              >
                <span className="text-2xl">🎯</span>
                <div className="text-left">
                  <div className="leading-tight">Đã nhớ!</div>
                  <div className="text-[10px] font-normal opacity-60">
                    {`Ôn lại sau ${Math.pow(2, Math.min(5, currentMastery + 1))} ngày`}
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Gợi ý khi chưa lật (Bước 1) */}
        {!isFlipped && (
          <p className="text-xs text-clay-muted font-bold uppercase tracking-widest animate-pulse">
            👆 Chạm vào thẻ để xem nghĩa
          </p>
        )}
      </div>

      {/* === Nav phụ: Quay lại + Bỏ qua (luôn hiện) === */}
      <div className="mt-4 grid grid-cols-2 gap-4 pb-6">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className={`h-12 rounded-[20px] shadow-clay-button transition-all flex items-center justify-center gap-2 text-sm ${
            currentIndex === 0
              ? 'bg-soft-gray/20 text-clay-muted/30 cursor-not-allowed'
              : 'bg-warm-white text-clay-deep border-2 border-soft-gray/30 hover:shadow-clay-button-hover active:scale-95'
          }`}
        >
          <span>←</span>
          <span className="font-heading font-bold">Quay lại</span>
        </button>

        <button
          onClick={goNext}
          className="h-12 bg-soft-gray/20 text-clay-muted border-2 border-soft-gray/30 rounded-[20px] shadow-clay-button
            hover:bg-soft-gray/30 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <span className="font-heading font-bold">
            {isLastWord ? 'Kết thúc 🎉' : 'Bỏ qua →'}
          </span>
        </button>
      </div>
    </div>
  )
}
