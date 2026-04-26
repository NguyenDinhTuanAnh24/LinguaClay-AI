import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  findUnique: vi.fn(),
  isAdminUser: vi.fn(),
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mocks.getUser,
    },
  })),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: mocks.findUnique,
    },
  },
}))

vi.mock('@/lib/admin', () => ({
  isAdminUser: mocks.isAdminUser,
}))

describe('ensureAdminActor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return null when user is missing', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { ensureAdminActor } = await import('@/lib/admin-auth')

    const result = await ensureAdminActor()

    expect(result).toBeNull()
    expect(mocks.isAdminUser).not.toHaveBeenCalled()
  })

  it('should return null when isAdminUser check fails', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'u@example.com' } } })
    mocks.isAdminUser.mockReturnValue(false)
    const { ensureAdminActor } = await import('@/lib/admin-auth')

    const result = await ensureAdminActor()

    expect(result).toBeNull()
    expect(mocks.findUnique).not.toHaveBeenCalled()
  })

  it('should return null when database actor is missing', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'admin@example.com' } } })
    mocks.isAdminUser.mockReturnValue(true)
    mocks.findUnique.mockResolvedValue(null)
    const { ensureAdminActor } = await import('@/lib/admin-auth')

    const result = await ensureAdminActor()

    expect(result).toBeNull()
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { id: 'u1' },
      select: { role: true },
    })
  })

  it('should return null when database role is not ADMIN', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'admin@example.com' } } })
    mocks.isAdminUser.mockReturnValue(true)
    mocks.findUnique.mockResolvedValue({ role: 'USER' })
    const { ensureAdminActor } = await import('@/lib/admin-auth')

    const result = await ensureAdminActor()

    expect(result).toBeNull()
  })

  it('should return user when role is ADMIN in database', async () => {
    const user = { id: 'u1', email: 'admin@example.com' }
    mocks.getUser.mockResolvedValue({ data: { user } })
    mocks.isAdminUser.mockReturnValue(true)
    mocks.findUnique.mockResolvedValue({ role: 'ADMIN' })
    const { ensureAdminActor } = await import('@/lib/admin-auth')

    const result = await ensureAdminActor()

    expect(result).toEqual(user)
  })

  it('should fallback to supabase admin check when db lookup throws', async () => {
    const user = { id: 'u1', email: 'admin@example.com' }
    mocks.getUser.mockResolvedValue({ data: { user } })
    mocks.isAdminUser.mockReturnValue(true)
    mocks.findUnique.mockRejectedValue(new Error('db unavailable'))
    const { ensureAdminActor } = await import('@/lib/admin-auth')

    const result = await ensureAdminActor()

    expect(result).toEqual(user)
  })
})
