'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Lightbulb, RotateCcw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'

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

  // Hàm làm sạch câu và tách từ chuyên sâu (kept same)
  const getCleanWords = (str: string) => {
    let text = str.trim()
    text = text.replace(/([.,!?;])$/, ' $1')
    const words = text.split(' ').filter(w => w.length > 0)
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
        colors: ['#141414', '#dc2626', '#2563eb', '#16a34a']
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
    <div className="w-full max-w-xl mx-auto bg-white border-[4px] border-newsprint-black shadow-brutalist-heavy p-8 space-y-10 my-8 relative overflow-hidden text-left">
      <div className="border-b-[3px] border-newsprint-black pb-6">
        <h3 className="text-3xl font-serif font-black text-newsprint-black uppercase tracking-tighter leading-none">Scramble <span className="text-red-600 italic">Game</span></h3>
        <p className="text-[10px] text-newsprint-gray-dark font-sans font-black tracking-[0.2em] uppercase mt-2">GHÉP CÂU HOÀN CHỈNH ĐỂ TIẾP TỤC</p>
      </div>

      {/* Answer Dropzone */}
      <div className={`min-h-[160px] p-6 border-[3px] transition-all duration-300 flex flex-wrap gap-3 items-center justify-center relative ${
        status === 'correct' ? 'bg-green-50 border-green-600' : 
        status === 'wrong' ? 'bg-red-50 border-red-600' : 'bg-newsprint-paper border-newsprint-black'
      }`}>
        {selected.map((word: string, i: number) => (
          <motion.button
            layoutId={`word-${word}-${i}`}
            key={`sel-${i}`}
            onClick={() => handleRemove(i)}
            className="px-5 py-2.5 bg-newsprint-black text-white border-[2px] border-newsprint-black font-sans font-black text-xs uppercase tracking-widest shadow-brutalist-soft active:translate-y-1 active:shadow-none"
          >
            {word}
          </motion.button>
        ))}
        {selected.length === 0 && (
          <span className="text-newsprint-black/20 font-serif font-black italic text-xl uppercase tracking-tighter opacity-50">Sắp xếp các từ...</span>
        )}

        {status === 'correct' && (
          <div className="absolute top-2 right-2 text-green-600 animate-bounce">
            <CheckCircle2 size={24} strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Available Chips */}
      <div className="space-y-6">
        {translation && (
          <div className="flex flex-col items-center">
             <button
              onClick={() => setShowHint(!showHint)}
              className={`px-6 py-2 border-[2px] border-newsprint-black font-sans font-black text-[9px] uppercase tracking-widest flex items-center gap-3 transition-all ${
                showHint ? 'bg-newsprint-black text-white' : 'bg-white text-newsprint-black hover:bg-newsprint-paper'
              }`}
            >
              <Lightbulb size={14} strokeWidth={3} />
              {showHint ? 'ẨN GỢI Ý' : 'XEM GỢI Ý'}
            </button>

            <AnimatePresence>
              {showHint && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-4 w-full"
                >
                  <p className="px-6 py-4 bg-newsprint-paper border-[2px] border-newsprint-black text-newsprint-black text-xs font-sans font-bold uppercase tracking-tight italic text-center">
                    "{translation}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center min-h-[100px] bg-newsprint-paper/30 p-4 border-[2px] border-dashed border-newsprint-black/20">
          {shuffled.map((word: string, i: number) => (
            <motion.button
              layout
              key={`shuf-${word}-${i}`}
              onClick={() => handlePick(word, i)}
              whileHover={{ translateZ: 0, rotate: word.length % 2 === 0 ? 1 : -1 }}
              className="px-5 py-2.5 bg-white border-[2px] border-newsprint-black font-sans font-black text-xs uppercase tracking-widest shadow-brutalist-soft hover:bg-newsprint-paper transition-all"
            >
              {word}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={reset}
          className="px-6 py-4 border-[3px] border-newsprint-black font-sans font-black text-[10px] uppercase tracking-widest hover:bg-newsprint-paper active:bg-newsprint-gray-light transition-all flex items-center justify-center gap-3"
        >
          <RotateCcw size={16} strokeWidth={3} /> LÀM LẠI
        </button>
        <button
          onClick={checkResult}
          disabled={selected.length === 0}
          className={`flex-1 py-5 border-[3px] border-newsprint-black font-sans font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 ${
            selected.length === 0 ? 'bg-newsprint-gray-light text-newsprint-gray cursor-not-allowed border-newsprint-gray' : 
            status === 'correct' ? 'bg-green-600 text-white border-green-600' : 'bg-newsprint-black text-white hover:bg-red-600'
          }`}
        >
          {status === 'correct' ? (
            <>TUYỆT VỜI <Sparkles size={20} strokeWidth={3} /></>
          ) : (
            'KIỂM TRA ĐÁP ÁN'
          )}
        </button>
      </div>

      {status === 'wrong' && (
        <motion.div 
          initial={{ x: -10 }} 
          animate={{ x: [10, -10, 10, -10, 0] }}
          className="flex items-center justify-center gap-2 text-red-600"
        >
          <AlertCircle size={14} strokeWidth={3} />
          <p className="text-[9px] font-sans font-black uppercase tracking-widest">Đáp án chưa chính xác. Hãy thử lại!</p>
        </motion.div>
      )}
    </div>
  )
}
