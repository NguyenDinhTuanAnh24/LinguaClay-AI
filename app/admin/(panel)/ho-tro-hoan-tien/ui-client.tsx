'use client'

import { useMemo, useState } from 'react'
import { AdminToastStack, useAdminToast } from '../_components/admin-toast'

type AdminTab = 'support' | 'refund'
type RefundMode = 'FULL' | 'PARTIAL'

export type SupportTicketView = {
  id: string
  userId: string
  userName: string
  userEmail: string
  subject: string
  message: string
  attachmentUrl: string
  createdAt: string
  status: string
  autoTag: string
  packageStatus: string
  device: string
  lastActiveAt: string
  blockedLesson: string
  history: Array<{ id: string; createdAt: string; reason: string; status: string }>
  internalNote: string
  adminReply: string
}

export type RefundQueueItemView = {
  id: string
  userId: string
  userName: string
  userEmail: string
  reason: string
  bankName: string
  accountNumber: string
  accountName: string
  requestedAt: string
  planId: string
  amount: number
  eligibilityLabel: 'Hợp lệ' | 'Cảnh báo'
  eligibilityReason: string
  usageSignal: string
  suggestedPartialAmount: number
}

export type RefundHistoryItemView = {
  id: string
  userName: string
  userEmail: string
  planId: string
  reason: string
  requestedAmount: number
  refundedAmount: number | null
  requestedAt: string
  processedAt: string | null
  status: string
  processedBy: string | null
  note: string | null
}

export type ChurnPlanView = {
  planId: string
  count: number
}

