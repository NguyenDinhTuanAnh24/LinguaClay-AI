'use client'

import { useMemo, useState } from 'react'

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
              <div className={`relative grid gap-2 pt-5 ${rangeTokenRows.length > 0 ? '' : 'grid-cols-1'}`} style={{ gridTemplateColumns: `repeat(${Math.max(1, rangeTokenRows.length)}, minmax(0, 1fr))` }}>
                <div className="absolute left-0 right-0 top-[46px] border-t-2 border-dashed border-[#B91C1C]" />
                {rangeTokenRows.map((item) => {
                  const heightPct = Math.round((item.tokens / maxToken) * 100)
                  const overBudget = item.tokens > budgetThreshold
                  return (
                    <div key={item.dayKey} className="flex flex-col items-center">
                      <div className="mb-2 text-[10px] font-bold tabular-nums text-[#4B4B4B]">${item.usd.toFixed(2)}</div>
                      <div className="flex h-32 w-full items-end justify-center border border-[#141414] bg-[#F5F0E8]">
                        <div
                          className={`w-8 border border-[#141414] ${overBudget ? 'bg-[#B91C1C]' : 'bg-[#141414]'}`}
                          style={{ height: `${Math.max(6, heightPct)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-[10px] font-bold tracking-[0.06em]">{item.day}</p>
                      <p className="text-[10px] font-semibold tabular-nums text-[#4B4B4B]">{item.tokens.toLocaleString('vi-VN')}</p>
                    </div>
                  )
                })}
                {rangeTokenRows.length === 0 ? <p className="text-sm font-semibold text-[#4B4B4B]">Chưa có dữ liệu token trong DB.</p> : null}
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
                            <button type="button" className="border border-[#141414] px-2 py-1 text-[10px] font-bold uppercase">
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
      </section>
    </div>
  )
}
