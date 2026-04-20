import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="py-20 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-heading font-black text-clay-deep tracking-tight">
            Về <span className="text-clay-blue">LinguaClay</span>
          </h1>
          <p className="text-xl text-clay-muted leading-relaxed font-medium">
            Chúng tôi tin rằng việc học một ngôn ngữ mới không chỉ là về sách vở, <br className="hidden md:block" />
            mà là về sự kiến tạo kỹ năng một cách tự nhiên như đất sét.
          </p>
        </div>

        {/* Our Vision */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 order-2 md:order-1">
            <h2 className="text-3xl font-heading font-black text-clay-deep">Tầm nhìn của chúng tôi</h2>
            <p className="text-clay-muted leading-relaxed">
              Dự án LinguaClay AI được sinh ra từ mong muốn xóa bỏ rào cản ngôn ngữ thông qua sự trợ giúp của Trí tuệ nhân tạo. 
              Chúng tôi không chỉ cung cấp bài tập; chúng tôi xây dựng một môi trường học tập sống động, 
              nơi mỗi học viên có thể nhìn thấy sự tiến bộ của mình qua từng ngày.
            </p>
            <div className="flex gap-4">
              <div className="bg-clay-blue/10 p-4 rounded-[20px] shadow-clay-inset w-1/2 text-center">
                <div className="text-2xl font-black text-clay-blue">5K+</div>
                <div className="text-xs font-bold text-clay-muted uppercase">Học viên</div>
              </div>
              <div className="bg-clay-green/10 p-4 rounded-[20px] shadow-clay-inset w-1/2 text-center">
                <div className="text-2xl font-black text-clay-green">200+</div>
                <div className="text-xs font-bold text-clay-muted uppercase">Chủ điểm</div>
              </div>
            </div>
          </div>
          <div className="relative order-1 md:order-2">
             <div className="w-full aspect-square bg-gradient-to-br from-clay-blue to-clay-green rounded-[50px] shadow-clay-card flex items-center justify-center text-8xl transform rotate-3">
               🏺
             </div>
             <div className="absolute -top-6 -right-6 w-24 h-24 bg-clay-pink rounded-full shadow-clay-float animate-float" />
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-12">
          <h2 className="text-3xl font-heading font-black text-clay-deep text-center">Giá trị cốt lõi</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { t: 'Đơn giản', d: 'Giao diện tinh gọn, dễ sử dụng cho mọi lứa tuổi.', i: '✨', c: 'clay-blue' },
              { t: 'Thông minh', d: 'AI cá nhân hóa lộ trình dựa trên điểm mạnh/yếu.', i: '🧠', c: 'clay-orange' },
              { t: 'Bền vững', d: 'Phương pháp SRS giúp ghi nhớ kiến thức vĩnh viễn.', i: '🌱', c: 'clay-green' }
            ].map((v, i) => (
              <div key={i} className="bg-white/60 p-8 rounded-[35px] shadow-clay-card border-2 border-white space-y-4 text-center">
                <div className={`w-14 h-14 mx-auto bg-${v.c}/10 rounded-full flex items-center justify-center text-2xl shadow-clay-inset`}>
                  {v.i}
                </div>
                <h3 className="font-heading font-black text-clay-deep text-lg">{v.t}</h3>
                <p className="text-sm text-clay-muted leading-snug">{v.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Join Us CTA */}
        <div className="bg-gradient-to-br from-clay-deep to-clay-brown-dark rounded-[50px] p-12 text-center text-white shadow-clay-card relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clay.png')] opacity-10" />
          <h2 className="text-3xl md:text-4xl font-heading font-black mb-6 relative">Sẵn sàng kiến tạo tương lai của bạn?</h2>
          <Link href="/login" className="inline-block px-10 py-5 bg-white text-clay-brown-dark font-heading font-black rounded-full shadow-xl hover:scale-105 transition-all relative">
            Bắt đầu học ngay
          </Link>
        </div>
      </div>
    </div>
  )
}
