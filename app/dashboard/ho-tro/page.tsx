'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

type TicketCategory = 'TECHNICAL' | 'CONTENT' | 'PAYMENT' | 'FEEDBACK'

type SupportTicket = {
  id: string
  category: string
  subject: string | null
  message: string
  attachmentUrl?: string | null
  status: string
  adminReply: string | null
  createdAt: string
  updatedAt: string
}

type ToastType = 'success' | 'error'

type Toast = {
  id: number
  message: string
  type: ToastType
}

let toastCounter = 0

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 border-[3px] border-[#141414] shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] text-[11px] font-black uppercase tracking-widest ${
            toast.type === 'success' ? 'bg-white text-[#141414]' : 'bg-[#141414] text-white'
          }`}
        >
          <span className="flex-1 vietnamese-text">{toast.message}</span>
          <button type="button" onClick={() => onDismiss(toast.id)} className="text-xs">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

function categoryLabel(value: string): string {
  const key = value.toUpperCase()
  if (key === 'TECHNICAL') return 'Lỗi kỹ thuật'
  if (key === 'CONTENT') return 'Lỗi nội dung'
  if (key === 'PAYMENT') return 'Thắc mắc thanh toán'
  return 'Góp ý'
}

function statusLabel(value: string): string {
  const key = value.toUpperCase()
  if (key === 'OPEN') return 'Mới'
  if (key === 'IN_PROGRESS') return 'Đang xử lý'
  if (key === 'RESOLVED') return 'Đã xử lý'
  if (key === 'CLOSED') return 'Đã đóng'
  return key
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function DashboardSupportPage() {
  const [category, setCategory] = useState<TicketCategory>('TECHNICAL')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [device, setDevice] = useState('Web')
  const [blockedLesson, setBlockedLesson] = useState('')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = ++toastCounter
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const sortedTickets = useMemo(
    () => [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [tickets]
  )

  const loadTickets = useCallback(async () => {
    try {
      const res = await fetch('/api/support/tickets', { method: 'GET' })
      const data = (await res.json()) as { ok?: boolean; tickets?: SupportTicket[]; error?: string }
      if (!res.ok || !data.ok) {
        addToast(data.error || 'Không thể tải ticket hỗ trợ.', 'error')
        return
      }
      setTickets(data.tickets || [])
    } catch {
      addToast('Không thể tải ticket hỗ trợ.', 'error')
    }
  }, [addToast])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadTickets()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadTickets])

  const submitTicket = async () => {
    if (!message.trim()) {
      addToast('Vui lòng nhập nội dung cần hỗ trợ.', 'error')
      return
    }
    setLoading(true)
    try {
      let attachmentUrl = ''
      if (attachmentFile) {
        const form = new FormData()
        form.append('file', attachmentFile)
        const uploadRes = await fetch('/api/support/upload-attachment', { method: 'POST', body: form })
        const uploadData = (await uploadRes.json()) as { ok?: boolean; error?: string; url?: string }
        if (!uploadRes.ok || !uploadData.ok || !uploadData.url) {
          addToast(uploadData.error || 'Không thể tải ảnh đính kèm, sẽ gửi phiếu không kèm ảnh.', 'error')
        } else {
          attachmentUrl = uploadData.url
        }
      }

      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subject: subject.trim(),
          message: message.trim(),
          attachmentUrl,
          device: device.trim(),
          blockedLesson: blockedLesson.trim(),
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; message?: string; ticket?: SupportTicket }
      if (!res.ok || !data.ok || !data.ticket) {
        addToast(data.error || 'Không thể gửi yêu cầu hỗ trợ.', 'error')
        return
      }
      setTickets((prev) => [data.ticket!, ...prev])
      setSubject('')
      setMessage('')
      setBlockedLesson('')
      setAttachmentFile(null)
      setAttachmentPreview('')
      addToast(data.message || 'Đã gửi yêu cầu hỗ trợ.', 'success')
    } catch {
      addToast('Không thể gửi yêu cầu hỗ trợ.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      <div className="border border-[#141414] bg-[#F5F0E8] p-5 shadow-[6px_6px_0px_0px_rgba(20,20,20,0.9)]">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4B4B4B]">Hỗ trợ người dùng</p>
        <h1 className="mt-1 text-2xl font-serif font-black uppercase tracking-[0.02em] text-[#141414]">Gửi yêu cầu hỗ trợ</h1>
        <p className="mt-1 text-sm text-[#3D3D3D]">Ticket sẽ chuyển trực tiếp vào màn hình admin Hỗ trợ / Hoàn tiền.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <article className="border border-[#141414] bg-[#F5F0E8] p-4 space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="border border-[#141414] bg-white px-3 py-2 text-sm font-semibold outline-none"
            >
              <option value="TECHNICAL">Lỗi kỹ thuật</option>
              <option value="CONTENT">Lỗi nội dung</option>
              <option value="PAYMENT">Thắc mắc thanh toán</option>
              <option value="FEEDBACK">Góp ý</option>
            </select>
            <input
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              placeholder="Thiết bị (VD: iPhone 14 / Chrome)"
              className="border border-[#141414] bg-white px-3 py-2 text-sm font-semibold outline-none"
            />
          </div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Tiêu đề ngắn (tuỳ chọn)"
            className="w-full border border-[#141414] bg-white px-3 py-2 text-sm font-semibold outline-none"
          />
          <input
            value={blockedLesson}
            onChange={(e) => setBlockedLesson(e.target.value)}
            placeholder="Bài học đang kẹt (tuỳ chọn)"
            className="w-full border border-[#141414] bg-white px-3 py-2 text-sm font-semibold outline-none"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
            className="w-full border border-[#141414] bg-white px-3 py-2 text-sm outline-none"
          />
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-[0.08em] text-[#141414]">Ảnh đính kèm (tuỳ chọn)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setAttachmentFile(file)
                setAttachmentPreview(file ? URL.createObjectURL(file) : '')
              }}
              className="w-full border border-[#141414] bg-white px-3 py-2 text-sm"
            />
            {attachmentPreview ? <img src={attachmentPreview} alt="Xem trước ảnh đính kèm" className="h-28 w-full object-cover border border-[#141414]" /> : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={submitTicket}
              disabled={loading}
              className="border border-[#141414] bg-[#141414] px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-[#F5F0E8] disabled:opacity-60"
            >
              {loading ? 'Đang gửi...' : 'Gửi hỗ trợ'}
            </button>
            <Link
              href="/dashboard/settings"
              className="border border-[#141414] px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-[#141414]"
            >
              Quay lại cài đặt
            </Link>
          </div>
        </article>

        <article className="border border-[#141414] bg-[#F5F0E8] p-4">
          <h2 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-[#141414]">Lịch sử hỗ trợ của bạn</h2>
          <div className="space-y-2">
            {sortedTickets.map((ticket) => (
              <div key={ticket.id} className="border border-[#141414] bg-white p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-black uppercase tracking-[0.08em]">{categoryLabel(ticket.category)}</span>
                  <span className="border border-[#141414] px-2 py-0.5 font-black uppercase tracking-[0.08em]">
                    {statusLabel(ticket.status)}
                  </span>
                </div>
                {ticket.subject ? <p className="mt-1 font-semibold">{ticket.subject}</p> : null}
                <p className="mt-1">{ticket.message}</p>
                {ticket.attachmentUrl ? (
                  <a href={ticket.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 block border border-[#141414] p-2">
                    <img src={ticket.attachmentUrl} alt="Ảnh đính kèm" className="h-28 w-full object-cover" />
                  </a>
                ) : null}
                {ticket.adminReply ? (
                  <div className="mt-2 border border-[#141414] bg-[#F5F0E8] p-2">
                    <p className="font-black uppercase tracking-[0.08em]">Phản hồi từ admin</p>
                    <p className="mt-1">{ticket.adminReply}</p>
                  </div>
                ) : null}
                <p className="mt-2 text-[11px] text-[#4B4B4B]">{formatDate(ticket.createdAt)}</p>
              </div>
            ))}
            {!sortedTickets.length && <p className="text-sm text-[#4B4B4B]">Bạn chưa có ticket hỗ trợ nào.</p>}
          </div>
        </article>
      </section>
    </div>
  )
}
