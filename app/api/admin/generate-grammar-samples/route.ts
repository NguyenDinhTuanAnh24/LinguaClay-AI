import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  try {
    const { batchSize = 10 } = await req.json().catch(() => ({}))

    // Lấy các bản ghi chưa có dữ liệu bài tập
    const points = await (prisma as any).grammarPoint.findMany({
      where: { structure: null },
      take: batchSize,
    })

    if (points.length === 0) {
      return NextResponse.json({ success: true, message: 'All grammar points are fully enriched.' })
    }

    const results = await Promise.all(
      points.map(async (p: any) => {
        const prompt = `
You are an English grammar expert.
For the grammar topic: "${p.title}" (Level: ${p.level})

Return ONLY a valid JSON object with this exact structure, no markdown, no explanation:
{
  "structure": "S + V(s/es) + O",
  "exampleSentence": "She reads books every morning",
  "exerciseData": [
    "She reads books every morning",
    "He plays football on weekends",
    "They study English together"
  ]
}

Rules:
- "structure": The grammar formula using S, V, O, Adj, Adv notation
- "exampleSentence": One simple English sentence (5-10 words) fitting this grammar
- "exerciseData": Array of 3 simple English sentences (5-10 words each) for scramble exercises
- All sentences must be appropriate for level: ${p.level}
`

        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.1-8b-instant',
          response_format: { type: 'json_object' },
        })

        const raw = completion.choices[0].message.content || '{}'
        const data = JSON.parse(raw)

        return (prisma as any).grammarPoint.update({
          where: { id: p.id },
          data: {
            structure: data.structure || 'S + V + O',
            exampleSentence: data.exampleSentence || p.example,
            exerciseData: data.exerciseData || [p.example],
          }
        })
      })
    )

    return NextResponse.json({
      success: true,
      enriched: results.length,
      remaining: await (prisma as any).grammarPoint.count({ where: { structure: null } })
    })
  } catch (error: any) {
    console.error('Grammar enrichment error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
