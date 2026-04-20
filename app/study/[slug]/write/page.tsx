import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import WritingInterface from '@/components/study/WritingInterface'

export default async function WritingPage({ params }: { params: { slug: string } }) {
  const { slug } = await params
  
  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      words: {
        take: 5 // Lấy 5 từ tiêu biểu để gợi ý
      }
    }
  })

  if (!topic) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-clay-cream p-4 md:p-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-clay-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-clay-pink/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link 
            href={`/dashboard`}
            className="w-12 h-12 rounded-2xl bg-white shadow-clay-button flex items-center justify-center text-clay-muted hover:scale-105 transition-transform border-2 border-white"
          >
            ←
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl md:text-4xl font-heading font-black text-clay-deep tracking-tight">Luyện viết theo chủ đề</h1>
            <p className="text-sm md:text-base text-clay-muted font-bold uppercase tracking-widest mt-1 opacity-70">{topic.name}</p>
          </div>
          <div className="w-12" /> {/* Spacer */}
        </div>

        {/* Challenge Box */}
        <div className="bg-white/80 backdrop-blur-md rounded-[50px] shadow-clay-card border-4 border-white p-10 md:p-12 space-y-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-clay-orange to-clay-gold flex items-center justify-center text-4xl shadow-clay-button border-4 border-white flex-shrink-0">
              ✍️
            </div>
            <div className="space-y-3 text-center md:text-left">
              <h2 className="text-2xl font-heading font-black text-clay-deep">Thử thách viết bài</h2>
              <p className="text-lg md:text-xl text-clay-deep/80 leading-relaxed font-medium">
                {topic.description || `Hãy viết một đoạn văn ngắn về chủ đề ${topic.name}.`}
              </p>
            </div>
          </div>
        </div>

        {/* Interface */}
        <WritingInterface topic={topic} />
      </div>
    </div>
  )
}

