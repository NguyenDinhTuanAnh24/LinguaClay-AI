'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Minus } from 'lucide-react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

type Plan = {
  id: '3_MONTHS' | '6_MONTHS' | '1_YEAR'
  name: string
  price: number
  period: string
  features: string[]
  highlight?: boolean
  badgeText?: string
  level: number
}

type UserCouponOption = {
  userCouponId: string
  code: string
  discountPercent: number
  expiresAt: string
}

const PLANS: Plan[] = [
  {
    id: '3_MONTHS',
    name: 'BẢN TIÊU CHUẨN',
    price: 299000,
    period: '/3 Tháng',
    level: 1,
    features: [
      'Flashcards không giới hạn',
      'AI Tutor Pro cơ bản',
      '100 Chủ điểm ngữ pháp Pro',
      'Dễ dàng nâng cấp sau này',
    ],
  },
  {
    id: '6_MONTHS',
    name: 'BẢN CHUYÊN SÂU',
    price: 399000,
    period: '/6 Tháng',
    level: 2,
    features: [
      'Flashcards không giới hạn',
      'AI Tutor Pro (phản hồi giọng nói)',
      '200+ Chủ điểm ngữ pháp Pro',
      'Hệ thuật SRS cá nhân hóa',
      'Hỗ trợ qua Email',
    ],
  },
  {
    id: '1_YEAR',
    name: 'BẢN TOÀN DIỆN',
    price: 499000,
    period: '/1 Năm',
    level: 3,
    highlight: true,
    badgeText: 'HỜI NHẤT',
    features: [
      'Toàn bộ tính năng gói 6 tháng',
      'Ưu tiên cập nhật tính năng mới sớm nhất',
      'Tải file PDF bài học độc quyền',
      'Không giới hạn AI Chatbot nâng cao',
      'Hỗ trợ VIP 1:1 qua Zalo/Telegram',
    ],
  },
]

const FEATURE_MATRIX: Array<{
  feature: string
  values: Record<Plan['id'], boolean>
}> = [
    {
      feature: 'Flashcards không giới hạn',
      values: { '3_MONTHS': true, '6_MONTHS': true, '1_YEAR': true },
    },
    {
      feature: 'AI Tutor Pro (phản hồi giọng nói)',
      values: { '3_MONTHS': false, '6_MONTHS': true, '1_YEAR': true },
    },
    {
      feature: 'Chủ điểm ngữ pháp Pro nâng cao',
      values: { '3_MONTHS': false, '6_MONTHS': true, '1_YEAR': true },
    },
    {
      feature: 'Tải PDF bài học độc quyền',
      values: { '3_MONTHS': false, '6_MONTHS': false, '1_YEAR': true },
    },
    {
      feature: 'Hỗ trợ VIP 1:1 qua Zalo/Telegram',
      values: { '3_MONTHS': false, '6_MONTHS': false, '1_YEAR': true },
    },
  ]

const FAQS = [
  {
    q: 'Tôi có thể hủy bất cứ lúc nào không?',
    a: 'Có. Bạn có thể dừng sử dụng hoặc đổi gói bất kỳ lúc nào trong phần tài khoản.',
  },
  {
    q: 'Thanh toán qua kênh nào?',
    a: 'Thanh toán qua PayOS và chuyển khoản Napas/VietQR, hệ thống xác nhận tự động.',
  },
  {
    q: 'Nâng cấp xong có mất dữ liệu cũ không?',
    a: 'Không. Toàn bộ tiến độ học và lịch sử học tập được giữ nguyên.',
  },
  {
    q: 'Nếu thanh toán lỗi thì sao?',
    a: 'Đơn hàng sẽ ở trạng thái chờ/hủy. Bạn có thể bấm mua lại ngay.',
  },
]

const SOCIAL_PROOF = [
  {
    quote: '"Mình tăng streak đều vì AI Tutor phản hồi rất nhanh."',
    name: 'Ngọc Anh',
    level: 'Intermediate',
  },
  {
    quote: '"Gói 6 tháng đủ sâu để mình thi IELTS Speaking tự tin hơn."',
    name: 'Minh Tuấn',
    level: 'Upper-Intermediate',
  },
]

