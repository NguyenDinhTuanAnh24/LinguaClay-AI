import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import Groq from 'groq-sdk'
import { z } from 'zod'
import { VIETNAM_TIMEZONE_OFFSET } from '@/lib/constants'
import { sanitizeUserPrompt } from '@/lib/sanitizer'
import { applyRateLimit } from '@/lib/rate-limit'
import { type NextRequest } from 'next/server'

const ChatRequestSchema = z.object({
  mode: z.enum(['roleplay', 'freeTalk']).optional(),
  message: z.string().optional(),
  history: z.unknown().optional(),
  scenarioTitle: z.string().optional(),
  start: z.boolean().optional(),
  turnCount: z.number().optional(),
  targetWords: z.array(z.string()).optional(),
  roleplayAction: z.enum(['hint', 'explain']).optional()
})

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

type ChatTurn = {
  role: 'user' | 'assistant'
  content: string
}

type RoleplayResult = {
  reply: string
  reminderVi: string
  targetWords: string[]
  shouldWrapUp: boolean
  wrapUpVi?: string
  wrapUpEn?: string
  coachText?: string
}

type FreeTalkResult = {
  answerEn: string
  exampleEn: string
  explainVi: string
}

function getVNDayStart(date = new Date()) {
  const localVN = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))
  localVN.setHours(0, 0, 0, 0)
  const utc = new Date(localVN.getTime() - VIETNAM_TIMEZONE_OFFSET)
  return utc
}

