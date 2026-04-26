import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WordRepository } from '@/repositories/word.repository'

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    word: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

describe('WordRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listRows', () => {
    it('should list all words with default limit', async () => {
      const mockWords = [
        {
          id: '1',
          original: 'hello',
          pronunciation: 'həˈloʊ',
          translation: 'xin chào',
          partOfSpeech: 'interjection',
          example: 'Hello, how are you?',
          difficulty: 1,
          topicId: 'topic-1',
          createdAt: new Date(),
        },
      ]

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.word.findMany).mockResolvedValue(mockWords as never)

      const result = await WordRepository.listRows()

      expect(result).toHaveLength(1)
      expect(result[0].original).toBe('hello')
      expect(prisma.word.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: 200,
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
    })

    it('should list words with topic filter', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.word.findMany).mockResolvedValue([])

      await WordRepository.listRows(100, 'topic-123')

      expect(prisma.word.findMany).toHaveBeenCalledWith({
        where: { topicId: 'topic-123' },
        orderBy: { createdAt: 'desc' },
        take: 100,
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
    })
  })

  describe('findUnique', () => {
    it('should find word by id', async () => {
      const mockWord = {
        id: 'word-1',
        original: 'goodbye',
        translation: 'tạm biệt',
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.word.findUnique).mockResolvedValue(mockWord as never)

      const result = await WordRepository.findUnique('word-1')

      expect(result).toBe(mockWord)
      expect(prisma.word.findUnique).toHaveBeenCalledWith({
        where: { id: 'word-1' },
      })
    })

    it('should return null when word not found', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.word.findUnique).mockResolvedValue(null)

      const result = await WordRepository.findUnique('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('findByTopic', () => {
    it('should find words by topic id', async () => {
      const mockWords = [
        {
          id: '1',
          original: 'apple',
          translation: 'táo',
          partOfSpeech: 'noun',
          example: 'I eat an apple.',
          exampleTranslation: 'Tôi ăn một quả táo.',
          audioUrl: 'https://example.com/apple.mp3',
          difficulty: 1,
        },
      ]

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.word.findMany).mockResolvedValue(mockWords as never)

      const result = await WordRepository.findByTopic('topic-1', 50)

      expect(result).toHaveLength(1)
      expect(result[0].original).toBe('apple')
      expect(result[0].exampleTranslation).toBe('Tôi ăn một quả táo.')
      expect(prisma.word.findMany).toHaveBeenCalledWith({
        where: { topicId: 'topic-1' },
        orderBy: { createdAt: 'asc' },
        take: 50,
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
    })
  })

  describe('create', () => {
    it('should create new word', async () => {
      const mockWord = {
        id: 'new-word-id',
        original: 'test',
        pronunciation: 'tɛst',
        translation: 'thử nghiệm',
        partOfSpeech: 'noun',
        example: 'This is a test.',
        exampleTranslation: 'Đây là một bài test.',
        audioUrl: 'https://example.com/test.mp3',
        difficulty: 2,
        topicId: 'topic-1',
        createdAt: new Date(),
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.word.create).mockResolvedValue(mockWord as never)

      const result = await WordRepository.create({
        original: 'test',
        pronunciation: 'tɛst',
        translation: 'thử nghiệm',
        partOfSpeech: 'noun',
        example: 'This is a test.',
        exampleTranslation: 'Đây là một bài test.',
        audioUrl: 'https://example.com/test.mp3',
        difficulty: 2,
        topicId: 'topic-1',
      })

      expect(result).toMatchObject(mockWord)
      expect(prisma.word.create).toHaveBeenCalledWith({
        data: {
          original: 'test',
          pronunciation: 'tɛst',
          translation: 'thử nghiệm',
          partOfSpeech: 'noun',
          example: 'This is a test.',
          exampleTranslation: 'Đây là một bài test.',
          audioUrl: 'https://example.com/test.mp3',
          difficulty: 2,
          topicId: 'topic-1',
        },
      })
    })

    it('should create word with optional fields as null', async () => {
      const mockWord = {
        id: 'new-word-id',
        original: 'simple',
        translation: 'đơn giản',
        partOfSpeech: null,
        example: null,
        exampleTranslation: null,
        audioUrl: null,
        difficulty: 1,
        topicId: null,
        createdAt: new Date(),
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.word.create).mockResolvedValue(mockWord as never)

      const result = await WordRepository.create({
        original: 'simple',
        translation: 'đơn giản',
      })

      expect(result).toMatchObject(mockWord)
    })
  })

  describe('update', () => {
    it('should update word', async () => {
      const mockUpdated = {
        id: 'word-1',
        original: 'updated',
        translation: 'đã cập nhật',
        difficulty: 3,
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.word.update).mockResolvedValue(mockUpdated as never)

      const result = await WordRepository.update('word-1', {
        original: 'updated',
        translation: 'đã cập nhật',
        difficulty: 3,
      })

      expect(result).toMatchObject(mockUpdated)
      expect(prisma.word.update).toHaveBeenCalledWith({
        where: { id: 'word-1' },
        data: {
          original: 'updated',
          translation: 'đã cập nhật',
          difficulty: 3,
        },
      })
    })

    it('should handle partial updates', async () => {
      const mockUpdated = { id: 'word-1', original: 'new' }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.word.update).mockResolvedValue(mockUpdated as never)

      const result = await WordRepository.update('word-1', {
        original: 'new',
      })

      expect(result).toMatchObject(mockUpdated)
    })
  })

  describe('delete', () => {
    it('should delete word', async () => {
      const mockDeleted = { id: 'word-1' }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.word.delete).mockResolvedValue(mockDeleted as never)

      const result = await WordRepository.delete('word-1')

      expect(result).toMatchObject(mockDeleted)
    })
  })

  describe('deleteByTopic', () => {
    it('should delete all words by topic', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.word.deleteMany).mockResolvedValue({ deleted: 5 } as any)

      const result = await WordRepository.deleteByTopic('topic-1')

      expect(prisma.word.deleteMany).toHaveBeenCalledWith({
        where: { topicId: 'topic-1' },
      })
    })
  })

  describe('count', () => {
    it('should count all words', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.word.count).mockResolvedValue(100)

      const result = await WordRepository.count()

      expect(result).toBe(100)
      expect(prisma.word.count).toHaveBeenCalledWith({ where: {} })
    })

    it('should count words by topic', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.word.count).mockResolvedValue(25)

      const result = await WordRepository.count('topic-1')

      expect(result).toBe(25)
      expect(prisma.word.count).toHaveBeenCalledWith({
        where: { topicId: 'topic-1' },
      })
    })
  })

  describe('findWithTopic', () => {
    it('should find words with topic relationship', async () => {
      const mockWords = [
        {
          id: '1',
          original: 'cat',
          translation: 'mèo',
          partOfSpeech: 'noun',
          example: 'The cat sleeps.',
          difficulty: 1,
          topicId: 'topic-1',
          createdAt: new Date(),
          topic: {
            id: 'topic-1',
            name: 'Animals',
            slug: 'animals',
            level: 'A1',
          },
        },
      ]

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.word.findMany).mockResolvedValue(mockWords as never)

      const result = await WordRepository.findWithTopic(50)

      expect(result).toHaveLength(1)
      expect(result[0].topic).toBeDefined()
      expect(result[0].topic?.name).toBe('Animals')
      expect(prisma.word.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 50,
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
    })
  })
})
