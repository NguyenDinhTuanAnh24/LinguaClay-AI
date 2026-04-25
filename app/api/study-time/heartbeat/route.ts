import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { clampSeconds, getVNDayStartDate, STUDY_GOAL_SECONDS } from '@/app/api/study-time/_helpers'
import { createUserNotification } from '@/lib/user-notifications'

type HeartbeatPayload = {
  activeSeconds?: number
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

    const body = (await req.json()) as HeartbeatPayload
    const incrementBy = clampSeconds(body.activeSeconds ?? 0)
    if (incrementBy <= 0) {
      return NextResponse.json({ activeSeconds: 0, goalSeconds: STUDY_GOAL_SECONDS })
    }

    const date = getVNDayStartDate()
    const now = new Date()
    const existing = await prisma.userDailyStudy.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
      select: {
        activeSeconds: true,
      },
    })
    const previousActiveSeconds = existing?.activeSeconds ?? 0

    const updated = await prisma.userDailyStudy.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
      update: {
        activeSeconds: { increment: incrementBy },
        lastActiveAt: now,
      },
      create: {
        userId: user.id,
        date,
        activeSeconds: incrementBy,
        lastActiveAt: now,
      },
      select: {
        activeSeconds: true,
      },
    })

    if (previousActiveSeconds < STUDY_GOAL_SECONDS && updated.activeSeconds >= STUDY_GOAL_SECONDS) {
      const dayKey = date.toISOString().slice(0, 10)
      await createUserNotification({
        userId: user.id,
        type: 'GOAL_REACHED',
        title: 'Đạt mục tiêu học tập',
        message: 'Bạn đã hoàn thành mục tiêu học tập hôm nay.',
        dedupeKey: `goal_reached:${user.id}:${dayKey}`,
      }).catch((error) => {
        logger.error('Create study goal notification error:', error)
      })
    }

    return NextResponse.json({
      activeSeconds: updated.activeSeconds,
      goalSeconds: STUDY_GOAL_SECONDS,
      date: date.toISOString(),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
