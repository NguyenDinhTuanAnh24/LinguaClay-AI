'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) {
      setError('Thông tin đăng nhập admin không đúng.')
      setLoading(false)
      return
    }

    const syncRes = await fetch('/api/auth/sync-user', { method: 'POST' })
    const syncData = (await syncRes.json()) as { ok?: boolean; role?: string }
    const isAdmin = syncRes.ok && syncData.ok && syncData.role === 'ADMIN'

    if (!isAdmin) {
      await supabase.auth.signOut()
      setError('Tài khoản không có quyền truy cập khu vực admin.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] px-6 py-8">
      <div className="mx-auto w-full max-w-130">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 border-2 border-[#141414] bg-[#F5F0E8] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#141414] transition-all hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,0.9)]"
        >
          <ArrowLeft size={14} />
          Quay lại trang chủ
        </Link>

        <div className="border-2 border-[#141414] bg-[#F5F0E8] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,0.95)]">
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4B4B4B]">Admin Workspace</p>
            <h1 className="mt-2 flex items-center gap-2 text-4xl font-serif font-black text-[#141414]">
              <ShieldCheck className="text-red-600" size={28} />
              Đăng nhập admin
            </h1>
            <p className="mt-2 text-sm font-semibold text-[#4B4B4B]">Khu vực quản trị tách biệt với người dùng thường.</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4B4B4B]">Email admin</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full border-2 border-[#141414] bg-[#F5F0E8] px-3 text-sm font-semibold text-[#141414] outline-none focus:bg-white"
                placeholder="admin@gmail.com"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4B4B4B]">Mật khẩu</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full border-2 border-[#141414] bg-[#F5F0E8] px-3 pr-11 text-sm font-semibold text-[#141414] outline-none focus:bg-white"
                  placeholder="Nhập mật khẩu admin"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B4B4B] hover:text-[#141414]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {error ? (
              <div className="border-2 border-red-600 bg-red-50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full border-2 border-[#141414] bg-[#141414] py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#F5F0E8] transition-all hover:-translate-y-px hover:shadow-[5px_5px_0px_0px_rgba(20,20,20,0.95)] disabled:opacity-60"
            >
              {loading ? 'Đang đăng nhập...' : 'Vào Admin Panel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
