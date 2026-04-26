import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class TutorRepository {
  // ==================== EDITOR SESSIONS ====================
  static async createEditorSession(input: {
    userId: string
    inputText: string
    annotatedText: string
    shortFeedbackVi: string
    notes: Prisma.InputJsonValue
  }) {
    return prisma.tutorEditorSession.create({
      data: {
        userId: input.userId,
        inputText: input.inputText,
        annotatedText: input.annotatedText,
        shortFeedbackVi: input.shortFeedbackVi,
        notes: input.notes,
      },
    })
  }

  static async findEditorSessionsByUser(userId: string, limit: number = 50) {
    return prisma.tutorEditorSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        inputText: true,
        shortFeedbackVi: true,
        createdAt: true,
      },
    })
  }

  static async findEditorSessionById(id: string, userId?: string) {
    const where: Prisma.TutorEditorSessionWhereInput = userId
      ? { id, userId }
      : { id }

    return prisma.tutorEditorSession.findUnique({
      where,
    })
  }

  static async deleteEditorSession(id: string, userId?: string) {
    const where: Prisma.TutorEditorSessionWhereInput = userId
      ? { id, userId }
      : { id }

    return prisma.tutorEditorSession.delete({
      where,
    })
  }

  // ==================== LISTENING SESSIONS ====================
  static async createListeningSession(input: {
    userId: string
    title: string
    levelTarget: string
    topicHint: string | null
    transcriptEn: string
    questions: Prisma.InputJsonValue
    blanks: Prisma.InputJsonValue
    userAnswers: Prisma.InputJsonValue
    blankAnswers: Prisma.InputJsonValue
    score: number
    totalQuestions: number
    feedbackVi: string
    wrongItems: Prisma.InputJsonValue
  }) {
    return prisma.tutorListeningSession.create({
      data: {
        userId: input.userId,
        title: input.title,
        levelTarget: input.levelTarget,
        topicHint: input.topicHint,
        transcriptEn: input.transcriptEn,
        questions: input.questions,
        blanks: input.blanks,
        userAnswers: input.userAnswers,
        blankAnswers: input.blankAnswers,
        score: input.score,
        totalQuestions: input.totalQuestions,
        feedbackVi: input.feedbackVi,
        wrongItems: input.wrongItems,
      },
    })
  }

  static async findListeningSessionsByUser(userId: string, limit: number = 50) {
    return prisma.tutorListeningSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        levelTarget: true,
        topicHint: true,
        score: true,
        totalQuestions: true,
        createdAt: true,
      },
    })
  }

  static async findListeningSessionById(id: string, userId?: string) {
    const where: Prisma.TutorListeningSessionWhereInput = userId
      ? { id, userId }
      : { id }

    return prisma.tutorListeningSession.findUnique({
      where,
    })
  }

  static async findListeningSessionWithDetails(id: string, userId?: string) {
    const where: Prisma.TutorListeningSessionWhereInput = userId
      ? { id, userId }
      : { id }

    return prisma.tutorListeningSession.findUnique({
      where,
      select: {
        id: true,
        title: true,
        levelTarget: true,
        topicHint: true,
        transcriptEn: true,
        questions: true,
        blanks: true,
        userAnswers: true,
        blankAnswers: true,
        score: true,
        totalQuestions: true,
        feedbackVi: true,
        wrongItems: true,
        createdAt: true,
      },
    })
  }

  static async updateListeningSession(id: string, data: {
    score?: number
    feedbackVi?: string
    wrongItems?: Prisma.InputJsonValue
  }) {
    return prisma.tutorListeningSession.update({
      where: { id },
      data: {
        ...(data.score !== undefined && { score: data.score }),
        ...(data.feedbackVi !== undefined && { feedbackVi: data.feedbackVi }),
        ...(data.wrongItems !== undefined && { wrongItems: data.wrongItems }),
      },
    })
  }

  static async deleteListeningSession(id: string, userId?: string) {
    const where: Prisma.TutorListeningSessionWhereInput = userId
      ? { id, userId }
      : { id }

    return prisma.tutorListeningSession.delete({
      where,
    })
  }

  static async countListeningSessions(userId: string) {
    return prisma.tutorListeningSession.count({
      where: { userId },
    })
  }

  // ==================== READING SESSIONS ====================
  static async createReadingSession(input: {
    userId: string
    title: string
    levelTarget: string
    topicHint: string | null
    passageEn: string
    questions: Prisma.InputJsonValue
    blanks: Prisma.InputJsonValue
    userAnswers: Prisma.InputJsonValue
    blankAnswers: Prisma.InputJsonValue
    score: number
    totalQuestions: number
    feedbackVi: string
    wrongItems: Prisma.InputJsonValue
  }) {
    return prisma.tutorReadingSession.create({
      data: {
        userId: input.userId,
        title: input.title,
        levelTarget: input.levelTarget,
        topicHint: input.topicHint,
        passageEn: input.passageEn,
        questions: input.questions,
        blanks: input.blanks,
        userAnswers: input.userAnswers,
        blankAnswers: input.blankAnswers,
        score: input.score,
        totalQuestions: input.totalQuestions,
        feedbackVi: input.feedbackVi,
        wrongItems: input.wrongItems,
      },
    })
  }

  static async findReadingSessionsByUser(userId: string, limit: number = 50) {
    return prisma.tutorReadingSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        levelTarget: true,
        topicHint: true,
        score: true,
        totalQuestions: true,
        createdAt: true,
      },
    })
  }

  static async findReadingSessionById(id: string, userId?: string) {
    const where: Prisma.TutorReadingSessionWhereInput = userId
      ? { id, userId }
      : { id }

    return prisma.tutorReadingSession.findUnique({
      where,
    })
  }

  static async findReadingSessionWithDetails(id: string, userId?: string) {
    const where: Prisma.TutorReadingSessionWhereInput = userId
      ? { id, userId }
      : { id }

    return prisma.tutorReadingSession.findUnique({
      where,
      select: {
        id: true,
        title: true,
        levelTarget: true,
        topicHint: true,
        passageEn: true,
        questions: true,
        blanks: true,
        userAnswers: true,
        blankAnswers: true,
        score: true,
        totalQuestions: true,
        feedbackVi: true,
        wrongItems: true,
        createdAt: true,
      },
    })
  }

  static async updateReadingSession(id: string, data: {
    score?: number
    feedbackVi?: string
    wrongItems?: Prisma.InputJsonValue
  }) {
    return prisma.tutorReadingSession.update({
      where: { id },
      data: {
        ...(data.score !== undefined && { score: data.score }),
        ...(data.feedbackVi !== undefined && { feedbackVi: data.feedbackVi }),
        ...(data.wrongItems !== undefined && { wrongItems: data.wrongItems }),
      },
    })
  }

  static async deleteReadingSession(id: string, userId?: string) {
    const where: Prisma.TutorReadingSessionWhereInput = userId
      ? { id, userId }
      : { id }

    return prisma.tutorReadingSession.delete({
      where,
    })
  }

  static async countReadingSessions(userId: string) {
    return prisma.tutorReadingSession.count({
      where: { userId },
    })
  }

  // ==================== SPEAKING SESSIONS ====================
  static async createSpeakingSession(input: {
    userId: string
    title: string
    levelTarget: string
    topicHint: string | null
    promptData: Prisma.InputJsonValue
    userAnswers: Prisma.InputJsonValue
    score: number
    feedbackVi: string
    criteria: Prisma.InputJsonValue
    improvements: Prisma.InputJsonValue
  }) {
    return prisma.tutorSpeakingSession.create({
      data: {
        userId: input.userId,
        title: input.title,
        levelTarget: input.levelTarget,
        topicHint: input.topicHint,
        promptData: input.promptData,
        userAnswers: input.userAnswers,
        score: input.score,
        feedbackVi: input.feedbackVi,
        criteria: input.criteria,
        improvements: input.improvements,
      },
    })
  }

  static async findSpeakingSessionsByUser(userId: string, limit: number = 50) {
    return prisma.tutorSpeakingSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        levelTarget: true,
        topicHint: true,
        score: true,
        createdAt: true,
      },
    })
  }

  static async findSpeakingSessionById(id: string, userId?: string) {
    const where: Prisma.TutorSpeakingSessionWhereInput = userId
      ? { id, userId }
      : { id }

    return prisma.tutorSpeakingSession.findUnique({
      where,
    })
  }

  static async findSpeakingSessionWithDetails(id: string, userId?: string) {
    const where: Prisma.TutorSpeakingSessionWhereInput = userId
      ? { id, userId }
      : { id }

    return prisma.tutorSpeakingSession.findUnique({
      where,
      select: {
        id: true,
        title: true,
        levelTarget: true,
        topicHint: true,
        promptData: true,
        userAnswers: true,
        score: true,
        feedbackVi: true,
        criteria: true,
        improvements: true,
        createdAt: true,
      },
    })
  }

  static async updateSpeakingSession(id: string, data: {
    score?: number
    feedbackVi?: string
    criteria?: Prisma.InputJsonValue
    improvements?: Prisma.InputJsonValue
  }) {
    return prisma.tutorSpeakingSession.update({
      where: { id },
      data: {
        ...(data.score !== undefined && { score: data.score }),
        ...(data.feedbackVi !== undefined && { feedbackVi: data.feedbackVi }),
        ...(data.criteria !== undefined && { criteria: data.criteria }),
        ...(data.improvements !== undefined && { improvements: data.improvements }),
      },
    })
  }

  static async deleteSpeakingSession(id: string, userId?: string) {
    const where: Prisma.TutorSpeakingSessionWhereInput = userId
      ? { id, userId }
      : { id }

    return prisma.tutorSpeakingSession.delete({
      where,
    })
  }

  static async countSpeakingSessions(userId: string) {
    return prisma.tutorSpeakingSession.count({
      where: { userId },
    })
  }

  // ==================== ROLEPLAY TURNS ====================
  static async createRoleplayTurn(input: {
    userId: string
    scenarioTitle: string
    turnCount: number
    targetWords: string[]
    history?: Prisma.InputJsonValue
    userMessage?: string
    aiReply?: string
    reminderVi?: string
    wrapUpEn?: string
    wrapUpVi?: string
  }) {
    return prisma.tutorRoleplayTurn.create({
      data: {
        userId: input.userId,
        scenarioTitle: input.scenarioTitle,
        turnCount: input.turnCount,
        targetWords: input.targetWords,
        history: input.history,
        userMessage: input.userMessage || null,
        aiReply: input.aiReply || null,
        reminderVi: input.reminderVi || null,
        wrapUpEn: input.wrapUpEn || null,
        wrapUpVi: input.wrapUpVi || null,
      },
    })
  }

  static async findRoleplayTurnsByUser(userId: string, limit: number = 50) {
    return prisma.tutorRoleplayTurn.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        scenarioTitle: true,
        turnCount: true,
        targetWords: true,
        createdAt: true,
      },
    })
  }

  static async findRoleplayTurnById(id: string, userId?: string) {
    const where: Prisma.TutorRoleplayTurnWhereInput = userId
      ? { id, userId }
      : { id }

    return prisma.tutorRoleplayTurn.findUnique({
      where,
    })
  }

  static async deleteRoleplayTurn(id: string, userId?: string) {
    const where: Prisma.TutorRoleplayTurnWhereInput = userId
      ? { id, userId }
      : { id }

    return prisma.tutorRoleplayTurn.delete({
      where,
    })
  }

  // ==================== FREE TALK SESSIONS ====================
  static async createFreeTalkSession(input: {
    userId: string
    question: string
    answerEn: string
    exampleEn: string
    explainVi: string
  }) {
    return prisma.tutorFreeTalkSession.create({
      data: {
        userId: input.userId,
        question: input.question,
        answerEn: input.answerEn,
        exampleEn: input.exampleEn,
        explainVi: input.explainVi,
      },
    })
  }

  static async findFreeTalkSessionsByUser(userId: string, limit: number = 50) {
    return prisma.tutorFreeTalkSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        question: true,
        answerEn: true,
        createdAt: true,
      },
    })
  }

  static async findFreeTalkSessionById(id: string, userId?: string) {
    const where: Prisma.TutorFreeTalkSessionWhereInput = userId
      ? { id, userId }
      : { id }

    return prisma.tutorFreeTalkSession.findUnique({
      where,
    })
  }

  static async deleteFreeTalkSession(id: string, userId?: string) {
    const where: Prisma.TutorFreeTalkSessionWhereInput = userId
      ? { id, userId }
      : { id }

    return prisma.tutorFreeTalkSession.delete({
      where,
    })
  }

  // ==================== AGGREGATE STATISTICS ====================
  static async getUserTutorStats(userId: string) {
    const [
      listeningCount,
      readingCount,
      speakingCount,
      editorCount,
      roleplayCount,
      freeTalkCount,
    ] = await Promise.all([
      prisma.tutorListeningSession.count({ where: { userId } }),
      prisma.tutorReadingSession.count({ where: { userId } }),
      prisma.tutorSpeakingSession.count({ where: { userId } }),
      prisma.tutorEditorSession.count({ where: { userId } }),
      prisma.tutorRoleplayTurn.count({ where: { userId } }),
      prisma.tutorFreeTalkSession.count({ where: { userId } }),
    ])

    const avgScorePromise = prisma.tutorListeningSession.findMany({
      where: { userId },
      select: { score: true },
    }).then((sessions) => {
      const listeningAvg = sessions.length > 0
        ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length)
        : null
      return listeningAvg
    })

    const avgReadingPromise = prisma.tutorReadingSession.findMany({
      where: { userId },
      select: { score: true },
    }).then((sessions) => {
      const readingAvg = sessions.length > 0
        ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length)
        : null
      return readingAvg
    })

    const avgSpeakingPromise = prisma.tutorSpeakingSession.findMany({
      where: { userId },
      select: { score: true },
    }).then((sessions) => {
      const speakingAvg = sessions.length > 0
        ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length)
        : null
      return speakingAvg
    })

    const [listeningAvg, readingAvg, speakingAvg] = await Promise.all([
      avgScorePromise,
      avgReadingPromise,
      avgSpeakingPromise,
    ])

    return {
      totalSessions: listeningCount + readingCount + speakingCount + editorCount + roleplayCount + freeTalkCount,
      listeningCount,
      readingCount,
      speakingCount,
      editorCount,
      roleplayCount,
      freeTalkCount,
      averageScores: {
        listening: listeningAvg,
        reading: readingAvg,
        speaking: speakingAvg,
      },
    }
  }

  static async getRecentSessions(userId: string, limit: number = 20) {
    const listening = await prisma.tutorListeningSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.ceil(limit / 3),
      select: {
        id: true,
        title: true,
        levelTarget: true,
        score: true,
        type: { name: 'listening' as const },
        createdAt: true,
      },
    })

    const reading = await prisma.tutorReadingSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.ceil(limit / 3),
      select: {
        id: true,
        title: true,
        levelTarget: true,
        score: true,
        type: { name: 'reading' as const },
        createdAt: true,
      },
    })

    const speaking = await prisma.tutorSpeakingSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.ceil(limit / 3),
      select: {
        id: true,
        title: true,
        levelTarget: true,
        score: true,
        type: { name: 'speaking' as const },
        createdAt: true,
      },
    })

    const allSessions = [...listening, ...reading, ...speaking]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)

    return allSessions
  }
}
