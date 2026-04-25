import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { clampSeconds, getVNDayStartDate, STUDY_GOAL_SECONDS } from '@/app/api/study-time/_helpers'
import { createUserNotification } from '@/lib/user-notifications'
import { StudyTimeRepository } from '@/repositories/study-time.repository'
import { z } from 'zod'

const HeartbeatPayloadSchema = z
  .object({
    activeSeconds: z.number().int().min(0).max(3600).optional(),
  })
  .strict()

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let bodyRaw: unknown
    try {
      bodyRaw = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }
    const parseResult = HeartbeatPayloadSchema.safeParse(bodyRaw)
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parseResult.error.flatten() }, { status: 400 })
    }

    const incrementBy = clampSeconds(parseResult.data.activeSeconds ?? 0)
    if (incrementBy <= 0) {
      return NextResponse.json({ activeSeconds: 0, goalSeconds: STUDY_GOAL_SECONDS })
    }

    const date = getVNDayStartDate()
    const now = new Date()
    const existing = await StudyTimeRepository.findDailyActiveSeconds(user.id, date)
    const previousActiveSeconds = existing?.activeSeconds ?? 0

    const updated = await StudyTimeRepository.upsertDailyActiveSeconds({
      userId: user.id,
      date,
      incrementBy,
      now,
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
