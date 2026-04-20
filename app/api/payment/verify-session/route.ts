import { NextResponse } from 'next/server'
import { PayOS } from '@payos/node'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID!,
  apiKey: process.env.PAYOS_API_KEY!,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY!
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orderCode = searchParams.get('orderCode')

    if (!orderCode) {
      return NextResponse.json({ error: 'Missing orderCode' }, { status: 400 })
    }

    // 1. Lấy thông tin thực tế từ PayOS
    const paymentLinkInfo = await payos.paymentRequests.get(Number(orderCode))

    if (paymentLinkInfo.status === 'PAID') {
      // 2. Tìm đơn hàng trong DB
      // @ts-ignore
      const order = await prisma.order.findUnique({
        where: { orderCode: Number(orderCode) },
      })

      if (order && order.status !== 'SUCCESS') {
        // 3. Kích hoạt PRO ngay lập tức
        let durationInMonths = 3
        // @ts-ignore
        if (order.planId === '1_YEAR') durationInMonths = 12
        // @ts-ignore
        else if (order.planId === '6_MONTHS') durationInMonths = 6

        const proEndDate = new Date()
        proEndDate.setMonth(proEndDate.getMonth() + durationInMonths)

        await prisma.$transaction([
          // @ts-ignore
          prisma.order.update({
            where: { id: order.id },
            data: { status: 'SUCCESS' }
          }),
          prisma.user.update({
            // @ts-ignore
            where: { id: order.userId },
            data: {
              // @ts-ignore
              isPro: true,
              // @ts-ignore
              proType: order.planId,
              // @ts-ignore
              proStartDate: new Date(),
              // @ts-ignore
              proEndDate: proEndDate
            }
          })
        ])
        return NextResponse.json({ success: true, message: 'PRO Activated' })
      }
      return NextResponse.json({ success: true, message: 'Already PRO' })
    }

    return NextResponse.json({ success: false, status: paymentLinkInfo.status })
  } catch (error: any) {
    console.error('Verify Order Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
