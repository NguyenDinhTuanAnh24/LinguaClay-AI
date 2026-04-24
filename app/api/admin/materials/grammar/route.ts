import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { isAdminUser } from '@/lib/admin'
import { parseCsvText, slugify } from '@/lib/csv'
import { normalizeCefrLevel } from '@/lib/levels'

type GrammarAction = 'create' | 'update' | 'delete' | 'import_csv'

async function ensureAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminUser(user)) return false
  return true
}

async function listGrammarRows() {
  const rows = await prisma.grammarPoint.findMany({
    orderBy: { id: 'desc' },
    take: 400,
    select: {
      id: true,
      title: true,
      level: true,
      structure: true,
    },
  })

  return rows.map((g) => ({
    id: g.id,
    title: g.title,
    level: g.level || 'N/A',
    structure: g.structure || 'N/A',
    createdAt: '-',
  }))
}

async function createUniqueGrammarSlug(title: string) {
  const base = slugify(title) || 'grammar'
  let candidate = base
  let index = 1
  while (await prisma.grammarPoint.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${index}`
    index += 1
  }
  return candidate
}

export async function GET() {
  try {
    if (!(await ensureAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const rows = await listGrammarRows()
    return NextResponse.json({ ok: true, rows })
  } catch (error) {
    console.error('admin materials grammar GET error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    if (!(await ensureAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const body = (await req.json()) as {
      action?: GrammarAction
      id?: string
      title?: string
      level?: string
      structure?: string
      explanation?: string
      example?: string
      csvText?: string
    }

    const action = body.action
    if (!action || !['create', 'update', 'delete', 'import_csv'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (action === 'create') {
      const title = (body.title || '').trim()
      if (!title) return NextResponse.json({ error: 'Tên cấu trúc không hợp lệ' }, { status: 400 })
      const slug = await createUniqueGrammarSlug(title)
      await prisma.grammarPoint.create({
        data: {
          slug,
          title,
          level: normalizeCefrLevel((body.level || '').trim() || 'A1'),
          structure: (body.structure || '').trim() || null,
          explanation: (body.explanation || '').trim() || 'Chưa có mô tả',
          example: (body.example || '').trim() || '-',
        },
      })
    }

    if (action === 'update') {
      const id = body.id || ''
      if (!id) return NextResponse.json({ error: 'Thiếu ID ngữ pháp' }, { status: 400 })
      const title = (body.title || '').trim()
      if (!title) return NextResponse.json({ error: 'Tên cấu trúc không hợp lệ' }, { status: 400 })
      await prisma.grammarPoint.update({
        where: { id },
        data: {
          title,
          level: normalizeCefrLevel((body.level || '').trim() || 'A1'),
          structure: (body.structure || '').trim() || null,
          explanation: (body.explanation || '').trim() || 'Chưa có mô tả',
          example: (body.example || '').trim() || '-',
        },
      })
    }

    if (action === 'delete') {
      const id = body.id || ''
      if (!id) return NextResponse.json({ error: 'Thiếu ID ngữ pháp' }, { status: 400 })
      await prisma.grammarPoint.delete({ where: { id } })
    }

    if (action === 'import_csv') {
      const rows = parseCsvText(body.csvText || '')
      if (!rows.length) return NextResponse.json({ error: 'CSV không hợp lệ hoặc không có dữ liệu' }, { status: 400 })

      let imported = 0
      for (const row of rows) {
        const title = (row.title || row.name || '').trim()
        if (!title) continue
        const slug = await createUniqueGrammarSlug(title)
        await prisma.grammarPoint.create({
          data: {
            slug,
            title,
            level: normalizeCefrLevel((row.level || '').trim() || 'A1'),
            structure: (row.structure || '').trim() || null,
            explanation: (row.explanation || '').trim() || 'Chưa có mô tả',
            example: (row.example || '').trim() || '-',
          },
        })
        imported += 1
      }
      if (!imported) return NextResponse.json({ error: 'CSV thiếu cột title' }, { status: 400 })
    }

    const rows = await listGrammarRows()
    return NextResponse.json({ ok: true, rows })
  } catch (error) {
    console.error('admin materials grammar POST error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
