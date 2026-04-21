import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Clock, Facebook, Twitter, Linkedin, List, BrainCircuit, ArrowRight, ArrowUpRight, ChevronRight, Zap } from 'lucide-react'
import AuthTrigger from '@/components/marketing/AuthTrigger'

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const title = decodeURIComponent(resolvedParams.slug).replace(/-/g, ' ')

  const isFeatured = resolvedParams.slug === 'featured-post'
  const displayTitle = isFeatured 
    ? 'Tại sao 95% người học tiếng Anh bỏ cuộc sau 3 tháng — và cách LinguaClay giải quyết điều đó' 
    : (title.length > 5 ? title.toUpperCase() : 'BÍ QUYẾT HỌC NGÔN NGỮ THỜI ĐẠI AI: KHI MÁY MÓC DẠY CON NGƯỜI')

  const formatNumbers = (text: string) => {
    return text.split(/(\d+%?)/).map((part, i) => 
      /\d/.test(part) ? <span key={i} className="font-sans font-black tracking-normal inline-block align-baseline">{part}</span> : part
    )
  }

  return (
    <div className="w-full bg-[#F5F0E8] overflow-x-hidden pb-16 font-sans">
      
      {/* 1. Thanh Top Điều Hướng / Breadcrumb */}
      <div className="w-full border-b-[3px] border-newsprint-black py-4 bg-newsprint-white sticky top-0 z-40 shadow-sm">
         <div className="max-w-[1000px] mx-auto px-6 flex items-center justify-between">
            <nav className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-newsprint-gray-dark">
               <Link href="/" className="hover:text-red-600 transition-colors">Trang chủ</Link>
               <ChevronRight className="w-3 h-3 mx-1" />
               <Link href="/blog" className="hover:text-red-600 transition-colors">Blog</Link>
               <ChevronRight className="w-3 h-3 mx-1" />
               <span className="text-newsprint-black font-sans">Phương pháp học</span>
            </nav>
            <div className="hidden sm:flex items-center gap-3">
               <span className="text-[10px] font-bold uppercase tracking-widest text-newsprint-gray-dark font-sans">CHIA SẺ:</span>
               <button className="hover:text-red-600 transition-colors"><Facebook className="w-4 h-4" /></button>
               <button className="hover:text-red-600 transition-colors"><Twitter className="w-4 h-4" /></button>
               <button className="hover:text-red-600 transition-colors"><Linkedin className="w-4 h-4" /></button>
            </div>
         </div>
      </div>

      {/* 2. Tiêu đề Bài Viết (Hero) */}
      <section className="w-full pt-16 pb-12 bg-transparent border-b-[3px] border-newsprint-black px-6">
         <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row gap-8 items-start justify-between">
            <div className="flex-1">
               <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="px-3 py-1 bg-newsprint-black text-newsprint-white text-[10px] font-bold uppercase tracking-widest border-[2px] border-newsprint-black shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]">
                     PHƯƠNG PHÁP HỌC
                  </span>
                  <span className="flex items-center gap-2 text-xs font-bold text-newsprint-gray-dark uppercase tracking-widest font-sans">
                     <Calendar className="w-3 h-3" /> {formatNumbers('15')} THÁNG {formatNumbers('3')}, {formatNumbers('2024')}
                  </span>
                  <span className="flex items-center gap-2 text-xs font-bold text-newsprint-gray-dark uppercase tracking-widest font-sans">
                     <Clock className="w-3 h-3" /> {formatNumbers('7')} PHÚT ĐỌC
                  </span>
               </div>
               
               <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-serif font-black uppercase text-newsprint-black leading-[1.1] tracking-tight vietnamese-text mb-6">
                  {formatNumbers(displayTitle)}
               </h1>

               <p className="text-[17px] sm:text-xl font-sans text-newsprint-gray-dark leading-relaxed vietnamese-text mb-8">
                  Động lực luôn tràn trề vào ngày đầu tiên, nhưng lại cạn kiệt vào ngày thứ {formatNumbers('90')}. Chúng tôi tìm ra đâu là lý do thực sự — và xây hệ thống môi trường học để giải quyết đúng gốc rễ vấn đề đó trước khi bạn kịp bỏ cuộc.
               </p>
               
               <div className="flex items-center gap-4 pt-6 border-t-[2px] border-dashed border-newsprint-gray-light max-w-sm">
                  <div className="w-12 h-12 bg-newsprint-black rounded-full flex items-center justify-center text-newsprint-white border-[2px] border-newsprint-black shadow-[4px_4px_0px_0px_#e63946]">
                     <User className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="font-bold uppercase tracking-widest text-sm text-newsprint-black vietnamese-text leading-tight mb-1">NGUYỄN TUẤN ANH</p>
                     <p className="text-[10px] font-sans font-bold text-red-600 uppercase tracking-widest">LinguaClay Editor in Chief</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 3. Ảnh Cover Bài Viết - Width bằng với Hero */}
      <section className="w-full max-w-[1000px] mx-auto mt-12 mb-16 px-6">
         <div className="w-full aspect-video border-[3px] border-newsprint-black bg-newsprint-paper relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] group">
            <img 
               src="https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2000&auto=format&fit=crop" 
               alt="Studying late" 
               className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            />
            {/* Filter Overlay */}
            <div className="absolute inset-0 bg-[#3A7642] opacity-30 mix-blend-multiply pointer-events-none"></div>
            
            <div className="absolute top-4 left-4 border-[3px] border-newsprint-white px-3 py-1 bg-transparent text-newsprint-white text-[10px] font-bold uppercase tracking-widest rotate-[-5deg] backdrop-blur-md">
               LINGUACLAY EDITORIAL
            </div>
         </div>
      </section>

      {/* Main Layout: 2 Cột (Thân bài trái - Mục lục Sidebar phải) */}
      <section className="w-full max-w-[1000px] mx-auto px-6 flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
         
         {/* 4. Nội Dung Bài Viết (Cột trái to hơn) */}
         {/* Bỏ giới hạn của thẻ prose bằng max-w-none */}
         <main className="flex-1 min-w-0 prose prose-lg prose-p:font-sans prose-p:text-[17px] prose-p:leading-[1.85] prose-p:font-normal prose-p:text-[#1a1a1a] prose-headings:font-serif prose-headings:font-black prose-headings:text-newsprint-black prose-a:text-red-600 prose-a:font-bold prose-strong:text-newsprint-black prose-blockquote:border-l-[4px] prose-blockquote:border-red-600 prose-blockquote:bg-newsprint-white prose-blockquote:p-6 prose-blockquote:shadow-[4px_4px_0px_0px_#e63946] prose-blockquote:not-italic prose-blockquote:font-sans prose-li:font-sans max-w-none w-full order-2 lg:order-1 mb-16">
            
            <p className="vietnamese-text font-sans text-xl sm:text-2xl font-bold leading-relaxed border-l-4 border-newsprint-black pl-5 !mt-0 !mb-12">
               Hệ thống giáo dục truyền thống thường cố gắng nhồi nặn bạn lại bằng cách ép học vẹt. Nhưng đó là cách tiếp cận giết chết hứng thú một cách nhanh nhất.
            </p>

            <h2 id="phan-1" className="vietnamese-text font-sans font-black text-2xl mt-12 mb-6 uppercase tracking-tight">{formatNumbers("1. Sự Mâu Thuẫn Của Động Lực")}</h2>
            <p className="vietnamese-text">
               Khi bạn bắt đầu học một ngôn ngữ mới, não bộ sẽ tự động bơm ra một lượng lớn dopamine. Bạn hào hứng tải ứng dụng, mua sách mới khổ giấy đẹp, dán giấy ghi nhớ rực rỡ khắp nhà từ cửa tủ lạnh tới gương nhà tắm.
            </p>
            <p className="vietnamese-text">
               Nhưng cơ chế tiết dopamine sinh học không được thiết kế để duy trì cho những cuộc chạy marathon đường trường hàng năm trời. Khoảng {formatNumbers('3')} tuần sau, sự lãng mạn ban đầu phai nhạt dần. Thứ còn lại trên bàn học chỉ là một danh sách dài thườn thượt những quy tắc ngữ pháp rườm rà đầy rẫy ngoại lệ và hàng nghìn từ vựng rời rạc.
            </p>

            <blockquote className="vietnamese-text my-12 text-newsprint-black">
               <p className="text-xl sm:text-2xl font-bold leading-relaxed !m-0 font-sans">"Não bộ con người không phải là một chiếc ổ cứng USB để cắm vào máy và chép dữ liệu. Nó đòi hỏi sự lặp lại có tính toán để hình thành nên nếp nhăn ký ức."</p>
            </blockquote>

            <h2 id="phan-2" className="vietnamese-text font-sans font-black text-2xl mt-12 mb-6 uppercase tracking-tight">{formatNumbers("2. Giải Pháp: Lặp Lại Ngắt Quãng")}</h2>
            <p className="vietnamese-text">
               Tham khảo nền tảng khoa học vững chắc của một bộ công cụ gọi là <strong>Spaced Repetition System (SRS)</strong>. Thuật toán này cực kỳ thông minh: Nó vạch ra chính xác những khối lượng hình thái thông tin bạn sắp quên và nhắc nhở vào đúng "thời điểm vàng".
            </p>

            {/* CTA GIỮA BÀI (Mid-Content Block) */}
            <div className="my-14 border-[3px] border-newsprint-black bg-[#EBE3D5] p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] not-prose w-full">
               <div className="w-16 h-16 bg-red-600 shrink-0 flex items-center justify-center border-[2px] border-newsprint-black rounded-full rotate-[-15deg]">
                  <Zap className="w-8 h-8 text-white fill-white" />
               </div>
               <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-sans font-black uppercase text-xl text-newsprint-black mb-2 leading-tight vietnamese-text">Biến lý thuyết thành thực hành</h4>
                  <p className="font-sans text-[15px] sm:text-base text-newsprint-gray-dark mb-0">Thuật toán lặp lại ngắt quãng đã được tối ưu thẳng vào LinguaClay.</p>
               </div>
                <AuthTrigger tab="signin" className="shrink-0 px-6 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest border-[3px] border-black hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                   DÙNG THỬ NGAY
                </AuthTrigger>
            </div>

            {/* Block Nổi Bật: Ebbinghaus (Callout Box - Constraint by max-w-none) */}
            <div id="phan-3" className="my-14 p-6 sm:p-10 border-[3px] border-newsprint-black bg-newsprint-black text-newsprint-white shadow-[8px_8px_0px_0px_#e63946] relative overflow-hidden group not-prose w-full">
               <div className="relative z-10 w-full">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pb-6 border-b border-newsprint-gray-dark/40">
                     <div className="w-12 h-12 bg-newsprint-white text-newsprint-black flex items-center justify-center border-[2px] border-red-600 rounded-full shrink-0 shadow-[2px_2px_0px_0px_#e63946]">
                        <BrainCircuit className="w-6 h-6" />
                     </div>
                     <h3 className="!my-0 font-sans font-black uppercase text-2xl sm:text-3xl vietnamese-text text-newsprint-white leading-tight">{formatNumbers("Đường Cong Ebbinghaus")}</h3>
                  </div>
                  <ul className="!my-0 !pl-0 space-y-4 text-newsprint-white text-[17px] leading-relaxed list-none font-sans">
                     <li className="flex items-start gap-3">
                        <span className="text-red-500 font-black mt-1">✓</span>
                        <span className="font-sans"><strong>{formatNumbers('20')} Phút đầu:</strong> Sau khi học xong, {formatNumbers('42%')} kiến thức "bốc hơi".</span>
                     </li>
                     <li className="flex items-start gap-3">
                        <span className="text-red-500 font-black mt-1">✓</span>
                        <span className="font-sans"><strong>Ngày thứ {formatNumbers('3')}:</strong> Bạn chỉ còn sót lại khoảng chừng {formatNumbers('30%')}.</span>
                     </li>
                     <li className="flex items-start gap-3">
                        <span className="text-red-500 font-black mt-1">✓</span>
                        <span className="font-sans"><strong>Ngày thứ {formatNumbers('7')}:</strong> Quên sạch mọi thứ.</span>
                     </li>
                  </ul>
               </div>
            </div>

            <p className="vietnamese-text text-[17px]">
               Đó là lý do máy đọc (flashcard) phải vứt cái thẻ mờ nhạt đó lên màn hình đúng cái tích tắc nếp nhăn não bộ của bạn buông thõng dữ liệu.
            </p>

            <h2 id="phan-4" className="vietnamese-text font-sans font-black text-2xl mt-12 mb-6 uppercase tracking-tight">{formatNumbers("4. Hành Trình Bền Vững Đích Thực")}</h2>
            <p className="vietnamese-text text-[17px]">
               Thời điểm tốt nhất để học cách giao tiếp đúng phương pháp là {formatNumbers('10')} năm trước. Thời điểm tốt nhì là ngay bây giờ cùng sự dìu dắt không mệt mỏi của AI.
            </p>
         </main>

         {/* Sidebar Navigation - Đẩy sang Cột Phải */}
         <aside className="w-full lg:w-[280px] shrink-0 sticky top-[100px] z-10 hidden lg:block order-1 lg:order-2">
            <div className="border-[3px] border-newsprint-black bg-newsprint-white p-6 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]">
               <h3 className="font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2 border-b-[2px] border-newsprint-black pb-3 text-newsprint-black font-sans">
                  <List className="w-4 h-4"/> MỤC LỤC
               </h3>
               <ul className="space-y-4 font-sans text-[13px] font-bold text-newsprint-gray-dark uppercase tracking-wide">
                  <li>
                     <a href="#phan-1" className="block hover:text-red-600 hover:translate-x-1 transition-all">{formatNumbers("1. Sự Mâu Thuẫn Của Động Lực")}</a>
                  </li>
                  <li>
                     <a href="#phan-2" className="block hover:text-red-600 hover:translate-x-1 transition-all">{formatNumbers("2. Giải Pháp: Lặp Lại Ngắt Quãng")}</a>
                  </li>
                  <li>
                     <a href="#phan-3" className="block hover:text-red-600 hover:translate-x-1 transition-all">{formatNumbers("3. Quy Luật Quên Ebbinghaus")}</a>
                  </li>
                  <li>
                     <a href="#phan-4" className="block hover:text-red-600 hover:translate-x-1 transition-all">{formatNumbers("4. Hành Trình Bền Vững")}</a>
                  </li>
               </ul>
            </div>
         </aside>
      </section>

      {/* 6. CTAs in Content Footer - Brutalist Section */}
      <section className="w-full py-24 sm:py-32 bg-transparent text-newsprint-black border-t-[3px] border-newsprint-black overflow-hidden">
         <div className="max-w-[1000px] mx-auto px-6 text-center">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-sans font-black uppercase text-newsprint-black leading-tight tracking-tight mb-8 vietnamese-text">
               HỌC NGAY ĐỂ KHÔNG BỎ CUỘC
            </h2>
            <p className="text-lg md:text-xl font-serif italic text-newsprint-gray-dark mb-12 max-w-2xl mx-auto vietnamese-text">
               Đừng lãng phí {formatNumbers('90')} ngày tiếp theo của bạn trong trạng thái dậm chân tại chỗ. AI Tutor đã sẵn sàng chờ.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <AuthTrigger tab="signin" className="w-full sm:w-auto sm:min-w-[240px] px-12 py-5 bg-black text-white font-bold uppercase tracking-widest text-sm border-[3px] border-black hover:bg-white hover:text-black transition-all font-sans flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]">
                   BẮT ĐẦU MIỄN PHÍ
                </AuthTrigger>
               <Link href="/product/pricing" className="w-full sm:w-auto sm:min-w-[240px] px-12 py-5 bg-transparent text-newsprint-black font-bold uppercase tracking-widest text-sm border-[3px] border-newsprint-black hover:bg-white transition-all duration-300 font-sans flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]">
                  XEM BẢNG GIÁ
               </Link>
            </div>
         </div>
      </section>

      {/* 7. Bài Viết Liên Quan Component (3 cột Grid) */}
      <section className="w-full py-20 border-t-[3px] border-newsprint-black bg-[#F5F0E8]">
         <div className="max-w-[1000px] mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
               <h2 className="text-3xl sm:text-4xl font-sans font-black uppercase text-newsprint-black vietnamese-text border-b-[4px] border-newsprint-black pr-4 inline-block pb-2">Bài Viết Cùng Chủ Đề</h2>
               <Link href="/blog" className="hidden sm:flex text-xs font-bold uppercase tracking-widest hover:text-red-600 transition-colors items-center gap-1 group font-sans">
                  Xem tất cả <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
               </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {/* Thẻ 1 */}
               <Link href="/blog/post-1" className="group flex flex-col border-[3px] border-newsprint-black bg-newsprint-white hover:-translate-y-2 transition-transform duration-300 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] overflow-hidden h-full">
                  <div className="w-full h-[180px] border-b-[3px] border-newsprint-black bg-newsprint-paper relative flex justify-end p-4 overflow-hidden">
                     <div className="absolute inset-0 bg-[#3A7642] opacity-30 mix-blend-multiply"></div>
                     <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                     <div className="relative bg-newsprint-white border-[2px] border-newsprint-black w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity mt-auto ml-auto rounded-full">
                        <ArrowUpRight className="w-4 h-4 text-newsprint-black" />
                     </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-newsprint-black mb-3 border-[1.5px] border-newsprint-black px-2 py-0.5 self-start bg-newsprint-white font-sans">PHƯƠNG PHÁP HỌC</span>
                     <h4 className="font-serif font-black text-xl uppercase leading-snug text-newsprint-black group-hover:text-red-600 transition-colors vietnamese-text mb-4 line-clamp-3">
                        {formatNumbers("Tối đa hóa năng suất học tập cùng AI")}
                     </h4>
                     <p className="font-sans text-[15px] text-newsprint-gray-dark line-clamp-2 mt-auto">Khi AI biết bạn hay quên chỗ nào, học lúc nào hiệu quả nhất.</p>
                  </div>
               </Link>

               {/* Thẻ 2 */}
               <Link href="/blog/post-2" className="group flex flex-col border-[3px] border-newsprint-black bg-newsprint-white hover:-translate-y-2 transition-transform duration-300 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] overflow-hidden h-full">
                  <div className="w-full h-[180px] border-b-[3px] border-newsprint-black bg-newsprint-paper relative flex justify-end p-4 overflow-hidden">
                     <div className="absolute inset-0 bg-[#E3A320] opacity-30 mix-blend-multiply"></div>
                     <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                     <div className="relative bg-newsprint-white border-[2px] border-newsprint-black w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity mt-auto ml-auto rounded-full">
                        <ArrowUpRight className="w-4 h-4 text-newsprint-black" />
                     </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-newsprint-black mb-3 border-[1.5px] border-newsprint-black px-2 py-0.5 self-start bg-newsprint-white font-sans">PHƯƠNG PHÁP HỌC</span>
                     <h4 className="font-serif font-black text-xl uppercase leading-snug text-newsprint-black group-hover:text-red-600 transition-colors vietnamese-text mb-4 line-clamp-3">
                        {formatNumbers("Spaced Repetition là gì và tại sao hiệu quả")}
                     </h4>
                     <p className="font-sans text-[15px] text-newsprint-gray-dark line-clamp-2 mt-auto">Não bộ không ghi nhớ theo lịch của bạn — mà theo SRS.</p>
                  </div>
               </Link>

               {/* Thẻ 3 */}
               <Link href="/blog/post-3" className="group flex flex-col border-[3px] border-newsprint-black bg-newsprint-white hover:-translate-y-2 transition-transform duration-300 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] overflow-hidden h-full">
                  <div className="w-full h-[180px] border-b-[3px] border-newsprint-black bg-newsprint-paper relative flex justify-end p-4 overflow-hidden">
                     <div className="absolute inset-0 bg-red-600 opacity-20 mix-blend-multiply"></div>
                     <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                     <div className="relative bg-newsprint-white border-[2px] border-newsprint-black w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity mt-auto ml-auto rounded-full">
                        <ArrowUpRight className="w-4 h-4 text-newsprint-black" />
                     </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-newsprint-black mb-3 border-[1.5px] border-newsprint-black px-2 py-0.5 self-start bg-newsprint-white font-sans">PHƯƠNG PHÁP HỌC</span>
                     <h4 className="font-serif font-black text-xl uppercase leading-snug text-newsprint-black group-hover:text-red-600 transition-colors vietnamese-text mb-4 line-clamp-3">
                        {formatNumbers("Cách xây thói quen học mỗi ngày")}
                     </h4>
                     <p className="font-sans text-[15px] text-newsprint-gray-dark line-clamp-2 mt-auto">15 phút mỗi ngày làm sao để đánh bại 3 tiếng mỗi cuối tuần.</p>
                  </div>
               </Link>
            </div>
         </div>
      </section>

    </div>
  )
}
