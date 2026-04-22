import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, image: true, proficiencyLevel: true, isPro: true },
  })

  // Get words studied today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const wordsToday = await prisma.userProgress.count({
    where: {
      userId: user.id,
      lastReviewed: {
        gte: today,
      },
    },
  })

  return (
    <DashboardShell user={user} dbUser={dbUser} wordsToday={wordsToday}>
      {children}
    </DashboardShell>
  )
}
