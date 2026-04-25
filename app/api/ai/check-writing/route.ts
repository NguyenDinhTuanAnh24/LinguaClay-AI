import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, topicId, slug } = await req.json()

    if (!content || !topicId) {
      return NextResponse.json({ error: 'Missing content or topicId' }, { status: 400 })
    }

    // 1. Gọi AI để chấm điểm và nhận xét
    const prompt = `
      Bạn là một giáo viên ngôn ngữ chuyên nghiệp và tận tâm.
      Hãy kiểm tra đoạn văn sau đây của học sinh: "${content}"
      
      Yêu cầu phản hồi bằng định dạng JSON thuần túy (no markdown, no preamble) với cấu trúc sau:
      {
        "score": number (0-100),
        "feedback": "nhận xét chung bằng tiếng Việt",
        "corrections": [
          {
            "original": "cụm từ sai",
            "correction": "cụm từ đúng",
            "explanation": "giải thích ngắn gọn lỗi sai bằng tiếng Việt"
          }
        ]
      }
    `

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    })

    const aiResult = JSON.parse(completion.choices[0].message.content || '{}')

    // 2. Lưu kết quả vào Database
    const session = await prisma.writingSession.create({
      data: {
        userId: user.id,
        topicId,
        userContent: content,
        aiFeedback: aiResult,
        score: aiResult.score || 0,
      }
    })

    return NextResponse.json({ session })
  } catch (error: unknown) {
    logger.error('AI Check Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
