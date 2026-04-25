import { prisma } from '@/lib/prisma'

export class DashboardRepository {
  static async findRecentTopicForUser(userId: string) {
    const recentProgress = await prisma.userProgress.findFirst({
      where: {
        userId,
        lastReviewed: { not: null },
        word: { topicId: { not: null } },
      },
      orderBy: { lastReviewed: 'desc' },
      include: {
        word: {
          include: {
            topic: true,
          },
        },
      },
    })

    return recentProgress?.word?.topic || null
  }
}
