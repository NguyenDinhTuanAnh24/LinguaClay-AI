'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { signOut } from '@/app/actions/auth'
import PricingSelector from '@/components/dashboard/PricingSelector'
import PaymentModal from '@/components/dashboard/PaymentModal'
import { 
  Phone, 
  Calendar, 
  Mail, 
  Globe, 
  Shield, 
  Clock, 
  LogOut, 
  ChevronRight, 
  Check, 
  User, 
  Languages, 
  Crown, 
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info as InfoIcon,
  Zap,
  Target,
  ReceiptText
} from 'lucide-react'

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
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none dashboard-theme font-sans">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-4 px-6 py-5 border-[3px] border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] text-[11px] font-black uppercase tracking-widest
            backdrop-blur-md min-w-[280px] max-w-[400px]
            animate-in slide-in-from-right-10 duration-300
            ${toast.type === 'success' ? 'bg-white text-[#141414]' : 
              toast.type === 'error' ? 'bg-[#141414] text-white' :
              'bg-[#F5F0E8] text-[#141414]'}
            `}
        >
          <span className="flex-shrink-0">
            {toast.type === 'success' ? <CheckCircle size={20} /> : 
             toast.type === 'error' ? <AlertCircle size={20} /> : 
             <InfoIcon size={20} />}
          </span>
          <span className="flex-1 leading-tight vietnamese-text">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 w-8 h-8 border-[2px] border-[#141414]/10 flex items-center justify-center font-black hover:bg-[#141414]/5 transition-all"
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
  phoneNumber: string | null
  birthday: string | null
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
    id: '', name: '', email: '', image: null, phoneNumber: '', birthday: '',
    targetLanguage: 'EN', proficiencyLevel: 'Beginner',
    isPro: false, proType: null, proEndDate: null, lastOrder: null
  })
  const [originalData, setOriginalData] = useState<UserData | null>(null)
  
  // Input states
  const [nameInput, setNameInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [birthdayInput, setBirthdayInput] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showRefundConfirm, setShowRefundConfirm] = useState(false)
  const [showPricing, setShowPricing] = useState(false)

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
          phoneNumber: data.phoneNumber || '',
          birthday: data.birthday ? new Date(data.birthday).toISOString().split('T')[0] : '',
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
        setPhoneInput(data.phoneNumber || '')
        setBirthdayInput(data.birthday ? new Date(data.birthday).toISOString().split('T')[0] : '')
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
      }

      const body: any = {}
      if (nameInput.trim() !== originalData?.name) body.name = nameInput.trim()
      if (phoneInput.trim() !== (originalData?.phoneNumber || '')) body.phoneNumber = phoneInput.trim()
      if (birthdayInput !== (originalData?.birthday || '')) body.birthday = birthdayInput
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
        await fetchUser() // Refresh data
      }
      addToast('Cập nhật hồ sơ thành công!', 'success')
      router.refresh()
    } catch (err: any) {
      addToast(err.message || 'Không thể lưu thay đổi', 'error')
    } finally {
      setIsSaving(false)
      setPendingFile(null)
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
    const status = userData.lastOrder.refundStatus
    if (status && status !== 'NONE' && status !== 'null') return false
    const createdAt = new Date(userData.lastOrder.createdAt)
    const diffTime = Math.abs(new Date().getTime() - createdAt.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 7
  }

  const displayName = nameInput || userData.name || userData.email?.split('@')[0] || 'Người dùng'
  const initials = displayName.charAt(0).toUpperCase()
  
  const hasPendingChanges = pendingFile 
    || (nameInput.trim() !== (originalData?.name || ''))
    || (phoneInput.trim() !== (originalData?.phoneNumber || ''))
    || (birthdayInput !== (originalData?.birthday || ''))
    || (userData.targetLanguage !== (originalData?.targetLanguage || ''))
    || (userData.proficiencyLevel !== (originalData?.proficiencyLevel || ''))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-5">
          <div className="w-20 h-20 bg-[#F5F0E8] border-[3px] border-[#141414] animate-pulse" />
          <div className="h-4 w-48 bg-[#141414]/10 rounded-full animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="w-full space-y-10 pb-24 dashboard-theme font-sans">
        
        {/* Profile Header Block */}
        <div className="relative">
          <div className="h-20 md:h-28 bg-[#141414] border-[4px] border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,0.1)] overflow-hidden relative">
            <div 
              className="absolute inset-0 opacity-20"
              style={{ 
                backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', 
                backgroundSize: '16px 16px' 
              }} 
            />
          </div>
          
          <div className="px-6 md:px-10 -mt-12 md:-mt-16 flex flex-col md:flex-row items-center md:items-end gap-6 relative z-20">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-28 h-28 md:w-36 md:h-36 bg-white border-[6px] border-[#141414] shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] flex items-center justify-center overflow-hidden transition-all group-hover:scale-[1.02] group-active:scale-[0.98]">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-serif font-black text-[#141414]">{initials}</span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-[9px] font-black uppercase tracking-[0.2em]">ĐỔI ẢNH</span>
              </div>
            </div>

            <div className="w-full md:flex-1 pb-2 text-center md:text-left">
              <div className={`inline-flex items-center gap-2 border-[2px] border-[#141414] px-3 py-1 font-black text-[9px] uppercase tracking-[0.2em] mb-2 leading-none shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] ${
                userData.isPro ? 'bg-[#FFD700] text-[#141414]' : 'bg-[#141414] text-white'
              }`}>
                <Crown size={10} className={userData.isPro ? 'text-[#141414]' : 'text-yellow-400'} /> 
                {userData.isPro ? 'PRO MEMBER' : 'FREE MEMBER'}
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-black text-[#141414] uppercase tracking-tighter leading-none vietnamese-text">
                {displayName}
              </h1>
            </div>

            <div className="pb-2">
              <button 
                onClick={handleSave} 
                disabled={isSaving} 
                className={`px-8 py-4 font-black text-[11px] uppercase tracking-[0.2em] border-[3px] transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
                  hasPendingChanges && !isSaving 
                    ? 'bg-[#141414] text-white border-[#141414] hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none' 
                    : 'bg-white text-[#141414]/10 border-[#141414]/10 cursor-not-allowed shadow-none'
                }`}
              >
                {isSaving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
              </button>
            </div>
          </div>
        </div>

        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleAvatarChange} />

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          
          {/* Main Info Column */}
          <div className="space-y-10">
            <div className="bg-[#F5F0E8] border-[3px] border-[#141414] p-10 space-y-10 transition-all duration-300 hover:shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1">
              <div className="flex items-center gap-4 border-b-[2px] border-[#141414] pb-6">
                <div className="w-12 h-12 bg-white border-[3px] border-[#141414] flex items-center justify-center text-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] -rotate-2">
                  <User size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-black text-[#141414] uppercase tracking-tight">THÔNG TIN CHÍNH</h2>
                  <p className="text-[9px] font-bold text-[#4B4B4B] uppercase tracking-[0.2em]">Account Profile & Identification</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#141414] uppercase tracking-[0.2em] flex items-center gap-2">
                    <User size={12} className="text-[#4B4B4B]" /> HỌ VÀ TÊN
                  </label>
                  <input 
                    type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                    className="w-full h-14 px-6 bg-white border-[3px] border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] focus:-translate-y-0.5 outline-none transition-all font-bold text-[#141414] placeholder:text-[#4B4B4B]/30" 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#141414] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Phone size={12} className="text-[#4B4B4B]" /> SỐ ĐIỆN THOẠI
                  </label>
                  <input 
                    type="tel" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="09xx xxx xxx"
                    className="w-full h-14 px-6 bg-white border-[3px] border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] focus:-translate-y-0.5 outline-none transition-all font-mono font-bold text-[#141414] placeholder:text-[#4B4B4B]/30" 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#141414] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Mail size={12} className="text-[#4B4B4B]" /> EMAIL (GỐC)
                  </label>
                  <input 
                    type="text" value={userData.email || ''} readOnly
                    className="w-full h-14 px-6 bg-[#EDE8DF] border-[3px] border-[#141414]/20 text-[#4B4B4B]/60 font-bold outline-none cursor-not-allowed font-mono text-xs" 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#141414] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Calendar size={12} className="text-[#4B4B4B]" /> NGÀY SINH
                  </label>
                  <input 
                    type="date" value={birthdayInput} onChange={(e) => setBirthdayInput(e.target.value)}
                    className="w-full h-14 px-6 bg-white border-[3px] border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] focus:-translate-y-0.5 outline-none transition-all font-mono font-bold text-[#141414]" 
                  />
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <div className="bg-[#F5F0E8] border-[3px] border-[#141414] p-10 space-y-8 transition-all duration-300 hover:shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1">
               <div className="flex items-center justify-between border-b-[2px] border-[#141414] pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border-[3px] border-[#141414] flex items-center justify-center text-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] rotate-2">
                    <Languages size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-black text-[#141414] uppercase tracking-tight">NGÔN NGỮ HỌC</h2>
                    <p className="text-[9px] font-bold text-[#4B4B4B] uppercase tracking-[0.2em]">Select Target Language</p>
                  </div>
                </div>
                <button className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#141414] hover:underline group leading-none">
                  Xem thêm <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-5">
                {[
                  { code: 'EN', f: 'GB', n: 'Tiếng Anh' }, 
                  { code: 'CN', f: 'CN', n: 'Tiếng Trung' },
                ].map(l => (
                  <button 
                    key={l.code} 
                    onClick={() => setUserData(p => ({...p, targetLanguage: l.code}))} 
                    className={`flex flex-col items-center gap-4 py-10 border-[3px] transition-all relative group overflow-hidden
                      ${userData.targetLanguage === l.code 
                        ? 'bg-[#141414] text-white border-[#141414] shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] scale-[1.02] z-10' 
                        : 'bg-white text-[#141414] border-[#141414] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,0.1)] hover:bg-[#F5F0E8]'}`}
                  >
                    <div className={`w-14 h-10 flex items-center justify-center border-2 font-mono font-black text-xs ${userData.targetLanguage === l.code ? 'border-white/20' : 'border-[#141414]/10'}`}>
                      {l.f}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{l.n}</span>
                    {userData.targetLanguage === l.code && (
                      <div className="absolute top-1 right-1">
                        <div className="w-5 h-5 bg-white text-[#141414] rounded-full flex items-center justify-center border border-[#141414]">
                          <Check size={10} strokeWidth={4} />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Billing & Plans Section - Moved here */}
            <div className="bg-[#F5F0E8] border-[3px] border-[#141414] p-10 space-y-8 transition-all duration-300 hover:shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1">
               <div className="flex items-center gap-4 border-b-[2px] border-[#141414] pb-6">
                  <div className="w-12 h-12 bg-white border-[3px] border-[#141414] flex items-center justify-center text-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] rotate-1">
                    <ReceiptText size={20} className="text-[#141414]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-black text-[#141414] uppercase tracking-tight">QUẢN LÝ GIAO DỊCH</h2>
                    <p className="text-[9px] font-bold text-[#4B4B4B] uppercase tracking-[0.2em]">Billing & History</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link 
                    href="/dashboard/plans"
                    className="flex items-center justify-between p-5 bg-white border-[3px] border-[#141414] hover:bg-[#F5F0E8] transition-all group shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  >
                    <div className="flex items-center gap-3">
                      <Zap size={18} className="text-yellow-500" />
                      <span className="text-xs font-black uppercase tracking-widest text-[#141414]">Xem các gói học</span>
                    </div>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link 
                    href="/dashboard/payments/history"
                    className="flex items-center justify-between p-5 bg-white border-[3px] border-[#141414] hover:bg-[#F5F0E8] transition-all group shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  >
                    <div className="flex items-center gap-3">
                      <ReceiptText size={18} className="text-blue-500" />
                      <span className="text-xs font-black uppercase tracking-widest text-[#141414]">Lịch sử thanh toán</span>
                    </div>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>
          </div>

          {/* Right Statistics / Pricing Column */}
          <div className="space-y-10">
            
            {/* Studied Today Timer Card */}
            <div className="bg-[#141414] text-white border-[3px] border-[#141414] p-10 shadow-[8px_8px_0px_0px_rgba(20,20,20,0.1)] relative overflow-hidden transition-all duration-300 hover:shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1 group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-3xl rounded-full transition-transform group-hover:scale-150" />
               <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 border border-white/20 flex items-center justify-center rounded-sm">
                    <Clock size={16} className="text-red-500" />
                  </div>
                  <span className="text-[12px] font-black uppercase tracking-[0.3em] text-white">ĐÃ HỌC HÔM NAY</span>
                </div>
                <div>
                   <h3 className="text-6xl font-mono font-black tracking-tighter tabular-nums transition-transform group-hover:scale-[1.02] text-white">02:15:25</h3>
                   <div className="mt-6 flex items-center gap-4">
                      <div className="flex-1 h-3 bg-white/10 overflow-hidden rounded-full p-[1px] border border-white/5">
                         <div className="w-[75%] h-full bg-red-600 rounded-full" />
                      </div>
                      <span className="text-[14px] font-black text-white tabular-nums">75%</span>
                   </div>
                   <div className="mt-3 flex items-center gap-2 text-[11px] font-black uppercase text-white/70 tracking-[0.2em] font-mono">
                      <Target size={14} className="text-red-500" /> 2.2H / 3.0H MỤC TIÊU HOÀN THÀNH
                   </div>
                </div>
               </div>
            </div>

            {/* Simplified Pro Card */}
            <div className="bg-white border-[3px] border-[#141414] p-10 space-y-8 transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(20,20,20,0.05)] hover:shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-[#EDE8DF] border-[3px] border-[#141414] flex items-center justify-center text-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] -rotate-3">
                  <Crown size={24} strokeWidth={2.5} />
                </div>
                <div className={`px-5 py-2 font-black text-[10px] uppercase tracking-[0.2em] border-[2px] border-[#141414] leading-none shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] ${
                  userData.isPro ? 'bg-[#FFD700] text-[#141414]' : 'bg-white text-black'
                }`}>
                  {userData.isPro ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-black text-[#141414] uppercase tracking-tight">TÀI KHOẢN PRO</h3>
                <p className="text-[13px] font-bold text-[#141414] uppercase tracking-tight leading-snug">
                  Mở khóa toàn bộ tính năng AI cao cấp, bộ từ vựng độc quyền và thuật toán SRS thông minh.
                </p>
              </div>

              {!userData.isPro ? (
                 <button 
                  onClick={() => setShowPricing(!showPricing)}
                  className="w-full py-6 border-[3px] border-[#141414] bg-[#141414] text-white font-black text-[12px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] flex items-center justify-center gap-3 leading-none"
                >
                   {showPricing ? 'ĐÓNG BẢNG GIÁ' : <>NÂNG CẤP NGAY <ArrowRight size={16} /></>}
                 </button>
              ) : (
                <div className="space-y-5 pt-4 border-t-2 border-[#141414]/10">
                  <div className="flex justify-between items-center text-[11px] font-black uppercase text-[#141414] tracking-[0.1em]">
                    <span>HẠN DÙNG:</span>
                    <span className="text-[#141414] bg-[#F5F0E8] px-3 py-1 border-2 border-[#141414] font-mono font-bold">
                      {userData.proEndDate ? new Date(userData.proEndDate).toLocaleDateString() : 'VĨNH VIỄN'}
                    </span>
                  </div>
                  {canRefund() && (
                    <button onClick={() => setShowRefundConfirm(true)} className="w-full py-4 text-[11px] font-black uppercase text-red-600 border-[3px] border-red-100 hover:border-red-600 hover:bg-red-50 transition-all tracking-[0.2em]">YÊU CẦU HOÀN TIỀN</button>
                  )}
                </div>
              )}

              {showPricing && (
                <div className="pt-8 border-t-2 border-[#141414]/10 animate-in slide-in-from-top-4 duration-300">
                  <PricingSelector onUpgrade={(plan) => { setSelectedPlan(plan); setIsPaymentModalOpen(true); }} />
                </div>
              )}
            </div>



            {/* Support / Quick Help */}
            <div className="bg-[#F5F0E8] border-[3px] border-[#141414] border-dashed p-10 space-y-8 transition-all hover:bg-white hover:border-solid">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border-[3px] border-[#141414] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                    <Shield size={20} className="text-[#141414]" strokeWidth={2.5} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#141414]">TRỢ GIÚP NHANH</h4>
               </div>
               <p className="text-[12px] font-bold text-[#141414] leading-relaxed uppercase tracking-tight">
                Gặp vấn đề về thanh toán hoặc tài khoản? Đừng lo, đội ngũ của chúng tôi hỗ trợ 24/7 để đảm bảo trải nghiệm của bạn không bị gián đoạn.
               </p>
               <button className="text-[12px] font-black uppercase underline decoration-[3px] underline-offset-8 decoration-red-600 hover:text-red-600 transition-colors tracking-[0.2em]">LIÊN HỆ HỖ TRỢ NGAY</button>
            </div>
          </div>
        </div>

        {/* Logout Action */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#141414] border-[3px] border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] font-black text-[11px] uppercase tracking-[0.18em] hover:bg-[#141414] hover:text-white transition-all active:translate-y-1 active:shadow-none"
          >
            <LogOut size={16} strokeWidth={2.8} />
            Đăng xuất
          </button>
        </div>
      </div>

      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} plan={selectedPlan} userId={userData.id} />

      {/* Refund Modal */}
      {showRefundConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#F5F0E8] border-[5px] border-[#141414] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] p-10 max-w-lg w-full space-y-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-serif font-black text-[#141414] uppercase border-b-[3px] border-[#141414] pb-5 tracking-tight">Yêu cầu hoàn tiền</h3>
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4B4B4B]">Lý do hoàn tiền</label>
               <textarea 
                value={refundData.reason} onChange={(e) => setRefundData(p => ({...p, reason: e.target.value}))}
                placeholder="Vui lòng cho biết lý do để chúng tôi cải thiện dịch vụ..."
                className="w-full p-5 bg-white border-[3px] border-[#141414] min-h-[120px] font-bold text-sm focus:shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4B4B4B]">Ngân hàng</label>
                <input
                  type="text"
                  value={refundData.bankName}
                  onChange={(e) => setRefundData((p) => ({ ...p, bankName: e.target.value }))}
                  placeholder="VD: BIDV / Vietcombank / MB Bank"
                  className="w-full h-12 px-4 bg-white border-[3px] border-[#141414] font-bold text-sm outline-none focus:shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4B4B4B]">Số tài khoản</label>
                <input
                  type="text"
                  value={refundData.accountNumber}
                  onChange={(e) => setRefundData((p) => ({ ...p, accountNumber: e.target.value }))}
                  placeholder="Nhập số tài khoản nhận hoàn tiền"
                  className="w-full h-12 px-4 bg-white border-[3px] border-[#141414] font-mono font-bold text-sm outline-none focus:shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4B4B4B]">Tên chủ tài khoản</label>
                <input
                  type="text"
                  value={refundData.accountName}
                  onChange={(e) => setRefundData((p) => ({ ...p, accountName: e.target.value }))}
                  placeholder="Nhập đúng tên chủ tài khoản"
                  className="w-full h-12 px-4 bg-white border-[3px] border-[#141414] font-bold text-sm outline-none focus:shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] transition-all"
                />
              </div>
            </div>
            <div className="flex gap-5">
              <button
                onClick={() => {
                  setShowRefundConfirm(false)
                  setRefundData({ reason: '', bankName: '', accountNumber: '', accountName: '' })
                }}
                className="flex-1 py-5 border-[3px] border-[#141414] bg-white font-black uppercase text-xs hover:bg-[#EDE8DF] transition-all tracking-[0.2em]"
              >
                Quay lại
              </button>
              <button 
                onClick={handleRequestRefund} 
                disabled={isRefunding}
                className="flex-1 py-5 bg-red-600 text-white border-[3px] border-red-600 font-black uppercase text-xs hover:bg-[#141414] hover:border-[#141414] shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] transition-all tracking-[0.2em]"
              >
                {isRefunding ? 'ĐANG GỬI...' : 'GỬI YÊU CẦU'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={showLogoutConfirm} title="XÁC NHẬN ĐĂNG XUẤT" message="Bạn sẽ không thể tiếp tục học tập nếu chưa đăng nhập lại." onConfirm={async () => { setShowLogoutConfirm(false); await signOut(); }} onCancel={() => setShowLogoutConfirm(false)} confirmText="ĐĂNG XUẤT NGAY" danger />
    </>
  )
}
