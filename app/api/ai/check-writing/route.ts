import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'
import { z } from 'zod'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const CheckWritingBodySchema = z
  .object({
    content: z.string().trim().min(1).max(4000),
    topicId: z.string().trim().min(1).max(120),
    slug: z.string().trim().max(200).optional(),
  })
  .strict()

const AiFeedbackSchema = z.object({
  score: z.number().min(0).max(100).optional(),
  feedback: z.string().optional(),
  corrections: z
    .array(
      z.object({
        original: z.string(),
        correction: z.string(),
        explanation: z.string(),
      })
    )
    .optional(),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let bodyRaw: unknown
    try {
      bodyRaw = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    const parseResult = CheckWritingBodySchema.safeParse(bodyRaw)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { content, topicId } = parseResult.data

    const prompt = `
Ban la mot giao vien ngon ngu chuyen nghiep va tan tam.
Hay kiem tra doan van sau day cua hoc sinh: "${content}"

Yeu cau phan hoi bang dinh dang JSON thuan tuy (no markdown, no preamble) voi cau truc sau:
{
  "score": number (0-100),
  "feedback": "nhan xet chung bang tieng Viet",
  "corrections": [
    {
      "original": "cum tu sai",
      "correction": "cum tu dung",
      "explanation": "giai thich ngan gon loi sai bang tieng Viet"
    }
  ]
}
`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    })

    const parsedRaw = JSON.parse(completion.choices[0]?.message?.content || '{}')
    const parsedFeedback = AiFeedbackSchema.safeParse(parsedRaw)

    const aiResult = parsedFeedback.success
      ? parsedFeedback.data
      : {
          score: 0,
          feedback: 'AI response is malformed',
          corrections: [],
        }

    const session = await prisma.writingSession.create({
      data: {
        userId: user.id,
        topicId,
        userContent: content,
        aiFeedback: aiResult,
        score: aiResult.score || 0,
      },
    })

    return NextResponse.json({ session })
  } catch (error: unknown) {
    logger.error('AI Check Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
