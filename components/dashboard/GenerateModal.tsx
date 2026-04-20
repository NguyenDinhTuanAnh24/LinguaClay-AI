'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-clay-brown/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-warm-white w-full max-w-md rounded-[40px] shadow-clay-card border-4 border-white p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-heading font-black text-clay-deep">Tạo từ với AI 🤖</h2>
          <button onClick={onClose} className="text-clay-muted hover:text-clay-orange transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
             </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-clay-muted ml-2">Bạn muốn học chủ đề gì?</label>
            <input 
              type="text"
              placeholder="Ví dụ: Giao tiếp tại khách sạn, HSK 3..."
              className="w-full px-6 py-4 bg-soft-gray/30 rounded-[25px] shadow-clay-inset border-2 border-transparent focus:border-clay-blue/30 focus:outline-none font-body text-clay-deep"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setLanguage('Tiếng Anh')}
              className={`py-3 rounded-[20px] font-heading font-bold transition-all ${
                language === 'Tiếng Anh' 
                ? 'bg-clay-blue text-white shadow-clay-pressed scale-95' 
                : 'bg-white text-clay-muted shadow-clay-button'
              }`}
              disabled={isLoading}
            >
              🇬🇧 Tiếng Anh
            </button>
            <button 
              onClick={() => setLanguage('Tiếng Trung')}
              className={`py-3 rounded-[20px] font-heading font-bold transition-all ${
                language === 'Tiếng Trung' 
                ? 'bg-clay-orange text-white shadow-clay-pressed scale-95' 
                : 'bg-white text-clay-muted shadow-clay-button'
              }`}
              disabled={isLoading}
            >
              🏮 Tiếng Trung
            </button>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={!topic || isLoading}
          className={`w-full py-5 rounded-[30px] font-heading font-black text-lg shadow-clay-button transition-all flex items-center justify-center gap-3 ${
            isLoading 
            ? 'bg-soft-gray text-clay-muted cursor-not-allowed' 
            : 'bg-gradient-to-r from-clay-orange to-clay-gold text-white hover:shadow-clay-button-hover active:scale-95'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              AI đang tạo từ vựng...
            </>
          ) : (
             'Bắt đầu tạo ngay ✨'
          )}
        </button>
        
        <p className="text-[10px] text-center text-clay-muted font-medium px-4">
          AI sẽ tự động tạo khoảng 10-12 từ vựng cùng phiên âm và ví dụ thực tế dựa trên yêu cầu của bạn.
        </p>
      </div>
    </div>
  )
}
