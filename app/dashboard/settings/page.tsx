'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { signOut } from '@/app/actions/auth'
import PricingSelector from '@/components/dashboard/PricingSelector'
import PaymentModal from '@/components/dashboard/PaymentModal'

// ============================================================
// TOAST COMPONENT
// ============================================================
type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-[22px] shadow-clay-card border-2 text-sm font-semibold
            backdrop-blur-sm min-w-[240px] max-w-[340px]
            animate-[slideInRight_0.35s_cubic-bezier(0.34,1.56,0.64,1)_both]
            ${toast.type === 'success' ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' : 
              toast.type === 'error' ? 'bg-red-50/95 border-red-200 text-red-700' :
              'bg-blue-50/95 border-blue-200 text-blue-800'}
            `}
        >
          <span className="text-xl flex-shrink-0">
            {toast.type === 'success' ? '🎉' : toast.type === 'error' ? '⚠️' : 'ℹ️'}
          </span>
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-50 hover:opacity-100 hover:bg-black/10 transition-all"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// SETTINGS PAGE
// ============================================================
interface UserData {
  id: string
  name: string | null
  email: string | null
  image: string | null
  targetLanguage: string
  proficiencyLevel: string
  isPro: boolean
  proType: string | null
  proEndDate: string | null
  lastOrder?: {
    id: string
    createdAt: string
    refundStatus: string
  } | null
}

let toastCounter = 0

export default function SettingsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [userData, setUserData] = useState<UserData>({
    id: '', name: '', email: '', image: null, targetLanguage: 'EN', proficiencyLevel: 'Beginner',
    isPro: false, proType: null, proEndDate: null, lastOrder: null
  })
  const [originalData, setOriginalData] = useState<UserData | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showRefundConfirm, setShowRefundConfirm] = useState(false)
  const [refundData, setRefundData] = useState({
    reason: '',
    bankName: '',
    accountNumber: '',
    accountName: ''
  })
  const [isRefunding, setIsRefunding] = useState(false)
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++toastCounter
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => dismissToast(id), 4000)
  }, [])

  const dismissToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const fetchUser = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/user/me')
      if (res.ok) {
        const data = await res.json()
        const initialData: UserData = {
          id: data.id,
          name: data.name || '',
          email: data.email || '',
          image: data.image || null,
          targetLanguage: data.targetLanguage || 'EN',
          proficiencyLevel: data.proficiencyLevel || 'Beginner',
          isPro: !!data.isPro,
          proType: data.proType || null,
          proEndDate: data.proEndDate || null,
          lastOrder: data.orders?.[0] || null
        }
        setUserData(initialData)
        setOriginalData(initialData)
        setNameInput(data.name || '')
        setAvatarPreview(data.image || null)
      }
    } catch { /* silent */ }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => { fetchUser() }, [fetchUser])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
    setPendingFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let newImageUrl: string | undefined
      if (pendingFile) {
        const formData = new FormData()
        formData.append('file', pendingFile)
        const uploadRes = await fetch('/api/user/upload-avatar', { method: 'POST', body: formData })
        const uploadResult = await uploadRes.json()
        if (!uploadRes.ok) {
          addToast(uploadResult.error || 'Không thể tải ảnh lên', 'error')
          setIsSaving(false)
          return
        }
        newImageUrl = uploadResult.url
        setAvatarPreview(newImageUrl!)
        setUserData(prev => ({ ...prev, image: newImageUrl! }))
        setPendingFile(null)
      }

      const body: any = {}
      if (nameInput.trim() !== originalData?.name) body.name = nameInput.trim()
      if (newImageUrl) body.imageUrl = newImageUrl
      if (userData.targetLanguage !== originalData?.targetLanguage) body.targetLanguage = userData.targetLanguage
      if (userData.proficiencyLevel !== originalData?.proficiencyLevel) body.proficiencyLevel = userData.proficiencyLevel

      if (Object.keys(body).length > 0) {
        const profileRes = await fetch('/api/user/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!profileRes.ok) {
          const err = await profileRes.json()
          addToast(err.error || 'Lỗi máy chủ', 'error')
          setIsSaving(false)
          return
        }
        const result = await profileRes.json()
        setUserData(prev => ({ ...prev, name: result.user.name }))
      }
      addToast('Hồ sơ đã được lưu thành công!', 'success')
      router.refresh()
    } catch (err: any) {
      addToast(err.message || 'Không thể lưu thay đổi', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRequestRefund = async () => {
    if (!userData.lastOrder) return
    if (!refundData.bankName || !refundData.accountNumber || !refundData.accountName) {
      addToast('Vui lòng nhập đầy đủ thông tin ngân hàng', 'error')
      return
    }
    setIsRefunding(true)
    try {
      const res = await fetch('/api/payment/request-refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: userData.lastOrder.id,
          reason: refundData.reason,
          bankName: refundData.bankName,
          accountNumber: refundData.accountNumber,
          accountName: refundData.accountName
        })
      })
      const result = await res.json()
      if (res.ok) {
        addToast(result.message, 'success')
        setShowRefundConfirm(false)
        fetchUser() 
      } else {
        addToast(result.error, 'error')
      }
    } catch {
      addToast('Lỗi gửi yêu cầu hoàn tiền', 'error')
    } finally {
      setIsRefunding(false)
    }
  }

  const canRefund = () => {
    if (!userData.isPro || !userData.lastOrder) return false
    // Chỉ chặn nếu đã yêu cầu hoặc đã xử lý, còn null hoặc NONE thì cho phép
    const status = userData.lastOrder.refundStatus
    if (status && status !== 'NONE' && status !== 'null') return false
    
    const createdAt = new Date(userData.lastOrder.createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - createdAt.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  const displayName = nameInput || userData.name || userData.email?.split('@')[0] || 'Người dùng'
  const initials = displayName.charAt(0).toUpperCase()
  const hasPendingChanges = pendingFile || (nameInput.trim() !== (originalData?.name || '')) || (userData.targetLanguage !== originalData?.targetLanguage) || (userData.proficiencyLevel !== originalData?.proficiencyLevel)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-5">
          <div className="w-20 h-20 bg-clay-cream rounded-full animate-pulse shadow-clay-card" />
          <div className="h-4 w-48 bg-clay-cream rounded-full animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* Header Section */}
        <div className="relative group">
          <div className="h-32 md:h-40 bg-gradient-to-r from-clay-blue/20 via-clay-pink/20 to-clay-orange/20 rounded-[45px] shadow-clay-inset border-4 border-white overflow-hidden" />
          <div className="px-10 -mt-16 flex flex-col md:flex-row items-end md:items-center gap-6">
            <div className="relative cursor-pointer group/avatar" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-8 border-white shadow-clay-card bg-gradient-to-br from-clay-blue to-clay-green flex items-center justify-center overflow-hidden">
                {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-5xl font-heading font-black text-white">{initials}</span>}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-bold uppercase tracking-widest">Đổi ảnh</span>
              </div>
            </div>
            <div className="flex-1 space-y-1 pb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-heading font-black text-clay-deep">{displayName}</h1>
                {userData.isPro ? <span className="px-3 py-1 bg-clay-green/20 text-clay-green text-[10px] font-black uppercase rounded-full border border-clay-green/30">Học viên PRO</span> : <span className="px-3 py-1 bg-clay-muted/20 text-clay-muted text-[10px] font-black uppercase rounded-full border border-clay-shadow/10">Thành viên Free</span>}
              </div>
              <p className="text-clay-muted text-sm font-medium">{userData.email}</p>
            </div>
            <div className="pb-4">
              <button onClick={handleSave} disabled={isSaving} className={`px-8 py-4 font-heading font-black text-sm rounded-[22px] transition-all ${hasPendingChanges && !isSaving ? 'bg-gradient-to-r from-clay-blue to-clay-blue-dark text-white shadow-clay-button hover:scale-105 active:scale-95' : 'bg-white text-clay-muted shadow-clay-pressed border-2 border-clay-cream/50 cursor-not-allowed'}`}>
                {isSaving ? 'Đang lưu...' : hasPendingChanges ? '💾 Lưu thay đổi' : 'Đã lưu'}
              </button>
            </div>
          </div>
        </div>

        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleAvatarChange} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white/90 backdrop-blur-md rounded-[45px] shadow-clay-card border-4 border-white p-8 md:p-12 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[20px] bg-clay-blue/10 flex items-center justify-center text-2xl shadow-clay-button border-2 border-white">👤</div>
                <div><h2 className="text-xl font-heading font-black text-clay-deep">Thông tin chính</h2></div>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-clay-deep uppercase tracking-widest pl-2">Học và tên của bạn</label>
                  <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Tên hiển thị..." className="w-full h-16 px-8 bg-clay-cream/30 rounded-[25px] shadow-clay-inset border-2 border-transparent focus:border-clay-blue/40 focus:outline-none transition-all text-base font-bold text-clay-deep" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-clay-deep uppercase tracking-widest pl-2">Ngôn ngữ mục tiêu</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[{ code: 'EN', f: '🇬🇧', n: 'Tiếng Anh' }, { code: 'CN', f: '🇨🇳', n: 'Tiếng Trung' }, { code: 'JP', f: '🇯🇵', n: 'Tiếng Nhật' }].map(l => (
                      <button key={l.code} onClick={() => setUserData(p => ({...p, targetLanguage: l.code}))} className={`flex flex-col items-center gap-3 py-6 rounded-[30px] border-2 transition-all duration-300 ${userData.targetLanguage === l.code ? 'bg-clay-blue/10 border-clay-blue/40 text-clay-blue shadow-clay-pressed' : 'bg-white shadow-clay-button border-white hover:border-clay-blue/20 hover:scale-[1.02]'}`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-clay-button border-2 border-white ${userData.targetLanguage === l.code ? 'bg-white' : 'bg-clay-cream/50'}`}>{l.f}</div>
                        <p className="text-xs font-heading font-black uppercase">{l.n}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {userData.isPro ? (
              /* PRO Membership Card */
              <div className="bg-gradient-to-br from-clay-deep to-clay-brown-dark rounded-[45px] shadow-clay-card border-4 border-white/10 p-8 md:p-10 text-white relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">💎</div>
                    <h3 className="text-xl font-heading font-black mb-2 tracking-tight">Gói PRO Đang Hoạt Động</h3>
                    <div className="space-y-2 mb-8">
                        <div className="flex justify-between items-center bg-black/10 backdrop-blur-sm rounded-[20px] px-5 py-4 border border-white/5 group/row hover:bg-black/20 transition-all">
                            <span className="text-[9px] font-heading font-black text-white/40 uppercase tracking-[0.2em]">Mã đơn hàng</span>
                            {/* @ts-ignore */}
                            <span className="text-[12px] font-heading font-black text-clay-orange tracking-tight">#{userData.lastOrder?.orderCode || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center bg-black/10 backdrop-blur-sm rounded-[20px] px-5 py-4 border border-white/5 group/row hover:bg-black/20 transition-all">
                            <span className="text-[9px] font-heading font-black text-white/40 uppercase tracking-[0.2em]">Hạn dùng đến</span>
                            <span className="text-[12px] font-heading font-black text-white tracking-tight">{userData.proEndDate ? new Date(userData.proEndDate).toLocaleDateString('vi-VN') : 'Vĩnh viễn'}</span>
                        </div>
                    </div>

                    {/* Refund Logic */}
                    {userData.lastOrder?.refundStatus === 'PENDING' ? (
                      <div className="bg-clay-orange/20 border-2 border-clay-orange/40 p-4 rounded-[25px] text-center shadow-lg backdrop-blur-md">
                        <p className="text-[10px] font-heading font-black text-clay-orange uppercase tracking-widest animate-pulse">Đang xử lý hoàn tiền ⏳</p>
                      </div>
                    ) : canRefund() ? (
                      <button 
                        onClick={() => setShowRefundConfirm(true)}
                        className="w-full py-4.5 bg-white/10 hover:bg-white/90 border-2 border-white/20 hover:border-white rounded-[25px] text-[10px] font-heading font-black text-white hover:text-clay-deep uppercase tracking-[0.15em] transition-all duration-300 shadow-lg relative overflow-hidden group/btn"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                        <span className="relative flex items-center justify-center gap-2">
                           <span className="text-sm">🛡️</span> Yêu cầu hoàn tiền
                        </span>
                      </button>
                    ) : null}
                  </div>
              </div>
            ) : (
              /* FREE Membership Card */
              <div className="space-y-8">
                <div className="bg-white/90 backdrop-blur-md rounded-[45px] shadow-clay-card border-4 border-white p-8 md:p-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-clay-green/10 rounded-full -mr-10 -mt-10 blur-2xl transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-clay-green/10 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-clay-inset border-2 border-white">🌱</div>
                    <h3 className="text-xl font-heading font-black text-clay-deep mb-2 tracking-tight">Gói Hiện Tại: FREE</h3>
                    <p className="text-xs text-clay-muted mb-6 leading-relaxed font-medium">Bạn đang sử dụng các tính năng cơ bản. Nâng cấp lên PRO để mở khóa toàn bộ sức mạnh AI.</p>
                    
                    <div className="bg-clay-cream/50 rounded-[22px] p-4 border-2 border-white border-dashed text-center">
                        <p className="text-[10px] font-black text-clay-muted uppercase tracking-widest">Giới hạn hàng ngày đang active</p>
                    </div>
                  </div>
                </div>

                <PricingSelector onUpgrade={(plan) => { setSelectedPlan(plan); setIsPaymentModalOpen(true); }} />
              </div>
            )}

            <div className="bg-white/90 backdrop-blur-md rounded-[45px] shadow-clay-card border-4 border-white p-8 space-y-6 text-center">
                <button onClick={() => setShowLogoutConfirm(true)} className="w-full py-4 bg-red-50 text-red-500 font-heading font-black text-sm rounded-[22px] shadow-clay-button hover:bg-red-500 hover:text-white transition-all duration-300 border-2 border-red-100">Đăng xuất tài khoản</button>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} plan={selectedPlan} userId={userData.id} />

      {/* Refund Confirmation Modal */}
      {showRefundConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[45px] shadow-clay-card border-4 border-white p-10 max-w-md w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-clay-orange/10 rounded-full flex items-center justify-center text-3xl mx-auto shadow-clay-inset">💸</div>
              <h3 className="text-xl font-heading font-black text-clay-deep">Yêu cầu hoàn tiền</h3>
              <p className="text-sm text-clay-muted font-medium">Chúng tôi rất tiếc khi bạn không hài lòng. Hãy cho chúng tôi biết lý do để cải thiện nhé.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-clay-deep uppercase tracking-widest pl-2">Lý do hoàn tiền</label>
                <textarea 
                  value={refundData.reason}
                  onChange={(e) => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Hãy cho chúng tôi biết lý do..."
                  className="w-full p-5 bg-clay-cream/30 rounded-[22px] shadow-clay-inset border-2 border-transparent focus:border-clay-orange/40 focus:outline-none min-h-[100px] text-sm font-bold"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-clay-deep uppercase tracking-widest pl-2">Ngân hàng</label>
                  <input 
                    type="text"
                    value={refundData.bankName}
                    onChange={(e) => setRefundData(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="VD: Vietcombank, MB..."
                    className="w-full p-4 bg-clay-cream/30 rounded-[18px] shadow-clay-inset border-2 border-transparent focus:border-clay-blue/40 focus:outline-none text-xs font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-clay-deep uppercase tracking-widest pl-2">Số tài khoản</label>
                  <input 
                    type="text"
                    value={refundData.accountNumber}
                    onChange={(e) => setRefundData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full p-4 bg-clay-cream/30 rounded-[18px] shadow-clay-inset border-2 border-transparent focus:border-clay-blue/40 focus:outline-none text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-clay-deep uppercase tracking-widest pl-2">Tên chủ tài khoản</label>
                <input 
                  type="text"
                  value={refundData.accountName}
                  onChange={(e) => setRefundData(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="NGUYEN VAN A"
                  className="w-full p-4 bg-clay-cream/30 rounded-[18px] shadow-clay-inset border-2 border-transparent focus:border-clay-blue/40 focus:outline-none text-xs font-bold uppercase"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setShowRefundConfirm(false)} className="flex-1 py-4 bg-clay-cream rounded-[20px] font-black text-xs uppercase shadow-clay-button">Hủy</button>
              <button 
                onClick={handleRequestRefund}
                disabled={isRefunding || !refundData.reason.trim() || !refundData.bankName || !refundData.accountNumber || !refundData.accountName}
                className="flex-1 py-4 bg-clay-orange text-white rounded-[20px] font-black text-xs uppercase shadow-clay-button disabled:opacity-50"
              >
                {isRefunding ? 'Đang gửi...' : 'Gửi yêu cầu 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={showLogoutConfirm} title="Đăng xuất" message="Bạn có chắc chắn muốn đăng xuất khỏi LinguaClay không?" onConfirm={async () => { setShowLogoutConfirm(false); await signOut(); }} onCancel={() => setShowLogoutConfirm(false)} confirmText="Đăng xuất" danger />
    </>
  )
}
