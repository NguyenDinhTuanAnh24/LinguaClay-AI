import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  executeRaw: vi.fn(),
  upsert: vi.fn(),
  create: vi.fn(),
  updateMany: vi.fn(),
  count: vi.fn(),
  findMany: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $executeRawUnsafe: mocks.executeRaw,
    userNotification: {
      upsert: mocks.upsert,
      create: mocks.create,
      updateMany: mocks.updateMany,
      count: mocks.count,
      findMany: mocks.findMany,
    },
  },
}))

describe('user-notifications', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mocks.executeRaw.mockResolvedValue(undefined)
  })

  it('createUserNotification should ensure table once and upsert when dedupeKey exists', async () => {
    mocks.upsert.mockResolvedValue({ id: 'n-1' })
    const { createUserNotification } = await import('@/lib/user-notifications')

    await createUserNotification({
      userId: 'u-1',
      type: 'SYSTEM',
      title: 'Hello',
      message: 'World',
      dedupeKey: 'dedupe-1',
      metadata: { source: 'test' },
    })
    await createUserNotification({
      userId: 'u-1',
      type: 'SYSTEM',
      title: 'Hello',
      message: 'World',
      dedupeKey: 'dedupe-2',
    })

    expect(mocks.executeRaw).toHaveBeenCalledTimes(3)
    expect(mocks.upsert).toHaveBeenCalledTimes(2)
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { dedupeKey: 'dedupe-1' },
        update: {},
        create: expect.objectContaining({
          userId: 'u-1',
          metadata: { source: 'test' },
          dedupeKey: 'dedupe-1',
        }),
      })
    )
  })

  it('createUserNotification should use create when dedupeKey is absent', async () => {
    mocks.create.mockResolvedValue({ id: 'n-2' })
    const { createUserNotification } = await import('@/lib/user-notifications')

    await createUserNotification({
      userId: 'u-2',
      type: 'SYSTEM',
      title: 'T',
      message: 'M',
    })

    expect(mocks.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'u-2',
        type: 'SYSTEM',
        title: 'T',
        message: 'M',
        createdAt: expect.any(Date),
      }),
    })
  })

  it('safeCreateUserNotification should swallow errors', async () => {
    mocks.create.mockRejectedValue(new Error('db fail'))
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { safeCreateUserNotification } = await import('@/lib/user-notifications')

    await expect(
      safeCreateUserNotification({
        userId: 'u-3',
        type: 'SYSTEM',
        title: 'T',
        message: 'M',
      })
    ).resolves.toBeUndefined()

    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('markAllUserNotificationsRead should update only unread notifications', async () => {
    mocks.updateMany.mockResolvedValue({ count: 2 })
    const { markAllUserNotificationsRead } = await import('@/lib/user-notifications')

    const result = await markAllUserNotificationsRead('u-4')

    expect(result).toEqual({ count: 2 })
    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u-4', readAt: null },
      data: { readAt: expect.any(Date) },
    })
  })

  it('listUserNotifications should sanitize pagination and return computed payload', async () => {
    mocks.count.mockResolvedValueOnce(13).mockResolvedValueOnce(5)
    mocks.findMany.mockResolvedValue([
      { id: 'n1', title: 'A' },
      { id: 'n2', title: 'B' },
    ])
    const { listUserNotifications } = await import('@/lib/user-notifications')

    const result = await listUserNotifications('u-5', -1, 100)

    expect(mocks.count).toHaveBeenNthCalledWith(1, { where: { userId: 'u-5' } })
    expect(mocks.count).toHaveBeenNthCalledWith(2, { where: { userId: 'u-5', readAt: null } })
    expect(mocks.findMany).toHaveBeenCalledWith({
      where: { userId: 'u-5' },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 0,
      take: 20,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        createdAt: true,
        readAt: true,
      },
    })
    expect(result).toEqual({
      total: 13,
      unreadCount: 5,
      page: 1,
      pageSize: 20,
      totalPages: 1,
      items: [{ id: 'n1', title: 'A' }, { id: 'n2', title: 'B' }],
    })
  })
})
