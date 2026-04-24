'use client'

import { useMemo, useState, useEffect } from 'react'
import { X, User, Bot, AlertCircle } from 'lucide-react'

type AiTab = 'cost' | 'logs'
type RangeKey = 'today' | '7d' | '30d'

export type TokenDayView = {
  dayKey: string
  day: string
  tokens: number
  usd: number
}

export type ChatLogView = {
  id: string
  user: string
  time: string
  dayKey: string
  messages: number
  tokens: number
  flagged: boolean
  uContent?: string
  aiContent?: string
}

export function KiemSoatAIClient({
  tokenDaily,
  chatLogs,
}: {
  tokenDaily: TokenDayView[]
  chatLogs: ChatLogView[]
}) {
  const [activeTab, setActiveTab] = useState<AiTab>('cost')
  const [range, setRange] = useState<RangeKey>('7d')
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false)
  const [flaggedMap, setFlaggedMap] = useState<Record<string, boolean>>(
    Object.fromEntries(chatLogs.map((x) => [x.id, x.flagged]))
  )
  const [viewingLog, setViewingLog] = useState<ChatLogView | null>(null)

  const rangeTokenRows = useMemo(() => {
    if (tokenDaily.length === 0) return []
    if (range === 'today') return tokenDaily.slice(-1)
    if (range === '7d') return tokenDaily.slice(-7)
    return tokenDaily.slice(-30)
  }, [range, tokenDaily])

  const budgetThreshold = 50000
  const maxToken = Math.max(...rangeTokenRows.map((x) => x.tokens), budgetThreshold, 1)

  const logs = useMemo(
    () =>
      chatLogs.filter((log) => {
        const isFlagged = flaggedMap[log.id] ?? false
        return showFlaggedOnly ? isFlagged : true
      }),
    [chatLogs, flaggedMap, showFlaggedOnly]
  )

  return (
    <div className="space-y-6">
      <section
        className="border border-[#141414] bg-[#F5F0E8] p-6 transition-all hover:-translate-y-px hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,0.95)]"
        style={{ boxShadow: '8px 8px 0 0 rgba(20,20,20,0.92)' }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4B4B4B]">Admin Module</p>
        <h1 className="mt-2 text-4xl font-serif font-black text-[#141414]">Kiểm soát AI</h1>
        <p className="mt-2 text-sm font-semibold text-[#4B4B4B]">Theo dõi chi phí token và rà soát hội thoại cần kiểm tra.</p>
      </section>

      <section className="border border-[#141414] bg-[#F5F0E8] p-5" style={{ boxShadow: '6px 6px 0 0 rgba(20,20,20,0.9)' }}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {[
            { key: 'cost', label: 'Chi phí Token' },
            { key: 'logs', label: 'Chat Logs' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as AiTab)}
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

        {activeTab === 'cost' ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'today', label: 'Hôm nay' },
                { key: '7d', label: '7 ngày' },
                { key: '30d', label: '30 ngày' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setRange(item.key as RangeKey)}
                  className="border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em]"
                  style={{
                    borderColor: '#141414',
                    background: range === item.key ? '#141414' : '#F5F0E8',
                    color: range === item.key ? '#F5F0E8' : '#141414',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="border border-[#141414] bg-[#EFEAE0] p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#4B4B4B]">Token theo ngày</p>
                <p className="text-xs font-bold tabular-nums text-[#B91C1C]">Ngưỡng cảnh báo: {budgetThreshold.toLocaleString('vi-VN')} token</p>
              </div>
            <div className="overflow-x-auto border border-[#141414]">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-[#ECE6DB]">
                  <tr>
                    <th className="border border-[#141414] px-4 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Ngày</th>
                    <th className="border border-[#141414] px-4 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">Dung lượng Token</th>
                    <th className="border border-[#141414] px-4 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">Chi phí (tạm tính)</th>
                  </tr>
                </thead>
                <tbody>
                  {[...rangeTokenRows].reverse().map((item) => {
                    const overBudget = item.tokens > budgetThreshold
                    return (
                      <tr key={item.dayKey} className="odd:bg-[#F5F0E8] even:bg-[#EFEAE0]">
                        <td className="border border-[#141414] px-4 py-2 font-semibold">{item.dayKey}</td>
                        <td className={`border border-[#141414] px-4 py-2 text-right font-bold tabular-nums ${overBudget ? 'text-[#B91C1C]' : ''}`}>
                          {item.tokens.toLocaleString('vi-VN')}
                        </td>
                        <td className="border border-[#141414] px-4 py-2 text-right font-bold tabular-nums text-[#166534]">
                          ${item.usd.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                  {rangeTokenRows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="border border-[#141414] px-4 py-6 text-center text-sm font-bold text-[#4B4B4B] uppercase tracking-widest">
                        Chưa có dữ liệu token trong DB.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'logs' ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowFlaggedOnly((v) => !v)}
              className="border border-[#141414] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em]"
              style={{ background: showFlaggedOnly ? '#141414' : '#F5F0E8', color: showFlaggedOnly ? '#F5F0E8' : '#141414' }}
            >
              {showFlaggedOnly ? 'Đang lọc: Cần xem lại' : 'Lọc: Cần xem lại'}
            </button>

            <div className="overflow-x-auto border border-[#141414]">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-[#ECE6DB]">
                  <tr>
                    <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">User</th>
                    <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Thời gian</th>
                    <th className="border border-[#141414] px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">Số lượt tin</th>
                    <th className="border border-[#141414] px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">Token dùng</th>
                    <th className="border border-[#141414] px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const flagged = flaggedMap[log.id] ?? false
                    return (
                      <tr key={log.id} className="odd:bg-[#F5F0E8] even:bg-[#EFEAE0]">
                        <td className="border border-[#141414] px-3 py-2 font-semibold">{log.user}</td>
                        <td className="border border-[#141414] px-3 py-2 tabular-nums">{log.time}</td>
                        <td className="border border-[#141414] px-3 py-2 text-right font-bold tabular-nums">{log.messages}</td>
                        <td className="border border-[#141414] px-3 py-2 text-right font-bold tabular-nums">{log.tokens.toLocaleString('vi-VN')}</td>
                        <td className="border border-[#141414] px-3 py-2">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setViewingLog(log)}
                              className="border border-[#141414] px-2 py-1 text-[10px] font-bold uppercase hover:bg-[#141414] hover:text-[#F5F0E8] transition-colors"
                            >
                              Xem
                            </button>
                            <button
                              type="button"
                              onClick={() => setFlaggedMap((prev) => ({ ...prev, [log.id]: !flagged }))}
                              className={`border px-2 py-1 text-[10px] font-bold uppercase ${
                                flagged ? 'border-[#B91C1C] text-[#B91C1C]' : 'border-[#141414] text-[#141414]'
                              }`}
                            >
                              {flagged ? 'Đã đánh dấu' : 'Cần xem lại'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="border border-[#141414] px-3 py-4 text-center text-sm font-semibold text-[#4B4B4B]">
                        Không có hội thoại nào trong DB.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* MODAL XEM CHI TIẾT */}
        {viewingLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#141414]/60 p-4 backdrop-blur-sm">
            <div
              className="relative w-full max-w-3xl border-2 border-[#141414] bg-[#F5F0E8] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-[#141414] bg-[#ECE6DB] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-[#141414] bg-white flex items-center justify-center">
                    <AlertCircle className="text-[#141414]" size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#141414]">Chi tiết phiên làm việc</h3>
                    <p className="text-[10px] font-bold text-[#4B4B4B] uppercase tracking-[0.1em]">{viewingLog.user} • {viewingLog.time}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingLog(null)}
                  className="w-10 h-10 border border-[#141414] bg-white flex items-center justify-center hover:bg-black hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-[#141414] scrollbar-track-transparent">
                {/* User Content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 border border-[#141414] bg-[#141414] px-2 py-1 text-[10px] font-black uppercase text-white tracking-widest">
                      <User size={12} /> USER INPUT
                    </div>
                  </div>
                  <div className="border border-[#141414] bg-white p-4 text-sm font-medium leading-relaxed shadow-[4px_4px_0px_0px_rgba(20,20,20,0.1)]">
                    {viewingLog.uContent || <span className="italic text-[#8B857D] uppercase text-[11px] font-bold">Không có nội dung dữ liệu</span>}
                  </div>
                </div>

                {/* AI Content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 border border-[#141414] bg-red-600 px-2 py-1 text-[10px] font-black uppercase text-white tracking-widest shadow-[4px_4px_0px_0px_rgba(220,38,38,0.2)]">
                      <Bot size={12} /> AI FEEDBACK / TRANSCRIPT
                    </div>
                  </div>
                  <div className="border border-[#141414] bg-[#F9F7F2] p-4 text-sm font-medium leading-relaxed whitespace-pre-wrap shadow-[4px_4px_0px_0px_rgba(20,20,20,0.05)]">
                    {viewingLog.aiContent || <span className="italic text-[#8B857D] uppercase text-[11px] font-bold">AI chưa trả lời hoặc không có dữ liệu</span>}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#141414]/10">
                  <div className="bg-[#ECE6DB] border border-[#141414] p-3 text-center">
                    <p className="text-[9px] font-black uppercase text-[#4B4B4B] mb-1">Dung lượng</p>
                    <p className="text-xl font-serif font-black">{viewingLog.tokens.toLocaleString('vi-VN')} <span className="text-[10px] uppercase">Tokens</span></p>
                  </div>
                  <div className="bg-[#ECE6DB] border border-[#141414] p-3 text-center">
                    <p className="text-[9px] font-black uppercase text-[#4B4B4B] mb-1">Tin nhắn</p>
                    <p className="text-xl font-serif font-black">{viewingLog.messages} <span className="text-[10px] uppercase">Lượt</span></p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t-2 border-[#141414] bg-[#ECE6DB] px-6 py-4 flex justify-end">
                <button
                  onClick={() => setViewingLog(null)}
                  className="bg-[#141414] text-white px-8 py-2 text-xs font-black uppercase tracking-widest hover:bg-transparent hover:text-[#141414] border border-[#141414] transition-all"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
