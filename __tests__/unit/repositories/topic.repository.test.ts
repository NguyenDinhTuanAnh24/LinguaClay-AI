import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TopicRepository } from '@/repositories/topic.repository'

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    topic: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('TopicRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listRows', () => {
    it('should list all topics with default limit', async () => {
      const mockTopics = [
        {
          id: 'topic-1',
          name: 'Animals',
          slug: 'animals',
          level: 'A1',
          language: 'EN',
          isAIGenerated: false,
          userId: null,
          createdAt: new Date(),
        },
      ]

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.topic.findMany).mockResolvedValue(mockTopics as never)

      const result = await TopicRepository.listRows()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Animals')
      expect(prisma.topic.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 200,
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
    })

    it('should list topics with custom limit', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.topic.findMany).mockResolvedValue([])

      await TopicRepository.listRows(50)

      expect(prisma.topic.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 50,
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
    })
  })

  describe('findUnique', () => {
    it('should find topic by slug', async () => {
      const mockTopic = {
        id: 'topic-1',
        slug: 'animals',
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.topic.findUnique).mockResolvedValue(mockTopic as never)

      const result = await TopicRepository.findUnique('animals')

      expect(result).toBe(mockTopic)
      expect(prisma.topic.findUnique).toHaveBeenCalledWith({
        where: { slug: 'animals' },
        select: { id: true },
      })
    })

    it('should return null when topic not found', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.topic.findUnique).mockResolvedValue(null)

      const result = await TopicRepository.findUnique('nonexistent-slug')

      expect(result).toBeNull()
    })
  })

  describe('findFirst', () => {
    it('should find first topic matching where clause', async () => {
      const mockTopic = {
        id: 'topic-1',
        name: 'Test Topic',
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.topic.findFirst).mockResolvedValue(mockTopic as never)

      const result = await TopicRepository.findFirst({ level: 'A1' })

      expect(result).toBe(mockTopic)
      expect(prisma.topic.findFirst).toHaveBeenCalledWith({
        where: { level: 'A1' },
        select: { id: true },
      })
    })

    it('should return null when no topic matches', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.topic.findFirst).mockResolvedValue(null)

      const result = await TopicRepository.findFirst({ level: 'C2' })

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create new topic with all fields', async () => {
      const mockTopic = {
        id: 'new-topic-id',
        name: 'New Topic',
        slug: 'new-topic',
        level: 'B1',
        language: 'EN',
        isAIGenerated: true,
        userId: 'user-123',
        createdAt: new Date(),
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.topic.create).mockResolvedValue(mockTopic as never)

      const result = await TopicRepository.create({
        name: 'New Topic',
        slug: 'new-topic',
        level: 'B1',
        language: 'EN',
        isAIGenerated: true,
        userId: 'user-123',
      })

      expect(result).toMatchObject(mockTopic)
      expect(prisma.topic.create).toHaveBeenCalledWith({
        data: {
          name: 'New Topic',
          slug: 'new-topic',
          level: 'B1',
          language: 'EN',
          userId: 'user-123',
          isAIGenerated: true,
        },
      })
    })

    it('should create topic with defaults', async () => {
      const mockTopic = {
        id: 'new-topic-id',
        name: 'Simple Topic',
        slug: 'simple-topic',
        level: 'A1',
        language: 'EN',
        isAIGenerated: false,
        userId: null,
        createdAt: new Date(),
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.topic.create).mockResolvedValue(mockTopic as never)

      const result = await TopicRepository.create({
        name: 'Simple Topic',
        slug: 'simple-topic',
        level: 'A1',
      })

      expect(result).toMatchObject(mockTopic)
      expect(prisma.topic.create).toHaveBeenCalledWith({
        data: {
          name: 'Simple Topic',
          slug: 'simple-topic',
          level: 'A1',
          language: 'EN',
          userId: null,
          isAIGenerated: false,
        },
      })
    })
  })

  describe('update', () => {
    it('should update topic', async () => {
      const mockUpdated = {
        id: 'topic-1',
        name: 'Updated Topic',
        level: 'B2',
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.topic.update).mockResolvedValue(mockUpdated as never)

      const result = await TopicRepository.update('topic-1', {
        name: 'Updated Topic',
        level: 'B2',
      })

      expect(result).toMatchObject(mockUpdated)
      expect(prisma.topic.update).toHaveBeenCalledWith({
        where: { id: 'topic-1' },
        data: {
          name: 'Updated Topic',
          level: 'B2',
        },
      })
    })
  })

  describe('delete', () => {
    it('should delete topic', async () => {
      const mockDeleted = { id: 'topic-1' }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.topic.delete).mockResolvedValue(mockDeleted as never)

      const result = await TopicRepository.delete('topic-1')

      expect(result).toMatchObject(mockDeleted)
    })
  })

  describe('findWithWords', () => {
    it('should find topics with nested words', async () => {
      const mockTopics = [
        {
          id: 'topic-1',
          name: 'Animals',
          level: 'A1',
          createdAt: new Date(),
          words: [
            {
              id: 'word-1',
              original: 'cat',
              translation: 'mèo',
              example: 'The cat sleeps.',
              pronunciation: 'kæt',
            },
            {
              id: 'word-2',
              original: 'dog',
              translation: 'chó',
              example: 'The dog barks.',
              pronunciation: 'dɔːɡ',
            },
          ],
        },
      ]

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.topic.findMany).mockResolvedValue(mockTopics as never)

      const result = await TopicRepository.findWithWords(100)

      expect(result).toHaveLength(1)
      expect(result[0].words).toHaveLength(2)
      expect(result[0].words[0].original).toBe('cat')
      expect(prisma.topic.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 100,
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
    })

    it('should respect custom limit', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.topic.findMany).mockResolvedValue([])

      await TopicRepository.findWithWords(50)

      expect(prisma.topic.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 50,
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
    })
  })
})
