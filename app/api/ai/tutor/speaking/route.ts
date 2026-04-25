import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'
import { randomUUID } from 'crypto'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

type SpeakingPrompt = {
  title: string
  introVi: string
  questions: string[]
}

type SpeakingGradeResult = {
  score: number
  levelEstimate: string
  feedbackVi: string
  criteria: {
    fluency: number
    vocabulary: number
    grammar: number
    pronunciation: number
  }
  improvements: Array<{
    question: string
    issueVi: string
    fixVi: string
    sampleAnswerEn: string
  }>
}

function toSafePrompt(input: unknown): SpeakingPrompt | null {
  if (!input || typeof input !== 'object') return null
  const raw = input as { title?: unknown; introVi?: unknown; questions?: unknown }
  const questions = Array.isArray(raw.questions) ? raw.questions.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 12) : []
  if (typeof raw.title !== 'string' || questions.length < 5) return null
  return {
    title: raw.title.trim(),
    introVi: typeof raw.introVi === 'string' ? raw.introVi.trim() : 'AI hỏi tuần tự nhiều câu, bạn trả lời liên tục rồi chấm cuối phiên.',
    questions,
  }
}

function toSafeAnswers(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input.map((x) => String(x || '').trim()).slice(0, 12)
}

function estimateLevel(score: number) {
  if (score >= 90) return 'C1'
  if (score >= 75) return 'B2'
  if (score >= 60) return 'B1'
  if (score >= 45) return 'A2'
  return 'A1'
}

