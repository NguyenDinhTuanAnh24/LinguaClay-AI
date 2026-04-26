import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class WordRepository {
  static async listRows(limit: number = 200, topicId?: string) {
    const where: Prisma.WordWhereInput = topicId ? { topicId } : {}

    return prisma.word.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        original: true,
        pronunciation: true,
        translation: true,
        partOfSpeech: true,
        example: true,
        difficulty: true,
        topicId: true,
        createdAt: true,
      },
    })
  }

  static async findUnique(id: string) {
    return prisma.word.findUnique({
      where: { id },
    })
  }

  static async findByTopic(topicId: string, limit: number = 200) {
    return prisma.word.findMany({
      where: { topicId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        original: true,
        pronunciation: true,
        translation: true,
        partOfSpeech: true,
        example: true,
        exampleTranslation: true,
        audioUrl: true,
        difficulty: true,
      },
    })
  }

  static async create(data: {
    original: string
    pronunciation?: string | null
    translation: string
    partOfSpeech?: string | null
    example?: string | null
    exampleTranslation?: string | null
    audioUrl?: string | null
    difficulty?: number
    topicId?: string | null
  }) {
    return prisma.word.create({
      data: {
        original: data.original,
        pronunciation: data.pronunciation || null,
        translation: data.translation,
        partOfSpeech: data.partOfSpeech || null,
        example: data.example || null,
        exampleTranslation: data.exampleTranslation || null,
        audioUrl: data.audioUrl || null,
        difficulty: data.difficulty || 1,
        topicId: data.topicId || null,
      },
    })
  }

  static async update(id: string, data: {
    original?: string
    pronunciation?: string | null
    translation?: string
    partOfSpeech?: string | null
    example?: string | null
    exampleTranslation?: string | null
    audioUrl?: string | null
    difficulty?: number
    topicId?: string | null
  }) {
    return prisma.word.update({
      where: { id },
      data: {
        ...(data.original && { original: data.original }),
        pronunciation: data.pronunciation !== undefined ? data.pronunciation : undefined,
        ...(data.translation && { translation: data.translation }),
        partOfSpeech: data.partOfSpeech !== undefined ? data.partOfSpeech : undefined,
        example: data.example !== undefined ? data.example : undefined,
        exampleTranslation: data.exampleTranslation !== undefined ? data.exampleTranslation : undefined,
        audioUrl: data.audioUrl !== undefined ? data.audioUrl : undefined,
        ...(data.difficulty && { difficulty: data.difficulty }),
        topicId: data.topicId !== undefined ? data.topicId : undefined,
      },
    })
  }

  static async delete(id: string) {
    return prisma.word.delete({
      where: { id },
    })
  }

  static async deleteByTopic(topicId: string) {
    return prisma.word.deleteMany({
      where: { topicId },
    })
  }

  static async count(topicId?: string) {
    const where: Prisma.WordWhereInput = topicId ? { topicId } : {}

    return prisma.word.count({ where })
  }

  static async findWithTopic(limit: number = 200) {
    return prisma.word.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        original: true,
        pronunciation: true,
        translation: true,
        partOfSpeech: true,
        example: true,
        difficulty: true,
        topicId: true,
        createdAt: true,
        topic: {
          select: {
            id: true,
            name: true,
            slug: true,
            level: true,
          },
        },
      },
    })
  }
}
