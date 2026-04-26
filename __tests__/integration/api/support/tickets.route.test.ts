import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  findManyByUserId: vi.fn(),
  createUserTicket: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}))

vi.mock('@/repositories/support.repository', () => ({
  SupportRepository: {
    findManyByUserId: mocks.findManyByUserId,
    createUserTicket: mocks.createUserTicket,
  },
}))

describe('GET/POST /api/support/tickets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
  })

  it('GET should return 401 when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('@/app/api/support/tickets/route')
    const response = await GET()

    expect(response.status).toBe(401)
  })

  it('GET should return ticket list with ISO date strings', async () => {
    mocks.findManyByUserId.mockResolvedValue([
      {
        id: 't-1',
        category: 'FEEDBACK',
        subject: 'S',
        message: 'M',
        attachmentUrl: null,
        status: 'OPEN',
        internalNote: null,
        adminReply: null,
        createdAt: new Date('2026-04-26T00:00:00.000Z'),
        updatedAt: new Date('2026-04-26T01:00:00.000Z'),
      },
    ])
    const { GET } = await import('@/app/api/support/tickets/route')
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(data.tickets[0].createdAt).toContain('2026-04-26')
  })

  it('POST should return 400 when message is empty', async () => {
    const { POST } = await import('@/app/api/support/tickets/route')
    const response = await POST(
      new Request('http://localhost/api/support/tickets', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ category: 'TECHNICAL', message: '' }),
      })
    )

    expect(response.status).toBe(400)
  })

  it('POST should create ticket and normalize unknown category to FEEDBACK', async () => {
    mocks.createUserTicket.mockResolvedValue({
      id: 't-2',
      category: 'FEEDBACK',
      subject: null,
      message: 'Need help',
      attachmentUrl: null,
      status: 'OPEN',
      createdAt: new Date('2026-04-26T00:00:00.000Z'),
      updatedAt: new Date('2026-04-26T01:00:00.000Z'),
    })
    const { POST } = await import('@/app/api/support/tickets/route')
    const response = await POST(
      new Request('http://localhost/api/support/tickets', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ category: 'unknown', message: 'Need help' }),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(mocks.createUserTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u-1',
        category: 'FEEDBACK',
        message: 'Need help',
      })
    )
  })
})
