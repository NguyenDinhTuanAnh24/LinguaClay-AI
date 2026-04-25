import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseCsvText, slugify } from '@/lib/csv'
import { normalizeCefrLevel } from '@/lib/levels'
import { cache, CACHE_KEYS } from '@/lib/cache'
import { ensureAdminActor } from '@/lib/admin-auth'

type FlashcardAction = 'create' | 'update' | 'delete' | 'import_csv'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

async function listFlashcardSets() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      name: true,
      level: true,
      createdAt: true,
      words: {
        select: {
          id: true,
          original: true,
          translation: true,
          example: true,
          pronunciation: true,
        },
        orderBy: { createdAt: 'asc' },
        take: 200,
      },
    },
  })

  return topics.map((topic) => ({
    id: topic.id,
    topic: topic.name,
    words: topic.words.length,
    level: topic.level || 'N/A',
    createdAt: formatDate(topic.createdAt),
    items: topic.words.map((word) => ({
      id: word.id,
      term: word.original,
      definition: word.translation,
      example: word.example || '',
      pronunciation: word.pronunciation || '',
    })),
  }))
}

async function createUniqueTopicSlug(name: string) {
  const base = slugify(name) || 'topic'
  let candidate = base
  let index = 1
  while (await prisma.topic.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${index}`
    index += 1
  }
  return candidate
}

export async function GET() {
  try {
    if (!(await ensureAdminActor())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // Cache for 2 minutes — invalidated on any write mutation
    const sets = await cache.get(CACHE_KEYS.flashcardsAll, listFlashcardSets, 120)
    return NextResponse.json({ ok: true, sets })
  } catch (error) {
    logger.error('admin.flashcards.get', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    if (!(await ensureAdminActor())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const body = (await req.json()) as {
      action?: FlashcardAction
      id?: string
      topic?: string
      level?: string
      csvText?: string
    }

    const action = body.action
    if (!action || !['create', 'update', 'delete', 'import_csv'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (action === 'create') {
      const topic = (body.topic || '').trim()
      const level = normalizeCefrLevel((body.level || '').trim() || 'A1')
      if (!topic) return NextResponse.json({ error: 'Tên chủ đề không hợp lệ' }, { status: 400 })

      const slug = await createUniqueTopicSlug(topic)
      await prisma.topic.create({
        data: {
          name: topic,
          slug,
          level,
          language: 'EN',
        },
      })
    }

    if (action === 'update') {
      const id = body.id || ''
      const topic = (body.topic || '').trim()
      const level = (body.level || '').trim()
      if (!id) return NextResponse.json({ error: 'Thiếu ID chủ đề' }, { status: 400 })
      if (!topic) return NextResponse.json({ error: 'Tên chủ đề không hợp lệ' }, { status: 400 })

      await prisma.topic.update({
        where: { id },
        data: {
          name: topic,
          level: normalizeCefrLevel(level || 'A1'),
        },
      })
    }

    if (action === 'delete') {
      const id = body.id || ''
      if (!id) return NextResponse.json({ error: 'Thiếu ID chủ đề' }, { status: 400 })
      await prisma.topic.delete({ where: { id } })
    }

    if (action === 'import_csv') {
      const csvText = body.csvText || ''
      const rows = parseCsvText(csvText)
      if (!rows.length) return NextResponse.json({ error: 'CSV không hợp lệ hoặc không có dữ liệu' }, { status: 400 })

      const topicCache = new Map<string, string>()
      let imported = 0

      for (const row of rows) {
        const topicName = (row.topic || row['chu de'] || row['chủ đề'] || '').trim()
        const term = (row.term || row.original || row.word || '').trim()
        const definition = (row.definition || row.translation || '').trim()
        if (!topicName || !term || !definition) continue

        const level = normalizeCefrLevel((row.level || '').trim() || 'A1')
        let topicId = topicCache.get(topicName)
        if (!topicId) {
          const existing = await prisma.topic.findFirst({
            where: { name: topicName },
            select: { id: true },
          })
          if (existing) {
            topicId = existing.id
          } else {
            const slug = await createUniqueTopicSlug(topicName)
            const created = await prisma.topic.create({
              data: { name: topicName, slug, level, language: 'EN' },
              select: { id: true },
            })
            topicId = created.id
          }
          topicCache.set(topicName, topicId)
        }

        await prisma.word.create({
          data: {
            topicId,
            original: term,
            translation: definition,
            example: (row.example || '').trim() || null,
            pronunciation: (row.pronunciation || '').trim() || null,
          },
        })
        imported += 1
      }

      if (!imported) {
        return NextResponse.json({ error: 'CSV thiếu cột bắt buộc: topic, term, definition' }, { status: 400 })
      }
    }

    // Bust cache after any write mutation
    await cache.invalidate(CACHE_KEYS.flashcardsAll)
    const sets = await listFlashcardSets()
    return NextResponse.json({ ok: true, sets })
  } catch (error) {
    logger.error('admin.flashcards.post', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
