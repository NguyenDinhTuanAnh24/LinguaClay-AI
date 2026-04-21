'use client'

import React, { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Search, ArrowLeft, Check, Chrome } from 'lucide-react'

type Tab = 'signin' | 'signup'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()
  const router = useRouter()

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
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage({ type: 'error', text: 'Email hoặc mật khẩu không đúng.' })
      } else {
        await fetch('/api/auth/sync-user', { method: 'POST' })
        router.push('/dashboard')
        router.refresh()
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
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center p-6 relative overflow-x-hidden">
      
      {/* Background Texture - Dot Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.4] pointer-events-none z-0" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #D1C7B7 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* Vertical Decorative Text (Editorial Style) */}
      <div className="hidden lg:block absolute left-12 top-1/2 -translate-y-1/2 -rotate-90 origin-left select-none pointer-events-none">
         <p className="font-sans font-black uppercase tracking-[0.5em] text-newsprint-black/10 text-4xl whitespace-nowrap">
            HỌC MỖI NGÀY — TIẾN BỘ MỖI NGÀY
         </p>
      </div>

      <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 rotate-90 origin-right select-none pointer-events-none">
         <p className="font-sans font-black uppercase tracking-[0.5em] text-newsprint-black/10 text-4xl whitespace-nowrap">
            LINGUACLAY AI — SINCE 2024
         </p>
      </div>

      {/* Quay lại trang chủ */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 px-5 py-3 border-[3px] border-newsprint-black bg-newsprint-white text-newsprint-black font-sans font-bold uppercase tracking-widest text-[10px] hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] z-50"
      >
        <ArrowLeft size={14} className="stroke-[3px]" /> Quay lại
      </Link>

      <div className="relative z-10 w-[92%] sm:w-[520px] min-w-[320px] my-12 bg-white border-[4px] border-newsprint-black shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] p-8 sm:p-14">
        <div className="text-center mb-12">
           <h1 className="text-5xl font-serif font-black uppercase text-newsprint-black tracking-tighter mb-4">
              LinguaClay
           </h1>
           <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-newsprint-gray-dark mb-2">
              {tab === 'signin' ? 'Mừng trở lại — Học ngay thôi' : 'Bắt đầu hành trình tiếng Anh mới'}
           </p>
           <p className="font-sans text-[9px] font-bold uppercase tracking-widest text-red-600 opacity-80 italic">
              ✦ Hơn 2.000 học viên đang học cùng bạn hôm nay
           </p>
        </div>

        {/* Tab Switch */}
        <div className="flex border-[3px] border-newsprint-black mb-10 overflow-hidden">
           <button 
              onClick={() => { setTab('signin'); setMessage(null); }}
              className={`flex-1 py-5 font-sans font-black uppercase tracking-[0.1em] text-[11px] transition-colors ${tab === 'signin' ? 'bg-newsprint-black text-newsprint-white' : 'bg-transparent text-newsprint-black hover:bg-[#F5F0E8]'}`}
           >
              Đăng nhập
           </button>
           <button 
              onClick={() => { setTab('signup'); setMessage(null); }}
              className={`flex-1 py-5 font-sans font-black uppercase tracking-[0.1em] text-[11px] transition-colors border-l-[3px] border-newsprint-black ${tab === 'signup' ? 'bg-newsprint-black text-newsprint-white' : 'bg-transparent text-newsprint-black hover:bg-[#F5F0E8]'}`}
           >
              Đăng ký
           </button>
        </div>

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
                className="w-full px-5 py-4 border-[3px] border-newsprint-black bg-[#F5F0E8] font-sans text-sm text-newsprint-black focus:outline-none focus:bg-newsprint-white transition-colors"
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
              className="w-full px-5 py-4 border-[3px] border-newsprint-black bg-[#F5F0E8] font-sans text-sm text-newsprint-black focus:outline-none focus:bg-newsprint-white transition-colors"
              disabled={loading}
            />
          </div>

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
                className="w-full px-5 py-4 border-[3px] border-newsprint-black bg-[#F5F0E8] font-sans text-sm text-newsprint-black focus:outline-none focus:bg-newsprint-white transition-colors"
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
              <div className="text-right">
                <Link href="#" className="font-sans text-[10px] font-bold uppercase tracking-widest text-newsprint-gray-dark hover:text-red-600 transition-colors">
                   Quên mật khẩu?
                </Link>
              </div>
            )}
          </div>

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
                  className="w-full px-5 py-4 border-[3px] border-newsprint-black bg-[#F5F0E8] font-sans text-sm text-newsprint-black focus:outline-none focus:bg-newsprint-white transition-colors"
                  disabled={loading}
                />
              </div>
              <div className="flex items-start gap-4 py-2">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 border-[3px] border-newsprint-black checked:bg-newsprint-black transition-all cursor-pointer accent-black shrink-0"
                />
                <label htmlFor="agree" className="text-[11px] font-sans text-newsprint-gray-dark leading-relaxed cursor-pointer font-medium">
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
            className="w-full py-5 bg-newsprint-black text-newsprint-white font-sans font-black uppercase tracking-[0.1em] text-xs border-[3px] border-newsprint-black hover:bg-transparent hover:text-newsprint-black transition-colors shadow-[6px_6px_0px_0px_rgba(20,20,20,0.3)] hover:shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : (tab === 'signin' ? 'Đăng nhập ngay' : 'Tạo tài khoản miễn phí')}
          </button>
        </form>

        <div className="flex items-center gap-4 my-10">
           <div className="flex-1 h-[2px] bg-newsprint-black/20" />
           <span className="font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-newsprint-gray-medium">HOẶC</span>
           <div className="flex-1 h-[2px] bg-newsprint-black/20" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 border-[3px] border-newsprint-black bg-newsprint-white text-newsprint-black font-sans font-black uppercase tracking-[0.1em] text-[11px] flex items-center justify-center gap-3 hover:bg-[#F5F0E8] transition-colors shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] active:translate-y-1 active:shadow-none disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" className="shrink-0">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          Tiếp tục với Google
        </button>

        <p className="mt-10 text-center font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-newsprint-gray-dark italic">
          {tab === 'signin' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <button
            onClick={() => { setTab(tab === 'signin' ? 'signup' : 'signin'); setMessage(null); }}
            className="text-red-600 hover:underline font-black"
          >
            {tab === 'signin' ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </p>
      </div>

      {/* Mini Footer */}
      <footer className="relative z-10 flex gap-6 text-[10px] font-sans font-black uppercase tracking-widest text-newsprint-gray-dark opacity-60 hover:opacity-100 transition-opacity">
         <Link href="/support/terms" className="hover:text-newsprint-black">Điều khoản</Link>
         <span>·</span>
         <Link href="/support/privacy" className="hover:text-newsprint-black">Chính sách</Link>
         <span>·</span>
         <Link href="/company/contact" className="hover:text-newsprint-black">Hỗ trợ</Link>
      </footer>
    </div>
  )
}
