import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { StudyTimeProvider } from '@/components/study-time/StudyTimeProvider'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export default async function StudyLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isBanned: true },
  })

  if (dbUser?.isBanned) {
    notFound()
  }

  return <StudyTimeProvider>{children}</StudyTimeProvider>
}
