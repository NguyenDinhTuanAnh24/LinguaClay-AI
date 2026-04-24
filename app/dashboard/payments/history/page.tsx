'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ReceiptText } from 'lucide-react'

type OrderRow = {
  id: string
  orderCode: number
  planId: '3_MONTHS' | '6_MONTHS' | '1_YEAR'
  amount: number
  status: 'PENDING' | 'SUCCESS' | 'CANCELLED'
  createdAt: string
  paidAt: string | null
  updatedAt: string
}

const PAGE_SIZE = 10

const PLAN_LABEL: Record<'3_MONTHS' | '6_MONTHS' | '1_YEAR', string> = {
  '3_MONTHS': 'Bản tiêu chuẩn (3 tháng)',
  '6_MONTHS': 'Bản chuyên sâu (6 tháng)',
  '1_YEAR': 'Bản toàn diện (1 năm)',
}

function getStatusBadge(status: OrderRow['status']) {
  if (status === 'SUCCESS') {
    return { label: 'Đã thanh toán', className: 'bg-[#ECFDF3] text-[#027A48] border-[#027A48]' }
  }
  if (status === 'PENDING') {
    return { label: 'Đang chờ', className: 'bg-[#FFF6DB] text-[#B54708] border-[#B54708]' }
  }
  return { label: 'Đã hủy', className: 'bg-[#FEF3F2] text-[#B42318] border-[#B42318]' }
}

function formatDateTimeVN(value: string | null) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getPaidAtDisplay(order: OrderRow) {
  if (order.paidAt) return formatDateTimeVN(order.paidAt)
  if (order.status === 'SUCCESS') return formatDateTimeVN(order.updatedAt)
  return '--'
}

export default function PaymentHistoryPage() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const paidOrderCode = useMemo(() => {
    const raw = searchParams.get('orderCode')
    if (!raw) return null
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : null
  }, [searchParams])

  const fetchData = async (targetPage: number) => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/payment/history?page=${targetPage}&pageSize=${PAGE_SIZE}`, { cache: 'no-store' })
      const data = (await res.json()) as {
        ok?: boolean
        orders?: OrderRow[]
        page?: number
        totalPages?: number
        total?: number
        error?: string
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Không thể tải lịch sử thanh toán')
      }

      setOrders(data.orders || [])
      setPage(data.page || targetPage)
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể tải lịch sử thanh toán'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchData(1)
    }, 0)
    return () => clearTimeout(t)
  }, [])

  const pageNumbers = useMemo(() => {
    const result: number[] = []
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, page + 2)
    for (let i = start; i <= end; i += 1) result.push(i)
    return result
  }, [page, totalPages])

  return (
    <div className="py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-newsprint-black">Lịch sử thanh toán</h1>
            <p className="text-sm text-newsprint-gray-dark mt-2">
              Danh sách đơn hàng của bạn, bao gồm ngày tạo và ngày thanh toán.
            </p>
          </div>
        </div>

        {error ? (
          <div className="p-4 border-[3px] border-[#B42318] bg-[#FEF3F2] text-[#B42318] font-bold">{error}</div>
        ) : null}

        <div className="border-[3px] border-newsprint-black bg-[#F5F0E8] overflow-x-auto transition-all duration-300 hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-[#ECE6DB]">
              <tr className="border-b-[2px] border-newsprint-black">
                <th className="text-left p-4 text-xs uppercase tracking-widest">Mã đơn</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest">Gói học</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest">Số tiền</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest">Trạng thái</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest">Ngày tạo đơn</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest">Ngày thanh toán</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest">Cập nhật gần nhất</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-5 font-semibold text-[#4B4B4B]" colSpan={7}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : null}

              {!loading && orders.length === 0 ? (
                <tr>
                  <td className="p-10" colSpan={7}>
                    <div className="text-center space-y-3">
                      <ReceiptText className="w-12 h-12 mx-auto text-newsprint-gray-dark" />
                      <p className="font-bold text-newsprint-black">Bạn chưa có đơn hàng nào.</p>
                      <p className="text-sm text-newsprint-gray-dark">Hãy chọn một gói để bắt đầu học tập nâng cao.</p>
                      <Link
                        href="/dashboard/plans"
                        className="inline-flex items-center gap-2 px-4 py-2 border-[2px] border-newsprint-black font-bold text-xs uppercase tracking-widest bg-white hover:bg-black hover:text-white transition-all"
                      >
                        Xem bảng giá
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!loading
                ? orders.map((order) => {
                    const badge = getStatusBadge(order.status)
                    const highlighted = paidOrderCode !== null && paidOrderCode === order.orderCode
                    return (
                      <tr
                        key={order.id}
                        className={`border-b border-newsprint-black/20 transition-colors hover:bg-[#EFE8DC] ${
                          highlighted ? 'bg-[#FFF7D6]' : 'bg-transparent'
                        }`}
                      >
                        <td className="p-4 font-black">#{order.orderCode}</td>
                        <td className="p-4">{PLAN_LABEL[order.planId] || order.planId}</td>
                        <td className="p-4 font-semibold">{order.amount.toLocaleString('vi-VN')}đ</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 border rounded-sm font-bold text-xs ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">{formatDateTimeVN(order.createdAt)}</td>
                        <td className="p-4 whitespace-nowrap">{getPaidAtDisplay(order)}</td>
                        <td className="p-4 whitespace-nowrap">{formatDateTimeVN(order.updatedAt)}</td>
                      </tr>
                    )
                  })
                : null}
            </tbody>
          </table>
        </div>

        {!loading && total > 0 ? (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-newsprint-gray-dark">
              Trang {page}/{totalPages} • Tổng {total} đơn hàng
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void fetchData(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-2 border-[2px] border-newsprint-black text-xs font-bold uppercase tracking-wide bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>

              {pageNumbers.map((n) => (
                <button
                  key={n}
                  onClick={() => void fetchData(n)}
                  className={`px-3 py-2 border-[2px] border-newsprint-black text-xs font-bold uppercase tracking-wide ${
                    n === page ? 'bg-black text-white' : 'bg-white'
                  }`}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => void fetchData(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-2 border-[2px] border-newsprint-black text-xs font-bold uppercase tracking-wide bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
