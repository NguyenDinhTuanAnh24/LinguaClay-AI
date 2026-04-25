import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { ensureAdminActor } from '@/lib/admin-auth'
import { sendSystemEmail } from '@/lib/email'
import { SupportRepository } from '@/repositories/support.repository'

type Payload = {
  reply?: string
  status?: string
}

type ReplyRouteContext = {
  params: { ticketId: string } | Promise<{ ticketId: string }>
}

function normalizeStatus(raw: string): string {
  const value = raw.trim().toUpperCase()
  if (['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(value)) return value
  return 'IN_PROGRESS'
}

export async function POST(req: Request, ctx: ReplyRouteContext) {
  try {
    const admin = await ensureAdminActor()
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { ticketId } = await Promise.resolve(ctx.params)
    const id = (ticketId || '').trim()
    if (!id) return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 })

    const payload = (await req.json()) as Payload
    const reply = (payload.reply || '').trim()
    const status = normalizeStatus(payload.status || 'IN_PROGRESS')
    if (!reply) return NextResponse.json({ error: 'Thiếu nội dung phản hồi' }, { status: 400 })

    const updated = await SupportRepository.updateReply({
      ticketId: id,
      reply,
      status,
    })

    if (updated.user?.email) {
      const subject = 'Phản hồi hỗ trợ từ LinguaClay Admin'
      const emailHtmlBody = `<p style="white-space: pre-wrap;">${updated.adminReply ?? ''}</p>`
      const emailTextBody = updated.adminReply ?? ''
      const emailRes = await sendSystemEmail(updated.user.email, subject, emailHtmlBody, emailTextBody)
      if (!emailRes.sent) {
        logger.error('Support reply email failed to send:', emailRes.error)
      } else {
        logger.info(`[EMAIL DISPATCHED] Support reply to: ${updated.user.email} via ${emailRes.provider}`)
      }
    }

    return NextResponse.json({
      ok: true,
      ticket: {
        ...updated,
        updatedAt: updated.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    logger.error('Admin support reply error:', error)
    return NextResponse.json({ error: 'Không thể gửi phản hồi hỗ trợ' }, { status: 500 })
  }
}
