'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, FileText, ReceiptText, Search, WalletCards } from 'lucide-react'

type OrderRow = {
  id: string
  orderCode: number
  planId: '3_MONTHS' | '6_MONTHS' | '1_YEAR'
  amount: number
  status: 'PENDING' | 'SUCCESS' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

type MeData = {
  proType: '3_MONTHS' | '6_MONTHS' | '1_YEAR' | null
  proEndDate: string | null
}

type StatusFilter = 'all' | 'success' | 'failed' | 'pending'
type TimeFilter = '30d' | '3m' | '1y' | 'custom'

const PAGE_SIZE = 8

const PLAN_LABEL: Record<'3_MONTHS' | '6_MONTHS' | '1_YEAR', string> = {
  '3_MONTHS': 'Bản tiêu chuẩn (3 tháng)',
  '6_MONTHS': 'Bản chuyên sâu (6 tháng)',
  '1_YEAR': 'Bản toàn diện (1 năm)',
}

function mapOrderStatus(status: OrderRow['status']) {
  if (status === 'SUCCESS') return 'success'
  if (status === 'PENDING') return 'pending'
  return 'failed'
}

function getStatusBadge(status: OrderRow['status']) {
  if (status === 'SUCCESS') {
    return { label: 'Thành công', className: 'bg-[#ECFDF3] text-[#027A48] border-[#027A48]' }
  }
  if (status === 'PENDING') {
    return { label: 'Đang chờ', className: 'bg-[#FFF6DB] text-[#B54708] border-[#B54708]' }
  }
  return { label: 'Thất bại', className: 'bg-[#FEF3F2] text-[#B42318] border-[#B42318]' }
}

function parseDate(value: string) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatDateVN(value: string | null) {
  if (!value) return '--'
  const d = parseDate(value)
  if (!d) return '--'
  return d.toLocaleDateString('vi-VN')
}

export default function PaymentHistoryPage() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [me, setMe] = useState<MeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [page, setPage] = useState(1)

  const paidOrderCode = searchParams.get('orderCode')
  const success = searchParams.get('success') === '1'

  useEffect(() => {
    let alive = true
    const run = async () => {
      try {
        setError(null)
        const [historyRes, meRes] = await Promise.all([
          fetch('/api/payment/history'),
          fetch('/api/user/me'),
        ])
        const historyData = await historyRes.json()
        const meData = await meRes.json()

        if (!historyRes.ok) throw new Error(historyData.error || 'Không thể tải lịch sử thanh toán')
        if (!meRes.ok) throw new Error(meData.error || 'Không thể tải thông tin người dùng')

        if (alive) {
          setOrders(historyData.orders as OrderRow[])
          setMe({
            proType: meData.proType ?? null,
            proEndDate: meData.proEndDate ?? null,
          })
        }
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
  }, [])

  const highlightedOrderCode = useMemo(
    () => (paidOrderCode ? Number(paidOrderCode) : null),
    [paidOrderCode]
  )

  const totalSpent = useMemo(
    () => orders.filter((o) => o.status === 'SUCCESS').reduce((sum, o) => sum + o.amount, 0),
    [orders]
  )

  const currentPlanText = me?.proType ? PLAN_LABEL[me.proType] : 'Free Plan'

  const filteredOrders = useMemo(() => {
    const now = new Date()
    const lowerSearch = searchValue.trim().toLowerCase()

    return orders.filter((order) => {
      if (lowerSearch && !String(order.orderCode).includes(lowerSearch)) return false

      if (statusFilter !== 'all') {
        const normalized = mapOrderStatus(order.status)
        if (normalized !== statusFilter) return false
      }

      const createdAt = parseDate(order.createdAt)
      if (!createdAt) return false

      if (timeFilter === '30d') {
        const from = new Date(now)
        from.setDate(now.getDate() - 30)
        if (createdAt < from) return false
      }
      if (timeFilter === '3m') {
        const from = new Date(now)
        from.setMonth(now.getMonth() - 3)
        if (createdAt < from) return false
      }
      if (timeFilter === '1y') {
        const from = new Date(now)
        from.setFullYear(now.getFullYear() - 1)
        if (createdAt < from) return false
      }
      if (timeFilter === 'custom') {
        if (customFrom) {
          const from = parseDate(customFrom)
          if (from && createdAt < from) return false
        }
        if (customTo) {
          const to = parseDate(customTo)
          if (to) {
            to.setHours(23, 59, 59, 999)
            if (createdAt > to) return false
          }
        }
      }

      return true
    })
  }, [orders, searchValue, statusFilter, timeFilter, customFrom, customTo])

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const pagedOrders = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredOrders.slice(start, start + PAGE_SIZE)
  }, [filteredOrders, safePage])

  const pageNumbers = useMemo(() => {
    const items: number[] = []
    const start = Math.max(1, safePage - 2)
    const end = Math.min(totalPages, safePage + 2)
    for (let i = start; i <= end; i += 1) items.push(i)
    return items
  }, [safePage, totalPages])

  const handleInvoicePdf = (order: OrderRow) => {
    const status = getStatusBadge(order.status).label
    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Hoa don ${order.orderCode}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; }
      h1 { margin: 0 0 16px; }
      .row { margin: 8px 0; }
      .label { display: inline-block; width: 160px; font-weight: 700; }
      .footer { margin-top: 24px; font-size: 12px; color: #444; }
    </style>
  </head>
  <body>
    <h1>Hóa đơn giao dịch</h1>
    <div class="row"><span class="label">Mã đơn:</span> ${order.orderCode}</div>
    <div class="row"><span class="label">Gói:</span> ${PLAN_LABEL[order.planId]}</div>
    <div class="row"><span class="label">Số tiền:</span> ${order.amount.toLocaleString('vi-VN')} VND</div>
    <div class="row"><span class="label">Trạng thái:</span> ${status}</div>
    <div class="row"><span class="label">Ngày thanh toán:</span> ${new Date(order.createdAt).toLocaleString('vi-VN')}</div>
    <div class="footer">LinguaClay - Dữ liệu hóa đơn tạo từ hệ thống lịch sử thanh toán.</div>
  </body>
</html>
`
    const popup = window.open('', '_blank', 'width=900,height=700')
    if (!popup) return
    popup.document.open()
    popup.document.write(html)
    popup.document.close()
    popup.focus()
    popup.print()
  }

  return (
    <div className="py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-newsprint-black">Lịch sử thanh toán</h1>
            <p className="text-sm text-newsprint-gray-dark mt-2">Tất cả giao dịch của bạn từ trước đến nay.</p>
          </div>
          <div className="px-4 py-3 border-[2px] border-newsprint-black bg-white/70">
            <p className="text-xs uppercase tracking-widest font-bold text-newsprint-gray-dark">Tổng đã chi</p>
            <p className="text-xl font-black text-newsprint-black">{totalSpent.toLocaleString('vi-VN')}đ</p>
          </div>
        </div>

        {/* Remove success notification as requested */}

        {error && (
          <div className="p-4 border-[3px] border-[#B42318] bg-[#FEF3F2] text-[#B42318] font-bold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-[3px] border-newsprint-black bg-[#F5F0E8] p-4">
            <p className="text-xs uppercase tracking-widest font-bold text-newsprint-gray-dark">Gói hiện tại</p>
            <p className="text-lg font-black text-newsprint-black mt-2">{currentPlanText}</p>
          </div>
          <div className="border-[3px] border-newsprint-black bg-[#F5F0E8] p-4">
            <p className="text-xs uppercase tracking-widest font-bold text-newsprint-gray-dark">Ngày hết hạn</p>
            <p className="text-lg font-black text-newsprint-black mt-2">{formatDateVN(me?.proEndDate || null)}</p>
          </div>
          <div className="border-[3px] border-newsprint-black bg-[#F5F0E8] p-4">
            <p className="text-xs uppercase tracking-widest font-bold text-newsprint-gray-dark">Tổng đã chi</p>
            <p className="text-lg font-black text-newsprint-black mt-2">{totalSpent.toLocaleString('vi-VN')}đ</p>
          </div>
        </div>

        <div className="border-[3px] border-newsprint-black bg-[#F5F0E8] p-4 flex flex-col lg:flex-row gap-3">
          <label className="flex items-center gap-2 border-[2px] border-newsprint-black bg-white px-3 py-2 flex-1 min-w-[220px]">
            <Search className="w-4 h-4" />
              <input
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value)
                  setPage(1)
                }}
                placeholder="Tìm theo mã đơn"
                className="w-full text-sm bg-transparent outline-none"
              />
          </label>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter)
              setPage(1)
            }}
            className="border-[2px] border-newsprint-black bg-white px-3 py-2 text-sm min-w-[200px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="success">Thành công</option>
            <option value="failed">Thất bại</option>
            <option value="pending">Đang chờ</option>
          </select>

          <select
            value={timeFilter}
            onChange={(e) => {
              setTimeFilter(e.target.value as TimeFilter)
              setPage(1)
            }}
            className="border-[2px] border-newsprint-black bg-white px-3 py-2 text-sm min-w-[200px]"
          >
            <option value="30d">30 ngày</option>
            <option value="3m">3 tháng</option>
            <option value="1y">1 năm</option>
            <option value="custom">Tùy chỉnh</option>
          </select>

          {timeFilter === 'custom' && (
            <div className="flex gap-2 flex-wrap">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => {
                  setCustomFrom(e.target.value)
                  setPage(1)
                }}
                className="border-[2px] border-newsprint-black bg-white px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={customTo}
                onChange={(e) => {
                  setCustomTo(e.target.value)
                  setPage(1)
                }}
                className="border-[2px] border-newsprint-black bg-white px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>

        <div className="border-[3px] border-newsprint-black bg-[#F5F0E8] overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b-[2px] border-newsprint-black">
                <th className="text-left p-4 text-xs uppercase tracking-widest">Mã đơn</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest">Gói mua</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest">Số tiền</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest">Ngày thanh toán</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest">Trạng thái</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="p-5 font-semibold" colSpan={6}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}

              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td className="p-10" colSpan={6}>
                    <div className="text-center space-y-3">
                      <WalletCards className="w-12 h-12 mx-auto text-newsprint-gray-dark" />
                      <p className="font-bold text-newsprint-black">Bạn chưa có giao dịch nào</p>
                      <p className="text-sm text-newsprint-gray-dark">Bắt đầu với gói học phù hợp để mở khóa tính năng nâng cao.</p>
                      <Link
                        href="/dashboard/plans"
                        className="inline-flex items-center gap-2 px-4 py-2 border-[2px] border-newsprint-black font-bold text-xs uppercase tracking-widest bg-white hover:bg-black hover:text-white transition-all"
                      >
                        <ReceiptText className="w-4 h-4" />
                        Xem bảng giá
                      </Link>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                pagedOrders.map((order) => {
                  const badge = getStatusBadge(order.status)
                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-newsprint-black/20 ${
                        highlightedOrderCode === order.orderCode ? 'bg-[#FFF7D6]' : 'bg-transparent'
                      }`}
                    >
                      <td className="p-4 font-black">{order.orderCode}</td>
                      <td className="p-4">{PLAN_LABEL[order.planId]}</td>
                      <td className="p-4 font-semibold">{order.amount.toLocaleString('vi-VN')}đ</td>
                      <td className="p-4 text-sm">{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 border rounded-sm font-bold text-xs ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/payments/checkout?orderCode=${order.orderCode}`}
                            className="px-3 py-1.5 border-[2px] border-newsprint-black text-xs font-bold uppercase tracking-wide bg-white hover:bg-black hover:text-white transition-all"
                          >
                            Xem chi tiết
                          </Link>
                          <button
                            onClick={() => handleInvoicePdf(order)}
                            className="px-3 py-1.5 border-[2px] border-newsprint-black text-xs font-bold uppercase tracking-wide bg-white hover:bg-black hover:text-white transition-all inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            Tải hóa đơn PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        {!loading && filteredOrders.length > 0 && (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-newsprint-gray-dark">
              Trang {safePage}/{totalPages} · {filteredOrders.length} giao dịch
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, Math.min(totalPages, p) - 1))}
                disabled={safePage <= 1}
                className="px-3 py-2 border-[2px] border-newsprint-black text-xs font-bold uppercase tracking-wide bg-white disabled:opacity-50"
              >
                Trước
              </button>

              {pageNumbers.map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`px-3 py-2 border-[2px] border-newsprint-black text-xs font-bold uppercase tracking-wide ${
                    n === safePage ? 'bg-black text-white' : 'bg-white'
                  }`}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, Math.min(totalPages, p) + 1))}
                disabled={safePage >= totalPages}
                className="px-3 py-2 border-[2px] border-newsprint-black text-xs font-bold uppercase tracking-wide bg-white disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}

        <div className="border-[2px] border-newsprint-black/40 bg-white/60 px-4 py-3 text-center">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-newsprint-black">
            Dữ liệu thanh toán được mã hóa và bảo mật · Không lưu thông tin thẻ
          </p>
        </div>
      </div>
    </div>
  )
}
