'use client'

import { useState, useMemo } from 'react'
import { Plus, FileUp, Pencil, Trash2, ImageIcon, Music2 } from 'lucide-react'
import Image from 'next/image'
import { MediaItemView } from '@/app/admin/(panel)/hoc-lieu/ui-client-types'

type Props = {
  items: MediaItemView[]
  onAction: (action: any) => Promise<void>
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

export default function MediaTab({ items, onAction }: Props) {
  const [page, setPage] = useState(1)
  const pageSize = 12 // Dạng grid nên để 12 cho đẹp (3 hoặc 4 cột)

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page])

  const totalPages = Math.ceil(items.length / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-serif font-black uppercase tracking-tight">Thư viện - Media</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onAction({ type: 'open_import_csv' })}
            className="flex items-center gap-2 border-[2px] border-[#141414] bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all hover:bg-[#141414] hover:text-white"
          >
            <FileUp size={14} /> Import Media (CSV)
          </button>
          <button
            onClick={() => onAction({ type: 'open_create' })}
            className="flex items-center gap-2 border-[2px] border-[#141414] bg-[#141414] px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]"
          >
            <Plus size={14} /> Thêm Media
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pagedItems.map((file) => (
          <article key={file.id} className="border-[2px] border-[#141414] bg-white p-3 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
            <div className="relative mb-3 aspect-video border border-[#141414] bg-[#F5F0E8] flex items-center justify-center overflow-hidden">
              {file.type === 'Ảnh' ? (
                <Image 
                  src={file.url} 
                  alt={file.name} 
                  fill 
                  unoptimized 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover" 
                />
              ) : (
                <Music2 size={32} className="text-[#141414]" />
              )}
              <div className="absolute top-2 left-2 border border-[#141414] px-1.5 py-0.5 bg-white text-[10px] font-black uppercase">
                {file.type === 'Ảnh' ? <ImageIcon size={10} className="inline mr-1" /> : <Music2 size={10} className="inline mr-1" />}
                {file.type}
              </div>
            </div>
            <p className="truncate text-xs font-black uppercase tracking-tight mb-1">{file.name}</p>
            <p className="truncate text-[10px] font-bold text-[#4B4B4B] uppercase tracking-widest mb-2">{file.size}</p>
            
            <div className="flex justify-end gap-2 pt-2 border-t border-[#141414]/10">
              <button 
                onClick={() => onAction({ type: 'open_edit', file })}
                className="p-1.5 border border-[#141414] hover:bg-[#141414] hover:text-white transition-colors"
              >
                <Pencil size={12} />
              </button>
              <button 
                onClick={() => onAction({ type: 'delete', id: file.id, name: file.name })}
                className="p-1.5 border border-[#141414] text-red-600 hover:bg-red-600 hover:text-white transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </article>
        ))}
        {items.length === 0 && (
          <div className="col-span-full border-[2px] border-dashed border-[#141414] p-12 text-center text-sm font-medium text-[#4B4B4B] italic">
            Thư viện media đang trống.
          </div>
        )}
      </div>

      <Pager
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        label="Thư viện tệp tin"
      />
    </div>
  )
}
