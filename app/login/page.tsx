'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Tab = 'signin' | 'signup'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      // --- ĐĂNG KÝ ---
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      
      if (error) {
        // Kiểm tra nếu lỗi là do user đã tồn tại
        if (error.message.includes('User already registered') || error.status === 400) {
          setMessage({ type: 'error', text: 'Tài khoản này đã tồn tại. Hãy đăng nhập ngay!' })
        } else {
          setMessage({ type: 'error', text: error.message })
        }
      } else if (data.user && data.user.identities?.length === 0) {
        // Một số cấu hình Supabase trả về thành công nhưng identities rỗng nếu user đã tồn tại
        setMessage({ type: 'error', text: 'Tài khoản này đã tồn tại. Hãy đăng nhập ngay!' })
      } else {
        setMessage({ type: 'success', text: '🎉 Tài khoản đã tạo! Hãy kiểm tra email để xác nhận.' })
        setEmail('')
        setPassword('')
      }
    } else {

      // --- ĐĂNG NHẬP ---
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage({ type: 'error', text: 'Email hoặc mật khẩu không đúng.' })
      } else {
        // Đồng bộ user vào Prisma DB
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
    <div className="min-h-screen bg-clay-cream relative overflow-hidden flex items-center justify-center p-4">

      {/* Background blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-clay-blue/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-clay-orange/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-10 w-48 h-48 bg-clay-green/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '12s' }} />

      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-warm-white/80 rounded-[20px] shadow-clay-button hover:shadow-clay-button-hover active:scale-95 transition-all text-clay-deep font-heading font-bold text-sm"
      >
        ← Trang chủ
      </Link>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-warm-white rounded-[45px] shadow-clay-card border-4 border-white p-8 space-y-7">

          {/* Logo & Title */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-clay-blue to-clay-green rounded-[22px] shadow-clay-button flex items-center justify-center text-3xl">
              🧠
            </div>
            <div>
              <h1 className="text-2xl font-heading font-black text-clay-deep">LinguaClay AI</h1>
              <p className="text-xs text-clay-muted font-medium mt-1">Học ngôn ngữ theo cách của bạn</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="relative flex bg-clay-cream rounded-[20px] p-1 shadow-clay-inset">
            {/* Sliding indicator */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-[16px] shadow-clay-button transition-all duration-300 ${
                tab === 'signup' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
              }`}
            />
            <button
              onClick={() => { setTab('signin'); setMessage(null) }}
              className={`relative z-10 flex-1 py-2.5 text-sm font-heading font-black rounded-[16px] transition-colors duration-300 ${
                tab === 'signin' ? 'text-clay-deep' : 'text-clay-muted'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => { setTab('signup'); setMessage(null) }}
              className={`relative z-10 flex-1 py-2.5 text-sm font-heading font-black rounded-[16px] transition-colors duration-300 ${
                tab === 'signup' ? 'text-clay-deep' : 'text-clay-muted'
              }`}
            >
              Đăng ký
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-clay-muted uppercase tracking-wider ml-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@email.com"
                required
                disabled={loading}
                className="w-full px-5 py-4 bg-clay-cream rounded-[20px] shadow-clay-inset border-2 border-transparent focus:border-clay-blue/30 focus:outline-none font-body text-clay-deep placeholder:text-clay-muted/40 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-clay-muted uppercase tracking-wider ml-2">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                  className="w-full px-5 py-4 pr-14 bg-clay-cream rounded-[20px] shadow-clay-inset border-2 border-transparent focus:border-clay-blue/30 focus:outline-none font-body text-clay-deep placeholder:text-clay-muted/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-clay-muted hover:text-clay-deep transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`px-4 py-3 rounded-[15px] text-sm font-medium text-center ${
                message.type === 'success'
                  ? 'bg-clay-green/10 text-clay-green'
                  : 'bg-red-50 text-red-500'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className={`w-full py-4 rounded-[25px] font-heading font-black text-base shadow-clay-button transition-all flex items-center justify-center gap-3 ${
                loading || !email || !password
                  ? 'bg-soft-gray text-clay-muted cursor-not-allowed'
                  : 'bg-gradient-to-r from-clay-orange to-clay-gold text-white hover:shadow-clay-button-hover active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : tab === 'signin' ? (
                'Đăng nhập ngay ✨'
              ) : (
                'Tạo tài khoản 🚀'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-[2px] bg-soft-gray/30 rounded-full" />
            <span className="text-xs text-clay-muted font-bold">hoặc</span>
            <div className="flex-1 h-[2px] bg-soft-gray/30 rounded-full" />
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-white rounded-[25px] shadow-clay-button hover:shadow-clay-button-hover active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {/* Google SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            <span className="font-heading font-black text-clay-deep">Tiếp tục với Google</span>
          </button>

          {/* Footer hint */}
          <p className="text-center text-[11px] text-clay-muted font-medium">
            {tab === 'signin'
              ? 'Chưa có tài khoản? '
              : 'Đã có tài khoản? '}
            <button
              onClick={() => { setTab(tab === 'signin' ? 'signup' : 'signin'); setMessage(null) }}
              className="font-black text-clay-blue hover:underline"
            >
              {tab === 'signin' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
