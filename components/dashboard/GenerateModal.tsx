'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Sparkles, Loader2 } from 'lucide-react'

export default function GenerateModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState('Tiếng Anh')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  if (!isOpen) return null

  const handleGenerate = async () => {
    if (!topic) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, language }),
      })

      if (response.ok) {
        onClose()
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Có lỗi xảy ra!')
      }
    } catch (error) {
      alert('Không thể kết nối với server!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-newsprint-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md border-[3px] border-newsprint-black shadow-brutalist-heavy p-8 space-y-8 relative overflow-hidden text-left">
        <div className="flex justify-between items-center relative z-10">
          <h2 className="text-3xl font-serif font-black text-newsprint-black uppercase tracking-tighter">Tạo với AI</h2>
          <button onClick={onClose} className="text-newsprint-black hover:text-red-600 transition-colors">
             <X size={28} strokeWidth={4} />
          </button>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="space-y-3">
            <label className="text-[10px] font-sans font-black text-newsprint-gray-dark uppercase tracking-widest pl-1">Bạn muốn học chủ đề gì?</label>
            <input 
              type="text"
              placeholder="VÍ DỤ: GIAO TIẾP TẠI KHÁCH SẠN, HSK 3..."
              className="w-full px-6 py-4 bg-newsprint-paper border-[3px] border-newsprint-black shadow-brutalist-soft focus:outline-none font-sans font-black uppercase text-xs tracking-widest placeholder:text-newsprint-gray"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setLanguage('Tiếng Anh')}
              className={`py-4 border-[3px] font-sans font-black uppercase text-[10px] tracking-widest transition-all ${
                language === 'Tiếng Anh' 
                ? 'bg-newsprint-black text-white border-newsprint-black shadow-none translate-y-0.5' 
                : 'bg-white text-newsprint-black border-newsprint-black shadow-brutalist-soft hover:bg-newsprint-paper'
              }`}
              disabled={isLoading}
            >
              🇬🇧 TIẾNG ANH
            </button>
            <button 
              onClick={() => setLanguage('Tiếng Trung')}
              className={`py-4 border-[3px] font-sans font-black uppercase text-[10px] tracking-widest transition-all ${
                language === 'Tiếng Trung' 
                ? 'bg-red-600 text-white border-newsprint-black shadow-none translate-y-0.5' 
                : 'bg-white text-newsprint-black border-newsprint-black shadow-brutalist-soft hover:bg-newsprint-paper'
              }`}
              disabled={isLoading}
            >
              🏮 TIẾNG TRUNG
            </button>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={!topic || isLoading}
          className={`w-full py-5 border-[3px] border-newsprint-black font-sans font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-brutalist-soft ${
            isLoading 
            ? 'bg-newsprint-gray-light text-newsprint-gray cursor-not-allowed border-newsprint-gray shadow-none' 
            : 'bg-red-600 text-white hover:bg-newsprint-black'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
              AI ĐANG TẠO...
            </>
          ) : (
             <>KHỞI TẠO NGAY <Sparkles size={16} strokeWidth={3} /></>
          )}
        </button>
        
        <p className="text-[9px] text-center text-newsprint-gray-dark font-sans font-bold uppercase tracking-widest px-4 leading-relaxed">
          AI sẽ tự động tạo khoảng 10-12 từ vựng cùng phiên âm và ví dụ thực tế dựa trên yêu cầu của bạn.
        </p>
      </div>
    </div>
  )
}
