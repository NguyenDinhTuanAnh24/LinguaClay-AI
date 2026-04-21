import React from 'react'
import Link from 'next/link'
import AuthTrigger from '@/components/marketing/AuthTrigger'
import { Brain, Edit3, Library, BarChart2, CheckSquare, Layers, Clock, ArrowRight } from 'lucide-react'

export default function FlashcardPage() {
  return (
    <div className="w-full bg-transparent overflow-x-hidden">

      {/* 1. Hero Section */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-transparent pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="max-w-[1200px] mx-auto px-6 text-center flex flex-col items-center">
          <span className="inline-block px-4 py-1 mb-6 border-[3px] border-newsprint-black bg-newsprint-white text-newsprint-black text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            FLASHCARD
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black text-newsprint-black mb-8 uppercase leading-tight tracking-tight vietnamese-text">
            Học từ vựng theo cách<br />não bộ hoạt động
          </h1>
          <p className="text-lg md:text-xl font-sans text-newsprint-gray-dark max-w-2xl mx-auto vietnamese-text">
            Không phải học vẹt — hệ thống tự động nhắc đúng thời điểm bạn sắp quên, giúp biến trí nhớ ngắn hạn thành phản xạ dài hạn.
          </p>
        </div>
      </section>

      {/* 2. Cách hoạt động - 3 bước */}
      <section className="w-full border-b-[3px] border-newsprint-black py-24 bg-transparent">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-serif font-black text-newsprint-black mb-6 uppercase leading-tight vietnamese-text">
              3 Bước Đơn Giản
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="border-[3px] border-newsprint-black bg-newsprint-white p-8 group relative lg:hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-12 h-12 bg-newsprint-black text-newsprint-white font-sans font-black text-2xl flex items-center justify-center translate-x-3 -translate-y-3 border-[3px] border-newsprint-black">1</div>
              <Layers className="w-12 h-12 text-newsprint-black mb-6" />
              <h3 className="font-bold text-xl uppercase tracking-widest text-newsprint-black mb-4 vietnamese-text">Chọn bộ thẻ</h3>
              <p className="font-sans text-base text-newsprint-gray-dark leading-relaxed vietnamese-text">
                Tìm kiếm và chọn các chủ đề bạn muốn học trong thư viện, hoặc tự tạo bộ thẻ riêng của bạn chỉ trong vài giây.
              </p>
            </div>
            {/* Step 2 */}
            <div className="border-[3px] border-newsprint-black bg-newsprint-white p-8 group relative lg:hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-12 h-12 bg-newsprint-black text-newsprint-white font-sans font-black text-2xl flex items-center justify-center translate-x-3 -translate-y-3 border-[3px] border-newsprint-black">2</div>
              <CheckSquare className="w-12 h-12 text-newsprint-black mb-6" />
              <h3 className="font-bold text-xl uppercase tracking-widest text-newsprint-black mb-4 vietnamese-text">Học cùng AI</h3>
              <p className="font-sans text-base text-newsprint-gray-dark leading-relaxed vietnamese-text">
                Hệ thống hiển thị từ, bạn tự đánh giá mức độ nhớ của bản thân. AI sẽ ghi lại và tự động lên lịch thẻ cho lần ôn tiếp theo.
              </p>
            </div>
            {/* Step 3 */}
            <div className="border-[3px] border-newsprint-black bg-newsprint-white p-8 group relative lg:hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-12 h-12 bg-newsprint-black text-newsprint-white font-sans font-black text-2xl flex items-center justify-center translate-x-3 -translate-y-3 border-[3px] border-newsprint-black">3</div>
              <Clock className="w-12 h-12 text-newsprint-black mb-6" />
              <h3 className="font-bold text-xl uppercase tracking-widest text-newsprint-black mb-4 vietnamese-text">Ôn đúng lúc</h3>
              <p className="font-sans text-base text-newsprint-gray-dark leading-relaxed vietnamese-text">
                Hệ thống sẽ nhắc bạn ôn lại thẻ đúng thời điểm bạn chuẩn bị quên — không quá sớm để lãng phí thời gian, không quá muộn để phải học lại từ đầu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tính năng nổi bật */}
      <section className="w-full border-b-[3px] border-newsprint-black py-24 bg-transparent">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-serif font-black text-newsprint-black mb-6 uppercase leading-tight vietnamese-text">
              Tính Năng Trọng Tâm
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-[3px] border-newsprint-black bg-newsprint-white shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            {/* Card 1 */}
            <div className="p-8 border-b-[3px] sm:border-b-0 sm:border-r-[3px] lg:border-b-0 border-newsprint-black group">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-8 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] bg-newsprint-paper">
                <Brain size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-base mb-4 vietnamese-text line-clamp-2 min-h-[3rem]">SRS Khoa Học</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Thuật toán lặp lại ngắt quãng, đã được khoa học chứng minh giúp bạn ghi nhớ nhanh hơn 5 lần cách học truyền thống.</p>
            </div>
            {/* Card 2 */}
            <div className="p-8 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-newsprint-black group">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-8 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] bg-newsprint-paper">
                <Edit3 size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-base mb-4 vietnamese-text line-clamp-2 min-h-[3rem]">Tự Tạo Bộ Thẻ</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Thêm từ vựng riêng, chèn hình ảnh, phiên âm chi tiết hoặc thậm chí thu âm giọng nói của chính bạn để luyện tập.</p>
            </div>
            {/* Card 3 */}
            <div className="p-8 border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-newsprint-black group">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-8 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] bg-newsprint-paper">
                <Library size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-base mb-4 vietnamese-text line-clamp-2 min-h-[3rem]">Thư Viện Có Sẵn</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Truy cập 10.000+ thẻ có sẵn được biên soạn kỹ lưỡng, phân loại theochủ đề, cấp độ khó và mục tiêu chứng chỉ.</p>
            </div>
            {/* Card 4 */}
            <div className="p-8 group">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-8 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] bg-newsprint-paper">
                <BarChart2 size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-base mb-4 vietnamese-text line-clamp-2 min-h-[3rem]">Theo Dõi Tiến Độ</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Hệ thống biểu đồ học tập rõ ràng, cho phép bạn biết chính xác mình đang tiến bộ thế nào và đã đạt cấp độ Mastery chưa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Spotlight */}
      <section className="w-full border-b-[3px] border-newsprint-black py-24 bg-transparent overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-newsprint-black mb-6 uppercase leading-tight vietnamese-text">
              Nhớ lâu hơn với <br />Spaced Repetition
            </h2>
            <div className="h-[3px] w-24 bg-red-600 mb-8"></div>
            <p className="font-sans text-base sm:text-lg text-newsprint-gray-dark leading-relaxed vietnamese-text mb-6">
              Thay vì cắm cúi học 100 từ trong một lúc rồi quên sạch sau một tuần, thuật toán SRS (Spaced Repetition System) của chúng tôi chia nhỏ chúng ra.
            </p>
            <p className="font-sans text-base sm:text-lg text-newsprint-black font-medium leading-relaxed vietnamese-text border-l-4 border-red-600 pl-4 py-2">
              Kết quả: Bạn sẽ ghi nhớ được tới 90% lượng từ vựng sau 3 tháng thay vì 10% như phương pháp nhồi nhét thông thường.
            </p>
          </div>

          <div className="relative group p-6 sm:p-12 border-[3px] border-newsprint-black bg-newsprint-white shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            <div className="w-full aspect-[4/3] bg-newsprint-paper border-[3px] border-newsprint-black relative flex flex-col items-center justify-center overflow-hidden p-8">
              {/* Mock Flashcard UI inside */}
              <div className="w-full max-w-[280px] bg-newsprint-white border-[3px] border-newsprint-black aspect-square flex flex-col items-center justify-center p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-2 transition-transform duration-300 group-hover:-rotate-3">
                <p className="text-sm font-bold text-newsprint-gray-dark tracking-widest uppercase mb-auto">VOCABULARY</p>
                <h3 className="font-serif font-black text-4xl uppercase text-newsprint-black mb-4">Brutalist</h3>
                <p className="text-base font-sans text-newsprint-gray-dark italic mb-auto">/bruːtəlɪst/</p>
                <div className="w-full h-[3px] bg-newsprint-gray-medium my-4"></div>
                <div className="w-full flex justify-between gap-2 mt-auto">
                  <div className="flex-1 h-8 border-[2px] border-newsprint-black bg-red-600"></div>
                  <div className="flex-1 h-8 border-[2px] border-newsprint-black bg-[#E3A320]"></div>
                  <div className="flex-1 h-8 border-[2px] border-newsprint-black bg-[#3A7642]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Con số */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-newsprint-black text-newsprint-white py-16">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y divide-newsprint-gray-dark/50 md:divide-y-0 md:divide-x">
          <div className="flex flex-col flex-1 pb-8 md:pb-0 pt-4 md:pt-0 items-center justify-center text-center">
            <div className="text-4xl sm:text-5xl font-sans font-black mb-2">500k+</div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-medium">Thẻ đã học</div>
          </div>
          <div className="flex flex-col flex-1 pb-8 md:pb-0 pt-8 md:pt-0 items-center justify-center text-center">
            <div className="text-4xl sm:text-5xl font-sans font-black mb-2">10k+</div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-medium">Thẻ trong thư viện</div>
          </div>
          <div className="flex flex-col flex-1 pb-8 md:pb-0 pt-8 md:pt-0 items-center justify-center text-center">
            <div className="text-4xl sm:text-5xl font-sans font-black mb-2">90%</div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-medium">Giữ lại sau 3 tháng</div>
          </div>
          <div className="flex flex-col flex-1 pt-8 md:pt-0 items-center justify-center text-center">
            <div className="text-4xl sm:text-5xl font-sans font-black mb-2">15p</div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-medium">Mỗi ngày là đủ</div>
          </div>
        </div>
      </section>

      {/* 6. CTA Cuối Trang */}
      <section className="w-full bg-transparent text-newsprint-black py-24 sm:py-32">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black leading-tight text-newsprint-black mb-8 vietnamese-text tracking-tight uppercase">
            Bắt đầu học từ vựng<br />Thông minh hơn
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-serif italic text-newsprint-gray-dark mb-12 max-w-2xl mx-auto vietnamese-text">
            Sử dụng công nghệ AI để tăng tốc ghi nhớ ngay hôm nay. Phương pháp của bạn, tốc độ của bạn.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <AuthTrigger tab="signin"
              className="w-full sm:w-auto sm:min-w-[240px] px-8 py-4 bg-black text-white font-bold uppercase tracking-widest border-[3px] border-black hover:bg-white hover:text-black transition-all duration-300 vietnamese-text text-sm flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
            >
              BẮT ĐẦU MIỄN PHÍ <ArrowRight className="w-4 h-4" />
            </AuthTrigger>
            <Link
              href="/product/pricing"
              className="w-full sm:w-auto sm:min-w-[240px] px-8 py-4 bg-transparent text-newsprint-black font-bold uppercase tracking-widest border-[3px] border-newsprint-black hover:bg-white transition-all duration-300 vietnamese-text text-sm text-center shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
            >
              XEM BẢNG GIÁ
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
