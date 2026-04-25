import { prisma } from '@/lib/prisma'

export class SupportRepository {
  static async findManyForAdmin(take = 180) {
    return prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            targetLanguage: true,
            proficiencyLevel: true,
            isPro: true,
            proType: true,
            updatedAt: true,
          },
        },
      },
    })
  }

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
        internalNote: true,
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
        device: input.device,
        blockedLesson: input.blockedLesson,
        status: 'OPEN',
      },
      select: {
        id: true,
        category: true,
        subject: true,
        message: true,
        attachmentUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  static async updateReply(input: {
    ticketId: string
    reply: string
    status: string
  }) {
    return prisma.supportTicket.update({
      where: { id: input.ticketId },
      data: {
        adminReply: input.reply,
        status: input.status,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    })
  }

  static async updateInternalNote(ticketId: string, note: string | null) {
    return prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        internalNote: note,
      },
      select: {
        id: true,
        internalNote: true,
      },
    })
  }

  static async findSupportRefundHistoryByUserId(userId: string) {
    return Promise.all([
      prisma.supportTicket.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
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
      }),
      prisma.refundRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: {
          id: true,
          orderId: true,
          status: true,
          reason: true,
          note: true,
          createdAt: true,
          processedAt: true,
          order: {
            select: {
              orderCode: true,
              planId: true,
              amount: true,
              status: true,
            },
          },
        },
      }),
    ])
  }
}
