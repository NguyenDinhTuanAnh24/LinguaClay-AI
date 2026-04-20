import React from 'react'
import Link from 'next/link'

const PLANS = [
  {
    id: 'free',
    name: 'Bản Miễn Phí',
    icon: '🌾',
    duration: 'MÃI MÃI',
    price: '0đ',
    originalPrice: '',
    save: 'Cơ bản',
    features: [
      '20 từ vựng mới mỗi ngày',
      'Học 5 chủ điểm ngữ pháp',
      '10 phút AI Chat mỗi ngày',
      'Flashcard SRS cơ bản',
      'Theo dõi tiến độ học tập'
    ],
    isPopular: false,
    color: 'clay-muted'
  },
  {
    id: 'trial',
    name: 'Gói Trải Nghiệm',
    icon: '🌱',
    duration: '3 THÁNG',
    price: '299.000đ',
    originalPrice: '599.000đ',
    save: 'Tiết kiệm 50%',
    features: [
      'Gia sư AI Grammar & Writing',
      'Học không giới hạn 200+ chủ điểm',
      'AI Chat hội thoại 24/7',
      'Flashcard SRS nâng cao',
      'Phân tích tiến độ học thuật'
    ],
    isPopular: false,
    color: 'clay-blue'
  },
  {
    id: 'standard',
    name: 'Gói Tiêu Chuẩn',
    icon: '📗',
    duration: '6 THÁNG',
    price: '399.000đ',
    originalPrice: '799.000đ',
    save: 'Tiết kiệm 50%',
    features: [
      'Gia sư AI Grammar & Writing',
      'Học không giới hạn 200+ chủ điểm',
      'AI Chat hội thoại 24/7',
      'Flashcard SRS hệ nâng cao',
      'Tải tài liệu học thuật PDF'
    ],
    isPopular: false,
    color: 'clay-green'
  },
  {
    id: 'premium',
    name: 'Gói Premium (1 Năm)',
    icon: '👑',
    duration: '12 THÁNG',
    price: '499.000đ',
    originalPrice: '1.299.000đ',
    save: 'Tiết kiệm 60%',
    features: [
      'TOÀN BỘ QUYỀN LỢI GÓI 6 THÁNG',
      'Mở khóa 200+ cấp độ nâng cao',
      'Hỗ trợ khách hàng PRO ưu tiên',
      'Tùy chỉnh lộ trình cá nhân hóa',
      'Chứng nhận hoàn thành LinguaClay'
    ],
    isPopular: true,
    color: 'clay-brown'
  }
]

export default function PricingPage() {
  return (
    <div className="py-20 px-4 md:px-8 bg-clay-cream/30">
      <div className="max-w-[1440px] mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-1.5 bg-clay-orange/10 text-clay-orange text-[10px] font-black uppercase rounded-full border border-clay-orange/20 tracking-widest">
            Khám phá sức mạnh AI ngôn ngữ
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black text-clay-deep tracking-tight">
             Gói Cước <span className="text-transparent bg-clip-text bg-gradient-to-r from-clay-orange to-clay-pink">Linh Hoạt</span>
          </h1>
          <p className="text-lg text-clay-muted max-w-3xl mx-auto font-medium leading-relaxed">
             Cho dù bạn chỉ mới bắt đầu hay muốn trở thành bậc thầy ngôn ngữ, chúng tôi đều có lộ trình phù hợp cho bạn.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`relative flex flex-col p-8 rounded-[40px] shadow-clay-card border-4 transition-all duration-500 hover:-translate-y-2 group
                ${plan.isPopular 
                  ? 'bg-gradient-to-br from-clay-brown to-clay-brown-dark border-white/20 text-white z-10 scale-[1.03] shadow-clay-float' 
                  : 'bg-white/80 border-white text-clay-deep backdrop-blur-sm'}`}
            >
              {plan.isPopular && (
                <div className="absolute top-6 right-6 bg-clay-orange text-[9px] font-black px-3 py-1 rounded-full uppercase shadow-lg border border-white/20 animate-pulse">
                  HOT DEAL
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center text-2xl shadow-clay-inset border-2 border-white/50 ${plan.isPopular ? 'bg-white/20' : 'bg-clay-cream/50'}`}>
                  {plan.icon}
                </div>
                <div>
                  <h2 className="text-xl font-heading font-black tracking-tight leading-tight">{plan.name}</h2>
                  <p className={`${plan.isPopular ? 'text-white/50' : 'text-clay-muted'} text-[9px] font-black uppercase tracking-widest mt-1`}>{plan.duration}</p>
                </div>
              </div>

              <div className="mb-8 min-h-[90px]">
                {plan.originalPrice && (
                  <div className={`${plan.isPopular ? 'text-white/30' : 'text-clay-muted/60'} text-xs font-bold line-through ml-1 mb-1 italic`}>
                    {plan.originalPrice}
                  </div>
                )}
                <div className={`text-4xl font-heading font-black tracking-tighter ${plan.isPopular ? 'text-white' : 'text-clay-deep'}`}>
                  {plan.price}
                </div>
                <div className={`${plan.isPopular ? 'bg-white/10 border-white/10 text-white/80' : 'bg-clay-green/10 border-clay-green/20 text-clay-green'} inline-block px-3 py-1 rounded-full border text-[9px] font-black uppercase mt-2`}>
                   {plan.save}
                </div>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-[12px] font-bold leading-snug">
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] shrink-0 border border-white/10 ${plan.isPopular ? 'bg-white/20' : 'bg-clay-green/20 text-clay-green'}`}>✓</div>
                    <span className={plan.isPopular ? 'text-white/80' : 'text-clay-deep/70'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                href={plan.id === 'free' ? '/login' : '/dashboard/plans'} 
                className={`w-full py-4 font-heading font-black text-[12px] rounded-[22px] text-center transition-all duration-300 shadow-clay-button active:scale-95
                  ${plan.isPopular 
                    ? 'bg-white text-clay-deep hover:bg-clay-orange hover:text-white relative overflow-hidden group/btn' 
                    : plan.id === 'free'
                    ? 'bg-white text-clay-muted border-2 border-clay-cream hover:bg-clay-cream hover:text-clay-deep'
                    : 'bg-clay-cream text-clay-deep hover:bg-clay-blue hover:text-white border-2 border-clay-cream/50'}`}
              >
                {plan.isPopular && (
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite] pointer-events-none" />
                )}
                <span className="relative">Bắt Đầu {plan.id === 'free' ? 'Miễn Phí' : 'Ngay'} 🚀</span>
              </Link>
            </div>
          ))}
        </div>
        
        {/* Money back guarantee */}
        <div className="bg-white/50 backdrop-blur-md rounded-[45px] p-8 md:p-10 border-4 border-white shadow-clay-card max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
           <div className="w-20 h-20 bg-clay-blue/10 rounded-[30px] flex items-center justify-center text-4xl shadow-clay-inset">🛡️</div>
           <div className="flex-1 space-y-3 text-center md:text-left">
              <h3 className="text-xl font-heading font-black text-clay-deep">Cam Kết Hoàn Tiền 100%</h3>
              <p className="text-xs text-clay-muted font-medium leading-relaxed">
                Chúng tôi cam kết hoàn lại 100% số tiền nếu bạn không hài lòng về chất lượng dịch vụ trong 7 ngày đầu tiên kể từ lúc nâng cấp. Thủ tục nhanh gọn, thực hiện ngay trong trang quản lý cá nhân.
              </p>
           </div>
           <div className="shrink-0">
              <div className="px-6 py-3 bg-clay-orange text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-clay-button animate-breathe">
                An tâm tuyệt đối
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
