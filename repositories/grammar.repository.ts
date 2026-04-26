import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

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

  static async listRows(limit: number = 400) {
    return prisma.grammarPoint.findMany({
      orderBy: { id: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        level: true,
        structure: true,
      },
    })
  }

  static async findUnique(slug: string) {
    return prisma.grammarPoint.findUnique({
      where: { slug },
    })
  }

  static async create(data: {
    slug: string
    title: string
    level: string
    structure?: string | null
    explanation: string
    example: string
  }) {
    return prisma.grammarPoint.create({
      data: {
        slug: data.slug,
        title: data.title,
        level: data.level,
        structure: data.structure || null,
        explanation: data.explanation,
        example: data.example,
      },
    })
  }

  static async update(id: string, data: {
    title: string
    level: string
    structure?: string | null
    explanation: string
    example: string
  }) {
    return prisma.grammarPoint.update({
      where: { id },
      data: {
        title: data.title,
        level: data.level,
        structure: data.structure || null,
        explanation: data.explanation,
        example: data.example,
      },
    })
  }

  static async delete(id: string) {
    return prisma.grammarPoint.delete({
      where: { id },
    })
  }
}

