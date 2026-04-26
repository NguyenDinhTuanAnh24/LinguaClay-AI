import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  findListeningSessionsByUser: vi.fn(),
  createListeningSession: vi.fn(),
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

vi.mock('@/repositories/tutor.repository', () => ({
  TutorRepository: {
    findListeningSessionsByUser: mocks.findListeningSessionsByUser,
    createListeningSession: mocks.createListeningSession,
  },
}))

vi.mock('groq-sdk', () => {
  class MockGroq {
    chat = {
      completions: {
        create: vi.fn(),
      },
    }
  }
  return {
    default: MockGroq,
    Groq: MockGroq,
  }
})

describe('GET/POST /api/ai/tutor/listening', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
  })

  it('GET should return 401 when user is not authenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('@/app/api/ai/tutor/listening/route')

    const response = await GET(new Request('http://localhost/api/ai/tutor/listening'))

    expect(response.status).toBe(401)
  })

  it('GET should return sessions for authenticated user', async () => {
    mocks.findListeningSessionsByUser.mockResolvedValue([{ id: 's-1' }])
    const { GET } = await import('@/app/api/ai/tutor/listening/route')

    const response = await GET(new Request('http://localhost/api/ai/tutor/listening'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ ok: true, sessions: [{ id: 's-1' }] })
    expect(mocks.findListeningSessionsByUser).toHaveBeenCalledWith('u-1', 50)
  })

  it('POST should return 400 for unsupported action', async () => {
    const { POST } = await import('@/app/api/ai/tutor/listening/route')
    const request = new Request('http://localhost/api/ai/tutor/listening', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'invalidAction' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Unsupported action')
  })
})
