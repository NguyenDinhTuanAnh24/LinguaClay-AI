import { prisma } from '@/lib/prisma'

export async function loadAiControlReportData() {
  const [writingSessions, listening, reading, speaking, editor] = await Promise.all([
    prisma.writingSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        createdAt: true,
        userContent: true,
        aiFeedback: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.tutorListeningSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        createdAt: true,
        transcriptEn: true,
        feedbackVi: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.tutorReadingSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        createdAt: true,
        passageEn: true,
        feedbackVi: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.tutorSpeakingSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        createdAt: true,
        userAnswers: true,
        feedbackVi: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.tutorEditorSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        createdAt: true,
        inputText: true,
        shortFeedbackVi: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ])

  return { writingSessions, listening, reading, speaking, editor }
}
