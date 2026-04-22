import { NextResponse } from 'next/server'
import { PayOS } from '@payos/node'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID!,
  apiKey: process.env.PAYOS_API_KEY!,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = (await req.json()) as {
      amount: number
      description: string
      planId: string
    }

    const orderCode = Number(Date.now().toString().slice(-9))

    await prisma.order.create({
      data: {
        orderCode,
        userId: user.id,
        planId: payload.planId,
        amount: payload.amount,
        status: 'PENDING',
      },
    })

    const checkoutBaseUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/dashboard/payments/checkout?orderCode=${orderCode}`

    const body = {
      orderCode,
      amount: payload.amount,
      description: payload.description,
      returnUrl: checkoutBaseUrl,
      cancelUrl: `${process.env.NEXT_PUBLIC_DOMAIN}/dashboard/plans?payment=cancelled`,
    }

    const paymentLinkResponse = await payos.paymentRequests.create(body)

    return NextResponse.json({
      checkoutUrl: paymentLinkResponse.checkoutUrl,
      qrCode: paymentLinkResponse.qrCode,
      description: paymentLinkResponse.description,
      payosAmount: paymentLinkResponse.amount,
      orderCode,
      planId: payload.planId,
      amount: payload.amount,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    console.error('PayOS Create Link Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
