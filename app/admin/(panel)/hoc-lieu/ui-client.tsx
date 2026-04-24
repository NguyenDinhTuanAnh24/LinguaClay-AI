'use client'

import { useMemo, useState } from 'react'
import { Plus, FileUp, Pencil, Trash2, ImageIcon, Music2 } from 'lucide-react'
import { AdminConfirmToast, AdminToastStack, useAdminConfirm, useAdminToast } from '../_components/admin-toast'
import { CEFR_LEVELS } from '@/lib/levels'

type StudyTab = 'flashcard' | 'grammar' | 'media'

type FlashcardWordView = {
  id: string
  term: string
  definition: string
  example: string
  pronunciation: string
}

export type FlashcardSetView = {
  id: string
  topic: string
  words: number
  level: string
  createdAt: string
  items: FlashcardWordView[]
}

export type GrammarItemView = {
  id: string
  title: string
  level: string
  structure: string
  createdAt: string
}

export type MediaItemView = {
  id: string
  type: 'Ảnh' | 'Âm thanh'
  name: string
  url: string
  size: string
}

type Props = {
  flashcardSets: FlashcardSetView[]
  grammarRows: GrammarItemView[]
  mediaItems: MediaItemView[]
}

type FlashcardForm = { id?: string; topic: string; level: string }
type GrammarForm = { id?: string; title: string; level: string; structure: string }
type MediaForm = { id?: string; type: 'Ảnh' | 'Âm thanh'; name: string; url: string; size: string }

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
      <span>
        {label}: trang {page}/{totalPages}
      </span>
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
              className="border px-2 py-1 tabular-nums"
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