async function persistSpeakingSession(params: {
  userId: string
  title: string
  levelTarget: string
  topicHint: string | null
  promptData: SpeakingPrompt
  userAnswers: string[]
  result: SpeakingGradeResult
}) {
  const delegate = (prisma as unknown as {
    tutorSpeakingSession?: {
      create: (args: {
        data: {
          userId: string
          title: string
          levelTarget: string
          topicHint: string | null
          promptData: Prisma.InputJsonValue
          userAnswers: Prisma.InputJsonValue
          score: number
          feedbackVi: string
          criteria: Prisma.InputJsonValue
          improvements: Prisma.InputJsonValue
        }
      }) => Promise<unknown>
    }
  }).tutorSpeakingSession

  if (delegate?.create) {
    await delegate.create({
      data: {
        userId: params.userId,
        title: params.title,
        levelTarget: params.levelTarget,
        topicHint: params.topicHint,
        promptData: params.promptData as unknown as Prisma.InputJsonValue,
        userAnswers: params.userAnswers as unknown as Prisma.InputJsonValue,
        score: params.result.score,
        feedbackVi: params.result.feedbackVi,
        criteria: params.result.criteria as unknown as Prisma.InputJsonValue,
        improvements: params.result.improvements as unknown as Prisma.InputJsonValue,
      },
    })
    return
  }

  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "TutorSpeakingSession"
        ("id","userId","title","levelTarget","topicHint","promptData","userAnswers","score","feedbackVi","criteria","improvements")
      VALUES
        (
          ${randomUUID()},
          ${params.userId},
          ${params.title},
          ${params.levelTarget},
          ${params.topicHint},
          CAST(${JSON.stringify(params.promptData)} AS jsonb),
          CAST(${JSON.stringify(params.userAnswers)} AS jsonb),
          ${params.result.score},
          ${params.result.feedbackVi},
          CAST(${JSON.stringify(params.result.criteria)} AS jsonb),
          CAST(${JSON.stringify(params.result.improvements)} AS jsonb)
        )
    `
  )
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as {
      action?: 'generatePrompt' | 'gradeSpeaking'
      levelTarget?: string
      topicHint?: string
      prompt?: unknown
      answers?: unknown
    }
    const action = body.action || 'generatePrompt'
    const levelTarget = (body.levelTarget || 'A2').trim()
    const topicHint = (body.topicHint || '').trim()

    if (action === 'generatePrompt') {
      const prompt = `
Bạn là giáo viên Speaking tiếng Anh.
Tạo 1 phiên hỏi đáp speaking theo cấp độ ${levelTarget} (A1, A2, B1, B2, C1), dạng hội thoại liên tục nhiều câu.
${topicHint ? `Chủ đề ưu tiên: ${topicHint}.` : 'Chọn chủ đề đời sống/học tập/công việc.'}

Yêu cầu JSON thuần:
{
  "title": "tiêu đề ngắn",
  "introVi": "hướng dẫn ngắn bằng tiếng Việt",
  "questions": ["8-10 câu hỏi speaking tiếng Anh, đi từ dễ đến sâu"]
}
`
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      })
      const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}')
      const safePrompt = toSafePrompt(parsed)
      if (!safePrompt) {
        return NextResponse.json({ error: 'Không thể tạo phiên nói hợp lệ' }, { status: 500 })
      }
      return NextResponse.json({ prompt: safePrompt })
    }

    if (action !== 'gradeSpeaking') {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
    }

    const speakingPrompt = toSafePrompt(body.prompt)
    const answers = toSafeAnswers(body.answers)
    if (!speakingPrompt || answers.length < speakingPrompt.questions.length) {
      return NextResponse.json({ error: 'Missing speaking data' }, { status: 400 })
    }

    const qaText = speakingPrompt.questions
      .map((q, i) => `${i + 1}. Q: ${q}\nA: ${answers[i] || '(empty)'}`)
      .join('\n\n')

    const gradingPrompt = `
Bạn là giám khảo speaking tiếng Anh.
Hãy chấm toàn bộ phiên hỏi đáp dưới đây.
Cấp độ mục tiêu: ${levelTarget}

${qaText}

Trả JSON thuần:
{
  "score": 0-100,
  "feedbackVi": "3 đoạn có nhãn: Đánh giá bài làm, Mục tiêu buổi tiếp theo, Cách khắc phục",
  "criteria": {
    "fluency": 0-100,
    "vocabulary": 0-100,
    "grammar": 0-100,
    "pronunciation": 0-100
  },
  "improvements": [
    {
      "question": "nội dung câu hỏi",
      "issueVi": "lỗi chính",
      "fixVi": "cách sửa",
      "sampleAnswerEn": "câu mẫu tốt hơn"
    }
  ]
}
`

    const grading = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: gradingPrompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    })
    const parsed = JSON.parse(grading.choices[0]?.message?.content || '{}') as {
      score?: unknown
      feedbackVi?: unknown
      criteria?: { fluency?: unknown; vocabulary?: unknown; grammar?: unknown; pronunciation?: unknown }
      improvements?: Array<{ question?: unknown; issueVi?: unknown; fixVi?: unknown; sampleAnswerEn?: unknown }>
    }

    const scoreRaw = typeof parsed.score === 'number' ? parsed.score : Number(parsed.score)
    const score = Number.isFinite(scoreRaw) ? Math.max(0, Math.min(100, Math.round(scoreRaw))) : 60
    const criteria = {
      fluency: typeof parsed.criteria?.fluency === 'number' ? Math.max(0, Math.min(100, Math.round(parsed.criteria.fluency))) : Math.max(45, score - 5),
      vocabulary: typeof parsed.criteria?.vocabulary === 'number' ? Math.max(0, Math.min(100, Math.round(parsed.criteria.vocabulary))) : Math.max(45, score - 3),
      grammar: typeof parsed.criteria?.grammar === 'number' ? Math.max(0, Math.min(100, Math.round(parsed.criteria.grammar))) : Math.max(45, score - 2),
      pronunciation: typeof parsed.criteria?.pronunciation === 'number' ? Math.max(0, Math.min(100, Math.round(parsed.criteria.pronunciation))) : Math.max(40, score - 8),
    }
    const feedbackVi =
      typeof parsed.feedbackVi === 'string' && parsed.feedbackVi.trim()
        ? parsed.feedbackVi.trim()
        : [
            `Đánh giá bài làm: Bài nói của bạn đạt ${score}/100, mức hiện tại khoảng ${estimateLevel(score)}.`,
            'Mục tiêu buổi tiếp theo: Trả lời mạch lạc hơn và mở rộng ý mỗi câu thêm 1 ví dụ.',
            'Cách khắc phục: Luyện khung trả lời ngắn (main idea -> reason -> example) cho từng câu hỏi.'
          ].join('\n')

    const improvements =
      Array.isArray(parsed.improvements) && parsed.improvements.length > 0
        ? parsed.improvements
            .slice(0, 8)
            .map((x) => ({
              question: String(x?.question || '').trim(),
              issueVi: String(x?.issueVi || '').trim(),
              fixVi: String(x?.fixVi || '').trim(),
              sampleAnswerEn: String(x?.sampleAnswerEn || '').trim(),
            }))
            .filter((x) => x.question && x.issueVi && x.fixVi && x.sampleAnswerEn)
        : [
            {
              question: speakingPrompt.questions[0] || 'Question 1',
              issueVi: 'Câu trả lời còn ngắn, thiếu ví dụ cụ thể.',
              fixVi: 'Thêm 1 lý do rõ ràng và 1 ví dụ thực tế.',
              sampleAnswerEn: 'I usually review my notes in short sessions because it helps me remember key ideas without feeling overwhelmed.'
            },
          ]

    const result: SpeakingGradeResult = {
      score,
      levelEstimate: estimateLevel(score),
      feedbackVi,
      criteria,
      improvements,
    }

    await persistSpeakingSession({
      userId: user.id,
      title: speakingPrompt.title,
      levelTarget,
      topicHint: topicHint || null,
      promptData: speakingPrompt,
      userAnswers: answers,
      result,
    })

    return NextResponse.json({ result })
  } catch (error) {
    logger.error('AI Tutor Speaking Error:', error)
    return NextResponse.json(
      {
        error: 'Speaking failed',
        detail: error instanceof Error ? error.message : 'Unknown server error',
      },
      { status: 500 }
    )
  }
}
