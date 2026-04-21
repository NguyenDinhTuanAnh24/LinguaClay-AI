'use client'

import React, { useState, useDeferredValue, useMemo } from 'react'
import Link from 'next/link'
import SentenceScramble from '@/components/study/SentenceScramble'
import { 
  Search, 
  Compass, 
  Play, 
  ChevronDown, 
  X,
  BookOpen,
  Gamepad2,
  Brain,
  Loader2
} from 'lucide-react'

interface GrammarPoint {
  id: string
  slug: string
  title: string
  level: string
  explanation: string
  structure: string | null
  example: string | null
  exampleSentence: string | null
  exerciseData: string[] | null
  topic: { name: string } | null
}

const levelColors: Record<string, string> = {
  'BEGINNER': 'bg-blue-600 text-white',
  'ELEMENTARY': 'bg-green-600 text-white',
  'INTERMEDIATE': 'bg-red-600 text-white',
}

export default function GrammarLibrary({ initialPoints }: { initialPoints: any[] }) {
  const [search, setSearch] = useState('')
  const [activeLevel, setActiveLevel] = useState('All')
  const [practicingId, setPracticingId] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(12) 
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
    <div className="space-y-12">
      {/* Search + Level Filter */}
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative w-full lg:w-[400px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-newsprint-black" size={20} strokeWidth={3} />
          <input
            type="text"
            placeholder="Tìm kiếm ngữ pháp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border-[3px] border-newsprint-black shadow-brutalist-soft focus:outline-none font-sans font-black uppercase text-xs tracking-widest placeholder:text-newsprint-gray"
          />
        </div>
        <div className="flex items-center gap-3 p-1 bg-[#E5E7EB] border-[3px] border-newsprint-black overflow-x-auto no-scrollbar">
          {levels.map(l => (
            <button
              key={l}
              onClick={() => {
                setActiveLevel(l)
                setVisibleCount(12)
              }}
              className={`px-6 py-3 font-sans font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border-[2px] ${
                activeLevel === l 
                  ? 'bg-newsprint-black text-white border-newsprint-black' 
                  : 'text-newsprint-black border-transparent hover:bg-white'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[10px] font-sans font-black text-newsprint-gray-dark px-2 uppercase tracking-widest">
        Hiển thị <span className="text-red-600">{Math.min(visibleCount, filteredPoints.length)}</span> / {filteredPoints.length} chủ điểm {activeLevel !== 'All' ? activeLevel : ''}
      </p>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPoints.length > 0 ? filteredPoints.slice(0, visibleCount).map((gp) => (
          <div
            key={gp.id}
            className="group bg-white border-[3px] border-newsprint-black shadow-brutalist-card p-8 flex flex-col gap-6 hover:-translate-y-1 transition-all hover:shadow-brutalist-heavy"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-3">
              <span className={`px-3 py-1 font-sans font-black text-[9px] uppercase tracking-widest border-[2px] border-newsprint-black ${levelColors[gp.level] || 'bg-newsprint-gray text-white'}`}>
                {gp.level}
              </span>
              <div className="w-10 h-10 bg-newsprint-paper border-[3px] border-newsprint-black flex items-center justify-center shadow-brutalist-soft group-hover:rotate-6 transition-transform">
                <Compass size={20} strokeWidth={3} />
              </div>
            </div>

            {/* Title + Structure */}
            <div className="space-y-4">
              <h3 className="text-2xl font-serif font-black text-newsprint-black leading-tight uppercase group-hover:text-red-600 transition-colors">
                {gp.title}
              </h3>

              {gp.structure ? (
                <div className="inline-flex items-center gap-3 bg-newsprint-paper border-[2px] border-newsprint-black px-4 py-2">
                  <span className="text-[9px] font-sans font-black text-newsprint-gray-dark uppercase tracking-widest">CT</span>
                  <code className="text-xs font-black text-newsprint-black">{gp.structure}</code>
                </div>
              ) : (
                <p className="text-xs text-newsprint-gray-dark font-sans font-bold leading-relaxed line-clamp-2 uppercase tracking-tight">{gp.explanation}</p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-auto grid grid-cols-2 gap-4 pt-6 border-t-[2px] border-newsprint-black/10">
              <Link
                href={`/dashboard/grammar/${gp.slug}`}
                className="py-3 bg-white border-[2px] border-newsprint-black text-center text-[10px] font-sans font-black text-newsprint-black uppercase tracking-widest hover:bg-newsprint-paper transition-all flex items-center justify-center gap-2"
              >
                <BookOpen size={14} strokeWidth={3} /> BÀI HỌC
              </Link>
              <button
                onClick={() => handleOpenPractice(gp.id)}
                disabled={!gp.example && !gp.exerciseData}
                className={`py-3 border-[2px] border-newsprint-black text-center text-[10px] font-sans font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  gp.example || gp.exerciseData
                    ? 'bg-newsprint-black text-white hover:bg-red-600'
                    : 'bg-newsprint-gray-light text-newsprint-gray-dark cursor-not-allowed opacity-50'
                }`}
              >
                <Gamepad2 size={14} strokeWidth={3} /> LUYỆN TẬP
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center space-y-8 bg-newsprint-paper border-[3px] border-dashed border-newsprint-black">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 bg-red-600/10 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-full h-full bg-white border-[3px] border-newsprint-black shadow-brutalist-soft flex items-center justify-center text-newsprint-black font-black">
                <Search size={48} strokeWidth={3} />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-serif font-black text-newsprint-black uppercase">Trống trơn...</h3>
              <p className="text-[11px] font-sans font-bold text-newsprint-gray-dark uppercase tracking-widest max-w-sm mx-auto">Chúng tôi không tìm thấy chủ điểm này trong thư viện chính thức.</p>
            </div>
            <button className="px-10 py-5 bg-red-600 text-white font-sans font-black uppercase tracking-widest text-sm border-[3px] border-newsprint-black shadow-brutalist-soft hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-3 mx-auto">
              <Brain size={20} strokeWidth={3} /> TẠO VỚI AI
            </button>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {visibleCount < filteredPoints.length && (
        <div className="flex justify-center pt-8">
          <button 
            onClick={loadMore}
            className="px-10 py-5 bg-white border-[3px] border-newsprint-black font-sans font-black text-newsprint-black uppercase tracking-widest text-sm shadow-brutalist-card hover:bg-newsprint-paper active:translate-y-1 transition-all flex items-center gap-3"
          >
            XEM THÊM <ChevronDown size={18} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* Practice Modal Overlay */}
      {practicingPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-newsprint-black/70 backdrop-blur-sm" onClick={() => setPracticingId(null)} />
          <div className="relative w-full max-w-2xl">
            {/* Close */}
            <button
              onClick={() => setPracticingId(null)}
              className="absolute -top-4 -right-4 z-[60] w-12 h-12 bg-white border-[3px] border-newsprint-black shadow-brutalist-soft flex items-center justify-center font-black text-newsprint-black hover:bg-red-600 hover:text-white transition-all"
            ><X size={24} strokeWidth={4} /></button>

            {/* Context header */}
            <div className="mb-6 bg-white border-[3px] border-newsprint-black p-6 shadow-brutalist-card text-center relative z-10">
              <span className={`px-4 py-1 font-sans font-black text-[10px] uppercase tracking-widest border-[2px] border-newsprint-black mb-4 inline-block ${levelColors[practicingPoint.level] || ''}`}>
                {practicingPoint.level}
              </span>
              <h4 className="font-serif font-black text-newsprint-black text-2xl uppercase">{practicingPoint.title}</h4>
              {practicingPoint.structure && (
                <code className="text-sm font-black text-red-600 bg-newsprint-paper border-[2px] border-newsprint-black px-4 py-1 mt-3 inline-block">{practicingPoint.structure}</code>
              )}
              {(practicesentences.length > 1) && (
                <p className="text-[10px] text-newsprint-gray-dark mt-4 font-black uppercase tracking-[0.2em]">Tiến độ: {sentenceIndex + 1} / {practicesentences.length}</p>
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
