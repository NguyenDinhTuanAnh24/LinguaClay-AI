import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Tìm progress gần nhất có topicId
    const recentProgress = await prisma.userProgress.findFirst({
      where: {
        userId: user.id,
        lastReviewed: { not: null },
        word: { topicId: { not: null } }
      },
      orderBy: { lastReviewed: 'desc' },
      include: {
        word: {
          include: {
            topic: true
          }
        }
      }
    })

    const topic = recentProgress?.word?.topic || null

    return NextResponse.json({ topic })
  } catch (error) {
    logger.error('Recent topic error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
