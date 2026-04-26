import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const warnMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/logger', () => ({
  logger: {
    warn: warnMock,
  },
}))

describe('admin utils', () => {
  const previousAdminEmail = process.env.ADMIN_EMAIL
  const previousNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    vi.resetModules()
    warnMock.mockReset()
  })

  afterEach(() => {
    process.env.ADMIN_EMAIL = previousAdminEmail
    process.env.NODE_ENV = previousNodeEnv
  })

  it('should warn when ADMIN_EMAIL is missing outside test env', async () => {
    process.env.ADMIN_EMAIL = ''
    process.env.NODE_ENV = 'development'
    await import('@/lib/admin')

    expect(warnMock).toHaveBeenCalledTimes(1)
  })

  it('should not warn when NODE_ENV is test', async () => {
    process.env.ADMIN_EMAIL = ''
    process.env.NODE_ENV = 'test'
    await import('@/lib/admin')

    expect(warnMock).not.toHaveBeenCalled()
  })

  it('isAdminEmail should match configured admin email case-insensitively', async () => {
    process.env.ADMIN_EMAIL = 'Admin@Example.com'
    process.env.NODE_ENV = 'test'
    const { ADMIN_EMAILS, isAdminEmail } = await import('@/lib/admin')

    expect(ADMIN_EMAILS).toEqual(['admin@example.com'])
    expect(isAdminEmail('admin@example.com')).toBe(true)
    expect(isAdminEmail('ADMIN@example.com')).toBe(true)
    expect(isAdminEmail('other@example.com')).toBe(false)
  })

  it('getUserRole should prefer app_metadata then user_metadata', async () => {
    process.env.ADMIN_EMAIL = 'admin@example.com'
    process.env.NODE_ENV = 'test'
    const { getUserRole } = await import('@/lib/admin')

    expect(getUserRole({ app_metadata: { role: 'ADMIN' }, user_metadata: { role: 'USER' } })).toBe('ADMIN')
    expect(getUserRole({ app_metadata: {}, user_metadata: { role: 'MOD' } })).toBe('MOD')
    expect(getUserRole(null)).toBeNull()
  })

  it('isAdminUser should require admin email and accept admin role or missing role', async () => {
    process.env.ADMIN_EMAIL = 'admin@example.com'
    process.env.NODE_ENV = 'test'
    const { isAdminUser } = await import('@/lib/admin')

    expect(isAdminUser({ email: 'admin@example.com' })).toBe(true)
    expect(isAdminUser({ email: 'admin@example.com', app_metadata: { role: 'ADMIN' } })).toBe(true)
    expect(isAdminUser({ email: 'admin@example.com', app_metadata: { role: 'admin' } })).toBe(true)
    expect(isAdminUser({ email: 'admin@example.com', app_metadata: { role: 'USER' } })).toBe(false)
    expect(isAdminUser({ email: 'user@example.com', app_metadata: { role: 'ADMIN' } })).toBe(false)
  })
})
