import React from 'react'

export default function PrivacyPage() {
  return (
    <div className="py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white/80 rounded-[50px] shadow-clay-card border-4 border-white p-10 md:p-16 space-y-10">
        <div className="space-y-4">
          <h1 className="text-4xl font-heading font-black text-clay-deep tracking-tight">Chính sách bảo mật</h1>
          <p className="text-xs text-clay-muted font-bold uppercase tracking-widest">Cập nhật lần cuối: 20 Tháng 4, 2026</p>
          <div className="h-1 w-20 bg-clay-blue rounded-full" />
        </div>

        <div className="prose prose-clay max-w-none space-y-8 text-clay-deep/80 font-medium leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-clay-deep">1. Thông tin chúng tôi thu thập</h2>
            <p>
              Khi bạn đăng ký tài khoản LinguaClay AI, chúng tôi thu thập thông tin cơ bản bao gồm tên, địa chỉ email và ảnh đại diện (nếu bạn cung cấp). Ngoài ra, hệ thống cũng ghi nhận tiến độ học tập, các từ vựng bạn đã đánh dấu và kết quả các bài kiểm tra AI để tối ưu hóa lộ trình học.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-clay-deep">2. Cách chúng tôi sử dụng dữ liệu</h2>
            <p>
              Dữ liệu của bạn được sử dụng cho các mục đích:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cá nhân hóa các bài học và gợi ý từ AI Chatbot.</li>
              <li>Thông báo cho bạn về tiến độ học tập và các cập nhật tính năng mới.</li>
              <li>Đảm bảo an toàn bảo mật cho tài khoản người dùng.</li>
              <li>Phân tích dữ liệu ẩn danh để cải thiện chất lượng dịch vụ tổng thể.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-clay-deep">3. Bảo vệ thông tin</h2>
            <p>
              Chúng tôi cam kết sử dụng các biện pháp bảo mật mạnh mẽ nhất, bao gồm mã hóa SSL và bảo mật cấp cơ sở dữ liệu từ Supabase, để ngăn chặn truy cập trái phép hoặc rò rỉ dữ liệu của bạn.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-clay-deep">4. Quyền của người dùng</h2>
            <p>
              Bạn có quyền yêu cầu trích xuất dữ liệu cá nhân, sửa đổi hoặc yêu cầu xóa hoàn toàn tài khoản của mình bất cứ lúc nào thông qua phần Cài đặt hoặc liên hệ trực tiếp với chúng tôi qua email.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
