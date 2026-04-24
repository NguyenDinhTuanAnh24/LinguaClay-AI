'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/providers/AuthProvider'

export default function Navbar() {
  const { openAuth } = useAuth()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-clay-cream/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-clay-orange to-clay-orange/80 rounded-[12px] shadow-clay-button flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <span className="text-xl md:text-2xl font-heading font-bold text-clay-deep tracking-tight">
            LinguaClay AI
          </span>
        </Link>
        <ul className="hidden md:flex gap-8 items-center">
          <li><Link href="/product/features" className="text-clay-muted hover:text-clay-blue transition-colors font-medium">Tính năng</Link></li>
          <li><Link href="/product/pricing" className="text-clay-muted hover:text-clay-blue transition-colors font-medium">Học phí</Link></li>
          <li><Link href="/company/about" className="text-clay-muted hover:text-clay-blue transition-colors font-medium">Về chúng tôi</Link></li>
          <li><Link href="/company/contact" className="text-clay-muted hover:text-clay-blue transition-colors font-medium">Liên hệ</Link></li>
        </ul>
        <button onClick={() => openAuth('signin')} className="px-6 md:px-8 py-3 bg-gradient-to-br from-clay-brown to-clay-brown-dark text-white text-sm md:text-base font-bold rounded-[50px] shadow-clay-button hover:shadow-clay-button-hover active:scale-[0.95] transition-all duration-100 font-heading">
          Bắt Đầu
        </button>
      </div>
    </nav>
  )
}
