import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { normalizeCefrLevel } from '@/lib/levels'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const latestOrder = await prisma.order.findFirst({
      where: { userId: user.id, status: 'SUCCESS' },
      select: {
        id: true,
        orderCode: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const latestRefundRows =
      latestOrder
        ? await prisma.$queryRaw<Array<{ id: string; status: string; createdAt: Date }>>`
            SELECT id, status, "createdAt"
            FROM "RefundRequest"
            WHERE "orderId" = ${latestOrder.id}
            ORDER BY "createdAt" DESC
            LIMIT 1
          `
        : []

    const latestRefundRequest = latestRefundRows[0]
      ? {
          id: latestRefundRows[0].id,
          status: latestRefundRows[0].status,
          createdAt: latestRefundRows[0].createdAt,
        }
      : null

    const userWithoutOrders = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      image: dbUser.image,
      targetLanguage: dbUser.targetLanguage,
      proficiencyLevel: normalizeCefrLevel(dbUser.proficiencyLevel),
      isPro: dbUser.isPro,
      proType: dbUser.proType,
      proStartDate: dbUser.proStartDate,
      proEndDate: dbUser.proEndDate,
      phoneNumber: dbUser.phoneNumber,
      birthday: dbUser.birthday,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
      themePreference: dbUser.themePreference,
    }

    return NextResponse.json({
      ...userWithoutOrders,
      lastOrder: latestOrder
        ? {
            id: latestOrder.id,
            orderCode: latestOrder.orderCode,
            createdAt: latestOrder.createdAt,
            latestRefundRequest,
          }
        : null,
    })
  } catch (error) {
    logger.error('API User Me Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
