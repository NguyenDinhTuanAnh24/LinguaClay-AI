import { logger } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'
import { createClient } from '@/utils/supabase/server'
import { isAdminUser } from '@/lib/admin'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

type GeneratedExercise = {
  type: string
  question: string
  correctAnswer: string
  explanation?: string
  difficulty?: number
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { topicId, count = 10 } = await req.json()

    if (!topicId) {
      return NextResponse.json({ error: 'Missing topicId' }, { status: 400 })
    }

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: { words: true }
    })

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    const wordList = topic.words.map(w => `${w.original} (${w.translation})`).join(', ')

    const prompt = `
      Bạn là chuyên gia xây dựng nội dung học tập ngôn ngữ. 
      Dựa trên danh sách từ vựng này: ${wordList} của chủ đề "${topic.name}".
      
      Hãy tạo ra ${count} bài tập ngữ pháp trình độ ${topic.level}.
      Yêu cầu phản hồi bằng JSON mảng (No preamble, no markdown) với cấu trúc:
      [
        {
          "type": "reordering" | "fill_blank",
          "question": "Câu hỏi hiển thị (ví dụ: 'Dịch câu này: Tôi thích học tiếng Anh' hoặc 'Hoàn thành câu')",
          "correctAnswer": "Đáp án đúng hoàn chỉnh",
          "explanation": "Giải thích ngắn gọn quy tắc ngữ pháp bằng tiếng Việt",
          "difficulty": 1-5
        }
      ]
      
      Lưu ý:
      - Với "reordering": correctAnswer là câu hoàn chỉnh.
      - Với "fill_blank": question nên chứa cụm từ chính xác cần điền.
    `

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    })

    const rawResponse = completion.choices[0].message.content || '{"exercises": []}'
    const parsed = JSON.parse(rawResponse) as { exercises?: GeneratedExercise[] }
    const exercises = Array.isArray(parsed.exercises) ? parsed.exercises : []

    // Save to DB
    const created = await Promise.all(
      exercises.map((ex) => 
        prisma.exercise.create({
          data: {
            type: ex.type,
            question: ex.question,
            correctAnswer: ex.correctAnswer,
            explanation: ex.explanation,
            difficulty: ex.difficulty || 1,
            language: topic.language,
            isAIGenerated: true,
            wordId: topic.words[0]?.id, // Link to first word for now
          }
        })
      )
    )

    return NextResponse.json({ success: true, count: created.length })
  } catch (error: unknown) {
    logger.error('Exercise Gen Error:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
