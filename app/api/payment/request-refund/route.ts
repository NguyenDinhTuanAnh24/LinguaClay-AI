import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, reason, bankName, accountNumber, accountName } = await req.json()

    if (!bankName || !accountNumber || !accountName) {
      return NextResponse.json({ error: 'Vui lòng cung cấp đầy đủ thông tin ngân hàng' }, { status: 400 })
    }

    // 1. Tìm đơn hàng và kiểm tra điều kiện
    // @ts-ignore
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // @ts-ignore
    if (order.status !== 'SUCCESS') {
      return NextResponse.json({ error: 'Only successful orders can be refunded' }, { status: 400 })
    }

    // 2. Kiểm tra thời hạn 7 ngày
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // @ts-ignore
    if (new Date(order.createdAt) < sevenDaysAgo) {
      return NextResponse.json({ error: 'Refund period has expired (7 days)' }, { status: 400 })
    }

    // 3. Cập nhật trạng thái yêu cầu hoàn tiền
    // @ts-ignore
    await prisma.order.update({
      where: { id: orderId },
      data: {
        refundStatus: 'PENDING',
        refundReason: reason,
        refundBankName: bankName,
        refundAccountNumber: accountNumber,
        refundAccountName: accountName
      }
    })

    return NextResponse.json({ success: true, message: 'Yêu cầu hoàn tiền đã được gửi. Chúng tôi sẽ xử lý trong vòng 24h.' })
  } catch (error: any) {
    console.error('Refund Request Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
