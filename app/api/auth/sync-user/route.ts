import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getUserRole, isAdminEmail } from '@/lib/admin'
import { AppRoles } from '@/lib/constants'
import { UserRepository } from '@/repositories/user.repository'
import { UserRole } from '@prisma/client'

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

    await UserRepository.upsertFromAuth({
      id: user.id,
      email: user.email!,
      role: role === AppRoles.ADMIN ? UserRole.ADMIN : UserRole.USER,
      name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      image: user.user_metadata?.avatar_url || null,
    })

    return NextResponse.json({ ok: true, role })
  } catch (error) {
    logger.error('Sync user error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
