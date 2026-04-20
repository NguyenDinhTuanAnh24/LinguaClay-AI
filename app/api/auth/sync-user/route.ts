import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Upsert user vào Prisma DB
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        image: user.user_metadata?.avatar_url || null,
      },
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        image: user.user_metadata?.avatar_url || null,
        targetLanguage: 'EN',
        proficiencyLevel: 'Beginner',
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Sync user error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
