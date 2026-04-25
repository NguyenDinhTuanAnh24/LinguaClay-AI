'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import AuthTrigger from '@/components/marketing/AuthTrigger'
import { Search, Plus, Minus, ArrowRight, MessageCircle } from 'lucide-react'

const faqGroups = [
  {
    group: 'Tài khoản & Đăng nhập',
    items: [
      {
        q: 'Làm sao để tạo tài khoản LinguaClay?',
        a: 'Truy cập linguaclay.ai và nhấn "Bắt đầu miễn phí". Bạn có thể đăng ký bằng email hoặc tài khoản Google. Không cần thẻ tín dụng — gói miễn phí được kích hoạt ngay lập tức.'
      },
      {
        q: 'Tôi quên mật khẩu thì làm thế nào?',
        a: 'Nhấn "Quên mật khẩu" ở trang đăng nhập, nhập email đăng ký và kiểm tra hộp thư (kể cả thư mục Spam). Link đặt lại có hiệu lực trong 30 phút.'
      },
      {
        q: 'Tôi có thể đổi email đăng nhập không?',
        a: 'Có. Vào Cài đặt → Tài khoản → Đổi email. Hệ thống sẽ gửi email xác nhận đến địa chỉ mới. Sau khi xác nhận, email cũ sẽ bị vô hiệu hóa.'
      },
      {
        q: 'Làm sao để xóa tài khoản?',
        a: 'Vào Cài đặt → Tài khoản → Xóa tài khoản. Toàn bộ dữ liệu (flashcard, tiến độ học, lịch sử) sẽ bị xóa vĩnh viễn sau 30 ngày. Trong thời gian đó bạn có thể khôi phục tài khoản.'
      }
    ]
  },
  {
    group: 'Gói học & Thanh toán',
    items: [
      {
        q: 'Các gói học khác nhau như thế nào?',
        a: 'LinguaClay có 4 gói: Miễn phí (giới hạn tính năng), 3 tháng (299k), 6 tháng (399k) và 1 năm (599k). Các gói trả phí mở khóa AI Tutor không giới hạn, flashcard cao cấp và phân tích học tập chuyên sâu.'
      },
      {
        q: 'Tôi có thể nâng hoặc hạ gói không?',
        a: 'Có. Nâng cấp có hiệu lực ngay lập tức và bạn chỉ trả phần chênh lệch theo ngày còn lại. Hạ cấp có hiệu lực vào cuối kỳ thanh toán hiện tại — tài khoản vẫn giữ nguyên tính năng cao đến hết kỳ.'
      },
      {
        q: 'Làm sao để hủy gia hạn tự động?',
        a: 'Vào Cài đặt → Gói học → Hủy gia hạn tự động. Tài khoản vẫn hoạt động đến hết kỳ đã thanh toán, sau đó tự động về gói miễn phí. Không mất dữ liệu.'
      },
      {
        q: 'Tôi có được hoàn tiền nếu không hài lòng không?',
        a: 'Chúng tôi hỗ trợ hoàn tiền trong vòng 7 ngày kể từ ngày thanh toán nếu bạn chưa dùng quá 20% tính năng của kỳ đã mua. Liên hệ qua email để được xử lý trong 24 giờ.'
      },
      {
        q: 'LinguaClay hỗ trợ những hình thức thanh toán nào?',
        a: 'Hiện tại chúng tôi hỗ trợ: Thẻ Visa/Mastercard, chuyển khoản ngân hàng nội địa, ví MoMo và ZaloPay. Thanh toán được mã hóa bảo mật bằng chuẩn SSL.'
      }
    ]
  },
  {
    group: 'Tính năng & Sử dụng',
    items: [
      {
        q: 'Gói miễn phí có giới hạn gì?',
        a: 'Gói miễn phí cho phép tạo tối đa 50 flashcard, học 20 bài ngữ pháp cơ bản và dùng AI Tutor 10 lượt/ngày. Tiến độ học được lưu vĩnh viễn — không có giới hạn thời gian sử dụng.'
      },
      {
        q: 'Tôi có thể dùng LinguaClay trên điện thoại không?',
        a: 'LinguaClay hoạt động tốt trên trình duyệt di động (Chrome, Safari). Ứng dụng iOS và Android đang trong giai đoạn phát triển và sẽ ra mắt trong Q3/2024.'
      },
      {
        q: 'AI Tutor hoạt động như thế nào?',
        a: 'AI Tutor sử dụng mô hình ngôn ngữ lớn được tinh chỉnh riêng cho việc dạy ngôn ngữ. Nó hội thoại với bạn, sửa lỗi ngữ pháp theo thời gian thực, gợi ý từ vựng phù hợp ngữ cảnh và điều chỉnh độ khó theo trình độ của từng người.'
      },
      {
        q: 'Tôi có thể tự tạo bộ flashcard riêng không?',
        a: 'Có. Bạn có thể tạo flashcard tùy chỉnh với mặt trước/sau, hình ảnh, và audio phát âm. Hệ thống SRS sẽ tự động lên lịch ôn tập dựa trên lịch sử ghi nhớ của bạn với từng thẻ.'
      },
      {
        q: 'Tiến độ học có được lưu lại không nếu đổi thiết bị?',
        a: 'Hoàn toàn có. Toàn bộ tiến độ — điểm số, flashcard, lịch sử học, chuỗi ngày học — được đồng bộ theo tài khoản và có thể truy cập từ bất kỳ thiết bị nào.'
      }
    ]
  },
  {
    group: 'Kỹ thuật',
    items: [
      {
        q: 'Tại sao app bị chậm hoặc không tải được?',
        a: 'Hãy thử: (1) Xóa cache trình duyệt, (2) Kiểm tra kết nối Internet, (3) Tắt extension trình duyệt có thể chặn script. Nếu vẫn gặp vấn đề, liên hệ hỗ trợ kèm ảnh chụp màn hình lỗi.'
      },
      {
        q: 'LinguaClay hỗ trợ trình duyệt nào?',
        a: 'LinguaClay hoạt động tốt nhất trên Chrome 90+, Firefox 88+, Safari 14+ và Edge 90+. Chúng tôi không hỗ trợ Internet Explorer.'
      },
      {
        q: 'Tôi có thể dùng offline không?',
        a: 'Một số tính năng như ôn flashcard có thể hoạt động offline nếu bạn đã tải dữ liệu trước đó. Tuy nhiên AI Tutor và đồng bộ tiến độ cần kết nối Internet để hoạt động đầy đủ.'
      }
    ]
  }
]

