import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const sections = [
  { id: 'gioi-thieu', label: '1. Giới thiệu' },
  { id: 'tai-khoan', label: '2. Tài khoản người dùng' },
  { id: 'goi-hoc', label: '3. Gói học & Thanh toán' },
  { id: 'so-huu', label: '4. Quyền sở hữu nội dung' },
  { id: 'cam', label: '5. Hành vi bị cấm' },
  { id: 'cham-dut', label: '6. Chấm dứt dịch vụ' },
  { id: 'thay-doi', label: '7. Thay đổi điều khoản' },
  { id: 'lien-he', label: '8. Liên hệ' },
]

export default function TermsPage() {
  return (
    <div className="w-full bg-[#F5F0E8] overflow-x-hidden">

      {/* 1. Hero */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-transparent pt-16 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col items-center text-center">
          <span className="inline-block px-4 py-1 mb-6 border-[3px] border-newsprint-black bg-newsprint-white text-newsprint-black text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            PHÁP LÝ
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-sans font-black uppercase text-newsprint-black leading-tight tracking-tight mb-6">
            Điều khoản dịch vụ
          </h1>
          <div className="flex items-center gap-3 font-sans text-xs font-bold uppercase tracking-widest text-newsprint-gray-dark">
            <span className="w-2 h-2 bg-red-600 inline-block rounded-full"></span>
            Cập nhật lần cuối: 21/4/2026
          </div>
        </div>
      </section>

      {/* Main 2-col layout */}
      <section className="w-full py-20">
        <div className="max-w-[1100px] mx-auto px-6 flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

          {/* Sidebar: Mục lục */}
          <aside className="w-full lg:w-[260px] shrink-0 lg:sticky lg:top-[100px]">
            <div className="border-[3px] border-newsprint-black bg-newsprint-white p-6 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]">
              <h3 className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-black mb-5 pb-3 border-b-[2px] border-newsprint-black">
                MỤC LỤC
              </h3>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2 text-xs font-bold font-sans uppercase tracking-wide text-newsprint-gray-dark hover:text-red-600 hover:translate-x-1 transition-all py-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600" />
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Back to legal */}
            <div className="mt-6 border-[2px] border-newsprint-black bg-[#EBE3D5] p-5">
              <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-newsprint-gray-dark mb-3">Tài liệu liên quan</p>
              <Link href="/support/privacy" className="block text-xs font-bold font-sans uppercase text-newsprint-black hover:text-red-600 transition-colors hover:underline mb-2">
                Chính sách bảo mật →
              </Link>
              <Link href="/company/contact" className="block text-xs font-bold font-sans uppercase text-newsprint-black hover:text-red-600 transition-colors hover:underline">
                Liên hệ hỗ trợ →
              </Link>
            </div>
          </aside>

          {/* Nội dung chính */}
          <main className="flex-1 min-w-0 space-y-16">

            {/* Section 1 */}
            <div id="gioi-thieu" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-white bg-newsprint-black px-3 py-1 shrink-0">01</span>
                <h2 className="font-sans font-black text-xl sm:text-2xl uppercase text-newsprint-black">Giới thiệu</h2>
                <div className="flex-1 h-[2px] bg-newsprint-black" />
              </div>
              <p className="font-sans text-[17px] leading-[1.85] text-newsprint-gray-dark vietnamese-text">
                LinguaClay là nền tảng học ngôn ngữ trực tuyến được vận hành bởi <strong className="text-newsprint-black">LinguaClay Inc.</strong> Bằng việc đăng ký và sử dụng dịch vụ, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi tất cả các điều khoản được nêu trong tài liệu này.
              </p>
              <p className="font-sans text-[17px] leading-[1.85] text-newsprint-gray-dark vietnamese-text mt-4">
                Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, bạn không được phép sử dụng dịch vụ của chúng tôi. Điều khoản này có hiệu lực kể từ ngày đăng ký tài khoản.
              </p>
            </div>

            {/* Section 2 */}
            <div id="tai-khoan" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-white bg-newsprint-black px-3 py-1 shrink-0">02</span>
                <h2 className="font-sans font-black text-xl sm:text-2xl uppercase text-newsprint-black">Tài khoản người dùng</h2>
                <div className="flex-1 h-[2px] bg-newsprint-black" />
              </div>
              <div className="space-y-4 font-sans text-[17px] leading-[1.85] text-newsprint-gray-dark vietnamese-text">
                <p>Bạn chịu toàn bộ trách nhiệm bảo mật thông tin đăng nhập (email và mật khẩu) của mình. Mỗi tài khoản chỉ dành cho một cá nhân sử dụng — bạn không được chia sẻ, chuyển nhượng hoặc cho phép người khác truy cập vào tài khoản của mình.</p>
                <div className="border-l-4 border-red-600 pl-5 bg-newsprint-white py-4 pr-4 border-[2px] border-newsprint-black border-l-red-600">
                  <p className="font-bold text-newsprint-black">Lưu ý:</p>
                  <p>LinguaClay không bao giờ yêu cầu bạn cung cấp mật khẩu qua email hoặc chat. Nếu nhận được yêu cầu như vậy, hãy báo cáo ngay cho chúng tôi.</p>
                </div>
                <p>Bạn phải thông báo ngay cho chúng tôi nếu phát hiện bất kỳ hành vi truy cập trái phép vào tài khoản của mình. Chúng tôi không chịu trách nhiệm về bất kỳ tổn thất nào phát sinh từ việc bạn không bảo mật thông tin đăng nhập.</p>
              </div>
            </div>

            {/* Section 3 */}
            <div id="goi-hoc" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-white bg-newsprint-black px-3 py-1 shrink-0">03</span>
                <h2 className="font-sans font-black text-xl sm:text-2xl uppercase text-newsprint-black">Gói học & Thanh toán</h2>
                <div className="flex-1 h-[2px] bg-newsprint-black" />
              </div>
              <div className="space-y-4 font-sans text-[17px] leading-[1.85] text-newsprint-gray-dark vietnamese-text">
                <p><strong className="text-newsprint-black">Chu kỳ thanh toán:</strong> Các gói trả phí được tính theo chu kỳ 3 tháng, 6 tháng hoặc 12 tháng kể từ ngày kích hoạt.</p>
                <p><strong className="text-newsprint-black">Gia hạn tự động:</strong> Gói học sẽ tự động gia hạn vào cuối mỗi kỳ trừ khi bạn hủy trước ít nhất <strong className="whitespace-nowrap text-newsprint-black">24 giờ</strong>. Thông báo nhắc nhở sẽ được gửi trước <strong>7 ngày</strong>.</p>
                <p><strong className="text-newsprint-black">Hoàn tiền:</strong> Chúng tôi hỗ trợ hoàn tiền trong vòng 7 ngày kể từ ngày thanh toán nếu bạn chưa sử dụng quá 20% tính năng của kỳ đã mua. Yêu cầu hoàn tiền gửi về <a href="mailto:anh249205@gmail.com" className="text-red-600 underline">anh249205@gmail.com</a>.</p>
                <p><strong className="text-newsprint-black">Giá cả:</strong> LinguaClay có quyền thay đổi giá dịch vụ và sẽ thông báo trước ít nhất 30 ngày. Giá cũ vẫn được áp dụng cho toàn bộ kỳ thanh toán hiện tại của bạn.</p>
              </div>
            </div>

            {/* Section 4 */}
            <div id="so-huu" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-white bg-newsprint-black px-3 py-1 shrink-0">04</span>
                <h2 className="font-sans font-black text-xl sm:text-2xl uppercase text-newsprint-black">Quyền sở hữu nội dung</h2>
                <div className="flex-1 h-[2px] bg-newsprint-black" />
              </div>
              <div className="space-y-4 font-sans text-[17px] leading-[1.85] text-newsprint-gray-dark vietnamese-text">
                <p>Toàn bộ nội dung trên LinguaClay — bao gồm nhưng không giới hạn văn bản, hình ảnh, âm thanh, video, flashcard, bài học ngữ pháp và thuật toán — thuộc quyền sở hữu độc quyền của LinguaClay Inc.</p>
                <p>Người dùng <strong className="text-newsprint-black">không được phép</strong> sao chép, tái tạo, phân phối, xuất bản, dịch thuật hoặc khai thác thương mại bất kỳ nội dung nào từ nền tảng dưới bất kỳ hình thức nào mà không có sự đồng ý bằng văn bản của chúng tôi.</p>
                <p>Đối với nội dung do người dùng tạo (ví dụ: flashcard tùy chỉnh), bạn giữ quyền sở hữu nhưng cấp cho LinguaClay quyền sử dụng không độc quyền để cải thiện dịch vụ.</p>
              </div>
            </div>

            {/* Section 5 */}
            <div id="cam" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-white bg-red-600 px-3 py-1 shrink-0">05</span>
                <h2 className="font-sans font-black text-xl sm:text-2xl uppercase text-newsprint-black">Hành vi bị cấm</h2>
                <div className="flex-1 h-[2px] bg-newsprint-black" />
              </div>
              <div className="border-[3px] border-newsprint-black bg-newsprint-white p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <ul className="space-y-3 font-sans text-[16px] leading-relaxed text-newsprint-gray-dark vietnamese-text">
                  {[
                    'Gửi spam, quảng cáo hoặc nội dung không liên quan đến học tập',
                    'Cố tình hack, tấn công hoặc khai thác lỗ hổng bảo mật của hệ thống',
                    'Sử dụng bot, script tự động hoặc công cụ giả lập để tương tác với dịch vụ',
                    'Chia sẻ tài khoản hoặc thông tin đăng nhập cho người khác',
                    'Sao chép, cào dữ liệu hoặc trích xuất nội dung bằng phương thức tự động',
                    'Đăng tải nội dung vi phạm pháp luật, bản quyền hoặc gây hại cho người khác',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-red-600 font-black mt-0.5 shrink-0">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 6 */}
            <div id="cham-dut" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-white bg-newsprint-black px-3 py-1 shrink-0">06</span>
                <h2 className="font-sans font-black text-xl sm:text-2xl uppercase text-newsprint-black">Chấm dứt dịch vụ</h2>
                <div className="flex-1 h-[2px] bg-newsprint-black" />
              </div>
              <div className="space-y-4 font-sans text-[17px] leading-[1.85] text-newsprint-gray-dark vietnamese-text">
                <p>LinguaClay có quyền tạm khóa hoặc chấm dứt tài khoản mà không cần thông báo trước nếu chúng tôi phát hiện vi phạm nghiêm trọng các điều khoản này.</p>
                <p>Đối với các vi phạm nhỏ hơn, chúng tôi sẽ gửi cảnh báo trước và cho bạn thời gian khắc phục trong vòng <strong className="text-newsprint-black">48 giờ</strong> trước khi áp dụng hình phạt.</p>
                <p>Khi tài khoản bị chấm dứt vĩnh viễn, toàn bộ dữ liệu của bạn sẽ bị xóa sau 30 ngày. Các khoản thanh toán đã thực hiện sẽ không được hoàn lại trong trường hợp vi phạm.</p>
              </div>
            </div>

            {/* Section 7 */}
            <div id="thay-doi" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-white bg-newsprint-black px-3 py-1 shrink-0">07</span>
                <h2 className="font-sans font-black text-xl sm:text-2xl uppercase text-newsprint-black">Thay đổi điều khoản</h2>
                <div className="flex-1 h-[2px] bg-newsprint-black" />
              </div>
              <div className="space-y-4 font-sans text-[17px] leading-[1.85] text-newsprint-gray-dark vietnamese-text">
                <p>Chúng tôi có thể cập nhật các điều khoản này bất cứ lúc nào để phản ánh thay đổi trong dịch vụ, yêu cầu pháp lý hoặc chính sách kinh doanh.</p>
                <p>Khi có thay đổi quan trọng, chúng tôi sẽ thông báo qua email đăng ký và hiển thị thông báo trên ứng dụng ít nhất <strong className="text-newsprint-black">7 ngày</strong> trước khi có hiệu lực.</p>
                <p>Việc tiếp tục sử dụng dịch vụ sau ngày điều khoản mới có hiệu lực được coi là bạn đồng ý với các thay đổi đó.</p>
              </div>
            </div>

            {/* Section 8 */}
            <div id="lien-he" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-white bg-newsprint-black px-3 py-1 shrink-0">08</span>
                <h2 className="font-sans font-black text-xl sm:text-2xl uppercase text-newsprint-black">Liên hệ</h2>
                <div className="flex-1 h-[2px] bg-newsprint-black" />
              </div>
              <div className="font-sans text-[17px] leading-[1.85] text-newsprint-gray-dark vietnamese-text">
                <p className="mb-6">Mọi thắc mắc liên quan đến Điều khoản dịch vụ, vui lòng liên hệ:</p>
                <div className="border-[3px] border-newsprint-black bg-newsprint-white p-8 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] inline-block w-full">
                  <p className="font-sans font-black text-sm uppercase tracking-widest text-newsprint-black mb-1">LinguaClay Inc.</p>
                  <p className="mb-1">Email: <a href="mailto:anh249205@gmail.com" className="text-red-600 underline font-bold">anh249205@gmail.com</a></p>
                  <p className="mb-1">Hotline: <span className="font-black text-newsprint-black">0866 555 468</span></p>
                  <p>Địa chỉ: Cầu Giấy, Hà Nội, Việt Nam</p>
                </div>
              </div>
            </div>

          </main>
        </div>
      </section>

      {/* CTA cuối */}
      <section className="w-full py-24 sm:py-32 bg-transparent text-newsprint-black border-t-[3px] border-newsprint-black">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-sans font-black uppercase text-newsprint-black leading-tight tracking-tight mb-8 vietnamese-text">
            Có câu hỏi về điều khoản?
          </h2>
          <p className="text-lg md:text-xl font-serif italic text-newsprint-gray-dark mb-12 max-w-2xl mx-auto vietnamese-text">
            Đội ngũ pháp lý của chúng tôi sẵn sàng giải đáp trong vòng <span className="whitespace-nowrap">24 giờ</span>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/company/contact" className="w-full sm:w-auto px-10 py-5 bg-newsprint-black text-newsprint-white font-bold uppercase tracking-widest text-sm hover:bg-transparent hover:text-newsprint-black transition-colors font-sans border-[3px] border-newsprint-black">
              LIÊN HỆ HỖ TRỢ
            </Link>
            <Link href="/support/privacy" className="w-full sm:w-auto px-10 py-5 bg-transparent text-newsprint-black font-bold uppercase tracking-widest text-sm border-[3px] border-newsprint-black hover:bg-newsprint-white transition-colors font-sans">
              CHÍNH SÁCH BẢO MẬT
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
