import Link from 'next/link'
import { ShieldCheck, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { AdminSidebarNav } from './admin-sidebar-nav'
import './admin-hover-effects.css'

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Admin'

  const modules = [
    { label: 'Tổng quan', href: '/admin', icon: 'dashboard' as const, enabled: true },
    { label: 'Học liệu', href: '/admin/hoc-lieu', icon: 'materials' as const, enabled: true },
    { label: 'Người dùng', href: '/admin/nguoi-dung', icon: 'users' as const, enabled: true },
    { label: 'Thanh toán', href: '/admin/thanh-toan', icon: 'payments' as const, enabled: true },
    { label: 'Kiểm soát AI', href: '/admin/kiem-soat-ai', icon: 'ai' as const, enabled: true },
    { label: 'Hỗ trợ / Hoàn tiền', href: '/admin/ho-tro-hoan-tien', icon: 'supportRefund' as const, enabled: true },
  ]

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#141414]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[260px] shrink-0 border-r border-[#141414] bg-[#F5F0E8] lg:flex lg:flex-col">
          <div className="border-b border-[#141414] px-5 py-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-red-600" />
              <p className="text-lg font-serif font-black leading-none">LinguaClay Admin</p>
            </div>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4B4B4B]">Control Center</p>
          </div>

          <AdminSidebarNav modules={modules} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-[#141414] bg-[#F5F0E8]">
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-5 py-4 lg:px-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4B4B4B]">Admin Workspace</p>
                <p className="text-sm font-semibold">Xin chào, {adminName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/api/auth/logout"
                  className="flex items-center gap-2 border border-[#141414] bg-[#141414] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#F5F0E8] transition-all hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,0.9)]"
                >
                  <LogOut size={13} />
                  Đăng xuất
                </Link>
              </div>
            </div>
          </header>

          <main className="admin-panel-root flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1600px] px-5 py-8 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
