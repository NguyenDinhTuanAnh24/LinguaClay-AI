import React from 'react'
import Link from 'next/link'

const posts = [
  {
    id: 1,
    slug: '5-bi-kip-hoc-ngu-phap-cung-ai',
    title: '5 Bí kíp học ngữ pháp tiếng Anh hiệu quả cùng AI',
    excerpt: 'Học ngữ pháp không còn khô khan nếu bạn biết cách tận dụng trí tuệ nhân tạo...',
    date: '20 Tháng 4, 2026',
    category: 'Mẹo học tập',
    image: '📖'
  },
  {
    id: 2,
    slug: 'tai-sao-thuat-toan-srs-quan-trong',
    title: 'Tại sao thuật toán SRS lại quan trọng trong việc học từ vựng?',
    excerpt: 'Tìm hiểu về khoa học đằng sau việc ghi nhớ và cách LinguaClay cá nhân hóa lộ trình của bạn...',
    date: '18 Tháng 4, 2026',
    category: 'Khoa học',
    image: '🧠'
  },
  {
    id: 3,
    slug: 'lo-trinh-hoc-tieng-trung-trong-3-thang',
    title: 'Lộ trình từ 0 đến giao tiếp cơ bản tiếng Trung trong 3 tháng',
    excerpt: 'Chia sẻ kinh nghiệm thực tế từ học viên đã chinh phục tiếng Trung bằng LinguaClay AI...',
    date: '15 Tháng 4, 2026',
    category: 'Câu chuyện',
    image: '🇨🇳'
  }
]

export default function BlogPage() {
  return (
    <div className="py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-heading font-black text-clay-deep tracking-tight">
            LinguaClay <span className="text-clay-orange">Blog</span>
          </h1>
          <p className="text-lg text-clay-muted max-w-2xl mx-auto font-medium">
            Nơi chia sẻ kiến thức, mẹo học tập và những câu chuyện truyền cảm hứng trên hành trình chinh phục ngôn ngữ.
          </p>
        </div>

        {/* Featured Post Placeholder */}
        <div className="relative h-[300px] md:h-[450px] bg-gradient-to-br from-clay-deep to-clay-brown-dark rounded-[50px] shadow-clay-card flex items-center p-10 overflow-hidden text-white group cursor-pointer hover:shadow-2xl transition-all">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform" />
           <div className="max-w-2xl space-y-6 relative">
              <span className="px-4 py-1.5 bg-clay-orange rounded-full text-xs font-black uppercase tracking-wider">Tin nổi bật</span>
              <h2 className="text-3xl md:text-4xl font-heading font-black leading-tight">Xu hưởng sử dụng AI trong giáo dục ngôn ngữ năm 2026</h2>
              <p className="text-white/80 line-clamp-2 font-medium">Khám phá cách Trí tuệ nhân tạo đang thay đổi hoàn toàn cách chúng ta tiếp cận ngoại ngữ và tại sao bạn nên bắt đầu ngay hôm nay.</p>
              <div className="pt-4">
                 <button className="px-8 py-3 bg-white text-clay-deep rounded-full font-heading font-black shadow-lg">Đọc bài ngay</button>
              </div>
           </div>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-3 gap-8">
           {posts.map((post) => (
             <Link 
               key={post.id} 
               href={`/company/blog/${post.slug}`}
               className="bg-white/70 rounded-[40px] shadow-clay-card border-4 border-white p-8 space-y-6 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer flex flex-col group"
             >
                <div className="w-full h-40 bg-clay-cream/50 rounded-[30px] flex items-center justify-center text-6xl shadow-clay-inset">
                  {post.image}
                </div>
                <div className="space-y-4 flex-1">
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-clay-blue uppercase tracking-widest">{post.category}</span>
                      <span className="text-[10px] font-bold text-clay-muted">{post.date}</span>
                   </div>
                   <h3 className="text-xl font-heading font-black text-clay-deep leading-tight group-hover:text-clay-blue transition-colors">
                     {post.title}
                   </h3>
                   <p className="text-sm text-clay-muted font-medium line-clamp-3">
                     {post.excerpt}
                   </p>
                </div>
                <div className="pt-4 border-t border-clay-shadow/10">
                   <div className="text-xs font-black text-clay-blue flex items-center gap-2">
                     Xem thêm <span>→</span>
                   </div>
                </div>
             </Link>
           ))}
        </div>
      </div>
    </div>
  )
}
