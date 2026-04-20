'use client'

import React from 'react'

export default function ContactPage() {
  const [formData, setFormData] = React.useState({ name: '', email: '', message: '' })
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')

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
        setFormData({ name: '', email: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div className="py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Contact Info */}
        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl font-heading font-black text-clay-deep tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-clay-blue to-clay-green">
              Liên Hệ
            </h1>
            <p className="text-lg text-clay-muted font-medium leading-relaxed">
              Bạn có câu hỏi hoặc ý tưởng thú vị? Đừng ngần ngại chia sẻ với đội ngũ LinguaClay. 
              Chúng tôi luôn ở đây để lắng nghe.
            </p>
          </div>

          <div className="space-y-8">
            {[
              { t: 'Email', v: 'anh249205@gmail.com', i: '📧' },
              { t: 'Địa chỉ', v: 'Số 9, tổ 12, ngách 44/130, đường Trần Thái Tông, phường Dịch Vọng Hậu, quận Cầu Giấy, Hà Nội', i: '📍' },
              { t: 'Hotline', v: '0866555468', i: '📞' }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-center group">
                <div className="w-14 h-14 bg-white rounded-[20px] shadow-clay-button flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 border border-white">
                  {item.i}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black text-clay-muted uppercase tracking-widest">{item.t}</div>
                  <div className="text-sm md:text-lg font-bold text-clay-deep leading-snug">{item.v}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Social icons block */}
          <div className="pt-8 space-y-4">
            <h4 className="text-sm font-black text-clay-deep uppercase">Kết nối nhanh qua</h4>
            <div className="flex gap-4">
               <a 
                 href="https://zalo.me/0866555468" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-3 px-6 py-3 rounded-[20px] bg-[#0068FF]/10 text-[#0068FF] shadow-clay-button hover:shadow-clay-button-hover transition-all font-black text-sm border-2 border-white"
               >
                 <span className="text-xl">💬</span> Zalo
               </a>
               <a 
                 href="https://t.me/anh249205" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-3 px-6 py-3 rounded-[20px] bg-[#24A1DE]/10 text-[#24A1DE] shadow-clay-button hover:shadow-clay-button-hover transition-all font-black text-sm border-2 border-white"
               >
                 <span className="text-xl">✈️</span> Telegram
               </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white/90 backdrop-blur-md rounded-[50px] shadow-clay-card border-4 border-white p-10 md:p-14 space-y-8">
          <h2 className="text-2xl font-heading font-black text-clay-deep">Gửi tin nhắn cho chúng tôi</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-clay-deep uppercase tracking-widest pl-2">Họ và tên</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nguyễn Văn A" 
                className="w-full h-14 px-6 bg-clay-cream/30 rounded-[22px] shadow-clay-inset border-2 border-transparent focus:border-clay-blue/30 focus:outline-none transition-all font-bold text-clay-deep disabled:opacity-50"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-clay-deep uppercase tracking-widest pl-2">Địa chỉ Email</label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@gmail.com" 
                className="w-full h-14 px-6 bg-clay-cream/30 rounded-[22px] shadow-clay-inset border-2 border-transparent focus:border-clay-blue/30 focus:outline-none transition-all font-bold text-clay-deep disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-clay-deep uppercase tracking-widest pl-2">Lời nhắn</label>
              <textarea 
                required
                rows={4} 
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Bạn đang nghĩ gì..." 
                className="w-full p-6 bg-clay-cream/30 rounded-[30px] shadow-clay-inset border-2 border-transparent focus:border-clay-blue/30 focus:outline-none transition-all font-bold text-clay-deep resize-none disabled:opacity-50"
              ></textarea>
            </div>

            <button 
              disabled={status === 'loading'}
              type="submit" 
              className={`w-full py-5 font-heading font-black rounded-[25px] shadow-clay-button hover:shadow-clay-button-hover active:scale-95 transition-all text-sm uppercase tracking-widest ${status === 'loading' ? 'bg-clay-muted' : 'bg-gradient-to-r from-clay-blue to-clay-blue-dark text-white'}`}
            >
              {status === 'loading' ? 'Đang gửi...' : 'Gửi tin nhắn 🚀'}
            </button>

            {status === 'success' && (
              <p className="text-center text-clay-green font-bold animate-breathe">✨ Đã gửi tin nhắn thành công!</p>
            )}
            {status === 'error' && (
              <p className="text-center text-red-500 font-bold">❌ Có lỗi xảy ra, vui lòng thử lại.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
