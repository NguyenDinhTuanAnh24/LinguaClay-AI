'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40">
      <div className="bg-warm-white/90 backdrop-blur-md rounded-[30px] shadow-clay-card border-2 border-white flex justify-around p-3">
        <MobileNavItem icon="🏠" href="/dashboard" active={pathname === '/dashboard'} />
        <MobileNavItem icon="📚" href="/dashboard/learn" active={pathname === '/dashboard/learn'} />
        <MobileNavItem icon="🏺" href="/dashboard/grammar" active={pathname === '/dashboard/grammar'} />
        <MobileNavItem icon="🃏" href="/dashboard/flashcards" active={pathname === '/dashboard/flashcards'} />
        <MobileNavItem icon="📊" href="/dashboard/progress" active={pathname === '/dashboard/progress'} />
      </div>
    </nav>
  )
}

function MobileNavItem({ 
  icon, 
  href, 
  active = false 
}: { 
  icon: string; 
  href: string; 
  active?: boolean 
}) {
  return (
    <Link 
      href={href}
      className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all ${
        active ? 'bg-clay-blue text-white shadow-clay-pressed' : 'text-clay-muted'
      }`}
    >
      <span className="text-xl">{icon}</span>
    </Link>
  )
}
