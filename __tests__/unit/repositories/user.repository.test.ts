import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserRole } from '@prisma/client'
import { UserRepository } from '@/repositories/user.repository'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}))

describe('UserRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('findById should query user by id', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u-1' } as never)

    await UserRepository.findById('u-1')

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'u-1' },
    })
  })

  it('findByEmail should query user by email', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u-1' } as never)

    await UserRepository.findByEmail('test@example.com')

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    })
  })

  it('update should call prisma user update', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.user.update).mockResolvedValue({ id: 'u-1' } as never)

    await UserRepository.update('u-1', { name: 'Updated Name' })

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u-1' },
      data: { name: 'Updated Name' },
    })
  })

  it('upsertFromAuth should apply defaults for optional fields', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: 'u-1' } as never)

    await UserRepository.upsertFromAuth({
      id: 'u-1',
      email: 'test@example.com',
    })

    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { id: 'u-1' },
      update: { email: 'test@example.com' },
      create: {
        id: 'u-1',
        email: 'test@example.com',
        role: UserRole.USER,
        name: null,
        image: null,
        targetLanguage: 'EN',
        proficiencyLevel: 'A1',
      },
    })
  })

  it('upsertFromAuth should include role in update when provided', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: 'u-2' } as never)

    await UserRepository.upsertFromAuth({
      id: 'u-2',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      name: 'Admin',
      image: 'avatar.png',
      targetLanguage: 'JP',
      proficiencyLevel: 'B1',
    })

    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { id: 'u-2' },
      update: {
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      },
      create: {
        id: 'u-2',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        name: 'Admin',
        image: 'avatar.png',
        targetLanguage: 'JP',
        proficiencyLevel: 'B1',
      },
    })
  })

  it('countAll should pass where filter', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.user.count).mockResolvedValue(3)

    const result = await UserRepository.countAll({ isPro: true })

    expect(result).toBe(3)
    expect(prisma.user.count).toHaveBeenCalledWith({ where: { isPro: true } })
  })

  it('findProfileById should select profile fields', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u-1' } as never)

    await UserRepository.findProfileById('u-1')

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'u-1' },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        targetLanguage: true,
        proficiencyLevel: true,
        isPro: true,
        proType: true,
        proStartDate: true,
        proEndDate: true,
        phoneNumber: true,
        birthday: true,
        createdAt: true,
        updatedAt: true,
        themePreference: true,
      },
    })
  })

  it('findBasicIdentityById should select basic identity fields', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u-1' } as never)

    await UserRepository.findBasicIdentityById('u-1')

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'u-1' },
      select: { id: true, name: true, email: true },
    })
  })

  it('findLatestRefundRequestByOrderId should return latest row when available', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      { id: 'r-1', status: 'PENDING', createdAt: new Date('2026-04-01T00:00:00.000Z') },
    ] as never)

    const result = await UserRepository.findLatestRefundRequestByOrderId('o-1')

    expect(result).toEqual({
      id: 'r-1',
      status: 'PENDING',
      createdAt: new Date('2026-04-01T00:00:00.000Z'),
    })
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1)
  })

  it('findLatestRefundRequestByOrderId should return null when no rows', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.$queryRaw).mockResolvedValue([] as never)

    const result = await UserRepository.findLatestRefundRequestByOrderId('o-2')

    expect(result).toBeNull()
  })
})
