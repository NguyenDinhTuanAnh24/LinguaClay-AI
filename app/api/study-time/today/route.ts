import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { getVNDayStartDate, STUDY_GOAL_SECONDS } from '@/app/api/study-time/_helpers'

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

    const stat = await prisma.userDailyStudy.findUnique({
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
