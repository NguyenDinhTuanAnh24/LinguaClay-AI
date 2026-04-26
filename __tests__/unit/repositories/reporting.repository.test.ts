import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ReportingRepository } from '@/repositories/reporting.repository'

vi.mock('@/lib/admin', () => ({
  ADMIN_EMAILS: ['admin@example.com'],
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    order: {
      findMany: vi.fn(),
    },
    userProgress: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    grammarPoint: {
      count: vi.fn(),
    },
    exercise: {
      findMany: vi.fn(),
    },
    tutorListeningSession: {
      count: vi.fn(),
    },
    tutorReadingSession: {
      count: vi.fn(),
    },
    tutorSpeakingSession: {
      count: vi.fn(),
    },
    tutorEditorSession: {
      count: vi.fn(),
    },
  },
}))

describe('ReportingRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAdminOverviewRaw should aggregate all raw stats from prisma calls', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.user.count).mockResolvedValue(10)
    vi.mocked(prisma.order.findMany).mockResolvedValue([{ amount: 299000, planId: '3_MONTHS' }] as never)
    vi.mocked(prisma.userProgress.findMany)
      .mockResolvedValueOnce([{ userId: 'u-1' }] as never)
      .mockResolvedValueOnce([{ userId: 'u-1' }, { userId: 'u-2' }] as never)
    vi.mocked(prisma.user.findMany).mockResolvedValue([{ createdAt: new Date('2026-01-01T00:00:00.000Z') }] as never)
    vi.mocked(prisma.userProgress.count).mockResolvedValue(42)
    vi.mocked(prisma.grammarPoint.count).mockResolvedValue(100)
    vi.mocked(prisma.exercise.findMany).mockResolvedValue([{ grammarPointId: 'gp-1' }] as never)
    vi.mocked(prisma.tutorListeningSession.count).mockResolvedValue(7)
    vi.mocked(prisma.tutorReadingSession.count).mockResolvedValue(8)
    vi.mocked(prisma.tutorSpeakingSession.count).mockResolvedValue(9)
    vi.mocked(prisma.tutorEditorSession.count).mockResolvedValue(6)

    const result = await ReportingRepository.getAdminOverviewRaw({
      startAt: new Date('2026-01-01T00:00:00.000Z'),
      endAt: new Date('2026-01-31T23:59:59.999Z'),
      mauStart: new Date('2025-12-31T00:00:00.000Z'),
      todayStart: new Date('2026-01-31T00:00:00.000Z'),
      todayEnd: new Date('2026-01-31T23:59:59.999Z'),
    })

    expect(result).toEqual({
      newUsers: 10,
      successfulOrders: [{ amount: 299000, planId: '3_MONTHS' }],
      dauRows: [{ userId: 'u-1' }],
      mauRows: [{ userId: 'u-1' }, { userId: 'u-2' }],
      createdUsers: [{ createdAt: new Date('2026-01-01T00:00:00.000Z') }],
      flashcardsReviewedToday: 42,
      totalGrammarPoints: 100,
      completedGrammarRows: [{ grammarPointId: 'gp-1' }],
      tutorListeningTotal: 7,
      tutorReadingTotal: 8,
      tutorSpeakingTotal: 9,
      tutorWritingTotal: 6,
    })
    expect(prisma.user.count).toHaveBeenCalledTimes(1)
    expect(prisma.order.findMany).toHaveBeenCalledTimes(1)
    expect(prisma.userProgress.findMany).toHaveBeenCalledTimes(2)
    expect(prisma.user.findMany).toHaveBeenCalledTimes(1)
    expect(prisma.tutorEditorSession.count).toHaveBeenCalledTimes(1)
  })
})
