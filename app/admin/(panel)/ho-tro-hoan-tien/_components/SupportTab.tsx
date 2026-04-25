'use client'

import { Mail } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'
import { SupportTicketView } from '../ui-client-types'

type Props = {
  ticketRows: SupportTicketView[]
  currentTickets: SupportTicketView[]
  selectedTicket: SupportTicketView | null
  ticketPage: number
  totalTicketPages: number
  internalNotes: Record<string, string>
  replyDrafts: Record<string, string>
  replyingId: string | null
  cannedResponses: string[]
  setTicketPage: Dispatch<SetStateAction<number>>
  setSelectedTicketId: Dispatch<SetStateAction<string | null>>
  setReplyDrafts: Dispatch<SetStateAction<Record<string, string>>>
  setInternalNotes: Dispatch<SetStateAction<Record<string, string>>>
  requestConfirm: (
    message: string,
    options?: { confirmText?: string; cancelText?: string }
  ) => Promise<boolean>
  sendReply: (ticketId: string, replyText: string) => Promise<void>
  saveInternalNote: (ticketId: string) => Promise<void>
}

export default function SupportTab({
  ticketRows,
  currentTickets,
  selectedTicket,
  ticketPage,
  totalTicketPages,
  internalNotes,
  replyDrafts,
  replyingId,
  cannedResponses,
  setTicketPage,
  setSelectedTicketId,
  setReplyDrafts,
  setInternalNotes,
  requestConfirm,
  sendReply,
  saveInternalNote,
}: Props) {
  return (
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
                  <tr key={ticket.id} className={`border-b border-[#141414] align-top transition-colors hover:bg-[#F5F0E8] ${isActive ? 'bg-[#EFE8DC]' : ''}`}>
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

        {totalTicketPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4B4B4B]">Trang {ticketPage} / {totalTicketPages}</span>
            <div className="flex gap-2">
              <button
                disabled={ticketPage === 1}
                onClick={() => setTicketPage((p) => p - 1)}
                className="border border-[#141414] px-3 py-1.5 text-[10px] font-black uppercase disabled:opacity-50 hover:bg-[#141414] hover:text-white"
              >
                Trước
              </button>
              <button
                disabled={ticketPage === totalTicketPages}
                onClick={() => setTicketPage((p) => p + 1)}
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
              <div className="mb-2 flex items-center gap-2 border-b border-dashed border-[#141414]/30 pb-2">
                <Mail size={16} />
                <p className="text-xs font-black uppercase tracking-[0.1em]">Gửi Email Phản Hồi</p>
              </div>
              <div className="space-y-3">
                <div className="flex bg-[#F5F0E8] border border-[#141414]/20 px-2 py-1 text-xs">
                  <span className="w-16 font-bold text-[#4B4B4B] uppercase text-[10px] mt-0.5">Tới:</span>
                  <span className="flex-1 font-semibold">{selectedTicket.userEmail}</span>
                </div>
                <textarea
                  value={replyDrafts[selectedTicket.id] || ''}
                  onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [selectedTicket.id]: event.target.value }))}
                  placeholder="Soạn nội dung phản hồi. Hệ thống sẽ tự động gửi vào email của người dùng."
                  rows={4}
                  className="w-full border border-[#141414] bg-[#FDFBF7] p-2 text-xs outline-none focus:bg-white"
                />
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  disabled={replyingId === selectedTicket.id}
                  onClick={async () => {
                    const ok = await requestConfirm(
                      `Gửi email phản hồi đến \"${selectedTicket.userEmail}\"?`,
                      { confirmText: 'Gửi Email', cancelText: 'Hủy' }
                    )
                    if (ok) await sendReply(selectedTicket.id, replyDrafts[selectedTicket.id] || '')
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
                    const ok = await requestConfirm('Lưu ghi chú nội bộ? (Chỉ admin nhìn thấy)', { confirmText: 'Lưu', cancelText: 'Hủy' })
                    if (ok) await saveInternalNote(selectedTicket.id)
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
                      <p className="text-[11px] text-[#4B4B4B]">{row.createdAt} • {row.status}</p>
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
  )
}
