/**
 * Grammar AI Tutor Enrichment - Standalone Script
 * Sinh nội dung giảng dạy chi tiết theo chuẩn "Gia sư AI"
 * 
 * Cách dùng: node scripts/enrich-grammar.js
 */

const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const Groq = require('groq-sdk')
require('dotenv').config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
const groq = new Groq.default({ apiKey: process.env.GROQ_API_KEY })

const BATCH_SIZE = 3
const DELAY_MS = 8000

const { Prisma } = require('@prisma/client')

async function enrichBatch() {
  return prisma.grammarPoint.findMany({
    where: { content: { equals: Prisma.DbNull } },
    take: BATCH_SIZE,
  })
}

async function enrichPoint(p) {
  const prompt = `Bạn là chuyên gia ngữ pháp tiếng Anh. Hãy biên soạn nội dung dạy học chi tiết cho chủ điểm: "${p.title}" (Trình độ: ${p.level}).

Trả về ĐÚNG JSON sau, KHÔNG có markdown, KHÔNG giải thích thêm:
{
  "structure": "S + V(s/es) + O",
  "breakdown": [
    {"key": "S", "label": "Subject (Chủ ngữ)", "desc": "Người hoặc vật thực hiện hành động"},
    {"key": "V", "label": "Verb (Động từ)", "desc": "Hành động chính, chia theo chủ ngữ"},
    {"key": "O", "label": "Object (Tân ngữ)", "desc": "Đối tượng nhận hành động"}
  ],
  "usage": [
    "Dùng để diễn tả thói quen hoặc hành động xảy ra thường xuyên",
    "Dùng để nói về sự thật hiển nhiên hoặc quy luật khoa học",
    "Dùng để diễn tả lịch trình cố định trong tương lai"
  ],
  "signs": ["always", "usually", "often", "sometimes", "never", "every day"],
  "notes": "Chia động từ thêm -(e)s với chủ ngữ là He/She/It",
  "example_en": "She always drinks coffee in the morning",
  "example_vi": "Cô ấy luôn luôn uống cà phê vào buổi sáng",
  "scramble_sentences": [
    "She always drinks coffee in the morning",
    "He plays football every weekend",
    "They study English together every day"
  ]
}

Quy tắc bắt buộc:
- structure: công thức ngắn gọn dùng S/V/O/Adj/Adv/N
- breakdown: giải thích đúng các ký hiệu trong structure (2-4 items)
- usage: 3 bullet points cách dùng bằng tiếng Việt
- signs: mảng các từ/cụm từ nhận biết bằng tiếng Anh  
- notes: 1 câu lưu ý quan trọng bằng tiếng Việt
- example_en: 1 câu tiếng Anh chuẩn, đơn giản (6-12 từ)
- example_vi: dịch nghĩa tiếng Việt của example_en
- scramble_sentences: 3 câu tiếng Anh đơn giản (6-12 từ) để học viên sắp xếp
- Tất cả nội dung phải phù hợp trình độ: ${p.level}`

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    response_format: { type: 'json_object' },
  })

  const data = JSON.parse(completion.choices[0].message.content || '{}')

  await prisma.grammarPoint.update({
    where: { id: p.id },
    data: {
      structure: data.structure || 'S + V + O',
      explanation: data.usage?.join(' | ') || p.explanation,
      exampleSentence: data.example_en || p.example,
      exerciseData: data.scramble_sentences || [data.example_en || p.example],
      content: data,
    }
  })

  return data.structure
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  console.log('🎓 AI TUTOR GRAMMAR ENRICHMENT - STANDALONE MODE')

  const total = await prisma.grammarPoint.count({ where: { content: { equals: Prisma.DbNull } } })
  console.log(`📊 Cần enriched: ${total} chủ điểm\n`)

  if (total === 0) {
    console.log('✅ Tất cả đã được enriched!')
    return
  }

  let batch = 1
  let done = 0

  while (true) {
    const points = await enrichBatch()
    if (points.length === 0) break

    console.log(`📦 Batch #${batch} (${points.length} items)...`)

    for (const p of points) {
      try {
        const structure = await enrichPoint(p)
        done++
        console.log(`  ✅ [${done}/${total}] ${p.title} → ${structure}`)
      } catch (err) {
        const msg = err.message || ''
        const is429 = msg.includes('429') || msg.includes('Rate limit')
        console.error(`  ❌ ${p.title}: ${msg.substring(0, 60)}`)
        if (is429) {
          console.log('  ⏳ Rate limit hit - đợi 65 giây...')
          await sleep(65000)
        }
      }
      await sleep(2000) // giãn cách 2s/request tránh rate limit
    }

    const remaining = await prisma.grammarPoint.count({ where: { content: { equals: Prisma.DbNull } } })
    console.log(`  📈 Còn lại: ${remaining}\n`)

    if (remaining === 0) break
    batch++
    await sleep(DELAY_MS)
  }

  console.log(`\n🎉 HOÀN TẤT! ${done} chủ điểm đã có nội dung Gia sư AI.`)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
