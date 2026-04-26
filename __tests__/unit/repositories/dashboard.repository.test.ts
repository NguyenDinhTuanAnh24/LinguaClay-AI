import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardRepository } from '@/repositories/dashboard.repository'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    userProgress: {
      findFirst: vi.fn(),
    },
  },
}))

describe('DashboardRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('findRecentTopicForUser should return topic from latest reviewed progress', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.userProgress.findFirst).mockResolvedValue({
      word: {
        topic: {
          id: 'topic-1',
          name: 'Travel',
        },
      },
    } as never)

    const result = await DashboardRepository.findRecentTopicForUser('u-1')

    expect(result).toEqual({ id: 'topic-1', name: 'Travel' })
    expect(prisma.userProgress.findFirst).toHaveBeenCalledWith({
      where: {
        userId: 'u-1',
        lastReviewed: { not: null },
        word: { topicId: { not: null } },
      },
      orderBy: { lastReviewed: 'desc' },
      include: {
        word: {
          include: {
            topic: true,
          },
        },
      },
    })
  })

  it('findRecentTopicForUser should return null when no progress is found', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.userProgress.findFirst).mockResolvedValue(null)

    const result = await DashboardRepository.findRecentTopicForUser('u-2')

    expect(result).toBeNull()
  })
})