export function HocLieuClient({ flashcardSets, grammarRows, mediaItems }: Props) {
  const [activeTab, setActiveTab] = useState<StudyTab>('flashcard')
  const [flashcardSetsState, setFlashcardSetsState] = useState<FlashcardSetView[]>(flashcardSets)
  const [grammarRowsState, setGrammarRowsState] = useState<GrammarItemView[]>(grammarRows)
  const [mediaItemsState, setMediaItemsState] = useState<MediaItemView[]>(mediaItems)
  const [selectedSetId, setSelectedSetId] = useState(flashcardSets[0]?.id ?? '')
  const [loading, setLoading] = useState(false)

  const [flashPage, setFlashPage] = useState(1)
  const [grammarPage, setGrammarPage] = useState(1)
  const [mediaPage, setMediaPage] = useState(1)

  const [showFlashForm, setShowFlashForm] = useState(false)
  const [flashForm, setFlashForm] = useState<FlashcardForm>({ topic: '', level: 'A1' })
  const [showFlashImport, setShowFlashImport] = useState(false)
  const [flashCsv, setFlashCsv] = useState('')

  const [showGrammarForm, setShowGrammarForm] = useState(false)
  const [grammarForm, setGrammarForm] = useState<GrammarForm>({ title: '', level: 'A1', structure: '' })
  const [showGrammarImport, setShowGrammarImport] = useState(false)
  const [grammarCsv, setGrammarCsv] = useState('')

  const [showMediaForm, setShowMediaForm] = useState(false)
  const [mediaForm, setMediaForm] = useState<MediaForm>({ type: 'Ảnh', name: '', url: '', size: '' })
  const [showMediaImport, setShowMediaImport] = useState(false)
  const [mediaCsv, setMediaCsv] = useState('')

  const { toasts, showToast } = useAdminToast()
  const { confirm, requestConfirm, confirmYes, confirmNo } = useAdminConfirm()

  const flashItemsPerPage = 10
  const grammarItemsPerPage = 10
  const mediaItemsPerPage = 9

  const flashTotalPages = Math.max(1, Math.ceil(flashcardSetsState.length / flashItemsPerPage))
  const grammarTotalPages = Math.max(1, Math.ceil(grammarRowsState.length / grammarItemsPerPage))
  const mediaTotalPages = Math.max(1, Math.ceil(mediaItemsState.length / mediaItemsPerPage))

  const flashPageSafe = Math.min(flashPage, flashTotalPages)
  const grammarPageSafe = Math.min(grammarPage, grammarTotalPages)
  const mediaPageSafe = Math.min(mediaPage, mediaTotalPages)

  const flashcardPaged = flashcardSetsState.slice((flashPageSafe - 1) * flashItemsPerPage, flashPageSafe * flashItemsPerPage)
  const grammarPaged = grammarRowsState.slice((grammarPageSafe - 1) * grammarItemsPerPage, grammarPageSafe * grammarItemsPerPage)
  const mediaPaged = mediaItemsState.slice((mediaPageSafe - 1) * mediaItemsPerPage, mediaPageSafe * mediaItemsPerPage)

  const selectedSet = useMemo(
    () => flashcardSetsState.find((x) => x.id === selectedSetId) ?? flashcardSetsState[0],
    [selectedSetId, flashcardSetsState]
  )

  async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init)
    const data = (await res.json()) as T & { error?: string; ok?: boolean }
    if (!res.ok || (typeof data.ok === 'boolean' && !data.ok)) {
      throw new Error(data.error || 'Yêu cầu thất bại')
    }
    return data
  }

  async function refreshFlashcards() {
    const data = await fetchJson<{ ok: true; sets: FlashcardSetView[] }>('/api/admin/materials/flashcards')
    setFlashcardSetsState(data.sets)
    if (!data.sets.find((item) => item.id === selectedSetId)) setSelectedSetId(data.sets[0]?.id || '')
  }

  async function refreshGrammar() {
    const data = await fetchJson<{ ok: true; rows: GrammarItemView[] }>('/api/admin/materials/grammar')
    setGrammarRowsState(data.rows)
  }

  async function refreshMedia() {
    const data = await fetchJson<{ ok: true; rows: MediaItemView[] }>('/api/admin/materials/media')
    setMediaItemsState(data.rows)
  }

  async function handleFlashcardSubmit() {
    if (!flashForm.topic.trim()) {
      showToast('Vui lòng nhập tên chủ đề.', 'error')
      return
    }
    setLoading(true)
    try {
      await fetchJson('/api/admin/materials/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: flashForm.id ? 'update' : 'create',
          id: flashForm.id,
          topic: flashForm.topic,
          level: flashForm.level,
        }),
      })
      await refreshFlashcards()
      showToast(flashForm.id ? 'Đã cập nhật chủ đề flashcard.' : 'Đã thêm chủ đề flashcard mới.', 'success')
      setShowFlashForm(false)
      setFlashForm({ topic: '', level: 'A1' })
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể lưu flashcard', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleFlashcardDelete(id: string, topic: string) {
    const ok = await requestConfirm(`Xác nhận xóa chủ đề "${topic}"?`, { confirmText: 'Xóa', cancelText: 'Hủy' })
    if (!ok) {
      showToast('Đã hủy thao tác xóa chủ đề.', 'info')
      return
    }
    setLoading(true)
    try {
      await fetchJson('/api/admin/materials/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      })
      await refreshFlashcards()
      showToast('Đã xóa chủ đề flashcard.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể xóa chủ đề', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleFlashcardImport() {
    if (!flashCsv.trim()) {
      showToast('Vui lòng dán CSV flashcard.', 'error')
      return
    }
    setLoading(true)
    try {
      await fetchJson('/api/admin/materials/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import_csv', csvText: flashCsv }),
      })
      await refreshFlashcards()
      setShowFlashImport(false)
      setFlashCsv('')
      showToast('Đã import CSV flashcard.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể import CSV flashcard', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleGrammarSubmit() {
    if (!grammarForm.title.trim()) {
      showToast('Vui lòng nhập tên cấu trúc ngữ pháp.', 'error')
      return
    }
    setLoading(true)
    try {
      await fetchJson('/api/admin/materials/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: grammarForm.id ? 'update' : 'create',
          id: grammarForm.id,
          title: grammarForm.title,
          level: grammarForm.level,
          structure: grammarForm.structure,
        }),
      })
      await refreshGrammar()
      showToast(grammarForm.id ? 'Đã cập nhật cấu trúc ngữ pháp.' : 'Đã thêm cấu trúc ngữ pháp.', 'success')
      setShowGrammarForm(false)
      setGrammarForm({ title: '', level: 'A1', structure: '' })
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể lưu ngữ pháp', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleGrammarDelete(id: string, title: string) {
    const ok = await requestConfirm(`Xác nhận xóa cấu trúc "${title}"?`, { confirmText: 'Xóa', cancelText: 'Hủy' })
    if (!ok) {
      showToast('Đã hủy thao tác xóa ngữ pháp.', 'info')
      return
    }
    setLoading(true)
    try {
      await fetchJson('/api/admin/materials/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      })
      await refreshGrammar()
      showToast('Đã xóa cấu trúc ngữ pháp.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể xóa ngữ pháp', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleGrammarImport() {
    if (!grammarCsv.trim()) {
      showToast('Vui lòng dán CSV ngữ pháp.', 'error')
      return
    }
    setLoading(true)
    try {
      await fetchJson('/api/admin/materials/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import_csv', csvText: grammarCsv }),
      })
      await refreshGrammar()
      setShowGrammarImport(false)
      setGrammarCsv('')
      showToast('Đã import CSV ngữ pháp.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể import CSV ngữ pháp', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleMediaSubmit() {
    if (!mediaForm.name.trim() || !mediaForm.url.trim()) {
      showToast('Vui lòng nhập tên file và URL.', 'error')
      return
    }
    setLoading(true)
    try {
      await fetchJson('/api/admin/materials/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mediaForm.id ? 'update' : 'create',
          id: mediaForm.id,
          type: mediaForm.type,
          name: mediaForm.name,
          url: mediaForm.url,
          size: mediaForm.size,
        }),
      })
      await refreshMedia()
      showToast(mediaForm.id ? 'Đã cập nhật media.' : 'Đã thêm media mới.', 'success')
      setShowMediaForm(false)
      setMediaForm({ type: 'Ảnh', name: '', url: '', size: '' })
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể lưu media', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleMediaDelete(id: string, name: string) {
    const ok = await requestConfirm(`Xác nhận xóa file "${name}"?`, { confirmText: 'Xóa', cancelText: 'Hủy' })
    if (!ok) {
      showToast('Đã hủy thao tác xóa media.', 'info')
      return
    }
    setLoading(true)
    try {
      await fetchJson('/api/admin/materials/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      })
      await refreshMedia()
      showToast('Đã xóa media.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể xóa media', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleMediaImport() {
    if (!mediaCsv.trim()) {
      showToast('Vui lòng dán CSV media.', 'error')
      return
    }
    setLoading(true)
    try {
      await fetchJson('/api/admin/materials/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import_csv', csvText: mediaCsv }),
      })
      await refreshMedia()
      setShowMediaImport(false)
      setMediaCsv('')
      showToast('Đã import CSV media.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể import CSV media', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminConfirmToast confirm={confirm} onConfirm={confirmYes} onCancel={confirmNo} />
      <AdminToastStack toasts={toasts} />

      <section
        className="border border-[#141414] bg-[#F5F0E8] p-6 transition-all hover:-translate-y-px hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,0.95)]"
        style={{ boxShadow: '8px 8px 0 0 rgba(20,20,20,0.92)' }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4B4B4B]">Admin Module</p>
        <h1 className="mt-2 text-4xl font-serif font-black text-[#141414]">Học liệu</h1>
        <p className="mt-2 text-sm font-semibold text-[#4B4B4B]">Quản lý nội dung Flashcard, Ngữ pháp và Media trong cùng một nơi.</p>
      </section>

      <section className="border border-[#141414] bg-[#F5F0E8] p-5" style={{ boxShadow: '6px 6px 0 0 rgba(20,20,20,0.9)' }}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {[
            { key: 'flashcard', label: 'Flashcard' },
            { key: 'grammar', label: 'Ngữ pháp' },
            { key: 'media', label: 'Media' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as StudyTab)}
              className="border px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em]"
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

        {activeTab === 'flashcard' ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setFlashForm({ topic: '', level: 'A1' })
                  setShowFlashForm((prev) => !prev)
                }}
                className="flex items-center gap-2 border border-[#141414] bg-[#141414] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#F5F0E8] disabled:opacity-50"
              >
                <Plus size={13} />
                Thêm mới
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowFlashImport((prev) => !prev)}
                className="flex items-center gap-2 border border-[#141414] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-50"
              >
                <FileUp size={13} />
                Import CSV
              </button>
            </div>

            {showFlashForm ? (
              <div className="grid grid-cols-1 gap-2 border border-[#141414] bg-[#EFEAE0] p-3 md:grid-cols-[2fr_1fr_auto]">
                <input
                  value={flashForm.topic}
                  onChange={(e) => setFlashForm((prev) => ({ ...prev, topic: e.target.value }))}
                  placeholder="Tên chủ đề"
                  className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm"
                />
                <select
                  value={flashForm.level}
                  onChange={(e) => setFlashForm((prev) => ({ ...prev, level: e.target.value }))}
                  className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm"
                >
                  {CEFR_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleFlashcardSubmit}
                  disabled={loading}
                  className="h-9 border border-[#141414] bg-[#141414] px-4 text-[11px] font-black uppercase tracking-[0.12em] text-[#F5F0E8] disabled:opacity-50"
                >
                  {flashForm.id ? 'Lưu sửa' : 'Tạo mới'}
                </button>
              </div>
            ) : null}

            {showFlashImport ? (
              <div className="space-y-2 border border-[#141414] bg-[#EFEAE0] p-3">
                <p className="text-[11px] font-bold text-[#4B4B4B]">CSV mẫu: topic,term,definition,example,pronunciation,level</p>
                <textarea
                  value={flashCsv}
                  onChange={(e) => setFlashCsv(e.target.value)}
                  rows={6}
                  className="w-full border border-[#141414] bg-[#F5F0E8] p-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleFlashcardImport}
                  disabled={loading}
                  className="border border-[#141414] bg-[#141414] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#F5F0E8] disabled:opacity-50"
                >
                  Import Flashcard CSV
                </button>
              </div>
            ) : null}

            <div className="overflow-x-auto border border-[#141414]">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-[#ECE6DB]">
                  <tr>
                    <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Chủ đề</th>
                    <th className="border border-[#141414] px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">Số từ</th>
                    <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Trình độ</th>
                    <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Ngày tạo</th>
                    <th className="border border-[#141414] px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {flashcardPaged.map((set) => (
                    <tr
                      key={set.id}
                      className={`cursor-pointer ${selectedSetId === set.id ? 'bg-[#E8E1D5]' : 'odd:bg-[#F5F0E8] even:bg-[#EFEAE0]'}`}
                      onClick={() => setSelectedSetId(set.id)}
                    >
                      <td className="border border-[#141414] px-3 py-2 font-semibold">{set.topic}</td>
                      <td className="border border-[#141414] px-3 py-2 text-right font-bold tabular-nums">{set.words}</td>
                      <td className="border border-[#141414] px-3 py-2">{set.level}</td>
                      <td className="border border-[#141414] px-3 py-2 tabular-nums">{set.createdAt}</td>
                      <td className="border border-[#141414] px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              setFlashForm({ id: set.id, topic: set.topic, level: set.level })
                              setShowFlashForm(true)
                            }}
                            className="inline-flex items-center gap-1 border border-[#141414] px-2 py-1 text-[10px] font-bold uppercase"
                          >
                            <Pencil size={11} />
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              void handleFlashcardDelete(set.id, set.topic)
                            }}
                            className="inline-flex items-center gap-1 border border-[#141414] px-2 py-1 text-[10px] font-bold uppercase text-[#B91C1C]"
                          >
                            <Trash2 size={11} />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={flashPageSafe} totalPages={flashTotalPages} onChange={setFlashPage} label="Chủ đề" />

            <div className="border border-[#141414] bg-[#EFEAE0] p-4">
              <h3 className="mb-3 text-sm font-black uppercase tracking-[0.1em]">Danh sách từ trong bộ: {selectedSet?.topic || '-'}</h3>
              <div className="overflow-x-auto border border-[#141414] bg-[#F5F0E8]">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#ECE6DB]">
                    <tr>
                      <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Term</th>
                      <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Definition</th>
                      <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Ví dụ</th>
                      <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Phiên âm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedSet?.items || []).map((word) => (
                      <tr key={word.id} className="odd:bg-[#F5F0E8] even:bg-[#EFEAE0]">
                        <td className="border border-[#141414] px-3 py-2 font-semibold">{word.term}</td>
                        <td className="border border-[#141414] px-3 py-2">{word.definition}</td>
                        <td className="border border-[#141414] px-3 py-2">{word.example}</td>
                        <td className="border border-[#141414] px-3 py-2 font-mono">{word.pronunciation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'grammar' ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setGrammarForm({ title: '', level: 'A1', structure: '' })
                  setShowGrammarForm((prev) => !prev)
                }}
                className="flex items-center gap-2 border border-[#141414] bg-[#141414] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#F5F0E8] disabled:opacity-50"
              >
                <Plus size={13} />
                Thêm mới
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowGrammarImport((prev) => !prev)}
                className="flex items-center gap-2 border border-[#141414] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-50"
              >
                <FileUp size={13} />
                Import CSV
              </button>
            </div>

            {showGrammarForm ? (
              <div className="grid grid-cols-1 gap-2 border border-[#141414] bg-[#EFEAE0] p-3 md:grid-cols-[2fr_1fr_2fr_auto]">
                <input
                  value={grammarForm.title}
                  onChange={(e) => setGrammarForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Tên cấu trúc"
                  className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm"
                />
                <select
                  value={grammarForm.level}
                  onChange={(e) => setGrammarForm((prev) => ({ ...prev, level: e.target.value }))}
                  className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm"
                >
                  {CEFR_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <input
                  value={grammarForm.structure}
                  onChange={(e) => setGrammarForm((prev) => ({ ...prev, structure: e.target.value }))}
                  placeholder="Cấu trúc"
                  className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleGrammarSubmit}
                  disabled={loading}
                  className="h-9 border border-[#141414] bg-[#141414] px-4 text-[11px] font-black uppercase tracking-[0.12em] text-[#F5F0E8] disabled:opacity-50"
                >
                  {grammarForm.id ? 'Lưu sửa' : 'Tạo mới'}
                </button>
              </div>
            ) : null}

            {showGrammarImport ? (
              <div className="space-y-2 border border-[#141414] bg-[#EFEAE0] p-3">
                <p className="text-[11px] font-bold text-[#4B4B4B]">CSV mẫu: title,level,structure,explanation,example</p>
                <textarea
                  value={grammarCsv}
                  onChange={(e) => setGrammarCsv(e.target.value)}
                  rows={6}
                  className="w-full border border-[#141414] bg-[#F5F0E8] p-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleGrammarImport}
                  disabled={loading}
                  className="border border-[#141414] bg-[#141414] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#F5F0E8] disabled:opacity-50"
                >
                  Import Ngữ pháp CSV
                </button>
              </div>
            ) : null}

            <div className="overflow-x-auto border border-[#141414]">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-[#ECE6DB]">
                  <tr>
                    <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Chủ điểm</th>
                    <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Cấp độ</th>
                    <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Cấu trúc</th>
                    <th className="border border-[#141414] px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.08em]">Ngày tạo</th>
                    <th className="border border-[#141414] px-3 py-2 text-right text-[10px] font-black uppercase tracking-[0.08em]">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {grammarPaged.map((item) => (
                    <tr key={item.id} className="odd:bg-[#F5F0E8] even:bg-[#EFEAE0]">
                      <td className="border border-[#141414] px-3 py-2 font-semibold">{item.title}</td>
                      <td className="border border-[#141414] px-3 py-2">{item.level}</td>
                      <td className="border border-[#141414] px-3 py-2">{item.structure}</td>
                      <td className="border border-[#141414] px-3 py-2 tabular-nums">{item.createdAt}</td>
                      <td className="border border-[#141414] px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setGrammarForm({
                                id: item.id,
                                title: item.title,
                                level: item.level,
                                structure: item.structure === 'N/A' ? '' : item.structure,
                              })
                              setShowGrammarForm(true)
                            }}
                            className="inline-flex items-center gap-1 border border-[#141414] px-2 py-1 text-[10px] font-bold uppercase"
                          >
                            <Pencil size={11} />
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleGrammarDelete(item.id, item.title)}
                            className="inline-flex items-center gap-1 border border-[#141414] px-2 py-1 text-[10px] font-bold uppercase text-[#B91C1C]"
                          >
                            <Trash2 size={11} />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={grammarPageSafe} totalPages={grammarTotalPages} onChange={setGrammarPage} label="Cấu trúc ngữ pháp" />
          </div>
        ) : null}

        {activeTab === 'media' ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setMediaForm({ type: 'Ảnh', name: '', url: '', size: '' })
                  setShowMediaForm((prev) => !prev)
                }}
                className="flex items-center gap-2 border border-[#141414] bg-[#141414] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#F5F0E8] disabled:opacity-50"
              >
                <Plus size={13} />
                Thêm mới
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowMediaImport((prev) => !prev)}
                className="flex items-center gap-2 border border-[#141414] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-50"
              >
                <FileUp size={13} />
                Import CSV
              </button>
            </div>

            {showMediaForm ? (
              <div className="grid grid-cols-1 gap-2 border border-[#141414] bg-[#EFEAE0] p-3 md:grid-cols-[120px_1.2fr_1.5fr_100px_auto]">
                <select
                  value={mediaForm.type}
                  onChange={(e) => setMediaForm((prev) => ({ ...prev, type: e.target.value as 'Ảnh' | 'Âm thanh' }))}
                  className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm"
                >
                  <option value="Ảnh">Ảnh</option>
                  <option value="Âm thanh">Âm thanh</option>
                </select>
                <input
                  value={mediaForm.name}
                  onChange={(e) => setMediaForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Tên file"
                  className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm"
                />
                <input
                  value={mediaForm.url}
                  onChange={(e) => setMediaForm((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="URL file"
                  className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm"
                />
                <input
                  value={mediaForm.size}
                  onChange={(e) => setMediaForm((prev) => ({ ...prev, size: e.target.value }))}
                  placeholder="Size"
                  className="h-9 border border-[#141414] bg-[#F5F0E8] px-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleMediaSubmit}
                  disabled={loading}
                  className="h-9 border border-[#141414] bg-[#141414] px-4 text-[11px] font-black uppercase tracking-[0.12em] text-[#F5F0E8] disabled:opacity-50"
                >
                  {mediaForm.id ? 'Lưu sửa' : 'Tạo mới'}
                </button>
              </div>
            ) : null}

            {showMediaImport ? (
              <div className="space-y-2 border border-[#141414] bg-[#EFEAE0] p-3">
                <p className="text-[11px] font-bold text-[#4B4B4B]">CSV mẫu: type,name,url,size</p>
                <textarea
                  value={mediaCsv}
                  onChange={(e) => setMediaCsv(e.target.value)}
                  rows={6}
                  className="w-full border border-[#141414] bg-[#F5F0E8] p-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleMediaImport}
                  disabled={loading}
                  className="border border-[#141414] bg-[#141414] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#F5F0E8] disabled:opacity-50"
                >
                  Import Media CSV
                </button>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {mediaPaged.map((file) => (
                <article key={file.id} className="border border-[#141414] bg-[#EFEAE0] p-3">
                  <div className="mb-3 grid h-24 place-items-center border border-dashed border-[#141414] bg-[#F5F0E8]">
                    {file.type === 'Ảnh' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={file.url} alt={file.name} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    ) : (
                      <Music2 size={24} />
                    )}
                    {file.type === 'Ảnh' ? <ImageIcon size={18} className="absolute opacity-0" /> : null}
                  </div>
                  <p className="truncate text-xs font-bold uppercase tracking-[0.08em]">{file.name}</p>
                  <p className="mt-1 truncate text-[11px] font-semibold text-[#4B4B4B]">
                    {file.type} - {file.size}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-[#4B4B4B]">{file.url}</p>
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMediaForm({
                          id: file.id,
                          type: file.type,
                          name: file.name,
                          url: file.url,
                          size: file.size === 'N/A' ? '' : file.size,
                        })
                        setShowMediaForm(true)
                      }}
                      className="inline-flex items-center gap-1 border border-[#141414] px-2 py-1 text-[10px] font-bold uppercase"
                    >
                      <Pencil size={11} />
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleMediaDelete(file.id, file.name)}
                      className="inline-flex items-center gap-1 border border-[#141414] px-2 py-1 text-[10px] font-bold uppercase text-[#B91C1C]"
                    >
                      <Trash2 size={11} />
                      Xóa
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <Pager page={mediaPageSafe} totalPages={mediaTotalPages} onChange={setMediaPage} label="Media (3 hàng/trang)" />
          </div>
        ) : null}
      </section>
    </div>
  )
}
