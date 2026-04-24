import { NextResponse } from 'next/server'
import { PayOS } from '@payos/node'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID!,
  apiKey: process.env.PAYOS_API_KEY!,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
})

const PLAN_PRICE: Record<string, number> = {
  '3_MONTHS': 299000,
  '6_MONTHS': 399000,
  '1_YEAR': 499000,
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

    const payload = (await req.json()) as {
      description: string
      planId: string
      userCouponId?: string
    }

    const originalAmount = PLAN_PRICE[payload.planId] ?? 0
    if (!originalAmount) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    let discountAmount = 0
    let couponCode: string | null = null
    let userCouponId: string | null = null

    if (payload.userCouponId) {
      const assignment = await prisma.userCoupon.findFirst({
        where: {
          id: payload.userCouponId,
          userId: user.id,
          status: 'AVAILABLE',
        },
        select: {
          id: true,
          coupon: {
            select: {
              code: true,
              discountPercent: true,
              usageLimit: true,
              usedCount: true,
              isActive: true,
              expiresAt: true,
            },
          },
        },
      })

      if (!assignment) {
        return NextResponse.json({ error: 'Khuyến mãi không hợp lệ hoặc đã dùng' }, { status: 400 })
      }

      const now = new Date()
      if (!assignment.coupon.isActive || assignment.coupon.expiresAt < now) {
        return NextResponse.json({ error: 'Khuyến mãi đã hết hiệu lực' }, { status: 400 })
      }
      if (assignment.coupon.usedCount >= assignment.coupon.usageLimit) {
        return NextResponse.json({ error: 'Khuyến mãi đã đạt giới hạn sử dụng' }, { status: 400 })
      }

      discountAmount = Math.floor((originalAmount * assignment.coupon.discountPercent) / 100)
      couponCode = assignment.coupon.code
      userCouponId = assignment.id
    }

    const finalAmount = Math.max(1000, originalAmount - discountAmount)

    const orderCode = Number(Date.now().toString().slice(-9))

    const createdOrder = await prisma.order.create({
      data: {
        orderCode,
        userId: user.id,
        planId: payload.planId,
        amount: finalAmount,
        originalAmount,
        discountAmount,
        couponCode,
        userCouponId,
        status: 'PENDING',
      },
    })

    const checkoutBaseUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/dashboard/payments/checkout?orderCode=${orderCode}`

    const body = {
      orderCode,
      amount: finalAmount,
      description: payload.description,
      returnUrl: checkoutBaseUrl,
      cancelUrl: `${process.env.NEXT_PUBLIC_DOMAIN}/dashboard/plans?payment=cancelled`,
    }

    const paymentLinkResponse = await payos.paymentRequests.create(body)
    const payosRaw =
      paymentLinkResponse && typeof paymentLinkResponse === 'object'
        ? (paymentLinkResponse as Record<string, unknown>)
        : {}

    await prisma.$transaction([
      prisma.order.update({
        where: { id: createdOrder.id },
        data: {
          payosReference: (payosRaw.checkoutUrl as string | undefined) ?? null,
          verifiedAt: new Date(),
        },
      }),
      prisma.paymentEvent.create({
        data: {
          orderId: createdOrder.id,
          eventType: 'ORDER_CREATED',
          payosStatus: 'PENDING',
          source: 'CREATE_LINK',
          payload: {
            request: body,
            response: payosRaw,
          },
        },
      }),
    ])

    return NextResponse.json({
      checkoutUrl: paymentLinkResponse.checkoutUrl,
      qrCode: paymentLinkResponse.qrCode,
      description: paymentLinkResponse.description,
      payosAmount: paymentLinkResponse.amount,
      orderCode,
      planId: payload.planId,
      amount: finalAmount,
      originalAmount,
      discountAmount,
      couponCode,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    console.error('PayOS Create Link Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
