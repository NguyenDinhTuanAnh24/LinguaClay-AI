import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

type RefundPayload = {
  orderId?: string
  reason?: string
  bankName?: string
  accountNumber?: string
  accountName?: string
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = (await req.json()) as RefundPayload
    const orderId = payload.orderId
    const reason = payload.reason || ''
    const bankName = payload.bankName || ''
    const accountNumber = payload.accountNumber || ''
    const accountName = payload.accountName || ''

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }
    if (!bankName || !accountNumber || !accountName) {
      return NextResponse.json({ error: 'Vui lòng cung cấp đầy đủ thông tin ngân hàng' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        status: true,
        createdAt: true,
      },
    })

    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.status !== 'SUCCESS') {
      return NextResponse.json({ error: 'Only successful orders can be refunded' }, { status: 400 })
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    if (new Date(order.createdAt) < sevenDaysAgo) {
      return NextResponse.json({ error: 'Refund period has expired (7 days)' }, { status: 400 })
    }

    const existingPending = await prisma.refundRequest.findFirst({
      where: { orderId, status: 'PENDING' },
      select: { id: true },
    })
    if (existingPending) {
      return NextResponse.json({ error: 'Đơn này đã có yêu cầu hoàn tiền đang xử lý' }, { status: 409 })
    }

    await prisma.$transaction([
      prisma.refundRequest.create({
        data: {
          orderId,
          userId: user.id,
          status: 'PENDING',
          reason,
          bankName,
          accountNumber,
          accountName,
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          refundStatus: 'PENDING',
          refundReason: reason,
          refundBankName: bankName,
          refundAccountNumber: accountNumber,
          refundAccountName: accountName,
        },
      }),
      prisma.paymentEvent.create({
        data: {
          orderId,
          eventType: 'REFUND_REQUESTED',
          payosStatus: 'SUCCESS',
          source: 'REFUND_API',
          payload: {
            reason,
            bankName,
            accountNumber,
            accountName,
          },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Yêu cầu hoàn tiền đã được gửi. Chúng tôi sẽ xử lý trong vòng 24h.',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    logger.error('Refund Request Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
