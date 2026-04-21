'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, ArrowUpRight } from 'lucide-react'

import { useAuth } from '@/providers/AuthProvider'

export default function BlogPage() {
  const { openAuth } = useAuth()
  const [activeCategory, setActiveCategory] = useState('Tất Cả')

  const formatNumbers = (text: string) => {
    return text.split(/(\d+%?)/).map((part, i) => 
      /\d/.test(part) ? <span key={i} className="font-sans font-black tracking-normal inline-block align-baseline">{part}</span> : part
    )
  }

  const categories = [
    'Tất Cả', 'Phương pháp học', 'Ngữ pháp', 'Từ vựng', 'Công nghệ AI', 'Lộ trình', 'Câu chuyện học viên'
  ]

  const featuredPost = {
    category: 'Phương pháp học',
    date: '15 THÁNG 3, 2024',
    readTime: '7 phút đọc',
    title: 'Tại sao 95% người học tiếng Anh bỏ cuộc sau 3 tháng — và cách LinguaClay giải quyết điều đó',
    summary: 'Động lực luôn tràn trề vào ngày đầu tiên, nhưng lại cạn kiệt vào ngày thứ 90. Chúng tôi tìm ra đâu là lý do thực sự — và xây LinguaClay để giải quyết đúng gốc rễ vấn đề đó.',
    imageBg: 'bg-[#3A7642]'
  }

  const posts = [
    {
      category: 'Phương pháp học',
      date: '5 phút đọc',
      title: 'Tối đa hóa năng suất học tập cùng AI Automation',
      summary: 'Khi AI biết bạn hay quên chỗ nào, học lúc nào hiệu quả nhất — việc học trở nên khác hoàn toàn.',
      color: 'bg-newsprint-black'
    },
    {
      category: 'Công nghệ AI',
      date: '6 phút đọc',
      title: 'Tương lai của giáo dục: Tương tác thời gian thực',
      summary: 'Lớp học một chiều đang chết dần. Điều gì đang thay thế nó và tại sao điều đó tốt hơn cho người học?',
      color: 'bg-newsprint-gray-dark'
    },
    {
      category: 'Phương pháp học',
      date: '4 phút đọc',
      title: 'Mở rộng quy mô kiến thức với Hạ tầng học tập cá nhân',
      summary: 'Học một mình không có nghĩa là học kém — nếu bạn biết cách xây đúng hệ thống.',
      color: 'bg-red-600'
    },
    {
      category: 'Phương pháp học',
      date: '5 phút đọc',
      title: 'Spaced Repetition là gì và tại sao nó hiệu quả hơn học thông thường',
      summary: 'Não bộ không ghi nhớ theo lịch của bạn — nhưng SRS thì biết lịch của não bộ.',
      color: 'bg-[#E3A320]'
    },
    {
      category: 'Ngữ pháp',
      date: '4 phút đọc',
      title: '5 lỗi ngữ pháp tiếng Anh người Việt hay mắc nhất',
      summary: 'Không phải vì bạn kém — mà vì tiếng Việt và tiếng Anh tư duy hoàn toàn khác nhau ở 5 điểm này.',
      color: 'bg-[#3A7642]'
    },
    {
      category: 'Lộ trình',
      date: '8 phút đọc',
      title: 'Học tiếng Nhật từ đầu — lộ trình 6 tháng thực tế',
      summary: 'Không cần biết Hiragana ngay ngày đầu. Đây là thứ tự đúng để không bị choáng ngợp rồi bỏ cuộc.',
      color: 'bg-newsprint-black'
    },
    {
      category: 'Công nghệ AI',
      date: '6 phút đọc',
      title: 'AI Tutor có thể thay thế giáo viên không?',
      summary: 'Câu trả lời không phải có hay không — mà là: thay thế cái gì, và không thay thế được cái gì.',
      color: 'bg-newsprint-gray-dark'
    },
    {
      category: 'Phương pháp học',
      date: '5 phút đọc',
      title: 'Cách xây thói quen học ngôn ngữ mỗi ngày mà không bỏ cuộc',
      summary: '15 phút mỗi ngày đánh bại 3 tiếng mỗi cuối tuần — nếu bạn làm đúng cách.',
      color: 'bg-red-600'
    },
    {
      category: 'Từ vựng',
      date: '4 phút đọc',
      title: 'Flashcard vs ghi chép tay — cái nào hiệu quả hơn?',
      summary: 'Cả hai đều có chỗ đứng. Nhưng biết dùng cái nào lúc nào mới là điều tạo ra sự khác biệt.',
      color: 'bg-[#E3A320]'
    }
  ]

  const displayedPosts = activeCategory === 'Tất Cả' 
    ? posts 
    : posts.filter(post => post.category === activeCategory)

  return (
    <div className="w-full bg-[#F5F0E8] overflow-x-hidden">
      
      {/* 1. Tiêu đề Trang (Hero) */}
      <section className="w-full pt-20 pb-16 border-b-[3px] border-newsprint-black bg-transparent">
         <div className="max-w-[1200px] mx-auto px-6 text-center">
            <span className="inline-block px-4 py-1 mb-6 border-[3px] border-newsprint-black bg-newsprint-white text-newsprint-black text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
               BLOG
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black uppercase text-newsprint-black leading-tight tracking-tight vietnamese-text mb-6 max-w-4xl mx-auto">
               Học ngôn ngữ thông minh hơn — bắt đầu từ đây
            </h1>
            <p className="text-lg md:text-xl font-sans text-newsprint-gray-dark max-w-2xl mx-auto vietnamese-text">
               Phương pháp khoa học, góc nhìn thực tế và câu chuyện từ cộng đồng học viên LinguaClay.
            </p>
         </div>
      </section>

      {/* Categories Filter (Sticky) */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-newsprint-white sticky top-0 z-40 shadow-sm">
         <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex items-center gap-3 py-4 overflow-x-auto no-scrollbar mask-edges">
            {categories.map((cat) => (
               <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-5 py-2.5 font-bold uppercase tracking-widest text-[11px] sm:text-xs border-[2px] transition-all duration-200 ${
                     activeCategory === cat 
                     ? 'border-newsprint-black bg-newsprint-black text-newsprint-white shadow-none translate-y-0.5' 
                     : 'border-newsprint-black bg-newsprint-white text-newsprint-black shadow-[3px_3px_0px_0px_rgba(20,20,20,1)] hover:bg-[#F5F0E8] hover:-translate-y-0.5'
                  }`}
               >
                  {cat}
               </button>
            ))}
            </div>
         </div>
      </section>

      {/* 2. Bài Viết Nổi Bật (Featured) - Only show when "Tất Cả" is selected */}
      {activeCategory === 'Tất Cả' && (
      <section className="w-full py-16 sm:py-24 bg-transparent border-b-[3px] border-newsprint-black">
         <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-red-600 mb-8 vietnamese-text">Bài Nổi Bật</h2>
            
            <Link href="/blog/featured-post" className="block group">
               <div className="flex flex-col lg:flex-row border-[3px] border-newsprint-black bg-newsprint-white shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                  
                  {/* Left: Content */}
                  <div className="w-full lg:w-[55%] p-8 sm:p-12 flex flex-col justify-center bg-[#F5F0E8] border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-newsprint-black relative z-10 order-2 lg:order-1">
                     <div className="flex items-center gap-4 mb-6">
                        <span className="px-3 py-1 bg-newsprint-black text-newsprint-white text-[10px] font-bold uppercase tracking-widest border-[2px] border-newsprint-black">
                           {featuredPost.category}
                        </span>
                        <span className="flex items-center gap-2 text-xs font-bold text-newsprint-gray-dark uppercase tracking-widest">
                           <Calendar className="w-3 h-3" />
                           {featuredPost.date}
                        </span>
                     </div>
                     <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black uppercase leading-tight text-newsprint-black mb-6 group-hover:text-red-600 transition-colors vietnamese-text">
                        {formatNumbers(featuredPost.title)}
                     </h3>
                     <p className="text-base sm:text-lg font-sans text-newsprint-gray-dark leading-relaxed vietnamese-text mb-8">
                        {featuredPost.summary}
                     </p>
                     <div className="mt-auto flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-newsprint-black group-hover:text-red-600 transition-colors">
                        Đọc toàn bộ bài viết <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                     </div>
                  </div>

                  {/* Right: Image Placeholder */}
                  <div className={`w-full lg:w-[45%] h-[300px] lg:h-auto ${featuredPost.imageBg} relative overflow-hidden flex items-center justify-center p-8 order-1 lg:order-2`}>
                     <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay"></div>
                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-newsprint-black via-newsprint-black to-[#333] opacity-40 mix-blend-multiply"></div>
                     
                     {/* Brutalist abstract art for featured */}
                     <div className="relative w-3/4 aspect-square border-[4px] border-newsprint-white rotate-6 bg-[#EBE3D5] p-6 text-center shadow-[16px_16px_0px_0px_rgba(255,255,255,0.1)] flex items-center justify-center">
                        <h4 className="font-serif font-black uppercase text-2xl opacity-40 text-newsprint-black">{formatNumbers("95% QUITTER")}</h4>
                     </div>
                  </div>

               </div>
            </Link>
         </div>
      </section>
      )}

      {/* 3. Grid Bài Viết */}
      <section className="w-full py-20 bg-transparent border-b-[3px] border-newsprint-black">
         <div className="max-w-[1200px] mx-auto px-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {displayedPosts.length > 0 ? (
                 displayedPosts.map((post, i) => (
                  <Link href={`/blog/post-${i}`} key={i} className="group flex flex-col border-[3px] border-newsprint-black bg-newsprint-white hover:-translate-y-2 transition-transform duration-300 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] overflow-hidden h-full">
                     
                     {/* Image Placeholder */}
                     <div className="w-full h-[200px] border-b-[3px] border-newsprint-black bg-[#EBE3D5] relative flex flex-col justify-end p-4 overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                        <div className={`w-[120px] h-full absolute right-0 bottom-0 ${post.color} opacity-20 transform -skew-x-12 translate-x-4`}></div>
                        
                        <div className="relative w-10 h-10 border-[3px] border-newsprint-black bg-newsprint-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity self-end">
                           <ArrowUpRight className="w-5 h-5 text-newsprint-black" />
                        </div>
                     </div>

                     {/* Content */}
                     <div className="p-8 flex flex-col flex-1">
                        <div className="flex items-center gap-3 mb-4">
                           <span className="px-2 py-0.5 border-[2px] border-newsprint-black text-newsprint-black text-[10px] font-bold uppercase tracking-widest bg-[#F5F0E8]">
                              {post.category}
                           </span>
                        </div>
                        <h4 className="font-serif font-black text-2xl uppercase leading-snug text-newsprint-black mb-4 group-hover:text-red-600 transition-colors vietnamese-text min-h-[100px] sm:min-h-[130px] line-clamp-4">
                           {formatNumbers(post.title)}
                        </h4>
                        <p className="font-sans text-[15px] leading-relaxed text-newsprint-gray-dark mb-6 line-clamp-3 flex-1">
                           {post.summary}
                        </p>
                        <div className="pt-6 border-t-[2px] border-dashed border-newsprint-gray-light flex items-center gap-2 text-[11px] font-bold text-newsprint-gray-dark uppercase tracking-widest mt-auto">
                           <Calendar className="w-3.5 h-3.5" /> {post.date}
                        </div>
                     </div>

                  </Link>
                 ))
               ) : (
                 <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-24 border-[3px] border-dashed border-newsprint-black bg-[#EBE3D5]">
                    <div className="inline-flex items-center justify-center w-16 h-16 border-[3px] border-newsprint-black bg-newsprint-white mb-6">
                       <span className="text-2xl font-serif font-black text-newsprint-gray-medium">?</span>
                    </div>
                    <p className="font-serif font-black uppercase text-3xl text-newsprint-black vietnamese-text mb-4">Không có bài viết</p>
                    <p className="font-sans text-newsprint-gray-dark text-base">Hiện chưa có nội dung nào trong chuyên mục này. LinguaClay sẽ sớm cập nhật!</p>
                 </div>
               )}
            </div>
            
         </div>
      </section>

      {/* 5. Khung Đăng Ký (CTA) */}
      <section className="w-full py-24 sm:py-32 bg-transparent text-newsprint-black border-t-[3px] border-newsprint-black">
         <div className="max-w-[1200px] mx-auto px-6 text-center">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-sans font-black uppercase text-newsprint-black leading-tight tracking-tight mb-10 vietnamese-text">
               Đọc đủ rồi — giờ là lúc thực hành.
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <button
                  onClick={() => openAuth('signin')}
                  className="w-full sm:w-auto sm:min-w-[240px] px-10 py-5 bg-black text-white font-bold uppercase tracking-widest border-[3px] border-black hover:bg-white hover:text-black transition-all duration-300 vietnamese-text text-sm font-sans flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
               >
                  Bắt đầu miễn phí
               </button>
               <Link href="/product/pricing" className="w-full sm:w-auto sm:min-w-[240px] px-10 py-5 bg-transparent text-newsprint-black font-bold uppercase tracking-widest border-[3px] border-newsprint-black hover:bg-white transition-all duration-300 vietnamese-text text-sm font-sans flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]">
                  Xem bảng giá
               </Link>
            </div>
         </div>
      </section>

    </div>
  )
}
