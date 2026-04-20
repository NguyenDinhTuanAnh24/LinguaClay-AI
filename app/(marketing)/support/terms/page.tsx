import React from 'react'

export default function TermsPage() {
  return (
    <div className="py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white/80 rounded-[50px] shadow-clay-card border-4 border-white p-10 md:p-16 space-y-10">
        <div className="space-y-4">
          <h1 className="text-4xl font-heading font-black text-clay-deep tracking-tight">Điều khoản sử dụng</h1>
          <p className="text-xs text-clay-muted font-bold uppercase tracking-widest">Hiệu lực từ: 20 Tháng 4, 2026</p>
          <div className="h-1 w-20 bg-clay-orange rounded-full" />
        </div>

        <div className="prose prose-clay max-w-none space-y-8 text-clay-deep/80 font-medium leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-clay-deep">1. Chấp nhận điều khoản</h2>
            <p>
              Bằng việc truy cập và sử dụng dịch vụ của LinguaClay AI, bạn đồng ý tuân thủ các điều khoản này. Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản, vui lòng ngừng sử dụng dịch vụ.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-clay-deep">2. Tài khoản người dùng</h2>
            <p>
              Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình. LinguaClay có quyền tạm khóa hoặc xóa tài khoản nếu phát hiện hành vi gian lận, spam hoặc vi phạm tiêu chuẩn cộng đồng.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-clay-deep">3. Sở hữu trí tuệ</h2>
            <p>
              Tất cả nội dung bài học, thuật toán, biểu tượng và giao diện Claymorphism đều thuộc quyền sở hữu của LinguaClay AI. Mọi hành vi sao chép, phân phối mà không có sự cho phép bằng văn bản là vi phạm pháp luật.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-clay-deep">4. Giới hạn trách nhiệm</h2>
            <p>
              Ứng dụng được cung cấp "nguyên trạng". Mặc dù AI Tutor có độ chính xác cao, chúng tôi không cam kết kết quả học tập tuyệt đối cho mọi cá nhân nhưng sẽ nỗ lực tối đa để hỗ trợ mục tiêu của bạn.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
