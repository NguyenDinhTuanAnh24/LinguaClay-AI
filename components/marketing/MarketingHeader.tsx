'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import AuthDrawer from './AuthDrawer'
import { useAuth } from '@/providers/AuthProvider'

export default function MarketingHeader() {
  const t = useTranslations('marketing.header')
  const { isAuthOpen, authTab, openAuth, closeAuth } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b-[3px] border-newsprint-black w-full relative z-50 bg-[#F5F0E8]">
      <div className="max-w-[1280px] mx-auto w-full px-6 py-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden border-2 border-newsprint-black bg-newsprint-white relative flex items-center justify-center hover:-translate-y-1 transition-transform">
              <Image src="/logo.png" alt="LinguaClay Logo" fill sizes="100px" className="object-cover" />
            </div>
            <span className="text-xl md:text-2xl font-serif font-bold tracking-tight text-newsprint-black vietnamese-text">
              LinguaClay
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/product/features" className="text-sm font-bold uppercase tracking-widest text-newsprint-black hover:underline vietnamese-text">
              {t('features')}
            </Link>
            <Link href="/product/pricing" className="text-sm font-bold uppercase tracking-widest text-newsprint-black hover:underline vietnamese-text">
              {t('pricing')}
            </Link>
            <Link href="/company/about" className="text-sm font-bold uppercase tracking-widest text-newsprint-black hover:underline vietnamese-text">
              {t('about')}
            </Link>
            <button
              onClick={() => openAuth('signin')}
              className="px-5 py-2.5 bg-black text-white font-sans font-black uppercase tracking-widest text-xs border-2 border-black hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] active:translate-y-1 active:shadow-none"
            >
              {t('startFree')}
            </button>
          </nav>

          <button className="lg:hidden flex flex-col gap-1.5 p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className={`w-8 h-[3px] bg-black transition-all ${isMenuOpen ? 'rotate-45 translate-y-[9px]' : ''}`} />
            <div className={`w-8 h-[3px] bg-black transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-8 h-[3px] bg-black transition-all ${isMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
          </button>
        </div>

        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-[400px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col gap-6 pb-6 border-t-[3px] border-newsprint-black pt-6">
            <Link href="/product/features" className="text-sm font-bold uppercase tracking-widest text-newsprint-black vietnamese-text" onClick={() => setIsMenuOpen(false)}>
              {t('features')}
            </Link>
            <Link href="/product/pricing" className="text-sm font-bold uppercase tracking-widest text-newsprint-black vietnamese-text" onClick={() => setIsMenuOpen(false)}>
              {t('pricing')}
            </Link>
            <Link href="/company/about" className="text-sm font-bold uppercase tracking-widest text-newsprint-black vietnamese-text" onClick={() => setIsMenuOpen(false)}>
              {t('about')}
            </Link>
            <button
              onClick={() => {
                openAuth('signin')
                setIsMenuOpen(false)
              }}
              className="w-full py-4 bg-black text-white font-sans font-black uppercase tracking-widest text-xs border-2 border-black active:translate-y-1"
            >
              {t('startFree')}
            </button>
          </div>
        </div>
      </div>

      <AuthDrawer isOpen={isAuthOpen} onClose={closeAuth} initialTab={authTab} />
    </header>
  )
}
