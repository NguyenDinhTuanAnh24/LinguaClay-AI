import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { ensureAdminActor } from '@/lib/admin-auth'
import { SupportRepository } from '@/repositories/support.repository'

export async function GET() {
  try {
    const admin = await ensureAdminActor()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const rows = await SupportRepository.findManyForAdmin(180)
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
    logger.error('Admin support tickets GET error:', error)
    return NextResponse.json({ error: 'Không thể tải ticket hỗ trợ' }, { status: 500 })
  }
}
