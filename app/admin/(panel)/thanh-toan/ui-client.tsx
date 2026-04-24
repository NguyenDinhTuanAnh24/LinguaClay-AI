'use client'

import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { AdminToastStack, useAdminToast } from '../_components/admin-toast'

type PaymentTab = 'transactions' | 'coupons'

export type TransactionView = {
  id: string
  code: string
  userId: string
  userEmail: string
  user: string
  plan: string
  amount: number
  createdAt: string
  status: string
}

export type CouponView = {
  id: string
  code: string
  discount: number
  expiresAt: string
  expiresAtDate: string
  used: number
  limit: number
}

type UserPaymentHistoryView = {
  user: {
    id: string
    name: string
    email: string
  }
  summary: {
    totalOrders: number
    successOrders: number
    pendingOrders: number
    cancelledOrders: number
    totalPaid: number
  }
  orders: Array<{
    id: string
    orderCode: string
    planId: string
    amount: number
    status: string
    createdAt: string
    paidAt: string | null
    cancelledAt: string | null
  }>
}

function formatCurrencyVND(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex border px-2 py-0.5 text-[10px] font-black uppercase ${
        status === 'SUCCESS'
          ? 'border-[#166534] text-[#166534]'
          : status === 'PENDING'
            ? 'border-[#B45309] text-[#B45309]'
            : 'border-[#B91C1C] text-[#B91C1C]'
      }`}
    >
      {status}
    </span>
  )
}

export function ThanhToanClient({
  summary,
  couponSummary,
  transactions,
  coupons,
}: {
  summary: { today: number; success: number; pending: number }
  couponSummary: { totalCoupons: number; totalUsed: number; totalRemaining: number }
  transactions: TransactionView[]
  coupons: CouponView[]
}) {
  const [activeTab, setActiveTab] = useState<PaymentTab>('transactions')
  const [showCouponForm, setShowCouponForm] = useState(false)
  const [couponRows, setCouponRows] = useState<CouponView[]>(coupons)
  const [creatingCoupon, setCreatingCoupon] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState<UserPaymentHistoryView | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const { toasts, showToast } = useAdminToast()
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount: '',
    usageLimit: '',
    expiresAt: '',
  })

  const openHistory = async (tx: TransactionView) => {
    try {
      setLoadingHistory(true)
      setHistoryError(null)
      const res = await fetch(`/api/admin/payments/user-history?userId=${encodeURIComponent(tx.userId)}`, {
        method: 'GET',
      })
      const data = (await res.json()) as { ok?: boolean; error?: string } & UserPaymentHistoryView
      if (!res.ok || !data.ok) {
        const message = data.error || 'Không thể tải lịch sử thanh toán'
        setHistoryError(message)
        showToast(message, 'error')
        return
      }
      setSelectedHistory({
        user: data.user,
        summary: data.summary,
        orders: data.orders,
      })
    } catch (error) {
      console.error(error)
      const message = 'Không thể tải lịch sử thanh toán'
      setHistoryError(message)
      showToast(message, 'error')
    } finally {
      setLoadingHistory(false)
    }
  }

  const createCoupon = async (event: FormEvent) => {
    event.preventDefault()
    if (creatingCoupon) return

    setCreatingCoupon(true)
    try {
      const payload = {
        code: couponForm.code.trim(),
        discountPercent: Number(couponForm.discount),
        usageLimit: Number(couponForm.usageLimit),
        expiresAt: couponForm.expiresAt,
      }

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        coupon?: {
          id: string
          code: string
          discountPercent: number
          usageLimit: number
          usedCount: number
          expiresAt: string
        }
      }

      if (!res.ok || !data.ok || !data.coupon) {
        showToast(data.error || 'Tạo mã khuyến mãi thất bại', 'error')
        return
      }

      const expiresAt = new Date(data.coupon.expiresAt)
      const formatted = new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(expiresAt)

      const inputDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(expiresAt)

      setCouponRows((prev) => [
        {
          id: data.coupon.id,
          code: data.coupon.code,
          discount: data.coupon.discountPercent,
          expiresAt: formatted,
          expiresAtDate: inputDate,
          used: data.coupon.usedCount,
          limit: data.coupon.usageLimit,
        },
        ...prev,
      ])
      setCouponForm({
        code: '',
        discount: '',
        usageLimit: '',
        expiresAt: '',
      })
      setShowCouponForm(false)
      showToast('Đã tạo mã khuyến mãi thành công.', 'success')
    } catch (error) {
      console.error(error)
      showToast('Không thể tạo mã khuyến mãi', 'error')
    } finally {
      setCreatingCoupon(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminToastStack toasts={toasts} />

      <section
        className="border border-[#141414] bg-[#F5F0E8] p-6 transition-all hover:-translate-y-px hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,0.95)]"
        style={{ boxShadow: '8px 8px 0 0 rgba(20,20,20,0.92)' }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4B4B4B]">Admin Module</p>
        <h1 className="mt-2 text-4xl font-serif font-black text-[#141414]">Thanh toán</h1>
        <p className="mt-2 text-sm font-semibold text-[#4B4B4B]">Theo dõi giao dịch, trạng thái đơn và quản lý mã khuyến mãi.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(activeTab === 'transactions'
          ? [
              { label: 'Tổng đơn hôm nay', value: summary.today },
              { label: 'Tổng thành công', value: summary.success },
              { label: 'Tổng đang chờ', value: summary.pending },
            ]
          : [
              { label: 'Tổng mã khuyến mãi', value: couponSummary.totalCoupons },
              { label: 'Tổng đã dùng', value: couponSummary.totalUsed },
              { label: 'Tồn dư', value: couponSummary.totalRemaining },
            ]
        ).map((item) => (
          <article key={item.label} className="border border-[#141414] bg-[#F5F0E8] p-4" style={{ boxShadow: '4px 4px 0 0 rgba(20,20,20,0.85)' }}>
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#4B4B4B]">{item.label}</p>
            <p className="mt-2 text-3xl font-serif font-black tabular-nums">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="border border-[#141414] bg-[#F5F0E8] p-5" style={{ boxShadow: '6px 6px 0 0 rgba(20,20,20,0.9)' }}>
        <div className="mb-4 flex gap-2">
          {[
            { key: 'transactions', label: 'Giao dịch' },
            { key: 'coupons', label: 'Mã khuyến mãi' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as PaymentTab)}
              className="border px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition-all hover:-translate-y-px"
              style={{
                borderColor: '#141414',
                background: activeTab === tab.key ? '#141414' : '#F5F0E8',
                color: activeTab === tab.key ? '#F5F0E8' : '#141414',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'transactions' ? (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-[#141414]">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-[#ECE6DB]">
                  <tr>
                    <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Mã đơn</th>
                    <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Tên user</th>
                    <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Gói mua</th>
                    <th className="border border-[#141414] px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">Số tiền</th>
                    <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Ngày tạo</th>
                    <th className="border border-[#141414] px-3 py-2 text-center text-[10px] font-black uppercase tracking-[0.08em]">Trạng thái</th>
                    <th className="border border-[#141414] px-3 py-2 text-center text-[10px] font-black uppercase tracking-[0.08em]">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="odd:bg-[#F5F0E8] even:bg-[#EFEAE0]">
                      <td className="border border-[#141414] px-3 py-2 font-semibold">{tx.code}</td>
                      <td className="border border-[#141414] px-3 py-2">
                        <p className="font-semibold">{tx.user}</p>
                        <p className="text-[11px] text-[#4B4B4B]">{tx.userEmail}</p>
                      </td>
                      <td className="border border-[#141414] px-3 py-2">{tx.plan}</td>
                      <td className="border border-[#141414] px-3 py-2 text-right font-bold tabular-nums">{formatCurrencyVND(tx.amount)}</td>
                      <td className="border border-[#141414] px-3 py-2 tabular-nums">{tx.createdAt}</td>
                      <td className="border border-[#141414] px-3 py-2 text-center">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="border border-[#141414] px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => openHistory(tx)}
                          className="border border-[#141414] px-2 py-1 text-[10px] font-bold uppercase"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loadingHistory ? <div className="text-sm font-semibold text-[#4B4B4B]">Đang tải lịch sử thanh toán...</div> : null}
            {historyError ? <div className="text-sm font-semibold text-[#B91C1C]">{historyError}</div> : null}

            {selectedHistory ? (
              <div className="border border-[#141414] bg-[#EFEAE0] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#141414] pb-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#4B4B4B]">Lịch sử thanh toán user</p>
                    <h3 className="text-lg font-serif font-black">{selectedHistory.user.name}</h3>
                    <p className="text-sm text-[#4B4B4B]">{selectedHistory.user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedHistory(null)}
                    className="border border-[#141414] px-3 py-1 text-[10px] font-black uppercase"
                  >
                    Đóng
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
                  <div className="border border-[#141414] bg-[#F5F0E8] px-3 py-2">
                    <p className="text-[10px] uppercase text-[#4B4B4B]">Tổng đơn</p>
                    <p className="font-black tabular-nums">{selectedHistory.summary.totalOrders}</p>
                  </div>
                  <div className="border border-[#141414] bg-[#F5F0E8] px-3 py-2">
                    <p className="text-[10px] uppercase text-[#4B4B4B]">Thành công</p>
                    <p className="font-black tabular-nums">{selectedHistory.summary.successOrders}</p>
                  </div>
                  <div className="border border-[#141414] bg-[#F5F0E8] px-3 py-2">
                    <p className="text-[10px] uppercase text-[#4B4B4B]">Đang chờ</p>
                    <p className="font-black tabular-nums">{selectedHistory.summary.pendingOrders}</p>
                  </div>
                  <div className="border border-[#141414] bg-[#F5F0E8] px-3 py-2">
                    <p className="text-[10px] uppercase text-[#4B4B4B]">Đã hủy</p>
                    <p className="font-black tabular-nums">{selectedHistory.summary.cancelledOrders}</p>
                  </div>
                  <div className="border border-[#141414] bg-[#F5F0E8] px-3 py-2">
                    <p className="text-[10px] uppercase text-[#4B4B4B]">Đã thanh toán</p>
                    <p className="font-black tabular-nums">{formatCurrencyVND(selectedHistory.summary.totalPaid)}</p>
                  </div>
                </div>

                <div className="mt-3 overflow-x-auto border border-[#141414] bg-[#F5F0E8]">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-[#ECE6DB]">
                      <tr>
                        <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Mã đơn</th>
                        <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Gói</th>
                        <th className="border border-[#141414] px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">Số tiền</th>
                        <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Ngày tạo</th>
                        <th className="border border-[#141414] px-3 py-2 text-center text-[10px] font-black uppercase tracking-[0.08em]">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedHistory.orders.map((order) => (
                        <tr key={order.id} className="odd:bg-[#F5F0E8] even:bg-[#EFEAE0]">
                          <td className="border border-[#141414] px-3 py-2 font-semibold">{order.orderCode}</td>
                          <td className="border border-[#141414] px-3 py-2">{order.planId}</td>
                          <td className="border border-[#141414] px-3 py-2 text-right font-bold tabular-nums">{formatCurrencyVND(order.amount)}</td>
                          <td className="border border-[#141414] px-3 py-2 tabular-nums">{order.createdAt}</td>
                          <td className="border border-[#141414] px-3 py-2 text-center">
                            <StatusBadge status={order.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {activeTab === 'coupons' ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowCouponForm((v) => !v)}
              className="inline-flex items-center gap-2 border border-[#141414] bg-[#141414] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#F5F0E8]"
            >
              <Plus size={13} />
              Tạo mã mới
            </button>

            {showCouponForm ? (
              <form onSubmit={createCoupon} className="grid grid-cols-1 gap-2 border border-[#141414] bg-[#EFEAE0] p-3 md:grid-cols-5">
                <input
                  placeholder="Tên mã"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm"
                  required
                />
                <input
                  placeholder="% giảm"
                  type="number"
                  min={1}
                  max={100}
                  value={couponForm.discount}
                  onChange={(e) => setCouponForm((prev) => ({ ...prev, discount: e.target.value }))}
                  className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm"
                  required
                />
                <input
                  placeholder="Giới hạn"
                  type="number"
                  min={1}
                  value={couponForm.usageLimit}
                  onChange={(e) => setCouponForm((prev) => ({ ...prev, usageLimit: e.target.value }))}
                  className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm"
                  required
                />
                <input
                  type="date"
                  value={couponForm.expiresAt}
                  onChange={(e) => setCouponForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                  className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={creatingCoupon}
                  className="h-9 border border-[#141414] bg-[#141414] px-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#F5F0E8] disabled:opacity-60"
                >
                  {creatingCoupon ? 'Đang lưu...' : 'Lưu mã'}
                </button>
              </form>
            ) : null}

            <div className="overflow-x-auto border border-[#141414]">
              {couponRows.length === 0 ? (
                <div className="p-4 text-sm font-semibold text-[#4B4B4B]">Chưa có dữ liệu mã khuyến mãi trong cơ sở dữ liệu.</div>
              ) : (
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#ECE6DB]">
                    <tr>
                      <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Tên mã</th>
                      <th className="border border-[#141414] px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">% giảm</th>
                      <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Ngày hết hạn</th>
                      <th className="border border-[#141414] px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">Đã dùng / Giới hạn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {couponRows.map((coupon) => (
                      <tr key={coupon.id} className="odd:bg-[#F5F0E8] even:bg-[#EFEAE0]">
                        <td className="border border-[#141414] px-3 py-2 font-semibold">{coupon.code}</td>
                        <td className="border border-[#141414] px-3 py-2 text-right font-bold tabular-nums">{coupon.discount}%</td>
                        <td className="border border-[#141414] px-3 py-2 tabular-nums">{coupon.expiresAt}</td>
                        <td className="border border-[#141414] px-3 py-2 text-right font-bold tabular-nums">
                          {coupon.used} / {coupon.limit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
