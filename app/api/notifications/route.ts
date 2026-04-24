import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { listUserNotifications, markAllUserNotificationsRead } from '@/lib/user-notifications'

function parsePositiveInt(value: string | null, fallback: number): number {
  const num = Number.parseInt(value || '', 10)
  if (!Number.isFinite(num) || num <= 0) return fallback
  return num
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parsePositiveInt(searchParams.get('page'), 1)
    const pageSize = parsePositiveInt(searchParams.get('pageSize'), 8)

    const data = await listUserNotifications(user.id, page, pageSize)
    return NextResponse.json({ ok: true, ...data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as { action?: string }
    if ((body.action || 'mark_read_all') !== 'mark_read_all') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updated = await markAllUserNotificationsRead(user.id)
    return NextResponse.json({ ok: true, updated: updated.count })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    console.error('Notifications POST error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