export type ChurnReasonView = {
  reason: string
  count: number
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDateTimeLabel(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function mapRefundStatusLabel(status: string): string {
  const key = (status || '').trim().toUpperCase()
  if (key === 'APPROVED') return 'Da duyet'
  if (key === 'REJECTED') return 'Tu choi'
  if (key === 'CANCELED' || key === 'CANCELLED') return 'Da huy'
  return key || 'Khong ro'
}

function mapRefundStatusClass(status: string): string {
  const key = (status || '').trim().toUpperCase()
  if (key === 'APPROVED') return 'border-[#166534] text-[#166534]'
  if (key === 'REJECTED') return 'border-[#B91C1C] text-[#B91C1C]'
  if (key === 'CANCELED' || key === 'CANCELLED') return 'border-[#4B5563] text-[#4B5563]'
  return 'border-[#4B4B4B] text-[#4B4B4B]'
}

export function HoTroHoanTienClient({
  supportTickets,
  refundQueue,
  refundHistory,
  churnByPlan,
  churnByReason,
}: {
  supportTickets: SupportTicketView[]
  refundQueue: RefundQueueItemView[]
  refundHistory: RefundHistoryItemView[]
  churnByPlan: ChurnPlanView[]
  churnByReason: ChurnReasonView[]
}) {
  const [activeTab, setActiveTab] = useState<AdminTab>('support')
  const [ticketRows, setTicketRows] = useState<SupportTicketView[]>(supportTickets)
  const [queueRows, setQueueRows] = useState<RefundQueueItemView[]>(refundQueue)
  const [refundHistoryRows, setRefundHistoryRows] = useState<RefundHistoryItemView[]>(refundHistory)
  const [selectedTicketId, setSelectedTicketId] = useState<string>(supportTickets[0]?.id || '')
  const [internalNotes, setInternalNotes] = useState<Record<string, string>>(
    Object.fromEntries(supportTickets.map((ticket) => [ticket.id, ticket.internalNote]))
  )
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>(
    Object.fromEntries(supportTickets.map((ticket) => [ticket.id, ticket.adminReply || '']))
  )
  const [refundMode, setRefundMode] = useState<Record<string, RefundMode>>(
    Object.fromEntries(refundQueue.map((item) => [item.id, 'FULL']))
  )
  const [partialAmount, setPartialAmount] = useState<Record<string, number>>(
    Object.fromEntries(refundQueue.map((item) => [item.id, item.suggestedPartialAmount]))
  )
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const { toasts, showToast } = useAdminToast()

  const selectedTicket = useMemo(
    () => ticketRows.find((ticket) => ticket.id === selectedTicketId) || ticketRows[0] || null,
    [selectedTicketId, ticketRows]
  )

  const cannedResponses = [
    'Mình đã ghi nhận lỗi kỹ thuật. Team đang kiểm tra và sẽ cập nhật kết quả cho bạn sớm nhất.',
    'Cảm ơn bạn đã báo lỗi nội dung. Bên mình sẽ rà soát lại từ vựng/ngữ pháp và cập nhật trong bản phát hành gần nhất.',
    'Yêu cầu liên quan thanh toán của bạn đã được tiếp nhận. Admin sẽ phản hồi hướng xử lý cụ thể trong vòng 24 giờ.',
    'Cảm ơn góp ý của bạn. Mọi phản hồi đều được tổng hợp để cải thiện trải nghiệm học tập.',
  ]

  const saveInternalNote = async (ticketId: string) => {
    const note = (internalNotes[ticketId] || '').trim()
    try {
      const res = await fetch('/api/admin/support/internal-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supportTicketId: ticketId, note }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; note?: string }
      if (!res.ok || !data.ok) {
        showToast(data.error || 'Không thể lưu ghi chú nội bộ.', 'error')
        return
      }

      setTicketRows((prev) =>
        prev.map((ticket) => (ticket.id === ticketId ? { ...ticket, internalNote: data.note || '' } : ticket))
      )
      setInternalNotes((prev) => ({ ...prev, [ticketId]: data.note || '' }))
      showToast('Đã lưu ghi chú nội bộ (chỉ admin nhìn thấy).', 'success')
    } catch (error) {
      console.error(error)
      showToast('Không thể lưu ghi chú nội bộ.', 'error')
    }
  }

  const sendReply = async (ticketId: string, replyText: string) => {
    const reply = replyText.trim()
    if (!reply) {
      showToast('Nội dung phản hồi không được để trống.', 'error')
      return
    }
    if (replyingId) return
    setReplyingId(ticketId)
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply, status: 'IN_PROGRESS' }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; ticket?: { status: string; adminReply: string } }
      if (!res.ok || !data.ok || !data.ticket) {
        showToast(data.error || 'Không thể gửi phản hồi.', 'error')
        return
      }

      setTicketRows((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: data.ticket!.status, adminReply: data.ticket!.adminReply } : ticket
        )
      )
      setReplyDrafts((prev) => ({ ...prev, [ticketId]: data.ticket!.adminReply }))
      showToast('Đã gửi phản hồi cho người dùng.', 'success')
    } catch (error) {
      console.error(error)
      showToast('Không thể gửi phản hồi.', 'error')
    } finally {
      setReplyingId(null)
    }
  }

  const approveRefund = async (item: RefundQueueItemView) => {
    if (processingId) return

    const mode = refundMode[item.id] || 'FULL'
    const partial = partialAmount[item.id] || item.suggestedPartialAmount

    if (mode === 'PARTIAL' && (partial <= 0 || partial > item.amount)) {
      showToast('Số tiền hoàn một phần không hợp lệ.', 'error')
      return
    }

    setProcessingId(item.id)
    try {
      const res = await fetch('/api/admin/refunds/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refundRequestId: item.id,
          refundType: mode,
          partialAmount: mode === 'PARTIAL' ? partial : undefined,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; refundAmount?: number }
      if (!res.ok || !data.ok) {
        showToast(data.error || 'Duyệt hoàn tiền thất bại.', 'error')
        return
      }

      setQueueRows((prev) => prev.filter((row) => row.id !== item.id))
      const approvedAmount = data.refundAmount || item.amount
      const approvedAt = formatDateTimeLabel(new Date())
      setRefundHistoryRows((prev) => [
        {
          id: item.id,
          userName: item.userName,
          userEmail: item.userEmail,
          planId: item.planId,
          reason: item.reason,
          requestedAmount: item.amount,
          refundedAmount: approvedAmount,
          requestedAt: item.requestedAt,
          processedAt: approvedAt,
          status: 'APPROVED',
          processedBy: 'Admin',
          note: `\u0110\u00e3 ho\u00e0n + ${formatVND(approvedAmount)}`,
        },
        ...prev,
      ])
      showToast(`Đã duyệt hoàn tiền ${formatVND(data.refundAmount || item.amount)} và hạ cấp người dùng về gói Miễn phí.`, 'success')
    } catch (error) {
      console.error(error)
      showToast('Không thể xử lý yêu cầu hoàn tiền.', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <AdminToastStack toasts={toasts} />

      <section className="border border-[#141414] bg-[#F5F0E8] p-5 shadow-[6px_6px_0px_0px_rgba(20,20,20,0.9)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4B4B4B]">Mô-đun quản trị</p>
            <h1 className="mt-1 text-2xl font-serif font-black uppercase tracking-[0.02em]">Hỗ trợ / Hoàn tiền</h1>
            <p className="mt-1 text-sm text-[#3D3D3D]">Gom 2 nghiệp vụ trong một màn hình: Hỗ trợ khách hàng và Quản lý hoàn tiền.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('support')}
              className="border px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em]"
              style={{
                borderColor: '#141414',
                background: activeTab === 'support' ? '#141414' : '#F5F0E8',
                color: activeTab === 'support' ? '#F5F0E8' : '#141414',
              }}
            >
              Hỗ trợ khách hàng
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('refund')}
              className="border px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em]"
              style={{
                borderColor: '#141414',
                background: activeTab === 'refund' ? '#141414' : '#F5F0E8',
                color: activeTab === 'refund' ? '#F5F0E8' : '#141414',
              }}
            >
              Quản lý hoàn tiền
            </button>
          </div>
        </div>
      </section>

      {activeTab === 'support' ? (
        <section className="grid gap-4 xl:grid-cols-[1.1fr_1.3fr]">
          <article className="border border-[#141414] bg-[#F5F0E8] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-[0.14em]">Ticket tự động phân loại</h2>
              <span className="border border-[#141414] px-2 py-1 text-[10px] font-black uppercase">{ticketRows.length} phiếu</span>
            </div>
            <div className="space-y-2">
              {ticketRows.map((ticket) => {
                const isActive = selectedTicket?.id === ticket.id
                return (
                  <button
                    type="button"
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className="w-full border px-3 py-2 text-left transition-all hover:-translate-y-px"
                    style={{
                      borderColor: '#141414',
                      background: isActive ? '#141414' : '#F5F0E8',
                      color: isActive ? '#F5F0E8' : '#141414',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-black uppercase tracking-[0.1em]">{ticket.userName}</p>
                      <span className="border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em]">{ticket.autoTag}</span>
                    </div>
                    {ticket.subject ? <p className="mt-1 line-clamp-1 text-xs font-black uppercase">{ticket.subject}</p> : null}
                    <p className="mt-1 line-clamp-2 text-xs">{ticket.message}</p>
                    {ticket.attachmentUrl ? <p className="mt-1 text-[10px] font-bold uppercase opacity-80">Có ảnh đính kèm</p> : null}
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] opacity-70">{ticket.createdAt}</p>
                  </button>
                )
              })}
              {!ticketRows.length && <p className="text-sm text-[#4B4B4B]">Chưa có phiếu.</p>}
            </div>
          </article>

          <article className="border border-[#141414] bg-[#F5F0E8] p-4">
            {selectedTicket ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.14em]">Bảng ngữ cảnh</h2>
                  <p className="mt-1 text-xs text-[#4B4B4B]">{selectedTicket.userEmail}</p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="border border-[#141414] bg-white px-3 py-2 text-xs">
                    <p className="font-black uppercase tracking-[0.08em]">Trạng thái gói</p>
                    <p>{selectedTicket.packageStatus}</p>
                  </div>
                  <div className="border border-[#141414] bg-white px-3 py-2 text-xs">
                    <p className="font-black uppercase tracking-[0.08em]">Thiết bị</p>
                    <p>{selectedTicket.device}</p>
                  </div>
                  <div className="border border-[#141414] bg-white px-3 py-2 text-xs">
                    <p className="font-black uppercase tracking-[0.08em]">Hoạt động gần nhất</p>
                    <p>{selectedTicket.lastActiveAt}</p>
                  </div>
                  <div className="border border-[#141414] bg-white px-3 py-2 text-xs">
                    <p className="font-black uppercase tracking-[0.08em]">Bài học đang kẹt</p>
                    <p>{selectedTicket.blockedLesson}</p>
                  </div>
                </div>

                <div className="border border-[#141414] bg-white p-3">
                  <p className="text-xs font-black uppercase tracking-[0.1em]">Chủ đề</p>
                  <p className="mt-1 text-xs">{selectedTicket.subject || 'Không có chủ đề'}</p>
                </div>

                <div className="border border-[#141414] bg-white p-3">
                  <p className="text-xs font-black uppercase tracking-[0.1em]">Ảnh đính kèm</p>
                  {selectedTicket.attachmentUrl ? (
                    <a
                      href={selectedTicket.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block border border-[#141414] p-2 hover:bg-[#F5F0E8]"
                    >
                      <img src={selectedTicket.attachmentUrl} alt="Ảnh hỗ trợ" className="h-40 w-full object-cover" />
                    </a>
                  ) : (
                    <p className="mt-2 text-xs text-[#4B4B4B]">Không có ảnh đính kèm.</p>
                  )}
                </div>

                <div className="border border-[#141414] bg-white p-3">
                  <p className="text-xs font-black uppercase tracking-[0.1em]">Mẫu phản hồi nhanh (1 chạm)</p>
                  <div className="mt-2 grid gap-2">
                    {cannedResponses.map((message) => (
                      <button
                        type="button"
                        key={message}
                        onClick={() => sendReply(selectedTicket.id, message)}
                        className="border border-[#141414] px-3 py-2 text-left text-xs hover:bg-[#141414] hover:text-[#F5F0E8]"
                      >
                        {message}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border border-[#141414] bg-white p-3">
                  <p className="text-xs font-black uppercase tracking-[0.1em]">Phản hồi cho người dùng</p>
                  <textarea
                    value={replyDrafts[selectedTicket.id] || ''}
                    onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [selectedTicket.id]: event.target.value }))}
                    placeholder="Nhập phản hồi gửi cho người dùng"
                    rows={3}
                    className="mt-2 w-full border border-[#141414] bg-[#FDFBF7] px-2 py-2 text-xs outline-none"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={replyingId === selectedTicket.id}
                      onClick={() => sendReply(selectedTicket.id, replyDrafts[selectedTicket.id] || '')}
                      className="border border-[#141414] bg-[#141414] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-[#F5F0E8] disabled:opacity-60"
                    >
                      {replyingId === selectedTicket.id ? 'Đang gửi...' : 'Gửi phản hồi'}
                    </button>
                  </div>
                </div>

                <div className="border border-[#141414] bg-white p-3">
                  <p className="text-xs font-black uppercase tracking-[0.1em]">Ghi chú nội bộ</p>
                  <textarea
                    value={internalNotes[selectedTicket.id] || ''}
                    onChange={(event) => setInternalNotes((prev) => ({ ...prev, [selectedTicket.id]: event.target.value }))}
                    placeholder="Ghi chú cho admin khác (user không nhìn thấy)"
                    rows={3}
                    className="mt-2 w-full border border-[#141414] bg-[#FDFBF7] px-2 py-2 text-xs outline-none"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => saveInternalNote(selectedTicket.id)}
                      className="border border-[#141414] bg-[#141414] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-[#F5F0E8]"
                    >
                      Lưu ghi chú
                    </button>
                  </div>
                </div>

                <div className="border border-[#141414] bg-white p-3">
                  <p className="text-xs font-black uppercase tracking-[0.1em]">Lịch sử khiếu nại của người dùng</p>
                  <div className="mt-2 space-y-2">
                    {selectedTicket.history.length ? (
                      selectedTicket.history.map((row) => (
                        <div key={row.id} className="border border-[#141414] px-2 py-1.5 text-xs">
                          <p className="font-semibold">{row.reason}</p>
                          <p className="text-[11px] text-[#4B4B4B]">
                            {row.createdAt} • {row.status}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#4B4B4B]">Không có phiếu trước đó.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#4B4B4B]">Chưa có phiếu để hiển thị.</p>
            )}
          </article>
        </section>
      ) : (
        <section className="space-y-4">
          <article className="border border-[#141414] bg-[#F5F0E8] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-[0.14em]">Hàng đợi hoàn tiền</h2>
              <span className="border border-[#141414] px-2 py-1 text-[10px] font-black uppercase">{queueRows.length} yêu cầu</span>
            </div>

            <div className="overflow-x-auto border border-[#141414]">
              <table className="min-w-[980px] w-full bg-white text-xs">
                <thead className="bg-[#EFE8DC]">
                  <tr className="border-b border-[#141414] text-left font-black uppercase tracking-[0.08em]">
                    <th className="px-2 py-2">Người dùng</th>
                    <th className="px-2 py-2">Lý do</th>
                    <th className="px-2 py-2">Thông tin nhận tiền</th>
                    <th className="px-2 py-2">Gói</th>
                    <th className="px-2 py-2">Số tiền</th>
                    <th className="px-2 py-2">Điều kiện</th>
                    <th className="px-2 py-2">Hoàn tiền</th>
                    <th className="px-2 py-2">Xử lý 1 chạm</th>
                  </tr>
                </thead>
                <tbody>
                  {queueRows.map((item) => (
                    <tr key={item.id} className="border-b border-[#141414] align-top">
                      <td className="px-2 py-2">
                        <p className="font-semibold">{item.userName}</p>
                        <p className="text-[11px] text-[#4B4B4B]">{item.userEmail}</p>
                        <p className="text-[11px] text-[#4B4B4B]">{item.requestedAt}</p>
                      </td>
                      <td className="px-2 py-2">
                        <p>{item.reason}</p>
                      </td>
                      <td className="px-2 py-2">
                        <p className="font-semibold">{item.bankName || 'Chưa cung cấp tên ngân hàng'}</p>
                        <p className="text-[11px] text-[#4B4B4B]">STK: {item.accountNumber || '---'}</p>
                        <p className="text-[11px] text-[#4B4B4B]">Chủ TK: {item.accountName || '---'}</p>
                      </td>
                      <td className="px-2 py-2">
                        <p className="font-semibold">{item.planId}</p>
                      </td>
                      <td className="px-2 py-2">
                        <p className="font-semibold">{formatVND(item.amount)}</p>
                      </td>
                      <td className="px-2 py-2">
                        <span
                          className={`inline-flex border px-2 py-0.5 text-[10px] font-black uppercase ${
                            item.eligibilityLabel === 'Hợp lệ'
                              ? 'border-[#166534] text-[#166534]'
                              : 'border-[#B45309] text-[#B45309]'
                          }`}
                        >
                          {item.eligibilityLabel}
                        </span>
                        <p className="mt-1 text-[11px] text-[#4B4B4B]">{item.eligibilityReason}</p>
                        <p className="text-[11px] text-[#4B4B4B]">{item.usageSignal}</p>
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={refundMode[item.id] || 'FULL'}
                          onChange={(event) => setRefundMode((prev) => ({ ...prev, [item.id]: event.target.value as RefundMode }))}
                          className="w-full border border-[#141414] bg-[#FDFBF7] px-2 py-1 text-[11px] font-semibold outline-none"
                        >
                          <option value="FULL">Hoàn toàn phần (100%)</option>
                          <option value="PARTIAL">Hoàn một phần</option>
                        </select>
                        {(refundMode[item.id] || 'FULL') === 'PARTIAL' && (
                          <input
                            type="number"
                            min={1000}
                            max={item.amount}
                            value={partialAmount[item.id] ?? item.suggestedPartialAmount}
                            onChange={(event) => setPartialAmount((prev) => ({ ...prev, [item.id]: Number(event.target.value) || 0 }))}
                            className="mt-1 w-full border border-[#141414] bg-[#FDFBF7] px-2 py-1 text-[11px] font-semibold outline-none"
                          />
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          disabled={processingId === item.id}
                          onClick={() => approveRefund(item)}
                          className="w-full border border-[#141414] bg-[#141414] px-2 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#F5F0E8] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {processingId === item.id ? 'Đang xử lý...' : 'Duyệt'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!queueRows.length && (
                    <tr>
                      <td colSpan={8} className="px-3 py-6 text-center text-sm text-[#4B4B4B]">
                        Không còn yêu cầu chờ xử lý.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className="border border-[#141414] bg-[#F5F0E8] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-[0.14em]">Lich su hoan tien</h2>
              <span className="border border-[#141414] px-2 py-1 text-[10px] font-black uppercase">{refundHistoryRows.length} muc</span>
            </div>

            <div className="overflow-x-auto border border-[#141414]">
              <table className="min-w-[980px] w-full bg-white text-xs">
                <thead className="bg-[#EFE8DC]">
                  <tr className="border-b border-[#141414] text-left font-black uppercase tracking-[0.08em]">
                    <th className="px-2 py-2">Nguoi dung</th>
                    <th className="px-2 py-2">Goi</th>
                    <th className="px-2 py-2">Ly do</th>
                    <th className="px-2 py-2">So tien</th>
                    <th className="px-2 py-2">Trang thai</th>
                    <th className="px-2 py-2">Xu ly boi</th>
                    <th className="px-2 py-2">Thoi gian</th>
                    <th className="px-2 py-2">Ghi chu</th>
                  </tr>
                </thead>
                <tbody>
                  {refundHistoryRows.map((row) => (
                    <tr key={row.id} className="border-b border-[#141414] align-top">
                      <td className="px-2 py-2">
                        <p className="font-semibold">{row.userName}</p>
                        <p className="text-[11px] text-[#4B4B4B]">{row.userEmail}</p>
                      </td>
                      <td className="px-2 py-2 font-semibold">{row.planId}</td>
                      <td className="px-2 py-2">{row.reason}</td>
                      <td className="px-2 py-2">
                        <p className="font-semibold">Yeu cau: {formatVND(row.requestedAmount)}</p>
                        <p className="text-[11px] text-[#4B4B4B]">
                          Da hoan: {row.refundedAmount ? formatVND(row.refundedAmount) : '---'}
                        </p>
                      </td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex border px-2 py-0.5 text-[10px] font-black uppercase ${mapRefundStatusClass(row.status)}`}>
                          {mapRefundStatusLabel(row.status)}
                        </span>
                      </td>
                      <td className="px-2 py-2">{row.processedBy || '---'}</td>
                      <td className="px-2 py-2">
                        <p className="text-[11px] text-[#4B4B4B]">YC: {row.requestedAt}</p>
                        <p className="text-[11px] text-[#4B4B4B]">XL: {row.processedAt || '---'}</p>
                      </td>
                      <td className="px-2 py-2">{row.note || '---'}</td>
                    </tr>
                  ))}
                  {!refundHistoryRows.length && (
                    <tr>
                      <td colSpan={8} className="px-3 py-6 text-center text-sm text-[#4B4B4B]">
                        Chua co lich su hoan tien.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className="grid gap-4 lg:grid-cols-2">
            <div className="border border-[#141414] bg-[#F5F0E8] p-4">
              <h3 className="text-sm font-black uppercase tracking-[0.14em]">Tỷ lệ rời bỏ theo gói</h3>
              <div className="mt-3 space-y-2">
                {churnByPlan.map((row) => (
                  <div key={row.planId} className="flex items-center justify-between border border-[#141414] bg-white px-3 py-2 text-xs">
                    <span className="font-semibold">{row.planId}</span>
                    <span className="font-black">{row.count} yêu cầu</span>
                  </div>
                ))}
                {!churnByPlan.length && <p className="text-sm text-[#4B4B4B]">Chưa có dữ liệu.</p>}
              </div>
            </div>

            <div className="border border-[#141414] bg-[#F5F0E8] p-4">
              <h3 className="text-sm font-black uppercase tracking-[0.14em]">Lý do phổ biến</h3>
              <div className="mt-3 space-y-2">
                {churnByReason.map((row) => (
                  <div key={row.reason} className="flex items-center justify-between border border-[#141414] bg-white px-3 py-2 text-xs">
                    <span className="font-semibold">{row.reason}</span>
                    <span className="font-black">{row.count}</span>
                  </div>
                ))}
                {!churnByReason.length && <p className="text-sm text-[#4B4B4B]">Chưa có dữ liệu.</p>}
              </div>
            </div>
          </article>
        </section>
      )}
    </div>
  )
}
