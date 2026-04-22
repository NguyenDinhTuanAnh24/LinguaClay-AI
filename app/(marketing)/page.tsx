'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import FlashcardDemo from '@/components/FlashcardDemo'
import { normalizeVietnamese } from '@/app/lib/utils/normalize'
import { BookOpen, MessageCircle, BarChart2, Trophy, User, Star, Lock, Zap, Users, Plus, X, ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { ScrollReveal } from '@/components/marketing/ScrollReveal'

export default function LandingPage() {
  const { openAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const vn = normalizeVietnamese

  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    { question: 'LinguaClay có bản dùng thử miễn phí không?', answer: 'Có, bạn có thể bắt đầu với bản dùng thử 7 ngày hoàn toàn miễn phí. Bạn sẽ có quyền truy cập đầy đủ tất cả các tính năng và không cần nhập thẻ tín dụng.' },
    { question: 'Tôi có thể thay đổi gói cước sau này không?', answer: 'Tất nhiên! Bạn có thể nâng cấp hoặc hạ cấp gói học của mình bất kỳ lúc nào tại mục Cài đặt. Các thay đổi sẽ có hiệu lực ngay lập tức.' },
    { question: 'Hệ thống hỗ trợ những phương thức thanh toán nào?', answer: 'Chúng tôi chấp nhận mọi thẻ tín dụng quốc tế (Visa, Mastercard...) và chuyển khoản ngân hàng qua mã QR (Momo, VNPay).' },
    { question: 'Hệ thống AI Tutor hoạt động như thế nào?', answer: 'AI Tutor đóng vai trò như một người bản xứ, sẽ giao tiếp với bạn 1-1, bắt lỗi ngữ pháp và đưa ra gợi ý cách diễn đạt tự nhiên hơn.' },
    { question: 'Có khóa học dành riêng cho người mất gốc không?', answer: 'Chúng tôi có lộ trình từ Zero đến Hero, hệ thống tự động đánh giá năng lực và đề xuất bài học từ bảng chữ cái cho đến giao tiếp nâng cao.' }
  ]

  const blogs = [
    { title: 'Tối đa hóa năng suất học tập cùng AI Automation', excerpt: 'Khám phá cách các công cụ AI thông minh tự động hóa quá trình review flashcard giúp tiết kiệm hàng giờ mỗi tuần.', date: '2026-04-12', author: 'LINGUACLAY TEAM' },
    { title: 'Tương lai của giáo dục: Tương tác thời gian thực', excerpt: 'Tại sao việc luyện nói 1-1 với AI đang định hình lại toàn bộ mô hình học ngoại ngữ hiện đại.', date: '2026-04-10', author: 'EDITORIAL BOARD' },
    { title: 'Mở rộng quy mô kiến thức với Hạ tầng quốc tế', excerpt: 'Hệ thống máy chủ toàn cầu đảm bảo hiệu năng tối ưu và độ giật lag bằng 0 cho người dùng LinguaClay.', date: '2026-04-05', author: 'SYSTEM ADMIN' }
  ]

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubmitted(true)
      setTimeout(() => setIsSubmitted(false), 3000)
    }
  }

  const features = [
    { icon: <BookOpen size={32} />, title: vn('Flashcard Thông Minh'), description: vn('Hệ thống SRS tự động lên lịch ôn tập, tối ưu trí nhớ với thuật toán khoa học') },
    { icon: <MessageCircle size={32} />, title: vn('AI Tutor Hội Thoại'), description: vn('Thực hành giao tiếp với AI, nhận phân hồi tức thì và gợi ý sửa lỗi') },
    { icon: <BarChart2 size={32} />, title: vn('Tiến Độ Chi Tiết'), description: vn('Theo dõi hành trình học tập với biểu đồ trực quan và phân tích chuyên sâu') },
    { icon: <Trophy size={32} />, title: vn('200+ Bài Ngữ Pháp'), description: vn('Thư viện bài học từ cơ bản đến nâng cao, có ví dụ minh họa và bài tập') }
  ]

  const stats = [
    { value: '500+', label: vn('Từ vựng') },
    { value: '200+', label: vn('Bài học') },
    { value: '10K+', label: vn('Người dùng') },
    { value: '4.8/5', label: vn('Đánh giá') }
  ]

  const testimonials = [
    { name: vn('Minh'), role: vn('Học viên'), icon: <User size={48} />, content: vn('LinguaClay giúp tôi học tiếng Anh hiệu quả hơn rất nhiều. Flashcard thông minh cực kỳ hữu ích!'), rating: 5 },
    { name: vn('Lan'), role: vn('Học viên'), icon: <User size={48} />, content: vn('AI Tutor rất nhiệt tình và sẵn sàng sửa lỗi cho tôi. Tôi đã cải thiện rất nhiều sau 2 tháng.'), rating: 5 },
    { name: vn('Tuấn'), role: vn('Học viên'), icon: <User size={48} />, content: vn('Giao diện đẹp, dễ dùng. Tôi học mỗi ngày chỉ 15 phút nhưng thấy tiến bộ rõ rệt.'), rating: 5 }
  ]

  return (
    <div className="min-h-screen flex flex-col w-full bg-transparent overflow-x-hidden">

      {/* Hero Section - Split Layout */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-transparent">
        <div className="max-w-[1280px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column - Main Content */}
          <div className="col-span-1 lg:col-span-8 p-8 md:p-12 xl:p-20 flex flex-col justify-center border-b-[3px] lg:border-b-0 border-newsprint-black">
            <div className="flex items-center gap-2 mb-6 md:mb-10">
              <div className="w-2 h-2 bg-red-600"></div>
              <p className="text-xs md:text-sm lg:text-[16px] font-bold uppercase tracking-widest text-newsprint-gray-dark vietnamese-text">
                NỀN TẢNG HỌC TẬP AI
              </p>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl xl:text-8xl font-serif font-black tracking-tighter leading-[1.1] lg:leading-none text-newsprint-black mb-8 md:mb-12 vietnamese-text uppercase">
              {vn('HỌC THÔNG MINH,')}
              <br />
              {vn('NÓI TỰ TIN.')}
            </h1>

            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start max-w-4xl">
              <div className="flex-1">
                <p className="text-lg font-serif leading-relaxed text-newsprint-black vietnamese-text">
                  <span className="text-5xl font-black text-red-600 float-left mr-3 leading-none h-10 mt-1">L</span>
                  {vn('inguaClay kết hợp AI thông minh, SRS khoa học và thiết kế đẹp mắt giúp bạn ghi nhớ từ vựng lâu hơn, nói tự tin hơn mỗi ngày mà không cần ép buộc bản thân học vẹt.')}
                </p>
              </div>
              <div className="flex flex-col gap-4 w-full md:w-64 shrink-0">
                <button
                  onClick={() => openAuth('signin')}
                  className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all border-[3px] border-black font-sans text-xs text-center vietnamese-text shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] active:translate-y-1 active:shadow-none"
                >
                  {vn('BẮT ĐẦU MIỄN PHÍ')}
                </button>
                <Link
                  href="#features"
                  className="w-full py-4 bg-transparent text-newsprint-black font-bold uppercase tracking-widest border-[3px] border-newsprint-black hover:bg-white hover:text-newsprint-black transition-all font-sans text-xs text-center vietnamese-text"
                >
                  {vn('XEM TÍNH NĂNG')}
                </Link>
                <p className="text-[10px] font-sans text-newsprint-gray-dark text-center uppercase tracking-widest mt-2 vietnamese-text">
                  {vn('Hơn 10,000+ người dùng')}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="col-span-1 lg:col-span-4 lg:border-l-[3px] border-newsprint-black flex flex-col">
            <div className="p-8 lg:p-12 flex-grow border-b-[3px] border-newsprint-black">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-newsprint-black vietnamese-text">CHỈ SỐ THỰC TẾ</h3>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end border-b-[2px] border-dotted border-newsprint-gray-medium pb-6">
                  <span className="text-xs font-sans text-newsprint-gray-dark font-medium uppercase tracking-widest">Từ vựng đã học</span>
                  <div className="text-right">
                    <div className="text-2xl font-sans font-black text-newsprint-black leading-none mb-1">500k+</div>
                    <div className="text-[10px] text-red-600 font-bold uppercase tracking-widest">+12% THÁNG NÀY</div>
                  </div>
                </div>
                <div className="flex justify-between items-end border-b-[2px] border-dotted border-newsprint-gray-medium pb-6">
                  <span className="text-xs font-sans text-newsprint-gray-dark font-medium uppercase tracking-widest">Thời gian hoạt động</span>
                  <div className="text-right">
                    <div className="text-2xl font-sans font-black text-newsprint-black leading-none mb-1">99.99%</div>
                    <div className="text-[10px] text-newsprint-gray-dark font-bold uppercase tracking-widest">MỨC ĐỘ ỔN ĐỊNH</div>
                  </div>
                </div>
                <div className="flex justify-between items-end border-b-[2px] border-dotted border-newsprint-gray-medium pb-6">
                  <span className="text-xs font-sans text-newsprint-gray-dark font-medium uppercase tracking-widest">Hỗ trợ AI Tutor</span>
                  <div className="text-right">
                    <div className="text-2xl font-sans font-black text-newsprint-black leading-none mb-1">24/7</div>
                    <div className="text-[10px] text-newsprint-gray-dark font-bold uppercase tracking-widest">PHẢN HỒI LẬP TỨC</div>
                  </div>
                </div>
                <div className="flex justify-between items-end border-b-[2px] border-dotted border-newsprint-gray-medium pb-6">
                  <span className="text-xs font-sans text-newsprint-gray-dark font-medium uppercase tracking-widest">Đánh giá</span>
                  <div className="text-right">
                    <div className="text-2xl font-sans font-black text-newsprint-black leading-none mb-1">4.8/5</div>
                    <div className="text-[10px] text-newsprint-gray-dark font-bold uppercase tracking-widest">10K+ LƯỢT</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-12 border-newsprint-black bg-transparent flex-shrink-0">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-newsprint-black mb-6 text-center">TRẢI NGHIỆM FLASHCARD</h3>
              <div className="w-full bg-transparent flex flex-col items-center justify-center border-[3px] border-newsprint-black overflow-hidden p-4">
                <FlashcardDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker (Full Width Breakout) */}
      <div className="bg-black text-white overflow-hidden py-3 border-b-[3px] border-newsprint-black w-full relative z-10 box-border">
        <div className="flex animate-marquee whitespace-nowrap items-center hover:[animation-play-state:paused]">
          <span className="px-8 text-xs sm:text-sm md:text-base font-sans font-bold uppercase tracking-widest text-white vietnamese-text">{vn('MỖI NGÀY MỘT TỪ MỚI')}</span>
          <span className="text-red-600 font-black">     </span>
          <span className="px-8 text-xs sm:text-sm md:text-base font-sans font-bold uppercase tracking-widest text-white vietnamese-text">{vn('KIÊN TRÌ LÀ CHÌA KHÓA')}</span>
          <span className="text-red-600 font-black">     </span>
          <span className="px-8 text-xs sm:text-sm md:text-base font-sans font-bold uppercase tracking-widest text-white vietnamese-text">{vn('NÓI ĐƯỢC LÀ CẢM GIÁC TUYỆT VỜI NHẤT')}</span>
          <span className="text-red-600 font-black">     </span>
          <span className="px-8 text-xs sm:text-sm md:text-base font-sans font-bold uppercase tracking-widest text-white vietnamese-text">{vn('ĐỪNG ĐỂ NGÀY MAI')}</span>
          <span className="text-red-600 font-black">     </span>
          <span className="px-8 text-xs sm:text-sm md:text-base font-sans font-bold uppercase tracking-widest text-white vietnamese-text">{vn('BẮT ĐẦU HÔM NAY')}</span>
          <span className="text-red-600 font-black">     </span>
          <span className="px-8 text-xs sm:text-sm md:text-base font-sans font-bold uppercase tracking-widest text-white vietnamese-text">{vn('NGÔN NGỮ MỚI - CƠ HỘI MỚI')}</span>
          <span className="text-red-600 font-black">     </span>
          {/* Duplicate for infinite effect */}
          <span className="px-8 text-xs sm:text-sm md:text-base font-sans font-bold uppercase tracking-widest text-white vietnamese-text">{vn('MỖI NGÀY MỘT TỪ MỚI')}</span>
          <span className="text-red-600 font-black">     </span>
          <span className="px-8 text-xs sm:text-sm md:text-base font-sans font-bold uppercase tracking-widest text-white vietnamese-text">{vn('KIÊN TRÌ LÀ CHÌA KHÓA')}</span>
          <span className="text-red-600 font-black">     </span>
          <span className="px-8 text-xs sm:text-sm md:text-base font-sans font-bold uppercase tracking-widest text-white vietnamese-text">{vn('NÓI ĐƯỢC LÀ CẢM GIÁC TUYỆT VỜI NHẤT')}</span>
          <span className="text-red-600 font-black">     </span>
          <span className="px-8 text-xs sm:text-sm md:text-base font-sans font-bold uppercase tracking-widest text-white vietnamese-text">{vn('ĐỪNG ĐỂ NGÀY MAI')}</span>
          <span className="text-red-600 font-black">     </span>
          <span className="px-8 text-xs sm:text-sm md:text-base font-sans font-bold uppercase tracking-widest text-white vietnamese-text">{vn('BẮT ĐẦU HÔM NAY')}</span>
          <span className="text-red-600 font-black">     </span>
          <span className="px-8 text-xs sm:text-sm md:text-base font-sans font-bold uppercase tracking-widest text-white vietnamese-text">{vn('NGÔN NGỮ MỚI - CƠ HỘI MỚI')}</span>
          <span className="text-red-600 font-black">     </span>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="w-full border-b-[3px] border-newsprint-black bg-transparent py-24">
        <div className="max-w-[1280px] mx-auto w-full px-6">
          <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
            <h2 className="text-5xl lg:text-7xl font-serif font-black leading-tight text-newsprint-black vietnamese-text uppercase">
              {vn('Tại sao chọn LinguaClay?')}
            </h2>
            <p className="text-lg font-sans leading-relaxed text-newsprint-gray-dark mt-6 max-w-2xl mx-auto vietnamese-text">
              {vn('Kết hợp công nghệ AI tiên tiến với phương pháp học tập khoa học để tối ưu trải nghiệm và kết quả của bạn')}
            </p>
          </div>

          <div className="border-t-[3px] border-l-[3px] border-newsprint-black w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
              {features.map((feature, index) => (
                <ScrollReveal key={index} delay={index * 0.1} className="h-full">
                  <div
                    className="border-b-[3px] border-r-[3px] border-newsprint-black p-10 lg:p-12 xl:p-16 transition-colors duration-300 group hover:bg-newsprint-white h-full"
                  >
                    <div className="w-16 h-16 border-[3px] border-black mb-8 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all bg-[#F5F0E8] group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-serif font-bold text-newsprint-black mb-4 vietnamese-text uppercase">
                      {feature.title}
                    </h3>
                    <p className="font-sans text-base text-newsprint-gray-dark leading-relaxed vietnamese-text">
                      {feature.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-transparent py-24">
        <div className="max-w-[1280px] mx-auto w-full">
          <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-newsprint-black mb-4 vietnamese-text">TESTIMONIALS</p>
            <h2 className="text-5xl lg:text-7xl font-serif font-black text-newsprint-black vietnamese-text uppercase">
              {vn('Người dùng nói gì?')}
            </h2>
          </div>

          <div className="w-full border-t-[3px] border-l-[3px] border-newsprint-black">
            <div className="grid grid-cols-1 md:grid-cols-3 w-full">
              {testimonials.map((testimonial, index) => (
                <ScrollReveal key={index} delay={index * 0.1} className="h-full">
                  <div
                    className="border-b-[3px] border-r-[3px] border-newsprint-black p-10 lg:p-12 xl:p-16 flex flex-col justify-between transition-colors duration-300 hover:bg-newsprint-white h-full"
                  >
                    <div>
                      <div className="text-7xl font-serif text-newsprint-gray-medium opacity-50 mb-4 mt-[-1rem] leading-none">
                        &rdquo;
                      </div>
                      <p className="text-2xl font-serif font-bold leading-snug text-newsprint-black mb-12 vietnamese-text">
                        "{testimonial.content}"
                      </p>
                    </div>
                    <div>
                      <div className="h-[3px] bg-newsprint-black w-full mb-6"></div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 grayscale flex flex-shrink-0 items-center justify-center text-newsprint-black overflow-hidden border-2 border-newsprint-black">
                          {testimonial.icon}
                        </div>
                        <div className="flex flex-col">
                          <div className="text-sm font-bold uppercase tracking-widest text-newsprint-black vietnamese-text">
                            {testimonial.name}
                          </div>
                          <div className="text-xs font-sans text-newsprint-gray-dark uppercase tracking-widest vietnamese-text mt-1">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-transparent py-24">
        <div className="max-w-[1280px] mx-auto w-full px-6">
          <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row justify-between items-center md:items-end border-b-[3px] border-newsprint-black pb-4 gap-4 md:gap-0">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-newsprint-black vietnamese-text text-center md:text-left">
              {vn('Mới nhất từ Blog LinguaClay')}
            </h2>
            <Link href="/blog" className="text-newsprint-black font-bold uppercase tracking-widest text-xs hover:text-newsprint-gray-dark transition-colors vietnamese-text border-b-[2px] border-red-600 pb-1">
              {vn('XEM TẤT CẢ >')}
            </Link>
          </div>

          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  category: 'Phương pháp học',
                  date: '5 phút đọc',
                  title: 'Tối đa hóa năng suất học tập cùng AI Automation',
                  summary: 'Khám phá cách các công cụ AI thông minh tự động hóa quá trình review flashcard giúp tiết kiệm hàng giờ mỗi tuần.',
                  link: '/blog/post-1',
                  color: 'bg-[#3A7642]'
                },
                {
                  category: 'Công nghệ AI',
                  date: '6 phút đọc',
                  title: 'Tương lai của giáo dục: Tương tác thời gian thực',
                  summary: 'Lớp học một chiều đang chết dần. Điều gì đang thay thế nó và tại sao điều đó tốt hơn cho người học?',
                  link: '/blog/post-2',
                  color: 'bg-[#E3A320]'
                },
                {
                  category: 'Phương pháp học',
                  date: '4 phút đọc',
                  title: 'Mở rộng quy mô kiến thức với Hạ tầng học tập cá nhân',
                  summary: 'Học một mình không có nghĩa là học kém — nếu bạn biết cách xây đúng hệ thống.',
                  link: '/blog/post-3',
                  color: 'bg-red-600'
                }
              ].map((post, i) => (
                <ScrollReveal key={i} delay={i * 0.1} className="h-full">
                  <Link href={post.link} className="group flex flex-col border-[3px] border-newsprint-black bg-[#F5F0E8] hover:-translate-y-2 transition-transform duration-300 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] overflow-hidden h-full">
                    <div className="w-full h-[180px] border-b-[3px] border-newsprint-black bg-newsprint-paper relative flex justify-end p-4 overflow-hidden">
                      <div className={`absolute inset-0 ${post.color} opacity-30 mix-blend-multiply`}></div>
                      <div className="relative bg-newsprint-white border-[2px] border-newsprint-black w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity mt-auto ml-auto">
                        <ArrowUpRight className="w-4 h-4 text-newsprint-black" />
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1 pl-6">
                      <span className={`text-[10px] font-bold uppercase tracking-widest mb-3 border-[1.5px] px-2 py-0.5 self-start bg-newsprint-white ${i === 0 ? 'text-[#3A7642] border-[#3A7642]' : i === 1 ? 'text-[#E3A320] border-[#E3A320]' : 'text-red-600 border-red-600'}`}>
                        {post.category}
                      </span>
                      <h4 className="font-serif font-black text-xl uppercase leading-snug text-newsprint-black group-hover:text-red-600 transition-colors vietnamese-text mb-4 line-clamp-3">
                        {post.title}
                      </h4>
                      <p className="font-sans text-[15px] text-newsprint-gray-dark line-clamp-2 mt-auto">
                        {post.summary}
                      </p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-transparent py-24">
        <div className="max-w-[1280px] mx-auto w-full px-6">
          <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-newsprint-black vietnamese-text">
              {vn('Bảng giá minh bạch, đơn giản')}
            </h2>
            <p className="font-sans text-sm text-newsprint-gray-dark mt-4 vietnamese-text uppercase tracking-widest">
              {vn('Chọn gói học phù hợp với nhóm của bạn')}
            </p>
          </div>

          <div className="max-w-5xl mx-auto px-6 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-3 border-[3px] border-newsprint-black bg-transparent shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
              {landingPlans.map((plan, index) => (
                <div key={index} className={`p-8 lg:p-10 flex flex-col relative group hover:bg-white transition-colors duration-300 ${index < landingPlans.length - 1 ? 'border-b-[3px] md:border-b-0 md:border-r-[3px] border-newsprint-black' : ''}`}>
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
                    onClick={() => openAuth('signin', '/dashboard/plans')}
                    className={`w-full text-center py-4 border-[3px] border-black font-bold uppercase text-sm tracking-widest transition-colors vietnamese-text mt-auto ${plan.highlight ? 'bg-black text-white hover:bg-transparent hover:text-black' : 'bg-transparent text-black hover:bg-black hover:text-white'}`}
                  >
                    {vn(plan.ctaText as string)}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-transparent py-24">
        <div className="max-w-[1280px] mx-auto w-full px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12">
            <div className="lg:col-span-4">
              <h2 className="text-4xl font-serif font-bold text-newsprint-black mb-10 leading-tight vietnamese-text pr-8">
                {vn('Câu hỏi thường gặp')}
              </h2>
              <div className="border-[3px] border-newsprint-black bg-transparent p-6 relative shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <h4 className="text-xs font-bold uppercase tracking-widest text-newsprint-black mb-3 vietnamese-text">
                  {vn('TRUNG TÂM HỖ TRỢ')}
                </h4>
                <p className="font-sans text-xs text-newsprint-gray-dark mb-4 vietnamese-text">
                  {vn('Cần thêm thông tin chi tiết? Liên hệ trực tiếp với nhóm hỗ trợ của chúng tôi.')}
                </p>
                <Link href="/company/contact" className="text-red-600 font-sans text-xs uppercase font-bold hover:underline vietnamese-text flex items-center gap-1 tracking-widest">
                  {vn('LIÊN HỆ HỖ TRỢ')} <ArrowRight size={12} className="ml-1" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col border-t-[3px] border-newsprint-black">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className="border-b-[3px] border-newsprint-black pb-0">
                    <button
                      className="w-full flex items-center justify-between py-6 text-left focus:outline-none"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                    >
                      <span className={`text-base font-serif font-bold vietnamese-text pr-8 ${isOpen ? 'text-red-600' : 'text-newsprint-black'}`}>
                        {faq.question}
                      </span>
                      <div className={`w-6 h-6 flex-shrink-0 border-2 border-newsprint-black flex items-center justify-center transition-colors ${isOpen ? 'bg-newsprint-black text-newsprint-white' : 'bg-transparent text-newsprint-black'}`}>
                        {isOpen ? <X size={14} /> : <Plus size={14} />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="pb-8 pr-12 font-sans text-sm text-newsprint-gray-dark leading-relaxed vietnamese-text">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-transparent text-newsprint-black py-32">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-serif font-black leading-tight text-newsprint-black mb-8 vietnamese-text tracking-tight uppercase">
            {vn('Bắt đầu học ngôn ngữ')}<br />{vn('miễn phí ngay hôm nay')}
          </h2>
          <p className="text-lg md:text-xl font-serif italic text-newsprint-gray-dark mb-12 max-w-2xl mx-auto vietnamese-text">
            {vn('Tham gia hàng nghìn người đã thay đổi cách học ngoại ngữ với LinguaClay. Không cần thẻ tín dụng.')}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => openAuth('signin')}
              className="w-full sm:w-auto sm:min-w-[240px] px-10 py-5 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all font-sans vietnamese-text border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
            >
              {vn('BẮT ĐẦU MIỄN PHÍ')}
            </button>
            <button
              onClick={() => openAuth('signin')}
              className="w-full sm:w-auto sm:min-w-[240px] px-10 py-5 bg-transparent text-newsprint-black font-bold uppercase tracking-widest text-sm border-[3px] border-newsprint-black hover:bg-white transition-all font-sans vietnamese-text shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
            >
              {vn('ĐÃ CÓ TÀI KHOẢN?')}
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
