import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { getUserRole, isAdminEmail } from '@/lib/admin'
import { AppRoles } from '@/lib/constants'

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tokenRole = getUserRole(user)
    const role = (isAdminEmail(user.email) || tokenRole === AppRoles.ADMIN || tokenRole?.toLowerCase() === 'admin') ? AppRoles.ADMIN : AppRoles.USER

    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email!,
        role,
      },
      create: {
        id: user.id,
        email: user.email!,
        role,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        image: user.user_metadata?.avatar_url || null,
        targetLanguage: 'EN',
        proficiencyLevel: 'A1',
      },
    })

    return NextResponse.json({ ok: true, role })
  } catch (error) {
    logger.error('Sync user error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
