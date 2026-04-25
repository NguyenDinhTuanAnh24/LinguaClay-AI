import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureAdminActor } from '@/lib/admin-auth'

type Payload = {
  ticketId?: string
  supportTicketId?: string
  note?: string
}

export async function POST(req: Request) {
  try {
    const admin = await ensureAdminActor()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const payload = (await req.json()) as Payload
    const ticketId = (payload.supportTicketId || payload.ticketId || '').trim()
    const note = (payload.note || '').trim()

    if (!ticketId) return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 })

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { internalNote: note || null },
      select: { id: true, internalNote: true },
    })

    return NextResponse.json({
      ok: true,
      ticketId: updated.id,
      note: updated.internalNote || '',
    })
  } catch (error) {
    logger.error('Admin save internal note error:', error)
    return NextResponse.json({ error: 'Không thể lưu ghi chú nội bộ' }, { status: 500 })
  }
}
