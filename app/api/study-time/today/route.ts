import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getVNDayStartDate, STUDY_GOAL_SECONDS } from '@/app/api/study-time/_helpers'
import { StudyTimeRepository } from '@/repositories/study-time.repository'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const date = getVNDayStartDate()

    const stat = await StudyTimeRepository.findDailyActiveSeconds(user.id, date)

    return NextResponse.json({
      activeSeconds: stat?.activeSeconds ?? 0,
      goalSeconds: STUDY_GOAL_SECONDS,
      date: date.toISOString(),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
