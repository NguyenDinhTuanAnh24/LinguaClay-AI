import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'

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

    const { topic, language, level = 'Beginner' } = await req.json()

    if (!topic || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Step 2: Prompt khắt khe ép xuất JSON cho Groq
    const prompt = `Bạn là một chuyên gia ngôn ngữ học. Hãy tạo danh sách 10 từ vựng theo chủ đề: "${topic}" bằng ${language}.
      Cấp độ mục tiêu là: ${level}.

      YÊU CẦU BẮT BUỘC: 
      Xuất kết quả dưới định dạng JSON. Object JSON phải chứa một mảng có tên là "flashcards". KHÔNG trả lời thêm bất kỳ câu chữ nào khác.
      Mỗi item trong mảng phải tuân thủ đúng định dạng các key sau:
      - 'term': (Từ vựng)
      - 'pronunciation': (Phiên âm quốc tế IPA hoặc Pinyin)
      - 'definition': (Giải nghĩa tiếng Việt ngắn gọn, dễ hiểu)
      - 'example': (Một câu ví dụ thực tế sử dụng từ đó bằng ${language})
      - 'exampleTranslation': (Nghĩa tiếng Việt của câu ví dụ)`

    // Gọi API của Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    })

    const jsonString = chatCompletion.choices[0]?.message?.content || "{}"
    const rawData = JSON.parse(jsonString)
    const wordsArray = rawData.flashcards || []

    if (!Array.isArray(wordsArray) || wordsArray.length === 0) {
      throw new Error('AI failed to generate a valid list')
    }

    // Step 3: Lưu TRỰC TIẾP thành một Topic
    const newTopic = await prisma.$transaction(async (tx: any) => {
      // 1. Tạo Topic mới từ nội dung AI tạo ra
      const t = await tx.topic.create({
        data: {
          name: topic,
          slug: `${topic.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}-${Date.now()}`,

          description: `Chủ đề AI tạo ra theo yêu cầu về "${topic}"`,
          level: level,
          language: language === 'Tiếng Trung' ? 'CN' : 'EN',
          isAIGenerated: true,
        }
      })

      // 2. Tạo Words trực tiếp cho Topic này
      await tx.word.createMany({
        data: wordsArray.map((w: any) => ({
          original: w.term,
          pronunciation: w.pronunciation,
          translation: w.definition,
          example: w.example,
          exampleTranslation: w.exampleTranslation,
          topicId: t.id,
        }))
      })

      return t
    })

    return NextResponse.json(newTopic)
  } catch (error: any) {
    console.error('Groq Generation Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
