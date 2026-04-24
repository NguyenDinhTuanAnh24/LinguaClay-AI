import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { isAdminUser } from '@/lib/admin'

type Payload = {
  reply?: string
  status?: string
}

type ReplyRouteContext = {
  params: { ticketId: string } | Promise<{ ticketId: string }>
}

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

function normalizeStatus(raw: string): string {
  const value = raw.trim().toUpperCase()
  if (['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(value)) return value
  return 'IN_PROGRESS'
}

export async function POST(req: Request, ctx: ReplyRouteContext) {
  try {
    const admin = await ensureAdmin()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { ticketId } = await Promise.resolve(ctx.params)
    const id = (ticketId || '').trim()
    if (!id) return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 })

    const payload = (await req.json()) as Payload
    const reply = (payload.reply || '').trim()
    const status = normalizeStatus(payload.status || 'IN_PROGRESS')

    if (!reply) return NextResponse.json({ error: 'Thiếu nội dung phản hồi' }, { status: 400 })

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: {
        adminReply: reply,
        status,
      },
      select: {
        id: true,
        adminReply: true,
        status: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      ok: true,
      ticket: {
        ...updated,
        updatedAt: updated.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Admin support reply error:', error)
    return NextResponse.json({ error: 'Không thể gửi phản hồi hỗ trợ' }, { status: 500 })
  }
}
