'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
  { name: 'Tổng quan', icon: '🏠', path: '/dashboard' },
  { 
    name: 'Học tập', 
    icon: '📚', 
    children: [
      { name: 'Ngữ pháp', icon: '🏺', path: '/dashboard/grammar' },
      { name: 'Flashcard', icon: '🃏', path: '/dashboard/flashcards' },
      { name: 'Đối thoại AI', icon: '💬', path: '/dashboard/ai-chat' },
    ]
  },
  { name: 'Tiến độ', icon: '📊', path: '/dashboard/progress' },
  { name: 'Cài đặt', icon: '⚙️', path: '/dashboard/settings' },
]

export default function Sidebar({ user, dbUser }: { user: any, dbUser: any }) {
  const pathname = usePathname()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  // Tự động mở menu "Học tập" nếu đang ở trang con
  const isLearnChild = pathname.includes('/dashboard/grammar') || 
                      pathname.includes('/dashboard/flashcards') || 
                      pathname.includes('/dashboard/ai-chat')
                      
  const [learnOpen, setLearnOpen] = useState(isLearnChild)

  useEffect(() => {
    if (isLearnChild) setLearnOpen(true)
  }, [pathname, isLearnChild])

  const isPro = dbUser?.isPro || false

  const handleLogout = async () => {
    setShowLogoutConfirm(true)
  }

  return (
    <div className="h-full bg-white/80 backdrop-blur-md rounded-[32px] shadow-clay-card border-4 border-white flex flex-col p-6 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2 lg:px-4">
        <div className="w-11 h-11 bg-gradient-to-br from-clay-orange to-clay-orange/80 rounded-[14px] shadow-clay-button flex items-center justify-center animate-breathe">
          <span className="text-xl">🏺</span>
        </div>
        <span className="text-lg font-heading font-black text-clay-deep tracking-tight">LinguaClay</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-hide">
        {menuItems.map((item) => {
          if (item.children) {
            return (
              <div key={item.name} className="space-y-1">
                {/* Parent Item */}
                <button
                  onClick={() => setLearnOpen(!learnOpen)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-[20px] transition-all duration-200 group ${
                    isLearnChild ? 'text-clay-blue bg-clay-cream/20' : 'text-clay-muted hover:bg-clay-cream/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-[14px] flex items-center justify-center transition-all ${
                      isLearnChild ? 'bg-clay-blue text-white shadow-clay-button' : 'bg-white shadow-clay-button'
                    }`}>
                      <span className="text-lg">{item.icon}</span>
                    </div>
                    <span className="font-heading font-black text-[13px]">{item.name}</span>
                  </div>
                  <motion.span 
                    animate={{ rotate: learnOpen ? 90 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-[10px] opacity-40 font-bold"
                  >
                    ▶
                  </motion.span>
                </button>

                {/* Children Items */}
                <AnimatePresence initial={false}>
                  {learnOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden space-y-1 pl-4"
                    >
                      {item.children.map((child) => {
                        const isChildActive = pathname === child.path
                        return (
                          <Link
                            key={child.path}
                            href={child.path}
                            className={`flex items-center gap-3 p-3 rounded-[16px] transition-all duration-200 group ${
                              isChildActive
                                ? 'text-clay-blue bg-white shadow-clay-pressed border border-clay-blue/10'
                                : 'text-clay-muted/70 hover:text-clay-deep hover:bg-white/50'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-[10px] flex items-center justify-center transition-all ${
                              isChildActive ? 'bg-clay-blue text-white shadow-clay-button' : 'bg-white shadow-clay-button'
                            }`}>
                              <span className="text-xs">{child.icon}</span>
                            </div>
                            <span className={`font-heading font-black text-[12px]`}>
                              {child.name}
                            </span>
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          }

          const isActive = pathname === item.path
          return (
            <Link 
              key={item.path} 
              href={item.path!}
              className={`flex items-center gap-3 p-3.5 rounded-[20px] transition-all duration-200 group ${
                isActive 
                ? 'bg-clay-cream/30 text-clay-blue shadow-clay-pressed border border-white/50' 
                : 'text-clay-muted hover:bg-clay-cream/50'
              }`}
            >
              <div className={`w-9 h-9 rounded-[14px] flex items-center justify-center transition-all ${
                isActive ? 'bg-clay-blue text-white shadow-clay-button border-2 border-white/40' : 'bg-white shadow-clay-button group-hover:shadow-clay-button-hover'
              }`}>
                <span className="text-lg">{item.icon}</span>
              </div>
              <span className={`font-heading font-black text-[13px] ${isActive ? 'text-clay-blue' : 'text-clay-muted'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Grouped Bottom Info */}
      <div className="mt-6 pt-6 border-t-2 border-dashed border-clay-cream space-y-4">
        {isPro ? (
          <Link href="/dashboard/plans" className="block transform transition-all hover:scale-[1.02] active:scale-95 group">
            <div className="bg-gradient-to-br from-clay-deep to-clay-brown-dark rounded-[25px] p-4 text-center border-2 border-white/20 shadow-clay-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -mr-6 -mt-6 blur-xl" />
              <div className="text-[10px] font-heading font-black text-clay-orange mb-0.5 uppercase tracking-widest animate-pulse">
                Active Member
              </div>
              <div className="flex items-center justify-center gap-2 py-1">
                <span className="text-lg">💎</span>
                <span className="font-heading font-black text-[12px] text-white group-hover:text-clay-orange transition-colors">PRO Status</span>
              </div>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard/plans" className="block transform transition-all hover:scale-[1.02] active:scale-95">
            <div className="bg-gradient-to-br from-clay-cream to-warm-white rounded-[25px] p-4 text-center border-2 border-clay-orange/10 shadow-clay-inset group">
              <div className="text-[10px] font-heading font-black text-clay-muted mb-0.5 uppercase tracking-tighter">Gói hiện tại</div>
              <div className="flex items-center justify-center gap-2 py-1">
                <span className="text-lg group-hover:animate-breathe">🌱</span>
                <span className="font-heading font-black text-[12px] text-clay-deep group-hover:text-clay-orange transition-colors">Thành viên FREE</span>
              </div>
            </div>
          </Link>
        )}

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3.5 rounded-[20px] text-clay-muted hover:bg-red-50 hover:text-red-500 transition-all font-heading font-black text-[13px]"
        >
          <div className="w-9 h-9 rounded-[14px] bg-white shadow-clay-button flex items-center justify-center">
            🚪
          </div>
          Đăng xuất
        </button>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi LinguaClay không?"
        onConfirm={async () => {
          setShowLogoutConfirm(false)
          await signOut()
        }}
        onCancel={() => setShowLogoutConfirm(false)}
        confirmText="Đăng xuất"
        danger
      />
    </div>
  )
}
