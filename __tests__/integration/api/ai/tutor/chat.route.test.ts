import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  applyRateLimit: vi.fn(),
  getUser: vi.fn(),
  userProgressFindMany: vi.fn(),
  roleplayCreate: vi.fn(),
  freeTalkCreate: vi.fn(),
  groqCreate: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}))

vi.mock('@/lib/rate-limit', () => ({
  applyRateLimit: mocks.applyRateLimit,
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    userProgress: {
      findMany: mocks.userProgressFindMany,
    },
    tutorRoleplayTurn: {
      create: mocks.roleplayCreate,
    },
    tutorFreeTalkSession: {
      create: mocks.freeTalkCreate,
    },
  },
}))

vi.mock('groq-sdk', () => ({
  default: class MockGroq {
    chat = {
      completions: {
        create: mocks.groqCreate,
      },
    }
  },
  Groq: class MockGroqNamed {
    chat = {
      completions: {
        create: mocks.groqCreate,
      },
    }
  },
}))

describe('POST /api/ai/tutor/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.applyRateLimit.mockResolvedValue({ ok: true })
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    mocks.userProgressFindMany.mockResolvedValue([])
    mocks.roleplayCreate.mockResolvedValue({ id: 'rp-1' })
    mocks.freeTalkCreate.mockResolvedValue({ id: 'ft-1' })
  })

  it('should return rate limit response when denied', async () => {
    mocks.applyRateLimit.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 }),
    })
    const { POST } = await import('@/app/api/ai/tutor/chat/route')
    const response = await POST(new Request('http://localhost/api/ai/tutor/chat', { method: 'POST', body: '{}' }) as any)

    expect(response.status).toBe(429)
  })

  it('should return 401 when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('@/app/api/ai/tutor/chat/route')
    const response = await POST(new Request('http://localhost/api/ai/tutor/chat', { method: 'POST', body: '{}' }) as any)

    expect(response.status).toBe(401)
  })

  it('should return 400 for invalid payload', async () => {
    const { POST } = await import('@/app/api/ai/tutor/chat/route')
    const response = await POST(
      new Request('http://localhost/api/ai/tutor/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'freeTalk', unknownField: true }),
      }) as any
    )

    expect(response.status).toBe(400)
  })

  it('should return 400 for unsupported mode', async () => {
    const { POST } = await import('@/app/api/ai/tutor/chat/route')
    const response = await POST(
      new Request('http://localhost/api/ai/tutor/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'somethingElse' }),
      }) as any
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request payload')
  })

  it('should return 400 for freeTalk when message is missing', async () => {
    const { POST } = await import('@/app/api/ai/tutor/chat/route')
    const response = await POST(
      new Request('http://localhost/api/ai/tutor/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'freeTalk', message: '' }),
      }) as any
    )

    expect(response.status).toBe(400)
  })

  it('should process freeTalk mode successfully', async () => {
    mocks.groqCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ answerEn: 'Answer', exampleEn: 'Example', explainVi: 'Giai thich' }) } }],
    })
    const { POST } = await import('@/app/api/ai/tutor/chat/route')
    const response = await POST(
      new Request('http://localhost/api/ai/tutor/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'freeTalk', message: 'How to use present perfect?' }),
      }) as any
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.result.answerEn).toBe('Answer')
    expect(mocks.freeTalkCreate).toHaveBeenCalledTimes(1)
  })

  it('should process roleplay hint action and return coachText', async () => {
    mocks.groqCreate.mockResolvedValue({
      choices: [{ message: { content: 'Hay tra loi ngan gon va dung tu muc tieu.' } }],
    })
    const { POST } = await import('@/app/api/ai/tutor/chat/route')
    const response = await POST(
      new Request('http://localhost/api/ai/tutor/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mode: 'roleplay',
          roleplayAction: 'hint',
          scenarioTitle: 'At airport',
          targetWords: ['ticket', 'gate'],
          history: [{ role: 'user', content: 'I go airport' }],
        }),
      }) as any
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.result.coachText).toContain('Hay')
    expect(mocks.roleplayCreate).not.toHaveBeenCalled()
  })
})
