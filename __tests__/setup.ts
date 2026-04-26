import '@testing-library/jest-dom'

// Mock environment variables
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: { id: 'test-user-id' } },
        })
      ),
    },
  })),
}))

vi.mock('groq-sdk', () => ({
  Groq: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(() =>
          Promise.resolve({
            choices: [{ message: { content: '{}' } }],
          })
        ),
      },
    },
  })),
}))

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    tutorListeningSession: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    tutorReadingSession: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    tutorSpeakingSession: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    tutorEditorSession: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    tutorRoleplayTurn: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    tutorFreeTalkSession: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}))

// Global test utilities
export function createMockSession(overrides?: Partial<unknown>) {
  return {
    id: 'session-1',
    title: 'Test Session',
    levelTarget: 'A2',
    topicHint: null,
    score: 85,
    totalQuestions: 8,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockListeningSession(overrides?: Partial<unknown>) {
  return {
    ...createMockSession(overrides),
    transcriptEn: 'This is a test transcript',
    questions: [],
    blanks: [],
    userAnswers: {},
    blankAnswers: {},
    feedbackVi: 'Good job!',
    wrongItems: [],
  }
}

export function createMockReadingSession(overrides?: Partial<unknown>) {
  return {
    ...createMockSession(overrides),
    passageEn: 'This is a test passage',
    questions: [],
    blanks: [],
    userAnswers: {},
    blankAnswers: {},
    feedbackVi: 'Good job!',
    wrongItems: [],
  }
}

export function createMockSpeakingSession(overrides?: Partial<unknown>) {
  return {
    ...createMockSession(overrides),
    promptData: {
      title: 'Test Speaking',
      introVi: 'Introduction',
      questions: ['Question 1', 'Question 2'],
    },
    userAnswers: ['Answer 1', 'Answer 2'],
    feedbackVi: 'Good job!',
    criteria: {
      fluency: 80,
      vocabulary: 85,
      grammar: 90,
      pronunciation: 75,
    },
    improvements: [],
  }
}
