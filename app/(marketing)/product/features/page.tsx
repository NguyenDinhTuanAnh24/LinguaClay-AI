'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function FeaturesPage() {
  return (
    <div className="py-20 px-6 md:px-12 space-y-24">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-heading font-black text-clay-deep tracking-tight">
          Sức Mạnh Của <span className="text-clay-blue">LinguaClay AI</span>
        </h1>
        <p className="text-lg text-clay-muted max-w-2xl mx-auto font-medium">
          Khám phá những công nghệ đột phá giúp việc học ngôn ngữ trở nên cá nhân hóa, hiệu quả và đầy cảm hứng.
        </p>
      </div>

      {/* Feature Sections */}
      <div className="max-w-6xl mx-auto space-y-32">
        
        {/* 1. AI Tutor */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-clay-orange/10 rounded-[25px] flex items-center justify-center text-3xl shadow-clay-inset">🤖</div>
            <h2 className="text-3xl font-heading font-black text-clay-deep">Giáo Viên AI Thông Minh</h2>
            <p className="text-clay-muted leading-relaxed font-medium">
              Sử dụng mô hình ngôn ngữ tiên tiến nhất (LLM), AI Tutor của chúng tôi không chỉ trả lời câu hỏi mà còn hiểu được bối cảnh học tập của bạn. 
            </p>
            <ul className="space-y-3">
              {[
                'Sửa lỗi ngữ pháp ngay lập tức trong hội thoại',
                'Gợi ý cách dùng từ tự nhiên như người bản xứ',
                'Phân tích và chấm điểm phát âm qua Voice AI'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-clay-deep/80">
                  <div className="w-5 h-5 bg-clay-orange/20 rounded-full flex items-center justify-center text-[10px] text-clay-orange">✓</div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/80 rounded-[50px] shadow-clay-card border-4 border-white p-8 md:p-12 aspect-square flex items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-clay-orange/10 rounded-full blur-3xl" />
             <div className="text-9xl animate-breathe drop-shadow-2xl">⚡</div>
          </div>
        </div>

        {/* 2. 200+ Grammar Points */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="bg-white/80 rounded-[50px] shadow-clay-card border-4 border-white p-8 md:p-12 aspect-square flex items-center justify-center relative overflow-hidden order-2 md:order-1">
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-clay-blue/10 rounded-full blur-3xl" />
             <div className="text-9xl transform -rotate-12 drop-shadow-2xl">🏺</div>
          </div>
          <div className="space-y-6 order-1 md:order-2">
            <div className="w-16 h-16 bg-clay-blue/10 rounded-[25px] flex items-center justify-center text-3xl shadow-clay-inset">📚</div>
            <h2 className="text-3xl font-heading font-black text-clay-deep">Thư Viện 200+ Điểm Ngữ Pháp</h2>
            <p className="text-clay-muted leading-relaxed font-medium">
              Được thiết kế bởi các chuyên gia ngôn ngữ, hệ thống bài học bao trùm từ trình độ Beginner đến Advanced (A1 đến C1).
            </p>
            <ul className="space-y-3">
              {[
                'Giải thích chi tiết, dễ hiểu qua ví dụ thực tế',
                'Hệ thống bài tập thực hành tương tác cao',
                'Ghi chú cá nhân cho từng điểm ngữ pháp'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-clay-deep/80">
                  <div className="w-5 h-5 bg-clay-blue/20 rounded-full flex items-center justify-center text-[10px] text-clay-blue">✓</div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. SRS Algorithm */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-clay-green/10 rounded-[25px] flex items-center justify-center text-3xl shadow-clay-inset">🧠</div>
            <h2 className="text-3xl font-heading font-black text-clay-deep">Thuật Toán Ghi Nhớ SRS</h2>
            <p className="text-clay-muted leading-relaxed font-medium">
              Phương pháp Spaced Repetition (Lặp lại ngắt quãng) giúp bạn chuyển hóa kiến thức từ trí nhớ ngắn hạn sang dài hạn một cách khoa học.
            </p>
            <ul className="space-y-3">
              {[
                'Tự động nhắc lại từ vựng đúng thời điểm &quot;vàng&quot;',
                'Giảm 80% thời gian học bài cũ',
                'Tối ưu hóa khả năng phản xạ tự nhiên'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-clay-deep/80">
                  <div className="w-5 h-5 bg-clay-green/20 rounded-full flex items-center justify-center text-[10px] text-clay-green">✓</div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/80 rounded-[50px] shadow-clay-card border-4 border-white p-8 md:p-12 aspect-square flex items-center justify-center relative overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-clay-green/10 rounded-full blur-3xl" />
             <div className="text-9xl animate-float drop-shadow-2xl">🚀</div>
          </div>
        </div>

      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-clay-blue to-clay-green rounded-[50px] p-12 text-center text-white shadow-clay-card">
        <h2 className="text-3xl font-heading font-black mb-6">Trải nghiệm mọi tính năng PRO ngay!</h2>
        <Link href="/login" className="inline-block px-12 py-5 bg-white text-clay-blue font-heading font-black rounded-full shadow-xl hover:scale-105 transition-all">
          Dùng thử miễn phí 14 ngày
        </Link>
      </div>
    </div>
  )
}
