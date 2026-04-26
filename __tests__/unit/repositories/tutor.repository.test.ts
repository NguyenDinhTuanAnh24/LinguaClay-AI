import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TutorRepository } from '@/repositories/tutor.repository'

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    tutorListeningSession: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    tutorReadingSession: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    tutorSpeakingSession: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    tutorEditorSession: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    tutorRoleplayTurn: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    tutorFreeTalkSession: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('TutorRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Listening Sessions', () => {
    it('should find listening sessions by user', async () => {
      const mockSessions = [
        {
          id: '1',
          title: 'Test Listening',
          levelTarget: 'A2',
          topicHint: null,
          score: 85,
          totalQuestions: 8,
          createdAt: new Date(),
        },
      ]

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.tutorListeningSession.findMany).mockResolvedValue(mockSessions as never)

      const result = await TutorRepository.findListeningSessionsByUser('user-123', 10)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
      expect(prisma.tutorListeningSession.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          levelTarget: true,
          topicHint: true,
          score: true,
          totalQuestions: true,
          createdAt: true,
        },
      })
    })

    it('should create listening session', async () => {
      const mockSession = {
        id: 'new-session-id',
        userId: 'user-123',
        title: 'New Session',
        levelTarget: 'B1',
        topicHint: null,
        transcriptEn: 'Test transcript',
        questions: [],
        blanks: [],
        userAnswers: {},
        blankAnswers: {},
        score: 90,
        totalQuestions: 8,
        feedbackVi: 'Great!',
        wrongItems: [],
        createdAt: new Date(),
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.tutorListeningSession.create).mockResolvedValue(mockSession as never)

      const result = await TutorRepository.createListeningSession({
        userId: 'user-123',
        title: 'New Session',
        levelTarget: 'B1',
        topicHint: null,
        transcriptEn: 'Test transcript',
        questions: [],
        blanks: [],
        userAnswers: {},
        blankAnswers: {},
        score: 90,
        totalQuestions: 8,
        feedbackVi: 'Great!',
        wrongItems: [],
      })

      expect(result).toMatchObject(mockSession)
    })

    it('should count listening sessions for user', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.tutorListeningSession.count).mockResolvedValue(5)

      const result = await TutorRepository.countListeningSessions('user-123')

      expect(result).toBe(5)
      expect(prisma.tutorListeningSession.count).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      })
    })

    it('should delete listening session', async () => {
      const mockDeleted = { id: '1', userId: 'user-123' }
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.tutorListeningSession.delete).mockResolvedValue(mockDeleted as never)

      const result = await TutorRepository.deleteListeningSession('1', 'user-123')

      expect(result).toMatchObject(mockDeleted)
    })
  })

  describe('Reading Sessions', () => {
    it('should find reading sessions by user', async () => {
      const mockSessions = [
        {
          id: '2',
          title: 'Test Reading',
          levelTarget: 'B2',
          topicHint: 'Technology',
          score: 75,
          totalQuestions: 8,
          createdAt: new Date(),
        },
      ]

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.tutorReadingSession.findMany).mockResolvedValue(mockSessions as never)

      const result = await TutorRepository.findReadingSessionsByUser('user-123', 10)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })

    it('should create reading session', async () => {
      const mockSession = {
        id: 'new-reading-id',
        userId: 'user-123',
        title: 'New Reading',
        levelTarget: 'B1',
        topicHint: null,
        passageEn: 'Test passage',
        questions: [],
        blanks: [],
        userAnswers: {},
        blankAnswers: {},
        score: 85,
        totalQuestions: 8,
        feedbackVi: 'Good!',
        wrongItems: [],
        createdAt: new Date(),
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.tutorReadingSession.create).mockResolvedValue(mockSession as never)

      const result = await TutorRepository.createReadingSession({
        userId: 'user-123',
        title: 'New Reading',
        levelTarget: 'B1',
        topicHint: null,
        passageEn: 'Test passage',
        questions: [],
        blanks: [],
        userAnswers: {},
        blankAnswers: {},
        score: 85,
        totalQuestions: 8,
        feedbackVi: 'Good!',
        wrongItems: [],
      })

      expect(result).toMatchObject(mockSession)
    })

    it('should count reading sessions for user', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.tutorReadingSession.count).mockResolvedValue(3)

      const result = await TutorRepository.countReadingSessions('user-123')

      expect(result).toBe(3)
    })
  })

  describe('Speaking Sessions', () => {
    it('should find speaking sessions by user', async () => {
      const mockSessions = [
        {
          id: '3',
          title: 'Test Speaking',
          levelTarget: 'A2',
          topicHint: 'Daily Life',
          score: 80,
          createdAt: new Date(),
        },
      ]

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.tutorSpeakingSession.findMany).mockResolvedValue(mockSessions as never)

      const result = await TutorRepository.findSpeakingSessionsByUser('user-123', 10)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('3')
    })

    it('should create speaking session', async () => {
      const mockSession = {
        id: 'new-speaking-id',
        userId: 'user-123',
        title: 'New Speaking',
        levelTarget: 'B1',
        topicHint: null,
        promptData: { title: 'Topic', introVi: 'Intro', questions: [] },
        userAnswers: [],
        score: 88,
        feedbackVi: 'Nice!',
        criteria: { fluency: 85, vocabulary: 80, grammar: 90, pronunciation: 75 },
        improvements: [],
        createdAt: new Date(),
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.tutorSpeakingSession.create).mockResolvedValue(mockSession as never)

      const result = await TutorRepository.createSpeakingSession({
        userId: 'user-123',
        title: 'New Speaking',
        levelTarget: 'B1',
        topicHint: null,
        promptData: { title: 'Topic', introVi: 'Intro', questions: ['Q1'] },
        userAnswers: ['A1'],
        score: 88,
        feedbackVi: 'Nice!',
        criteria: { fluency: 85, vocabulary: 80, grammar: 90, pronunciation: 75 },
        improvements: [],
      })

      expect(result).toMatchObject(mockSession)
    })

    it('should count speaking sessions for user', async () => {
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.tutorSpeakingSession.count).mockResolvedValue(2)

      const result = await TutorRepository.countSpeakingSessions('user-123')

      expect(result).toBe(2)
    })
  })

  describe('Aggregate Statistics', () => {
    it('should get user tutor stats', async () => {
      const { prisma } = await import('@/lib/prisma')

      // Direct mock assignment
      prisma.tutorListeningSession.count = vi.fn().mockResolvedValue(5) as any
      prisma.tutorReadingSession.count = vi.fn().mockResolvedValue(3) as any
      prisma.tutorSpeakingSession.count = vi.fn().mockResolvedValue(2) as any
      prisma.tutorEditorSession.count = vi.fn().mockResolvedValue(1) as any
      prisma.tutorRoleplayTurn.count = vi.fn().mockResolvedValue(4) as any
      prisma.tutorFreeTalkSession.count = vi.fn().mockResolvedValue(6) as any

      prisma.tutorListeningSession.findMany = vi.fn().mockResolvedValue([
        { score: 80 }, { score: 90 },
      ]) as any
      prisma.tutorReadingSession.findMany = vi.fn().mockResolvedValue([
        { score: 75 }, { score: 85 }, { score: 95 },
      ]) as any
      prisma.tutorSpeakingSession.findMany = vi.fn().mockResolvedValue([
        { score: 70 }, { score: 80 },
      ]) as any

      const result = await TutorRepository.getUserTutorStats('user-123')

      expect(result).toEqual({
        totalSessions: 21, // 5+3+2+1+4+6
        listeningCount: 5,
        readingCount: 3,
        speakingCount: 2,
        editorCount: 1,
        roleplayCount: 4,
        freeTalkCount: 6,
        averageScores: {
          listening: 85, // (80+90)/2
          reading: 85, // (75+85+95)/3 = 85
          speaking: 75, // (70+80)/2 = 75
        },
      })
    })

    it('should get recent sessions', async () => {
      const { prisma } = await import('@/lib/prisma')

      vi.mocked(prisma.tutorListeningSession.findMany).mockResolvedValue([
        {
          id: '1',
          title: 'Listening 1',
          levelTarget: 'A2',
          score: 80,
          type: { name: 'listening' },
          createdAt: '2025-04-26T10:00:00Z',
        },
      ])
      vi.mocked(prisma.tutorReadingSession.findMany).mockResolvedValue([
        {
          id: '2',
          title: 'Reading 1',
          levelTarget: 'B1',
          score: 85,
          type: { name: 'reading' },
          createdAt: '2025-04-26T09:00:00Z',
        },
      ])
      vi.mocked(prisma.tutorSpeakingSession.findMany).mockResolvedValue([
        {
          id: '3',
          title: 'Speaking 1',
          levelTarget: 'A2',
          score: 90,
          type: { name: 'speaking' },
          createdAt: '2025-04-26T11:00:00Z',
        },
      ])

      const result = await TutorRepository.getRecentSessions('user-123', 5)

      expect(result).toHaveLength(3)
      // Should be sorted by createdAt desc (most recent first)
      expect(result[0].id).toBe('3') // 11:00
      expect(result[1].id).toBe('1') // 10:00
      expect(result[2].id).toBe('2') // 09:00
    })
  })
})
