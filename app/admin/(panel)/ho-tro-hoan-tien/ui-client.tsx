'use client'

import { useMemo, useState } from 'react'
import { Mail, X } from 'lucide-react'
import { AdminToastStack, useAdminToast, useAdminConfirm, AdminConfirmToast } from '../_components/admin-toast'

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
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
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
  const [refundingItem, setRefundingItem] = useState<RefundQueueItemView | null>(null)
  const [refundEmailNote, setRefundEmailNote] = useState<string>('')
  const { toasts, showToast } = useAdminToast()
  const { confirm, requestConfirm, confirmYes, confirmNo } = useAdminConfirm()

  const [ticketPage, setTicketPage] = useState(1)
  const ticketsPerPage = 5
  const totalTicketPages = Math.ceil(ticketRows.length / ticketsPerPage)
  const currentTickets = ticketRows.slice((ticketPage - 1) * ticketsPerPage, ticketPage * ticketsPerPage)

  const selectedTicket = useMemo(
    () => ticketRows.find((ticket) => ticket.id === selectedTicketId) || null,
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
          note: refundEmailNote,
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
      <AdminConfirmToast confirm={confirm} onConfirm={confirmYes} onCancel={confirmNo} />
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
        <section className="space-y-6">
          <article className="border border-[#141414] bg-[#F5F0E8] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-[0.14em]">Ticket tự động phân loại</h2>
              <span className="border border-[#141414] px-2 py-1 text-[10px] font-black uppercase">{ticketRows.length} phiếu</span>
            </div>
            
            <div className="overflow-x-auto border border-[#141414] bg-white">
              <table className="w-full text-xs">
                <thead className="bg-[#EFE8DC]">
                  <tr className="border-b border-[#141414] text-left font-black uppercase tracking-[0.08em]">
                    <th className="px-3 py-2">Khách hàng</th>
                    <th className="px-3 py-2">Chủ đề</th>
                    <th className="px-3 py-2 w-[40%]">Trích đoạn</th>
                    <th className="px-3 py-2 text-center">Phân loại</th>
                    <th className="px-3 py-2 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTickets.map((ticket) => {
                    const isActive = selectedTicket?.id === ticket.id
                    return (
                      <tr 
                        key={ticket.id} 
                        className={`border-b border-[#141414] align-top transition-colors hover:bg-[#F5F0E8] ${isActive ? 'bg-[#EFE8DC]' : ''}`}
                      >
                        <td className="px-3 py-2">
                          <p className="font-semibold">{ticket.userName}</p>
                          <p className="mt-0.5 text-[10px] text-[#4B4B4B]">{ticket.createdAt}</p>
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-semibold line-clamp-2">{ticket.subject || 'Không có'}</p>
                          {ticket.attachmentUrl ? <p className="mt-0.5 text-[10px] font-bold text-[#B91C1C] uppercase">Có đính kèm</p> : null}
                        </td>
                        <td className="px-3 py-2">
                          <p className="line-clamp-2">{ticket.message}</p>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="border border-[#141414] bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]">
                            {ticket.autoTag}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedTicketId(isActive ? null : ticket.id)}
                            className="border border-[#141414] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] transition-all hover:bg-[#141414] hover:text-[#F5F0E8]"
                            style={{
                              background: isActive ? '#141414' : 'transparent',
                              color: isActive ? '#F5F0E8' : '#141414',
                            }}
                          >
                            {isActive ? 'THU GỌN' : 'Phản hồi'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {!currentTickets.length && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-sm text-[#4B4B4B]">
                        Chưa có phiếu nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalTicketPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#4B4B4B]">Trang {ticketPage} / {totalTicketPages}</span>
                <div className="flex gap-2">
                  <button 
                    disabled={ticketPage === 1}
                    onClick={() => setTicketPage(p => p - 1)}
                    className="border border-[#141414] px-3 py-1.5 text-[10px] font-black uppercase disabled:opacity-50 hover:bg-[#141414] hover:text-white"
                  >
                    Trước
                  </button>
                  <button 
                    disabled={ticketPage === totalTicketPages}
                    onClick={() => setTicketPage(p => p + 1)}
                    className="border border-[#141414] px-3 py-1.5 text-[10px] font-black uppercase disabled:opacity-50 hover:bg-[#141414] hover:text-white"
                  >
                    Tiếp
                  </button>
                </div>
              </div>
            )}
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
                        onClick={() => setReplyDrafts((prev) => ({ ...prev, [selectedTicket.id]: message }))}
                        className="border border-[#141414] px-3 py-2 text-left text-xs hover:bg-[#141414] hover:text-[#F5F0E8]"
                      >
                        {message}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border border-[#141414] bg-white p-3">
                  <div className="flex items-center gap-2 border-b border-dashed border-[#141414]/30 pb-2 mb-2">
                    <Mail size={16} />
                    <p className="text-xs font-black uppercase tracking-[0.1em]">Gửi Email Phản Hồi</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex bg-[#F5F0E8] border border-[#141414]/20 px-2 py-1 text-xs">
                      <span className="w-16 font-bold text-[#4B4B4B] uppercase text-[10px] mt-0.5">Tới:</span>
                      <span className="flex-1 font-semibold">{selectedTicket.userEmail}</span>
                    </div>
                    <div>
                      <textarea
                        value={replyDrafts[selectedTicket.id] || ''}
                        onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [selectedTicket.id]: event.target.value }))}
                        placeholder="Soạn nội dung phản hồi. Hệ thống sẽ tự động gửi vào email của người dùng."
                        rows={4}
                        className="w-full border border-[#141414] bg-[#FDFBF7] p-2 text-xs outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      disabled={replyingId === selectedTicket.id}
                      onClick={async () => {
                        const ok = await requestConfirm(
                          `Gửi email phản hồi đến "${selectedTicket.userEmail}"?`,
                          { confirmText: 'Gửi Email', cancelText: 'Huỷ' }
                        )
                        if (ok) sendReply(selectedTicket.id, replyDrafts[selectedTicket.id] || '')
                      }}
                      className="border border-[#141414] bg-[#141414] px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-[#F5F0E8] disabled:opacity-60 hover:bg-transparent hover:text-[#141414] transition-colors"
                    >
                      {replyingId === selectedTicket.id ? 'Đang gửi...' : 'Gửi Email Thông Báo'}
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
                      onClick={async () => {
                        const ok = await requestConfirm(
                          'Lưu ghi chú nội bộ? (Chỉ admin nhìn thấy)',
                          { confirmText: 'Lưu', cancelText: 'Huỷ' }
                        )
                        if (ok) saveInternalNote(selectedTicket.id)
                      }}
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
              <div className="flex items-center justify-center h-48 border-2 border-dashed border-[#141414]/30 bg-white/60">
                <p className="text-sm font-black uppercase tracking-widest text-[#4B4B4B]">Vui lòng chọn 1 ticket để xem chi tiết.</p>
              </div>
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
                          onClick={() => {
                            setRefundingItem(item)
                            const mode = refundMode[item.id] || 'FULL'
                            const partial = partialAmount[item.id] || item.suggestedPartialAmount
                            const rfAmount = mode === 'PARTIAL' ? partial : item.amount
                            setRefundEmailNote(`Admin đã phê duyệt yêu cầu hoàn tiền của bạn.\nSố tiền hoàn lại: ${formatVND(rfAmount)}.\n\nTiền sẽ về tài khoản ngân hàng của bạn trong vài ngày làm việc tới. Gói học của bạn đã được hủy theo chính sách. Cảm ơn bạn.`)
                          }}
                          className="w-full border border-[#141414] bg-[#141414] px-2 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#F5F0E8] disabled:cursor-not-allowed disabled:opacity-60 hover:bg-transparent hover:text-[#141414] transition-colors"
                        >
                          Duyệt
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

      {/* REFUND EMAIL CONFIRMATION MODAL */}
      {refundingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#141414]/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl border-2 border-[#141414] bg-[#F5F0E8] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
            <div className="flex items-center justify-between border-b-2 border-[#141414] bg-[#ECE6DB] px-5 py-4">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-[#141414]" />
                <h3 className="text-sm font-black uppercase tracking-widest text-[#141414]">Xác nhận & Gửi Email Hoàn Tiền</h3>
              </div>
              <button
                onClick={() => setRefundingItem(null)}
                className="w-8 h-8 border border-[#141414] bg-white flex items-center justify-center hover:bg-black hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex border border-[#141414] bg-white px-3 py-2 text-sm">
                <span className="w-20 font-bold uppercase tracking-widest text-[10px] text-[#4B4B4B] mt-0.5">Người nhận:</span>
                <span className="font-semibold">{refundingItem.userEmail} ({refundingItem.userName})</span>
              </div>
              
              <div className="flex border border-[#141414] bg-white px-3 py-2 text-sm">
                <span className="w-20 font-bold uppercase tracking-widest text-[10px] text-[#4B4B4B] mt-0.5">Tiêu đề:</span>
                <span className="font-semibold">Thông báo phê duyệt hoàn tiền</span>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#4B4B4B] mb-2">Nội dung Email đính kèm lý do hoàn tiền (Tùy chỉnh):</p>
                <textarea
                  value={refundEmailNote}
                  onChange={(e) => setRefundEmailNote(e.target.value)}
                  rows={6}
                  className="w-full border border-[#141414] bg-white p-3 text-sm outline-none focus:ring-1 focus:ring-[#141414]"
                />
              </div>

              <div className="bg-[#EFE8DC] border border-[#141414] p-3 flex justify-between items-center text-xs font-semibold">
                <span>Số tiền duyệt: <span className="font-black text-red-600">{formatVND(refundMode[refundingItem.id] === 'PARTIAL' ? (partialAmount[refundingItem.id] || refundingItem.suggestedPartialAmount) : refundingItem.amount)}</span></span>
                <span className="text-[#4B4B4B]">Hành động này sẽ hủy gói Pro của người dùng.</span>
              </div>
            </div>

            <div className="border-t-2 border-[#141414] bg-[#ECE6DB] px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setRefundingItem(null)}
                className="border border-[#141414] bg-white px-6 py-2 text-[11px] font-black uppercase tracking-widest hover:bg-[#F5F0E8] transition-all"
              >
                Hủy
              </button>
              <button
                disabled={processingId === refundingItem.id}
                onClick={async () => {
                  const ok = await requestConfirm(
                    `Xác nhận phê duyệt hoàn tiền cho "${refundingItem.userName}" và gửi email thông báo?`,
                    { confirmText: 'Phê duyệt & Gửi', cancelText: 'Huỷ' }
                  )
                  if (!ok) return
                  try {
                    await approveRefund(refundingItem)
                    setRefundingItem(null)
                  } catch (e) {
                    console.error(e)
                  }
                }}
                className="flex items-center gap-2 border border-[#141414] bg-[#141414] text-white px-6 py-2 text-[11px] font-black uppercase tracking-widest hover:bg-transparent hover:text-[#141414] transition-all disabled:opacity-60"
              >
                {processingId === refundingItem.id ? 'Đang gửi...' : 'Phê duyệt & Gửi Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
