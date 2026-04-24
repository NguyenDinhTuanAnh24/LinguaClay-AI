'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, LoaderCircle, QrCode, ShieldCheck, XCircle } from 'lucide-react'

type OrderDetail = {
  order: {
    id: string
    orderCode: number
    planId: '3_MONTHS' | '6_MONTHS' | '1_YEAR'
    amount: number
    status: 'PENDING' | 'SUCCESS' | 'CANCELLED'
    createdAt: string
  }
  payos: {
    status: string | null
    checkoutUrl: string | null
    qrCode: string | null
    amount: number
    description: string | null
    accountName: string | null
    accountNumber: string | null
    bin: string | null
  }
}

const PLAN_LABEL: Record<'3_MONTHS' | '6_MONTHS' | '1_YEAR', string> = {
  '3_MONTHS': 'Bản tiêu chuẩn (3 tháng)',
  '6_MONTHS': 'Bản chuyên sâu (6 tháng)',
  '1_YEAR': 'Bản toàn diện (1 năm)',
}

const EXPIRE_MINUTES = 15

function getFriendlyStatus(status: string | null) {
  const normalized = (status || 'PENDING').toUpperCase()
  if (normalized === 'PAID' || normalized === 'SUCCESS') {
    return { label: 'Đã thanh toán', color: 'bg-[#ECFDF3] text-[#027A48] border-[#027A48]' }
  }
  if (normalized === 'CANCELLED') {
    return { label: 'Đã hủy', color: 'bg-[#FEF3F2] text-[#B42318] border-[#B42318]' }
  }
  if (normalized === 'EXPIRED') {
    return { label: 'Đã hết hạn', color: 'bg-[#FEF3F2] text-[#B42318] border-[#B42318]' }
  }
  return { label: 'Chờ thanh toán', color: 'bg-[#FEF3F2] text-[#B42318] border-[#B42318]' }
}

