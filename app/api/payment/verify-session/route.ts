import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { PayOS } from '@payos/node'
import { Prisma } from '@prisma/client'
import { createClient } from '@/utils/supabase/server'
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

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const orderCode = Number(searchParams.get('orderCode'))
    return await verifyOrderForUser(orderCode, user.id)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    logger.error('Verify Order Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
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
    const body = (await req.json()) as { orderCode?: number }
    const orderCode = Number(body.orderCode)
    return await verifyOrderForUser(orderCode, user.id)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    logger.error('Verify Order Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function verifyOrderForUser(orderCode: number, userId: string) {
  if (!orderCode || Number.isNaN(orderCode)) {
    return NextResponse.json({ error: 'Missing or invalid orderCode' }, { status: 400 })
  }

  const order = await PaymentRepository.findOrderForVerify(orderCode, userId)
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const paymentLinkInfo = (await payos.paymentRequests.get(orderCode)) as unknown
  const payosRaw =
    paymentLinkInfo && typeof paymentLinkInfo === 'object'
      ? (paymentLinkInfo as Record<string, unknown>)
      : {}
  const paymentStatus = String(payosRaw.status || 'UNKNOWN').toUpperCase()
  const now = new Date()

  await PaymentRepository.touchOrderVerifiedAt(order.id, now)

  if (paymentStatus === 'PAID') {
    if (order.status !== 'SUCCESS') {
      const durationInMonths = getDurationByPlan(order.planId)
      const proEndDate = new Date()
      proEndDate.setMonth(proEndDate.getMonth() + durationInMonths)

      await PaymentRepository.markVerifyPaid({
        orderId: order.id,
        orderUserId: order.userId,
        planId: order.planId,
        paidAt: order.paidAt,
        userCouponId: order.userCouponId,
        now,
        proEndDate,
        payosTransactionId: ((payosRaw.transactionId as string | undefined) ?? orderCode.toString()),
        payosReference:
          (payosRaw.reference as string | undefined) ??
          (payosRaw.checkoutUrl as string | undefined) ??
          null,
        payosRaw: payosRaw as Prisma.InputJsonValue,
      })

      await createUserNotification({
        userId: order.userId,
        type: 'PURCHASE_SUCCESS',
        title: 'Thanh toán thành công',
        message: `Bạn đã nâng cấp gói ${order.planId}.`,
        dedupeKey: `purchase_success:${order.id}`,
      }).catch((error) => {
        logger.error('Create purchase notification error:', error)
      })
    }

    return NextResponse.json({
      success: true,
      status: paymentStatus,
      planId: order.planId,
      checkedAt: new Date().toISOString(),
    })
  }

  if ((paymentStatus === 'CANCELLED' || paymentStatus === 'EXPIRED') && order.status === 'PENDING') {
    await PaymentRepository.markVerifyNonPaid({
      orderId: order.id,
      paymentStatus,
      cancelledAt: order.cancelledAt,
      expiredAt: order.expiredAt,
      now,
      payosRaw: payosRaw as Prisma.InputJsonValue,
    })
  }

  return NextResponse.json({
    success: false,
    status: paymentStatus,
    planId: order.planId,
    checkedAt: new Date().toISOString(),
  })
}
