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
    <div className="min-h-screen bg-clay-cream flex flex-col md:flex-row p-0 md:p-4 gap-0 md:gap-6">
      {/* Sidebar - Desktop (Floating Effect) */}
      <aside className="hidden md:block w-64 flex-shrink-0 sticky top-4 h-[calc(100vh-2rem)]">
        <Sidebar user={user} dbUser={dbUser} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/40 md:rounded-[40px] shadow-clay-inset border-2 border-white/50 overflow-hidden relative">
        <header className="sticky top-0 z-30 px-4 md:px-8 pt-4 md:pt-6">
          <Header user={user} dbUser={dbUser} />
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-8 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {children}
        </main>

        <MobileNav />
      </div>
    </div>
  )
}



