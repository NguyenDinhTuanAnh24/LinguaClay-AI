import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

type VocabRow = {
  term: string
  pronunciation?: string
  definition: string
  example?: string
  exampleTranslation?: string
  topicName: string
  topicSlug: string
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

function normalizeKey(value: string): string {
  return value.trim().toLowerCase()
}

async function main() {
  const filePath = path.join(process.cwd(), 'data/english/huge-vocabulary.json')
  if (!fs.existsSync(filePath)) {
    throw new Error(`Khong tim thay file: ${filePath}`)
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as VocabRow[]
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('Du lieu huge-vocabulary.json rong hoac sai dinh dang')
  }

  const grouped = new Map<string, VocabRow[]>()
  for (const row of raw) {
    if (!row.term?.trim() || !row.definition?.trim() || !row.topicSlug?.trim() || !row.topicName?.trim()) continue
    const key = row.topicSlug.trim()
    const bucket = grouped.get(key) ?? []
    bucket.push(row)
    grouped.set(key, bucket)
  }

  let topicUpserts = 0
  let wordsCreated = 0
  let wordsUpdated = 0

  for (const [topicSlug, rows] of grouped.entries()) {
    const first = rows[0]
    const topic = await prisma.topic.upsert({
      where: { slug: topicSlug },
      update: {
        name: first.topicName.trim(),
        language: 'EN',
      },
      create: {
        name: first.topicName.trim(),
        slug: topicSlug,
        description: `Kho tang tu vung theo chu de ${first.topicName.trim()}.`,
        level: 'Advanced',
        language: 'EN',
        isAIGenerated: false,
      },
      select: { id: true },
    })
    topicUpserts += 1

    const existingWords = await prisma.word.findMany({
      where: { topicId: topic.id },
      select: { id: true, original: true },
    })

    const existingByOriginal = new Map<string, { id: string }>()
    for (const w of existingWords) {
      const key = normalizeKey(w.original)
      if (!existingByOriginal.has(key)) existingByOriginal.set(key, { id: w.id })
    }

    for (const row of rows) {
      const original = row.term.trim()
      const key = normalizeKey(original)
      const matched = existingByOriginal.get(key)

      if (matched) {
        await prisma.word.update({
          where: { id: matched.id },
          data: {
            original,
            translation: row.definition.trim(),
            pronunciation: row.pronunciation?.trim() || null,
            example: row.example?.trim() || null,
            exampleTranslation: row.exampleTranslation?.trim() || null,
          },
        })
        wordsUpdated += 1
      } else {
        await prisma.word.create({
          data: {
            original,
            translation: row.definition.trim(),
            pronunciation: row.pronunciation?.trim() || null,
            example: row.example?.trim() || null,
            exampleTranslation: row.exampleTranslation?.trim() || null,
            topicId: topic.id,
          },
        })
        wordsCreated += 1
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        topicsProcessed: topicUpserts,
        rowsFromFile: raw.length,
        wordsCreated,
        wordsUpdated,
      },
      null,
      2
    )
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })

