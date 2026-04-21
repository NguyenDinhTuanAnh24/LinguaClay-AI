'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { 
  LayoutDashboard, 
  Library, 
  Zap, 
  BarChart3,
  MessageSquare
} from 'lucide-react'

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-6 left-6 right-6 z-40">
      <div className="bg-white border-[3px] border-newsprint-black shadow-brutalist-card flex justify-around p-2">
        <MobileNavItem Icon={LayoutDashboard} href="/dashboard" active={pathname === '/dashboard'} />
        <MobileNavItem Icon={Library} href="/dashboard/grammar" active={pathname === '/dashboard/grammar'} />
        <MobileNavItem Icon={Zap} href="/dashboard/flashcards" active={pathname === '/dashboard/flashcards'} />
        <MobileNavItem Icon={MessageSquare} href="/dashboard/ai-chat" active={pathname === '/dashboard/ai-chat'} />
        <MobileNavItem Icon={BarChart3} href="/dashboard/progress" active={pathname === '/dashboard/progress'} />
      </div>
    </nav>
  )
}

function MobileNavItem({ 
  Icon, 
  href, 
  active = false 
}: { 
  Icon: any; 
  href: string; 
  active?: boolean 
}) {
  return (
    <Link 
      href={href}
      className={`w-12 h-12 flex items-center justify-center transition-all border-[2px] ${
        active 
          ? 'bg-newsprint-black text-white border-newsprint-black shadow-none translate-y-0.5' 
          : 'text-newsprint-black border-transparent hover:bg-newsprint-paper'
      }`}
    >
      <Icon size={20} strokeWidth={3} />
    </Link>
  )
}
