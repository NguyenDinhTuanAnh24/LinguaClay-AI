'use client'

import { useState, useEffect } from 'react'

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
  { id: '3_MONTHS', name: 'Gói Khởi Động', duration: '3 Tháng', price: 299000, originalPrice: 599000 },
  { id: '6_MONTHS', name: 'Gói Tiết Kiệm', duration: '6 Tháng', price: 399000, originalPrice: 799000, tag: 'Bán chạy' },
  { id: '1_YEAR', name: 'Gói Vĩnh Viễn', duration: '1 Năm', price: 499000, originalPrice: 1299000, isPopular: true, tag: 'Hời nhất' }
]

export default function PricingSelector({ onUpgrade }: { onUpgrade: (plan: Plan) => void }) {
  const [selectedId, setSelectedId] = useState('1_YEAR')
  const [timeLeft, setTimeLeft] = useState('02:15:30')

  // Logic Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const parts = timeLeft.split(':').map(Number)
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
      <div className="bg-clay-orange/10 border-2 border-clay-orange/30 rounded-[25px] p-4 flex items-center justify-between shadow-clay-inset">
        <div className="flex items-center gap-3">
          <span className="text-xl">⏳</span>
          <span className="text-xs font-black text-clay-deep uppercase">Ưu đãi kết thúc sau:</span>
        </div>
        <span className="font-heading font-black text-clay-orange text-lg tracking-wider font-mono bg-white px-3 py-1 rounded-xl shadow-clay-card lowercase">
          {timeLeft}
        </span>
      </div>

      {/* Main Pricing Card */}
      <div className="bg-gradient-to-br from-clay-brown to-clay-brown-dark rounded-[45px] shadow-clay-card border-4 border-white/10 p-8 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl transition-transform duration-700" />
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner">👑</div>
            <span className="px-4 py-1.5 bg-clay-orange rounded-full text-[10px] font-black uppercase tracking-wider shadow-clay-button border-2 border-white/20">
              Mở bán sớm: -50%
            </span>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-heading font-black">Nâng cấp PRO Membership</h3>
            <p className="text-xs text-clay-cream/60 leading-relaxed font-medium">
              Sử dụng không giới hạn AI Chat, Grammar Tutor và mở khóa 200+ chủ điểm nâng cao.
            </p>
          </div>

          {/* Plan Selector Pills */}
          <div className="bg-black/20 p-1.5 rounded-[22px] flex gap-1.5 border border-white/5 shadow-inner">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedId(plan.id)}
                className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-tight transition-all duration-300 relative ${
                  selectedId === plan.id
                    ? 'bg-clay-orange text-white shadow-clay-button border-2 border-white/20 scale-105 z-10'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {plan.duration}
                {plan.tag && selectedId !== plan.id && (
                   <span className="absolute -top-1 -right-1 w-2 h-2 bg-clay-green rounded-full shadow-lg" />
                )}
              </button>
            ))}
          </div>

          {/* Price Display */}
          <div className="space-y-1 text-center py-4 bg-black/10 rounded-[30px] border border-white/5">
             <div className="flex items-center justify-center gap-3">
               <span className="text-white/30 line-through text-sm font-bold">{selectedPlan.originalPrice.toLocaleString()}đ</span>
               <span className="text-3xl font-heading font-black text-clay-cream">{selectedPlan.price.toLocaleString()}đ</span>
             </div>
             {selectedId === '1_YEAR' && (
               <p className="text-[10px] font-black text-clay-green uppercase animate-pulse">
                 Chỉ ~41k/tháng (Tiết kiệm 60%)
               </p>
             )}
             {selectedId === '6_MONTHS' && (
               <p className="text-[10px] font-black text-clay-cream/80 uppercase">
                 Chỉ ~66k/tháng
               </p>
             )}
          </div>

          <button
            onClick={() => onUpgrade(selectedPlan)}
            className="w-full py-5 bg-white text-clay-brown-dark font-heading font-black text-sm uppercase tracking-widest rounded-[25px] shadow-clay-button hover:scale-[1.02] active:scale-95 transition-all"
          >
            Nâng cấp ngay 🚀
          </button>

          <p className="text-[9px] text-center text-white/40 font-medium">
             Hỗ trợ kích hoạt thủ công trong 5-10 phút sau chuyển khoản
          </p>
        </div>
      </div>
    </div>
  )
}
