'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Word {
  id: string
  original: string
  translation: string
}

interface Topic {
  id: string
  slug: string
  name: string
  words: Word[]
}

interface AIResult {
  score: number
  feedback: string
  corrections: {
    original: string
    correction: string
    explanation: string
  }[]
}

export default function WritingInterface({ topic }: { topic: Topic }) {
  const [content, setContent] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<AIResult | null>(null)
  const router = useRouter()

  const handleCheck = async () => {
    if (!content.trim() || isChecking) return
    
    setIsChecking(true)
    setResult(null)
    
    try {
      const res = await fetch('/api/ai/check-writing', {
        method: 'POST',
        body: JSON.stringify({ content, topicId: topic.id }),
      })
      
      const data = await res.json()
      if (data.session?.aiFeedback) {
        setResult(data.session.aiFeedback)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 pb-20">
      {/* Left: Input Area */}
      <div className="lg:col-span-3 space-y-8">
        <div className="relative group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết những dòng suy nghĩ của bạn tại đây..."
            className="w-full h-[500px] bg-white/70 backdrop-blur rounded-[50px] shadow-clay-inset border-4 border-white p-12 text-xl text-clay-deep focus:outline-none focus:border-clay-blue/30 transition-all placeholder:text-clay-muted leading-relaxed"
          />
          <div className="absolute bottom-8 right-12 text-sm font-black text-clay-muted bg-white/50 px-4 py-1 rounded-full border border-white">
            {content.length} ký tự
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={isChecking || !content.trim()}
          className={`w-full py-6 rounded-[30px] font-heading font-black text-2xl shadow-[0_12px_25px_rgba(168,213,186,0.4)] transition-all flex items-center justify-center gap-4 border-4 border-white ${
            isChecking || !content.trim()
              ? 'bg-clay-muted/20 text-clay-muted shadow-none opacity-50'
              : 'bg-gradient-to-r from-clay-green to-emerald-500 text-white hover:scale-[1.02] active:scale-95 hover:shadow-[0_15px_30px_rgba(168,213,186,0.6)]'
          }`}
        >
          {isChecking ? (
            <>
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              AI đang phân tích bài viết...
            </>
          ) : (
            'Gửi bài cho AI chấm ✨'
          )}
        </button>

        {/* AI Result Area */}
        {result && (
          <div className="bg-white/90 backdrop-blur rounded-[50px] shadow-clay-card border-4 border-white p-10 md:p-12 space-y-10 animate-fadeIn">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-clay-muted/10 pb-8 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-clay-green/10 flex items-center justify-center text-3xl">✨</div>
                <div>
                  <h3 className="text-3xl font-heading font-black text-clay-deep">Kết quả phân tích</h3>
                  <p className="text-sm text-clay-muted font-bold uppercase tracking-widest">AI Writing Assessment</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-clay-green/10 px-8 py-4 rounded-[30px] border-2 border-white shadow-clay-button">
                <span className="text-sm font-black text-clay-muted uppercase tracking-widest">Điểm số</span>
                <span className="text-4xl font-black text-clay-green">{result.score}/100</span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-8 bg-clay-blue/5 rounded-[40px] border-2 border-white shadow-clay-inset text-xl leading-relaxed text-clay-deep font-medium italic">
                "{result.feedback}"
              </div>

              {result.corrections.length > 0 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-black text-clay-muted uppercase tracking-widest pl-4">Lỗi cần chỉnh sửa</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.corrections.map((err, i) => (
                      <div key={i} className="bg-warm-white p-6 rounded-[35px] border-2 border-white shadow-clay-card space-y-4 hover:-translate-y-1 transition-transform">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-clay-pink/10 text-clay-pink rounded-lg text-[11px] font-black uppercase">Sai</span>
                            <span className="text-base font-black text-clay-deep line-through opacity-40">{err.original}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-clay-green/10 text-clay-green rounded-lg text-[11px] font-black uppercase">Sửa</span>
                            <span className="text-lg font-black text-clay-green">{err.correction}</span>
                          </div>
                        </div>
                        <p className="text-sm text-clay-muted font-bold leading-relaxed border-t border-clay-muted/5 pt-3">
                          💡 {err.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Word Suggestions */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white/70 backdrop-blur rounded-[50px] shadow-clay-card border-4 border-white p-8 sticky top-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-clay-blue/10 flex items-center justify-center text-xl">💡</div>
            <h3 className="text-xs font-black text-clay-muted uppercase tracking-[0.2em]">Từ vựng gợi ý</h3>
          </div>
          <div className="space-y-4">
            {topic.words.map((word) => (
              <div 
                key={word.id}
                className="bg-warm-white p-5 rounded-[30px] border-2 border-white shadow-clay-button flex flex-col gap-1.5 group hover:scale-[1.02] transition-all"
              >
                <div className="text-base font-black text-clay-deep group-hover:text-clay-blue transition-colors">{word.original}</div>
                <div className="text-[11px] font-bold text-clay-muted leading-tight">{word.translation}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 bg-clay-orange/10 rounded-[30px] border-2 border-white shadow-clay-inset text-[11px] font-bold text-clay-orange leading-relaxed text-center">
             Mẹo: Sử dụng ít nhất 3 từ trên để nhận điểm thưởng!
          </div>
        </div>
      </div>
    </div>
  )
}
