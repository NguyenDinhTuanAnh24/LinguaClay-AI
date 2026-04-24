'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Layers } from 'lucide-react'

interface WordInfo {
  id: string
  original: string
  translation: string
  masteryLevel: number
  nextReview: Date | string | null
  lastReviewed: Date | string | null
  reviewCountEstimate: number
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

  const getVNDayKey = (date: Date) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)

  const formatDateTime = (value: Date | string | null) => {
    if (!value) return 'Chưa lên lịch'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Chưa lên lịch'
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)

    const timeLabel = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date)
    const dateLabel = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
    const dayKey = getVNDayKey(date)
    if (dayKey === getVNDayKey(now)) return `Ôn lúc ${timeLabel} hôm nay`
    if (dayKey === getVNDayKey(tomorrow)) return `Ôn lúc ${timeLabel} ngày mai`
    return `Ôn lúc ${timeLabel} ngày ${dateLabel}`
  }

  return (
    <div className="bg-[#F5F0E8] border border-[#141414] p-8 md:p-10 space-y-8 transition-all duration-300 hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1">
      <div className="border-b border-[#141414]/15 pb-6 space-y-2">
        <div className="flex items-center gap-3">
          <Layers size={24} strokeWidth={3} className="text-[#141414]" />
          <h2 className="text-3xl font-serif font-black text-[#141414] uppercase tracking-tighter">Chi tiết SRS</h2>
        </div>
        <p className="text-[11px] font-sans font-bold text-[#4B4B4B] uppercase tracking-widest pl-9">CLICK VÀO TỪNG CẤP ĐỘ ĐỂ XEM DANH SÁCH</p>
      </div>

      <div className="space-y-4">
        {buckets.map(row => (
          <div key={row.level} className="flex flex-col">
            <button
              onClick={() => setExpandedLevel(expandedLevel === row.level ? null : row.level)}
              className="w-full text-left border border-[#141414] bg-[#EDE8DF] p-5 flex items-center gap-6 transition-all duration-300 group relative z-10 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,0.2)]"
            >
              <div className="w-12 h-12 bg-[#141414] text-white flex items-center justify-center font-serif font-black text-xl border border-[#141414] group-hover:rotate-3 transition-transform">
                {row.level}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-sans font-black text-[#141414] uppercase tracking-wider">{row.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-sans font-black bg-[#141414] text-white px-3 py-1 uppercase">
                      {row.count} WORDS
                    </span>
                    <span className="text-[10px] font-sans font-black border border-[#141414] px-3 py-1 bg-white">
                      {row.pct}%
                    </span>
                  </div>
                </div>
                <div
                  className="h-4 border border-[#141414] overflow-hidden p-0.5"
                  style={{ background: row.count === 0 ? '#E5E7EB' : '#FFFFFF' }}
                >
                  {row.count > 0 ? (
                    <div
                      className="h-full transition-all duration-1000"
                      style={{ width: `${row.pct}%`, background: row.bar }}
                    />
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-[9px] font-sans font-black text-[#4B4B4B] w-16 text-right uppercase tracking-tighter hidden md:block">
                  FREQ: {row.interval}
                </div>
                {expandedLevel === row.level ? <ChevronUp size={20} strokeWidth={3} /> : <ChevronDown size={20} strokeWidth={3} />}
              </div>
            </button>

            {/* Word List Drawer */}
            {expandedLevel === row.level && (
              <div className="border-x border-b border-[#141414] p-6 bg-[#F5F0E8] shadow-inner animate-in slide-in-from-top-2 duration-200">
                {row.words.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {row.words.map(word => (
                      <div key={word.id} className="bg-white border border-[#141414] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,0.2)]">
                        <div className="text-base font-serif font-black text-[#141414] border-b border-[#141414]/20 pb-2.5 mb-2.5 uppercase">{word.original}</div>
                        <div className="text-[11px] font-semibold text-[#4B4B4B]">{word.translation}</div>
                        <div className="mt-3 space-y-1.5 border-t border-[#141414]/10 pt-2.5">
                          <p className="text-[10px] font-semibold text-[#4B4B4B]">
                            Ôn tiếp theo: <span className="text-[#141414]">{formatDateTime(word.nextReview)}</span>
                          </p>
                          <p className="text-[10px] font-semibold text-[#4B4B4B]">
                            Số lần đã ôn: <span className="text-[#141414]">{word.reviewCountEstimate}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center border border-dashed border-[#141414]/20">
                    <p className="text-[10px] font-sans font-black text-[#4B4B4B] uppercase tracking-widest italic">CHƯA CÓ DỮ LIỆU Ở CẤP ĐỘ NÀY</p>
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
