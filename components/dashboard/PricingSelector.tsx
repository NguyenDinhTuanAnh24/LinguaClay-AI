'use client'

import { useState, useEffect } from 'react'
import { Clock, Crown, Rocket } from 'lucide-react'

interface Plan {
  id: string
  name: string
  duration: string
  price: number
  originalPrice: number
  tag?: string
  isPopular?: boolean
}

const PLANS: Plan[] = [
  { id: '3_MONTHS', name: 'Bản tiêu chuẩn', duration: '3 Tháng', price: 299000, originalPrice: 599000 },
  { id: '6_MONTHS', name: 'Bản chuyên sâu', duration: '6 Tháng', price: 399000, originalPrice: 799000, tag: 'Bán chạy' },
  { id: '1_YEAR', name: 'Bản toàn diện', duration: '1 Năm', price: 499000, originalPrice: 1299000, isPopular: true, tag: 'Hời nhất' }
]

export default function PricingSelector({ onUpgrade }: { onUpgrade: (plan: Plan) => void }) {
  const [selectedId, setSelectedId] = useState('1_YEAR')
  const [timeLeft, setTimeLeft] = useState('02:15:30')

  // Logic Countdown Timer (kept same)
  useEffect(() => {
    const timer = setInterval(() => {
      const parts = timeLeft.split(':').map(Number)
      if (parts.length < 3) return
      let seconds = parts[0] * 3600 + parts[1] * 60 + parts[2]
      if (seconds > 0) {
        seconds--
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
        const s = (seconds % 60).toString().padStart(2, '0')
        setTimeLeft(`${h}:${m}:${s}`)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const selectedPlan = PLANS.find(p => p.id === selectedId)!

  return (
    <div className="space-y-6">
      {/* Countdown Timer Banner */}
      <div className="bg-red-600 border-[3px] border-newsprint-black p-4 flex items-center justify-between shadow-brutalist-soft text-white">
        <div className="flex items-center gap-3">
          <Clock size={18} strokeWidth={3} />
          <span className="text-[10px] font-sans font-black uppercase tracking-widest">ƯU ĐÃI KẾT THÚC SAU:</span>
        </div>
        <span className="font-sans font-black text-xl tracking-tighter bg-newsprint-black px-4 py-1 border-[2px] border-white/20">
          {timeLeft}
        </span>
      </div>

      {/* Main Pricing Card */}
      <div className="bg-white border-[4px] border-newsprint-black shadow-brutalist-card p-8 text-newsprint-black relative overflow-hidden group">
        {/* Newsprint texture overlay or similar effect would be cool here, but sticking to solid for now */}
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 bg-newsprint-paper border-[3px] border-newsprint-black flex items-center justify-center text-newsprint-black shadow-brutalist-soft group-hover:-rotate-3 transition-transform">
              <Crown size={28} strokeWidth={3} />
            </div>
            <div className="flex flex-col items-end">
              <span className="px-4 py-2 bg-red-600 text-white text-[9px] font-sans font-black uppercase tracking-widest border-[2px] border-newsprint-black shadow-brutalist-soft">
                MỞ BÁN SỚM: -50%
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-3xl font-serif font-black uppercase tracking-tighter leading-none">Nâng cấp <span className="text-red-600 italic">PRO</span> Membership</h3>
            <p className="text-[11px] font-sans font-bold text-newsprint-gray-dark leading-relaxed uppercase tracking-tight max-w-sm">
              Sử dụng không giới hạn AI Chat, Grammar Tutor và mở khóa 200+ chủ điểm nâng cao.
            </p>
          </div>

          {/* Plan Selector Pills */}
          <div className="p-1 bg-newsprint-paper border-[3px] border-newsprint-black flex gap-1">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedId(plan.id)}
                className={`flex-1 py-4 font-sans font-black text-[9px] uppercase tracking-widest transition-all ${
                  selectedId === plan.id
                    ? 'bg-newsprint-black text-white'
                    : 'text-newsprint-gray-dark hover:bg-white'
                }`}
              >
                {plan.duration}
              </button>
            ))}
          </div>

          {/* Price Display */}
          <div className="py-8 bg-newsprint-paper border-[3px] border-newsprint-black text-center shadow-inner relative">
             <div className="inline-flex flex-col items-center gap-1">
               <span className="text-newsprint-gray/50 line-through text-sm font-black italic">{selectedPlan.originalPrice.toLocaleString()}đ</span>
               <span className="text-5xl font-serif font-black text-newsprint-black tracking-tighter">{selectedPlan.price.toLocaleString()}đ</span>
             </div>
             
             {selectedId === '1_YEAR' && (
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-newsprint-black text-white px-4 py-1 text-[9px] font-black uppercase tracking-[0.2em] border-[2px] border-newsprint-black">
                 HỜI NHẤT
               </div>
             )}
          </div>

          <button
            onClick={() => onUpgrade(selectedPlan)}
            className="w-full py-6 bg-red-600 text-white font-sans font-black text-xs uppercase tracking-[0.3em] border-[3px] border-newsprint-black shadow-brutalist-card hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4"
          >
            NÂNG CẤP NGAY <Rocket size={20} strokeWidth={3} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>

          <p className="text-[9px] text-center text-newsprint-gray-dark font-sans font-black uppercase tracking-widest opacity-40">
             Hỗ trợ kích hoạt thủ công trong 5-10 phút sau chuyển khoản
          </p>
        </div>

        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-red-600/5 rotate-45 translate-x-12 translate-y-12 pointer-events-none" />
      </div>
    </div>
  )
}
