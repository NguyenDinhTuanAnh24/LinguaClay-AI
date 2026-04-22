'use client'

import React from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { normalizeVietnamese } from '@/app/lib/utils/normalize'

import { useAuth } from '@/providers/AuthProvider'

export default function PricingPage() {
  const { openAuth } = useAuth()
  const vn = normalizeVietnamese

  const landingPlans = [
    {
      id: 'trial',
      name: 'BẢN TIÊU CHUẨN',
      price: '299k',
      period: '/3 Tháng',
      features: ['Flashcards không giới hạn', 'AI Tutor Pro cơ bản', '100 Chủ điểm ngữ pháp Pro', 'Dễ dàng nâng cấp sau này'],
      highlight: false,
      ctaText: 'CHỌN BẢN TIÊU CHUẨN'
    },
    {
      id: 'flexible',
      name: 'BẢN CHUYÊN SÂU',
      price: '399k',
      period: '/6 Tháng',
      features: ['Flashcards không giới hạn', 'AI Tutor Pro (Phản hồi giọng nói)', '200+ Chủ điểm ngữ pháp Pro', 'Hệ thuật SRS cá nhân hóa', 'Hỗ trợ qua Email'],
      highlight: false,
      ctaText: 'CHỌN BẢN CHUYÊN SÂU'
    },
    {
      id: 'permanent',
      name: 'BẢN TOÀN DIỆN',
      price: '499k',
      period: '/1 Năm',
      features: ['Toàn bộ tính năng gói 6 tháng', 'Ưu tiên cập nhật tính năng mới sớm nhất', 'Tải file PDF bài học độc quyền', 'Không giới hạn AI Chatbot nâng cao', 'Hỗ trợ VIP 1:1 qua Zalo/Telegram'],
      highlight: true,
      badgeText: 'HỜI NHẤT',
      isBestValue: true,
      ctaText: 'CHỌN BẢN TOÀN DIỆN'
    }
  ]

  return (
    <div className="w-full bg-transparent overflow-x-hidden">
      {/* Intro Pricing Header */}
      <section className="w-full border-b-[3px] border-newsprint-black py-8 sm:py-10 bg-transparent flex flex-col items-center">
        <div className="max-w-[1200px] mx-auto px-6 text-center flex flex-col items-center">
          <span className="inline-block px-4 py-1 mb-8 border-[3px] border-newsprint-black bg-newsprint-white text-newsprint-black text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            GÓI HỌC
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-serif font-black text-newsprint-black mb-6 uppercase leading-tight tracking-tighter vietnamese-text">
            NÓI ĐƯỢC NGÔN NGỮ MỚI<br />NHANH HƠN BẠN NGHĨ
          </h1>
          <p className="text-base md:text-lg font-sans text-newsprint-gray-dark max-w-2xl mx-auto vietnamese-text mb-8">
            Dù bạn mới bắt đầu hay muốn nói lưu loát — chọn gói phù hợp và để AI lo phần còn lại.
          </p>

          <div className="flex items-center justify-center gap-2 mb-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-newsprint-black vietnamese-text">
            <span className="text-red-600 text-xs md:text-sm">★ ★ ★ ★ ★</span>
            <span className="hidden sm:inline">Hơn 2.000 học viên đang học mỗi ngày • Đánh giá 4.8/5</span>
            <span className="sm:hidden">2.000+ Học viên • 4.8/5 Sao</span>
          </div>

          <Link href="#pricing-table" className="text-[10px] sm:text-xs font-bold tracking-widest text-newsprint-gray-dark hover:text-newsprint-black transition-colors pb-1 flex items-center gap-2 vietnamese-text">
            ↓ Xem các gói học
          </Link>
        </div>
      </section>

      {/* Pricing Section Copied from Landing Page */}
      <section id="pricing-table" className="w-full bg-transparent py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto w-full px-6">
          <div className="w-full mb-16 text-center">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-newsprint-black vietnamese-text">
              {vn('Bảng giá minh bạch, đơn giản')}
            </h2>
            <p className="font-sans text-sm text-newsprint-gray-dark mt-4 vietnamese-text uppercase tracking-widest">
              {vn('Chọn gói học phù hợp với nhóm của bạn')}
            </p>
          </div>

          <div className="w-full font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-3 border-[3px] border-newsprint-black bg-transparent shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
              {landingPlans.map((plan, index) => (
                <div key={index} className={`p-8 lg:p-10 flex flex-col relative group hover:bg-newsprint-white transition-colors duration-300 ${index < landingPlans.length - 1 ? 'border-b-[3px] md:border-b-0 md:border-r-[3px] border-newsprint-black' : ''} ${plan.highlight ? 'bg-newsprint-white' : ''}`}>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-newsprint-black vietnamese-text">
                        {plan.name}
                      </h3>
                      {plan.badgeText && (
                        <div className={`text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest absolute top-0 right-0 border-b-[3px] border-l-[3px] border-newsprint-black ${plan.isBestValue ? 'bg-[#e63946]' : 'bg-red-600'}`}>
                          {vn(plan.badgeText)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mb-2 font-sans border-newsprint-black/30">
                      <span className="text-5xl font-black text-newsprint-black">{plan.price}</span>
                      <span className="text-sm font-sans font-normal text-newsprint-gray-dark">{plan.period}</span>
                    </div>
                    <hr className="border-t-[2px] border-dotted border-newsprint-gray-medium my-6" />
                    <ul className="space-y-4 mb-10">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-sans text-newsprint-gray-dark vietnamese-text">
                          <Check className="w-5 h-5 shrink-0 text-newsprint-black mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => openAuth('signin')}
                    className={`w-full text-center py-4 border-[3px] border-newsprint-black font-bold uppercase text-sm tracking-widest transition-colors vietnamese-text mt-auto ${plan.highlight ? 'bg-newsprint-black text-newsprint-white hover:bg-transparent hover:text-newsprint-black' : 'bg-transparent text-newsprint-black hover:bg-newsprint-black hover:text-newsprint-white'}`}
                  >
                    {vn(plan.ctaText as string)}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
