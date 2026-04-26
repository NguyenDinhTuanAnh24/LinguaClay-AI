import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GrammarRepository } from '@/repositories/grammar.repository'

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    grammarPoint: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('GrammarRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('findQuizCandidates', () => {
    it('should find grammar points with examples', async () => {
      const mockGrammarPoints = [
        {
          id: 'gp-1',
          title: 'Present Simple',
          example: 'I eat',
          exampleSentence: 'I eat an apple every day.',
        },
        {
          id: 'gp-2',
          title: 'Past Tense',
          example: 'I ate',
          exampleSentence: 'I ate lunch yesterday.',
        },
      ]

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.grammarPoint.findMany).mockResolvedValue(mockGrammarPoints as never)

      const result = await GrammarRepository.findQuizCandidates()

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Present Simple')
      expect(prisma.grammarPoint.findMany).toHaveBeenCalledWith({
        where: { example: { not: '' } },
        select: {
          id: true,
          title: true,
          example: true,
          exampleSentence: true,
        },
      })
    })

    it('should return empty array when no candidates', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.grammarPoint.findMany).mockResolvedValue([])

      const result = await GrammarRepository.findQuizCandidates()

      expect(result).toEqual([])
    })
  })

  describe('listRows', () => {
    it('should list all grammar points with default limit', async () => {
      const mockGrammarPoints = [
        {
          id: 'gp-1',
          title: 'Present Simple',
          level: 'A1',
          structure: 'Subject + V',
        },
      ]

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.grammarPoint.findMany).mockResolvedValue(mockGrammarPoints as never)

      const result = await GrammarRepository.listRows()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Present Simple')
      expect(prisma.grammarPoint.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'desc' },
        take: 400,
        select: {
          id: true,
          title: true,
          level: true,
          structure: true,
        },
      })
    })

    it('should list grammar points with custom limit', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.grammarPoint.findMany).mockResolvedValue([])

      await GrammarRepository.listRows(50)

      expect(prisma.grammarPoint.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'desc' },
        take: 50,
        select: {
          id: true,
          title: true,
          level: true,
          structure: true,
        },
      })
    })
  })

  describe('findUnique', () => {
    it('should find grammar point by slug', async () => {
      const mockGrammar = {
        id: 'gp-1',
        slug: 'present-simple',
        title: 'Present Simple',
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.grammarPoint.findUnique).mockResolvedValue(mockGrammar as never)

      const result = await GrammarRepository.findUnique('present-simple')

      expect(result).toBe(mockGrammar)
      expect(prisma.grammarPoint.findUnique).toHaveBeenCalledWith({
        where: { slug: 'present-simple' },
      })
    })

    it('should return null when not found', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.grammarPoint.findUnique).mockResolvedValue(null)

      const result = await GrammarRepository.findUnique('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create grammar point with all fields', async () => {
      const mockGrammar = {
        id: 'new-gp-id',
        slug: 'past-tense',
        title: 'Past Tense',
        level: 'A2',
        structure: 'Subject + V-ed',
        explanation: 'Used for past actions',
        example: 'I walked',
        createdAt: new Date(),
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.grammarPoint.create).mockResolvedValue(mockGrammar as never)

      const result = await GrammarRepository.create({
        slug: 'past-tense',
        title: 'Past Tense',
        level: 'A2',
        structure: 'Subject + V-ed',
        explanation: 'Used for past actions',
        example: 'I walked',
      })

      expect(result).toMatchObject(mockGrammar)
      expect(prisma.grammarPoint.create).toHaveBeenCalledWith({
        data: {
          slug: 'past-tense',
          title: 'Past Tense',
          level: 'A2',
          structure: 'Subject + V-ed',
          explanation: 'Used for past actions',
          example: 'I walked',
        },
      })
    })

    it('should create grammar point with optional structure as null', async () => {
      const mockGrammar = {
        id: 'new-gp-id',
        slug: 'future-tense',
        title: 'Future Tense',
        level: 'B1',
        structure: null,
        explanation: 'Used for future actions',
        example: 'I will go',
        createdAt: new Date(),
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.grammarPoint.create).mockResolvedValue(mockGrammar as never)

      const result = await GrammarRepository.create({
        slug: 'future-tense',
        title: 'Future Tense',
        level: 'B1',
        explanation: 'Used for future actions',
        example: 'I will go',
      })

      expect(result).toMatchObject(mockGrammar)
      expect(prisma.grammarPoint.create).toHaveBeenCalledWith({
        data: {
          slug: 'future-tense',
          title: 'Future Tense',
          level: 'B1',
          structure: null,
          explanation: 'Used for future actions',
          example: 'I will go',
        },
      })
    })
  })

  describe('update', () => {
    it('should update grammar point', async () => {
      const mockUpdated = {
        id: 'gp-1',
        title: 'Updated Title',
        level: 'B2',
        structure: 'New structure',
        explanation: 'Updated explanation',
        example: 'Updated example',
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.grammarPoint.update).mockResolvedValue(mockUpdated as never)

      const result = await GrammarRepository.update('gp-1', {
        title: 'Updated Title',
        level: 'B2',
        structure: 'New structure',
        explanation: 'Updated explanation',
        example: 'Updated example',
      })

      expect(result).toMatchObject(mockUpdated)
      expect(prisma.grammarPoint.update).toHaveBeenCalledWith({
        where: { id: 'gp-1' },
        data: {
          title: 'Updated Title',
          level: 'B2',
          structure: 'New structure',
          explanation: 'Updated explanation',
          example: 'Updated example',
        },
      })
    })

    it('should handle partial updates', async () => {
      const mockUpdated = { id: 'gp-1', title: 'Just title' }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.grammarPoint.update).mockResolvedValue(mockUpdated as never)

      const result = await GrammarRepository.update('gp-1', {
        title: 'Just title',
        level: 'A1',
        explanation: 'expl',
        example: 'ex',
      })

      expect(result).toMatchObject(mockUpdated)
    })
  })

  describe('delete', () => {
    it('should delete grammar point', async () => {
      const mockDeleted = { id: 'gp-1' }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.grammarPoint.delete).mockResolvedValue(mockDeleted as never)

      const result = await GrammarRepository.delete('gp-1')

      expect(result).toMatchObject(mockDeleted)
      expect(prisma.grammarPoint.delete).toHaveBeenCalledWith({
        where: { id: 'gp-1' },
      })
    })
  })
})
