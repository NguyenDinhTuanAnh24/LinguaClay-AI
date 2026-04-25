'use client'

import React, { useState, useEffect } from 'react'

interface Exercise {
  id: string
  type: 'word_choice' | 'reordering' | 'fill_blank'
  question: string
  correctAnswer: string
  options?: string[]
  explanation?: string
  content?: unknown
}

interface ExerciseEngineProps {
  exercises: Exercise[]
  onComplete: (data: { finished: boolean }) => void
}

export default function ExerciseEngine({ exercises, onComplete }: ExerciseEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState<string>('')
  const [selectedChips, setSelectedChips] = useState<string[]>([])
  const [shuffledChips, setShuffledChips] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)

  const current = exercises[currentIndex]

  // Prepare chips for reordering
  useEffect(() => {
    if (current?.type === 'reordering') {
      const chips = current.correctAnswer.split(' ')
      setShuffledChips([...chips].sort(() => Math.random() - 0.5))
      setSelectedChips([])
      setUserAnswer('')
    } else {
      setUserAnswer('')
    }
    setIsCorrect(null)
    setShowExplanation(false)
  }, [currentIndex, current])

  const checkAnswer = () => {
    let correct = false
    if (current.type === 'reordering') {
      const finalAnswer = selectedChips.join(' ')
      correct = finalAnswer.trim() === current.correctAnswer.trim()
    } else if (current.type === 'fill_blank') {
      correct = userAnswer.trim().toLowerCase() === current.correctAnswer.trim().toLowerCase()
    } else {
      correct = userAnswer === current.correctAnswer
    }

    setIsCorrect(correct)
    setShowExplanation(true)
  }

  const nextExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onComplete({ finished: true })
    }
  }

  const handleChipClick = (chip: string, index: number) => {
    setSelectedChips([...selectedChips, chip])
    const newShuffled = [...shuffledChips]
    newShuffled.splice(index, 1)
    setShuffledChips(newShuffled)
  }

  const removeChip = (index: number) => {
    const chip = selectedChips[index]
    const newSelected = [...selectedChips]
    newSelected.splice(index, 1)
    setSelectedChips(newSelected)
    setShuffledChips([...shuffledChips, chip])
  }

  if (!current) return null

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Progress */}
      <div className="flex justify-between items-center px-2">
        <span className="text-xs font-black text-clay-muted uppercase tracking-widest">
          Bài tập {currentIndex + 1} / {exercises.length}
        </span>
        <div className="w-32 h-3 bg-white/50 rounded-full shadow-clay-inset overflow-hidden border-2 border-white">
          <div 
            className="h-full bg-clay-blue transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-warm-white rounded-[40px] shadow-clay-card border-4 border-white p-8 md:p-10 space-y-8">
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-heading font-black text-clay-deep">{current.question}</h2>
            {current.type === 'fill_blank' && (
               <p className="text-xs font-bold text-clay-muted italic">Điền từ còn thiếu vào ô trống</p>
            )}
            {current.type === 'reordering' && (
               <p className="text-xs font-bold text-clay-muted italic">Sắp xếp các từ thành câu đúng</p>
            )}
        </div>

        {/* REORDERING UI */}
        {current.type === 'reordering' && (
          <div className="space-y-10">
            {/* Answer Area */}
            <div className="min-h-[100px] p-6 bg-white/50 rounded-[30px] border-4 border-dashed border-clay-muted/20 flex flex-wrap gap-2 items-center justify-center shadow-clay-inset">
              {selectedChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => removeChip(i)}
                  className="px-4 py-2 bg-clay-blue text-white rounded-full font-bold shadow-clay-button animate-slideUp active:scale-90 transition-all border-2 border-white"
                >
                  {chip}
                </button>
              ))}
              {selectedChips.length === 0 && (
                <span className="text-clay-muted/40 font-bold italic">Chọn các từ bên dưới...</span>
              )}
            </div>

            {/* Chips Available */}
            <div className="flex flex-wrap gap-3 justify-center">
              {shuffledChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleChipClick(chip, i)}
                  className="px-5 py-2.5 bg-white rounded-full font-bold shadow-clay-button hover:-translate-y-1 active:translate-y-0.5 transition-all text-clay-deep border-2 border-white"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FILL BLANK UI */}
        {current.type === 'fill_blank' && (
          <div className="flex justify-center">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Nhập đáp án..."
              className="text-center w-full max-w-sm px-6 py-4 bg-white rounded-full shadow-clay-inset border-4 border-white focus:outline-none focus:border-clay-blue/30 text-xl font-black text-clay-deep transition-all"
              onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
            />
          </div>
        )}

        {/* Feedback Section */}
        {isCorrect !== null && (
          <div className={`p-6 rounded-[30px] border-4 border-white shadow-clay-card animate-fadeIn ${
            isCorrect ? 'bg-clay-green/10 text-clay-green' : 'bg-clay-pink/10 text-clay-pink'
          }`}>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-2xl">{isCorrect ? '✨' : '❌'}</span>
              <span className="font-heading font-black text-lg">
                {isCorrect ? 'Tuyệt vời, chính xác!' : 'Hic, sai mất rồi!'}
              </span>
            </div>
            {current.explanation && (
              <p className="text-xs font-bold opacity-80 pl-10 leading-relaxed italic">
                💡 {current.explanation}
              </p>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4">
          {isCorrect === null ? (
            <button
              onClick={checkAnswer}
              className="w-full py-5 bg-clay-blue text-white rounded-full font-heading font-black text-xl shadow-clay-button hover:scale-[1.02] active:scale-95 transition-all border-4 border-white"
            >
              Kiểm tra đáp án 🏺
            </button>
          ) : (
            <button
              onClick={nextExercise}
              className="w-full py-5 bg-clay-green text-white rounded-full font-heading font-black text-xl shadow-clay-button hover:scale-[1.02] active:scale-95 transition-all animate-fadeIn border-4 border-white"
            >
              Tiếp tục bài tiếp theo ▶
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
