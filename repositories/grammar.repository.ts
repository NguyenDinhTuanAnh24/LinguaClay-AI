import { prisma } from '@/lib/prisma'

export class GrammarRepository {
  static async findQuizCandidates() {
    return prisma.grammarPoint.findMany({
      where: {
        example: { not: '' },
      },
      select: {
        id: true,
        title: true,
        example: true,
        exampleSentence: true,
      },
    })
  }
}

