'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { signOut } from '@/app/actions/auth'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { motion } from 'framer-motion'
import { getPlanLabel } from '@/lib/constants'
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
  proType?: string | null
}

type SidebarProps = {
  user: unknown
  dbUser: SidebarDbUser | null
  collapsed?: boolean
  onToggle?: () => void
}

export default function Sidebar({ dbUser, collapsed = false, onToggle }: SidebarProps) {
  const normalizedProType: '3_MONTHS' | '6_MONTHS' | '1_YEAR' | null =
    dbUser?.proType === '3_MONTHS' || dbUser?.proType === '6_MONTHS' || dbUser?.proType === '1_YEAR'
      ? dbUser.proType
      : null
  const t = useTranslations('dashboardUi.sidebar')
  const nav = [
    { name: t('overview'), icon: LayoutDashboard, path: '/dashboard' },
    { name: t('flashcard'), icon: CreditCard, path: '/dashboard/flashcards' },
    { name: t('aiTutor'), icon: Bot, path: '/dashboard/ai-chat' },
    { name: t('progress'), icon: TrendingUp, path: '/dashboard/progress' },
    { name: t('paymentHistory'), icon: ReceiptText, path: '/dashboard/payments/history' },
    { name: t('account'), icon: UserCircle, path: '/dashboard/settings' },
  ]

  const pathname = usePathname()
  const [showLogout, setShowLogout] = useState(false)
  const isPro = dbUser?.isPro ?? false

  return (
    <>
      <div className="h-full flex flex-col bg-[#F5F0E8] border-r border-[#D6CFC4]">
        <div className={`flex items-center border-b border-[#D6CFC4] ${collapsed ? 'justify-center px-2 py-4' : 'gap-3 px-5 py-6'}`}>
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border-[1.5px] border-[#141414]">
            <Image src="/logo.png" alt="LinguaClay Logo" width={36} height={36} className="object-cover" />
          </div>

          {!collapsed && (
            <div>
              <p className="text-[17px] font-serif font-black text-[#141414] leading-none">LinguaClay</p>
              <p className="mt-1 text-[10px] font-bold text-[#4B4B4B] uppercase tracking-[0.24em]">{t('learningTag')}</p>
            </div>
          )}
        </div>

        <div className={`border-b border-[#D6CFC4] ${collapsed ? 'px-2 py-3' : 'px-4 py-3'}`}>
          <button
            onClick={onToggle}
            className={`w-full h-8 border border-[#D6CFC4] bg-transparent text-[#4B4B4B] hover:bg-white/50 hover:text-[#141414] transition-colors flex items-center ${collapsed ? 'justify-center' : 'justify-start gap-2 px-3'}`}
            title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            {!collapsed && <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">{t('collapse')}</span>}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 [scrollbar-width:none]">
          {nav.map(({ name, icon: Icon, path }) => {
            const active = path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(path)
            return (
              <Link
                key={path}
                href={path}
                className={`relative flex items-center transition-all duration-300 group hover:bg-white/60 ${collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-5 py-3 hover:pl-7'} ${active ? 'text-[#141414] bg-white' : 'text-[#4B4B4B] bg-transparent'}`}
                title={collapsed ? name : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-bar"
                    className="absolute left-0 top-0 bottom-0 bg-red-600 w-[3px]"
                    transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                  />
                )}
                <Icon size={15} strokeWidth={active ? 2.5 : 1.75} className="flex-shrink-0" />
                {!collapsed && <span className={`uppercase text-[12px] tracking-[0.17em] ${active ? 'font-extrabold' : 'font-semibold'}`}>{name}</span>}
              </Link>
            )
          })}
        </nav>

        <div className={`pb-5 pt-4 border-t border-[#D6CFC4] space-y-2 ${collapsed ? 'px-2' : 'px-4'}`}>
          <Link
            href="/dashboard/plans"
            className={`block shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_rgba(20,20,20,1)] group border-2 border-[#141414] ${collapsed ? 'px-2 py-3' : 'px-4 py-3'} ${isPro ? 'bg-[#FFFFFF]' : 'bg-white/45'}`}
            title={collapsed ? (isPro ? getPlanLabel(normalizedProType) : t('member')) : undefined}
          >
            {collapsed ? (
              <div className="flex items-center justify-center text-[#141414]">
                <Crown size={15} />
              </div>
            ) : (
              <>
                <p className="uppercase font-black text-[#141414] text-[10px] tracking-[0.17em]">{isPro ? t('premium') : t('member')}</p>
                <p className="uppercase font-semibold text-[#4B4B4B] group-hover:text-[#141414] transition-colors text-[9px] tracking-[0.15em] mt-[2px]">
                  {isPro ? getPlanLabel(normalizedProType) : t('free')}
                </p>
              </>
            )}
          </Link>

          <button
            onClick={() => setShowLogout(true)}
            className={`w-full flex items-center transition-colors hover:text-red-600 text-[#141414]/40 group ${collapsed ? 'justify-center px-2 py-2' : 'gap-2 px-2 py-2'}`}
            title={collapsed ? t('logout') : undefined}
          >
            <LogOut size={13} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
            {!collapsed && <span className="text-[10px] tracking-[0.17em] font-bold uppercase">{t('logout')}</span>}
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogout}
        title={t('logout')}
        message="Bạn có chắc chắn muốn rời khỏi ứng dụng không?"
        onConfirm={async () => {
          setShowLogout(false)
          await signOut()
          if (typeof window !== 'undefined') window.location.replace('/')
        }}
        onCancel={() => setShowLogout(false)}
        confirmText={t('logout')}
        danger
      />
    </>
  )
}
