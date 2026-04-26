import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  findSpeakingSessionsByUser: vi.fn(),
  createSpeakingSession: vi.fn(),
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
    findSpeakingSessionsByUser: mocks.findSpeakingSessionsByUser,
    createSpeakingSession: mocks.createSpeakingSession,
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

describe('GET/POST /api/ai/tutor/speaking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
  })

  it('GET should return 401 when user is missing', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('@/app/api/ai/tutor/speaking/route')

    const response = await GET(new Request('http://localhost/api/ai/tutor/speaking'))

    expect(response.status).toBe(401)
  })

  it('GET should return speaking sessions', async () => {
    mocks.findSpeakingSessionsByUser.mockResolvedValue([{ id: 'sp-1' }])
    const { GET } = await import('@/app/api/ai/tutor/speaking/route')

    const response = await GET(new Request('http://localhost/api/ai/tutor/speaking'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ ok: true, sessions: [{ id: 'sp-1' }] })
    expect(mocks.findSpeakingSessionsByUser).toHaveBeenCalledWith('u-1', 50)
  })

  it('POST should return 400 for unsupported action', async () => {
    const { POST } = await import('@/app/api/ai/tutor/speaking/route')
    const request = new Request('http://localhost/api/ai/tutor/speaking', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'not-supported' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Unsupported action')
  })
})
