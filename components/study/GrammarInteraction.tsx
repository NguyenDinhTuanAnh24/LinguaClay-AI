'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import SentenceScramble from './SentenceScramble'

export default function GrammarInteraction({ point }: { point: any }) {
  const [showExercise, setShowExercise] = useState(false)

  return (
    <div className="space-y-12 dashboard-theme">
      {/* Action Zone */}
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-center pt-8">
        {point.topicId && (
          <Link 
            href={`/study/${point.topic?.slug}`}
            className="w-full sm:w-auto px-10 py-5 bg-white border-[3px] border-newsprint-black font-black text-xs uppercase tracking-widest text-newsprint-black shadow-brutalist-soft hover:-translate-y-1 hover:shadow-brutalist-card transition-all flex items-center justify-center gap-4"
          >
            <span>🃏</span> FLASHCARD LIÊN QUAN
          </Link>
        )}
        <button 
          onClick={() => setShowExercise(true)}
          className="w-full sm:w-auto px-10 py-5 bg-red-600 text-white border-[3px] border-newsprint-black font-black text-xs uppercase tracking-widest shadow-brutalist-soft hover:-translate-y-1 hover:shadow-brutalist-card transition-all flex items-center justify-center gap-4"
        >
          <span>🎮</span> KHỞI ĐỘNG LUYỆN TẬP
        </button>
      </div>

      {/* Exercise Overlay */}
      {showExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-newsprint-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl">
             <div className="absolute -top-4 -right-4 z-[60]">
               <button 
                onClick={() => setShowExercise(false)}
                className="w-12 h-12 bg-white border-[3px] border-newsprint-black shadow-brutalist-soft flex items-center justify-center font-black text-newsprint-black hover:bg-red-600 hover:text-white transition-all rotate-3 hover:rotate-0"
               >
                 ✕
               </button>
             </div>
             
             <div className="mb-6 bg-newsprint-paper border-[3px] border-newsprint-black p-6 shadow-brutalist-card text-center relative z-10 -rotate-1">
                <h4 className="font-serif font-black text-newsprint-black text-xl uppercase tracking-tighter">PHÒNG LUYỆN TẬP NGỮ PHÁP</h4>
             </div>

             <SentenceScramble 
               sentence={point.example || ""} 
               translation={point.exampleSentence || ""}
               onSuccess={() => {
                 // practice completed without errors
               }}
             />
          </div>
        </div>
      )}
    </div>
  )
}
