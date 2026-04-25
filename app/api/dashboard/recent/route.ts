import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { DashboardRepository } from '@/repositories/dashboard.repository'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const topic = await DashboardRepository.findRecentTopicForUser(user.id)
    return NextResponse.json({ topic })
  } catch (error) {
    logger.error('Recent topic error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
