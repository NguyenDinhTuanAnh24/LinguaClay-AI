'use client'

import React, { useState, useCallback } from 'react'

interface FlashcardProps {
  original: string
  translation: string
  pronunciation: string | null
  example: string | null
  exampleTranslation: string | null
  language?: string
  masteryLevel?: number   // 0–5
  onFlip?: () => void
}

export default function Flashcard({ original, translation, pronunciation, example, exampleTranslation, language = 'EN', masteryLevel = 0, onFlip }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const playPronunciation = useCallback((text: string, lang?: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang || (language === 'CN' ? 'zh-CN' : 'en-US')
    utterance.rate = 0.85  // Chậm hơn một chút cho dễ nghe
    utterance.pitch = 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [language])

  const handleClick = () => {
    if (!isFlipped) {
      // Lật từ mặt trước → mặt sau: thông báo cho parent
      setIsFlipped(true)
      onFlip?.()
    } else {
      // Lật ngược lại chỉ flip thẻ, không kích hoạt onFlip
      setIsFlipped(false)
    }
  }


  // Mastery bar config
  const MASTERY_MAX = 5
  const isMastered = masteryLevel >= MASTERY_MAX

  return (
    <div className="w-full aspect-[3/4] max-h-[520px] select-none">
      <div 
        className="relative w-full h-full bg-warm-white rounded-[45px] shadow-clay-card border-4 border-white overflow-hidden cursor-pointer"
        onClick={handleClick}
      >
        {/* Floating decoration circles */}
        <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-clay-blue/5 border-2 border-clay-blue/10 pointer-events-none" />
        <div className="absolute bottom-8 right-8 w-24 h-24 rounded-full bg-clay-orange/5 border-2 border-clay-orange/10 pointer-events-none" />
        <div className="absolute top-1/3 right-4 w-8 h-8 rounded-full bg-clay-green/10 pointer-events-none" />

        {/* ===== MẶT TRƯỚC: Từ vựng ===== */}
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center space-y-6 p-10 transition-all duration-500 ${
            isFlipped ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          {/* Lớp 1: Label */}
          <span className="px-4 py-1.5 rounded-full bg-clay-cream text-clay-muted text-[10px] tracking-[0.25em] font-black uppercase shadow-clay-inset">
            VOCABULARY · {language === 'CN' ? 'CN' : 'EN'}
          </span>

          {/* Lớp 2: Từ vựng + Nút Loa */}
          <div className="flex items-center gap-4">
            <h1 className="text-5xl md:text-6xl font-heading font-black text-clay-deep tracking-tight drop-shadow-sm text-center leading-tight">
              {original}
            </h1>

            {/* Nút Loa Đất Sét */}
            <button
              onClick={(e) => {
                e.stopPropagation() // Không lật thẻ khi bấm loa
                playPronunciation(original)
              }}
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
                ${isSpeaking 
                  ? 'bg-clay-blue/20 shadow-clay-inset text-clay-blue scale-95' 
                  : 'bg-clay-cream shadow-clay-button text-clay-muted hover:text-clay-blue active:shadow-clay-inset active:scale-90'
                }`}
              title="Phát âm"
            >
              {isSpeaking ? (
                // Sóng âm khi đang phát
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
          </div>

          {/* Lớp 3: Phiên âm */}
          {pronunciation && (
            <div className="px-6 py-2.5 rounded-2xl bg-clay-cream text-clay-muted font-mono text-base shadow-clay-inset">
              {pronunciation}
            </div>
          )}

          {/* Lớp 4: Divider */}
          <div className="w-16 h-[3px] bg-soft-gray/40 rounded-full" />

          {/* Lớp 5: Gợi ý lật thẻ */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-clay-cream rounded-full flex items-center justify-center shadow-clay-button animate-breathe">
              <span className="text-xl">👆</span>
            </div>
            <span className="text-[10px] text-clay-muted uppercase tracking-wider font-bold">Chạm để xem nghĩa</span>
          </div>
        </div>

        {/* ===== MẶT SAU: Giải nghĩa ===== */}
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center space-y-5 p-10 transition-all duration-500 ${
            isFlipped ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
          }`}
          style={{ backgroundColor: '#F0EBFF' }}
        >
          <div className="absolute top-4 right-6 w-20 h-20 rounded-full bg-clay-blue/8 border-2 border-clay-blue/10 pointer-events-none" />
          <div className="absolute bottom-6 left-6 w-16 h-16 rounded-full bg-clay-green/8 border-2 border-clay-green/10 pointer-events-none" />

          {/* Label */}
          <span className="px-4 py-1.5 rounded-full text-[10px] tracking-[0.25em] font-black uppercase bg-clay-blue/15 text-clay-blue shadow-clay-inset">
            NGHĨA · VI
          </span>

          {/* Từ gốc nhỏ */}
          <p className="text-sm font-heading font-black text-clay-muted/60 tracking-wider">{original}</p>

          {/* Nghĩa tiếng Việt */}
          <h3 className="text-3xl md:text-4xl font-heading font-black text-clay-deep text-center leading-tight">
            {translation}
          </h3>

          {/* Divider */}
          <div className="w-16 h-[3px] bg-clay-blue/20 rounded-full" />

          {/* Câu ví dụ */}
          {example && (
            <div className="w-full p-5 bg-white/50 rounded-[25px] border-2 border-white/70 shadow-clay-inset space-y-2">
              <p className="text-sm italic text-clay-deep leading-relaxed font-medium text-center">
                "{example}"
              </p>
              {exampleTranslation && (
                <>
                  <div className="w-10 h-[2px] bg-clay-blue/20 rounded-full mx-auto" />
                  <p className="text-xs text-clay-muted font-medium text-center leading-relaxed">
                    {exampleTranslation}
                  </p>
                </>
              )}
            </div>
          )}

          <span className="text-[10px] text-clay-muted/50 uppercase tracking-wider font-bold">Chạm để quay lại</span>
        </div>
      </div>

      {/* ===== MASTERY BAR (5 đốm đất sét) ===== */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-1.5 px-10">
        <div className="flex items-center gap-2">
          {Array.from({ length: MASTERY_MAX }).map((_, i) => (
            <div
              key={i}
              className={`w-7 h-3 rounded-full transition-all duration-500 ${
                i < masteryLevel
                  ? isMastered
                    ? 'bg-clay-green shadow-[0_2px_6px_rgba(168,213,186,0.6)]'
                    : 'bg-clay-orange shadow-[0_2px_6px_rgba(244,164,96,0.5)]'
                  : 'bg-soft-gray/40 shadow-clay-inset'
              }`}
            />
          ))}
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest ${
          isMastered ? 'text-clay-green' : masteryLevel > 0 ? 'text-clay-orange' : 'text-clay-muted/40'
        }`}>
          {isMastered ? '✨ Thuộc lòng!' : masteryLevel > 0 ? `Level ${masteryLevel}/${MASTERY_MAX}` : 'Chưa học'}
        </span>
      </div>
    </div>
  )
}
