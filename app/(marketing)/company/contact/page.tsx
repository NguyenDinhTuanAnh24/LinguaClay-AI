'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import AuthTrigger from '@/components/marketing/AuthTrigger'
import Image from 'next/image'
import { Mail, MapPin, Phone, MessageCircle, Send, ArrowRight } from 'lucide-react'


export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="w-full bg-[#F5F0E8] overflow-x-hidden">

      {/* 1. Hero Section */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-transparent pt-16 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 text-center flex flex-col items-center">
          <span className="inline-block px-4 py-1 mb-6 border-[3px] border-newsprint-black bg-newsprint-white text-newsprint-black text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            HỖ TRỢ
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black uppercase text-newsprint-black leading-tight tracking-tight vietnamese-text mb-6 max-w-4xl">
            Chúng tôi luôn ở đây khi bạn cần
          </h1>
          <p className="text-lg md:text-xl font-sans text-newsprint-gray-dark max-w-2xl mx-auto vietnamese-text">
            Có câu hỏi về tài khoản, gói học hay tính năng? Gửi cho chúng tôi — thường phản hồi trong vòng <span className="font-sans font-black text-newsprint-black whitespace-nowrap">24 giờ</span>.
          </p>
        </div>
      </section>

      {/* 2. Form + Info — 2 cột rộng */}
      <section className="w-full py-20 border-b-[3px] border-newsprint-black bg-transparent">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-0 border-[3px] border-newsprint-black shadow-[10px_10px_0px_0px_rgba(20,20,20,1)]">

            {/* Cột trái: Thông tin liên hệ */}
            <div className="bg-newsprint-black text-newsprint-white p-10 sm:p-14 flex flex-col gap-10 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-newsprint-black">
              <div>
                <h2 className="font-sans font-black text-2xl uppercase text-newsprint-white mb-6 vietnamese-text">Thông tin liên hệ</h2>
                <div className="space-y-6">
                  {[
                    { icon: Mail, label: 'Email', value: 'anh249205@gmail.com' },
                    { icon: Phone, label: 'Hotline', value: '0866 555 468' },
                    { icon: MapPin, label: 'Địa chỉ', value: 'Cầu Giấy, Hà Nội, Việt Nam' },
                  ].map(({ icon: Icon, label, value }, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className="w-10 h-10 border-[2px] border-newsprint-white flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-600 group-hover:border-red-600 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-newsprint-gray-medium mb-1">{label}</p>
                        <p className="font-sans font-bold text-sm text-newsprint-white vietnamese-text leading-snug">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t-[2px] border-newsprint-gray-dark/40 pt-8">
                <h3 className="font-sans font-black text-sm uppercase tracking-widest text-newsprint-gray-medium mb-4">Liên hệ nhanh qua</h3>
                <div className="flex flex-col gap-3">
                  <a href="https://zalo.me/0866555468" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 px-5 py-2.5 border-[2px] border-newsprint-white/30 hover:border-newsprint-white hover:bg-newsprint-white/10 transition-all text-sm font-bold text-newsprint-white uppercase tracking-widest">
                    <div className="w-8 h-8 relative flex items-center justify-center bg-white rounded-sm overflow-hidden">
                      <Image src="/social/zalo.png" alt="Zalo" width={32} height={32} className="object-contain" />
                    </div>
                    Zalo
                  </a>
                  <a href="https://t.me/tzora24" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 px-5 py-2.5 border-[2px] border-newsprint-white/30 hover:border-newsprint-white hover:bg-newsprint-white/10 transition-all text-sm font-bold text-newsprint-white uppercase tracking-widest">
                    <div className="w-8 h-8 relative flex items-center justify-center bg-white rounded-full overflow-hidden">
                      <Image src="/social/telegram.png" alt="Telegram" width={32} height={32} className="object-contain" />
                    </div>
                    Telegram
                  </a>
                </div>
              </div>

              {/* Thời gian làm việc */}
              <div className="border-t-[2px] border-newsprint-gray-dark/40 pt-8 mt-auto">
                <p className="text-[10px] font-bold uppercase tracking-widest text-newsprint-gray-medium mb-3">Giờ hỗ trợ</p>
                <p className="font-sans text-sm text-newsprint-white">Thứ 2 – Thứ 6: <span className="font-black">8:00 – 18:00</span></p>
                <p className="font-sans text-sm text-newsprint-white">Thứ 7 – CN: <span className="font-black">9:00 – 12:00</span></p>
              </div>
            </div>

            {/* Cột phải: Form */}
            <div className="bg-newsprint-white p-10 sm:p-14">
              <h2 className="font-sans font-black text-2xl uppercase text-newsprint-black mb-8 vietnamese-text">Gửi tin nhắn cho chúng tôi</h2>

              {status === 'success' ? (
                <div className="border-[3px] border-newsprint-black bg-[#EBE3D5] p-10 text-center shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]">
                  <div className="text-4xl mb-4">✓</div>
                  <h3 className="font-sans font-black text-xl uppercase text-newsprint-black mb-2 vietnamese-text">Đã gửi thành công!</h3>
                  <p className="font-sans text-newsprint-gray-dark">Chúng tôi sẽ phản hồi trong vòng <span className="font-black whitespace-nowrap">24 giờ</span> làm việc.</p>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-newsprint-black mb-2">Họ và tên *</label>
                      <input
                        required type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        className="w-full h-12 px-4 border-[3px] border-newsprint-black bg-[#F5F0E8] font-sans text-sm text-newsprint-black placeholder:text-newsprint-gray-medium focus:outline-none focus:border-red-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-newsprint-black mb-2">Email *</label>
                      <input
                        required type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="example@gmail.com"
                        className="w-full h-12 px-4 border-[3px] border-newsprint-black bg-[#F5F0E8] font-sans text-sm text-newsprint-black placeholder:text-newsprint-gray-medium focus:outline-none focus:border-red-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-newsprint-black mb-2">Chủ đề</label>
                    <select
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full h-12 px-4 border-[3px] border-newsprint-black bg-[#F5F0E8] font-sans text-sm text-newsprint-black focus:outline-none focus:border-red-600 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Chọn chủ đề...</option>
                      <option>Vấn đề tài khoản</option>
                      <option>Thanh toán & Gói học</option>
                      <option>Lỗi tính năng</option>
                      <option>Góp ý cải thiện</option>
                      <option>Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-newsprint-black mb-2">Lời nhắn *</label>
                    <textarea
                      required rows={6}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Mô tả vấn đề hoặc câu hỏi của bạn..."
                      className="w-full p-4 border-[3px] border-newsprint-black bg-[#F5F0E8] font-sans text-sm text-newsprint-black placeholder:text-newsprint-gray-medium focus:outline-none focus:border-red-600 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-5 bg-newsprint-black text-newsprint-white font-bold uppercase tracking-widest text-sm border-[3px] border-newsprint-black hover:bg-transparent hover:text-newsprint-black transition-colors shadow-[4px_4px_0px_0px_rgba(230,57,70,1)] disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {status === 'loading' ? 'Đang gửi...' : <><Send className="w-4 h-4" /> GỬI TIN NHẮN</>}
                  </button>

                  {status === 'error' && (
                    <p className="text-center text-red-600 font-bold text-sm border-[2px] border-red-600 py-3 px-4 bg-red-50">
                      ✕ Có lỗi xảy ra, vui lòng thử lại hoặc liên hệ qua Zalo.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA cuối trang */}
      <section className="w-full py-24 sm:py-32 bg-transparent text-newsprint-black border-t-[3px] border-newsprint-black">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-sans font-black uppercase text-newsprint-black leading-tight tracking-tight mb-8 vietnamese-text">
            Vẫn còn thắc mắc?
          </h2>
          <p className="text-lg md:text-xl font-serif italic text-newsprint-gray-dark mb-12 max-w-2xl mx-auto vietnamese-text">
            Xem bộ câu hỏi thường gặp — hoặc bắt đầu dùng thử miễn phí ngay hôm nay.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/product/faq" className="w-full sm:w-auto px-10 py-5 bg-transparent text-newsprint-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors font-sans border-[3px] border-newsprint-black flex items-center justify-center gap-2">
              XEM FAQ <ArrowRight className="w-4 h-4" />
            </Link>
            <AuthTrigger tab="signin" className="w-full sm:w-auto px-10 py-5 bg-newsprint-black text-newsprint-white font-bold uppercase tracking-widest text-sm border-[3px] border-newsprint-black hover:bg-white hover:text-newsprint-black transition-colors font-sans shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]">
              BẮT ĐẦU MIỄN PHÍ
            </AuthTrigger>
          </div>
        </div>
      </section>

    </div>
  )
}
