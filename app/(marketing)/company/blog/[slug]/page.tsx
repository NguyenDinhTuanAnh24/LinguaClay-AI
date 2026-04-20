import React from 'react'
import Link from 'next/link'

const blogData: Record<string, any> = {
  '5-bi-kip-hoc-ngu-phap-cung-ai': {
    title: '5 Bí kíp học ngữ pháp tiếng Anh hiệu quả cùng AI',
    date: '20 Tháng 4, 2026',
    category: 'Mẹo học tập',
    content: `
      <p>Học ngữ pháp tiếng Anh luôn là nỗi ám ảnh của nhiều người bởi sự khô khan và hàng tá quy tắc cứng nhắc. Tuy nhiên, với sự phát triển của Trí tuệ nhân tạo (AI), việc này đã trở nên thú vị và hiệu quả hơn bao giờ hết.</p>
      
      <h2>1. Sử dụng AI để phân tích lỗi sai trong bối cảnh</h2>
      <p>Thay vì chỉ làm bài tập trắc nghiệm, hãy thử viết một đoạn văn ngắn và yêu cầu AI Tutor phân tích. Nó sẽ chỉ ra không chỉ lỗi sai mà còn giải thích tại sao cách dùng đó chưa tự nhiên.</p>

      <h2>2. Tạo bài tập tùy biến</h2>
      <p>Bạn đang yếu phần "Thì hiện tại hoàn thành"? Hãy bảo AI tạo cho bạn 10 câu bài tập dựa trên chính sở thích của bạn (ví dụ: về chủ đề du lịch hoặc bóng đá). Việc học sẽ trở nên gần gũi hơn rất nhiều.</p>

      <h2>3. Hội thoại thực tế</h2>
      <p>Ngữ pháp chỉ thực sự "ngấm" khi bạn sử dụng nó. Hãy bắt đầu một cuộc trò chuyện với AI và cố gắng áp dụng cấu trúc mới học. AI sẽ kiên nhẫn sửa lỗi cho bạn mà không làm bạn cảm thấy ngại ngùng.</p>

      <h2>4. Học qua ví dụ thực tế</h2>
      <p>Yêu cầu AI trích dẫn các câu thoại trong phim hoặc bài hát có sử dụng điểm ngữ pháp đó. Âm thanh và hình ảnh sẽ giúp não bộ ghi nhớ tốt hơn gấp 5 lần so với đọc sách giáo khoa.</p>

      <h2>5. Đặt mục tiêu nhỏ mỗi ngày</h2>
      <p>Đừng cố học quá nhiều. Với LinguaClay AI, mỗi ngày chỉ cần chinh phục 1 điểm ngữ pháp duy nhất. Sự kiên trì là chìa khóa của thành công.</p>
    `
  },
  'tai-sao-thuat-toan-srs-quan-trong': {
    title: 'Tại sao thuật toán SRS lại quan trọng trong việc học từ vựng?',
    date: '18 Tháng 4, 2026',
    category: 'Khoa học',
    content: `
      <p>Spaced Repetition System (SRS) - hay Hệ thống lặp lại ngắt quãng - là "vũ khí tối thượng" trong việc ghi nhớ kiến thức dài hạn. Nhưng tại sao nó lại hiệu quả đến vậy?</p>
      
      <h2>Nguyên lý của đường cong quên lãng</h2>
      <p>Theo nghiên cứu, chúng ta sẽ quên khoảng 80% kiến thức mới học chỉ sau 24 giờ nếu không ôn tập. Thuật toán SRS của LinguaClay sẽ tính toán chính xác thời điểm bạn sắp quên để nhắc bạn ôn lại bài.</p>

      <h2>Học ít hơn, nhớ nhiều hơn</h2>
      <p>Thay vì học 100 lần trong 1 ngày rồi quên sạch, SRS chia nhỏ việc ôn tập: Ngày 1, Ngày 3, Ngày 7, Ngày 30... Điều này giúp kiến thức được khắc sâu vào trí nhớ dài hạn mà không gây quá tải cho não bộ.</p>
    `
  },
  'lo-trinh-hoc-tieng-trung-trong-3-thang': {
     title: 'Lộ trình từ 0 đến giao tiếp cơ bản tiếng Trung trong 3 tháng',
     date: '15 Tháng 4, 2026',
     category: 'Câu chuyện',
     content: `<p>Học tiếng Trung không khó như bạn nghĩ nếu có một lộ trình khoa học và sự hỗ trợ của AI Tutor...</p>`
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = blogData[slug]

  if (!post) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Bài viết không tồn tại</h1>
        <Link href="/company/blog" className="text-clay-blue underline mt-4 block">Quay lại Blog</Link>
      </div>
    )
  }

  return (
    <article className="py-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="space-y-4">
          <Link href="/company/blog" className="text-sm font-black text-clay-blue uppercase tracking-widest flex items-center gap-2">
            <span>←</span> Quay lại Blog
          </Link>
          <div className="flex items-center gap-4 text-xs font-bold text-clay-muted">
            <span className="px-3 py-1 bg-clay-blue/10 text-clay-blue rounded-full uppercase tracking-widest">{post.category}</span>
            <span>•</span>
            <span>{post.date}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-clay-deep leading-tight">
            {post.title}
          </h1>
        </div>

        <div className="max-w-none prose prose-lg prose-clay bg-white/50 p-8 md:p-12 rounded-[45px] shadow-clay-card border-4 border-white">
           <div 
             className="text-clay-deep/80 space-y-6 font-medium leading-relaxed" 
             dangerouslySetInnerHTML={{ __html: post.content }} 
           />
        </div>

        <div className="bg-gradient-to-br from-clay-blue to-clay-green p-10 rounded-[45px] text-white space-y-6 shadow-clay-card">
           <h3 className="text-2xl font-heading font-black">Bạn muốn kiến tạo kỹ năng ngôn ngữ như thế này?</h3>
           <p className="font-medium opacity-90">Hãy để AI Tutor đồng hành cùng bạn trên hành trình chinh phục tiếng Anh và tiếng Trung ngay hôm nay.</p>
           <Link href="/login" className="inline-block px-10 py-4 bg-white text-clay-blue font-heading font-black rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all">
             Bắt đầu học ngay
           </Link>
        </div>
      </div>
    </article>
  )
}
