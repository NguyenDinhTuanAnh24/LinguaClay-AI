import { KiemSoatAIClient, type ChatLogView, type TokenDayView } from './ui-client'
import { loadAiControlReportData } from '@/services/reporting/ai-control.loader'

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
  const { writingSessions, listening, reading, speaking, editor } = await loadAiControlReportData()

  const chatLogs: ChatLogView[] = [
    ...writingSessions.map((s) => {
      const tokens = estimateTokens(s.userContent, s.aiFeedback)
      return {
        id: s.id,
        user: s.user.name || s.user.email,
        time: formatDateTime(s.createdAt),
        dayKey: getVNDayKey(s.createdAt),
        messages: s.aiFeedback ? 2 : 1,
        tokens,
        flagged: tokens >= 3500,
        uContent: s.userContent,
        aiContent: typeof s.aiFeedback === 'string' ? s.aiFeedback : JSON.stringify(s.aiFeedback, null, 2),
      }
    }),
    ...listening.map((s) => {
      const tokens = estimateTokens(s.transcriptEn, s.feedbackVi)
      return {
        id: s.id,
        user: s.user.name || s.user.email,
        time: formatDateTime(s.createdAt),
        dayKey: getVNDayKey(s.createdAt),
        messages: 2,
        tokens,
        flagged: tokens >= 3500,
        uContent: '(Luyen nghe) Topic: ' + ((s as { topicHint?: string }).topicHint || 'N/A'),
        aiContent: `Transcript:\n${s.transcriptEn}\n\nFeedback:\n${s.feedbackVi}`,
      }
    }),
    ...reading.map((s) => {
      const tokens = estimateTokens(s.passageEn, s.feedbackVi)
      return {
        id: s.id,
        user: s.user.name || s.user.email,
        time: formatDateTime(s.createdAt),
        dayKey: getVNDayKey(s.createdAt),
        messages: 2,
        tokens,
        flagged: tokens >= 3500,
        uContent: '(Luyen doc) Topic: ' + ((s as { topicHint?: string }).topicHint || 'N/A'),
        aiContent: `Passage:\n${s.passageEn}\n\nFeedback:\n${s.feedbackVi}`,
      }
    }),
    ...speaking.map((s) => {
      const tokens = estimateTokens(JSON.stringify(s.userAnswers), s.feedbackVi)
      return {
        id: s.id,
        user: s.user.name || s.user.email,
        time: formatDateTime(s.createdAt),
        dayKey: getVNDayKey(s.createdAt),
        messages: 2,
        tokens,
        flagged: tokens >= 3500,
        uContent: '(Luyen noi) Answers: ' + JSON.stringify(s.userAnswers),
        aiContent: `Feedback:\n${s.feedbackVi}`,
      }
    }),
    ...editor.map((s) => {
      const tokens = estimateTokens(s.inputText, s.shortFeedbackVi)
      return {
        id: s.id,
        user: s.user.name || s.user.email,
        time: formatDateTime(s.createdAt),
        dayKey: getVNDayKey(s.createdAt),
        messages: 2,
        tokens,
        flagged: tokens >= 3500,
        uContent: s.inputText,
        aiContent: s.shortFeedbackVi,
      }
    }),
  ].sort((a, b) => new Date(b.dayKey + 'T' + b.time.slice(0, 5)).getTime() - new Date(a.dayKey + 'T' + a.time.slice(0, 5)).getTime())

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
