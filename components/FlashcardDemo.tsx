'use client'

import React, { useState, useEffect } from 'react'

const FlashcardDemo = () => {
  const [isFlipped, setIsFlipped] = useState(false)

  // Auto-flip cycle: 3s front → 3s back → repeat
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipped(prev => !prev)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="w-full max-w-lg mx-auto"
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s ease-in-out',
          minHeight: '280px'
        }}
        onClick={(e) => {
          e.preventDefault()
          setIsFlipped(!isFlipped)
        }}
      >
        {/* Front - English word */}
        <div
          className="absolute inset-0 flex flex-col justify-center items-center border-[3px] border-newsprint-black bg-[#F5F0E8] p-6 overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)'
          }}
        >
          <div className="absolute top-3 left-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-newsprint-gray-dark">
              TỪ VỰNG
            </span>
          </div>

          <div className="text-center space-y-4 w-full px-1">
            <div className="font-serif italic text-3xl font-black text-newsprint-black leading-tight tracking-tight">
              perseverance
            </div>
            <div className="text-xs font-mono text-newsprint-gray-dark">
              /pəˌsɪ.vɪˈrəns/
            </div>
          </div>

          <div className="absolute bottom-3 right-3">
            <div className="text-[9px] font-mono text-newsprint-gray-dark">
              Tap to flip →
            </div>
          </div>
        </div>

        {/* Back - Vietnamese meaning */}
        <div
          className="absolute inset-0 flex flex-col justify-center items-center border-[3px] border-newsprint-black bg-[#F5F0E8] p-6 overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="absolute top-3 left-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-newsprint-gray-dark">
              TỪ VỰNG
            </span>
          </div>

          <div className="vietnamese-text text-center w-full px-1">
            <div className="text-3xl font-serif font-black text-newsprint-black leading-tight mb-4 tracking-tight">
              sự kiên trì
            </div>
          </div>

          <div className="absolute bottom-3 right-3">
            <div className="text-[9px] font-mono text-newsprint-black bg-newsprint-cream px-2 py-1 uppercase border border-newsprint-black">
              SRS: 1h 23m
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlashcardDemo
