/**
 * Script chạy AI Batch Enrichment cho 200 Grammar Points
 * Mỗi lần gọi API sẽ xử lý 10 bản ghi → Cần chạy ~20 lần
 *
 * Cách dùng:
 *   node scripts/run-grammar-enrichment.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
const BATCH_SIZE = 10
const DELAY_MS = 2000 // Chờ 2 giây giữa các batch để tránh rate limit Groq

async function runBatch(batchNum) {
  console.log(`\n📦 Batch #${batchNum}...`)
  const res = await fetch(`${BASE_URL}/api/admin/generate-grammar-samples`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchSize: BATCH_SIZE }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'API Error')
  console.log(`✅ Đã enriched: ${data.enriched} bài | Còn lại: ${data.remaining}`)
  return data.remaining
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log('🚀 BẮT ĐẦU AI ENRICHMENT CHO 200 GRAMMAR POINTS...')
  console.log(`📡 Target: ${BASE_URL}`)
  console.log(`⚙️  Batch Size: ${BATCH_SIZE} | Delay: ${DELAY_MS}ms\n`)

  let remaining = 999
  let batch = 1

  while (remaining > 0) {
    try {
      remaining = await runBatch(batch)
      batch++

      if (remaining > 0) {
        console.log(`⏳ Đợi ${DELAY_MS / 1000}s...`)
        await sleep(DELAY_MS)
      }
    } catch (err) {
      console.error(`❌ Lỗi ở batch #${batch}:`, err.message)
      console.log('⏳ Thử lại sau 5 giây...')
      await sleep(5000)
    }
  }

  console.log('\n🎉 HOÀN TẤT! Tất cả 200 Grammar Points đã được AI làm giàu nội dung.')
}

main()
