import { NextResponse } from 'next/server'
import { PayOS } from '@payos/node'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID!,
  apiKey: process.env.PAYOS_API_KEY!,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY!
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, description, planId } = await req.json()

    // orderCode phải là số nguyên và duy nhất
    const orderCode = Number(Date.now().toString().slice(-9))

    // @ts-ignore - Bỏ qua lỗi IDE chưa cập nhật Order model
    await prisma.order.create({
      data: {
        orderCode: orderCode,
        userId: user.id,
        planId: planId,
        amount: amount,
        status: 'PENDING'
      }
    })

    const body = {
      orderCode: orderCode,
      amount: amount,
      description: description,
      returnUrl: `${process.env.NEXT_PUBLIC_DOMAIN}/dashboard/plans?status=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_DOMAIN}/dashboard/plans?status=cancelled`,
    }

    // Sử dụng phương thức create của paymentRequests
    const paymentLinkResponse = await payos.paymentRequests.create(body)

    return NextResponse.json({ checkoutUrl: paymentLinkResponse.checkoutUrl })
  } catch (error: any) {
    console.error('PayOS Create Link Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
