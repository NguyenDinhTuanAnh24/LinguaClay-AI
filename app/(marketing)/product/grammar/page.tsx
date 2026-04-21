import React from 'react'
import Link from 'next/link'
import AuthTrigger from '@/components/marketing/AuthTrigger'
import { BookOpen, FileText, CheckSquare, Sparkles, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'

export default function GrammarPage() {
  const grammarTopics = [
    'Thì động từ', 'Mệnh đề quan hệ', 'Câu điều kiện', 'Giới từ',
    'Danh từ & Mạo từ', 'Câu bị động', 'Cấu trúc so sánh', 'Động từ khuyết thiếu (Modal Verbs)',
    'Câu tường thuật', 'Thể giả định', 'Sự hòa hợp Chủ - Vị', 'Và nhiều hơn nữa...'
  ]

  return (
    <div className="w-full bg-transparent overflow-x-hidden">

      {/* 1. Hero Section */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-transparent pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="max-w-[1200px] mx-auto px-6 text-center flex flex-col items-center">
          <span className="inline-block px-4 py-1 mb-6 border-[3px] border-newsprint-black bg-newsprint-white text-newsprint-black text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            NGỮ PHÁP
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black text-newsprint-black mb-8 uppercase leading-tight tracking-tight vietnamese-text">
            Hiểu Ngữ Pháp Một Lần<br />Nhớ Mãi Mãi
          </h1>
          <p className="text-lg md:text-xl font-sans text-newsprint-gray-dark max-w-2xl mx-auto vietnamese-text">
            Không học thuộc lòng quy tắc khô khan — học qua ví dụ thực tế và luyện tập ngay lập tức.
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
              <h2 className="text-3xl sm:text-4xl font-serif font-black mb-6 uppercase leading-tight vietnamese-text text-newsprint-black">Sách Dày Nhưng Đầu Trống</h2>
              <ul className="space-y-4 font-sans text-base sm:text-lg text-newsprint-gray-dark leading-relaxed vietnamese-text">
                <li className="flex items-start gap-2"><span className="text-red-600 font-bold">—</span> Học thuộc làu làu quy tắc nhưng khi ghép thành câu thì không biết dùng lúc nào.</li>
                <li className="flex items-start gap-2"><span className="text-red-600 font-bold">—</span> Công thức quá nhiều, các trường hợp ngoại lệ liên tục gây nhầm lẫn.</li>
                <li className="flex items-start gap-2"><span className="text-red-600 font-bold">—</span> Chỉ đọc lý thuyết mà không có bài tập thực hành ngay lập tức.</li>
                <li className="flex items-start gap-2"><span className="text-red-600 font-bold">—</span> Quên sạch sành sanh sau vài ngày vì không bao giờ được hệ thống nhắc ôn lại.</li>
              </ul>
            </div>
            {/* Giải Pháp */}
            <div className="p-10 lg:p-16 group bg-newsprint-black text-newsprint-white transition-colors duration-300">
              <div className="flex items-center gap-3 mb-6 text-[#3A7642]">
                <CheckCircle2 className="w-6 h-6" />
                <h3 className="font-bold text-sm uppercase tracking-widest vietnamese-text text-[#3A7642]">LINGUACLAY GIẢI QUYẾT</h3>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-black mb-6 uppercase leading-tight vietnamese-text">Ngữ Pháp Đi Liền Với Thực Tiễn</h2>
              <p className="font-sans text-base sm:text-lg text-newsprint-gray-medium leading-relaxed vietnamese-text mb-4">
                Mỗi bài học trên LinguaClay đều có giải thích siêu ngắn gọn, ví dụ xuất phát từ các tình huống nói chuyện thực tế và bài tập kiểm tra ép bạn phải tư duy ngay.
              </p>
              <p className="font-sans text-base sm:text-lg text-newsprint-gray-medium leading-relaxed vietnamese-text">
                Không cần cầm sách dày cộm, không cần tự tay ghi chép lại các công thức từ đầu. Não bộ học tốt nhất khi được thực hành ngay lập tức.
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
              Công Cụ Vượt Trội
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-[3px] border-newsprint-black bg-newsprint-white shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            {/* Card 1 */}
            <div className="p-8 border-b-[3px] sm:border-b-0 sm:border-r-[3px] lg:border-b-0 border-newsprint-black group">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-8 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] bg-newsprint-paper">
                <BookOpen size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-base mb-4 vietnamese-text line-clamp-2 min-h-[3rem]">200+ Bài Ngữ Pháp</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Phủ toàn bộ từ A1 (cơ bản) đến C2 (thành thạo), nội dung được chia theo lộ trình và cấp độ rõ ràng.</p>
            </div>
            {/* Card 2 */}
            <div className="p-8 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-newsprint-black group">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-8 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] bg-newsprint-paper">
                <FileText size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-base mb-4 vietnamese-text line-clamp-2 min-h-[3rem]">Ví Dụ Thực Tế</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Mỗi quy tắc đều có câu ví dụ áp dụng vào tình huống giao tiếp hàng ngày thay cho rập khuôn giáo trình cứng nhắc.</p>
            </div>
            {/* Card 3 */}
            <div className="p-8 border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-newsprint-black group">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-8 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] bg-newsprint-paper">
                <CheckSquare size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-base mb-4 vietnamese-text line-clamp-2 min-h-[3rem]">Thực Hành Tức Thì</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Học xong lý thuyết thì làm bài tập luôn. Củng cố nếp nhăn não ngay trong lúc quy tắc vẫn còn tươi mới trong đầu.</p>
            </div>
            {/* Card 4 */}
            <div className="p-8 group">
              <div className="w-16 h-16 border-[3px] border-newsprint-black mb-8 flex items-center justify-center text-newsprint-black group-hover:bg-newsprint-black group-hover:text-newsprint-white transition-all group-hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] bg-newsprint-paper">
                <Sparkles size={32} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-base mb-4 vietnamese-text line-clamp-2 min-h-[3rem]">Ôn Tập Thông Minh</h3>
              <p className="font-sans text-sm text-newsprint-gray-dark vietnamese-text">Bài tập nào làm sai sẽ được hệ thống ghim lại và nhắc nhở ôn luyện vào thời điểm vàng, đảm bảo nhớ lâu sâu sắc.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Spotlight */}
      <section className="w-full border-b-[3px] border-newsprint-black py-24 bg-transparent overflow-hidden border-t-[3px]">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-newsprint-black mb-6 uppercase leading-tight vietnamese-text">
              Từ Quy Tắc Đến<br />Thực Hành Trong 5 Phút
            </h2>
            <div className="h-[3px] w-24 bg-red-600 mb-8"></div>
            <p className="font-sans text-base sm:text-lg text-newsprint-gray-dark leading-relaxed vietnamese-text mb-6">
              Thay vì đọc rã rời 2 trang giấy giải thích khô ráp, bạn chỉ cần đọc đúng 3 câu kết luận siêu ngắn, xem 2 ví dụ và lao vào làm ngay 5 câu bài tập thực hành.
            </p>
            <p className="font-sans text-base sm:text-lg text-newsprint-black font-medium leading-relaxed vietnamese-text border-l-4 border-red-600 pl-4 py-2">
              Não bộ học tốt nhất khi được yêu cầu sử dụng thông tin ngay lập tức — LinguaClay được xây dựng theo đúng nguyên tắc vận động đó.
            </p>
          </div>

          {/* Mockup Giao Diện Bài Học */}
          <div className="relative group p-6 sm:p-10 border-[3px] border-newsprint-black bg-newsprint-white shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            <div className="w-full aspect-[4/3] bg-newsprint-black border-[3px] border-newsprint-black relative flex flex-col p-6 overflow-hidden items-center justify-center">

              {/* Simulated UI App */}
              <div className="w-[90%] bg-newsprint-white border-[3px] border-newsprint-black p-6 hover:-translate-y-2 transition-transform duration-300">
                <p className="text-xs font-bold text-red-600 tracking-widest uppercase mb-4">Hiện Tại Hoàn Thành (Present Perfect)</p>

                <div className="mb-6 p-4 bg-[#F5F0E8] border-[2px] border-newsprint-black">
                  <p className="text-sm font-sans text-newsprint-black">Chúng ta đã sống ở đây được 5 năm rồi.</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="px-3 py-1.5 border-[2px] border-newsprint-black bg-newsprint-paper text-sm font-bold shadow-[2px_2px_0px_0px_#000]">We</span>
                  <span className="px-3 py-1.5 border-[2px] border-newsprint-black bg-white text-sm font-bold shadow-[2px_2px_0px_0px_#000] border-b-4 text-red-600">have live ?</span>
                  <span className="px-3 py-1.5 border-[2px] border-newsprint-black bg-newsprint-paper text-sm font-bold shadow-[2px_2px_0px_0px_#000]">here</span>
                  <span className="px-3 py-1.5 border-[2px] border-newsprint-black bg-newsprint-paper text-sm font-bold shadow-[2px_2px_0px_0px_#000]">for</span>
                  <span className="px-3 py-1.5 border-[2px] border-newsprint-black bg-newsprint-paper text-sm font-bold shadow-[2px_2px_0px_0px_#000]">5 years</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <div className="py-2 text-center border-[2px] border-newsprint-black bg-[#EBE3D5] text-sm font-bold cursor-pointer hover:bg-newsprint-black hover:text-white transition-colors">lived</div>
                  <div className="py-2 text-center border-[2px] border-newsprint-black bg-[#EBE3D5] text-sm font-bold cursor-pointer hover:bg-newsprint-black hover:text-white transition-colors">have lived</div>
                  <div className="py-2 text-center border-[2px] border-newsprint-black bg-[#EBE3D5] text-sm font-bold cursor-pointer hover:bg-newsprint-black hover:text-white transition-colors">has lived</div>
                  <div className="py-2 text-center border-[2px] border-newsprint-black bg-[#EBE3D5] text-sm font-bold cursor-pointer hover:bg-newsprint-black hover:text-white transition-colors">living</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 5. Cấu trúc Chủ Đề */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-[#EBE3D5] py-24 border-t-[3px] border-dashed">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-newsprint-black mb-10 uppercase leading-tight vietnamese-text">
            Bao Phủ Mọi Khía Cạnh Cấu Trúc
          </h2>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
            {grammarTopics.map((topic, i) => (
              <span
                key={i}
                className={`font-sans font-bold text-sm sm:text-base px-4 py-2 border-[2px] border-newsprint-black transition-all hover:-translate-y-1 ${i % 2 === 0 ? 'bg-newsprint-white text-newsprint-black shadow-[3px_3px_0px_0px_rgba(20,20,20,1)]' : 'bg-newsprint-black text-newsprint-white shadow-[3px_3px_0px_0px_#e63946]'
                  }`}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Con số */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-newsprint-black text-newsprint-white py-16">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y divide-newsprint-gray-dark/50 md:divide-y-0 md:divide-x">
          <div className="flex flex-col flex-1 pb-8 md:pb-0 pt-4 md:pt-0 items-center justify-center text-center">
            <div className="text-4xl sm:text-5xl font-sans font-black mb-2">200+</div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-medium">Bài ngữ pháp</div>
          </div>
          <div className="flex flex-col flex-1 pb-8 md:pb-0 pt-8 md:pt-0 items-center justify-center text-center">
            <div className="text-3xl sm:text-4xl font-sans font-black mb-2 flex items-center justify-center gap-2">Zero <ArrowRight className="w-6 h-6" /> Hero</div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-medium">Phân cấp tinh gọn</div>
          </div>
          <div className="flex flex-col flex-1 pb-8 md:pb-0 pt-8 md:pt-0 items-center justify-center text-center">
            <div className="text-4xl sm:text-5xl font-sans font-black mb-2">1,000+</div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-medium">Câu bài tập kiểm tra</div>
          </div>
          <div className="flex flex-col flex-1 pt-8 md:pt-0 items-center justify-center text-center">
            <div className="text-4xl sm:text-5xl font-sans font-black mb-2 mt-1"><Sparkles className="w-10 h-10" /></div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-medium mt-1">Cập nhật liên tục</div>
          </div>
        </div>
      </section>

      {/* 7. CTA Cuối Trang */}
      <section className="w-full bg-transparent text-newsprint-black py-24 sm:py-32">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black leading-tight text-newsprint-black mb-8 vietnamese-text tracking-tight uppercase">
            Ngữ Pháp Không Còn Là<br />Nỗi sợ nữa.
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-serif italic text-newsprint-gray-dark mb-12 max-w-2xl mx-auto vietnamese-text">
            Bẻ khóa ngôn ngữ tự nhiên thông qua các quy luật đơn giản nhất. Xây dựng nền tảng vững vàng.
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
