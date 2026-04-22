'use client'

import React, { useState } from 'react'

interface DashboardFlashcardProps {
  original: string
  translation: string
  pronunciation?: string | null
  srsLabel: string
}

export default function DashboardFlashcard({
  original,
  translation,
  pronunciation,
  srsLabel
}: DashboardFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="w-full aspect-square p-3 border-[3px] border-[#141414] bg-[#F5F0E8]/50 overflow-hidden">
      <div
        className="w-full h-full relative"
        style={{ perspective: '1000px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className="relative w-full h-full cursor-pointer transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* FRONT - Original Word */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center border-[3px] border-[#141414] bg-[#F5F0E8] p-5 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            <p className="absolute top-2.5 left-3 text-[9px] font-bold uppercase tracking-[0.2em] text-red-600">
              Từ vựng
            </p>
            
            <div className="text-center w-full px-8 flex flex-col items-center justify-center min-h-0">
              <h4 
                className="font-serif font-black italic text-[#141414] leading-[1.1] tracking-tight break-words w-full"
                style={{ 
                  fontSize: original.length > 15 ? '1.2rem' : '1.875rem',
                  maxWidth: '100%'
                }}
              >
                {original}
              </h4>
              {pronunciation && (
                <p className="text-[11px] font-mono text-[#141414]/40 mt-2">
                  /{pronunciation}/
                </p>
              )}
            </div>

            <div className="absolute bottom-2.5 right-3">
               <span className="text-[8px] font-mono text-[#141414]/30 uppercase tracking-widest">Lật mặt →</span>
            </div>
          </div>

          {/* BACK - Translation */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center border-[3px] border-[#141414] bg-[#F5F0E8] p-5 overflow-hidden`}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="absolute top-2.5 left-3 text-[9px] font-bold uppercase tracking-[0.2em] text-red-600">
              Nghĩa của từ
            </p>

            <div className="text-center w-full px-8 flex items-center justify-center min-h-0">
              <h4 
                className="font-serif font-black text-[#141414] vietnamese-text leading-[1.1] tracking-tight break-words w-full"
                style={{ 
                  fontSize: translation.length > 15 ? '1.2rem' : '1.875rem',
                  maxWidth: '100%'
                }}
              >
                {translation}
              </h4>
            </div>

            <div className="absolute bottom-2.5 right-3">
              <div className="border border-[#141414] px-2 py-0.5 text-[8px] font-black tracking-widest text-[#141414] uppercase bg-white/50 shadow-sm">
                {srsLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
