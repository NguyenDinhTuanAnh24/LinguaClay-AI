'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Languages, Loader2, Sparkles, X } from 'lucide-react'

type LangCode = 'EN' | 'CN'

const LANG_OPTIONS: Array<{ code: LangCode; label: string }> = [
  { code: 'EN', label: 'Tiếng Anh' },
  { code: 'CN', label: 'Tiếng Trung' },
]

export default function GenerateModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState<LangCode>('EN')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  if (!isOpen) return null

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), language }),
      })

      if (response.ok) {
        onClose()
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Có lỗi xảy ra!')
      }
    } catch {
      alert('Không thể kết nối với server!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-newsprint-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#F5F0E8] w-full max-w-md border-[3px] border-newsprint-black shadow-brutalist-heavy p-8 space-y-7 relative text-left">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-serif font-black text-newsprint-black uppercase tracking-tight">Tạo với AI</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 border-[2px] border-newsprint-black bg-white text-newsprint-black hover:bg-newsprint-black hover:text-white transition-colors flex items-center justify-center"
          >
            <X size={22} strokeWidth={3.5} />
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-newsprint-gray-dark uppercase tracking-widest pl-1">Bạn muốn học chủ đề gì?</label>
            <input
              type="text"
              placeholder="VD: Giao tiếp tại khách sạn, HSK 3..."
              className="w-full px-5 py-4 bg-white border-[3px] border-newsprint-black focus:outline-none focus:bg-[#FFFDF7] text-sm font-semibold text-newsprint-black placeholder:text-newsprint-gray-dark/60"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {LANG_OPTIONS.map((item) => {
              const isActive = language === item.code
              return (
                <button
                  key={item.code}
                  onClick={() => setLanguage(item.code)}
                  disabled={isLoading}
                  className={`h-12 border-[2px] font-black uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                    isActive
                      ? 'bg-[#141414] text-white border-[#141414] shadow-[3px_3px_0px_0px_rgba(20,20,20,1)]'
                      : 'bg-[#E9E5DB] text-[#141414] border-[#141414] hover:bg-white'
                  }`}
                >
                  <Languages size={14} />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || isLoading}
          className={`w-full py-4 border-[3px] border-newsprint-black font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
            isLoading
              ? 'bg-[#E5E7EB] text-newsprint-gray-dark cursor-not-allowed'
              : 'bg-white text-newsprint-black hover:bg-newsprint-black hover:text-white hover:-translate-y-0.5'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
              AI đang tạo...
            </>
          ) : (
            <>
              Khởi tạo ngay <Sparkles size={14} strokeWidth={3} />
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-newsprint-gray-dark font-semibold uppercase tracking-[0.12em] px-2 leading-relaxed">
          AI sẽ tự động tạo khoảng 10-12 từ vựng cùng phiên âm và ví dụ thực tế dựa trên yêu cầu của bạn.
        </p>
      </div>
    </div>
  )
}
