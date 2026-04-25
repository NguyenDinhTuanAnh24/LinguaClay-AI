import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { SupportRepository } from '@/repositories/support.repository'

type CreatePayload = {
  category?: string
  subject?: string
  message?: string
  attachmentUrl?: string
  device?: string
  blockedLesson?: string
}

function normalizeCategory(raw: string): string {
  const value = raw.trim().toUpperCase()
  if (['TECHNICAL', 'CONTENT', 'PAYMENT', 'FEEDBACK'].includes(value)) return value
  return 'FEEDBACK'
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rows = await SupportRepository.findManyByUserId(user.id, 60)
    return NextResponse.json({
      ok: true,
      tickets: rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    logger.error('Support tickets GET error:', error)
    return NextResponse.json({ error: 'Không thể tải danh sách hỗ trợ' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = (await req.json()) as CreatePayload
    const category = normalizeCategory(payload.category || '')
    const subject = (payload.subject || '').trim()
    const message = (payload.message || '').trim()
    const attachmentUrl = (payload.attachmentUrl || '').trim()
    const device = (payload.device || '').trim()
    const blockedLesson = (payload.blockedLesson || '').trim()

    if (!message) {
      return NextResponse.json({ error: 'Nội dung hỗ trợ không được để trống' }, { status: 400 })
    }

    const created = await SupportRepository.createUserTicket({
      userId: user.id,
      category,
      subject: subject || null,
      message,
      attachmentUrl: attachmentUrl || null,
      device: device || null,
      blockedLesson: blockedLesson || null,
    })

    return NextResponse.json({
      ok: true,
      ticket: {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
      message: 'Đã gửi yêu cầu hỗ trợ thành công.',
    })
  } catch (error) {
    logger.error('Support tickets POST error:', error)
    return NextResponse.json({ error: 'Không thể gửi yêu cầu hỗ trợ' }, { status: 500 })
  }
}
