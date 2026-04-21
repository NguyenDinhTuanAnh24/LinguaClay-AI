import React from 'react'
import Link from 'next/link'
import { ChevronRight, Shield, User, BarChart3, Laptop, Lock, Building2, Search, AlertCircle } from 'lucide-react'

const sections = [
  { id: 'thu-thap', label: '1. Chúng tôi thu thập gì?' },
  { id: 'muc-dich', label: '2. Tại sao chúng tôi thu thập?' },
  { id: 'chia-se', label: '3. Chia sẻ dữ liệu' },
  { id: 'bao-mat', label: '4. Bảo mật dữ liệu' },
  { id: 'quyen', label: '5. Quyền của bạn' },
  { id: 'cookie', label: '6. Cookie' },
  { id: 'lien-he', label: '7. Liên hệ về bảo mật' },
]

export default function PrivacyPage() {
  return (
    <div className="w-full bg-[#F5F0E8] overflow-x-hidden">

      {/* 1. Hero */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-transparent pt-16 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col items-center text-center">
          <span className="inline-block px-4 py-1 mb-6 border-[3px] border-newsprint-black bg-newsprint-white text-newsprint-black text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            PHÁP LÝ
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-sans font-black uppercase text-newsprint-black leading-tight tracking-tight mb-6">
            Chính sách bảo mật
          </h1>
          <div className="flex items-center gap-3 font-sans text-xs font-bold uppercase tracking-widest text-newsprint-gray-dark">
            <span className="w-2 h-2 bg-red-600 inline-block rounded-full"></span>
            Cập nhật lần cuối: 21/04/2026
          </div>
        </div>
      </section>

      {/* 2-col layout */}
      <section className="w-full py-20">
        <div className="max-w-[1100px] mx-auto px-6 flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

          {/* Sidebar sticky */}
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

            {/* Cam kết bảo mật */}
            <div className="mt-6 border-[3px] border-newsprint-black bg-newsprint-black p-5 shadow-[4px_4px_0px_0px_rgba(230,57,70,1)]">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-red-500 shrink-0" />
                <p className="font-sans text-[10px] font-black uppercase tracking-widest text-newsprint-white">Cam kết bảo mật</p>
              </div>
              <p className="font-sans text-xs text-newsprint-white opacity-70 leading-relaxed">
                Dữ liệu của bạn không bao giờ được bán hoặc khai thác cho mục đích quảng cáo.
              </p>
            </div>

            <div className="mt-4 border-[2px] border-newsprint-black bg-[#EBE3D5] p-5">
              <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-newsprint-gray-dark mb-3">Tài liệu liên quan</p>
              <Link href="/support/terms" className="block text-xs font-bold font-sans uppercase text-newsprint-black hover:text-red-600 transition-colors hover:underline mb-2">
                Điều khoản dịch vụ →
              </Link>
              <Link href="/company/contact" className="block text-xs font-bold font-sans uppercase text-newsprint-black hover:text-red-600 transition-colors hover:underline">
                Liên hệ hỗ trợ →
              </Link>
            </div>
          </aside>

          {/* Nội dung chính */}
          <main className="flex-1 min-w-0 space-y-16">

            {/* Section 1 */}
            <div id="thu-thap" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-white bg-newsprint-black px-3 py-1 shrink-0">01</span>
                <h2 className="font-sans font-black text-xl sm:text-2xl uppercase text-newsprint-black">Chúng tôi thu thập thông tin gì?</h2>
                <div className="flex-1 h-[2px] bg-newsprint-black hidden sm:block" />
              </div>
              <div className="space-y-6">
                {[
                  {
                    title: 'Thông tin cá nhân',
                    body: 'Khi bạn đăng ký tài khoản, chúng tôi thu thập tên hiển thị và địa chỉ email. Những thông tin này là bắt buộc để tạo và quản lý tài khoản của bạn.',
                    icon: <User className="w-5 h-5" />
                  },
                  {
                    title: 'Dữ liệu học tập',
                    body: 'Chúng tôi ghi lại tiến độ học, số flashcard đã học, kết quả bài kiểm tra, thời gian học trong ngày và các tính năng bạn đã sử dụng. Dữ liệu này được dùng để cá nhân hóa lộ trình học.',
                    icon: <BarChart3 className="w-5 h-5" />
                  },
                  {
                    title: 'Thông tin thiết bị & trình duyệt',
                    body: 'Chúng tôi thu thập loại trình duyệt, hệ điều hành, địa chỉ IP (được ẩn danh) và múi giờ của bạn để tối ưu hóa trải nghiệm và xử lý sự cố kỹ thuật.',
                    icon: <Laptop className="w-5 h-5" />
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 border-[2px] border-newsprint-black bg-newsprint-white p-5 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                    <div className="w-10 h-10 border-[2px] border-newsprint-black bg-[#EBE3D5] flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-sans font-black text-sm uppercase tracking-wide text-newsprint-black mb-2">{item.title}</p>
                      <p className="font-sans text-[16px] leading-relaxed text-newsprint-gray-dark vietnamese-text">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2 */}
            <div id="muc-dich" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-white bg-newsprint-black px-3 py-1 shrink-0">02</span>
                <h2 className="font-sans font-black text-xl sm:text-2xl uppercase text-newsprint-black">Tại sao chúng tôi thu thập?</h2>
                <div className="flex-1 h-[2px] bg-newsprint-black hidden sm:block" />
              </div>
              <div className="border-[3px] border-newsprint-black shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                {[
                  { num: '01', text: 'Cá nhân hóa lộ trình học tập dựa trên điểm mạnh, điểm yếu và thói quen học của từng người dùng.' },
                  { num: '02', text: 'Cải thiện chất lượng sản phẩm: phân tích xu hướng sử dụng để phát triển tính năng mới và sửa lỗi.' },
                  { num: '03', text: 'Gửi thông báo quan trọng liên quan đến tài khoản: xác nhận đăng ký, đặt lại mật khẩu, nhắc nhở gia hạn.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 border-b-[2px] border-newsprint-black last:border-b-0 bg-[#F5F0E8]">
                    <span className="font-sans font-black text-xs text-newsprint-white bg-newsprint-black px-2 py-0.5 shrink-0">{item.num}</span>
                    <p className="font-sans text-[16px] leading-relaxed text-newsprint-gray-dark vietnamese-text">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3 */}
            <div id="chia-se" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-white bg-newsprint-black px-3 py-1 shrink-0">03</span>
                <h2 className="font-sans font-black text-xl sm:text-2xl uppercase text-newsprint-black">Chia sẻ dữ liệu</h2>
                <div className="flex-1 h-[2px] bg-newsprint-black hidden sm:block" />
              </div>
              <div className="space-y-4 font-sans text-[17px] leading-[1.85] text-newsprint-gray-dark vietnamese-text">
                <div className="border-[3px] border-newsprint-black bg-newsprint-white p-6 flex items-start gap-4 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                  <span className="text-green-600 font-black text-xl shrink-0 mt-0.5">✓</span>
                  <div>
                    <p className="font-black text-newsprint-black font-sans text-sm uppercase tracking-wide mb-1">Chúng tôi KHÔNG BÁN dữ liệu</p>
                    <p>LinguaClay tuyệt đối không bán, cho thuê hoặc trao đổi thông tin cá nhân của bạn cho bên thứ ba vì mục đích thương mại.</p>
                  </div>
                </div>
                <p>Chúng tôi <strong className="text-newsprint-black">chỉ chia sẻ</strong> dữ liệu trong các trường hợp hạn hẹp sau:</p>
                <ul className="space-y-2 pl-4">
                  <li className="flex items-start gap-2"><span className="text-newsprint-black font-black mt-1">—</span><span><strong className="text-newsprint-black">Đối tác xử lý thanh toán</strong> (Stripe, MoMo, ZaloPay): chỉ nhận thông tin cần thiết để hoàn tất giao dịch.</span></li>
                  <li className="flex items-start gap-2"><span className="text-newsprint-black font-black mt-1">—</span><span><strong className="text-newsprint-black">Cơ quan pháp luật</strong>: khi được yêu cầu theo quy định pháp lý của Việt Nam.</span></li>
                  <li className="flex items-start gap-2"><span className="text-newsprint-black font-black mt-1">—</span><span><strong className="text-newsprint-black">Dịch vụ phân tích ẩn danh</strong>: dữ liệu tổng hợp, không thể truy nguyên danh tính cá nhân.</span></li>
                </ul>
              </div>
            </div>

            {/* Section 4 */}
            <div id="bao-mat" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-white bg-newsprint-black px-3 py-1 shrink-0">04</span>
                <h2 className="font-sans font-black text-xl sm:text-2xl uppercase text-newsprint-black">Bảo mật dữ liệu</h2>
                <div className="flex-1 h-[2px] bg-newsprint-black hidden sm:block" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: <Lock className="w-5 h-5" />, title: 'Mã hóa SSL/TLS', body: 'Toàn bộ dữ liệu truyền giữa thiết bị và máy chủ được mã hóa bằng chuẩn TLS 1.3.' },
                  { icon: <Building2 className="w-5 h-5" />, title: 'Máy chủ bảo mật', body: 'Dữ liệu lưu trữ trên hạ tầng đám mây được chứng nhận ISO 27001.' },
                  { icon: <Search className="w-5 h-5" />, title: 'Kiểm tra định kỳ', body: 'Chúng tôi thực hiện kiểm tra bảo mật và thử thâm nhập hệ thống định kỳ.' },
                  { icon: <AlertCircle className="w-5 h-5" />, title: 'Phản hồi sự cố', body: 'Trong trường hợp rò rỉ dữ liệu, bạn sẽ được thông báo trong vòng 72 giờ.' },
                ].map((item, i) => (
                  <div key={i} className="border-[2px] border-newsprint-black bg-newsprint-white p-5 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 border-[2px] border-newsprint-black bg-newsprint-white flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <p className="font-sans font-black text-[10px] uppercase tracking-wide text-newsprint-black">{item.title}</p>
                    </div>
                    <p className="font-sans text-xs leading-relaxed text-newsprint-gray-dark vietnamese-text">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5 */}
            <div id="quyen" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-white bg-newsprint-black px-3 py-1 shrink-0">05</span>
                <h2 className="font-sans font-black text-xl sm:text-2xl uppercase text-newsprint-black">Quyền của bạn</h2>
                <div className="flex-1 h-[2px] bg-newsprint-black hidden sm:block" />
              </div>
              <p className="font-sans text-[17px] leading-[1.85] text-newsprint-gray-dark vietnamese-text mb-6">
                Bạn có toàn quyền kiểm soát dữ liệu cá nhân của mình. Cụ thể:
              </p>
              <div className="border-[3px] border-newsprint-black shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                {[
                  { right: 'Quyền truy cập', desc: 'Yêu cầu bản sao đầy đủ dữ liệu cá nhân mà chúng tôi đang lưu giữ về bạn.' },
                  { right: 'Quyền chỉnh sửa', desc: 'Cập nhật hoặc sửa thông tin không chính xác trong Cài đặt → Tài khoản.' },
                  { right: 'Quyền xóa', desc: 'Yêu cầu xóa toàn bộ dữ liệu cá nhân ("right to be forgotten"). Xử lý trong 30 ngày.' },
                  { right: 'Quyền phản đối', desc: 'Từ chối việc dữ liệu của bạn được dùng cho phân tích hoặc cải tiến sản phẩm.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-5 border-b-[2px] border-newsprint-black last:border-b-0 bg-[#F5F0E8] hover:bg-newsprint-white transition-colors">
                    <span className="text-red-600 font-black text-lg shrink-0 mt-0.5">→</span>
                    <div>
                      <p className="font-sans font-black text-sm uppercase tracking-wide text-newsprint-black mb-1">{item.right}</p>
                      <p className="font-sans text-[15px] leading-relaxed text-newsprint-gray-dark vietnamese-text">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="font-sans text-sm text-newsprint-gray-dark mt-4 italian-text">
                Để thực hiện các quyền trên, liên hệ <a href="mailto:anh249205@gmail.com" className="text-red-600 underline font-bold">anh249205@gmail.com</a>. Chúng tôi sẽ phản hồi trong vòng <strong>7 ngày làm việc</strong>.
              </p>
            </div>

            {/* Section 6 */}
            <div id="cookie" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-white bg-newsprint-black px-3 py-1 shrink-0">06</span>
                <h2 className="font-sans font-black text-xl sm:text-2xl uppercase text-newsprint-black">Cookie</h2>
                <div className="flex-1 h-[2px] bg-newsprint-black hidden sm:block" />
              </div>
              <div className="space-y-4 font-sans text-[17px] leading-[1.85] text-newsprint-gray-dark vietnamese-text">
                <p>LinguaClay sử dụng cookie và công nghệ theo dõi tương tự cho 2 mục đích chính:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border-[2px] border-newsprint-black bg-newsprint-white p-5">
                    <p className="font-sans font-black text-xs uppercase tracking-wide text-newsprint-black mb-2">Cookie cần thiết</p>
                    <p className="text-sm leading-relaxed">Ghi nhớ phiên đăng nhập, giỏ thanh toán và cài đặt ngôn ngữ. Không thể tắt vì thiết yếu cho hoạt động của website.</p>
                  </div>
                  <div className="border-[2px] border-newsprint-black bg-newsprint-white p-5">
                    <p className="font-sans font-black text-xs uppercase tracking-wide text-newsprint-black mb-2">Cookie phân tích</p>
                    <p className="text-sm leading-relaxed">Hiểu cách người dùng điều hướng để cải thiện UX. Dữ liệu được ẩn danh hóa hoàn toàn trước khi lưu trữ.</p>
                  </div>
                </div>
                <p className="text-base">Bạn có thể tắt cookie phân tích trong <strong className="text-newsprint-black">Cài đặt trình duyệt → Bảo mật & Quyền riêng tư</strong>. Lưu ý: tắt cookie có thể ảnh hưởng đến một số tính năng đăng nhập.</p>
              </div>
            </div>

            {/* Section 7 */}
            <div id="lien-he" className="scroll-mt-28">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-white bg-newsprint-black px-3 py-1 shrink-0">07</span>
                <h2 className="font-sans font-black text-xl sm:text-2xl uppercase text-newsprint-black">Liên hệ về bảo mật</h2>
                <div className="flex-1 h-[2px] bg-newsprint-black hidden sm:block" />
              </div>
              <div className="font-sans text-[17px] leading-[1.85] text-newsprint-gray-dark vietnamese-text">
                <p className="mb-6">Nếu bạn có lo ngại về dữ liệu cá nhân hoặc muốn báo cáo lỗ hổng bảo mật, hãy liên hệ trực tiếp:</p>
                <div className="border-[3px] border-newsprint-black bg-newsprint-white p-8 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-red-600" />
                    <p className="font-sans font-black text-sm uppercase tracking-widest text-newsprint-black">Bộ phận bảo mật dữ liệu</p>
                  </div>
                  <p className="mb-1">Email: <a href="mailto:anh249205@gmail.com" className="text-red-600 underline font-bold">anh249205@gmail.com</a></p>
                  <p className="mb-4 text-sm text-newsprint-gray-dark">Phản hồi trong vòng <strong className="text-newsprint-black">72 giờ</strong> cho các vấn đề bảo mật khẩn cấp.</p>
                  <div className="border-t-[2px] border-dashed border-newsprint-gray-light pt-4">
                    <p className="text-sm text-newsprint-gray-dark">Để báo cáo lỗ hổng bảo mật có trách nhiệm (<em>responsible disclosure</em>), vui lòng gửi email với tiêu đề <strong className="text-newsprint-black">[SECURITY]</strong>. Chúng tôi cam kết không khởi kiện bên báo cáo thiện chí.</p>
                  </div>
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
            Có câu hỏi về dữ liệu của bạn?
          </h2>
          <p className="text-lg md:text-xl font-serif italic text-newsprint-gray-dark mb-12 max-w-2xl mx-auto vietnamese-text">
            Chúng tôi minh bạch và sẵn sàng giải thích mọi thắc mắc về quyền riêng tư.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/company/contact" className="w-full sm:w-auto px-10 py-5 bg-newsprint-black text-newsprint-white font-bold uppercase tracking-widest text-sm hover:bg-transparent hover:text-newsprint-black transition-colors font-sans border-[3px] border-newsprint-black">
              LIÊN HỆ HỖ TRỢ
            </Link>
            <Link href="/support/terms" className="w-full sm:w-auto px-10 py-5 bg-transparent text-newsprint-black font-bold uppercase tracking-widest text-sm border-[3px] border-newsprint-black hover:bg-newsprint-white transition-colors font-sans">
              XEM ĐIỀU KHOẢN
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
