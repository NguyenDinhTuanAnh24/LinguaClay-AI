import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { SupportRepository } from '@/repositories/support.repository'

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

    const [supportRows, refundRows] = await SupportRepository.findSupportRefundHistoryByUserId(user.id)

    return NextResponse.json({
      ok: true,
      supportTickets: supportRows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
      refundRequests: refundRows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        processedAt: row.processedAt?.toISOString() || null,
      })),
    })
  } catch (error) {
    logger.error('User support-refund history error:', error)
    return NextResponse.json({ error: 'Không thể tải lịch sử hỗ trợ/hoàn tiền' }, { status: 500 })
  }
}
