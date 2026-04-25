'use client'

import { useMemo, useState } from 'react'
import { AdminConfirmToast, AdminToastStack, useAdminConfirm, useAdminToast } from '../_components/admin-toast'
import { CEFR_LEVELS } from '@/lib/levels'
import { 
  FlashcardSetView, 
  FlashcardTabAction,
  GrammarItemView, 
  GrammarTabAction,
  MediaItemView, 
  MediaTabAction,
  StudyTab 
} from './ui-client-types'
import FlashcardTab from './_components/FlashcardTab'
import GrammarTab from './_components/GrammarTab'
import MediaTab from './_components/MediaTab'

type Props = {
  flashcardSets: FlashcardSetView[]
  grammarRows: GrammarItemView[]
  mediaItems: MediaItemView[]
}

type FlashcardForm = { id?: string; topic: string; level: string }
type GrammarForm = { id?: string; title: string; level: string; structure: string }
type MediaForm = { id?: string; type: 'Ảnh' | 'Âm thanh'; name: string; url: string; size: string }

export function HocLieuClient({ flashcardSets, grammarRows, mediaItems }: Props) {
  const [activeTab, setActiveTab] = useState<StudyTab>('flashcard')
  const [flashcardSetsState, setFlashcardSetsState] = useState<FlashcardSetView[]>(flashcardSets)
  const [grammarRowsState, setGrammarRowsState] = useState<GrammarItemView[]>(grammarRows)
  const [mediaItemsState, setMediaItemsState] = useState<MediaItemView[]>(mediaItems)
  const [selectedSetId, setSelectedSetId] = useState(flashcardSets[0]?.id ?? '')
  const [loading, setLoading] = useState(false)

  // Modals & Forms State
  const [showFlashForm, setShowFlashForm] = useState(false)
  const [showFlashImport, setShowFlashImport] = useState(false)
  const [flashForm, setFlashForm] = useState<FlashcardForm>({ topic: '', level: 'A1' })
  const [flashCsv, setFlashCsv] = useState('')

  const [showGrammarForm, setShowGrammarForm] = useState(false)
  const [showGrammarImport, setShowGrammarImport] = useState(false)
  const [grammarForm, setGrammarForm] = useState<GrammarForm>({ title: '', level: 'A1', structure: '' })
  const [grammarCsv, setGrammarCsv] = useState('')

  const [showMediaForm, setShowMediaForm] = useState(false)
  const [showMediaImport, setShowMediaImport] = useState(false)
  const [mediaForm, setMediaForm] = useState<MediaForm>({ type: 'Ảnh', name: '', url: '', size: '' })
  const [mediaCsv, setMediaCsv] = useState('')

  const { toasts, showToast } = useAdminToast()
  const { confirm, requestConfirm, confirmYes, confirmNo } = useAdminConfirm()

  const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Yêu cầu thất bại')

  const selectedSet = useMemo(
    () => flashcardSetsState.find((x) => x.id === selectedSetId) ?? flashcardSetsState[0],
    [selectedSetId, flashcardSetsState]
  )

  // ─── Helpers ─────────────────────────────────────────────────────────────
  
  async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init)
    const data = (await res.json()) as T & { error?: string; ok?: boolean }
    if (!res.ok || (typeof data.ok === 'boolean' && !data.ok)) {
      throw new Error(data.error || 'Yêu cầu thất bại')
    }
    return data
  }

  const refreshData = {
    flashcards: async () => {
      const data = await fetchJson<{ ok: true; sets: FlashcardSetView[] }>('/api/admin/materials/flashcards')
      setFlashcardSetsState(data.sets)
    },
    grammar: async () => {
      const data = await fetchJson<{ ok: true; rows: GrammarItemView[] }>('/api/admin/materials/grammar')
      setGrammarRowsState(data.rows)
    },
    media: async () => {
      const data = await fetchJson<{ ok: true; rows: MediaItemView[] }>('/api/admin/materials/media')
      setMediaItemsState(data.rows)
    }
  }

  // ─── Action Handlers ─────────────────────────────────────────────────────

  const handleFlashcardAction = async (action: FlashcardTabAction) => {
    switch (action.type) {
      case 'open_create':
        setFlashForm({ topic: '', level: 'A1' })
        setShowFlashForm(true)
        break
      case 'open_edit':
        setFlashForm({ id: action.set.id, topic: action.set.topic, level: action.set.level })
        setShowFlashForm(true)
        break
      case 'open_import_csv':
        setShowFlashImport(true)
        break
      case 'view_words':
        setSelectedSetId(action.set.id)
        break
      case 'delete':
        const ok = await requestConfirm(`Xóa bộ học liệu "${action.set?.topic || ''}"?`)
        if (ok) {
          setLoading(true)
          try {
            await fetchJson('/api/admin/materials/flashcards', {
              method: 'POST',
              body: JSON.stringify({ action: 'delete', id: action.id }),
            })
            showToast('Đã xóa bộ học liệu.', 'success')
            await refreshData.flashcards()
          } catch (e: unknown) { showToast(getErrorMessage(e), 'error') }
          finally { setLoading(false) }
        }
        break
    }
  }

  const handleGrammarAction = async (action: GrammarTabAction) => {
    switch (action.type) {
      case 'open_create':
        setGrammarForm({ title: '', level: 'A1', structure: '' })
        setShowGrammarForm(true)
        break
      case 'open_edit':
        setGrammarForm({ id: action.row.id, title: action.row.title, level: action.row.level, structure: action.row.structure })
        setShowGrammarForm(true)
        break
      case 'delete':
        const ok = await requestConfirm(`Xóa bài ngữ pháp "${action.title}"?`)
        if (ok) {
          setLoading(true)
          try {
            await fetchJson('/api/admin/materials/grammar', {
              method: 'POST',
              body: JSON.stringify({ action: 'delete', id: action.id }),
            })
            showToast('Đã xóa bài ngữ pháp.', 'success')
            await refreshData.grammar()
          } catch (e: unknown) { showToast(getErrorMessage(e), 'error') }
          finally { setLoading(false) }
        }
        break
    }
  }

  const handleMediaAction = async (action: MediaTabAction) => {
     switch (action.type) {
      case 'open_create':
        setMediaForm({ type: 'Ảnh', name: '', url: '', size: '' })
        setShowMediaForm(true)
        break
      case 'open_edit':
        setMediaForm({ id: action.file.id, type: action.file.type, name: action.file.name, url: action.file.url, size: action.file.size === 'N/A' ? '' : action.file.size })
        setShowMediaForm(true)
        break
      case 'delete':
        const ok = await requestConfirm(`Xóa media "${action.name}"?`)
        if (ok) {
          setLoading(true)
          try {
            await fetchJson('/api/admin/materials/media', {
              method: 'POST',
              body: JSON.stringify({ action: 'delete', id: action.id }),
            })
            showToast('Đã xóa media.', 'success')
            await refreshData.media()
          } catch (e: unknown) { showToast(getErrorMessage(e), 'error') }
          finally { setLoading(false) }
        }
        break
    }
  }

  // ─── Native Submit Logic (Keeping in main for simplicity) ────────────────
  
  async function handleFlashcardSubmit() {
    setLoading(true)
    try {
      await fetchJson('/api/admin/materials/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: flashForm.id ? 'update' : 'create', ...flashForm }),
      })
      showToast(flashForm.id ? 'Cập nhật thành công.' : 'Tạo mới thành công.', 'success')
      setShowFlashForm(false)
      await refreshData.flashcards()
    } catch (e: unknown) { showToast(getErrorMessage(e), 'error') }
    finally { setLoading(false) }
  }

  async function handleFlashcardImport() {
    if (!flashCsv.trim()) return
    setLoading(true)
    try {
      await fetchJson('/api/admin/materials/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import_csv', csvText: flashCsv }),
      })
      showToast('Import thành công.', 'success')
      setFlashCsv('')
      setShowFlashImport(false)
      await refreshData.flashcards()
    } catch (e: unknown) { showToast(getErrorMessage(e), 'error') }
    finally { setLoading(false) }
  }

  // Grammar sub-handlers
  async function handleGrammarSubmit() {
    setLoading(true)
    try {
      await fetchJson('/api/admin/materials/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: grammarForm.id ? 'update' : 'create', ...grammarForm }),
      })
      showToast(grammarForm.id ? 'Cập nhật thành công.' : 'Tạo mới thành công.', 'success')
      setShowGrammarForm(false)
      await refreshData.grammar()
    } catch (e: unknown) { showToast(getErrorMessage(e), 'error') }
    finally { setLoading(false) }
  }

  // Media sub-handlers
  async function handleMediaSubmit() {
    setLoading(true)
    try {
      await fetchJson('/api/admin/materials/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: mediaForm.id ? 'update' : 'create', ...mediaForm }),
      })
      showToast(mediaForm.id ? 'Cập nhật thành công.' : 'Tạo mới thành công.', 'success')
      setShowMediaForm(false)
      await refreshData.media()
    } catch (e: unknown) { showToast(getErrorMessage(e), 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-8 pb-10">
      <AdminToastStack toasts={toasts} />
      <AdminConfirmToast confirm={confirm} onConfirm={confirmYes} onCancel={confirmNo} />

      {/* Tabs */}
      <div className="flex border-[2px] border-[#141414] bg-white shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
        {(['flashcard', 'grammar', 'media'] as StudyTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-[#141414] text-white' : 'hover:bg-[#F5F0E8] text-[#141414]'
            }`}
          >
            {tab === 'flashcard' ? 'Flashcard' : tab === 'grammar' ? 'Ngữ pháp' : 'Media'}
          </button>
        ))}
      </div>

      <section className="min-h-[600px] animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'flashcard' && (
          <FlashcardTab sets={flashcardSetsState} onAction={handleFlashcardAction} />
        )}
        {activeTab === 'grammar' && (
          <GrammarTab rows={grammarRowsState} onAction={handleGrammarAction} />
        )}
        {activeTab === 'media' && (
          <MediaTab items={mediaItemsState} onAction={handleMediaAction} />
        )}
      </section>

      {/* ─── Shared Modals ─── */}

      {/* Flashcard Modal */}
      {showFlashForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border-[2px] border-[#141414] bg-white p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            <h3 className="mb-4 text-lg font-black uppercase tracking-tight">{flashForm.id ? 'Sửa chủ đề' : 'Thêm chủ đề'}</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Tên chủ đề</label>
                <input 
                  value={flashForm.topic} 
                  onChange={(e) => setFlashForm(p => ({...p, topic: e.target.value}))}
                  className="w-full border-[2px] border-[#141414] bg-[#F5F0E8] px-3 py-2 font-serif font-bold focus:outline-none" 
                  placeholder="Vd: Travel, Food..."
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Trình độ</label>
                <select 
                  value={flashForm.level} 
                  onChange={(e) => setFlashForm(p => ({...p, level: e.target.value}))}
                  className="w-full border-[2px] border-[#141414] bg-[#F5F0E8] px-3 py-2 font-bold focus:outline-none"
                >
                  {CEFR_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleFlashcardSubmit}
                  disabled={loading}
                  className="flex-1 border-[2px] border-[#141414] bg-[#141414] py-3 text-[11px] font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50"
                >
                  Lưu
                </button>
                <button 
                  onClick={() => setShowFlashForm(false)}
                  className="flex-1 border-[2px] border-[#141414] bg-white py-3 text-[11px] font-black uppercase tracking-widest hover:bg-[#F5F0E8]"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal (Simple Version) */}
      {showFlashImport && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg border-[2px] border-[#141414] bg-white p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            <h3 className="mb-2 text-lg font-black uppercase tracking-tight">Import Flashcards</h3>
            <p className="mb-4 text-[11px] font-bold text-[#4B4B4B] uppercase tracking-widest">Định dạng CSV: topic, term, definition, example, pronunciation</p>
            <textarea 
              value={flashCsv}
              onChange={(e) => setFlashCsv(e.target.value)}
              className="mb-4 h-64 w-full border-[2px] border-[#141414] bg-[#F5F0E8] p-4 text-sm font-medium focus:outline-none"
              placeholder="Topic,Word,Definition,..."
            />
            <div className="flex gap-3">
              <button 
                onClick={handleFlashcardImport}
                disabled={loading}
                className="flex-1 border-[2px] border-[#141414] bg-[#141414] py-3 text-[11px] font-black uppercase tracking-widest text-white disabled:opacity-50"
              >
                Import
              </button>
              <button onClick={() => setShowFlashImport(false)} className="flex-1 border-[2px] border-[#141414] bg-white py-3 text-[11px] font-black uppercase tracking-widest">Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Grammar Form Modal (Simple) */}
       {showGrammarForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border-[2px] border-[#141414] bg-white p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            <h3 className="mb-4 text-lg font-black uppercase tracking-tight">{grammarForm.id ? 'Sửa ngữ pháp' : 'Thêm ngữ pháp'}</h3>
            <div className="space-y-4">
               <div>
                <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Cấu trúc (VD: S + V)</label>
                <input 
                  value={grammarForm.structure} 
                  onChange={(e) => setGrammarForm(p => ({...p, structure: e.target.value}))}
                  className="w-full border-[2px] border-[#141414] bg-[#F5F0E8] px-3 py-2 font-mono font-bold focus:outline-none" 
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Tiêu đề bài học</label>
                <input 
                  value={grammarForm.title} 
                  onChange={(e) => setGrammarForm(p => ({...p, title: e.target.value}))}
                  className="w-full border-[2px] border-[#141414] bg-[#F5F0E8] px-3 py-2 font-bold focus:outline-none" 
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Trình độ</label>
                <select 
                  value={grammarForm.level} 
                  onChange={(e) => setGrammarForm(p => ({...p, level: e.target.value}))}
                  className="w-full border-[2px] border-[#141414] bg-[#F5F0E8] px-3 py-2 font-bold focus:outline-none"
                >
                  {CEFR_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleGrammarSubmit} disabled={loading} className="flex-1 border-[2px] border-[#141414] bg-[#141414] py-3 text-[11px] font-black uppercase tracking-widest text-white disabled:opacity-50">Lưu</button>
                <button onClick={() => setShowGrammarForm(false)} className="flex-1 border-[2px] border-[#141414] bg-white py-3 text-[11px] font-black uppercase tracking-widest">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Form Modal */}
      {showMediaForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border-[2px] border-[#141414] bg-white p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
             <h3 className="mb-4 text-lg font-black uppercase tracking-tight">{mediaForm.id ? 'Sửa Media' : 'Thêm Media'}</h3>
             <div className="space-y-4">
                <div className="flex gap-3">
                  {(['Ảnh', 'Âm thanh'] as const).map(t => (
                    <button key={t} onClick={() => setMediaForm(p => ({...p, type: t}))} className={`flex-1 py-2 text-[10px] font-black border-[2px] border-[#141414] uppercase ${mediaForm.type === t ? 'bg-[#141414] text-white' : 'bg-[#F5F0E8]'}`}>{t}</button>
                  ))}
                </div>
                <input value={mediaForm.name} onChange={e => setMediaForm(p => ({...p, name: e.target.value}))} placeholder="Tên tệp" className="w-full border-[2px] border-[#141414] bg-[#F5F0E8] px-3 py-2 text-sm" />
                <input value={mediaForm.url} onChange={e => setMediaForm(p => ({...p, url: e.target.value}))} placeholder="URL (HTTPS)" className="w-full border-[2px] border-[#141414] bg-[#F5F0E8] px-3 py-2 text-sm" />
                <input value={mediaForm.size} onChange={e => setMediaForm(p => ({...p, size: e.target.value}))} placeholder="Dung lượng (VD: 200KB)" className="w-full border-[2px] border-[#141414] bg-[#F5F0E8] px-3 py-2 text-sm" />
                <div className="flex gap-3">
                  <button onClick={handleMediaSubmit} disabled={loading} className="flex-1 border-[2px] border-[#141414] bg-[#141414] py-3 text-[11px] font-black uppercase tracking-widest text-white disabled:opacity-50">Lưu</button>
                  <button onClick={() => setShowMediaForm(false)} className="flex-1 border-[2px] border-[#141414] bg-white py-3 text-[11px] font-black uppercase tracking-widest">Hủy</button>
                </div>
             </div>
          </div>
        </div>
      )}

    </div>
  )
}
