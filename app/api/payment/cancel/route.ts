import { NextResponse } from 'next/server'
import { PayOS } from '@payos/node'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

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

    const order = await prisma.order.findFirst({
      where: { orderCode, userId: user.id },
      select: { id: true, status: true, cancelledAt: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'SUCCESS') {
      return NextResponse.json({ error: 'Paid order cannot be canceled' }, { status: 409 })
    }

    // Mandatory: cancel on PayOS first.
    const payosResult = await payos.paymentRequests.cancel(orderCode, reason)

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: order.cancelledAt ?? new Date(),
          verifiedAt: new Date(),
        },
      }),
      prisma.paymentEvent.create({
        data: {
          orderId: order.id,
          eventType: 'USER_CANCELLED',
          payosStatus: String(payosResult.status ?? 'CANCELLED').toUpperCase(),
          source: 'CANCEL_API',
          payload: payosResult as unknown as Record<string, unknown>,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      status: payosResult.status,
      canceledAt: payosResult.canceledAt,
      cancellationReason: payosResult.cancellationReason,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    console.error('Cancel Order Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
