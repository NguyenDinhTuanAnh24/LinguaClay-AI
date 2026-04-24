import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'
import { randomUUID } from 'crypto'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

type ListeningQuestion = {
  id: string
  question: string
  options: string[]
  answer: number
}

type ListeningBlank = {
  id: string
  prompt: string
  answer: string
}

type ListeningTest = {
  title: string
  introVi: string
  transcriptEn: string
  tipsVi: string[]
  questions: ListeningQuestion[]
  blanks: ListeningBlank[]
}

type WrongItem = {
  questionId: string
  question: string
  userAnswer: string
  correctAnswer: string
  explanationVi: string
}

type ListeningGradeResult = {
  score: number
  correctCount: number
  totalQuestions: number
  levelEstimate: string
  feedbackVi: string
  wrongItems: WrongItem[]
}

async function persistListeningSession(params: {
  userId: string
  title: string
  levelTarget: string
  topicHint: string | null
  transcriptEn: string
  questions: ListeningQuestion[]
  blanks: ListeningBlank[]
  userAnswers: Record<string, number>
  blankAnswers: Record<string, string>
  score: number
  totalQuestions: number
  feedbackVi: string
  wrongItems: WrongItem[]
}) {
  const delegate = (prisma as unknown as {
    tutorListeningSession?: {
      create: (args: {
        data: {
          userId: string
          title: string
          levelTarget: string
          topicHint: string | null
          transcriptEn: string
          questions: Prisma.InputJsonValue
          blanks: Prisma.InputJsonValue
          userAnswers: Prisma.InputJsonValue
          blankAnswers: Prisma.InputJsonValue
          score: number
          totalQuestions: number
          feedbackVi: string
          wrongItems: Prisma.InputJsonValue
        }
      }) => Promise<unknown>
    }
  }).tutorListeningSession

  if (delegate?.create) {
    await delegate.create({
      data: {
        userId: params.userId,
        title: params.title,
        levelTarget: params.levelTarget,
        topicHint: params.topicHint,
        transcriptEn: params.transcriptEn,
        questions: params.questions as unknown as Prisma.InputJsonValue,
        blanks: params.blanks as unknown as Prisma.InputJsonValue,
        userAnswers: params.userAnswers as unknown as Prisma.InputJsonValue,
        blankAnswers: params.blankAnswers as unknown as Prisma.InputJsonValue,
        score: params.score,
        totalQuestions: params.totalQuestions,
        feedbackVi: params.feedbackVi,
        wrongItems: params.wrongItems as unknown as Prisma.InputJsonValue,
      },
    })
    return
  }

  // Fallback when dev server still holds an old Prisma client instance without the new delegate.
  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "TutorListeningSession"
        ("id","userId","title","levelTarget","topicHint","transcriptEn","questions","blanks","userAnswers","blankAnswers","score","totalQuestions","feedbackVi","wrongItems")
      VALUES
        (
          ${randomUUID()},
          ${params.userId},
          ${params.title},
          ${params.levelTarget},
          ${params.topicHint},
          ${params.transcriptEn},
          CAST(${JSON.stringify(params.questions)} AS jsonb),
          CAST(${JSON.stringify(params.blanks)} AS jsonb),
          CAST(${JSON.stringify(params.userAnswers)} AS jsonb),
          CAST(${JSON.stringify(params.blankAnswers)} AS jsonb),
          ${params.score},
          ${params.totalQuestions},
          ${params.feedbackVi},
          CAST(${JSON.stringify(params.wrongItems)} AS jsonb)
        )
    `
  )
}

function toLevelEstimate(correctCount: number, total: number) {
  if (total <= 0) return 'A1'
  const ratio = correctCount / total
  if (ratio >= 0.92) return 'C1'
  if (ratio >= 0.78) return 'B2'
  if (ratio >= 0.62) return 'B1'
  if (ratio >= 0.42) return 'A2'
  return 'A1'
}

function toSafeTest(input: unknown): ListeningTest | null {
  if (!input || typeof input !== 'object') return null
  const raw = input as {
    title?: unknown
    introVi?: unknown
    transcriptEn?: unknown
    tipsVi?: unknown
    questions?: unknown
    blanks?: unknown
  }
  if (typeof raw.title !== 'string' || typeof raw.transcriptEn !== 'string') return null
  if (!Array.isArray(raw.questions) || raw.questions.length === 0) return null

  const questions: ListeningQuestion[] = raw.questions
    .slice(0, 8)
    .map((item, idx) => {
      const q = item as {
        id?: unknown
        question?: unknown
        options?: unknown
        answer?: unknown
      }
      const options = Array.isArray(q.options) ? q.options.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 4) : []
      const answerRaw = typeof q.answer === 'number' ? q.answer : Number(q.answer)
      return {
        id: typeof q.id === 'string' && q.id.trim() ? q.id.trim() : `Q${idx + 1}`,
        question: typeof q.question === 'string' ? q.question.trim() : '',
        options,
        answer: Number.isFinite(answerRaw) ? Math.max(0, Math.min(options.length - 1, Math.round(answerRaw))) : 0,
      }
    })
    .filter((q) => q.question && q.options.length >= 2)

  if (questions.length === 0) return null

  const blanks: ListeningBlank[] = Array.isArray(raw.blanks)
    ? raw.blanks
        .slice(0, 6)
        .map((item, idx) => {
          const b = item as { id?: unknown; prompt?: unknown; answer?: unknown }
          return {
            id: typeof b.id === 'string' && b.id.trim() ? b.id.trim() : `B${idx + 1}`,
            prompt: typeof b.prompt === 'string' ? b.prompt.trim() : '',
            answer: typeof b.answer === 'string' ? b.answer.trim() : '',
          }
        })
        .filter((b) => b.prompt && b.answer)
    : []

  return {
    title: raw.title.trim(),
    introVi: typeof raw.introVi === 'string' ? raw.introVi.trim() : 'Nghe transcript và chọn đáp án đúng cho từng câu.',
    transcriptEn: raw.transcriptEn.trim(),
    tipsVi: Array.isArray(raw.tipsVi) ? raw.tipsVi.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 4) : [],
    questions,
    blanks,
  }
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
      action?: 'generateTest' | 'gradeTest'
      levelTarget?: string
      topicHint?: string
      test?: unknown
      answers?: Record<string, number>
      blankAnswers?: Record<string, string>
    }

    const action = body.action || 'generateTest'
    const levelTarget = (body.levelTarget || 'A2').trim()
    const topicHint = (body.topicHint || '').trim()

    if (action === 'generateTest') {
      const prompt = `
Bạn là trợ giảng Listening tiếng Anh.
Hãy tạo 1 mini test nghe tiếng Anh phù hợp cấp độ mục tiêu ${levelTarget} (A1, A2, B1, B2, C1).
${topicHint ? `Chủ đề ưu tiên: ${topicHint}.` : 'Tự chọn chủ đề giao tiếp thực tế.'}

Yêu cầu:
- Transcript tiếng Anh dài 140-200 từ, phong cách hội thoại/workplace/student life.
- Tạo đúng 5 câu hỏi trắc nghiệm (MCQ), mỗi câu 4 lựa chọn.
- Mỗi câu có 1 đáp án đúng duy nhất.
- Tạo thêm 3 câu điền từ vào chỗ trống, mỗi câu có 1 từ/cụm ngắn làm đáp án.
- Trả JSON thuần đúng format:
{
  "title": "tiêu đề ngắn",
  "introVi": "hướng dẫn ngắn bằng tiếng Việt",
  "transcriptEn": "đoạn nghe tiếng Anh",
  "tipsVi": ["2-3 mẹo làm bài bằng tiếng Việt"],
  "questions": [
    {
      "id": "Q1",
      "question": "câu hỏi tiếng Anh",
      "options": ["A ...", "B ...", "C ...", "D ..."],
      "answer": 0
    }
  ],
  "blanks": [
    {
      "id": "B1",
      "prompt": "The student plans to join the ____ club next semester.",
      "answer": "photography"
    }
  ]
}
`

      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      })

      const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}')
      const safe = toSafeTest(parsed)
      if (!safe) {
        return NextResponse.json({ error: 'Không thể tạo đề nghe hợp lệ' }, { status: 500 })
      }

      return NextResponse.json({ test: safe })
    }

    if (action !== 'gradeTest') {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
    }

    const test = toSafeTest(body.test)
    const answers = body.answers && typeof body.answers === 'object' ? body.answers : {}
    const blankAnswers = body.blankAnswers && typeof body.blankAnswers === 'object' ? body.blankAnswers : {}
    if (!test) {
      return NextResponse.json({ error: 'Missing test data' }, { status: 400 })
    }

    let correctCount = 0
    const wrongItems: WrongItem[] = []

    test.questions.forEach((q) => {
      const selected = answers[q.id]
      const selectedIdx = typeof selected === 'number' ? selected : -1
      if (selectedIdx === q.answer) {
        correctCount += 1
        return
      }
      wrongItems.push({
        questionId: q.id,
        question: q.question,
        userAnswer: selectedIdx >= 0 && selectedIdx < q.options.length ? q.options[selectedIdx] : 'Chưa chọn đáp án',
        correctAnswer: q.options[q.answer] || '',
        explanationVi: '',
      })
    })

    test.blanks.forEach((b) => {
      const userRaw = String(blankAnswers[b.id] || '').trim()
      const userNorm = userRaw.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()
      const answerNorm = b.answer.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()
      if (userNorm && userNorm === answerNorm) {
        correctCount += 1
        return
      }
      wrongItems.push({
        questionId: b.id,
        question: b.prompt,
        userAnswer: userRaw || 'Chưa điền đáp án',
        correctAnswer: b.answer,
        explanationVi: '',
      })
    })

    const totalQuestions = test.questions.length + test.blanks.length
    const score = Math.round((correctCount / totalQuestions) * 100)
    const levelEstimate = toLevelEstimate(correctCount, totalQuestions)

    let feedbackVi = [
      `Đánh giá bài làm: Bạn đúng ${correctCount}/${totalQuestions} câu (${score}%). Bạn đang ở mức ${levelEstimate} cho bài nghe này.`,
      'Mục tiêu buổi tiếp theo: Tăng thêm ít nhất 1-2 câu đúng bằng cách bám từ khóa và tín hiệu chuyển ý.',
      'Cách khắc phục: Trước khi nghe, đọc nhanh câu hỏi; trong lúc nghe, đánh dấu từ khóa; sau khi nghe, loại trừ đáp án gây nhiễu.'
    ].join('\n')

    if (wrongItems.length > 0) {
      const analysisPrompt = `
Bạn là giám khảo Listening tiếng Anh. Hãy nhận xét trực tiếp BÀI LÀM của người học, không tóm tắt nội dung transcript.
Kết quả hiện tại: đúng ${correctCount}/${totalQuestions} câu, mức ước lượng ${levelEstimate}.
Transcript:
${test.transcriptEn}

Danh sách câu sai:
${wrongItems
  .map(
    (w, i) => `${i + 1}. ${w.question}
- User chọn: ${w.userAnswer}
- Đáp án đúng: ${w.correctAnswer}`
  )
  .join('\n')}

Trả JSON thuần:
{
  "feedbackVi": "3 đoạn ngắn có nhãn rõ ràng: 'Đánh giá bài làm: ...\\nMục tiêu buổi tiếp theo: ...\\nCách khắc phục: ...'",
  "explanations": [
    {
      "questionId": "Q1",
      "explanationVi": "giải thích ngắn vì sao sai và cách nghe đúng"
    }
  ]
}
`

      const analysis = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: analysisPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      })
      const parsedAnalysis = JSON.parse(analysis.choices[0]?.message?.content || '{}') as {
        feedbackVi?: unknown
        explanations?: Array<{ questionId?: unknown; explanationVi?: unknown }>
      }

      if (typeof parsedAnalysis.feedbackVi === 'string' && parsedAnalysis.feedbackVi.trim()) {
        feedbackVi = parsedAnalysis.feedbackVi.trim()
      }
      if (Array.isArray(parsedAnalysis.explanations)) {
        const explanationMap = new Map<string, string>()
        parsedAnalysis.explanations.forEach((item) => {
          const qid = typeof item?.questionId === 'string' ? item.questionId : ''
          const text = typeof item?.explanationVi === 'string' ? item.explanationVi : ''
          if (qid && text) explanationMap.set(qid, text.trim())
        })
        wrongItems.forEach((item) => {
          item.explanationVi =
            explanationMap.get(item.questionId) ||
            'Bạn cần chú ý cụm từ ngay trước và sau từ khóa trong câu hỏi để loại đáp án gây nhiễu.'
        })
      } else {
        wrongItems.forEach((item) => {
          item.explanationVi = 'Bạn cần chú ý cụm từ ngay trước và sau từ khóa trong câu hỏi để loại đáp án gây nhiễu.'
        })
      }
    } else {
      feedbackVi = [
        `Đánh giá bài làm: Bạn đúng ${correctCount}/${totalQuestions} câu (${score}%). Kết quả rất tốt.`,
        'Mục tiêu buổi tiếp theo: Duy trì độ chính xác và tăng tốc độ xử lý câu hỏi.',
        'Cách khắc phục: Nghe lại 1 lần để đối chiếu từ khóa và kiểm tra lý do loại trừ từng đáp án.'
      ].join('\n')
    }

    const result: ListeningGradeResult = {
      score,
      correctCount,
      totalQuestions,
      levelEstimate,
      feedbackVi,
      wrongItems,
    }

    await persistListeningSession({
      userId: user.id,
      title: test.title,
      levelTarget,
      topicHint: topicHint || null,
      transcriptEn: test.transcriptEn,
      questions: test.questions,
      blanks: test.blanks,
      userAnswers: answers,
      blankAnswers,
      score,
      totalQuestions,
      feedbackVi,
      wrongItems,
    })

    return NextResponse.json({ result })
  } catch (error) {
    console.error('AI Tutor Listening Error:', error)
    return NextResponse.json(
      {
        error: 'Listening failed',
        detail: error instanceof Error ? error.message : 'Unknown server error',
      },
      { status: 500 }
    )
  }
}
