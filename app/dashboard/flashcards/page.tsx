import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import GenerateFlashcardButton from '@/components/dashboard/GenerateFlashcardButton'
import SearchInput from '@/components/dashboard/SearchInput'

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const { q } = await searchParams
  
  const topics = await prisma.topic.findMany({
    where: q ? {
      OR: [
        { name: { startsWith: q, mode: 'insensitive' } },
        { name: { contains: ` ${q}`, mode: 'insensitive' } },
      ]
    } : {},


    include: {
      _count: {
        select: { words: true }
      }
    },
    orderBy: { name: 'asc' }

  })

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section with Real-time Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-heading font-black text-clay-deep tracking-tight">Thư viện Chủ đề</h1>
          <p className="text-clay-muted font-medium text-lg italic">Khám phá kho tàng 50.000+ từ vựng được tuyển chọn sẵn cho bạn.</p>
        </div>
        
        <SearchInput defaultValue={q} />
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {topics.map((topic: any) => (
          <Link 
            key={topic.id} 
            href={`/study/${topic.slug}`}
            className="group relative overflow-hidden bg-white/80 rounded-[50px] shadow-clay-card border-4 border-white transition-all duration-500 hover:scale-[1.03] hover:shadow-clay-button-hover flex flex-col"
          >
            {/* Image Overlay */}
            <div className="absolute inset-x-0 top-0 h-48 overflow-hidden rounded-t-[46px]">
              <img 
                src={topic.image || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600'} 
                alt={topic.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
            </div>

            <div className="relative pt-36 px-10 pb-10 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-clay-inset ${
                  topic.language === 'CN' ? 'bg-clay-orange/10 text-clay-orange' : 'bg-clay-blue/10 text-clay-blue'
                }`}>
                  {topic.language === 'CN' ? '🏮 Tiếng Trung' : '🇬🇧 Tiếng Anh'}
                </div>
                <div className="px-4 py-1.5 bg-clay-green/10 text-clay-green rounded-full text-[10px] font-black uppercase tracking-widest shadow-clay-inset">
                  {topic.level}
                </div>
              </div>

              <h2 className="text-2xl font-heading font-black text-clay-deep mb-3 group-hover:text-clay-blue transition-colors">
                {topic.name}
              </h2>

              <p className="text-clay-muted text-sm font-medium line-clamp-2 mb-8 leading-relaxed">
                {topic.description}
              </p>

              <div className="mt-auto flex items-center justify-between pt-6 border-t border-soft-gray/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-clay-cream rounded-2xl flex items-center justify-center shadow-clay-button text-xl">
                    📚
                  </div>
                  <span className="text-sm font-bold text-clay-deep">{topic._count.words} thẻ bài</span>
                </div>
                
                <div className="w-12 h-12 bg-clay-blue text-white rounded-2xl shadow-clay-button flex items-center justify-center group-hover:bg-clay-green transition-all group-hover:rotate-12">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {topics.length === 0 && (
          <div className="col-span-full py-24 bg-white/40 rounded-[60px] border-4 border-dashed border-clay-shadow/20 flex flex-col items-center justify-center">
            <div className="text-8xl mb-8">🔍</div>
            <h3 className="text-2xl font-heading font-black text-clay-deep">Không tìm thấy kết quả</h3>
            <p className="text-clay-muted mt-3 font-medium">Thử tìm kiếm với từ khóa khác nhé!</p>
          </div>
        )}
      </div>

      {/* AI Suggestion Banner */}
      <div className="bg-gradient-to-r from-clay-deep to-clay-blue p-1 rounded-[50px] shadow-clay-card group">
        <div className="bg-clay-deep rounded-[46px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-clay-blue/20 text-clay-blue rounded-full text-xs font-black uppercase tracking-wider">
               <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-clay-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-clay-blue"></span>
              </span>
              AI Personal Assistant
            </div>
            <h3 className="text-3xl md:text-4xl font-heading font-black text-white leading-tight">
              Không thấy chủ đề bạn cần? <br/>
              <span className="text-clay-blue">Để AI tạo riêng</span> cho bạn ngay!
            </h3>

            <p className="text-clay-muted text-lg font-medium opacity-80">
              Chỉ mất 0.8 giây để tạo ra một bộ từ vựng cá nhân hóa hoàn toàn miễn phí. Hãy để AI khám phá kiến thức mới cùng bạn!</p>
          </div>
          <div className="flex-shrink-0">
             <GenerateFlashcardButton />
          </div>
        </div>
      </div>
    </div>
  )
}
