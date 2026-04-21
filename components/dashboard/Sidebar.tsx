'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  BookOpen, 
  Library, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut, 
  Zap, 
  ChevronRight,
  User
} from 'lucide-react'

const menuItems = [
  { name: 'Tổng quan', icon: LayoutDashboard, path: '/dashboard' },
  { 
    name: 'Học tập', 
    icon: BookOpen, 
    children: [
      { name: 'Ngữ pháp', icon: Library, path: '/dashboard/grammar' },
      { name: 'Flashcard', icon: Zap, path: '/dashboard/flashcards' },
      { name: 'Đối thoại AI', icon: MessageSquare, path: '/dashboard/ai-chat' },
    ]
  },
  { name: 'Tiến độ', icon: BarChart3, path: '/dashboard/progress' },
  { name: 'Cài đặt', icon: Settings, path: '/dashboard/settings' },
]

export default function Sidebar({ user, dbUser }: { user: any, dbUser: any }) {
  const pathname = usePathname()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  const isLearnChild = pathname.includes('/dashboard/grammar') || 
                      pathname.includes('/dashboard/flashcards') || 
                      pathname.includes('/dashboard/ai-chat')
                      
  const [learnOpen, setLearnOpen] = useState(isLearnChild)

  useEffect(() => {
    if (isLearnChild) setLearnOpen(true)
  }, [pathname, isLearnChild])

  const isPro = dbUser?.isPro || false

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  return (
    <div className="h-full bg-white/40 backdrop-blur-3xl rounded-[40px] shadow-clay-card flex flex-col p-6 overflow-hidden border-2 border-white/60">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-clay-blue/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2 relative z-10">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-clay-button flex items-center justify-center border-2 border-clay-cream/50 relative overflow-hidden">
          <Image src="/logo.png" alt="Logo" fill sizes="100px" className="object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-heading font-black text-clay-deep tracking-tight">LinguaClay</span>
          <span className="text-[10px] font-bold text-clay-blue uppercase tracking-widest">Học hiệu quả</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide relative z-10">
        {menuItems.map((item) => {
          if (item.children) {
            const Icon = item.icon
            return (
              <div key={item.name} className="space-y-1">
                {/* Parent Item */}
                <button
                  onClick={() => setLearnOpen(!learnOpen)}
                  className={`w-full flex items-center justify-between p-4 rounded-3xl transition-all duration-300 group ${
                    isLearnChild ? 'bg-white shadow-clay-button border-2 border-white text-clay-blue' : 'hover:bg-white/50 text-clay-muted border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-xl transition-all ${isLearnChild ? 'bg-clay-blue/10' : 'bg-transparent group-hover:bg-white'}`}>
                      <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <span className="font-heading font-black text-[13px]">{item.name}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: learnOpen ? 90 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <ChevronRight size={14} className="opacity-50" strokeWidth={3} />
                  </motion.div>
                </button>

                {/* Children Items */}
                <AnimatePresence initial={false}>
                  {learnOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden space-y-1 relative"
                    >
                      <div className="absolute left-7 top-2 bottom-2 w-0.5 bg-white rounded-full bg-opacity-50" />
                      
                      {item.children.map((child) => {
                        const isChildActive = pathname === child.path
                        const ChildIcon = child.icon
                        return (
                          <Link
                            key={child.path}
                            href={child.path}
                            className={`flex items-center gap-3 p-3 ml-5 pl-6 rounded-2xl transition-all duration-300 ${
                              isChildActive
                                ? 'bg-white shadow-clay-button border-2 border-white text-clay-blue translate-x-1'
                                : 'text-clay-muted hover:bg-white/50 hover:translate-x-1 border-2 border-transparent'
                            }`}
                          >
                            <ChildIcon size={14} strokeWidth={2.5} />
                            <span className="font-heading font-black text-xs">
                              {child.name}
                            </span>
                            {isChildActive && (
                              <motion.div 
                                layoutId="activeDot"
                                className="w-1.5 h-1.5 rounded-full bg-clay-orange ml-auto" 
                              />
                            )}
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
          const Icon = item.icon
          return (
            <Link 
              key={item.path} 
              href={item.path!}
              className={`flex items-center gap-3 p-4 rounded-3xl transition-all duration-300 group border-2 ${
                isActive 
                ? 'bg-white shadow-clay-button text-clay-blue border-white' 
                : 'hover:bg-white/50 text-clay-muted border-transparent hover:border-white/50'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-clay-blue/10' : 'bg-transparent group-hover:bg-white'}`}>
                <Icon size={18} strokeWidth={2.5} />
              </div>
              <span className="font-heading font-black text-[13px]">
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Info */}
      <div className="mt-6 pt-6 border-t-2 border-white/40 space-y-4 relative z-10">
        <Link href="/dashboard/plans" className="block group">
          <div className={`p-4 rounded-3xl transition-all ${
            isPro ? 'bg-gradient-to-br from-[#1E293B] to-[#0F172A] shadow-[0_10px_20px_rgba(15,23,42,0.3)]' : 'bg-white shadow-clay-button border-2 border-white group-hover:shadow-clay-button-hover group-active:scale-95'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isPro ? 'bg-white/10 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)]' : 'bg-clay-blue/10'
              }`}>
                <Zap size={18} className={isPro ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-clay-blue'} strokeWidth={isPro ? 2 : 2.5} />
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] font-bold ${isPro ? 'text-slate-400' : 'text-clay-muted'} uppercase tracking-wider`}>Hội viên</span>
                <span className={`text-xs font-heading font-black ${isPro ? 'text-white' : 'text-clay-deep'}`}>
                  {isPro ? 'PRO Plan ✨' : 'Free Plan'}
                </span>
              </div>
            </div>
          </div>
        </Link>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 text-clay-muted hover:text-clay-pink hover:bg-white/50 rounded-3xl transition-all font-heading font-black text-xs group"
        >
          <LogOut size={16} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
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

