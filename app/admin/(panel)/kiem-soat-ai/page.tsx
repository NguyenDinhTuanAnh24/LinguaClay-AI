import { prisma } from '@/lib/prisma'
import { KiemSoatAIClient, type ChatLogView, type TokenDayView } from './ui-client'

function getVNDayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function estimateTokens(userContent: string, aiFeedback: unknown): number {
  const userChars = userContent?.length || 0
  const aiChars = aiFeedback ? JSON.stringify(aiFeedback).length : 0
  return Math.max(1, Math.round((userChars + aiChars) / 4))
}

export default async function KiemSoatAIPage() {
  const sessions = await prisma.writingSession.findMany({
    orderBy: { createdAt: 'desc' },
    take: 400,
    select: {
      id: true,
      createdAt: true,
      userContent: true,
      aiFeedback: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  const chatLogs: ChatLogView[] = sessions.map((s) => {
    const tokens = estimateTokens(s.userContent, s.aiFeedback)
    return {
      id: s.id,
      user: s.user.name || s.user.email,
      time: formatDateTime(s.createdAt),
      dayKey: getVNDayKey(s.createdAt),
      messages: s.aiFeedback ? 2 : 1,
      tokens,
      flagged: tokens >= 3500,
    }
  })

  const tokenByDay = new Map<string, number>()
  for (const log of chatLogs) {
    tokenByDay.set(log.dayKey, (tokenByDay.get(log.dayKey) || 0) + log.tokens)
  }

  const tokenDaily: TokenDayView[] = Array.from(tokenByDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([dayKey, tokens]) => ({
      dayKey,
      day: `${dayKey.slice(8, 10)}/${dayKey.slice(5, 7)}`,
      tokens,
      usd: +(tokens * 0.00003).toFixed(2),
    }))

  return <KiemSoatAIClient tokenDaily={tokenDaily} chatLogs={chatLogs} />
}
