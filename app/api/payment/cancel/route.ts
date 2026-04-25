import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { PayOS } from '@payos/node'
import { Prisma } from '@prisma/client'
import { createClient } from '@/utils/supabase/server'
import { PaymentRepository } from '@/repositories/payment.repository'

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID!,
  apiKey: process.env.PAYOS_API_KEY!,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
})

type CancelPayload = {
  orderCode?: number
  reason?: string
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

    const payload = (await req.json()) as CancelPayload
    const orderCode = Number(payload.orderCode)
    const reason = (payload.reason || 'Canceled by user').slice(0, 180)

    if (!orderCode || Number.isNaN(orderCode)) {
      return NextResponse.json({ error: 'Missing or invalid orderCode' }, { status: 400 })
    }

    const order = await PaymentRepository.findOrderForCancel(orderCode, user.id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.status === 'SUCCESS') {
      return NextResponse.json({ error: 'Paid order cannot be canceled' }, { status: 409 })
    }

    const payosResult = await payos.paymentRequests.cancel(orderCode, reason)
    await PaymentRepository.markUserCancelled({
      orderId: order.id,
      cancelledAt: order.cancelledAt,
      payosStatus: String(payosResult.status ?? 'CANCELLED').toUpperCase(),
      payload: payosResult as unknown as Prisma.InputJsonValue,
    })

    return NextResponse.json({
      success: true,
      status: payosResult.status,
      canceledAt: payosResult.canceledAt,
      cancellationReason: payosResult.cancellationReason,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    logger.error('Cancel Order Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
