import { prisma } from '@/lib/prisma'

export class StudyTimeRepository {
  static async findDailyActiveSeconds(userId: string, date: Date) {
    return prisma.userDailyStudy.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      select: {
        activeSeconds: true,
      },
    })
  }

  static async upsertDailyActiveSeconds(input: {
    userId: string
    date: Date
    incrementBy: number
    now: Date
  }) {
    return prisma.userDailyStudy.upsert({
      where: {
        userId_date: {
          userId: input.userId,
          date: input.date,
        },
      },
      update: {
        activeSeconds: { increment: input.incrementBy },
        lastActiveAt: input.now,
      },
      create: {
        userId: input.userId,
        date: input.date,
        activeSeconds: input.incrementBy,
        lastActiveAt: input.now,
      },
      select: {
        activeSeconds: true,
      },
    })
  }
}

