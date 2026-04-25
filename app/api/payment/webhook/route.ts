import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { PayOS } from '@payos/node'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createUserNotification } from '@/lib/user-notifications'

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID!,
  apiKey: process.env.PAYOS_API_KEY!,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
})

function getDurationByPlan(planId: string): number {
  if (planId === '1_YEAR') return 12
  if (planId === '6_MONTHS') return 6
  return 3
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const webhookData = await payos.webhooks.verify(body)

    if (!webhookData) {
      return NextResponse.json({ success: true })
    }

    const webhookRaw = webhookData as unknown as Record<string, unknown>
    const orderCode = Number(webhookRaw.orderCode)
    if (!orderCode || Number.isNaN(orderCode)) {
      return NextResponse.json({ error: 'Invalid orderCode' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { orderCode },
      select: {
        id: true,
        userId: true,
        planId: true,
        status: true,
        paidAt: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'SUCCESS') {
      await prisma.paymentEvent.create({
        data: {
          orderId: order.id,
          eventType: 'WEBHOOK_DUPLICATED',
          payosStatus: String(webhookRaw.status ?? 'PAID').toUpperCase(),
          source: 'WEBHOOK',
          payload: webhookRaw as Prisma.InputJsonValue,
        },
      })
      return NextResponse.json({ message: 'Already processed' })
    }

    const durationInMonths = getDurationByPlan(order.planId)
    const now = new Date()
    const proEndDate = new Date(now)
    proEndDate.setMonth(proEndDate.getMonth() + durationInMonths)

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'SUCCESS',
          paidAt: order.paidAt ?? now,
          verifiedAt: now,
          payosTransactionId:
            (webhookRaw.transactionId as string | undefined) ??
            (webhookRaw.id as string | undefined) ??
            orderCode.toString(),
          payosReference:
            (webhookRaw.reference as string | undefined) ??
            (webhookRaw.paymentLinkId as string | undefined) ??
            null,
        },
      }),
      prisma.user.update({
        where: { id: order.userId },
        data: {
          isPro: true,
          proType: order.planId,
          proStartDate: now,
          proEndDate,
        },
      }),
      prisma.paymentEvent.create({
        data: {
          orderId: order.id,
          eventType: 'WEBHOOK_PAID',
          payosStatus: String(webhookRaw.status ?? 'PAID').toUpperCase(),
          source: 'WEBHOOK',
          payload: webhookRaw as Prisma.InputJsonValue,
        },
      }),
    ])

    await createUserNotification({
      userId: order.userId,
      type: 'PURCHASE_SUCCESS',
      title: 'Thanh toán thành công',
      message: `Bạn đã nâng cấp gói ${order.planId}.`,
      dedupeKey: `purchase_success:${order.id}`,
    }).catch((error) => {
      logger.error('Create webhook purchase notification error:', error)
    })

    logger.info('payos.webhook.processed', { orderCode })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    logger.error('PayOS Webhook Error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
