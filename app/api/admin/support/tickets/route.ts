import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { isAdminUser } from '@/lib/admin'

async function ensureAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminUser(user)) return null

  try {
    const actor = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    })
    if (!actor || (actor as { role?: string }).role !== 'ADMIN') return null
  } catch {
    // Backward compatibility fallback.
  }

  return user
}

export async function GET() {
  try {
    const admin = await ensureAdmin()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const rows = await prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      take: 180,
      select: {
        id: true,
        userId: true,
        category: true,
        subject: true,
        message: true,
        attachmentUrl: true,
        status: true,
        device: true,
        blockedLesson: true,
        internalNote: true,
        adminReply: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isPro: true,
            proType: true,
            updatedAt: true,
          },
        },
      },
    })

    return NextResponse.json({
      ok: true,
      tickets: rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        user: {
          ...row.user,
          updatedAt: row.user.updatedAt.toISOString(),
        },
      })),
    })
  } catch (error) {
    console.error('Admin support tickets GET error:', error)
    return NextResponse.json({ error: 'Không thể tải ticket hỗ trợ' }, { status: 500 })
  }
}
