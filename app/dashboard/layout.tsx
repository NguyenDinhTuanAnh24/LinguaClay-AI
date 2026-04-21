import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import MobileNav from '@/components/dashboard/MobileNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Lấy name & image đã lưu từ Prisma
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    // @ts-ignore
    select: { name: true, image: true, proficiencyLevel: true, isPro: true }
  })

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex p-4 lg:p-6 gap-6">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-6 h-[calc(100vh-3rem)] z-40">
        <Sidebar user={user} dbUser={dbUser} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/40 backdrop-blur-3xl rounded-[40px] shadow-clay-inset relative z-10 overflow-hidden border-2 border-white/60">
        <header className="sticky top-0 z-30 px-6 py-4 bg-white/20 backdrop-blur-md border-b-2 border-white/50">
          <Header user={user} dbUser={dbUser} />
        </header>

        <main className="flex-1 p-6 pb-32 lg:pb-8 overflow-y-auto scrollbar-hide">
          {children}
        </main>

        <div className="lg:hidden">
          <MobileNav />
        </div>
      </div>
    </div>
  )
}