function formatCountdown(seconds: number) {
  const safe = Math.max(0, seconds)
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderCode = searchParams.get('orderCode')
  const status = searchParams.get('status')
  const fallbackQrCode = searchParams.get('qrCode')
  const fallbackDescription = searchParams.get('description')
  const fallbackAmount = searchParams.get('amount')
  const zaloSupportLink = process.env.NEXT_PUBLIC_ZALO_SUPPORT_URL || 'https://zalo.me/0866555468'

  const [loading, setLoading] = useState(true)
  const [submittingCancel, setSubmittingCancel] = useState(false)
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(EXPIRE_MINUTES * 60)
  const [isVerifyingNow, setIsVerifyingNow] = useState(false)

  const fetchDetail = useCallback(async () => {
    if (!orderCode) return
    setError(null)
    const response = await fetch(`/api/payment/order-detail?orderCode=${orderCode}`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Không thể tải thông tin đơn hàng')
    setDetail(data as OrderDetail)
  }, [orderCode])

  const verifyPayment = useCallback(async (manual = false) => {
    if (!orderCode) return

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 12000)
    try {
      const response = await fetch('/api/payment/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
        cache: 'no-store',
        body: JSON.stringify({ orderCode: Number(orderCode) }),
        signal: controller.signal,
      })

      const data = await response.json()
      if (response.ok && data.success) {
        const planLabel = detail ? PLAN_LABEL[detail.order.planId] : 'gói nâng cấp'
        setSuccessMessage(`Thanh toán thành công. Bạn đã kích hoạt ${planLabel}.`)
        
        // Redirect to history only on fresh success
        setTimeout(() => {
          // Note: Removing 'success=1' from query as requested by history page changes
          router.push(`/dashboard/payments/history?orderCode=${orderCode}`)
        }, 3000)
        return
      }

      if (manual) {
        setInfoMessage('Vui lòng kiểm tra lại sau vài giây.')
      }
      await fetchDetail()
    } catch {
      if (manual) {
        setInfoMessage('Vui lòng kiểm tra lại sau vài giây.')
      }
    } finally {
      window.clearTimeout(timeout)
    }
  }, [detail, fetchDetail, orderCode, router])

  useEffect(() => {
    if (status === 'cancelled') {
      router.replace('/dashboard/plans')
    }
  }, [status, router])

  useEffect(() => {
    let alive = true
    const run = async () => {
      try {
        await fetchDetail()
      } catch (err: unknown) {
        if (alive) {
          const message = err instanceof Error ? err.message : 'Không xác định'
          setError(message)
        }
      } finally {
        if (alive) setLoading(false)
      }
    }
    void run()
    return () => {
      alive = false
    }
  }, [fetchDetail])

  useEffect(() => {
    if (!detail) return
    
    // Stop countdown if already paid
    const isPaid = detail.order.status === 'SUCCESS' || detail.payos.status === 'PAID'
    if (isPaid) {
      setCountdown(0)
      return
    }

    const expiresAt = new Date(detail.order.createdAt).getTime() + EXPIRE_MINUTES * 60 * 1000

    const tick = () => {
      const remain = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setCountdown(remain)
    }

    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [detail])

  useEffect(() => {
    if (!detail || !orderCode || successMessage) return
    if (isVerifyingNow) return

    // If order is already paid, we don't need to auto-verify or redirect again
    if (detail.order.status === 'SUCCESS' || detail.payos.status === 'PAID') {
      return
    }

    // Polling for pending orders
    const timer = window.setInterval(() => {
      void verifyPayment(false)
    }, 4000)

    return () => window.clearInterval(timer)
  }, [detail, isVerifyingNow, orderCode, successMessage, verifyPayment])

  const qrSrc = useMemo(() => {
    const value = detail?.payos.qrCode || fallbackQrCode
    if (!value) return null
    if (value.startsWith('http') || value.startsWith('data:image')) return value
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(value)}`
  }, [detail?.payos.qrCode, fallbackQrCode])

  const mergedStatus = useMemo(() => {
    if (!detail) return null
    return detail.payos.status || detail.order.status
  }, [detail])

  const friendlyStatus = useMemo(() => getFriendlyStatus(mergedStatus), [mergedStatus])

  const handleCancel = async () => {
    if (!orderCode) return
    setSubmittingCancel(true)
    try {
      const response = await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode: Number(orderCode), reason: 'User canceled from checkout UI' }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Không thể hủy đơn')
      }
    } catch {
      // Always return to plans as requested.
    } finally {
      router.push('/dashboard/plans')
    }
  }

  const handleVerifyNow = async () => {
    setIsVerifyingNow(true)
    setInfoMessage(null)
    try {
      await verifyPayment(true)
    } finally {
      setIsVerifyingNow(false)
    }
  }

  const copyText = async (value: string | null) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
  }

  if (!orderCode) {
    return (
      <div className="max-w-3xl mx-auto border-[3px] border-newsprint-black p-6 bg-[#F5F0E8]">
        <p className="font-semibold text-newsprint-black">Không tìm thấy mã đơn hàng.</p>
        <Link href="/dashboard/plans" className="inline-block mt-4 underline font-bold">
          Quay lại trang Plans
        </Link>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-black text-newsprint-black">Hoàn tất thanh toán</h1>
        </div>

        {successMessage && (
          <div className="p-4 border-[3px] border-[#027A48] bg-[#ECFDF3] text-[#027A48] font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 border-[3px] border-[#B42318] bg-[#FEF3F2] text-[#B42318] font-bold flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        {infoMessage && (
          <div className="text-sm text-[#B42318] font-semibold">
            <span>{infoMessage}</span>
          </div>
        )}

        {loading && (
          <div className="p-10 border-[3px] border-newsprint-black bg-[#F5F0E8] text-center">
            <LoaderCircle className="w-6 h-6 animate-spin mx-auto mb-3" />
            <p className="font-semibold">Đang tải thông tin thanh toán...</p>
          </div>
        )}

        {!loading && detail && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="border-[3px] border-newsprint-black bg-[#F5F0E8] p-6">
                <p className="text-xs uppercase font-bold tracking-widest text-newsprint-gray-dark mb-3">Mã QR thanh toán</p>
                <div className="border-[2px] border-newsprint-black bg-white p-3 w-full flex items-center justify-center">
                  {qrSrc ? (
                    <img src={qrSrc} alt="QR PayOS" width={220} height={220} className="object-contain" />
                  ) : (
                    <div className="w-[220px] h-[220px] flex items-center justify-center bg-[#F3F3F3] text-newsprint-gray-dark">
                      <div className="text-center px-4">
                        <QrCode className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-sm">Đang chờ dữ liệu QR từ PayOS</p>
                      </div>
                    </div>
                  )}
                </div>

                <ol className="mt-4 text-sm text-newsprint-black space-y-1 font-medium">
                  <li>1. Mở app ngân hàng</li>
                  <li>2. Quét mã QR ở trên</li>
                  <li>3. Xác nhận chuyển khoản và chờ hệ thống cập nhật</li>
                </ol>

                {countdown > 0 && mergedStatus !== 'PAID' && mergedStatus !== 'SUCCESS' && (
                  <div className="mt-4 inline-flex items-center gap-2 text-[#B42318] font-bold text-xs uppercase tracking-wider">
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    Mã QR hết hạn sau {formatCountdown(countdown)}
                  </div>
                )}
              </div>

              <div className="border-[3px] border-newsprint-black bg-[#F5F0E8] p-6 space-y-4">
                <p className="text-xs uppercase font-bold tracking-widest text-newsprint-gray-dark">Thông tin đơn hàng</p>

                <div className="grid grid-cols-[140px_1fr_auto] gap-2 items-center text-sm">
                  <span className="font-semibold">Mã đơn</span>
                  <span className="font-black">{detail.order.orderCode}</span>
                  <button onClick={() => copyText(String(detail.order.orderCode))} className="text-xs underline">
                    Copy
                  </button>

                  <span className="font-semibold">Gói hội viên</span>
                  <span className="font-black">{PLAN_LABEL[detail.order.planId]}</span>
                  <span />

                  <span className="font-semibold">Số tiền</span>
                  <span className="font-black">
                    {(detail.payos.amount || Number(fallbackAmount) || detail.order.amount).toLocaleString('vi-VN')} VND
                  </span>
                  <span />

                  <span className="font-semibold">Trạng thái</span>
                  <span>
                    <span className={`inline-flex items-center gap-2 px-2 py-1 border rounded-sm font-bold ${friendlyStatus.color}`}>
                      {friendlyStatus.label === 'Chờ thanh toán' && <LoaderCircle className="w-3 h-3 animate-spin" />}
                      {friendlyStatus.label}
                    </span>
                  </span>
                  <span />

                  <span className="font-semibold">Nội dung CK</span>
                  <span className="font-black break-all">
                    {detail.payos.description || fallbackDescription || `LinguaClay ${detail.order.planId}`}
                  </span>
                  <button onClick={() => copyText(detail.payos.description || fallbackDescription || `LinguaClay ${detail.order.planId}`)} className="text-xs underline">
                    Copy
                  </button>
                </div>

                {mergedStatus !== 'PAID' && mergedStatus !== 'SUCCESS' && (
                  <div className="pt-2 flex gap-3 flex-wrap">
                    <button
                      onClick={handleVerifyNow}
                      disabled={isVerifyingNow || submittingCancel}
                      className="px-5 py-3 border-[3px] border-newsprint-black bg-black text-white font-black uppercase text-xs tracking-widest hover:bg-[#B42318] transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                      {isVerifyingNow && <LoaderCircle className="w-3 h-3 animate-spin" />}
                      {isVerifyingNow ? 'Đang kiểm tra...' : 'Kiểm tra thanh toán'}
                    </button>
                  </div>
                )}

                {mergedStatus !== 'PAID' && mergedStatus !== 'SUCCESS' && (
                  <div>
                    <button
                      onClick={handleCancel}
                      disabled={submittingCancel || isVerifyingNow}
                      className="px-5 py-2 border-[2px] border-[#B42318] text-[#B42318] bg-transparent font-black uppercase text-xs tracking-widest hover:bg-[#FEF3F2] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submittingCancel ? 'Đang hủy đơn...' : 'Hủy đơn'}
                    </button>
                  </div>
                )}

              </div>
            </div>

            <div className="pt-8 text-center flex flex-col items-center">
              <p className="text-xs md:text-sm font-semibold text-newsprint-gray-dark flex items-center justify-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-[#027A48]" />
                Giao dịch được mã hóa an toàn &bull; Hỗ trợ bảo mật 256-bit
              </p>
              <div className="h-[1px] w-20 bg-newsprint-black/10 mb-3" />
              <a
                href="https://zalo.me/0866555468"
                target="_blank"
                rel="noreferrer"
                className="text-xs md:text-sm font-black underline text-newsprint-black hover:text-red-600 transition-colors uppercase tracking-widest"
              >
                Hỗ trợ qua Zalo: https://zalo.me/0866555468
              </a>
              <p className="text-[10px] text-newsprint-gray-dark mt-2 uppercase font-bold opacity-60">Hỗ trợ 24/7 khi gặp sự cố thanh toán</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
