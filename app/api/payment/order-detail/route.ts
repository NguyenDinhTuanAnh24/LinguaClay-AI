import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { PayOS } from '@payos/node'
import { createClient } from '@/utils/supabase/server'
import { PaymentRepository } from '@/repositories/payment.repository'

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID!,
  apiKey: process.env.PAYOS_API_KEY!,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
})

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

    if (!orderCode || Number.isNaN(orderCode)) {
      return NextResponse.json({ error: 'Missing or invalid orderCode' }, { status: 400 })
    }

    const order = await PaymentRepository.findOrderByCode(orderCode)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const ownedOrder = await PaymentRepository.findOwnedOrder(orderCode, user.id)
    if (!ownedOrder) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payosResponse = (await payos.paymentRequests.get(orderCode)) as unknown
    const payosRaw =
      payosResponse && typeof payosResponse === 'object'
        ? (payosResponse as Record<string, unknown>)
        : {}

    return NextResponse.json({
      order: {
        id: order.id,
        orderCode: order.orderCode,
        planId: order.planId,
        amount: order.amount,
        originalAmount: order.originalAmount,
        discountAmount: order.discountAmount,
        couponCode: order.couponCode,
        status: order.status,
        createdAt: order.createdAt,
      },
      payos: {
        status: (payosRaw.status as string | null) ?? null,
        checkoutUrl: (payosRaw.checkoutUrl as string | null) ?? null,
        qrCode: (payosRaw.qrCode as string | null) ?? null,
        amount: (payosRaw.amount as number | null) ?? order.amount,
        description: (payosRaw.description as string | null) ?? null,
        accountName: (payosRaw.accountName as string | null) ?? null,
        accountNumber: (payosRaw.accountNumber as string | null) ?? null,
        bin: (payosRaw.bin as string | null) ?? null,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    logger.error('Order Detail Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
