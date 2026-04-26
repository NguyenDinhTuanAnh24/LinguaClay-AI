import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StudyTimeRepository } from '@/repositories/study-time.repository'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    userDailyStudy: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))

describe('StudyTimeRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('findDailyActiveSeconds should query by composite key', async () => {
    const { prisma } = await import('@/lib/prisma')
    const date = new Date('2026-04-26T00:00:00.000Z')
    vi.mocked(prisma.userDailyStudy.findUnique).mockResolvedValue({ activeSeconds: 1200 } as never)

    await StudyTimeRepository.findDailyActiveSeconds('u-1', date)

    expect(prisma.userDailyStudy.findUnique).toHaveBeenCalledWith({
      where: {
        userId_date: {
          userId: 'u-1',
          date,
        },
      },
      select: {
        activeSeconds: true,
      },
    })
  })

  it('upsertDailyActiveSeconds should increment existing daily row', async () => {
    const { prisma } = await import('@/lib/prisma')
    const date = new Date('2026-04-26T00:00:00.000Z')
    const now = new Date('2026-04-26T10:00:00.000Z')
    vi.mocked(prisma.userDailyStudy.upsert).mockResolvedValue({ activeSeconds: 1500 } as never)

    await StudyTimeRepository.upsertDailyActiveSeconds({
      userId: 'u-1',
      date,
      incrementBy: 300,
      now,
    })

    expect(prisma.userDailyStudy.upsert).toHaveBeenCalledWith({
      where: {
        userId_date: {
          userId: 'u-1',
          date,
        },
      },
      update: {
        activeSeconds: { increment: 300 },
        lastActiveAt: now,
      },
      create: {
        userId: 'u-1',
        date,
        activeSeconds: 300,
        lastActiveAt: now,
      },
      select: {
        activeSeconds: true,
      },
    })
  })
})