function PlansContent() {
  const router = useRouter()
  const [proType, setProType] = useState<string | null>(null)
  const [isProMember, setIsProMember] = useState(false)
  const [isLoadingPlan, setIsLoadingPlan] = useState<Plan['id'] | null>(null)
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [couponOptions, setCouponOptions] = useState<UserCouponOption[]>([])
  const [selectedUserCouponId, setSelectedUserCouponId] = useState('')
  const [appliedUserCouponId, setAppliedUserCouponId] = useState('')

  useEffect(() => {
    fetch('/api/user/me')
      .then((res) => res.json())
      .then((data) => {
        setIsProMember(Boolean(data.isPro))
        if (data.isPro) setProType(data.proType || null)
      })
  }, [])

  useEffect(() => {
    fetch('/api/payment/my-coupons')
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data.coupons) ? (data.coupons as UserCouponOption[]) : []
        setCouponOptions(rows)
      })
      .catch(() => {
        setCouponOptions([])
      })
  }, [])

  const currentLevel = useMemo(() => {
    if (!proType) return 0
    return PLANS.find((plan) => plan.id === proType)?.level ?? 0
  }, [proType])

  const currentPlan = useMemo(() => PLANS.find((plan) => plan.id === proType), [proType])
  const adminGrantedMonths = useMemo(() => {
    if (!proType) return null
    const match = proType.match(/^ADMIN_GRANTED_(\d+)M$/)
    if (!match) return null
    return Number(match[1])
  }, [proType])

  const selectedCoupon = useMemo(
    () => couponOptions.find((coupon) => coupon.userCouponId === selectedUserCouponId) ?? null,
    [couponOptions, selectedUserCouponId]
  )

  const appliedCoupon = useMemo(
    () => couponOptions.find((coupon) => coupon.userCouponId === appliedUserCouponId) ?? null,
    [couponOptions, appliedUserCouponId]
  )

  const formatCompactPrice = (amount: number) => `${Math.round(amount / 1000)}k`

  const getPlanDisplayPrice = (plan: Plan) => {
    if (!appliedCoupon) {
      return {
        finalPriceText: formatCompactPrice(plan.price),
        originalPriceText: null as string | null,
      }
    }
    const discountAmount = Math.floor((plan.price * appliedCoupon.discountPercent) / 100)
    const finalAmount = Math.max(1000, plan.price - discountAmount)
    return {
      finalPriceText: formatCompactPrice(finalAmount),
      originalPriceText: formatCompactPrice(plan.price),
    }
  }

  const initiatePayment = (plan: Plan) => {
    setPendingPlan(plan)
    setShowConfirm(true)
  }

  const handleApplyCoupon = () => {
    if (!selectedCoupon) return
    setAppliedUserCouponId(selectedCoupon.userCouponId)
    setMessage({
      text: `Đã áp mã ${selectedCoupon.code} (-${selectedCoupon.discountPercent}%).`,
      type: 'success',
    })
  }

  const handleRemoveCoupon = () => {
    setAppliedUserCouponId('')
    setSelectedUserCouponId('')
    setMessage({ text: 'Đã bỏ mã khuyến mãi.', type: 'info' })
  }

  const handlePayment = async () => {
    if (!pendingPlan) return

    setShowConfirm(false)
    setIsLoadingPlan(pendingPlan.id)
    setMessage(null)

    try {
      const response = await fetch('/api/payment/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: `LinguaClay ${pendingPlan.period}`,
          planId: pendingPlan.id,
          userCouponId: appliedUserCouponId || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.orderCode) {
        throw new Error(data.error || 'Không thể tạo đơn thanh toán')
      }

      const params = new URLSearchParams({
        orderCode: String(data.orderCode),
      })
      if (data.checkoutUrl) params.set('checkoutUrl', String(data.checkoutUrl))
      if (data.qrCode) params.set('qrCode', String(data.qrCode))
      if (data.description) params.set('description', String(data.description))
      if (data.payosAmount) params.set('amount', String(data.payosAmount))
      router.push(`/dashboard/payments/checkout?${params.toString()}`)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Không xác định'
      setMessage({ text: `Lỗi: ${msg}`, type: 'error' })
      setIsLoadingPlan(null)
    }
  }

  const getCtaByPlan = (plan: Plan) => {
    if (plan.id === '3_MONTHS') return 'Chọn bản tiêu chuẩn'
    if (plan.id === '6_MONTHS') return 'Chọn bản chuyên sâu'
    return 'Chọn bản toàn diện'
  }

  return (
    <div className="py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-sans font-black text-newsprint-black tracking-tight">
            Bảng giá minh bạch, đơn giản
          </h1>
          <p className="font-sans text-sm text-newsprint-gray-dark mt-4 uppercase tracking-wide">
            Chọn gói học phù hợp với nhu cầu của bạn
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-8 border-[3px] border-newsprint-black bg-white/60 p-4 md:p-5 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <p className="text-sm md:text-base font-semibold text-newsprint-black">
            {isProMember && !currentPlan
              ? adminGrantedMonths
                ? `Bạn đang dùng gói được ADMIN cấp ${adminGrantedMonths} tháng.`
                : 'Bạn đang dùng gói nâng cấp được cấp bởi ADMIN.'
              : currentPlan
                ? currentPlan.id === '1_YEAR'
                  ? `Bạn đang sở hữu ${currentPlan.name} - gói học cao cấp nhất.`
                  : `Bạn đang dùng ${currentPlan.name} - nâng cấp để mở thêm quyền lợi cao hơn.`
                : 'Bạn đang dùng bản miễn phí - nâng cấp để mở khóa toàn bộ tính năng.'}
          </p>
        </div>

        {message && (
          <div
            className={`mb-8 p-4 border-[3px] text-center font-bold uppercase tracking-widest text-[11px] ${message.type === 'success'
              ? 'bg-[#ECFDF3] border-[#027A48] text-[#027A48]'
              : message.type === 'error'
                ? 'bg-[#FEF3F2] border-[#B42318] text-[#B42318]'
                : 'bg-[#EEF4FF] border-[#1849A9] text-[#1849A9]'
              }`}
          >
            {message.text}
          </div>
        )}

        {couponOptions.length > 0 && (
          <div className="max-w-6xl mx-auto mb-8 border-[3px] border-newsprint-black bg-[#F5F0E8] p-4 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-newsprint-black">Khuyến mãi của bạn</p>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto]">
              <select
                value={selectedUserCouponId}
                onChange={(e) => {
                  const nextId = e.target.value
                  setSelectedUserCouponId(nextId)
                  setAppliedUserCouponId(nextId)
                }}
                className="h-10 border-2 border-newsprint-black bg-white px-3 text-sm font-semibold"
              >
                <option value="">Không áp dụng khuyến mãi</option>
                {couponOptions.map((coupon) => (
                  <option key={coupon.userCouponId} value={coupon.userCouponId}>
                    {coupon.code} - giảm {coupon.discountPercent}%
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={!selectedCoupon}
                className="h-10 border-2 border-newsprint-black px-3 text-[11px] font-black uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Áp mã
              </button>
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="h-10 border-2 border-newsprint-black px-3 text-[11px] font-black uppercase tracking-widest"
                >
                  Bỏ mã
                </button>
              ) : null}
            </div>
            {appliedCoupon ? (
              <p className="mt-2 text-xs font-bold text-[#166534]">
                Đã áp mã: {appliedCoupon.code} (-{appliedCoupon.discountPercent}%)
              </p>
            ) : null}
          </div>
        )}

        <div className="max-w-6xl mx-auto font-sans">
          <div className="grid grid-cols-1 md:grid-cols-3 border-[3px] border-newsprint-black bg-transparent shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
            {PLANS.map((plan, index) => {
              const isCurrent = proType === plan.id
              const isLockedByCurrentPro = isProMember && !isCurrent
              const isLower = plan.level < currentLevel
              const isLockedByLoading = isLoadingPlan !== null && isLoadingPlan !== plan.id
              const isDisabled = isLockedByCurrentPro || isCurrent || isLower || isLockedByLoading || isLoadingPlan === plan.id
              const displayPrice = getPlanDisplayPrice(plan)

              return (
                <div
                  key={plan.id}
                  className={`p-8 lg:p-9 min-h-150 flex flex-col relative group transition-all duration-300 ${index < PLANS.length - 1 ? 'border-b-[3px] md:border-b-0 md:border-r-[3px] border-newsprint-black' : ''
                    } ${plan.highlight ? 'bg-[#fffdf7]' : 'bg-[#F5F0E8]'} ${!isDisabled ? 'hover:bg-white md:hover:-translate-y-1 md:hover:shadow-[0_8px_0px_0px_rgba(20,20,20,1)]' : ''}`}
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-black uppercase tracking-wide text-newsprint-black">
                        {plan.name}
                      </h3>
                      {plan.badgeText && (
                        <div className="text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest absolute top-0 right-0 border-b-[3px] border-l-[3px] border-newsprint-black bg-[#e63946] transition-transform duration-200 group-hover:scale-105">
                          {plan.badgeText}
                        </div>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1 mb-3 font-sans border-newsprint-black/30">
                      <span className="text-5xl font-black text-newsprint-black">{displayPrice.finalPriceText}</span>
                      <span className="text-base font-normal text-newsprint-black">{plan.period}</span>
                    </div>
                    {displayPrice.originalPriceText ? (
                      <p className="text-xs font-bold text-[#B42318] line-through mb-2">
                        {displayPrice.originalPriceText}
                      </p>
                    ) : null}

                    <hr className="border-t-2 border-dotted border-newsprint-gray-medium my-6" />

                    <ul className="space-y-3 mb-10 min-h-43">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm font-sans text-newsprint-black">
                          <Check className="w-5 h-5 shrink-0 text-newsprint-black mt-0.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-newsprint-black/20 pt-3 mb-4">
                    <p className="text-xs italic text-newsprint-black">
                      {SOCIAL_PROOF[index % SOCIAL_PROOF.length].quote}
                    </p>
                    <p className="text-[11px] font-semibold text-newsprint-gray-dark mt-1">
                      {SOCIAL_PROOF[index % SOCIAL_PROOF.length].name} · {SOCIAL_PROOF[index % SOCIAL_PROOF.length].level}
                    </p>
                  </div>

                  <button
                    disabled={isDisabled}
                    onClick={() => initiatePayment(plan)}
                    className={`w-full text-center py-4 border-[3px] border-black font-bold uppercase text-sm tracking-wide transition-all duration-200 mt-auto ${isLockedByCurrentPro
                      ? 'bg-[#166534] text-white border-[#166534] cursor-default'
                      : isCurrent
                        ? 'bg-[#166534] text-white border-[#166534] cursor-default'
                        : isLower
                          ? 'bg-[#E5E7EB] text-[#6B7280] border-[#9CA3AF] cursor-not-allowed'
                          : 'bg-transparent text-black hover:bg-black hover:text-white hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]'
                      }`}
                  >
                    {isLoadingPlan === plan.id
                      ? 'Đang khởi tạo...'
                      : isLockedByCurrentPro
                        ? 'Đã có gói đang hoạt động'
                        : isCurrent
                          ? 'Đang sử dụng'
                          : isLower
                            ? 'Đã có gói cao hơn'
                            : getCtaByPlan(plan)}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-10">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-newsprint-black mb-4">
            So sánh tính năng chi tiết
          </h2>
          <div className="border-[3px] border-newsprint-black bg-[#F5F0E8] overflow-x-auto">
            <table className="w-full min-w-180 border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 border-b-2 border-newsprint-black text-sm font-black uppercase tracking-wider">
                    Tính năng
                  </th>
                  {PLANS.map((plan) => (
                    <th
                      key={`head-${plan.id}`}
                      className="text-center p-4 border-b-2 border-l-2 border-newsprint-black text-sm font-black uppercase tracking-wider"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_MATRIX.map((row) => (
                  <tr key={row.feature}>
                    <td className="p-4 border-b border-newsprint-black/30 text-sm font-medium text-newsprint-black">
                      {row.feature}
                    </td>
                    {PLANS.map((plan) => (
                      <td
                        key={`${row.feature}-${plan.id}`}
                        className="p-4 border-b border-l-2 border-newsprint-black/30 text-center"
                      >
                        {row.values[plan.id] ? (
                          <Check className="w-5 h-5 mx-auto text-[#16A34A]" />
                        ) : (
                          <Minus className="w-5 h-5 mx-auto text-[#6B7280]" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-10">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-newsprint-black mb-4">
            Câu hỏi thường gặp
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 border-[3px] border-newsprint-black">
            {FAQS.map((item, idx) => (
              <div
                key={item.q}
                className={`p-5 bg-[#F5F0E8] ${idx % 2 === 0 ? 'md:border-r-2 md:border-newsprint-black/30' : ''
                  } ${idx < FAQS.length - 2 ? 'md:border-b-2 md:border-newsprint-black/30' : ''} border-b border-newsprint-black/20`}
              >
                <p className="text-sm font-black text-newsprint-black mb-2">{item.q}</p>
                <p className="text-sm text-newsprint-gray-dark">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 border-2 border-newsprint-black/40 bg-white/60 px-4 py-3 text-center">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-newsprint-black">
            Không tự gia hạn · Hỗ trợ hoàn tiền trong 7 ngày · Hủy bất kỳ lúc nào
          </p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Xác nhận thanh toán"
        message={`Bạn có chắc chắn muốn nâng cấp lên ${pendingPlan?.name || 'gói này'}? Sau khi xác nhận, bạn sẽ đến trang thanh toán trên giao diện của bạn.`}
        confirmText="Tiếp tục mua"
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
