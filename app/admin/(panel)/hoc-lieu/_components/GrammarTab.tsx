'use client'

import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { GrammarItemView, GrammarTabAction } from '@/app/admin/(panel)/hoc-lieu/ui-client-types'

type Props = {
  rows: GrammarItemView[]
  onAction: (action: GrammarTabAction) => Promise<void>
}

function Pager({
  page,
  totalPages,
  onChange,
  label,
}: {
  page: number
  totalPages: number
  onChange: (next: number) => void
  label: string
}) {
  if (totalPages <= 1) return null
  const pageNumbers = Array.from({ length: totalPages }, (_, idx) => idx + 1)

  return (
    <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-[#4B4B4B]">
      <span>{label}: trang {page}/{totalPages}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="border border-[#141414] px-3 py-1 uppercase tracking-[0.08em] disabled:opacity-40"
        >
          Trước
        </button>
        <div className="flex items-center gap-1">
          {pageNumbers.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className="border px-2 py-1 tabular-nums transition-colors"
              style={{
                borderColor: '#141414',
                background: num === page ? '#141414' : '#F5F0E8',
                color: num === page ? '#F5F0E8' : '#141414',
              }}
            >
              {num}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="border border-[#141414] px-3 py-1 uppercase tracking-[0.08em] disabled:opacity-40"
        >
          Sau
        </button>
      </div>
    </div>
  )
}

export default function GrammarTab({ rows, onAction }: Props) {
  const [page, setPage] = useState(1)
  const pageSize = 10

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, page])

  const totalPages = Math.ceil(rows.length / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-serif font-black uppercase tracking-tight">Học liệu - Ngữ pháp</h2>
        <button
          onClick={() => onAction({ type: 'open_create' })}
          className="flex items-center gap-2 border-[2px] border-[#141414] bg-[#141414] px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]"
        >
          <Plus size={14} /> Thêm ngữ pháp
        </button>
      </div>

      <div className="border-[2px] border-[#141414] bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-[2px] border-[#141414] bg-[#F5F0E8]">
                <th className="px-5 py-4 text-[11px] font-black uppercase tracking-widest">Cấu trúc</th>
                <th className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-center">Trình độ</th>
                <th className="px-5 py-4 text-[11px] font-black uppercase tracking-widest">Tiêu đề</th>
                <th className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y border-[#141414]">
              {pagedRows.map((row) => (
                <tr key={row.id} className="hover:bg-[#F5F0E8]/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-sm font-bold text-red-600">{row.structure}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-block border border-[#141414] px-2 py-0.5 text-[10px] font-black bg-white">
                      {row.level}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium">{row.title}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => onAction({ type: 'open_edit', row })}
                        className="p-2 border border-[#141414] hover:bg-[#141414] hover:text-white transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => onAction({ type: 'delete', id: row.id, title: row.title })}
                        className="p-2 border border-[#141414] text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm font-medium text-[#4B4B4B] italic">
                    Chưa có bài học ngữ pháp nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pager
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        label="Danh sách ngữ pháp"
      />
    </div>
  )
}
