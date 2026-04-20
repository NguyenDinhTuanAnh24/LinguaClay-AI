'use client'

import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-warm-white py-12 md:py-16 px-4 md:px-0 border-t border-clay-shadow/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-clay-blue to-clay-green rounded-[30px] shadow-clay-card flex items-center justify-center">
                <span className="text-xl">🏺</span>
              </div>
              <span className="text-xl font-heading font-bold text-clay-deep">LinguaClay AI</span>
            </div>
            <p className="text-sm text-clay-muted font-body">
              Xây dựng kỹ năng ngôn ngữ cùng AI. Trải nghiệm học tập Claymorphism tinh tế.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://zalo.me/0866555468" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-clay-cream rounded-[20px] shadow-clay-button flex items-center justify-center hover:shadow-clay-button-hover transition-shadow text-[#0068FF] font-black text-sm"
                title="Zalo"
              >
                Z
              </a>
              <a 
                href="https://t.me/anh249205" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-clay-cream rounded-[20px] shadow-clay-button flex items-center justify-center hover:shadow-clay-button-hover transition-shadow text-[#24A1DE] font-black text-sm"
                title="Telegram"
              >
                T
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-bold text-clay-deep text-lg">Sản phẩm</h4>
            <ul className="space-y-2 text-sm text-clay-muted font-body">
              <li><Link href="/product/features" className="hover:text-clay-blue transition-colors">Tính năng</Link></li>
              <li><Link href="/product/pricing" className="hover:text-clay-blue transition-colors">Học phí</Link></li>
              <li><Link href="/product/faq" className="hover:text-clay-blue transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-bold text-clay-deep text-lg">Công ty</h4>
            <ul className="space-y-2 text-sm text-clay-muted font-body">
              <li><Link href="/company/about" className="hover:text-clay-blue transition-colors">Về chúng tôi</Link></li>
              <li><Link href="/company/blog" className="hover:text-clay-blue transition-colors">Blog</Link></li>
              <li><Link href="/company/contact" className="hover:text-clay-blue transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-bold text-clay-deep text-lg">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-clay-muted font-body">
              <li><Link href="/support/help" className="hover:text-clay-blue transition-colors">Trung tâm trợ giúp</Link></li>
              <li><Link href="/support/privacy" className="hover:text-clay-blue transition-colors">Chính sách bảo mật</Link></li>
              <li><Link href="/support/terms" className="hover:text-clay-blue transition-colors">Điều khoản sử dụng</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-clay-shadow/30 pt-6 text-center text-sm text-clay-muted font-body">
          <p>© 2026 LinguaClay AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
