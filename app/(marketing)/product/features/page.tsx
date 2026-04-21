'use client'

import React from 'react'
import Link from 'next/link'
import AuthTrigger from '@/components/marketing/AuthTrigger'
import { BookOpen, MessageCircle, BarChart2, Trophy, Zap, Target, ArrowRight, Mic, Sparkles } from 'lucide-react'

export default function FeaturesPage() {
  return (
    <div className="w-full bg-transparent overflow-x-hidden">
      {/* Hero Section */}
      <section className="w-full border-b-[3px] border-newsprint-black py-8 sm:py-10 bg-transparent flex flex-col items-center">
        <div className="max-w-[1200px] mx-auto px-6 text-center flex flex-col items-center">
          <span className="inline-block px-4 py-1 mb-8 border-[3px] border-newsprint-black bg-newsprint-white text-newsprint-black text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            HỆ SINH THÁI TÍNH NĂNG
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-serif font-black text-newsprint-black mb-6 uppercase leading-tight tracking-tighter vietnamese-text">
            MỌI CÔNG CỤ BẠN CẦN<br />ĐỂ THÀNH THẠO NGÔN NGỮ
          </h1>
          <p className="text-base md:text-lg font-sans text-newsprint-gray-dark max-w-2xl mx-auto vietnamese-text mb-8">
            Khám phá chi tiết các tính năng được thiết kế riêng để tự động hóa quá trình ghi nhớ và tạo phản xạ giao tiếp tự nhiên cho bạn.
          </p>

          <Link href="#explore" className="text-[10px] sm:text-xs font-bold tracking-widest text-newsprint-gray-dark hover:text-newsprint-black transition-colors pb-1 flex items-center gap-2 vietnamese-text">
            ↓ Khám phá chi tiết
          </Link>
        </div>
      </section>

      {/* Grid 4 Quick Features */}
      <section id="explore" className="w-full border-b-[3px] border-newsprint-black py-16 sm:py-24 bg-transparent">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-[3px] border-newsprint-black bg-transparent shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            {/* Fet 1 */}
            <div className="p-8 border-b-[3px] sm:border-b-0 sm:border-r-[3px] lg:border-b-0 border-newsprint-black group">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-8 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all bg-newsprint-paper group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <BookOpen size={32} />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest mb-3 vietnamese-text">Flashcard Thông Minh</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Thuật toán SRS tự động canh thời điểm ôn tập tối ưu để bạn không bao giờ quên.</p>
            </div>
            {/* Fet 2 */}
            <div className="p-8 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-newsprint-black group">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-8 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all bg-newsprint-paper group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <MessageCircle size={32} />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest mb-3 vietnamese-text">AI Tutor Hội Thoại</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Luyện nói 1-1 với AI. Phản hồi phát âm, sửa lỗi ngữ pháp theo thời gian thực.</p>
            </div>
            {/* Fet 3 */}
            <div className="p-8 border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-newsprint-black group">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-8 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all bg-newsprint-paper group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <BarChart2 size={32} />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest mb-3 vietnamese-text">Tiến Độ Chi Tiết</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Theo dõi biểu đồ học tập, cấp độ mastery của từng từ vựng mỗi ngày.</p>
            </div>
            {/* Fet 4 */}
            <div className="p-8 group">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-8 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all bg-newsprint-paper group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <Trophy size={32} />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest mb-3 vietnamese-text">200+ Bài Ngữ Pháp</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Hệ thống bài giảng cô đọng, kèm bài tập thực hành áp dụng ngay lập tức.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight 1: Flashcards */}
      <section className="w-full border-b-[3px] border-newsprint-black py-16 sm:py-24 bg-transparent overflow-hidden relative">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-newsprint-black text-newsprint-white text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6">
              <BookOpen className="w-4 h-4" /> GHI NHỚ VĨNH VIỄN
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-newsprint-black mb-6 uppercase leading-tight vietnamese-text">
              Lặp lại ngắt quãng<br/>Spaced Repetition
            </h2>
            <p className="text-base font-sans text-newsprint-gray-dark mb-6 vietnamese-text">
              Bạn không cần phải tự hỏi "Hôm nay mình nên ôn gì?". Hệ thống sẽ tự động tính toán đường cong lãng quên của não bộ và gọi lại những thẻ từ bạn sắp quên nhất.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-sm font-sans text-newsprint-black font-bold vietnamese-text">
                <Zap className="w-5 h-5 shrink-0 text-red-600 mt-0.5" /> Thẻ học đa phương tiện (Âm thanh, Hình ảnh)
              </li>
              <li className="flex items-start gap-3 text-sm font-sans text-newsprint-black font-bold vietnamese-text">
                <Zap className="w-5 h-5 shrink-0 text-red-600 mt-0.5" /> Vuốt thẻ thao tác đơn giản như chơi game
              </li>
              <li className="flex items-start gap-3 text-sm font-sans text-newsprint-black font-bold vietnamese-text">
                <Zap className="w-5 h-5 shrink-0 text-red-600 mt-0.5" /> Tự động tạo bộ bài cá nhân từ thư viện cộng đồng
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="w-full aspect-square sm:aspect-[4/3] bg-newsprint-white border-[3px] border-newsprint-black shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] flex flex-col justify-center items-center p-8 group">
               {/* Mockup Card */}
               <div className="w-full max-w-sm aspect-[3/4] bg-[#F5F0E8] border-[3px] border-newsprint-black group-hover:-translate-y-4 group-hover:rotate-2 transition-all duration-500 shadow-xl flex flex-col items-center justify-center p-6 relative">
                  <span className="absolute top-4 left-4 text-[10px] font-bold border border-newsprint-black px-2 py-0.5">Mặt trước</span>
                  <BookOpen className="w-12 h-12 text-newsprint-black mb-4 opacity-20" />
                  <h3 className="text-3xl font-serif font-black">Perseverance</h3>
                  <p className="text-sm uppercase tracking-widest mt-2 text-newsprint-gray-dark">/pɜːrsɪˈvɪrəns/</p>
                  <p className="text-xs uppercase mt-8 text-newsprint-white font-bold tracking-widest border border-newsprint-black bg-newsprint-black px-4 py-2 shrink-0 transition-colors">CHẠM ĐỂ LẬT</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight 2: AI Tutor */}
      <section className="w-full border-b-[3px] border-newsprint-black py-16 sm:py-24 bg-transparent overflow-hidden relative">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="w-full aspect-square sm:aspect-[4/3] bg-newsprint-white border-[3px] border-newsprint-black shadow-[-12px_12px_0px_0px_rgba(20,20,20,1)] flex flex-col justify-center items-center p-6 sm:p-8">
               <div className="w-full max-w-md mt-auto bg-[#F5F0E8] border-[2px] border-newsprint-black p-4 text-right mb-4 rounded-xl rounded-tr-none text-sm font-sans shadow-sm hover:-translate-y-1 transition-transform">
                  <p className="font-bold text-newsprint-black mb-1">Bạn</p>
                  <p className="text-newsprint-gray-dark">Can we practice ordering food at a restaurant today?</p>
               </div>
               <div className="w-full max-w-md bg-newsprint-black text-newsprint-white border-[2px] border-newsprint-black p-4 text-left rounded-xl rounded-tl-none text-sm font-sans shadow-sm hover:-translate-y-1 transition-transform">
                  <p className="font-bold text-newsprint-white mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4"/> AI Tutor</p>
                  <p className="text-newsprint-paper/90">Absolutely! I will be the waiter. Let's start: <br/><br/><i className="text-white">"Good evening. Here is your menu. Can I get you started with anything to drink?"</i></p>
               </div>
               <div className="mt-8 flex gap-4">
                  <div className="w-14 h-14 rounded-full border-[3px] border-red-600 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors cursor-pointer shadow-md"><Mic className="w-6 h-6"/></div>
               </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 lg:pl-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-newsprint-white text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6">
              <MessageCircle className="w-4 h-4" /> PHẢN XẠ TỰ NHIÊN
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-newsprint-black mb-6 uppercase leading-tight vietnamese-text">
              AI Tutor<br/>Người Trợ Giảng Cá Nhân
            </h2>
            <p className="text-base font-sans text-newsprint-gray-dark mb-6 vietnamese-text">
              Xóa bỏ nỗi sợ nói sai. Trợ lý AI sẵn sàng 24/7 để tạo ra các tình huống nhập vai thực tế, giúp bạn luyện tập khẩu ngữ và sự tự tin ngay tại nhà mà không cần tự ti.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm font-sans text-newsprint-black font-bold vietnamese-text">
                <Zap className="w-5 h-5 shrink-0 text-red-600 mt-0.5" /> Giao tiếp qua giọng nói chân thực đa ngôn ngữ
              </li>
              <li className="flex items-start gap-3 text-sm font-sans text-newsprint-black font-bold vietnamese-text">
                <Zap className="w-5 h-5 shrink-0 text-red-600 mt-0.5" /> Nhận xét và sửa lỗi phát âm, ngữ pháp tức thì
              </li>
              <li className="flex items-start gap-3 text-sm font-sans text-newsprint-black font-bold vietnamese-text">
                <Zap className="w-5 h-5 shrink-0 text-red-600 mt-0.5" /> Hàng trăm kịch bản đóng vai (Nhà hàng, Phỏng vấn...)
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Differences */}
      <section className="w-full border-b-[3px] border-newsprint-black py-16 sm:py-24 bg-transparent">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-newsprint-black uppercase vietnamese-text pb-4 border-b-[3px] border-newsprint-black inline-block">
              TẠI SAO LINGUACLAY KHÁC BIỆT?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 lg:gap-16 group/diff">
            <div className="flex flex-col items-center text-center group transition-all">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-6 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all bg-newsprint-paper group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                 <Target size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-sm mb-4 vietnamese-text">Học theo quy luật não bộ</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">
                Chúng tôi không bắt bạn học nhồi nhét. LinguaClay sử dụng hệ thống đánh giá đường cong lãng quên để nhắc lại kiến thức vào đúng lúc bạn chuẩn bị quên.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center group transition-all">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-6 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all bg-newsprint-paper group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                 <BookOpen size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-sm mb-4 vietnamese-text">Cá nhân hóa bằng AI</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">
                Mỗi người học có một tốc độ và điểm yếu khác nhau. AI phân tích dữ liệu để tạo ra một lộ trình và cách giải thích chỉ dành riêng cho sự hiểu biết của bạn.
              </p>
            </div>

            <div className="flex flex-col items-center text-center group transition-all">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-6 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all bg-newsprint-paper group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                 <Trophy size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-sm mb-4 vietnamese-text">Tự do 100% thời gian</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">
                Không cần đặt lịch trước với giáo viên, không cần lớp học cố định. Bạn có một môi trường ngôn ngữ bản xứ tiêu chuẩn ngay trong túi, sẵn sàng bật mic luyện tập 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-transparent py-16 sm:py-32">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black text-newsprint-black mb-8 uppercase leading-tight vietnamese-text">
            BẠN ĐÃ SẴN SÀNG<br/>ĐỂ NÓI LƯU LOÁT?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <AuthTrigger tab="signin"
              className="w-full sm:w-auto sm:min-w-[240px] px-8 py-4 bg-black text-white font-bold uppercase tracking-widest border-[3px] border-black hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
            >
              BẮT ĐẦU MIỄN PHÍ <ArrowRight className="w-4 h-4"/>
            </AuthTrigger>
            <Link
              href="/product/pricing"
              className="w-full sm:w-auto sm:min-w-[240px] px-8 py-4 bg-transparent text-newsprint-black font-bold uppercase tracking-widest border-[3px] border-newsprint-black hover:bg-white transition-all text-center shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
            >
              XEM BẢNG GIÁ
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
