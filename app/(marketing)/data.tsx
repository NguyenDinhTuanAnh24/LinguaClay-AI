import React from 'react'
import { BookOpen, MessageCircle, BarChart2, Trophy, User } from 'lucide-react'
import { normalizeVietnamese } from '@/app/lib/utils/normalize'

const vn = normalizeVietnamese

export const faqs = [
  { question: 'LinguaClay có bản dùng thử miễn phí không?', answer: 'Có, bạn có thể bắt đầu với bản dùng thử 7 ngày hoàn toàn miễn phí. Bạn sẽ có quyền truy cập đầy đủ tất cả các tính năng và không cần nhập thẻ tín dụng.' },
  { question: 'Tôi có thể thay đổi gói cước sau này không?', answer: 'Tất nhiên! Bạn có thể nâng cấp hoặc hạ cấp gói học của mình bất kỳ lúc nào tại mục Cài đặt. Các thay đổi sẽ có hiệu lực ngay lập tức.' },
  { question: 'Hệ thống hỗ trợ những phương thức thanh toán nào?', answer: 'Chúng tôi chấp nhận mọi thẻ tín dụng quốc tế (Visa, Mastercard...) và chuyển khoản ngân hàng qua mã QR (Momo, VNPay).' },
  { question: 'Hệ thống AI Tutor hoạt động như thế nào?', answer: 'AI Tutor đóng vai trò như một người bản xứ, sẽ giao tiếp với bạn 1-1, bắt lỗi ngữ pháp và đưa ra gợi ý cách diễn đạt tự nhiên hơn.' },
  { question: 'Có khóa học dành riêng cho người mất gốc không?', answer: 'Chúng tôi có lộ trình từ Zero đến Hero, hệ thống tự động đánh giá năng lực và đề xuất bài học từ bảng chữ cái cho đến giao tiếp nâng cao.' }
]

export const blogs = [
  { title: 'Tối đa hóa năng suất học tập cùng AI Automation', excerpt: 'Khám phá cách các công cụ AI thông minh tự động hóa quá trình review flashcard giúp tiết kiệm hàng giờ mỗi tuần.', date: '2026-04-12', author: 'LINGUACLAY TEAM' },
  { title: 'Tương lai của giáo dục: Tương tác thời gian thực', excerpt: 'Tại sao việc luyện nói 1-1 với AI đang định hình lại toàn bộ mô hình học ngoại ngữ hiện đại.', date: '2026-04-10', author: 'EDITORIAL BOARD' },
  { title: 'Mở rộng quy mô kiến thức với Hạ tầng quốc tế', excerpt: 'Hệ thống máy chủ toàn cầu đảm bảo hiệu năng tối ưu và độ giật lag bằng 0 cho người dùng LinguaClay.', date: '2026-04-05', author: 'SYSTEM ADMIN' }
]

export const landingPlans = [
  {
    id: 'trial',
    name: 'BẢN TIÊU CHUẨN',
    price: '299k',
    period: '/3 Tháng',
    features: ['Flashcards không giới hạn', 'AI Tutor Pro cơ bản', '100 Chủ điểm ngữ pháp Pro', 'Dễ dàng nâng cấp sau này'],
    highlight: false,
    ctaText: 'CHỌN BẢN TIÊU CHUẨN'
  },
  {
    id: 'flexible',
    name: 'BẢN CHUYÊN SÂU',
    price: '399k',
    period: '/6 Tháng',
    features: ['Flashcards không giới hạn', 'AI Tutor Pro (Phản hồi giọng nói)', '200+ Chủ điểm ngữ pháp Pro', 'Hệ thuật SRS cá nhân hóa', 'Hỗ trợ qua Email'],
    highlight: false,
    ctaText: 'CHỌN BẢN CHUYÊN SÂU'
  },
  {
    id: 'permanent',
    name: 'BẢN TOÀN DIỆN',
    price: '499k',
    period: '/1 Năm',
    features: ['Toàn bộ tính năng gói 6 tháng', 'Ưu tiên cập nhật tính năng mới sớm nhất', 'Tải file PDF bài học độc quyền', 'Không giới hạn AI Chatbot nâng cao', 'Hỗ trợ VIP 1:1 qua Zalo/Telegram'],
    highlight: true,
    badgeText: 'HỜI NHẤT',
    isBestValue: true,
    ctaText: 'CHỌN BẢN TOÀN DIỆN'
  }
]

export const features = [
  { icon: <BookOpen size={32} />, title: vn('Flashcard Thông Minh'), description: vn('Hệ thống SRS tự động lên lịch ôn tập, tối ưu trí nhớ với thuật toán khoa học') },
  { icon: <MessageCircle size={32} />, title: vn('AI Tutor Hội Thoại'), description: vn('Thực hành giao tiếp với AI, nhận phân hồi tức thì và gợi ý sửa lỗi') },
  { icon: <BarChart2 size={32} />, title: vn('Tiến Độ Chi Tiết'), description: vn('Theo dõi hành trình học tập với biểu đồ trực quan và phân tích chuyên sâu') },
  { icon: <Trophy size={32} />, title: vn('200+ Bài Ngữ Pháp'), description: vn('Thư viện bài học từ cơ bản đến nâng cao, có ví dụ minh họa và bài tập') }
]

export const stats = [
  { value: '500+', label: vn('Từ vựng') },
  { value: '200+', label: vn('Bài học') },
  { value: '10K+', label: vn('Người dùng') },
  { value: '4.8/5', label: vn('Đánh giá') }
]

export const testimonials = [
  { name: vn('Minh'), role: vn('Học viên'), icon: <User size={48} />, content: vn('LinguaClay giúp tôi học tiếng Anh hiệu quả hơn rất nhiều. Flashcard thông minh cực kỳ hữu ích!'), rating: 5 },
  { name: vn('Lan'), role: vn('Học viên'), icon: <User size={48} />, content: vn('AI Tutor rất nhiệt tình và sẵn sàng sửa lỗi cho tôi. Tôi đã cải thiện rất nhiều sau 2 tháng.'), rating: 5 },
  { name: vn('Tuấn'), role: vn('Học viên'), icon: <User size={48} />, content: vn('Giao diện đẹp, dễ dùng. Tôi học mỗi ngày chỉ 15 phút nhưng thấy tiến bộ rõ rệt.'), rating: 5 }
]
