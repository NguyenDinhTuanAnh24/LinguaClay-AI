import { prisma } from '@/lib/prisma'
import { ADMIN_EMAILS } from '@/lib/admin'

export type OverviewRawData = {
  newUsers: number
  successfulOrders: Array<{ amount: number; planId: string }>
  dauRows: Array<{ userId: string }>
  mauRows: Array<{ userId: string }>
  createdUsers: Array<{ createdAt: Date }>
  flashcardsReviewedToday: number
  totalGrammarPoints: number
  completedGrammarRows: Array<{ grammarPointId: string | null }>
  tutorListeningTotal: number
  tutorReadingTotal: number
  tutorSpeakingTotal: number
  tutorWritingTotal: number
}

export class ReportingRepository {
  static async getAdminOverviewRaw(input: {
    startAt: Date
    endAt: Date
    mauStart: Date
    todayStart: Date
    todayEnd: Date
  }): Promise<OverviewRawData> {
    const [
      newUsers,
      successfulOrders,
      dauRows,
      mauRows,
      createdUsers,
      flashcardsReviewedToday,
      totalGrammarPoints,
      completedGrammarRows,
      tutorListeningTotal,
      tutorReadingTotal,
      tutorSpeakingTotal,
      tutorWritingTotal,
    ] = await Promise.all([
      prisma.user.count({ where: { email: { notIn: ADMIN_EMAILS }, createdAt: { gte: input.startAt, lte: input.endAt } } }),
      prisma.order.findMany({
        where: { status: 'SUCCESS', createdAt: { gte: input.startAt, lte: input.endAt } },
        select: { amount: true, planId: true },
      }),
      prisma.userProgress.findMany({
        where: { user: { email: { notIn: ADMIN_EMAILS } }, lastReviewed: { gte: input.startAt, lte: input.endAt } },
        distinct: ['userId'],
        select: { userId: true },
      }),
      prisma.userProgress.findMany({
        where: { user: { email: { notIn: ADMIN_EMAILS } }, lastReviewed: { gte: input.mauStart, lte: input.endAt } },
        distinct: ['userId'],
        select: { userId: true },
      }),
      prisma.user.findMany({
        where: { email: { notIn: ADMIN_EMAILS }, createdAt: { gte: input.startAt, lte: input.endAt } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.userProgress.count({
        where: { user: { email: { notIn: ADMIN_EMAILS } }, lastReviewed: { gte: input.todayStart, lte: input.todayEnd } },
      }),
      prisma.grammarPoint.count(),
      prisma.exercise.findMany({
        where: {
          grammarPointId: { not: null },
          userId: { not: null },
        },
        distinct: ['grammarPointId'],
        select: { grammarPointId: true },
      }),
      prisma.tutorListeningSession.count({ where: { user: { email: { notIn: ADMIN_EMAILS } }, createdAt: { gte: input.startAt, lte: input.endAt } } }),
      prisma.tutorReadingSession.count({ where: { user: { email: { notIn: ADMIN_EMAILS } }, createdAt: { gte: input.startAt, lte: input.endAt } } }),
      prisma.tutorSpeakingSession.count({ where: { user: { email: { notIn: ADMIN_EMAILS } }, createdAt: { gte: input.startAt, lte: input.endAt } } }),
      prisma.tutorEditorSession.count({ where: { user: { email: { notIn: ADMIN_EMAILS } }, createdAt: { gte: input.startAt, lte: input.endAt } } }),
    ])

    return {
      newUsers,
      successfulOrders,
      dauRows,
      mauRows,
      createdUsers,
      flashcardsReviewedToday,
      totalGrammarPoints,
      completedGrammarRows,
      tutorListeningTotal,
      tutorReadingTotal,
      tutorSpeakingTotal,
      tutorWritingTotal,
    }
  }
}
