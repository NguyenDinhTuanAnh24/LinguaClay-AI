'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface SentenceScrambleProps {
  sentence: string
  translation?: string
  onSuccess?: () => void
}

export default function SentenceScramble({ sentence, translation, onSuccess }: SentenceScrambleProps) {
  const [shuffled, setShuffled] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [showHint, setShowHint] = useState(false)

  // Hàm làm sạch câu và tách từ chuyên sâu
  const getCleanWords = (str: string) => {
    let text = str.trim()
    // Tách dấu câu cuối ra thành một phần riêng (để không dính vào chữ)
    text = text.replace(/([.,!?;])$/, ' $1')
    
    const words = text.split(' ').filter(w => w.length > 0)
    
    // Tự động viết thường chữ đầu tiên (nếu không phải là "I") để không làm lộ đáp án
    if (words.length > 0 && words[0] !== "I" && words[0].length > 1) {
      words[0] = words[0].toLowerCase()
    }
    
    return words
  }

  useEffect(() => {
    const words = getCleanWords(sentence)
    setShuffled([...words].sort(() => Math.random() - 0.5))
    setSelected([])
    setStatus('idle')
    setShowHint(false)
  }, [sentence])

  const handlePick = (word: string, index: number) => {
    setSelected([...selected, word])
    const newShuffled = [...shuffled]
    newShuffled.splice(index, 1)
    setShuffled(newShuffled)
    setStatus('idle')
  }

  const handleRemove = (index: number) => {
    const word = selected[index]
    const newSelected = [...selected]
    newSelected.splice(index, 1)
    setSelected(newSelected)
    setShuffled([...shuffled, word])
    setStatus('idle')
  }

  const checkResult = () => {
    const target = getCleanWords(sentence).join(' ')
    const result = selected.join(' ')
    
    if (result.toLowerCase() === target.toLowerCase()) {
      setStatus('correct')
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#A8D5BA', '#88C9E8', '#F4A460', '#F2A0A0']
      })

      if (onSuccess) onSuccess()
    } else {
      setStatus('wrong')
    }
  }

  const reset = () => {
    const words = getCleanWords(sentence)
    setShuffled([...words].sort(() => Math.random() - 0.5))
    setSelected([])
    setStatus('idle')
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white/70 backdrop-blur-md rounded-[40px] shadow-clay-card border-4 border-white p-8 space-y-6 my-6 relative overflow-hidden">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-heading font-black text-clay-deep uppercase tracking-tight">Unscramble the sentence</h3>
        <p className="text-[10px] text-clay-muted font-bold tracking-widest uppercase">Ghép câu hoàn chỉnh</p>
      </div>

      {/* Answer Dropzone */}
      <div className={`min-h-[140px] p-6 rounded-[35px] border-4 border-dashed transition-all duration-300 flex flex-wrap gap-2.5 items-center justify-center shadow-clay-inset relative ${
        status === 'correct' ? 'border-clay-green/30 bg-clay-green/5' : 
        status === 'wrong' ? 'border-clay-pink/30 bg-clay-pink/5' : 'border-clay-muted/10 bg-white/30'
      }`}>
        {selected.map((word: string, i: number) => (
          <motion.button
            layoutId={`word-${word}-${i}`}
            key={`sel-${i}`}
            onClick={() => handleRemove(i)}
            className="px-4 py-2 bg-clay-blue text-white rounded-[18px] font-bold shadow-clay-button-sm active:scale-95 border-2 border-white text-sm"
          >
            {word}
          </motion.button>
        ))}
        {selected.length === 0 && (
          <span className="text-clay-muted/30 font-black italic text-sm uppercase tracking-tighter">Tap the words below...</span>
        )}
      </div>

      {/* Optimized Hint Position (Right below Dropzone) */}
      <div className="flex flex-col items-center gap-3">
        {translation && (
          <div className="w-full flex flex-col items-center">
             <button
              onClick={() => setShowHint(!showHint)}
              className={`px-4 py-1.5 rounded-full flex items-center gap-2 transition-all border-2 shadow-clay-button-sm ${
                showHint ? 'bg-clay-orange text-white border-white scale-95' : 'bg-white text-clay-orange border-clay-orange/10 hover:bg-clay-orange/5'
              }`}
            >
              <span className="text-sm">💡</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{showHint ? 'Hide Hint' : 'Show Hint'}</span>
            </button>

            <AnimatePresence>
              {showHint && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mt-3 overflow-hidden w-full text-center"
                >
                  <p className="px-6 py-3 bg-clay-orange/5 text-clay-deep text-sm font-bold rounded-[20px] border border-clay-orange/10 italic">
                    "{translation}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Available Chips */}
      <div className="flex flex-wrap gap-2.5 justify-center min-h-[90px] pt-4">
        {shuffled.map((word: string, i: number) => (
          <motion.button
            layout
            key={`shuf-${word}-${i}`}
            onClick={() => handlePick(word, i)}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 bg-white rounded-[22px] font-bold shadow-clay-button text-clay-deep border-2 border-clay-cream text-sm hover:border-clay-blue/20 transition-colors"
          >
            {word}
          </motion.button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6 border-t-2 border-clay-cream/30">
        <button
          onClick={reset}
          className="w-1/4 py-3.5 bg-white/50 rounded-full font-bold text-xs shadow-clay-button text-clay-muted hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-clay-cream"
        >
          🔄 Reset
        </button>
        <button
          onClick={checkResult}
          disabled={selected.length === 0}
          className={`flex-1 py-4 rounded-full font-heading font-black text-lg shadow-clay-card transition-all border-4 border-white ${
            selected.length === 0 ? 'bg-clay-muted/20 text-clay-muted cursor-not-allowed' : 
            status === 'correct' ? 'bg-clay-green text-white' : 'bg-clay-blue text-white hover:scale-[1.02] active:scale-95'
          }`}
        >
          {status === 'correct' ? 'Awesome! ✨' : 'Check Completion'}
        </button>
      </div>

      {status === 'wrong' && (
        <motion.div 
          initial={{ x: -10 }} 
          animate={{ x: [10, -10, 10, -10, 0] }}
          className="text-center"
        >
          <p className="text-[10px] font-black text-clay-pink uppercase tracking-widest">❌ That's not quite right. Try swapping some words!</p>
        </motion.div>
      )}
    </div>
  )
}
