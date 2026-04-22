'use client'

import React, { useCallback, useState } from 'react'
import { LoaderCircle, Volume2 } from 'lucide-react'

interface FlashcardProps {
  original: string
  translation: string
  pronunciation: string | null
  example: string | null
  exampleTranslation: string | null
  language?: string
  masteryLevel?: number
  sessionProgress?: number
  sessionTotal?: number
  onFlip?: () => void
}

export default function Flashcard({
  original,
  translation,
  pronunciation,
  example,
  exampleTranslation,
  language = 'EN',
  masteryLevel = 0,
  sessionProgress = 0,
  sessionTotal = 0,
  onFlip,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const playPronunciation = useCallback(
    (text: string, lang?: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang || (language === 'CN' ? 'zh-CN' : 'en-US')
      utterance.rate = 0.85
      utterance.pitch = 1
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    },
    [language],
  )

  const handleClick = () => {
    if (!isFlipped) {
      setIsFlipped(true)
      onFlip?.()
      return
    }
    setIsFlipped(false)
  }

  const MASTERY_MAX = 5
  const progressLevel =
    sessionTotal > 0
      ? Math.max(0, Math.min(MASTERY_MAX, Math.round((sessionProgress / sessionTotal) * MASTERY_MAX)))
      : Math.max(0, Math.min(MASTERY_MAX, masteryLevel))
  const isMastered = progressLevel >= MASTERY_MAX

  return (
    <div className="w-full select-none dashboard-theme">
      <div
        className={`relative w-full h-full bg-[#F5F0E8] border-[4px] border-newsprint-black shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] transition-all duration-500 cursor-pointer overflow-hidden ${
          isFlipped
            ? 'shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] translate-x-[6px] translate-y-[6px]'
            : 'hover:-translate-y-0.5 hover:shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]'
        }`}
        style={{ aspectRatio: '3 / 4', maxHeight: 520 }}
        onClick={handleClick}
      >
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center space-y-8 p-10 transition-all duration-500 ${
            isFlipped ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          <span className="px-4 py-1 bg-red-600 text-white text-[10px] tracking-[0.25em] font-black uppercase flex items-center gap-1.5">
            Từ vựng <span className="font-sans text-[12px] translate-y-[0px]">&bull;</span> {language === 'CN' ? 'CN' : 'EN'}
          </span>

          <div className="flex flex-col items-center gap-6 w-full px-10">
            <h1 
              className="font-serif font-black text-newsprint-black tracking-tight text-center leading-tight uppercase underline decoration-[4px] decoration-red-600 underline-offset-8 break-words w-full"
              style={{ 
                fontSize: original.length > 12 ? '1.8rem' : original.length > 8 ? '2.5rem' : '3.5rem',
              }}
            >
              {original}
            </h1>

            <button
              onClick={(e) => {
                e.stopPropagation()
                playPronunciation(original)
              }}
              className={`flex-shrink-0 w-14 h-14 border-[3px] border-newsprint-black flex items-center justify-center transition-all duration-200 ${
                isSpeaking
                  ? 'bg-newsprint-black text-white shadow-none translate-x-1 translate-y-1'
                  : 'bg-white text-newsprint-black shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]'
              }`}
              title="Phát âm"
            >
              {isSpeaking ? <LoaderCircle className="w-6 h-6 animate-spin" strokeWidth={3} /> : <Volume2 className="w-6 h-6" strokeWidth={3} />}
            </button>
          </div>

          {pronunciation && (
            <div className="font-mono text-lg font-bold text-newsprint-black/70 border-b-2 border-newsprint-black/30 pb-1">
              /{pronunciation}/
            </div>
          )}

          <div className="px-4 py-2 bg-white border-[2px] border-newsprint-black text-[10px] font-black uppercase tracking-widest animate-pulse">
            Chạm để xem nghĩa
          </div>
        </div>

        <div
          className={`absolute inset-0 flex flex-col items-center justify-center space-y-6 p-10 transition-all duration-500 bg-white ${
            isFlipped ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
        >
          <span className="px-4 py-1 bg-red-600 text-white text-[10px] tracking-[0.25em] font-black uppercase flex items-center gap-1.5">
            Nghĩa <span className="font-sans text-[12px] translate-y-[0px]">&bull;</span> Tiếng Việt
          </span>

          <p className="text-[10px] font-black text-newsprint-black/50 tracking-[0.3em] uppercase">{original}</p>

          <h3 
            className="font-serif font-black text-newsprint-black text-center leading-tight uppercase break-words w-full px-10"
            style={{ 
              fontSize: translation.length > 15 ? '1.4rem' : '2.2rem',
            }}
          >
            {translation}
          </h3>

          {example && (
            <div className="w-full p-6 bg-[#F5F0E8] border-[3px] border-newsprint-black shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] space-y-3">
              <p className="text-sm italic text-newsprint-black leading-relaxed font-bold text-center">
                &ldquo;{example}&rdquo;
              </p>
              {exampleTranslation && (
                <>
                  <div className="w-12 h-[2px] bg-newsprint-black mx-auto" />
                  <p className="text-[10px] text-newsprint-black/70 font-bold text-center leading-relaxed uppercase tracking-tight px-2">{exampleTranslation}</p>
                </>
              )}
            </div>
          )}

          <span className="text-[9px] text-newsprint-black/50 uppercase tracking-[0.3em] font-black">Chạm để quay lại</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-2 px-10">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: MASTERY_MAX }).map((_, i) => (
            <div
              key={i}
              className={`w-10 h-2 border-[1.5px] border-newsprint-black transition-all duration-500 ${
                i < progressLevel ? 'bg-red-600' : 'bg-white'
              }`}
            />
          ))}
        </div>
        <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${isMastered ? 'text-red-600' : 'text-newsprint-black/50'}`}>
          {isMastered
            ? 'ĐÃ HOÀN THÀNH'
            : sessionTotal > 0
              ? `ĐÃ HỌC ${sessionProgress}/${sessionTotal}`
              : progressLevel > 0
                ? `LEVEL ${progressLevel}/${MASTERY_MAX}`
                : 'CHƯA HỌC'}
        </span>
      </div>
    </div>
  )
}
