import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { normalizeCefrLevel } from '@/lib/levels'
import { UserRepository } from '@/repositories/user.repository'
import { OrderRepository } from '@/repositories/order.repository'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await UserRepository.findProfileById(user.id)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const latestOrder = await OrderRepository.findLatestSuccessByUserId(user.id)
    const latestRefundRequest = latestOrder
      ? await UserRepository.findLatestRefundRequestByOrderId(latestOrder.id)
      : null

    return NextResponse.json({
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
