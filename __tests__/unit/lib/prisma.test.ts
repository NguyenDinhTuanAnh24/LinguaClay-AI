import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  poolCtor: vi.fn(),
  prismaPgCtor: vi.fn(),
  prismaClientCtor: vi.fn(),
}))

vi.mock('pg', () => ({
  Pool: class MockPool {
    constructor(args: unknown) {
      mocks.poolCtor(args)
    }
  },
}))

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: class MockPrismaPg {
    constructor(pool: unknown) {
      mocks.prismaPgCtor(pool)
    }
  },
}))

vi.mock('@prisma/client', () => ({
  PrismaClient: class MockPrismaClient {
    constructor(args: unknown) {
      mocks.prismaClientCtor(args)
    }
  },
}))

vi.unmock('@/lib/prisma')

describe('lib/prisma', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    delete (globalThis as { prisma?: unknown }).prisma
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
  })

  it('should create prisma client when no global client exists', async () => {
    process.env.NODE_ENV = 'development'
    const mod = await import('@/lib/prisma')

    expect(mod.prisma).toBeDefined()
    expect(mocks.poolCtor).toHaveBeenCalledWith({
      connectionString: 'postgresql://user:pass@localhost:5432/db',
    })
    expect(mocks.prismaPgCtor).toHaveBeenCalledTimes(1)
    expect(mocks.prismaClientCtor).toHaveBeenCalledTimes(1)
  })

  it('should cache prisma client on global in non-production', async () => {
    process.env.NODE_ENV = 'development'
    const mod = await import('@/lib/prisma')

    expect((globalThis as { prisma?: unknown }).prisma).toBe(mod.prisma)
  })

  it('should reuse existing global prisma instance and skip constructors', async () => {
    process.env.NODE_ENV = 'development'
    const existing = { existing: true }
    ;(globalThis as { prisma?: unknown }).prisma = existing

    const mod = await import('@/lib/prisma')

    expect(mod.prisma).toBe(existing)
    expect(mocks.poolCtor).not.toHaveBeenCalled()
    expect(mocks.prismaPgCtor).not.toHaveBeenCalled()
    expect(mocks.prismaClientCtor).not.toHaveBeenCalled()
  })

  it('should not assign global prisma in production mode', async () => {
    process.env.NODE_ENV = 'production'
    const mod = await import('@/lib/prisma')

    expect(mod.prisma).toBeDefined()
    expect((globalThis as { prisma?: unknown }).prisma).toBeUndefined()
    expect(mocks.prismaClientCtor).toHaveBeenCalledTimes(1)
  })

  it('should still reuse existing global prisma in production when already present', async () => {
    process.env.NODE_ENV = 'production'
    const existing = { prod: true }
    ;(globalThis as { prisma?: unknown }).prisma = existing

    const mod = await import('@/lib/prisma')

    expect(mod.prisma).toBe(existing)
    expect(mocks.prismaClientCtor).not.toHaveBeenCalled()
  })
})
