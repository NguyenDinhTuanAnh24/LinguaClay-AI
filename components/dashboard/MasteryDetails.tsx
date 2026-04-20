'use client'

import React, { useState } from 'react'

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
    <div className="bg-warm-white/80 rounded-[40px] shadow-clay-card border-4 border-white p-8 space-y-6">
      <div>
        <h2 className="text-lg font-heading font-black text-clay-deep">Chi tiết cấp độ SRS</h2>
        <p className="text-xs text-clay-muted mt-0.5">Click vào từng cấp độ để xem danh sách từ vựng</p>
      </div>

      <div className="space-y-3">
        {buckets.map(row => (
          <div key={row.level} className="space-y-2">
            <button
              onClick={() => setExpandedLevel(expandedLevel === row.level ? null : row.level)}
              className={`w-full text-left rounded-[22px] p-4 ${row.color} flex items-center gap-4 hover:scale-[1.01] transition-all group`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black bg-white/70 shadow-clay-button flex-shrink-0 group-active:scale-95 transition-transform">
                {row.level}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-clay-deep">{row.label}</span>
                  <span className="text-xs font-black text-clay-deep ml-4 flex-shrink-0">
                    {row.count} từ · {row.pct}%
                  </span>
                </div>
                <div className="h-3 bg-white/50 rounded-full overflow-hidden shadow-clay-inset">
                  <div
                    className="h-full rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${row.pct}%`, background: row.bar }}
                  />
                </div>
              </div>
              <div className="text-[10px] text-clay-muted font-bold w-16 text-right flex-shrink-0 border-l border-clay-muted/10 pl-2">
                {row.interval}
              </div>
            </button>

            {/* Word List Drawer */}
            {expandedLevel === row.level && (
              <div className="mx-4 p-4 bg-white/40 rounded-b-[25px] border-x-2 border-b-2 border-white/50 shadow-clay-inset animate-fadeIn overflow-hidden">
                {row.words.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {row.words.map(word => (
                      <div key={word.id} className="bg-white/80 p-2.5 rounded-[15px] border border-white shadow-clay-button flex flex-col gap-0.5">
                        <span className="text-xs font-black text-clay-deep truncate">{word.original}</span>
                        <span className="text-[10px] text-clay-muted truncate">{word.translation}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-center text-clay-muted italic py-2">Chưa có từ nào ở cấp độ này</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
