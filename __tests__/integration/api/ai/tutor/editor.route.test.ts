import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  groqCreate: vi.fn(),
  createEditorSession: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}))

vi.mock('@/repositories/tutor.repository', () => ({
  TutorRepository: {
    createEditorSession: mocks.createEditorSession,
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

describe('POST /api/ai/tutor/editor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    mocks.createEditorSession.mockResolvedValue({ id: 'ed-1' })
  })

  it('should return 401 when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('@/app/api/ai/tutor/editor/route')
    const response = await POST(new Request('http://localhost/api/ai/tutor/editor', { method: 'POST', body: '{}' }))

    expect(response.status).toBe(401)
  })

  it('should return 400 for invalid json payload', async () => {
    const { POST } = await import('@/app/api/ai/tutor/editor/route')
    const response = await POST(
      new Request('http://localhost/api/ai/tutor/editor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{bad-json',
      })
    )

    expect(response.status).toBe(400)
  })

  it('should return 400 for invalid schema payload', async () => {
    const { POST } = await import('@/app/api/ai/tutor/editor/route')
    const response = await POST(
      new Request('http://localhost/api/ai/tutor/editor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'gradeEssay', extraField: 'x' }),
      })
    )

    expect(response.status).toBe(400)
  })

  it('should return 400 when generatePrompt is missing idea', async () => {
    const { POST } = await import('@/app/api/ai/tutor/editor/route')
    const response = await POST(
      new Request('http://localhost/api/ai/tutor/editor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'generatePrompt', idea: '' }),
      })
    )

    expect(response.status).toBe(400)
  })

  it('should generate writing prompt successfully', async () => {
    mocks.groqCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ promptTitle: 'Title', promptEn: 'Prompt', tipsVi: ['Tip 1'] }) } }],
    })
    const { POST } = await import('@/app/api/ai/tutor/editor/route')
    const response = await POST(
      new Request('http://localhost/api/ai/tutor/editor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'generatePrompt', idea: 'Travel experiences' }),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.prompt.promptTitle).toBe('Title')
  })

  it('should grade essay and persist editor session', async () => {
    mocks.groqCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              score: 80,
              feedbackVi: 'Tot',
              strengthsVi: ['A'],
              improvementsVi: ['B'],
              revisedEssay: 'Improved',
              detailedFeedbackVi: [{ excerpt: 'old', commentVi: 'c', fixVi: 'f' }],
              notes: [{ wrong: 'w', correct: 'c', reasonVi: 'r' }],
            }),
          },
        },
      ],
    })
    const { POST } = await import('@/app/api/ai/tutor/editor/route')
    const response = await POST(
      new Request('http://localhost/api/ai/tutor/editor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'gradeEssay', content: 'My essay content', promptTitle: 'Task 1' }),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.result.score).toBe(80)
    expect(mocks.createEditorSession).toHaveBeenCalledTimes(1)
  })
})
