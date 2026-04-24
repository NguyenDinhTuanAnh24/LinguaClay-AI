'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  CreditCard,
  Bot,
  TrendingUp,
  UserCircle,
  ReceiptText,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Crown,
} from 'lucide-react'

type SidebarDbUser = {
  isPro?: boolean
  proType?: '3_MONTHS' | '6_MONTHS' | '1_YEAR' | null
}

type SidebarProps = {
  user: unknown
  dbUser: SidebarDbUser | null
  collapsed?: boolean
  onToggle?: () => void
}

const menuItems = [
  { name: 'Tổng quan', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Flashcard', icon: CreditCard, path: '/dashboard/flashcards' },
  { name: 'AI Tutor', icon: Bot, path: '/dashboard/ai-chat' },
  { name: 'Tiến độ', icon: TrendingUp, path: '/dashboard/progress' },
  { name: 'Lịch sử thanh toán', icon: ReceiptText, path: '/dashboard/payments/history' },
  { name: 'Tài khoản', icon: UserCircle, path: '/dashboard/settings' },
]

function getPlanLabel(proType: SidebarDbUser['proType']) {
  if (proType === '3_MONTHS') return 'Bản tiêu chuẩn'
  if (proType === '6_MONTHS') return 'Bản chuyên sâu'
  if (proType === '1_YEAR') return 'Bản toàn diện'
  const adminMatch = typeof proType === 'string' ? (proType as string).match(/^ADMIN_GRANTED_(\d+)M$/) : null
  if (adminMatch) return `ADMIN cấp ${adminMatch[1]} tháng`
  return 'Đã nâng cấp'
}

export default function Sidebar({ dbUser, collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [showLogout, setShowLogout] = useState(false)
  const isPro = dbUser?.isPro ?? false

  return (
    <>
      <div className="h-full flex flex-col bg-[#F5F0E8] border-r border-[#D6CFC4]">
        <div className={`flex items-center border-b border-[#D6CFC4] ${collapsed ? 'justify-center px-2 py-4' : 'gap-3 px-5 py-6'}`}>
          <div
            className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{ border: '1.5px solid #141414' }}
          >
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>

          {!collapsed && (
            <div>
              <p className="text-[17px] font-serif font-black text-[#141414] leading-none">LinguaClay</p>
              <p className="mt-1 text-[10px] font-bold text-[#4B4B4B] uppercase" style={{ letterSpacing: '0.24em' }}>
                Học hiệu quả
              </p>
            </div>
          )}
        </div>

        <div className={`border-b border-[#D6CFC4] ${collapsed ? 'px-2 py-3' : 'px-4 py-3'}`}>
          <button
            onClick={onToggle}
            className={`w-full h-8 border border-[#D6CFC4] bg-transparent text-[#4B4B4B] hover:bg-white/50 hover:text-[#141414] transition-colors flex items-center ${
              collapsed ? 'justify-center' : 'justify-start gap-2 px-3'
            }`}
            title={collapsed ? 'Mở thanh điều hướng' : 'Thu thanh điều hướng'}
          >
            {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            {!collapsed && <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">Thu gọn</span>}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3" style={{ scrollbarWidth: 'none' }}>
          {menuItems.map(({ name, icon: Icon, path }) => {
            const active = path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(path)
            return (
              <Link
                key={path}
                href={path}
                className={`relative flex items-center transition-all duration-300 group hover:bg-white/60 ${
                  collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-5 py-3 hover:pl-7'
                }`}
                style={{
                  color: active ? '#141414' : '#4B4B4B',
                  background: active ? 'white' : 'transparent',
                }}
                title={collapsed ? name : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-bar"
                    className="absolute left-0 top-0 bottom-0 bg-red-600"
                    style={{ width: 3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                  />
                )}
                <Icon size={15} strokeWidth={active ? 2.5 : 1.75} className="flex-shrink-0" />
                {!collapsed && (
                  <span
                    className="uppercase"
                    style={{
                      fontSize: 12,
                      fontWeight: active ? 800 : 600,
                      letterSpacing: '0.17em',
                    }}
                  >
                    {name}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className={`pb-5 pt-4 border-t border-[#D6CFC4] space-y-2 ${collapsed ? 'px-2' : 'px-4'}`}>
          <Link
            href="/dashboard/plans"
            className={`block shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_rgba(20,20,20,1)] group ${
              collapsed ? 'px-2 py-3' : 'px-4 py-3'
            }`}
            style={{
              border: '2px solid #141414',
              background: isPro ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
            }}
            title={collapsed ? (isPro ? getPlanLabel(dbUser?.proType ?? null) : 'Hội viên') : undefined}
          >
            {collapsed ? (
              <div className="flex items-center justify-center text-[#141414]">
                <Crown size={15} />
              </div>
            ) : (
              <>
                <p className="uppercase font-black text-[#141414]" style={{ fontSize: 10, letterSpacing: '0.17em' }}>
                  {isPro ? 'Hội viên nâng cấp' : 'Hội viên'}
                </p>
                <p
                  className="uppercase font-semibold text-[#4B4B4B] group-hover:text-[#141414] transition-colors"
                  style={{ fontSize: 9, letterSpacing: '0.15em', marginTop: 2 }}
                >
                  {isPro ? getPlanLabel(dbUser?.proType ?? null) : 'Bản miễn phí'}
                </p>
              </>
            )}
          </Link>

          <button
            onClick={() => setShowLogout(true)}
            className={`w-full flex items-center transition-colors hover:text-red-600 text-[#141414]/40 group ${
              collapsed ? 'justify-center px-2 py-2' : 'gap-2 px-2 py-2'
            }`}
            title={collapsed ? 'Đăng xuất' : undefined}
          >
            <LogOut size={13} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
            {!collapsed && (
              <span style={{ fontSize: 10, letterSpacing: '0.17em', fontWeight: 700, textTransform: 'uppercase' }}>
                Đăng xuất
              </span>
            )}
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogout}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn rời khỏi ứng dụng không?"
        onConfirm={async () => {
          setShowLogout(false)
          await signOut()
          if (typeof window !== 'undefined') window.location.replace('/')
        }}
        onCancel={() => setShowLogout(false)}
        confirmText="Đăng xuất"
        danger
      />
    </>
  )
}
