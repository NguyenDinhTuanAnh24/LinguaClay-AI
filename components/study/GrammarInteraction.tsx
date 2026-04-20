'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import SentenceScramble from './SentenceScramble'

export default function GrammarInteraction({ point }: { point: any }) {
  const [showExercise, setShowExercise] = useState(false)

  return (
    <div className="space-y-12">
      {/* Action Zone */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8">
        {point.topicId && (
          <Link 
            href={`/study/${point.topic?.slug}`}
            className="w-full sm:w-auto px-10 py-5 bg-white rounded-full font-heading font-black text-clay-deep shadow-clay-button border-2 border-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <span>🃏</span> Học Flashcard liên quan
          </Link>
        )}
        <button 
          onClick={() => setShowExercise(true)}
          className="w-full sm:w-auto px-10 py-5 bg-clay-blue text-white rounded-full font-heading font-black shadow-clay-button border-4 border-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <span>🎮</span> Bắt đầu luyện tập
        </button>
      </div>

      {/* Exercise Overlay */}
      {showExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-clay-deep/20 backdrop-blur-sm" 
            onClick={() => setShowExercise(false)}
          />
          <div className="relative w-full max-w-2xl animate-scaleIn">
             <div className="absolute -top-4 -right-4 z-10">
               <button 
                onClick={() => setShowExercise(false)}
                className="w-10 h-10 bg-white rounded-full shadow-clay-button flex items-center justify-center font-black text-clay-muted hover:text-clay-pink transition-colors"
               >
                 ✕
               </button>
             </div>
             <SentenceScramble 
               sentence={point.example || ""} 
               translation={point.exampleSentence || ""}
               onSuccess={() => {
                 console.log("Success! Practice completed.")
               }}
             />
          </div>
        </div>
      )}
    </div>
  )
}
