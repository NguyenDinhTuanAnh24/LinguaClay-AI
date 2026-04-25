import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { PayOS } from '@payos/node'
import { Prisma } from '@prisma/client'
import { createUserNotification } from '@/lib/user-notifications'
import { PaymentRepository } from '@/repositories/payment.repository'

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

    const order = await PaymentRepository.findOrderByCode(orderCode)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const payosStatus = String(webhookRaw.status ?? 'PAID').toUpperCase()
    if (order.status === 'SUCCESS') {
      await PaymentRepository.createWebhookDuplicatedEvent({
        orderId: order.id,
        payosStatus,
        payload: webhookRaw as Prisma.InputJsonValue,
      })
      return NextResponse.json({ message: 'Already processed' })
    }

    const durationInMonths = getDurationByPlan(order.planId)
    const now = new Date()
    const proEndDate = new Date(now)
    proEndDate.setMonth(proEndDate.getMonth() + durationInMonths)

    await PaymentRepository.markWebhookPaid({
      orderId: order.id,
      orderUserId: order.userId,
      planId: order.planId,
      paidAt: order.paidAt,
      now,
      proEndDate,
      payosTransactionId:
        (webhookRaw.transactionId as string | undefined) ??
        (webhookRaw.id as string | undefined) ??
        orderCode.toString(),
      payosReference:
        (webhookRaw.reference as string | undefined) ??
        (webhookRaw.paymentLinkId as string | undefined) ??
        null,
      payosStatus,
      payload: webhookRaw as Prisma.InputJsonValue,
    })

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
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
