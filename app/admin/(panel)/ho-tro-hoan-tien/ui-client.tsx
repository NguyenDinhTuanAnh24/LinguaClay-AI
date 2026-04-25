'use client'

import { useMemo, useState } from 'react'
import { AdminConfirmToast, AdminToastStack, useAdminConfirm, useAdminToast } from '../_components/admin-toast'
import RefundApprovalModal from './_components/RefundApprovalModal'
import RefundTab from './_components/RefundTab'
import SupportTab from './_components/SupportTab'
import {
  AdminTab,
  ChurnPlanView,
  ChurnReasonView,
  RefundHistoryItemView,
  RefundMode,
  RefundQueueItemView,
  SupportTicketView,
} from './ui-client-types'

type Props = {
  supportTickets: SupportTicketView[]
  refundQueue: RefundQueueItemView[]
  refundHistory: RefundHistoryItemView[]
  churnByPlan: ChurnPlanView[]
  churnByReason: ChurnReasonView[]
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
  if (key === 'APPROVED') return 'Đã duyệt'
  if (key === 'REJECTED') return 'Từ chối'
  if (key === 'CANCELED' || key === 'CANCELLED') return 'Đã hủy'
  return key || 'Không rõ'
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
}: Props) {
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
  const [refundEmailNote, setRefundEmailNote] = useState('')
  const [ticketPage, setTicketPage] = useState(1)
  const { toasts, showToast } = useAdminToast()
  const { confirm, requestConfirm, confirmYes, confirmNo } = useAdminConfirm()

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
          note: `Đã hoàn + ${formatVND(approvedAmount)}`,
        },
        ...prev,
      ])
      showToast(`Đã duyệt hoàn tiền ${formatVND(data.refundAmount || item.amount)} và hạ cấp người dùng về gói Miễn phí.`, 'success')
      setRefundingItem(null)
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
            <p className="mt-1 text-sm text-[#3D3D3D]">Gồm 2 nghiệp vụ trong một màn hình: Hỗ trợ khách hàng và Quản lý hoàn tiền.</p>
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
        <SupportTab
          ticketRows={ticketRows}
          currentTickets={currentTickets}
          selectedTicket={selectedTicket}
          ticketPage={ticketPage}
          totalTicketPages={totalTicketPages}
          internalNotes={internalNotes}
          replyDrafts={replyDrafts}
          replyingId={replyingId}
          cannedResponses={cannedResponses}
          setTicketPage={setTicketPage}
          setSelectedTicketId={setSelectedTicketId}
          setReplyDrafts={setReplyDrafts}
          setInternalNotes={setInternalNotes}
          requestConfirm={requestConfirm}
          sendReply={sendReply}
          saveInternalNote={saveInternalNote}
        />
      ) : (
        <RefundTab
          queueRows={queueRows}
          refundHistoryRows={refundHistoryRows}
          churnByPlan={churnByPlan}
          churnByReason={churnByReason}
          refundMode={refundMode}
          partialAmount={partialAmount}
          processingId={processingId}
          setRefundMode={setRefundMode}
          setPartialAmount={setPartialAmount}
          setRefundingItem={setRefundingItem}
          setRefundEmailNote={setRefundEmailNote}
          formatVND={formatVND}
          mapRefundStatusClass={mapRefundStatusClass}
          mapRefundStatusLabel={mapRefundStatusLabel}
        />
      )}

      <RefundApprovalModal
        item={refundingItem}
        processingId={processingId}
        refundMode={refundMode}
        partialAmount={partialAmount}
        refundEmailNote={refundEmailNote}
        setRefundEmailNote={setRefundEmailNote}
        onClose={() => setRefundingItem(null)}
        onApprove={approveRefund}
        requestConfirm={requestConfirm}
        formatVND={formatVND}
      />
    </div>
  )
}

export type {
  SupportTicketView,
  RefundQueueItemView,
  RefundHistoryItemView,
  ChurnPlanView,
  ChurnReasonView,
}
