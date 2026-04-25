import { prisma } from '@/lib/prisma'

export class SupportRepository {
  static async findManyByUserId(userId: string, take = 60) {
    return prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        category: true,
        subject: true,
        message: true,
        attachmentUrl: true,
        status: true,
        adminReply: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  static async createUserTicket(input: {
    userId: string
    category: string
    subject: string | null
    message: string
    attachmentUrl: string | null
    device: string | null
    blockedLesson: string | null
  }) {
    return prisma.supportTicket.create({
      data: {
        userId: input.userId,
        category: input.category,
        subject: input.subject,
        message: input.message,
        attachmentUrl: input.attachmentUrl,
        status: 'OPEN',
        device: input.device,
        blockedLesson: input.blockedLesson,
      },
      select: {
        id: true,
        category: true,
        subject: true,
        message: true,
        attachmentUrl: true,
        status: true,
        adminReply: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  static async findManyForAdmin(take = 180) {
    return prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        userId: true,
        category: true,
        subject: true,
        message: true,
        attachmentUrl: true,
        status: true,
        device: true,
        blockedLesson: true,
        internalNote: true,
        adminReply: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isPro: true,
            proType: true,
            updatedAt: true,
          },
        },
      },
    })
  }

  static async updateInternalNote(ticketId: string, note: string | null) {
    return prisma.supportTicket.update({
      where: { id: ticketId },
      data: { internalNote: note },
      select: { id: true, internalNote: true },
    })
  }

  static async updateReply(input: { ticketId: string; reply: string; status: string }) {
    return prisma.supportTicket.update({
      where: { id: input.ticketId },
      data: {
        adminReply: input.reply,
        status: input.status,
      },
      select: {
        id: true,
        adminReply: true,
        status: true,
        updatedAt: true,
        user: { select: { email: true } },
      },
    })
  }
}
