import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { isAdminUser } from '@/lib/admin'

type Payload = {
  ticketId?: string
  supportTicketId?: string
  note?: string
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
    if (!actor || (actor as { role?: string }).role !== 'ADMIN') {
      return null
    }
  } catch {
    // Fallback to Supabase admin check.
  }

  return user
}

export async function POST(req: Request) {
  try {
    const admin = await ensureAdmin()
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
    console.error('Admin save internal note error:', error)
    return NextResponse.json({ error: 'Không thể lưu ghi chú nội bộ' }, { status: 500 })
  }
}
