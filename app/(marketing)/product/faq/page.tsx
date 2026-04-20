'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  {
    q: 'LinguaClay AI có miễn phí không?',
    a: 'Chúng tôi cung cấp gói miễn phí trọn đời với các tính năng cơ bản. Để học không giới hạn và sử dụng AI Chat chuyên sâu, bạn có thể nâng cấp lên gói PRO.'
  },
  {
    q: 'Tôi có thể học bao nhiêu ngôn ngữ cùng lúc?',
    a: 'Hiện tại LinguaClay hỗ trợ Tiếng Anh và Tiếng Trung. Bạn có thể chuyển đổi giữa các ngôn ngữ bất cứ lúc nào trong phần Cài đặt.'
  },
  {
    q: 'AI Chat giúp tôi học như thế nào?',
    a: 'Giáo viên AI của chúng tôi sử dụng mô hình ngôn ngữ tiên tiến nhất để hội thoại với bạn. AI sẽ sửa lỗi ngữ pháp, gợi ý cách dùng từ tự nhiên hơn và đánh giá phát âm của bạn ngay lập tức.'
  },
  {
    q: 'Dữ liệu của tôi có được bảo mật không?',
    a: 'Tuyệt đối. Chúng tôi sử dụng các tiêu chuẩn mã hóa cao nhất để bảo vệ thông tin cá nhân và tiến độ học tập của bạn. Dữ liệu chỉ được dùng để cải thiện trải nghiệm học tập của riêng bạn.'
  },
  {
    q: 'Làm sao để liên hệ hỗ trợ kỹ thuật?',
    a: 'Bạn có thể gửi email cho chúng tôi tại hello@linguaclay.ai hoặc sử dụng biểu mẫu Liên hệ. Đội ngũ hỗ trợ sẽ phản hồi trong vòng 24 giờ.'
  }
]

function FAQItem({ q, a, isOpen, onClick }: { q: string, a: string, isOpen: boolean, onClick: () => void }) {
  return (
    <div className="bg-white/80 rounded-[35px] shadow-clay-card border-4 border-white overflow-hidden transition-all duration-300">
      <button 
        onClick={onClick}
        className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-clay-cream/30 transition-colors"
      >
        <span className="text-lg font-heading font-black text-clay-deep">{q}</span>
        <div className={`w-10 h-10 rounded-full bg-clay-blue/10 flex items-center justify-center text-xl transition-transform duration-300 ${isOpen ? 'rotate-180 shadow-clay-inset' : 'shadow-clay-button'}`}>
          {isOpen ? '−' : '+'}
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8">
              <div className="p-6 bg-clay-cream/30 rounded-[25px] shadow-clay-inset text-clay-muted font-medium leading-relaxed italic border-2 border-transparent">
                {a}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-heading font-black text-clay-deep tracking-tight">
            Câu hỏi <span className="text-clay-orange">thường gặp</span>
          </h1>
          <p className="text-lg text-clay-muted font-medium">
            Mọi thứ bạn cần biết về LinguaClay AI và hành trình học tập.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <FAQItem 
              key={i} 
              q={faq.q} 
              a={faq.a} 
              isOpen={openIndex === i} 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        <div className="text-center pt-8">
          <p className="text-sm text-clay-muted">
            Vẫn còn thắc mắc? <Link href="/company/contact" className="text-clay-blue font-black underline decoration-2 underline-offset-4 decoration-clay-blue/30">Gửi lời nhắn cho chúng tôi</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
