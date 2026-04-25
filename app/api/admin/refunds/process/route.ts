import { ensureAdminActor } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { isAdminUser } from '@/lib/admin'
import { createUserNotification } from '@/lib/user-notifications'
import { sendSystemEmail } from '@/lib/email'

type RefundType = 'FULL' | 'PARTIAL'

type ProcessPayload = {
  refundRequestId?: string
  refundType?: RefundType
  partialAmount?: number
  note?: string
}



export async function POST(req: Request) {
  try {
    const actor = await ensureAdminActor()
    if (!actor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const payload = (await req.json()) as ProcessPayload
    const refundRequestId = (payload.refundRequestId || '').trim()
    const refundType = payload.refundType || 'FULL'
    const note = (payload.note || '').trim()

    if (!refundRequestId) {
      return NextResponse.json({ error: 'Missing refundRequestId' }, { status: 400 })
    }
    if (refundType !== 'FULL' && refundType !== 'PARTIAL') {
      return NextResponse.json({ error: 'Invalid refundType' }, { status: 400 })
    }

    const requestRow = await prisma.refundRequest.findUnique({
      where: { id: refundRequestId },
      select: {
        id: true,
        status: true,
        userId: true,
        orderId: true,
        order: {
          select: {
            id: true,
            amount: true,
          },
        },
      },
    })
    if (!requestRow) {
      return NextResponse.json({ error: 'Refund request not found' }, { status: 404 })
    }
    if (requestRow.status !== 'PENDING') {
      return NextResponse.json({ error: 'Refund request is no longer pending' }, { status: 400 })
    }

    const partialAmountRaw = Number(payload.partialAmount || 0)
    const refundAmount =
      refundType === 'FULL'
        ? requestRow.order.amount
        : Number.isFinite(partialAmountRaw)
          ? Math.round(partialAmountRaw)
          : 0

    if (refundType === 'PARTIAL' && (refundAmount <= 0 || refundAmount > requestRow.order.amount)) {
      return NextResponse.json({ error: 'Invalid partial amount' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.refundRequest.update({
        where: { id: requestRow.id },
        data: {
          status: 'APPROVED',
          processedBy: actor.email || actor.id,
          processedAt: new Date(),
          note:
            note ||
            `\u0110\u00e3 ho\u00e0n + ${new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              maximumFractionDigits: 0,
            }).format(refundAmount)}`,
        },
      })

      await tx.order.update({
        where: { id: requestRow.orderId },
        data: {
          refundStatus: 'APPROVED',
        },
      })

      await tx.user.update({
        where: { id: requestRow.userId },
        data: {
          isPro: false,
          proType: null,
          proStartDate: null,
          proEndDate: null,
        },
      })

      await tx.paymentEvent.create({
        data: {
          orderId: requestRow.orderId,
          eventType: 'REFUND_APPROVED',
          source: 'ADMIN_PANEL',
          payload: {
            refundType,
            refundAmount,
            processedBy: actor.email || actor.id,
          },
        },
      })
    })

    await createUserNotification({
      userId: requestRow.userId,
      type: 'ADMIN_PLAN_CANCELED',
      title: 'Gói học bị hủy',
      message: `Admin đã xử lý hoàn tiền và hủy gói Pro của bạn (${refundType}).`,
      dedupeKey: `admin_refund_canceled:${requestRow.id}`,
    }).catch((error) => {
      logger.error('Create refund cancellation notification error:', error)
    })

    const userToEmail = await prisma.user.findUnique({
      where: { id: requestRow.userId },
      select: { email: true }
    })

    if (userToEmail?.email) {
      const subject = `Thông báo từ LinguaClay: Đã phê duyệt yêu cầu hoàn tiền`
      const htmlBody = `<p style="white-space: pre-wrap;">${note || 'Admin đã phê duyệt yêu cầu hoàn tiền của bạn.'}</p>`
      const textBody = note || 'Admin đã phê duyệt yêu cầu hoàn tiền của bạn.'
      
      const emailRes = await sendSystemEmail(userToEmail.email, subject, htmlBody, textBody)
      if (!emailRes.sent) {
        logger.error('Refund email failed to send:', emailRes.error)
      } else {
        logger.info(`[EMAIL DISPATCHED] Refund confirmation to user via ${emailRes.provider}`)
      }
    }

    return NextResponse.json({
      ok: true,
      refundRequestId,
      refundAmount,
      refundType,
    })
  } catch (error) {
    logger.error('Admin process refund error:', error)
    return NextResponse.json({ error: 'Không thể xử lý hoàn tiền' }, { status: 500 })
  }
}
