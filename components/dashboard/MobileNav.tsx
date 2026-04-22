'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  CreditCard, 
  BotMessageSquare, 
  TrendingUp, 
  User, 
  Crown, 
  ReceiptText,
  Menu,
  X,
  LogOut
} from 'lucide-react'
import { signOut } from '@/app/actions/auth'

export default function MobileNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  const mainItems = [
    { Icon: LayoutDashboard, href: '/dashboard',           label: 'Tổng quan' },
    { Icon: CreditCard,       href: '/dashboard/flashcards', label: 'Flashcard'  },
    { Icon: BotMessageSquare, href: '/dashboard/ai-chat',    label: 'AI Tutor'   },
    { Icon: TrendingUp,       href: '/dashboard/progress',   label: 'Tiến độ'    },
  ]

  const moreItems = [
    { Icon: Crown,            href: '/dashboard/plans',      label: 'Gói học'    },
    { Icon: ReceiptText,      href: '/dashboard/payments/history', label: 'Lịch sử' },
    { Icon: User,             href: '/dashboard/settings',   label: 'Tài khoản'  },
  ]

  return (
    <>
      {/* More Menu Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* More Menu Popup */}
      <div 
        className={`fixed bottom-20 left-4 right-4 z-50 bg-[#F5F0E8] border-[3px] border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] p-4 transition-all duration-300 transform ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
        <div className="grid grid-cols-1 gap-2">
          {moreItems.map(({ Icon, href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 p-4 hover:bg-white border-[2px] border-transparent hover:border-[#141414] transition-all group"
            >
              <div className="w-10 h-10 bg-white border-[2px] border-[#141414] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
                <Icon size={18} className="text-[#141414]" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-[#141414] vietnamese-text">{label}</span>
            </Link>
          ))}
          <button
            onClick={() => {
              setIsOpen(false)
              signOut()
            }}
            className="flex items-center gap-4 p-4 hover:bg-red-50 border-[2px] border-transparent hover:border-red-600 transition-all group mt-2"
          >
            <div className="w-10 h-10 bg-white border-[2px] border-red-600 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
              <LogOut size={18} className="text-red-600" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-red-600 vietnamese-text">Đăng xuất</span>
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#F5F0E8] border-t border-[#D6CFC4] grid grid-cols-5 h-16">
        {mainItems.map(({ Icon, href, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors
                ${active ? 'text-red-600' : 'text-[#141414]/40 hover:text-[#141414]'}`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
              <span className={`text-[8px] font-bold uppercase tracking-tight text-center px-0.5 vietnamese-text leading-tight ${active ? 'text-red-600' : ''}`}>
                {label}
              </span>
            </Link>
          )
        })}
        
        {/* Toggle More Menu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors
            ${isOpen ? 'text-red-600' : 'text-[#141414]/40 hover:text-[#141414]'}`}
        >
          {isOpen ? <X size={18} strokeWidth={2.5} /> : <Menu size={18} strokeWidth={1.75} />}
          <span className={`text-[8px] font-bold uppercase tracking-tight text-center px-0.5 vietnamese-text leading-tight ${isOpen ? 'text-red-600' : ''}`}>
            {isOpen ? 'Đóng' : 'Thêm'}
          </span>
        </button>
      </nav>
    </>
  )
}
