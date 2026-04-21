'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Layers } from 'lucide-react'

interface WordInfo {
  id: string
  original: string
  translation: string
  masteryLevel: number
}

interface MasteryDetailsProps {
  buckets: {
    level: number
    label: string
    interval: string
    color: string
    bar: string
    count: number
    pct: number
    words: WordInfo[]
  }[]
}

export default function MasteryDetails({ buckets }: MasteryDetailsProps) {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null)

  return (
    <div className="bg-white border-[3px] border-newsprint-black shadow-brutalist-card p-10 space-y-10">
      <div className="border-b-[3px] border-newsprint-black pb-6 space-y-2">
        <div className="flex items-center gap-3">
          <Layers size={24} strokeWidth={3} className="text-newsprint-black" />
          <h2 className="text-3xl font-serif font-black text-newsprint-black uppercase tracking-tighter">Chi tiết SRS</h2>
        </div>
        <p className="text-[11px] font-sans font-bold text-newsprint-gray-dark uppercase tracking-widest pl-9">CLICK VÀO TỪNG CẤP ĐỘ ĐỂ XEM DANH SÁCH</p>
      </div>

      <div className="space-y-4">
        {buckets.map(row => (
          <div key={row.level} className="flex flex-col">
            <button
              onClick={() => setExpandedLevel(expandedLevel === row.level ? null : row.level)}
              className="w-full text-left border-[3px] border-newsprint-black bg-newsprint-paper p-5 flex items-center gap-6 hover:shadow-brutalist-soft transition-all group relative z-10"
            >
              <div className="w-12 h-12 bg-newsprint-black text-white flex items-center justify-center font-serif font-black text-xl border-[2px] border-newsprint-black shadow-brutalist-soft group-hover:rotate-3 transition-transform">
                {row.level}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-sans font-black text-newsprint-black uppercase tracking-wider">{row.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-sans font-black bg-newsprint-black text-white px-3 py-1 uppercase">
                      {row.count} WORDS
                    </span>
                    <span className="text-[10px] font-sans font-black border-[1.5px] border-newsprint-black px-3 py-1">
                      {row.pct}%
                    </span>
                  </div>
                </div>
                <div className="h-4 bg-white border-[2px] border-newsprint-black overflow-hidden p-0.5">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{ width: `${row.pct}%`, background: row.bar }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-[9px] font-sans font-black text-newsprint-gray-dark w-16 text-right uppercase tracking-tighter hidden md:block">
                  FREQ: {row.interval}
                </div>
                {expandedLevel === row.level ? <ChevronUp size={20} strokeWidth={3} /> : <ChevronDown size={20} strokeWidth={3} />}
              </div>
            </button>

            {/* Word List Drawer */}
            {expandedLevel === row.level && (
              <div className="border-x-[3px] border-b-[3px] border-newsprint-black p-6 bg-white shadow-inner animate-in slide-in-from-top-2 duration-200">
                {row.words.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {row.words.map(word => (
                      <div key={word.id} className="bg-newsprint-paper border-[2px] border-newsprint-black p-4 shadow-brutalist-soft hover:translate-x-1 hover:-translate-y-1 transition-all">
                        <div className="text-sm font-serif font-black text-newsprint-black border-b border-newsprint-black/20 pb-2 mb-2 uppercase">{word.original}</div>
                        <div className="text-[10px] font-sans font-bold text-newsprint-gray-dark uppercase tracking-tight">{word.translation}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center border-[2px] border-dashed border-newsprint-black/20">
                    <p className="text-[10px] font-sans font-black text-newsprint-gray uppercase tracking-widest italic">CHƯA CÓ DỮ LIỆU Ở CẤP ĐỘ NÀY</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
