import { prisma } from '@/lib/prisma'
import { NguoiDungClient, type UserPanelItem } from './ui-client'
import { createClient } from '@/utils/supabase/server'
import { ADMIN_EMAILS, isAdminUser } from '@/lib/admin'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function getInitials(name: string, email: string): string {
  const base = name.trim() || email.split('@')[0] || 'U'
  const parts = base.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase()
}

function toDayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function calcStreak(dayKeys: string[]): number {
  if (dayKeys.length === 0) return 0
  const unique = Array.from(new Set(dayKeys)).sort().reverse()
  let streak = 0
  const cursor = new Date(`${unique[0]}T00:00:00+07:00`)
  for (const day of unique) {
    const current = new Date(`${day}T00:00:00+07:00`)
    if (current.getTime() === cursor.getTime()) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

function normalizePlanLabel(isPro: boolean, proType: string | null): string {
  if (!isPro) return 'Bản miễn phí'
  const key = (proType || '').toUpperCase()
  if (key.includes('3_MONTHS')) return 'Bản tiêu chuẩn (3 tháng)'
  if (key.includes('6_MONTHS')) return 'Bản chuyên sâu (6 tháng)'
  if (key.includes('1_YEAR') || key.includes('12') || key.includes('YEAR')) return 'Bản toàn diện (1 năm)'
  const adminMatch = key.match(/ADMIN_GRANTED_(\d+)M/)
  if (adminMatch) return `Gói ADMIN cấp (${adminMatch[1]} tháng)`
  return 'Đã nâng cấp'
}

function isYearPlan(isPro: boolean, proType: string | null): boolean {
  if (!isPro) return false
  const key = (proType || '').toUpperCase()
  if (key.includes('1_YEAR') || key.includes('YEAR') || key.includes('12_MONTHS')) return true
  const adminMatch = key.match(/ADMIN_GRANTED_(\d+)M/)
  if (adminMatch) return Number(adminMatch[1]) >= 12
  return false
}

export default async function NguoiDungPage() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  const canManage = !!authUser && isAdminUser(authUser)

  type RawUserRow = {
    id: string
    name: string | null
    email: string
    image: string | null
    isPro: boolean
    proType: string | null
    isActive: boolean
    isBanned: boolean
    createdAt: Date
    dailyStudyStats: Array<{ date: Date; activeSeconds: number }>
    _count: { progress: number }
  }

  let rawUsers: RawUserRow[] = []
  try {
    rawUsers = (await prisma.user.findMany({
      where: { email: { notIn: ADMIN_EMAILS } },
      orderBy: { createdAt: 'desc' },
      take: 300,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isPro: true,
        proType: true,
        isActive: true,
        isBanned: true,
        createdAt: true,
        dailyStudyStats: {
          where: { activeSeconds: { gt: 0 } },
          orderBy: { date: 'desc' },
          take: 120,
          select: {
            date: true,
            activeSeconds: true,
          },
        },
        _count: {
          select: { progress: true },
        },
      },
    })) as RawUserRow[]
  } catch {
    // Fallback for stale Prisma client that doesn't include new user status fields.
    const legacyRows = await prisma.user.findMany({
      where: { email: { notIn: ADMIN_EMAILS } },
      orderBy: { createdAt: 'desc' },
      take: 300,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isPro: true,
        proType: true,
        createdAt: true,
        _count: {
          select: { progress: true },
        },
      },
    })

    rawUsers = legacyRows.map((u) => ({
      ...u,
      isActive: true,
      isBanned: false,
      dailyStudyStats: [],
    }))
  }

  const userIds = rawUsers.map((u) => u.id)
  const reviewedRows = userIds.length
    ? await prisma.userProgress.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, lastReviewed: { not: null } },
        _count: { _all: true },
      })
    : []

  const reviewedMap = new Map(reviewedRows.map((row) => [row.userId, row._count._all]))
  const users: UserPanelItem[] = rawUsers.map((user) => {
    const dayKeys = user.dailyStudyStats.map((s) => toDayKey(s.date))
    const streak = calcStreak(dayKeys)
    const status: 'Active' | 'Banned' = user.isBanned || !user.isActive ? 'Banned' : 'Active'

    const totalProgress = user._count.progress
    const reviewed = reviewedMap.get(user.id) ?? 0

    return {
      id: user.id,
      name: user.name?.trim() || 'Chưa cập nhật',
      email: user.email,
      avatar: getInitials(user.name || '', user.email),
      avatarUrl: user.image || null,
      plan: user.isPro ? 'Pro' : 'Free',
      planLabel: normalizePlanLabel(user.isPro, user.proType),
      isYearPlan: isYearPlan(user.isPro, user.proType),
      isActive: user.isActive,
      isBanned: user.isBanned,
      streak,
      joinedAt: formatDate(user.createdAt),
      status,
      srsProgress: `${reviewed}/${totalProgress} từ đã ôn`,
      studyHistory: user.dailyStudyStats.slice(0, 3).map((s) => `${formatDate(s.date)}: ${Math.round(s.activeSeconds / 60)} phút`),
    }
  })

  return <NguoiDungClient users={users} canManage={canManage} />
}
