import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

function normalizeCefrLevel(value: string | null | undefined): CefrLevel {
  const raw = (value || '').trim().toUpperCase().replace(/\s+/g, '_')
  if (raw === 'A1' || raw === 'A2' || raw === 'B1' || raw === 'B2' || raw === 'C1' || raw === 'C2') return raw
  if (raw === 'BEGINNER' || raw === 'ELEMENTARY') return 'A1'
  if (raw === 'PRE_INTERMEDIATE' || raw === 'PREINTERMEDIATE') return 'A2'
  if (raw === 'INTERMEDIATE') return 'B1'
  if (raw === 'UPPER_INTERMEDIATE' || raw === 'UPPERINTERMEDIATE') return 'B2'
  if (raw === 'ADVANCED') return 'C1'
  return 'A1'
}

async function migrateUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, proficiencyLevel: true },
  })

  let changed = 0
  for (const user of users) {
    const nextLevel = normalizeCefrLevel(user.proficiencyLevel)
    if (nextLevel !== user.proficiencyLevel) {
      await prisma.user.update({
        where: { id: user.id },
        data: { proficiencyLevel: nextLevel },
      })
      changed += 1
    }
  }

  return { total: users.length, changed }
}

async function migrateTopics() {
  const topics = await prisma.topic.findMany({
    select: { id: true, level: true },
  })

  let changed = 0
  for (const topic of topics) {
    const nextLevel = normalizeCefrLevel(topic.level)
    if (nextLevel !== topic.level) {
      await prisma.topic.update({
        where: { id: topic.id },
        data: { level: nextLevel },
      })
      changed += 1
    }
  }

  return { total: topics.length, changed }
}

async function migrateGrammarPoints() {
  const points = await prisma.grammarPoint.findMany({
    select: { id: true, level: true },
  })

  let changed = 0
  for (const point of points) {
    const nextLevel = normalizeCefrLevel(point.level)
    if (nextLevel !== point.level) {
      await prisma.grammarPoint.update({
        where: { id: point.id },
        data: { level: nextLevel },
      })
      changed += 1
    }
  }

  return { total: points.length, changed }
}

async function main() {
  console.log('Starting CEFR migration...')
  const [users, topics, grammar] = await Promise.all([
    migrateUsers(),
    migrateTopics(),
    migrateGrammarPoints(),
  ])

  console.log(`Users: ${users.changed}/${users.total} updated`)
  console.log(`Topics: ${topics.changed}/${topics.total} updated`)
  console.log(`Grammar points: ${grammar.changed}/${grammar.total} updated`)
  console.log('CEFR migration completed.')
}

main()
  .catch((error) => {
    console.error('CEFR migration failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

