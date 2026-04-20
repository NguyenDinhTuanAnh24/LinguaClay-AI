'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SentenceScramble from '@/components/study/SentenceScramble'
import Link from 'next/link'

interface QuizPoint {
  id: string
  title: string
  example: string
  exampleSentence: string
}

export default function GrammarQuizPage() {
  const [points, setPoints] = useState<QuizPoint[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes
  const [status, setStatus] = useState<'loading' | 'started' | 'finished'>('loading')

  useEffect(() => {
    // Fetch random 20 points
    async function initQuiz() {
      try {
        const res = await fetch('/api/grammar/quiz-data')
        const data = await res.json()
        setPoints(data)
        setStatus('started')
      } catch (err) {
        console.error("Failed to load quiz data", err)
      }
    }
    initQuiz()
  }, [])

  useEffect(() => {
    if (status !== 'started' || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setStatus('finished')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [status, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleNext = (isCorrect: boolean) => {
    if (isCorrect) setScore(s => s + 1)
    
    if (currentIndex < points.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setStatus('finished')
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-20 h-20 border-8 border-clay-blue/20 border-t-clay-blue rounded-full animate-spin"></div>
        <p className="text-clay-muted font-black uppercase tracking-widest animate-pulse">Đang chuẩn bị đề thi...</p>
      </div>
    )
  }

  if (status === 'finished') {
    const percentage = Math.round((score / points.length) * 100)
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white rounded-[50px] shadow-clay-card border-8 border-white p-12 text-center space-y-8 mt-10"
      >
        <div className="text-6xl">🏆</div>
        <h2 className="text-4xl font-heading font-black text-clay-deep">Kết quả thử thách</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-clay-blue/5 p-6 rounded-[30px] border-2 border-clay-blue/10">
            <p className="text-3xl font-black text-clay-blue">{score} / {points.length}</p>
            <p className="text-xs font-bold text-clay-muted uppercase tracking-wider">Câu đúng</p>
          </div>
          <div className="bg-clay-green/5 p-6 rounded-[30px] border-2 border-clay-green/10">
            <p className="text-3xl font-black text-clay-green">{percentage}%</p>
            <p className="text-xs font-bold text-clay-muted uppercase tracking-wider">Độ chính xác</p>
          </div>
        </div>

        <div className="space-y-4">
          <Link 
            href="/dashboard/grammar"
            className="block w-full py-5 bg-clay-blue text-white rounded-full font-heading font-black shadow-clay-button border-4 border-white hover:scale-105 transition-all text-xl"
          >
            Quay lại thư viện
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="block w-full py-5 bg-white text-clay-deep rounded-full font-heading font-black shadow-clay-button border-2 border-clay-cream hover:scale-105 transition-all"
          >
            Làm lại từ đầu
          </button>
        </div>
      </motion.div>
    )
  }

  const currentPoint = points[currentIndex]

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 mt-4">
      {/* Quiz Header */}
      <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-6 rounded-[40px] border-4 border-white shadow-clay-card">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-clay-pink/10 rounded-2xl flex items-center justify-center text-2xl shadow-clay-inset">⏳</div>
          <div>
            <p className="text-[10px] font-black text-clay-muted uppercase tracking-widest">Thời gian còn lại</p>
            <p className={`text-2xl font-black ${timeLeft < 60 ? 'text-clay-pink animate-pulse' : 'text-clay-deep'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-black text-clay-muted uppercase tracking-widest">Tiến độ</p>
          <p className="text-2xl font-black text-clay-blue">
            {currentIndex + 1} <span className="text-sm text-clay-muted">/ {points.length}</span>
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-6 w-full bg-white rounded-full shadow-clay-inset p-1 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / points.length) * 100}%` }}
          className="h-full bg-gradient-to-r from-clay-blue to-clay-green rounded-full"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <span className="px-4 py-1 bg-white/80 rounded-full text-[10px] font-black text-clay-blue shadow-clay-button border border-clay-blue/10">CHỦ ĐIỂM {currentIndex + 1}</span>
            <h2 className="text-2xl font-heading font-black text-clay-deep">{currentPoint?.title}</h2>
          </div>

          <SentenceScramble 
            sentence={currentPoint?.example || ""}
            translation={currentPoint?.exampleSentence || ""}
            onSuccess={() => {}} // Handle inside handleNext
          />

          <div className="flex justify-center">
            <button
               onClick={() => handleNext(true)}
               className="px-12 py-5 bg-clay-green text-white rounded-full font-heading font-black shadow-clay-button border-4 border-white hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              Kế tiếp ➔
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
