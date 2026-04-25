import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { isAdminUser } from '@/lib/admin'
import { parseCsvText } from '@/lib/csv'
import { MediaAssetRepository } from '@/repositories/media-asset.repository'

type MediaAction = 'create' | 'update' | 'delete' | 'import_csv'

function parseType(input: string): 'IMAGE' | 'AUDIO' {
  const value = input.trim().toLowerCase()
  if (value === 'audio' || value === 'âm thanh' || value === 'am thanh') return 'AUDIO'
  return 'IMAGE'
}

const mediaNotReadyMessage = 'MediaAsset chưa có trong Prisma Client. Hãy chạy prisma generate và restart server dev.'

async function ensureAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return !!(user && isAdminUser(user))
}

export async function GET() {
  try {
    if (!(await ensureAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const rows = await MediaAssetRepository.listRows()
    return NextResponse.json({ ok: true, rows })
  } catch (error) {
    if (error instanceof Error && error.message === 'MEDIA_ASSET_MODEL_MISSING') {
      return NextResponse.json({ error: mediaNotReadyMessage }, { status: 503 })
    }
    logger.error('admin materials media GET error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    if (!(await ensureAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = (await req.json()) as {
      action?: MediaAction
      id?: string
      type?: string
      name?: string
      url?: string
      size?: string
      csvText?: string
    }

    const action = body.action
    if (!action || !['create', 'update', 'delete', 'import_csv'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (action === 'create') {
      const name = (body.name || '').trim()
      const url = (body.url || '').trim()
      if (!name || !url) return NextResponse.json({ error: 'Tên file và URL là bắt buộc' }, { status: 400 })
      await MediaAssetRepository.create({
        type: parseType(body.type || 'image'),
        name,
        url,
        size: (body.size || '').trim() || null,
      })
    }

    if (action === 'update') {
      const id = body.id || ''
      const name = (body.name || '').trim()
      const url = (body.url || '').trim()
      if (!id) return NextResponse.json({ error: 'Thiếu ID media' }, { status: 400 })
      if (!name || !url) return NextResponse.json({ error: 'Tên file và URL là bắt buộc' }, { status: 400 })
      await MediaAssetRepository.update(id, {
        type: parseType(body.type || 'image'),
        name,
        url,
        size: (body.size || '').trim() || null,
      })
    }

    if (action === 'delete') {
      const id = body.id || ''
      if (!id) return NextResponse.json({ error: 'Thiếu ID media' }, { status: 400 })
      await MediaAssetRepository.delete(id)
    }

    if (action === 'import_csv') {
      const rows = parseCsvText(body.csvText || '')
      if (!rows.length) return NextResponse.json({ error: 'CSV không hợp lệ hoặc không có dữ liệu' }, { status: 400 })
      let imported = 0
      for (const row of rows) {
        const name = (row.name || row.file || '').trim()
        const url = (row.url || row.link || '').trim()
        if (!name || !url) continue
        await MediaAssetRepository.create({
          type: parseType(row.type || 'image'),
          name,
          url,
          size: (row.size || '').trim() || null,
        })
        imported += 1
      }
      if (!imported) return NextResponse.json({ error: 'CSV thiếu cột name/url' }, { status: 400 })
    }

    const rows = await MediaAssetRepository.listRows()
    return NextResponse.json({ ok: true, rows })
  } catch (error) {
    if (error instanceof Error && error.message === 'MEDIA_ASSET_MODEL_MISSING') {
      return NextResponse.json({ error: mediaNotReadyMessage }, { status: 503 })
    }
    logger.error('admin materials media POST error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
