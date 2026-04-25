'use client'

import { ChurnPlanView, ChurnReasonView, RefundHistoryItemView, RefundMode, RefundQueueItemView } from '../ui-client-types'
import { Dispatch, SetStateAction } from 'react'

type Props = {
  queueRows: RefundQueueItemView[]
  refundHistoryRows: RefundHistoryItemView[]
  churnByPlan: ChurnPlanView[]
  churnByReason: ChurnReasonView[]
  refundMode: Record<string, RefundMode>
  partialAmount: Record<string, number>
  processingId: string | null
  setRefundMode: Dispatch<SetStateAction<Record<string, RefundMode>>>
  setPartialAmount: Dispatch<SetStateAction<Record<string, number>>>
  setRefundingItem: (item: RefundQueueItemView) => void
  setRefundEmailNote: (value: string) => void
  formatVND: (amount: number) => string
  mapRefundStatusClass: (status: string) => string
  mapRefundStatusLabel: (status: string) => string
}

export default function RefundTab({
  queueRows,
  refundHistoryRows,
  churnByPlan,
  churnByReason,
  refundMode,
  partialAmount,
  processingId,
  setRefundMode,
  setPartialAmount,
  setRefundingItem,
  setRefundEmailNote,
  formatVND,
  mapRefundStatusClass,
  mapRefundStatusLabel,
}: Props) {
  return (
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
                    <p className="text-[11px] text-[#4B4B4B]">Chu TK: {item.accountName || '---'}</p>
                  </td>
                  <td className="px-2 py-2">
                    <p className="font-semibold">{item.planId}</p>
                  </td>
                  <td className="px-2 py-2">
                    <p className="font-semibold">{formatVND(item.amount)}</p>
                  </td>
                  <td className="px-2 py-2">
                    <span className={`inline-flex border px-2 py-0.5 text-[10px] font-black uppercase ${item.eligibilityLabel === 'Hợp lệ' ? 'border-[#166534] text-[#166534]' : 'border-[#B45309] text-[#B45309]'}`}>
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
                        const amount = mode === 'PARTIAL' ? partial : item.amount
                        setRefundEmailNote(
                          `Admin đã phê duyệt yêu cầu hoàn tiền của bạn.\nSố tiền hoàn lại: ${formatVND(amount)}.\n\nTiền sẽ về tài khoản ngân hàng của bạn trong vài ngày làm việc tới. Gói học của bạn đã được hủy theo chính sách. Cảm ơn bạn.`
                        )
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
          <h2 className="text-sm font-black uppercase tracking-[0.14em]">Lịch sử hoàn tiền</h2>
          <span className="border border-[#141414] px-2 py-1 text-[10px] font-black uppercase">{refundHistoryRows.length} mục</span>
        </div>

        <div className="overflow-x-auto border border-[#141414]">
          <table className="min-w-[980px] w-full bg-white text-xs">
            <thead className="bg-[#EFE8DC]">
              <tr className="border-b border-[#141414] text-left font-black uppercase tracking-[0.08em]">
                <th className="px-2 py-2">Người dùng</th>
                <th className="px-2 py-2">Gói</th>
                <th className="px-2 py-2">Lý do</th>
                <th className="px-2 py-2">Số tiền</th>
                <th className="px-2 py-2">Trạng thái</th>
                <th className="px-2 py-2">Xử lý bởi</th>
                <th className="px-2 py-2">Thời gian</th>
                <th className="px-2 py-2">Ghi chú</th>
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
                    <p className="font-semibold">Yêu cầu: {formatVND(row.requestedAmount)}</p>
                    <p className="text-[11px] text-[#4B4B4B]">Đã hoàn: {row.refundedAmount ? formatVND(row.refundedAmount) : '---'}</p>
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
                    Chưa có lịch sử hoàn tiền.
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
  )
}
