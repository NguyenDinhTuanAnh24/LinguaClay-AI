import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  normalizeCefrLevel: vi.fn(),
  transaction: vi.fn(),
  groqCreate: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mocks.getUser,
    },
  })),
}))

vi.mock('@/lib/levels', () => ({
  normalizeCefrLevel: mocks.normalizeCefrLevel,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: mocks.transaction,
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

describe('POST /api/flashcards/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    mocks.normalizeCefrLevel.mockReturnValue('A2')
  })

  it('should return 401 when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('@/app/api/flashcards/generate/route')
    const req = new Request('http://localhost/api/flashcards/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ topic: 'travel', language: 'EN' }),
    })

    const response = await POST(req)

    expect(response.status).toBe(401)
  })

  it('should return 400 when topic/language are missing', async () => {
    const { POST } = await import('@/app/api/flashcards/generate/route')
    const req = new Request('http://localhost/api/flashcards/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ topic: '', language: '' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
  })

  it('should create topic and words when AI returns valid flashcards', async () => {
    mocks.groqCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              flashcards: [
                {
                  term: 'trip',
                  pronunciation: 'trIp',
                  definition: 'chuyen di',
                  example: 'I plan a trip.',
                  exampleTranslation: 'Toi len ke hoach cho chuyen di.',
                },
              ],
            }),
          },
        },
      ],
    })

    mocks.transaction.mockImplementation(async (cb: (tx: any) => Promise<unknown>) => {
      const tx = {
        topic: {
          create: vi.fn().mockResolvedValue({ id: 'topic-1', name: 'travel' }),
        },
        word: {
          createMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
      }
      return cb(tx)
    })

    const { POST } = await import('@/app/api/flashcards/generate/route')
    const req = new Request('http://localhost/api/flashcards/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ topic: 'travel', language: 'EN', level: 'A2' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ id: 'topic-1', name: 'travel' })
    expect(mocks.groqCreate).toHaveBeenCalledTimes(1)
    expect(mocks.transaction).toHaveBeenCalledTimes(1)
  })
})
