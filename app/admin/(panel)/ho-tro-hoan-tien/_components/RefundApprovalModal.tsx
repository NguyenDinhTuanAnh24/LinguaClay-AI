'use client'

import { Mail, X } from 'lucide-react'
import { RefundMode, RefundQueueItemView } from '../ui-client-types'

type Props = {
  item: RefundQueueItemView | null
  processingId: string | null
  refundMode: Record<string, RefundMode>
  partialAmount: Record<string, number>
  refundEmailNote: string
  setRefundEmailNote: (value: string) => void
  onClose: () => void
  onApprove: (item: RefundQueueItemView) => Promise<void>
  requestConfirm: (
    message: string,
    options?: { confirmText?: string; cancelText?: string }
  ) => Promise<boolean>
  formatVND: (amount: number) => string
}

export default function RefundApprovalModal({
  item,
  processingId,
  refundMode,
  partialAmount,
  refundEmailNote,
  setRefundEmailNote,
  onClose,
  onApprove,
  requestConfirm,
  formatVND,
}: Props) {
  if (!item) return null

  const approvedAmount =
    refundMode[item.id] === 'PARTIAL'
      ? partialAmount[item.id] || item.suggestedPartialAmount
      : item.amount

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#141414]/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl border-2 border-[#141414] bg-[#F5F0E8] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
        <div className="flex items-center justify-between border-b-2 border-[#141414] bg-[#ECE6DB] px-5 py-4">
          <div className="flex items-center gap-3">
            <Mail size={20} className="text-[#141414]" />
            <h3 className="text-sm font-black uppercase tracking-widest text-[#141414]">Xác nhận & Gửi Email Hoàn Tiền</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 border border-[#141414] bg-white flex items-center justify-center hover:bg-black hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex border border-[#141414] bg-white px-3 py-2 text-sm">
            <span className="w-20 font-bold uppercase tracking-widest text-[10px] text-[#4B4B4B] mt-0.5">Người nhận:</span>
            <span className="font-semibold">{item.userEmail} ({item.userName})</span>
          </div>

          <div className="flex border border-[#141414] bg-white px-3 py-2 text-sm">
            <span className="w-20 font-bold uppercase tracking-widest text-[10px] text-[#4B4B4B] mt-0.5">Tiêu đề:</span>
            <span className="font-semibold">Thông báo phê duyệt hoàn tiền</span>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#4B4B4B] mb-2">Nội dung Email:</p>
            <textarea
              value={refundEmailNote}
              onChange={(event) => setRefundEmailNote(event.target.value)}
              rows={6}
              className="w-full border border-[#141414] bg-white p-3 text-sm outline-none focus:ring-1 focus:ring-[#141414]"
            />
          </div>

          <div className="bg-[#EFE8DC] border border-[#141414] p-3 flex justify-between items-center text-xs font-semibold">
            <span>Số tiền duyệt: <span className="font-black text-red-600">{formatVND(approvedAmount)}</span></span>
            <span className="text-[#4B4B4B]">Hành động này sẽ hủy gói Pro của người dùng.</span>
          </div>
        </div>

        <div className="border-t-2 border-[#141414] bg-[#ECE6DB] px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="border border-[#141414] bg-white px-6 py-2 text-[11px] font-black uppercase tracking-widest hover:bg-[#F5F0E8] transition-all"
          >
            Hủy
          </button>
          <button
            disabled={processingId === item.id}
            onClick={async () => {
              const ok = await requestConfirm(
                `Xác nhận phê duyệt hoàn tiền cho \"${item.userName}\" và gửi email thông báo?`,
                { confirmText: 'Phê duyệt & Gửi', cancelText: 'Hủy' }
              )
              if (!ok) return
              await onApprove(item)
            }}
            className="flex items-center gap-2 border border-[#141414] bg-[#141414] text-white px-6 py-2 text-[11px] font-black uppercase tracking-widest hover:bg-transparent hover:text-[#141414] transition-all disabled:opacity-60"
          >
            {processingId === item.id ? 'Đang gửi...' : 'Phê duyệt & Gửi Email'}
          </button>
        </div>
      </div>
    </div>
  )
}
