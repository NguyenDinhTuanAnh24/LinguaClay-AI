'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const PLANS = [
  {
    id: '6_MONTHS',
    title: 'Gói Linh Hoạt',
    price: '399k',
    originalPrice: '799k',
    duration: '6 Tháng',
    level: 2,
    features: [
      'Flashcards không giới hạn',
      'AI Tutor Pro (Phản hồi giọng nói)',
      '200+ Chủ điểm ngữ pháp Pro',
      'Hệ thuật SRS cá nhân hóa',
      'Hỗ trợ qua Email'
    ],
    isFeatured: false,
    color: 'bg-white',
    textColor: 'text-clay-deep',
    buttonColor: 'bg-clay-blue text-white',
    badge: null
  },
  {
    id: '1_YEAR',
    title: 'Gói Vĩnh Viễn - 1 Năm',
    price: '499k',
    originalPrice: '1299k',
    duration: '1 Năm',
    level: 3,
    features: [
      'Toàn bộ tính năng gói 6 tháng',
      'Ưu tiên cập nhật tính năng mới sớm nhất',
      'Tải file PDF bài học độc quyền',
      'Không giới hạn AI Chatbot nâng cao',
      'Hỗ trợ VIP 1:1 qua Zalo/Telegram'
    ],
    isFeatured: true,
    color: 'bg-gradient-to-br from-clay-brown to-clay-brown-dark',
    textColor: 'text-white',
    buttonColor: 'bg-clay-orange text-white shadow-clay-orange/40 shadow-lg',
    badge: 'HỜI NHẤT',
    discount: 'Tiết kiệm 60% - Khuyên dùng'
  },
  {
    id: '3_MONTHS',
    title: 'Gói Trải Nghiệm',
    price: '299k',
    originalPrice: '599k',
    duration: '3 Tháng',
    level: 1,
    features: [
      'Flashcards không giới hạn',
      'AI Tutor Pro cơ bản',
      '100 Chủ điểm ngữ pháp Pro',
      'Dễ dàng nâng cấp sau này'
    ],
    isFeatured: false,
    color: 'bg-white',
    textColor: 'text-clay-deep',
    buttonColor: 'bg-clay-cream text-clay-muted',
    badge: null
  }
]

function PlansContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [userId, setUserId] = useState<string>('')
  const [proType, setProType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null)
  
  // Confirmation State
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingPlan, setPendingPlan] = useState<any>(null)

  useEffect(() => {
    fetch('/api/user/me')
      .then(res => res.json())
      .then(data => {
        if (data.id) setUserId(data.id)
        if (data.isPro) setProType(data.proType)
      })

    // Xử lý status từ PayOS redirect
    const status = searchParams.get('status')
    const orderCode = searchParams.get('orderCode')

    if (status === 'success' || searchParams.get('status') === 'PAID') {
      setMessage({ text: '⏳ Đang xác thực thanh toán và kích hoạt PRO...', type: 'info' })
      
      if (orderCode) {
        fetch(`/api/payment/verify-session?orderCode=${orderCode}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setMessage({ text: '🎉 Chào mừng Bậc thầy ngôn ngữ! Gói PRO của bạn đã được kích hoạt thành công.', type: 'success' })
              window.location.reload() // Reload to update sidebar and state
            } else {
              setMessage({ text: '⚠️ Hệ thống đang xử lý thanh toán, vui lòng chờ trong giây lát hoặc F5 lại trang.', type: 'info' })
            }
          })
          .catch(() => {
            setMessage({ text: '❌ Lỗi xác thực, vui lòng liên hệ hỗ trợ hoặc thử F5 lại trang.', type: 'error' })
          })
      }
      router.replace('/dashboard/plans')
    } else if (status === 'cancelled') {
      setMessage({ text: '⚠️ Thanh toán đã bị hủy. Bạn có thể thử lại bất cứ lúc nào.', type: 'info' })
      router.replace('/dashboard/plans')
    }
  }, [searchParams, router])

  const initiatePayment = (plan: any) => {
    setPendingPlan(plan)
    setShowConfirm(true)
  }

  const handlePayment = async () => {
    if (!pendingPlan) return
    const plan = pendingPlan
    setShowConfirm(false)
    setIsLoading(plan.id)
    
    try {
      const res = await fetch('/api/payment/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(plan.price.replace('k', '000')),
          description: `LinguaClay ${plan.duration}`,
          planId: plan.id
        })
      })

      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error(data.error || 'Không thể tạo link thanh toán')
      }
    } catch (error: any) {
      setMessage({ text: `❌ Lỗi: ${error.message}`, type: 'error' })
    } finally {
      setIsLoading(null)
    }
  }

  const getPlanLevel = (id: string | null) => {
     if (!id) return 0
     const plan = PLANS.find(p => p.id === id)
     return plan ? plan.level : 0
  }

  const currentLevel = getPlanLevel(proType)

  return (
    <div className="py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-16 lg:space-y-24">
        {/* Alerts */}
        {message && (
          <div className={`p-6 rounded-[30px] border-4 shadow-clay-card animate-float text-center font-bold ${
            message.type === 'success' ? 'bg-clay-green/10 border-clay-green text-clay-green' : 
            message.type === 'error' ? 'bg-red-50 border-red-500 text-red-500' : 
            'bg-clay-blue/10 border-clay-blue text-clay-blue'
          }`}>
            {message.text}
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-heading font-black text-clay-deep tracking-tight">
             Nâng Cấp <span className="text-clay-orange">Trải Nghiệm</span> Học Tập
          </h1>
          <p className="text-clay-muted font-medium max-w-2xl mx-auto leading-relaxed text-sm md:text-lg">
            Gia nhập cộng đồng 5,000+ học viên PRO để kiến tạo kỹ năng ngôn ngữ vượt trội cùng AI Tutor.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-center lg:items-stretch lg:px-6">
          {PLANS.map((plan) => {
            const isCurrent = proType === plan.id
            const isLower = plan.level < currentLevel
            const isDisabled = isCurrent || isLower

            return (
              <div 
                key={plan.id}
                className={`
                  relative p-8 rounded-[50px] transition-all duration-500 flex flex-col border-4 border-white
                  ${plan.isFeatured 
                    ? `${plan.color} ${plan.textColor} shadow-clay-card md:scale-110 z-10 py-14 -translate-y-4 md:-translate-y-8` 
                    : `${plan.color} ${plan.textColor} shadow-clay-card hover:-translate-y-4`
                  }
                  ${isLower ? 'opacity-50 grayscale-[0.5]' : ''}
                `}
              >
                {plan.badge && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-clay-orange text-white font-heading font-black text-sm rounded-full shadow-clay-button border-4 border-white animate-float">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-heading font-black uppercase tracking-tight opacity-90">{plan.title}</h3>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl opacity-40 line-through font-bold">{plan.originalPrice}</span>
                      <span className="text-5xl font-heading font-black tracking-tighter">{plan.price}</span>
                    </div>
                    <p className="text-sm font-bold opacity-60">Thanh toán 1 lần cho {plan.duration}</p>
                  </div>
                  {plan.discount && (
                    <p className="text-xs font-black text-clay-green uppercase tracking-wider bg-white/20 inline-block px-3 py-1 rounded-full">{plan.discount}</p>
                  )}
                </div>

                <div className="h-0.5 w-full bg-current opacity-10 mb-8" />

                <ul className="space-y-5 mb-10 flex-1 text-left">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-semibold">
                      <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] shadow-clay-inset mt-0.5 ${plan.isFeatured ? 'bg-white/20' : 'bg-clay-green/10 text-clay-green'}`}>
                        ✓
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button 
                  disabled={isDisabled || isLoading !== null}
                  onClick={() => initiatePayment(plan)}
                  className={`
                    w-full py-5 rounded-[25px] font-heading font-black text-sm uppercase tracking-widest transition-all shadow-clay-button active:scale-95 disabled:scale-100
                    ${isCurrent ? 'bg-clay-green text-white cursor-default' : plan.buttonColor}
                    ${isLower ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' : 'hover:scale-105'}
                  `}
                >
                  {isLoading === plan.id ? 'Đang khởi tạo...' : 
                   isCurrent ? 'Đang sử dụng ✅' : 
                   isLower ? 'Đã có gói cao hơn' : 'Chọn Gói Này 🚀'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Social Proof & Trust Section */}
        <div className="space-y-12">
           <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 bg-white/50 backdrop-blur-md rounded-[50px] p-10 border-4 border-white shadow-clay-card">
              <div className="flex items-center gap-4 group">
                 <div className="w-16 h-16 bg-clay-green/10 rounded-[22px] flex items-center justify-center text-4xl shadow-clay-button border-2 border-white group-hover:rotate-12 transition-transform">🛡️</div>
                 <div>
                    <h4 className="font-heading font-black text-clay-deep">Hoàn tiền 100%</h4>
                    <p className="text-xs text-clay-muted font-bold">Cam kết trong 7 ngày nếu không hài lòng</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 group">
                 <div className="w-16 h-16 bg-clay-blue/10 rounded-[22px] flex items-center justify-center text-4xl shadow-clay-button border-2 border-white group-hover:-rotate-12 transition-transform">🔒</div>
                 <div>
                    <h4 className="font-heading font-black text-clay-deep">Bảo mật tuyệt đối</h4>
                    <p className="text-xs text-clay-muted font-bold">Thanh toán tự động qua PayOS (VietQR)</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Xác nhận thanh toán"
        message={`Bạn có chắc chắn muốn nâng cấp lên ${pendingPlan?.name}? Hệ thống sẽ chuyển bạn đến trang thanh toán của PayOS.`}
        confirmText="Tiếp tục mua 🚀"
        cancelText="Để mình xem lại"
        onConfirm={handlePayment}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}

export default function PlansPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <PlansContent />
    </Suspense>
  )
}
