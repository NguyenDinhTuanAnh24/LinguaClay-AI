import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import Groq from 'groq-sdk'
import { normalizeCefrLevel } from '@/lib/levels'

// Khởi tạo công cụ Groq
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

    const { topic, language, level = 'A1' } = await req.json()
    const normalizedLevel = normalizeCefrLevel(level)

    if (!topic || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedLanguage =
      language === 'CN' || language === 'Tiếng Trung'
        ? { code: 'CN', promptLabel: 'Tiếng Trung' }
        : { code: 'EN', promptLabel: 'Tiếng Anh' }

    // Step 2: Prompt khắt khe ép xuất JSON cho Groq
    const prompt = `Bạn là một chuyên gia ngôn ngữ học. Hãy tạo danh sách 10 từ vựng theo chủ đề: "${topic}" bằng ${normalizedLanguage.promptLabel}.
      Cấp độ mục tiêu là: ${normalizedLevel}.

      YÊU CẦU BẮT BUỘC: 
      Xuất kết quả dưới định dạng JSON. Object JSON phải chứa một mảng có tên là "flashcards". KHÔNG trả lời thêm bất kỳ câu chữ nào khác.
      Mỗi item trong mảng phải tuân thủ đúng định dạng các key sau:
      - 'term': (Từ vựng)
      - 'pronunciation': (Phiên âm quốc tế IPA hoặc Pinyin)
      - 'definition': (Giải nghĩa tiếng Việt ngắn gọn, dễ hiểu)
      - 'example': (Một câu ví dụ thực tế sử dụng từ đó bằng ${normalizedLanguage.promptLabel})
      - 'exampleTranslation': (Nghĩa tiếng Việt của câu ví dụ)`

    // Gọi API của Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    })

    const jsonString = chatCompletion.choices[0]?.message?.content || "{}"
    const rawData = JSON.parse(jsonString)
    const wordsArray = (rawData.flashcards || []) as Array<{
      term?: string
      pronunciation?: string
      definition?: string
      example?: string
      exampleTranslation?: string
    }>

    if (!Array.isArray(wordsArray) || wordsArray.length === 0) {
      throw new Error('AI failed to generate a valid list')
    }

    // Step 3: Lưu TRỰC TIẾP thành một Topic
    const newTopic = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Tạo Topic mới từ nội dung AI tạo ra
      const t = await tx.topic.create({
        data: {
          name: topic,
          slug: `${topic.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}-${Date.now()}`,

          description: `Chủ đề AI tạo ra theo yêu cầu về "${topic}"`,
          level: normalizedLevel,
          language: normalizedLanguage.code,
          isAIGenerated: true,
        }
      })

      // 2. Tạo Words trực tiếp cho Topic này
      await tx.word.createMany({
        data: wordsArray.map((w) => ({
          original: w.term || '',
          pronunciation: w.pronunciation || null,
          translation: w.definition || '',
          example: w.example || null,
          exampleTranslation: w.exampleTranslation || null,
          topicId: t.id,
        }))
      })

      return t
    })

    return NextResponse.json(newTopic)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    console.error('Groq Generation Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
