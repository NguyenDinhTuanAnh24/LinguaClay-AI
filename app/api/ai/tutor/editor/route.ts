import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { Prisma } from '@prisma/client'
import Groq from 'groq-sdk'
import { sanitizeUserPrompt } from '@/lib/sanitizer'
import { z } from 'zod'
import { TutorRepository } from '@/repositories/tutor.repository'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

type EditorResponse = {
  score: number
  feedbackVi: string
  strengthsVi: string[]
  improvementsVi: string[]
  revisedEssay: string
  detailedFeedbackVi: Array<{
    excerpt: string
    commentVi: string
    fixVi: string
  }>
  notes: Array<{
    wrong: string
    correct: string
    reasonVi: string
  }>
}

const EditorBodySchema = z
  .object({
    action: z.enum(['generatePrompt', 'gradeEssay']).optional(),
    idea: z.string().optional(),
    content: z.string().optional(),
    promptTitle: z.string().optional(),
  })
  .strict()

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
    const parseResult = EditorBodySchema.safeParse(bodyRaw)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const body = parseResult.data
    const action = body.action || 'gradeEssay'
    const idea = sanitizeUserPrompt(body.idea || '', 600)
    const content = sanitizeUserPrompt(body.content || '', 2500)
    const promptTitle = sanitizeUserPrompt(body.promptTitle || '', 100)

    if (action === 'generatePrompt') {
      if (!idea) {
        return NextResponse.json({ error: 'Missing idea' }, { status: 400 })
      }
      if (idea.length > 600) {
        return NextResponse.json({ error: 'Idea too long (max 600 chars)' }, { status: 400 })
      }

      const promptGenPrompt = `
Bạn là trợ giảng Writing tiếng Anh.
Người học mô tả ý tưởng đề bài như sau:
"${idea}"

Hãy tạo ra 1 đề bài viết tiếng Anh ngắn gọn, rõ yêu cầu, phù hợp để luyện tập.
Trả JSON thuần:
{
  "promptTitle": "đề bài tiếng Việt ngắn gọn",
  "promptEn": "đề bài tiếng Anh rõ ràng để người học viết theo",
  "tipsVi": ["2-3 mẹo viết ngắn gọn bằng tiếng Việt"]
}
`

      const promptGen = await groq.chat.completions.create({
        messages: [{ role: 'user', content: promptGenPrompt }],
        model: 'llama-3.1-8b-instant',
        response_format: { type: 'json_object' },
        temperature: 0.3,
      })
      const parsedGen = JSON.parse(promptGen.choices[0]?.message?.content || '{}') as {
        promptTitle?: string
        promptEn?: string
        tipsVi?: string[]
      }

      return NextResponse.json({
        prompt: {
          promptTitle: parsedGen.promptTitle || 'Đề viết tự sinh',
          promptEn: parsedGen.promptEn || 'Write a clear paragraph about your topic with examples.',
          tipsVi: Array.isArray(parsedGen.tipsVi) ? parsedGen.tipsVi.map((x) => String(x || '')).filter(Boolean).slice(0, 3) : [],
        },
      })
    }

    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }

    if (content.length > 2500) {
      return NextResponse.json({ error: 'Content too long (max 2500 chars)' }, { status: 400 })
    }

    const prompt = `
Bạn là giám khảo Writing tiếng Anh (vai trò chấm bài luyện viết theo đề mẫu).
Nhiệm vụ: chấm bài viết và đưa phản hồi thực dụng để người học cải thiện.

BỐI CẢNH ĐỀ BÀI:
"${promptTitle || 'Đề tự chọn'}"

BÀI VIẾT CỦA HỌC VIÊN:
"""
${content}
"""

YÊU CẦU ĐẦU RA:
- Trả về JSON thuần, không markdown ngoài JSON.
- Định dạng:
{
  "score": number (0-100),
  "feedbackVi": "nhận xét tổng quan ngắn gọn bằng tiếng Việt",
  "strengthsVi": ["2-3 điểm tốt ngắn gọn bằng tiếng Việt"],
  "improvementsVi": ["2-4 điểm cần cải thiện ngắn gọn bằng tiếng Việt"],
  "revisedEssay": "phiên bản bài viết tiếng Anh đã cải thiện, tự nhiên hơn",
  "detailedFeedbackVi": [
    {
      "excerpt": "trích đúng 1 câu/cụm từ trong bài của học viên",
      "commentVi": "nhận xét cụ thể cho excerpt đó",
      "fixVi": "gợi ý sửa cụ thể cho excerpt đó"
    }
  ],
  "notes": [
    {
      "wrong": "cụm sai",
      "correct": "cụm đúng",
      "reasonVi": "giải thích ngắn bằng tiếng Việt"
    }
  ]
}

RÀNG BUỘC:
- notes tối đa 6 mục, chỉ lấy lỗi quan trọng.
- detailedFeedbackVi tối đa 6 mục, bắt buộc bám trực tiếp vào câu người học đã viết.
- revisedEssay giữ ý chính của học viên nhưng diễn đạt rõ hơn.
- Không dùng từ sáo rỗng.
`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
      temperature: 0.2,
    })

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}') as Partial<EditorResponse>

    const safeResult: EditorResponse = {
      score: typeof parsed.score === 'number' ? Math.max(0, Math.min(100, Math.round(parsed.score))) : 65,
      feedbackVi:
        typeof parsed.feedbackVi === 'string'
          ? parsed.feedbackVi
          : 'Bài viết có ý rõ, nhưng cần cải thiện ngữ pháp và cách diễn đạt để tự nhiên hơn.',
      strengthsVi: Array.isArray(parsed.strengthsVi)
        ? parsed.strengthsVi.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 3)
        : ['Có nỗ lực triển khai ý chính.'],
      improvementsVi: Array.isArray(parsed.improvementsVi)
        ? parsed.improvementsVi.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 4)
        : ['Rà soát thì động từ và giới từ.'],
      revisedEssay: typeof parsed.revisedEssay === 'string' ? parsed.revisedEssay : content,
      detailedFeedbackVi: Array.isArray(parsed.detailedFeedbackVi)
        ? parsed.detailedFeedbackVi
            .slice(0, 6)
            .map((x) => ({
              excerpt: String(x?.excerpt || '').trim(),
              commentVi: String(x?.commentVi || '').trim(),
              fixVi: String(x?.fixVi || '').trim(),
            }))
            .filter((x) => x.excerpt && x.commentVi && x.fixVi)
        : [],
      notes: Array.isArray(parsed.notes)
        ? parsed.notes
            .slice(0, 6)
            .map((n) => ({
              wrong: String(n?.wrong || ''),
              correct: String(n?.correct || ''),
              reasonVi: String(n?.reasonVi || ''),
            }))
            .filter((n) => n.wrong && n.correct && n.reasonVi)
        : [],
    }

    await TutorRepository.createEditorSession({
      userId: user.id,
      inputText: content,
      annotatedText: safeResult.revisedEssay,
      shortFeedbackVi: safeResult.feedbackVi,
      notes: {
        promptTitle,
        score: safeResult.score,
        strengthsVi: safeResult.strengthsVi,
        improvementsVi: safeResult.improvementsVi,
        detailedFeedbackVi: safeResult.detailedFeedbackVi,
        corrections: safeResult.notes,
      } as unknown as Prisma.InputJsonValue,
    })

    return NextResponse.json({ result: safeResult })
  } catch (error) {
    logger.error('AI Tutor Editor Error:', error)
    return NextResponse.json(
      {
        error: 'Editor failed',
        detail: error instanceof Error ? error.message : 'Unknown server error',
      },
      { status: 500 }
    )
  }
}
