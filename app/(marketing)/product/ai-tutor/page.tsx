import React from 'react'
import Link from 'next/link'
import AuthTrigger from '@/components/marketing/AuthTrigger'
import { MessageSquare, Wand2, Mic2, History, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'

export default function AITutorPage() {
  return (
    <div className="w-full bg-transparent overflow-x-hidden">

      {/* 1. Hero Section */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-transparent pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="max-w-[1200px] mx-auto px-6 text-center flex flex-col items-center">
          <span className="inline-block px-4 py-1 mb-6 border-[3px] border-newsprint-black bg-newsprint-white text-newsprint-black text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            AI TUTOR
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black text-newsprint-black mb-8 uppercase leading-tight tracking-tight vietnamese-text">
            Người Thầy Không Bao Giờ<br />Mất Kiên Nhẫn
          </h1>
          <p className="text-lg md:text-xl font-sans text-newsprint-gray-dark max-w-2xl mx-auto vietnamese-text">
            Luyện hội thoại thực tế với AI 24/7 — không ngại sai, không sợ bị phán xét, phản hồi tức thời.
          </p>
        </div>
      </section>

      {/* 2. Vấn đề & Giải pháp - 2 cột */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-transparent py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="border-[3px] border-newsprint-black grid grid-cols-1 md:grid-cols-2 bg-newsprint-white shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            {/* Vấn Đề */}
            <div className="p-10 lg:p-16 border-b-[3px] md:border-b-0 md:border-r-[3px] border-newsprint-black bg-newsprint-paper group transition-colors duration-300">
              <div className="flex items-center gap-3 mb-6 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-bold text-sm uppercase tracking-widest vietnamese-text">NỖI ĐAU PHỔ BIẾN</h3>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-black mb-6 uppercase leading-tight vietnamese-text text-newsprint-black">Biết Ngữ Pháp Nhưng Không Thể Nói</h2>
              <ul className="space-y-4 font-sans text-base sm:text-lg text-newsprint-gray-dark leading-relaxed vietnamese-text">
                <li className="flex items-start gap-2"><span className="text-red-600 font-bold">—</span> Rất giỏi ngữ pháp trên giấy, nhưng đứng hình khi giao tiếp thật.</li>
                <li className="flex items-start gap-2"><span className="text-red-600 font-bold">—</span> Khó tìm được đối tác luyện tập kiên nhẫn.</li>
                <li className="flex items-start gap-2"><span className="text-red-600 font-bold">—</span> Sợ nói sai, sợ phát âm kém, sợ bị người khác đánh giá.</li>
                <li className="flex items-start gap-2"><span className="text-red-600 font-bold">—</span> Thiếu môi trường thực hành phản xạ hàng ngày.</li>
              </ul>
            </div>
            {/* Giải Pháp */}
            <div className="p-10 lg:p-16 group bg-newsprint-black text-newsprint-white transition-colors duration-300">
              <div className="flex items-center gap-3 mb-6 text-[#3A7642]">
                <CheckCircle2 className="w-6 h-6" />
                <h3 className="font-bold text-sm uppercase tracking-widest vietnamese-text text-[#3A7642]">LINGUACLAY GIẢI QUYẾT</h3>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-black mb-6 uppercase leading-tight vietnamese-text">Môi Trường Luyện Tập An Toàn Tuyệt Đối</h2>
              <p className="font-sans text-base sm:text-lg text-newsprint-gray-medium leading-relaxed vietnamese-text mb-4">
                AI Tutor tạo ra một môi trường giả định an toàn nơi bạn có thể nói tiếng Anh (hoặc bất kỳ ngôn ngữ nào) thoải mái mà không lo bị soi xét.
              </p>
              <p className="font-sans text-base sm:text-lg text-newsprint-gray-medium leading-relaxed vietnamese-text">
                Nói sai? AI sẽ chỉnh ngay tắp lự. Phát âm ngọng? Chỉnh phát âm tận gốc. Hàng chục tình huống luôn chực chờ để bạn "làm nóng" ngay tức khắc.
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
              Giá Trị Cốt Lõi Của AI
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-[3px] border-newsprint-black bg-newsprint-white shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            {/* Card 1 */}
            <div className="p-8 border-b-[3px] sm:border-b-0 sm:border-r-[3px] lg:border-b-0 border-newsprint-black group">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-8 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] bg-newsprint-paper">
                <MessageSquare size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-base mb-4 vietnamese-text line-clamp-2 min-h-[3rem]">Hội Thoại Thực Tế</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Luyện theo tình huống cụ thể: đặt đồ ăn, phỏng vấn xin việc, hỏi đường, mua sắm, check-in sân bay...</p>
            </div>
            {/* Card 2 */}
            <div className="p-8 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-newsprint-black group">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-8 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] bg-newsprint-paper">
                <Wand2 size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-base mb-4 vietnamese-text line-clamp-2 min-h-[3rem]">Sửa Lỗi Tức Thì</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Nhận diện lỗi phát âm và điểm khiếm khuyết trong câu, AI sẽ giải thích ngắn gọn rồi thúc ép bạn nói lại cho đúng.</p>
            </div>
            {/* Card 3 */}
            <div className="p-8 border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-newsprint-black group">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-8 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] bg-newsprint-paper">
                <Mic2 size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-base mb-4 vietnamese-text line-clamp-2 min-h-[3rem]">Chọn Giọng & Phong Cách</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Luyện tập đa dạng với các giọng điệu Anh, Mỹ, Úc — linh hoạt từ cách nói chuyện đường phố đến môi trường công sở.</p>
            </div>
            {/* Card 4 */}
            <div className="p-8 group">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-8 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] bg-newsprint-paper">
                <History size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-base mb-4 vietnamese-text line-clamp-2 min-h-[3rem]">Lịch Sử Giao Tiếp</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Lưu vết và tra cứu lại mọi lịch sử trò chuyện. Đem ra chiêm nghiệm và đo đạc sự tiến bộ hàng tháng bằng dữ liệu thật.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Spotlight */}
      <section className="w-full border-b-[3px] border-newsprint-black py-24 bg-transparent overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          <div className="relative group p-6 sm:p-10 border-[3px] border-newsprint-black bg-newsprint-white shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] order-2 lg:order-1">
            <div className="w-full aspect-[4/3] bg-[#EBE3D5] border-[3px] border-newsprint-black relative flex flex-col p-6 overflow-hidden">
              {/* Mock Chat UI inside */}
              <div className="flex-1 flex flex-col gap-4">
                {/* AI message */}
                <div className="bg-newsprint-white border-[2px] border-newsprint-black p-3 max-w-[85%] self-start shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1 transition-transform">
                  <p className="text-xs font-bold text-red-600 mb-1">Cửa hàng cà phê (AI)</p>
                  <p className="text-sm font-sans text-newsprint-black">Hi there! What can I get for you today?</p>
                </div>
                {/* User message */}
                <div className="bg-newsprint-black border-[2px] border-newsprint-black p-3 max-w-[85%] self-end shadow-[2px_2px_0px_0px_rgba(20,20,20,0.2)] hover:-translate-y-1 transition-transform">
                  <p className="text-xs font-bold text-newsprint-gray-medium mb-1 drop-shadow">Bạn đang nói</p>
                  <p className="text-sm font-sans text-newsprint-white italic opacity-80">"I want a coffee black..."</p>
                </div>
                {/* AI Correction */}
                <div className="bg-[#EBE3D5] border-[2px] border-dashed border-red-600 p-3 max-w-[85%] self-start">
                  <p className="text-[10px] font-bold text-red-600 mb-1 uppercase tracking-widest">Sửa lỗi lập tức</p>
                  <p className="text-sm font-sans text-newsprint-gray-dark">Thay vì nói "I want a coffee black", hãy thử cách nói tự nhiên hơn: <strong className="text-newsprint-black">"I'll have a black coffee, please."</strong></p>
                </div>
              </div>
              {/* Input Area */}
              <div className="mt-4 pt-4 border-t-[2px] border-newsprint-black flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-[3px] border-newsprint-black bg-red-600 flex items-center justify-center text-white animate-pulse shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]">
                  <Mic2 size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-newsprint-black mb-6 uppercase leading-tight vietnamese-text">
              Luyện Đúng<br />Tình Huống Bạn Cần
            </h2>
            <div className="h-[3px] w-24 bg-red-600 mb-8"></div>
            <p className="font-sans text-base sm:text-lg text-newsprint-gray-dark leading-relaxed vietnamese-text mb-6">
              Không học theo những cuốn giáo trình xa rời thực tế rập khuôn. Hãy chọn đúng tình huống mà bạn sắp sửa hoặc đang đối mặt.
            </p>
            <p className="font-sans text-base sm:text-lg text-newsprint-black font-medium leading-relaxed vietnamese-text border-l-4 border-red-600 pl-4 py-2">
              Một buổi họp bằng tiếng Anh, một chuyến du lịch đến Nhật Bản hay đơn giản là cuộc gọi khó nhằn với đối tác. AI sẽ đóng vai đối tác và dẫn dắt bạn đi qua từng bước một với ngôn ngữ đời thường nhất.
            </p>
          </div>

        </div>
      </section>

      {/* 5. Con số */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-newsprint-black text-newsprint-white py-16">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y divide-newsprint-gray-dark/50 md:divide-y-0 md:divide-x">
          <div className="flex flex-col flex-1 pb-8 md:pb-0 pt-4 md:pt-0 items-center justify-center text-center">
            <div className="text-4xl sm:text-5xl font-sans font-black mb-2">24/7</div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-medium">Sẵn sàng luyện mọi lúc</div>
          </div>
          <div className="flex flex-col flex-1 pb-8 md:pb-0 pt-8 md:pt-0 items-center justify-center text-center">
            <div className="text-4xl sm:text-5xl font-sans font-black mb-2">50+</div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-medium">Tình huống thực tế</div>
          </div>
          <div className="flex flex-col flex-1 pb-8 md:pb-0 pt-8 md:pt-0 items-center justify-center text-center">
            <div className="text-4xl sm:text-5xl font-sans font-black mb-2">5S</div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-medium">Phản hồi thần tốc</div>
          </div>
          <div className="flex flex-col flex-1 pt-8 md:pt-0 items-center justify-center text-center">
            <div className="text-4xl sm:text-5xl font-sans font-black mb-2">0</div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-medium">Lần mất kiên nhẫn</div>
          </div>
        </div>
      </section>

      {/* 6. CTA Cuối Trang */}
      <section className="w-full bg-transparent text-newsprint-black py-24 sm:py-32">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black leading-tight text-newsprint-black mb-8 vietnamese-text tracking-tight uppercase">
            Sẵn sàng để mở miệng<br />Nói chưa?
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-serif italic text-newsprint-gray-dark mb-12 max-w-2xl mx-auto vietnamese-text">
            Thử nói chuyện với AI Tutor ngay hôm nay — Phá vỡ khoảng cách giữa giấy bút và ngôn từ.
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
