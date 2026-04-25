import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [supportRows, refundRows] = await Promise.all([
      prisma.supportTicket.findMany({
        where: { userId: user.id },
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
        where: { userId: user.id },
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

    return NextResponse.json({
      ok: true,
      supportTickets: supportRows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
      refundRequests: refundRows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        processedAt: row.processedAt?.toISOString() || null,
      })),
    })
  } catch (error) {
    logger.error('User support-refund history error:', error)
    return NextResponse.json({ error: 'Không thể tải lịch sử hỗ trợ/hoàn tiền' }, { status: 500 })
  }
}

