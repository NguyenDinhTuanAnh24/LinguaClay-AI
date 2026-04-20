import { NextResponse } from 'next/server'
import { PayOS } from '@payos/node'
import { prisma } from '@/lib/prisma'

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID!,
  apiKey: process.env.PAYOS_API_KEY!,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY!
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // 1. Xác thực Webhook (Hàm verify trả về Promise)
    const webhookData = await payos.webhooks.verify(body)

    if (webhookData) {
      const orderCode = webhookData.orderCode
      
      // @ts-ignore
      const order = await prisma.order.findUnique({
        where: { orderCode: orderCode },
        include: { user: true }
      })

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // @ts-ignore
      if (order.status === 'SUCCESS') {
        return NextResponse.json({ message: 'Already processed' })
      }

      let durationInMonths = 3
      // @ts-ignore
      if (order.planId === '1_YEAR') durationInMonths = 12
      // @ts-ignore
      else if (order.planId === '6_MONTHS') durationInMonths = 6

      const proEndDate = new Date()
      proEndDate.setMonth(proEndDate.getMonth() + durationInMonths)

      // 3. Thực hiện Transaction cập nhật trạng thái
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

      console.log(`✅ Kích hoạt PRO thành công via Webhook!`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('PayOS Webhook Error:', error)
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