function toSafeTurns(input: unknown): ChatTurn[] {
  if (!Array.isArray(input)) return []
  return input
    .slice(-10)
    .map((item) => {
      const maybeObject = item && typeof item === 'object' ? (item as { role?: unknown; content?: unknown }) : null
      const role: ChatTurn['role'] = maybeObject?.role === 'assistant' ? 'assistant' : 'user'
      const content = typeof maybeObject?.content === 'string' ? sanitizeUserPrompt(maybeObject.content) : ''
      return { role, content }
    })
    .filter((t) => t.content.length > 0)
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 20 requests/minute per IP
    const rl = await applyRateLimit(req, 'ai')
    if (!rl.ok) return rl.response

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bodyRaw = await req.json()
    const parseResult = ChatRequestSchema.safeParse(bodyRaw)

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid request payload', details: parseResult.error.issues }, { status: 400 })
    }

    const body = parseResult.data

    const mode = body.mode
    if (mode !== 'roleplay' && mode !== 'freeTalk') {
      return NextResponse.json({ error: 'Unsupported mode' }, { status: 400 })
    }

    const turns = toSafeTurns(body.history)
    const message = sanitizeUserPrompt(body.message || '')

    if (mode === 'roleplay') {
      const scenarioTitle = (body.scenarioTitle || '').trim() || 'Conversation Practice'
      const start = Boolean(body.start)
      const turnCount = typeof body.turnCount === 'number' ? body.turnCount : 0
      const roleplayAction = body.roleplayAction

      let targetWords = Array.isArray(body.targetWords)
        ? body.targetWords.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 5)
        : []

      if (targetWords.length === 0) {
        const progresses = await prisma.userProgress.findMany({
          where: {
            userId: user.id,
            OR: [{ lastReviewed: { gte: getVNDayStart() } }, { masteryLevel: { lte: 2 } }],
          },
          include: { word: true },
          orderBy: [{ lastReviewed: 'desc' }, { updatedAt: 'desc' }],
          take: 6,
        })
        targetWords = progresses.map((p) => p.word?.original).filter((w): w is string => Boolean(w)).slice(0, 4)
      }

      if (roleplayAction === 'hint' || roleplayAction === 'explain') {
        const latestUser = [...turns].reverse().find((t) => t.role === 'user')?.content || ''
        const latestAssistant = [...turns].reverse().find((t) => t.role === 'assistant')?.content || ''
        const coachPrompt = roleplayAction === 'hint'
          ? `
Bạn là coach tiếng Anh cho mode Roleplay.
Kịch bản: "${scenarioTitle}"
Từ mục tiêu: ${targetWords.join(', ') || 'không có'}
Tin nhắn user gần nhất: "${latestUser}"
Phản hồi AI gần nhất: "${latestAssistant}"

Hãy trả về 1 đoạn coaching ngắn bằng tiếng Việt:
- Gợi ý 1 câu trả lời mẫu (tiếng Anh) cho lượt kế tiếp.
- Cố gắng dùng ít nhất 2 từ mục tiêu nếu có.
- Giữ ngắn gọn, trực diện.
`
          : `
Bạn là coach tiếng Anh cho mode Roleplay.
Kịch bản: "${scenarioTitle}"
Tin nhắn user gần nhất: "${latestUser}"

Hãy giải thích lỗi chính trong câu user bằng tiếng Việt:
- Nêu lỗi nào cần sửa trước.
- Đưa bản sửa ngắn (tiếng Anh).
- Không dài quá 4 câu.
`

        const coachCompletion = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: coachPrompt }],
          temperature: 0.3,
        })
        const coachText = coachCompletion.choices[0]?.message?.content?.trim() || 'Chưa có gợi ý phù hợp cho lượt này.'
        return NextResponse.json({
          result: {
            reply: '',
            reminderVi: '',
            targetWords,
            shouldWrapUp: false,
            coachText,
          } satisfies RoleplayResult,
        })
      }

      const normalizedMessage = message.toLowerCase()
      const usedWords = targetWords.filter((w) => normalizedMessage.includes(w.toLowerCase()))
      const needsReminder = !start && message.length > 0 && usedWords.length < Math.min(2, targetWords.length || 2)
      const shouldWrapUp = turnCount >= 6

      const prompt = `
You are an AI Tutor in Roleplay mode.
Scenario: "${scenarioTitle}".
Stay in character and reply in natural English only.

Target words: ${targetWords.join(', ') || 'none'}
The learner should try to use at least 2 target words.

State:
- start: ${start ? 'true' : 'false'}
- turnCount: ${turnCount}
- needsReminder: ${needsReminder ? 'true' : 'false'}
- shouldWrapUp: ${shouldWrapUp ? 'true' : 'false'}

History:
${turns.map((t) => `${t.role}: ${t.content}`).join('\n')}

Current learner message:
${message || '(none - start conversation)'}

Return pure JSON:
{
  "reply": "roleplay reply in English",
  "reminderVi": "short Vietnamese reminder if learner forgot target words",
  "targetWords": ["..."],
  "shouldWrapUp": boolean,
  "wrapUpEn": "if shouldWrapUp=true, short English wrap-up",
  "wrapUpVi": "if shouldWrapUp=true, short Vietnamese coaching note"
}
`

      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      })

      const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}') as Partial<RoleplayResult>
      const result: RoleplayResult = {
        reply:
          typeof parsed.reply === 'string'
            ? parsed.reply
            : 'Let us begin. Please introduce yourself briefly and share your current goal.',
        reminderVi:
          typeof parsed.reminderVi === 'string'
            ? parsed.reminderVi
            : needsReminder
              ? 'Bạn thử dùng thêm từ vựng mục tiêu trong câu trả lời nhé.'
              : '',
        targetWords: Array.isArray(parsed.targetWords) && parsed.targetWords.length > 0 ? parsed.targetWords.slice(0, 5) : targetWords,
        shouldWrapUp: typeof parsed.shouldWrapUp === 'boolean' ? parsed.shouldWrapUp : shouldWrapUp,
        wrapUpEn: typeof parsed.wrapUpEn === 'string' ? parsed.wrapUpEn : undefined,
        wrapUpVi: typeof parsed.wrapUpVi === 'string' ? parsed.wrapUpVi : undefined,
      }

      await prisma.tutorRoleplayTurn.create({
        data: {
          userId: user.id,
          scenarioTitle,
          turnCount,
          targetWords,
          history: turns as unknown as Prisma.InputJsonValue,
          userMessage: message || null,
          aiReply: result.reply || null,
          reminderVi: result.reminderVi || null,
          wrapUpEn: result.wrapUpEn || null,
          wrapUpVi: result.wrapUpVi || null,
        },
      })

      return NextResponse.json({ result })
    }

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    const prompt = `
You are an AI Tutor in Free Talk & Q&A mode.
Learner question: "${message}"

Requirements:
- Main response must be in English.
- Keep it concise, practical, and natural.
- Add one short Vietnamese explanation note.
- Return pure JSON:
{
  "answerEn": "short answer in English",
  "exampleEn": "one concrete English example",
  "explainVi": "one short Vietnamese explanation/note"
}
`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}') as Partial<FreeTalkResult>
    const result: FreeTalkResult = {
      answerEn: typeof parsed.answerEn === 'string' ? parsed.answerEn : 'Use the form that matches context and time precision.',
      exampleEn: typeof parsed.exampleEn === 'string' ? parsed.exampleEn : 'Example: I arrived at 8 p.m.',
      explainVi:
        typeof parsed.explainVi === 'string'
          ? parsed.explainVi
          : 'Lưu ý phân biệt theo mức độ cụ thể của thời gian hoặc địa điểm.',
    }

    await prisma.tutorFreeTalkSession.create({
      data: {
        userId: user.id,
        question: message,
        answerEn: result.answerEn,
        exampleEn: result.exampleEn,
        explainVi: result.explainVi,
      },
    })

    return NextResponse.json({ result })
  } catch (error) {
    logger.error('AI Tutor Chat Error:', error)
    return NextResponse.json(
      {
        error: 'Chat failed',
        detail: error instanceof Error ? error.message : 'Unknown server error',
      },
      { status: 500 }
    )
  }
}
