import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Phone } from 'lucide-react'

export default function MarketingFooter() {
  return (
    <footer className="bg-transparent text-newsprint-black py-12 md:py-20 font-sans border-t-[3px] border-newsprint-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12 md:mb-16">
          {/* Logo and Description Column */}
          <div className="md:col-span-5 pr-8">
            <Link href="/" className="flex items-center gap-2 mb-4 md:mb-6">
              <span className="text-3xl font-serif font-black tracking-tight uppercase">LinguaClay</span>
            </Link>
            <p className="font-sans text-newsprint-gray-dark text-sm leading-relaxed vietnamese-text mb-4 md:mb-6">
              Học ngôn ngữ thông minh với AI. Kết hợp SRS khoa học và thiết kế độc đáo để mang lại trải nghiệm tối ưu nhất cho người dùng.
            </p>
            <div className="flex gap-4 md:gap-6">
              {/* Telegram */}
              <a href="https://t.me/tzora24" target="_blank" rel="noopener noreferrer"
                className="transition-transform hover:scale-110 active:scale-95 group rounded-full overflow-hidden">
                <Image 
                  src="/social/telegram.png" 
                  alt="Telegram" 
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </a>
              {/* Zalo */}
              <a href="https://zalo.me/0866555468" target="_blank" rel="noopener noreferrer"
                className="transition-transform hover:scale-110 active:scale-95 group">
                <Image 
                  src="/social/zalo.png" 
                  alt="Zalo" 
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </a>
            </div>
          </div>

          {/* Links Column Group - 2 columns on mobile, 3 on desktop */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-4">
            {/* Sản phẩm */}
            <div>
              <h4 className="font-bold uppercase tracking-widest text-newsprint-black text-xs md:text-xs mb-4 md:mb-6 vietnamese-text">SẢN PHẨM</h4>
              <ul className="space-y-2 md:space-y-4 font-sans text-sm md:text-sm text-newsprint-gray-dark">
                <li><Link href="/product/features" className="hover:text-newsprint-black hover:underline transition-colors vietnamese-text">Tính năng</Link></li>
                <li><Link href="/product/pricing" className="hover:text-newsprint-black hover:underline transition-colors vietnamese-text">Bảng giá</Link></li>
                <li><Link href="/product/flashcard" className="hover:text-newsprint-black hover:underline transition-colors vietnamese-text">Flashcard</Link></li>
                <li><Link href="/product/ai-tutor" className="hover:text-newsprint-black hover:underline transition-colors vietnamese-text">AI Tutor</Link></li>
                <li><Link href="/product/grammar" className="hover:text-newsprint-black hover:underline transition-colors vietnamese-text">Ngữ pháp</Link></li>
              </ul>
            </div>

            {/* Công ty */}
            <div>
              <h4 className="font-bold uppercase tracking-widest text-newsprint-black text-xs md:text-xs mb-4 md:mb-6 vietnamese-text">CÔNG TY</h4>
              <ul className="space-y-2 md:space-y-4 font-sans text-sm md:text-sm text-newsprint-gray-dark">
                <li><Link href="/company/about" className="hover:text-newsprint-black hover:underline transition-colors vietnamese-text">Về chúng tôi</Link></li>
                <li><Link href="/blog" className="hover:text-newsprint-black hover:underline transition-colors vietnamese-text">Blog</Link></li>
                <li><Link href="/company/contact" className="hover:text-newsprint-black hover:underline transition-colors vietnamese-text">Liên hệ & Trợ giúp</Link></li>
                <li><Link href="/product/faq" className="hover:text-newsprint-black hover:underline transition-colors vietnamese-text">FAQ</Link></li>
              </ul>
            </div>

            {/* Pháp lý */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-bold uppercase tracking-widest text-newsprint-black text-xs md:text-xs mb-4 md:mb-6 vietnamese-text">PHÁP LÝ</h4>
              <ul className="space-y-2 md:space-y-4 font-sans text-sm md:text-sm text-newsprint-gray-dark">
                <li><Link href="/support/terms" className="hover:text-newsprint-black hover:underline transition-colors vietnamese-text">Điều khoản dịch vụ</Link></li>
                <li><Link href="/support/privacy" className="hover:text-newsprint-black hover:underline transition-colors vietnamese-text">Chính sách bảo mật</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center font-sans text-xs md:text-[13px] text-newsprint-gray-dark font-bold tracking-widest pt-8 border-t border-newsprint-gray-medium gap-4">
          <div>© 2026 LINGUACLAY. ALL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4" />
            <span>0866 555 468</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