export default function FAQPage() {
  const [search, setSearch] = useState('')
  const [openItem, setOpenItem] = useState<string | null>('0-0')

  const toggleItem = (key: string) => setOpenItem(openItem === key ? null : key)

  const filtered = search.trim().length > 1
    ? faqGroups.map(g => ({
        ...g,
        items: g.items.filter(
          item =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase())
        )
      })).filter(g => g.items.length > 0)
    : faqGroups

  return (
    <div className="w-full bg-[#F5F0E8] overflow-x-hidden">

      {/* 1. Hero */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-transparent pt-16 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 text-center flex flex-col items-center">
          <span className="inline-block px-4 py-1 mb-6 border-[3px] border-newsprint-black bg-newsprint-white text-newsprint-black text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            HỖ TRỢ
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-sans font-black uppercase text-newsprint-black leading-tight tracking-tight mb-6">
            Câu hỏi thường gặp
          </h1>
          <p className="text-lg md:text-xl font-sans text-newsprint-gray-dark max-w-2xl vietnamese-text">
            Tìm nhanh câu trả lời cho những thắc mắc phổ biến nhất về LinguaClay.
          </p>
        </div>
      </section>

      {/* 2. Thanh tìm kiếm */}
      <section className="w-full border-b-[3px] border-newsprint-black bg-transparent py-10">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="flex items-center gap-0 border-[3px] border-newsprint-black shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] bg-[#F5F0E8]">
            <div className="flex items-center justify-center w-14 h-14 border-r-[3px] border-newsprint-black shrink-0 bg-newsprint-black">
              <Search className="w-5 h-5 text-newsprint-white" />
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Bạn đang tìm gì? Ví dụ: hủy gói, đổi mật khẩu..."
              className="flex-1 h-14 px-5 font-sans text-sm text-newsprint-black placeholder:text-newsprint-gray-medium bg-transparent focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="w-14 h-14 border-l-[3px] border-newsprint-black flex items-center justify-center text-newsprint-gray-dark hover:text-newsprint-black hover:bg-[#EBE3D5] transition-colors font-bold text-lg"
              >
                ✕
              </button>
            )}
          </div>
          {search && filtered.length === 0 && (
            <p className="mt-4 text-center font-sans text-sm text-newsprint-gray-dark">
              Không tìm thấy kết quả cho &quot;<strong>{search}</strong>&quot;.{` `}
              <Link href="/company/contact" className="text-red-600 underline font-bold">Liên hệ hỗ trợ</Link>
            </p>
          )}
        </div>
      </section>

      {/* 3. Accordion theo nhóm */}
      <section className="w-full py-20">
        <div className="max-w-[800px] mx-auto px-6 space-y-12">
          {filtered.map((group, gi) => (
            <div key={gi}>
              {/* Group header */}
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-newsprint-white bg-newsprint-black px-3 py-1">
                  {String(gi + 1).padStart(2, '0')}
                </span>
                <h2 className="font-sans font-black text-xl sm:text-2xl uppercase text-newsprint-black vietnamese-text">
                  {group.group}
                </h2>
                <div className="flex-1 h-[2px] bg-newsprint-black" />
              </div>

              {/* Accordion items */}
              <div className="border-[3px] border-newsprint-black shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]">
                {group.items.map((item, ii) => {
                  const key = `${gi}-${ii}`
                  const isOpen = openItem === key
                  return (
                    <div
                      key={ii}
                      className={`border-b-[3px] border-newsprint-black last:border-b-0 transition-colors bg-[#F5F0E8] hover:bg-[#EBE3D5]`}
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
                      >
                        <span className={`font-sans font-bold text-sm sm:text-base leading-snug vietnamese-text transition-colors ${isOpen ? 'text-red-600' : 'text-newsprint-black'}`}>
                          {item.q}
                        </span>
                        <div className={`shrink-0 w-7 h-7 border-[2px] flex items-center justify-center transition-colors ${isOpen ? 'bg-newsprint-black border-newsprint-black text-newsprint-white' : 'border-newsprint-black bg-newsprint-white text-newsprint-black'}`}>
                          {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6 border-t-[2px] border-dashed border-newsprint-gray-light pt-5">
                          <p className="font-sans text-[16px] leading-[1.8] text-newsprint-gray-dark vietnamese-text">{item.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CTA cuối trang */}
      <section className="w-full py-24 sm:py-32 bg-transparent text-newsprint-black border-t-[3px] border-newsprint-black">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-sans font-black uppercase text-newsprint-black leading-tight tracking-tight mb-10 vietnamese-text">
            Không tìm được câu trả lời?
          </h2>
          <p className="text-lg md:text-xl font-serif italic text-newsprint-gray-dark mb-12 max-w-2xl mx-auto vietnamese-text">
            Đội hỗ trợ của chúng tôi luôn sẵn sàng — phản hồi trong vòng <span className="font-bold underline decoration-red-600 decoration-[3px] whitespace-nowrap">24 giờ</span>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/company/contact"
              className="w-full sm:w-auto sm:min-w-[240px] px-10 py-5 bg-transparent text-newsprint-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-all font-sans border-[3px] border-newsprint-black flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
            >
              <MessageCircle className="w-4 h-4" /> LIÊN HỆ HỖ TRỢ
            </Link>
            <AuthTrigger tab="signin"
              className="w-full sm:w-auto sm:min-w-[240px] px-10 py-5 bg-black text-white font-bold uppercase tracking-widest text-sm border-[3px] border-black hover:bg-white hover:text-black transition-all duration-300 font-sans shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
            >
              BẮT ĐẦU MIỄN PHÍ
            </AuthTrigger>
          </div>
        </div>
      </section>

    </div>
  )
}
