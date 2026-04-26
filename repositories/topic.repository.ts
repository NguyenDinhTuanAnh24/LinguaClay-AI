import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class TopicRepository {
  static async listRows(limit: number = 200) {
    return prisma.topic.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        level: true,
        language: true,
        isAIGenerated: true,
        userId: true,
        createdAt: true,
      },
    })
  }

  static async findUnique(slug: string) {
    return prisma.topic.findUnique({
      where: { slug },
      select: { id: true },
    })
  }

  static async findFirst(where: Prisma.TopicWhereInput) {
    return prisma.topic.findFirst({
      where,
      select: { id: true },
    })
  }

  static async create(data: {
    name: string
    slug: string
    level: string
    language?: string
    userId?: string | null
    isAIGenerated?: boolean
  }) {
    return prisma.topic.create({
      data: {
        name: data.name,
        slug: data.slug,
        level: data.level,
        language: data.language || 'EN',
        userId: data.userId || null,
        isAIGenerated: data.isAIGenerated || false,
      },
    })
  }

  static async update(id: string, data: {
    name: string
    level: string
  }) {
    return prisma.topic.update({
      where: { id },
      data: {
        name: data.name,
        level: data.level,
      },
    })
  }

  static async delete(id: string) {
    return prisma.topic.delete({
      where: { id },
    })
  }

  static async findWithWords(limit: number = 200) {
    return prisma.topic.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
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
  }
}
