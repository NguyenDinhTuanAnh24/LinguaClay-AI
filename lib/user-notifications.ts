import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

type CreateNotificationInput = {
  userId: string
  type: string
  title: string
  message: string
  metadata?: Record<string, unknown>
  dedupeKey?: string
  createdAt?: Date
}

let notificationTableEnsured = false

async function ensureNotificationTable() {
  if (notificationTableEnsured) return

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "UserNotification" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "metadata" JSONB,
      "dedupeKey" TEXT UNIQUE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "readAt" TIMESTAMP(3),
      CONSTRAINT "UserNotification_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "UserNotification_userId_createdAt_idx" ON "UserNotification" ("userId", "createdAt")`
  )
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "UserNotification_userId_readAt_createdAt_idx" ON "UserNotification" ("userId", "readAt", "createdAt")`
  )

  notificationTableEnsured = true
}

export async function createUserNotification(input: CreateNotificationInput) {
  await ensureNotificationTable()

  if (input.dedupeKey) {
    return prisma.userNotification.upsert({
      where: { dedupeKey: input.dedupeKey },
      update: {},
      create: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
        dedupeKey: input.dedupeKey,
        createdAt: input.createdAt ?? new Date(),
      },
    })
  }

  return prisma.userNotification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
      createdAt: input.createdAt ?? new Date(),
    },
  })
}

/**
 * Creates a user notification safely, catching and logging any errors 
 * that occur during creation so it does not throw out of the current context.
 * 
 * @param {CreateNotificationInput} input The notification data
 */
export async function safeCreateUserNotification(input: CreateNotificationInput) {
  try {
    await createUserNotification(input)
  } catch (error) {
    // Optionally use logger.error if imported
    console.error('Safe create notification error:', error)
  }
}


export async function markAllUserNotificationsRead(userId: string) {
  await ensureNotificationTable()
  return prisma.userNotification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  })
}

export async function listUserNotifications(userId: string, page: number, pageSize: number) {
  await ensureNotificationTable()

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.min(20, Math.floor(pageSize)) : 8
  const skip = (safePage - 1) * safePageSize

  const [total, unreadCount, rows] = await Promise.all([
    prisma.userNotification.count({ where: { userId } }),
    prisma.userNotification.count({ where: { userId, readAt: null } }),
    prisma.userNotification.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip,
      take: safePageSize,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        createdAt: true,
        readAt: true,
      },
    }),
  ])

  return {
    total,
    unreadCount,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
    items: rows,
  }
}
