import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class TutorRepository {
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
}
