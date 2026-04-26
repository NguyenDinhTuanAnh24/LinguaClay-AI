import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SupportRepository } from '@/repositories/support.repository'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    supportTicket: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    refundRequest: {
      findMany: vi.fn(),
    },
  },
}))

describe('SupportRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('findManyForAdmin should query tickets with user include', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.supportTicket.findMany).mockResolvedValue([] as never)

    await SupportRepository.findManyForAdmin(50)

    expect(prisma.supportTicket.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      take: 50,
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
  })

  it('findManyByUserId should query user ticket list', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.supportTicket.findMany).mockResolvedValue([] as never)

    await SupportRepository.findManyByUserId('u-1', 10)

    expect(prisma.supportTicket.findMany).toHaveBeenCalledWith({
      where: { userId: 'u-1' },
      orderBy: { createdAt: 'desc' },
      take: 10,
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
  })

  it('createUserTicket should always create OPEN ticket', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.supportTicket.create).mockResolvedValue({ id: 't-1' } as never)

    await SupportRepository.createUserTicket({
      userId: 'u-1',
      category: 'PAYMENT',
      subject: 'Need help',
      message: 'message',
      attachmentUrl: null,
      device: 'web',
      blockedLesson: null,
    })

    expect(prisma.supportTicket.create).toHaveBeenCalledWith({
      data: {
        userId: 'u-1',
        category: 'PAYMENT',
        subject: 'Need help',
        message: 'message',
        attachmentUrl: null,
        device: 'web',
        blockedLesson: null,
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
  })

  it('updateReply should update admin reply and status', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.supportTicket.update).mockResolvedValue({ id: 't-1' } as never)

    await SupportRepository.updateReply({
      ticketId: 't-1',
      reply: 'resolved',
      status: 'RESOLVED',
    })

    expect(prisma.supportTicket.update).toHaveBeenCalledWith({
      where: { id: 't-1' },
      data: {
        adminReply: 'resolved',
        status: 'RESOLVED',
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    })
  })

  it('updateInternalNote should update and select note fields', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.supportTicket.update).mockResolvedValue({ id: 't-1', internalNote: 'note' } as never)

    await SupportRepository.updateInternalNote('t-1', 'note')

    expect(prisma.supportTicket.update).toHaveBeenCalledWith({
      where: { id: 't-1' },
      data: {
        internalNote: 'note',
      },
      select: {
        id: true,
        internalNote: true,
      },
    })
  })

  it('findSupportRefundHistoryByUserId should fetch tickets and refunds in parallel', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.supportTicket.findMany).mockResolvedValue([{ id: 't-1' }] as never)
    vi.mocked(prisma.refundRequest.findMany).mockResolvedValue([{ id: 'r-1' }] as never)

    const result = await SupportRepository.findSupportRefundHistoryByUserId('u-1')

    expect(result).toEqual([[{ id: 't-1' }], [{ id: 'r-1' }]])
    expect(prisma.supportTicket.findMany).toHaveBeenCalledWith({
      where: { userId: 'u-1' },
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
    })
    expect(prisma.refundRequest.findMany).toHaveBeenCalledWith({
      where: { userId: 'u-1' },
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
    })
  })
})
