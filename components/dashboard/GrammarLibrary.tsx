'use client'

import React, { useState, useDeferredValue, useMemo } from 'react'
import Link from 'next/link'
import SentenceScramble from '@/components/study/SentenceScramble'

interface GrammarPoint {
  id: string
  slug: string
  title: string
  level: string
  explanation: string
  structure: string | null
  example: string | null // Tiếng Anh
  exampleSentence: string | null // Tiếng Việt
  exerciseData: string[] | null
  topic: { name: string } | null
}

const levelColors: Record<string, string> = {
  'BEGINNER': 'bg-clay-blue/10 text-clay-blue',
  'ELEMENTARY': 'bg-clay-green/10 text-clay-green',
  'INTERMEDIATE': 'bg-clay-pink/10 text-clay-pink',
}

export default function GrammarLibrary({ initialPoints }: { initialPoints: any[] }) {
  const [search, setSearch] = useState('')
  const [activeLevel, setActiveLevel] = useState('All')
  const [practicingId, setPracticingId] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(12) // Giới hạn hiển thị ban đầu để tăng hiệu năng
  const deferredSearch = useDeferredValue(search)

  const levels = ['All', 'Beginner', 'Elementary', 'Intermediate']

  const filteredPoints = useMemo(() => {
    return initialPoints.filter(p => {
      const matchesSearch =
        p.title.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        (p.structure && p.structure.toLowerCase().includes(deferredSearch.toLowerCase()))
      const matchesLevel = activeLevel === 'All' || p.level.toLowerCase() === activeLevel.toLowerCase()
      return matchesSearch && matchesLevel
    })
  }, [deferredSearch, activeLevel, initialPoints])

  const practicingPoint = practicingId ? initialPoints.find(p => p.id === practicingId) : null
  
  // Logic lấy câu luyện tập chuẩn: example (EN) làm câu đố, exampleSentence (VN) làm gợi ý
  const practicesentences: string[] = practicingPoint?.exerciseData ?? 
    (practicingPoint?.example ? [practicingPoint.example] : ['I am learning English'])
  
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const currentSentence = practicesentences[sentenceIndex % practicesentences.length]

  const handlePracticeSuccess = () => {
    if (sentenceIndex < practicesentences.length - 1) {
      setSentenceIndex(prev => prev + 1)
    }
  }

  const handleOpenPractice = (id: string) => {
    setSentenceIndex(0)
    setPracticingId(id)
  }

  const loadMore = () => setVisibleCount(prev => prev + 12)

  return (
    <div className="space-y-10">
      {/* Search + Level Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-6 flex items-center text-xl pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm chủ điểm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white/70 backdrop-blur rounded-[30px] border-4 border-white shadow-clay-inset focus:outline-none focus:border-clay-blue/30 transition-all font-medium text-clay-deep placeholder:text-clay-muted/60"
          />
        </div>
        <div className="flex items-center gap-2 bg-white/50 p-2 rounded-[30px] shadow-clay-inset border-2 border-white overflow-x-auto no-scrollbar">
          {levels.map(l => (
            <button
              key={l}
              onClick={() => {
                setActiveLevel(l)
                setVisibleCount(12) // Reset khi đổi tab
              }}
              className={`px-6 py-3 rounded-[22px] text-[10px] font-black transition-all whitespace-nowrap ${
                activeLevel === l ? 'bg-clay-blue text-white shadow-clay-button' : 'text-clay-muted hover:bg-white/40'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs font-bold text-clay-muted px-2">
        Hiển thị <span className="text-clay-blue">{Math.min(visibleCount, filteredPoints.length)}</span> / {filteredPoints.length} chủ điểm {activeLevel !== 'All' ? activeLevel : ''}
      </p>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPoints.length > 0 ? filteredPoints.slice(0, visibleCount).map((gp) => (
          <div
            key={gp.id}
            className="group bg-white/80 rounded-[40px] shadow-clay-card border-4 border-white p-8 flex flex-col gap-6 hover:-translate-y-1 transition-all"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex-shrink-0 ${levelColors[gp.level] || 'bg-clay-muted/10 text-clay-muted'}`}>
                {gp.level}
              </span>
              <div className="w-8 h-8 rounded-full bg-white shadow-clay-inset flex items-center justify-center text-sm flex-shrink-0">
                📐
              </div>
            </div>

            {/* Title + Structure */}
            <div className="space-y-3">
              <h3 className="text-xl font-heading font-black text-clay-deep leading-tight group-hover:text-clay-blue transition-colors">
                {gp.title}
              </h3>

              {gp.structure ? (
                <div className="inline-flex items-center gap-2 bg-clay-blue/5 border-2 border-clay-blue/10 px-4 py-2 rounded-2xl">
                  <span className="text-[10px] font-black text-clay-muted uppercase tracking-widest">Cấu trúc</span>
                  <code className="text-sm font-black text-clay-blue">{gp.structure}</code>
                </div>
              ) : (
                <p className="text-xs text-clay-muted font-medium line-clamp-2">{gp.explanation}</p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-auto grid grid-cols-2 gap-3 pt-2 border-t border-clay-muted/10">
              <Link
                href={`/dashboard/grammar/${gp.slug}`}
                className="py-3 bg-white rounded-full text-center text-xs font-black text-clay-deep shadow-clay-button border border-soft-gray/20 hover:scale-[1.03] active:scale-95 transition-all outline-none"
              >
                📖 Bài học
              </Link>
              <button
                onClick={() => handleOpenPractice(gp.id)}
                disabled={!gp.example && !gp.exerciseData}
                className={`py-3 rounded-full text-center text-xs font-black shadow-clay-button hover:scale-[1.03] active:scale-95 transition-all outline-none ${
                  gp.example || gp.exerciseData
                    ? 'bg-emerald-400 text-white hover:bg-emerald-500'
                    : 'bg-clay-muted/20 text-clay-muted cursor-not-allowed'
                }`}
              >
                🎮 Luyện tập
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center space-y-8 bg-white/30 rounded-[50px] border-4 border-dashed border-white/60">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 bg-clay-pink/10 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-full h-full bg-white rounded-full shadow-clay-inset flex items-center justify-center text-5xl grayscale opacity-60">📐</div>
              <div className="absolute -bottom-2 -right-2 text-3xl">😢</div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-heading font-black text-clay-deep">Không tìm thấy chủ điểm này</h3>
              <p className="text-clay-muted font-medium max-w-sm mx-auto">Bạn có muốn AI LinguaClay tạo một bộ từ vựng mới cho chủ điểm này không?</p>
            </div>
            <button className="px-8 py-4 bg-clay-pink text-white rounded-full font-heading font-black shadow-clay-button border-4 border-white hover:scale-105 transition-all">
              Tạo với AI ✨
            </button>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {visibleCount < filteredPoints.length && (
        <div className="flex justify-center pt-8">
          <button 
            onClick={loadMore}
            className="px-10 py-5 bg-white rounded-full font-black text-clay-deep shadow-clay-button border-4 border-white hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <span>🔽</span> Xem thêm chủ điểm
          </button>
        </div>
      )}

      {/* Practice Modal Overlay */}
      {practicingPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-clay-deep/40 backdrop-blur-md" onClick={() => setPracticingId(null)} />
          <div className="relative w-full max-w-2xl">
            {/* Close */}
            <button
              onClick={() => setPracticingId(null)}
              className="absolute -top-4 -right-4 z-10 w-10 h-10 bg-white rounded-full shadow-clay-card flex items-center justify-center font-black text-clay-muted hover:text-clay-pink transition-colors border-2 border-white"
            >✕</button>

            {/* Context header */}
            <div className="mb-4 text-center bg-white/20 backdrop-blur-sm p-4 rounded-[30px] border border-white/30 shadow-clay-card">
              <span className={`px-4 py-1 rounded-full text-[11px] font-black uppercase ${levelColors[practicingPoint.level] || ''}`}>
                {practicingPoint.level}
              </span>
              <h4 className="font-heading font-black text-clay-deep mt-2 text-lg">{practicingPoint.title}</h4>
              {practicingPoint.structure && (
                <code className="text-sm text-clay-blue font-black bg-white/50 px-3 py-1 rounded-lg border border-white mt-1 inline-block">{practicingPoint.structure}</code>
              )}
              {(practicesentences.length > 1) && (
                <p className="text-xs text-clay-muted mt-2 font-bold uppercase tracking-widest">Hành trình: {sentenceIndex + 1} / {practicesentences.length}</p>
              )}
            </div>

            <SentenceScramble
              sentence={currentSentence}
              translation={practicingPoint.exampleSentence || ""}
              onSuccess={handlePracticeSuccess}
            />
          </div>
        </div>
      )}
    </div>
  )
}
