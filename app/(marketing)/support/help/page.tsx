import React from 'react'

const categories = [
  { title: 'Tài khoản', icon: '👤', desc: 'Đăng ký, đăng nhập và quản lý thông tin cá nhân.' },
  { title: 'Học tập', icon: '📚', desc: 'Hướng dẫn dùng Flashcard, AI Chat và bài tập.' },
  { title: 'Thanh toán', icon: '💳', desc: 'Thông tin về gói PRO và các phương thức thanh toán.' },
  { title: 'Kỹ thuật', icon: '🛠️', desc: 'Xử lý các lỗi kết nối hoặc hiển thị trên ứng dụng.' },
  { title: 'Phát âm', icon: '🎙️', desc: 'Cách sử dụng Voice AI để luyện nói hiệu quả.' },
  { title: 'Dữ liệu', icon: '📊', desc: 'Hiểu về tiến độ và cách AI cá nhân hóa lộ trình.' }
]

export default function HelpPage() {
  return (
    <div className="py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Search Header */}
        <div className="text-center space-y-8 bg-gradient-to-br from-clay-blue/5 to-clay-green/5 rounded-[60px] p-12 md:p-20 shadow-clay-inset">
          <h1 className="text-4xl md:text-5xl font-heading font-black text-clay-deep tracking-tight">
            Chúng tôi có thể giúp gì cho bạn?
          </h1>
          <div className="max-w-2xl mx-auto relative group">
             <input 
               type="text" 
               placeholder="Tìm kiếm hướng dẫn, mẹo học tập..." 
               className="w-full h-16 px-8 pl-16 bg-white rounded-[25px] shadow-clay-card border-4 border-white focus:outline-none focus:shadow-clay-button transition-all font-bold text-clay-deep"
             />
             <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl grayscale group-focus-within:grayscale-0 transition-opacity">🔍</div>
          </div>
          <p className="text-sm text-clay-muted font-medium italic">Các chủ đề gợi ý: Đăng ký thành viên, Cách dùng AI Chat, Gói vĩnh viễn</p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-3 gap-8">
           {categories.map((cat, i) => (
             <div key={i} className="bg-white/80 p-10 rounded-[45px] shadow-clay-card border-4 border-white space-y-4 hover:scale-[1.05] transition-transform cursor-pointer group">
                <div className="w-16 h-16 bg-clay-cream rounded-[22px] flex items-center justify-center text-3xl shadow-clay-inset group-hover:bg-clay-blue/10 transition-colors">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-heading font-black text-clay-deep">{cat.title}</h3>
                <p className="text-sm text-clay-muted font-medium leading-relaxed">{cat.desc}</p>
             </div>
           ))}
        </div>

        {/* Support CTA */}
        <div className="text-center space-y-6 pt-12">
           <h2 className="text-2xl font-heading font-black text-clay-deep">Không tìm thấy câu trả lời?</h2>
           <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a href="/company/contact" className="px-10 py-4 bg-clay-blue text-white rounded-full font-heading font-black shadow-clay-button hover:scale-105 active:scale-95 transition-all outline-none">
                 Gửi yêu cầu hỗ trợ 🚀
              </a>
              <a href="https://zalo.me/0866555468" className="px-10 py-4 bg-white text-clay-deep rounded-full font-heading font-black shadow-clay-card border-2 border-clay-cream hover:scale-105 active:scale-95 transition-all outline-none">
                 Chat với chúng tôi 💬
              </a>
           </div>
        </div>
      </div>
    </div>
  )
}
