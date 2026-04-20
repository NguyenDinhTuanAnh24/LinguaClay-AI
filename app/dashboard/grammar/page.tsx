import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import GrammarLibrary from '@/components/dashboard/GrammarLibrary'

export default async function GrammarDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const grammarPoints = await prisma.grammarPoint.findMany({
    include: {
      topic: true
    },
    orderBy: {
      level: 'asc'
    }
  })

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-heading font-black text-clay-deep tracking-tight">Thư viện Ngữ pháp</h1>
          <p className="text-lg text-clay-muted font-bold">Làm chủ 200 chủ điểm nền tảng cùng AI.</p>
        </div>
        <Link 
          href="/dashboard/grammar/quiz"
          className="px-8 py-5 bg-clay-pink text-white rounded-full font-heading font-black shadow-clay-button border-4 border-white hover:scale-105 active:scale-95 transition-all flex items-center gap-3 text-lg"
        >
          <span>🏆</span> Thử thách 15 phút
        </Link>
      </div>

      {/* Main Library with Search & Tabs */}
      <GrammarLibrary initialPoints={grammarPoints} />
    </div>
  )
}
