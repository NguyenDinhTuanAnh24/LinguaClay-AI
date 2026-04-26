import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TutorRepository } from '@/repositories/tutor.repository'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    tutorEditorSession: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    tutorListeningSession: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    tutorReadingSession: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    tutorSpeakingSession: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    tutorRoleplayTurn: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    tutorFreeTalkSession: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('TutorRepository additional coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create and list editor sessions', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.tutorEditorSession.create).mockResolvedValue({ id: 'ed-1' } as never)
    vi.mocked(prisma.tutorEditorSession.findMany).mockResolvedValue([{ id: 'ed-1' }] as never)

    await TutorRepository.createEditorSession({
      userId: 'u-1',
      inputText: 'text',
      annotatedText: 'annotated',
      shortFeedbackVi: 'feedback',
      notes: [],
    })
    await TutorRepository.findEditorSessionsByUser('u-1', 10)

    expect(prisma.tutorEditorSession.create).toHaveBeenCalledWith({
      data: {
        userId: 'u-1',
        inputText: 'text',
        annotatedText: 'annotated',
        shortFeedbackVi: 'feedback',
        notes: [],
      },
    })
    expect(prisma.tutorEditorSession.findMany).toHaveBeenCalledWith({
      where: { userId: 'u-1' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        inputText: true,
        shortFeedbackVi: true,
        createdAt: true,
      },
    })
  })

  it('should find and delete editor session with optional user filter', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.tutorEditorSession.findUnique).mockResolvedValue({ id: 'ed-1' } as never)
    vi.mocked(prisma.tutorEditorSession.delete).mockResolvedValue({ id: 'ed-1' } as never)

    await TutorRepository.findEditorSessionById('ed-1', 'u-1')
    await TutorRepository.deleteEditorSession('ed-1')

    expect(prisma.tutorEditorSession.findUnique).toHaveBeenCalledWith({ where: { id: 'ed-1', userId: 'u-1' } })
    expect(prisma.tutorEditorSession.delete).toHaveBeenCalledWith({ where: { id: 'ed-1' } })
  })

  it('should query listening session by id with details and update partial fields', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.tutorListeningSession.findUnique).mockResolvedValue({ id: 'l-1' } as never)
    vi.mocked(prisma.tutorListeningSession.update).mockResolvedValue({ id: 'l-1' } as never)
    vi.mocked(prisma.tutorListeningSession.delete).mockResolvedValue({ id: 'l-1' } as never)

    await TutorRepository.findListeningSessionById('l-1')
    await TutorRepository.findListeningSessionWithDetails('l-1', 'u-1')
    await TutorRepository.updateListeningSession('l-1', { feedbackVi: 'new feedback' })
    await TutorRepository.deleteListeningSession('l-1', 'u-1')

    expect(prisma.tutorListeningSession.findUnique).toHaveBeenNthCalledWith(1, { where: { id: 'l-1' } })
    expect(prisma.tutorListeningSession.findUnique).toHaveBeenNthCalledWith(2, {
      where: { id: 'l-1', userId: 'u-1' },
      select: {
        id: true,
        title: true,
        levelTarget: true,
        topicHint: true,
        transcriptEn: true,
        questions: true,
        blanks: true,
        userAnswers: true,
        blankAnswers: true,
        score: true,
        totalQuestions: true,
        feedbackVi: true,
        wrongItems: true,
        createdAt: true,
      },
    })
    expect(prisma.tutorListeningSession.update).toHaveBeenCalledWith({
      where: { id: 'l-1' },
      data: {
        feedbackVi: 'new feedback',
      },
    })
    expect(prisma.tutorListeningSession.delete).toHaveBeenCalledWith({
      where: { id: 'l-1', userId: 'u-1' },
    })
  })

  it('should query reading session by id with details and update partial fields', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.tutorReadingSession.findUnique).mockResolvedValue({ id: 'r-1' } as never)
    vi.mocked(prisma.tutorReadingSession.update).mockResolvedValue({ id: 'r-1' } as never)
    vi.mocked(prisma.tutorReadingSession.delete).mockResolvedValue({ id: 'r-1' } as never)

    await TutorRepository.findReadingSessionById('r-1', 'u-1')
    await TutorRepository.findReadingSessionWithDetails('r-1')
    await TutorRepository.updateReadingSession('r-1', { score: 90, wrongItems: [{ id: 1 }] })
    await TutorRepository.deleteReadingSession('r-1')

    expect(prisma.tutorReadingSession.findUnique).toHaveBeenNthCalledWith(1, { where: { id: 'r-1', userId: 'u-1' } })
    expect(prisma.tutorReadingSession.findUnique).toHaveBeenNthCalledWith(2, {
      where: { id: 'r-1' },
      select: {
        id: true,
        title: true,
        levelTarget: true,
        topicHint: true,
        passageEn: true,
        questions: true,
        blanks: true,
        userAnswers: true,
        blankAnswers: true,
        score: true,
        totalQuestions: true,
        feedbackVi: true,
        wrongItems: true,
        createdAt: true,
      },
    })
    expect(prisma.tutorReadingSession.update).toHaveBeenCalledWith({
      where: { id: 'r-1' },
      data: {
        score: 90,
        wrongItems: [{ id: 1 }],
      },
    })
    expect(prisma.tutorReadingSession.delete).toHaveBeenCalledWith({ where: { id: 'r-1' } })
  })

  it('should query speaking session by id with details and update partial fields', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.tutorSpeakingSession.findUnique).mockResolvedValue({ id: 's-1' } as never)
    vi.mocked(prisma.tutorSpeakingSession.update).mockResolvedValue({ id: 's-1' } as never)
    vi.mocked(prisma.tutorSpeakingSession.delete).mockResolvedValue({ id: 's-1' } as never)

    await TutorRepository.findSpeakingSessionById('s-1')
    await TutorRepository.findSpeakingSessionWithDetails('s-1', 'u-1')
    await TutorRepository.updateSpeakingSession('s-1', { criteria: { fluency: 88 } })
    await TutorRepository.deleteSpeakingSession('s-1', 'u-1')

    expect(prisma.tutorSpeakingSession.findUnique).toHaveBeenNthCalledWith(1, { where: { id: 's-1' } })
    expect(prisma.tutorSpeakingSession.findUnique).toHaveBeenNthCalledWith(2, {
      where: { id: 's-1', userId: 'u-1' },
      select: {
        id: true,
        title: true,
        levelTarget: true,
        topicHint: true,
        promptData: true,
        userAnswers: true,
        score: true,
        feedbackVi: true,
        criteria: true,
        improvements: true,
        createdAt: true,
      },
    })
    expect(prisma.tutorSpeakingSession.update).toHaveBeenCalledWith({
      where: { id: 's-1' },
      data: {
        criteria: { fluency: 88 },
      },
    })
    expect(prisma.tutorSpeakingSession.delete).toHaveBeenCalledWith({
      where: { id: 's-1', userId: 'u-1' },
    })
  })

  it('should create/list/find/delete roleplay turns with null fallbacks', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.tutorRoleplayTurn.create).mockResolvedValue({ id: 'rp-1' } as never)
    vi.mocked(prisma.tutorRoleplayTurn.findMany).mockResolvedValue([{ id: 'rp-1' }] as never)
    vi.mocked(prisma.tutorRoleplayTurn.findUnique).mockResolvedValue({ id: 'rp-1' } as never)
    vi.mocked(prisma.tutorRoleplayTurn.delete).mockResolvedValue({ id: 'rp-1' } as never)

    await TutorRepository.createRoleplayTurn({
      userId: 'u-1',
      scenarioTitle: 'At airport',
      turnCount: 2,
      targetWords: ['ticket', 'boarding'],
    })
    await TutorRepository.findRoleplayTurnsByUser('u-1')
    await TutorRepository.findRoleplayTurnById('rp-1', 'u-1')
    await TutorRepository.deleteRoleplayTurn('rp-1')

    expect(prisma.tutorRoleplayTurn.create).toHaveBeenCalledWith({
      data: {
        userId: 'u-1',
        scenarioTitle: 'At airport',
        turnCount: 2,
        targetWords: ['ticket', 'boarding'],
        history: undefined,
        userMessage: null,
        aiReply: null,
        reminderVi: null,
        wrapUpEn: null,
        wrapUpVi: null,
      },
    })
    expect(prisma.tutorRoleplayTurn.findMany).toHaveBeenCalledWith({
      where: { userId: 'u-1' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        scenarioTitle: true,
        turnCount: true,
        targetWords: true,
        createdAt: true,
      },
    })
    expect(prisma.tutorRoleplayTurn.findUnique).toHaveBeenCalledWith({
      where: { id: 'rp-1', userId: 'u-1' },
    })
    expect(prisma.tutorRoleplayTurn.delete).toHaveBeenCalledWith({
      where: { id: 'rp-1' },
    })
  })

  it('should create/list/find/delete free talk sessions', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.tutorFreeTalkSession.create).mockResolvedValue({ id: 'ft-1' } as never)
    vi.mocked(prisma.tutorFreeTalkSession.findMany).mockResolvedValue([{ id: 'ft-1' }] as never)
    vi.mocked(prisma.tutorFreeTalkSession.findUnique).mockResolvedValue({ id: 'ft-1' } as never)
    vi.mocked(prisma.tutorFreeTalkSession.delete).mockResolvedValue({ id: 'ft-1' } as never)

    await TutorRepository.createFreeTalkSession({
      userId: 'u-1',
      question: 'How are you?',
      answerEn: 'I am fine',
      exampleEn: 'I am fine today.',
      explainVi: 'Cau tra loi co ban',
    })
    await TutorRepository.findFreeTalkSessionsByUser('u-1', 5)
    await TutorRepository.findFreeTalkSessionById('ft-1')
    await TutorRepository.deleteFreeTalkSession('ft-1', 'u-1')

    expect(prisma.tutorFreeTalkSession.create).toHaveBeenCalledWith({
      data: {
        userId: 'u-1',
        question: 'How are you?',
        answerEn: 'I am fine',
        exampleEn: 'I am fine today.',
        explainVi: 'Cau tra loi co ban',
      },
    })
    expect(prisma.tutorFreeTalkSession.findMany).toHaveBeenCalledWith({
      where: { userId: 'u-1' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        question: true,
        answerEn: true,
        createdAt: true,
      },
    })
    expect(prisma.tutorFreeTalkSession.findUnique).toHaveBeenCalledWith({
      where: { id: 'ft-1' },
    })
    expect(prisma.tutorFreeTalkSession.delete).toHaveBeenCalledWith({
      where: { id: 'ft-1', userId: 'u-1' },
    })
  })
})
