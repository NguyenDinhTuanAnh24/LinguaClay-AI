'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, X, ArrowLeft, Check, Chrome } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'

type Tab = 'signin' | 'signup' | 'forgotpassword'

interface AuthDrawerProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: Tab
}

export default function AuthDrawer({ isOpen, onClose, initialTab = 'signin' }: AuthDrawerProps) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()
  const router = useRouter()
  const { redirectAfterLogin } = useAuth()

  // Reset state when tab changes
  useEffect(() => {
    setMessage(null)
  }, [tab])

  // Sync initialTab when props change
  useEffect(() => {
    setTab(initialTab)
  }, [initialTab, isOpen])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (tab === 'signup') {
      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' })
        setLoading(false)
        return
      }
      if (!agreeToTerms) {
        setMessage({ type: 'error', text: 'Bạn cần đồng ý với điều khoản dịch vụ.' })
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      
      if (error) {
        if (error.message.includes('User already registered') || error.status === 400) {
          setMessage({ type: 'error', text: 'Tài khoản này đã tồn tại. Hãy đăng nhập ngay!' })
        } else {
          setMessage({ type: 'error', text: error.message })
        }
      } else {
        setMessage({ type: 'success', text: '🎉 Tài khoản đã tạo! Hãy kiểm tra email để xác nhận.' })
        setFullName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      }
    } else if (tab === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage({ type: 'error', text: 'Email hoặc mật khẩu không đúng.' })
      } else {
        await fetch('/api/auth/sync-user', { method: 'POST' })
        onClose()
        router.push(redirectAfterLogin || '/dashboard')
        router.refresh()
      }
    } else if (tab === 'forgotpassword') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard/settings`,
      })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: '✉️ Link đặt lại mật khẩu đã được gửi vào email của bạn.' })
      }
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectAfterLogin || '/dashboard')}`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-newsprint-black/40 backdrop-blur-sm z-[100] transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#F5F0E8] border-l-[3px] border-newsprint-black z-[101] shadow-[-10px_0px_30px_rgba(0,0,0,0.1)] transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b-[3px] border-newsprint-black flex items-center justify-between bg-[#F5F0E8] sticky top-0 z-20">
           <h2 className="text-xl font-serif font-black uppercase tracking-tight text-newsprint-black">
              {tab === 'signin' ? 'Đăng nhập' : tab === 'signup' ? 'Tạo tài khoản' : 'Quên mật khẩu'}
           </h2>
           <button 
              onClick={onClose}
              className="text-newsprint-black hover:text-red-600 transition-colors p-1"
           >
              <X size={24} className="stroke-[3px]" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
           {tab !== 'forgotpassword' && (
             /* Tab Switch */
             <div className="flex border-[2px] border-newsprint-black mb-8 overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <button 
                   onClick={() => setTab('signin')}
                   className={`flex-1 py-3 font-sans font-black uppercase tracking-[0.1em] text-[10px] transition-all duration-200 ${tab === 'signin' ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#F5F0E8]'}`}
                >
                   Đăng nhập
                </button>
                <button 
                   onClick={() => setTab('signup')}
                   className={`flex-1 py-3 font-sans font-black uppercase tracking-[0.1em] text-[10px] transition-all duration-200 border-l-[2px] border-newsprint-black ${tab === 'signup' ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#F5F0E8]'}`}
                >
                   Đăng ký
                </button>
             </div>
           )}

           {tab === 'forgotpassword' && (
             <p className="font-sans text-[11px] font-bold text-newsprint-gray-dark uppercase tracking-widest mb-8 leading-relaxed">
                Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.
             </p>
           )}

           <form onSubmit={handleEmailAuth} className="space-y-6">
              {tab === 'signup' && (
                <div className="space-y-2">
                  <label className="block font-sans font-bold text-[10px] uppercase tracking-widest text-newsprint-black ml-1">Họ tên</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                    className="w-full px-5 py-3 border-[2px] border-newsprint-black bg-white font-sans text-sm text-newsprint-black focus:outline-none transition-all"
                    disabled={loading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block font-sans font-bold text-[10px] uppercase tracking-widest text-newsprint-black ml-1">Địa chỉ Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  required
                  className="w-full px-5 py-3 border-[2px] border-newsprint-black bg-white font-sans text-sm text-newsprint-black focus:outline-none transition-all"
                  disabled={loading}
                />
              </div>

              {tab !== 'forgotpassword' && (
                <div className="space-y-2">
                  <label className="block font-sans font-bold text-[10px] uppercase tracking-widest text-newsprint-black ml-1">Mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full px-5 py-3 border-[2px] border-newsprint-black bg-white font-sans text-sm text-newsprint-black focus:outline-none transition-all"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-newsprint-gray-dark hover:text-newsprint-black transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {tab === 'signin' && (
                    <div className="flex items-center justify-between mt-1 px-1">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="remember-me" 
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 border-2 border-newsprint-black accent-black cursor-pointer"
                        />
                        <label htmlFor="remember-me" className="font-sans text-[10px] font-bold uppercase tracking-widest text-newsprint-gray-dark cursor-pointer select-none">
                          Ghi nhớ đăng nhập
                        </label>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setTab('forgotpassword')}
                        className="font-sans text-[10px] font-bold uppercase tracking-widest text-newsprint-gray-dark hover:text-red-600 transition-colors underline"
                      >
                         Quên mật khẩu?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {tab === 'signup' && (
                <>
                  <div className="space-y-2">
                    <label className="block font-sans font-bold text-[10px] uppercase tracking-widest text-newsprint-black ml-1">Xác nhận mật khẩu</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-5 py-4 border-[3px] border-newsprint-black bg-white font-sans text-sm text-newsprint-black focus:outline-none focus:ring-4 focus:ring-newsprint-black/5 transition-all"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-start gap-4 py-2">
                    <input
                      type="checkbox"
                      id="agree-drawer"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 border-[3px] border-newsprint-black checked:bg-newsprint-black transition-all cursor-pointer accent-black shrink-0"
                    />
                    <label htmlFor="agree-drawer" className="text-[11px] font-sans text-newsprint-gray-dark leading-relaxed cursor-pointer font-medium">
                       Tôi đã đọc và đồng ý với <Link href="/support/terms" className="text-newsprint-black font-bold underline">Điều khoản dịch vụ</Link> và <Link href="/support/privacy" className="text-newsprint-black font-bold underline">Chính sách bảo mật</Link>.
                    </label>
                  </div>
                </>
              )}

              {message && (
                <div className={`p-4 border-[3px] font-sans font-bold text-[10px] uppercase tracking-widest text-center ${message.type === 'success' ? 'bg-[#3A7642]/10 border-[#3A7642] text-[#3A7642]' : 'bg-red-600/5 border-red-600 text-red-600'}`}>
                   {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-black text-white font-sans font-black uppercase tracking-[0.1em] text-xs border-[3px] border-black hover:bg-[#F5F0E8] hover:text-black transition-all duration-300 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : (tab === 'signin' ? 'Đăng nhập ngay' : tab === 'signup' ? 'Tạo tài khoản miễn phí' : 'Gửi link đặt lại')}
              </button>

              {tab === 'forgotpassword' && (
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className="w-full py-4 border-[3px] border-black bg-white text-black font-sans font-black uppercase tracking-[0.1em] text-[11px] hover:bg-[#F5F0E8] transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
                >
                  Quay lại đăng nhập
                </button>
              )}
           </form>

           {tab !== 'forgotpassword' && (
             <>
               <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-[2px] bg-black" />
                  <span className="font-sans font-black text-[10px] uppercase tracking-[0.2em] text-black">HOẶC</span>
                  <div className="flex-1 h-[2px] bg-black" />
               </div>

               <button
                 onClick={handleGoogleLogin}
                 disabled={loading}
                 className="w-full py-4 border-[3px] border-black bg-white text-black font-sans font-black uppercase tracking-[0.1em] text-[11px] flex items-center justify-center gap-3 hover:bg-[#F5F0E8] transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] active:translate-y-1 active:shadow-none disabled:opacity-50"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" className="shrink-0">
                   <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                   <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
                   <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                   <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                 </svg>
                 Tiếp tục với Google
               </button>
             </>
           )}
        </div>

        {/* Footer Hint */}
        {tab !== 'forgotpassword' && (
          <div className="py-6 px-8 border-t-[2px] border-newsprint-black bg-[#F5F0E8] text-center">
             <p className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-newsprint-gray-dark">
                {tab === 'signin' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                <button
                  onClick={() => setTab(tab === 'signin' ? 'signup' : 'signin')}
                  className="text-red-600 hover:underline font-black"
                >
                  {tab === 'signin' ? 'Đăng ký ngay' : 'Đăng nhập'}
                </button>
             </p>
          </div>
        )}
      </div>
    </>
  )
}
