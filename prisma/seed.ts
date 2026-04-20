import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🏗️  BẮT ĐẦU CHIẾN DỊCH BƠM DỮ LIỆU KHỔNG LỒ (MASSIVE SEEDING)...')

  const filePath = path.join(process.cwd(), 'data/english/huge-vocabulary.json')
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Không tìm thấy file dữ liệu: ${filePath}`)
    return
  }

  const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  console.log(`📊 Đã đọc ${rawData.length} từ vựng từ tệp tin.`)

  // 1. Phân tách danh sách Topic duy nhất
  const uniqueTopics = Array.from(new Set(rawData.map((w: any) => w.topicName))) as string[]
  console.log(`📂 Tìm thấy ${uniqueTopics.length} chủ đề khác nhau.`)

  // 2. Dọn dẹp dữ liệu cũ (Xóa toàn bộ Topic và Word để nạp mới hoàn toàn cho sạch)
  console.log('🧹 Đang làm sạch Database để sẵn sàng nhận dữ liệu mới...')
  await prisma.userProgress.deleteMany({})
  await prisma.word.deleteMany({})
  await prisma.topic.deleteMany({})

  // 3. Tạo tất cả các Topic trước
  const topicMap = new Map<string, string>() // Name -> ID

  for (const topicName of uniqueTopics) {
    const firstWord = rawData.find((w: any) => w.topicName === topicName)
    const topic = await prisma.topic.create({
      data: {
        name: topicName,
        slug: firstWord.topicSlug || topicName.toLowerCase().replace(/ /g, '-'),
        description: `Kho tàng từ vựng chuyên sâu về ${topicName} dành cho trình độ Advanced.`,
        level: 'Advanced',
        language: 'EN',
        image: `https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400`,
      }
    })
    topicMap.set(topicName, topic.id)
    console.log(`✅ Khởi tạo chủ đề: ${topicName}`)
  }

  // 4. Bơm từ vựng theo lô (Batching) để tối ưu hiệu năng
  console.log('⚡ Đang thực hiện bơm từ vựng hàng loạt...')
  
  await prisma.word.createMany({
    data: rawData.map((w: any) => ({
      original: w.term,
      translation: w.definition,
      pronunciation: w.pronunciation,
      example: w.example,
      exampleTranslation: w.exampleTranslation,
      topicId: topicMap.get(w.topicName),
    }))
  })

  console.log(`🚀 Đã "bơm" thành công ${rawData.length} từ vào ${uniqueTopics.length} chủ đề.`)

  // 5. Bơm dữ liệu Ngữ pháp thực tế (200 chủ điểm)
  console.log('\n🏺 BẮT ĐẦU BƠM 200 CHỦ ĐIỂM NGỮ PHÁP THỰC TẾ...')

  const BEGINNER_TOPICS = [
    // Nhóm Thì & Động từ cơ bản
    'Hiện tại đơn - Động từ "to be"',
    'Hiện tại đơn - Động từ thường',
    'Trợ động từ Do / Does',
    'Câu phủ định với To Be',
    'Câu phủ định với Do / Does',
    'Câu hỏi Yes/No với To Be',
    'Câu hỏi Yes/No với Do / Does',
    'Câu mệnh lệnh khẳng định',
    'Câu mệnh lệnh phủ định',
    // Nhóm Thể loại câu hỏi
    'Câu hỏi Wh-: What và Where',
    'Câu hỏi Wh-: Who, When, Why, How',
    'Câu hỏi How much và How many',
    'Câu hỏi How old và How often',
    // Nhóm Từ loại
    'Đại từ nhân xưng - Subject Pronouns',
    'Đại từ tân ngữ - Object Pronouns',
    'Tính từ sở hữu - My, Your, His...',
    'Đại từ sở hữu - Mine, Yours...',
    'Tính từ và vị trí trong câu',
    'Thứ tự tính từ đứng trước danh từ',
    'Trạng từ tần suất - Always, Never',
    'Trạng từ tần suất - Usually, Sometimes',
    // Nhóm Danh từ & Mạo từ
    'Mạo từ không xác định - A và An',
    'Mạo từ xác định - The',
    'Danh từ số nhiều - Có quy tắc',
    'Danh từ số nhiều - Bất quy tắc',
    'Danh từ đếm được và không đếm được',
    'Số đếm - Cardinal Numbers',
    'Số thứ tự - Ordinal Numbers',
    // Nhóm Đại từ & Cấu trúc xác định
    'This, That, These, Those',
    'Sở hữu cách - Possessive ("s)',
    // Nhóm Động từ đặc biệt
    'Have / Has - Thể hiện sở hữu',
    'Can / Cannot - Khả năng',
    'Must / Mustn\'t - Nghĩa vụ',
    'Would Like - Yêu cầu lịch sự',
    'Like + V-ing - Thích làm gì',
    'Want + To V - Muốn làm gì',
    "Let's - Đề xuất cùng làm",
    // Nhóm Giới từ
    'Giới từ chỉ nơi chốn - In, On, At',
    'Giới từ chỉ thời gian - In, On, At',
    'Động từ + Giới từ kết hợp',
    // Nhóm Cấu trúc đặc biệt
    'Cấu trúc There is / There are',
    'Cấu trúc It is + Tính từ',
    'Some và Any',
    'A lot of, A few, A little',
    'Động từ tri giác - Look, Sound, Feel',
    'Động từ bất quy tắc cơ bản',
    // Nhóm Liên từ & Cách diễn đạt
    'Liên từ And, But, Or',
    'Liên từ Because và So',
    'Biểu thức thời gian - Today, Tomorrow, Yesterday',
    'Cách nói giờ trong tiếng Anh',
    'Các ngày trong tuần và tháng',
    // Nhóm Bổ sung Beginner
    'Câu so sánh đơn giản - Bigger, Smaller',
    'Cấu trúc A/An + Tính từ + Danh từ',
    'Trả lời ngắn - Short Answers',
    'Câu hỏi đuôi cơ bản',
    'Cách dùng Have Got',
    'Câu hỏi Where is / Where are',
    'Cách nói tuổi tác',
    'Cách hỏi và mô tả người',
    'Cách diễn đạt thích/không thích',
    'Cách diễn đạt muốn/mong muốn',
    'Yêu cầu lịch sự với Please',
    'Đề nghị với Shall I / We',
    'Gợi ý với Why don\'t we',
    'Đề xuất với How about + V-ing',
    'Câu với There was / There were',
    'Câu hỏi How + Tính từ (How tall...?)',
    'Lời chào hỏi và giới thiệu',
    'Biểu đạt xin lỗi và đáp lại',
    'Cấu trúc câu đơn giản S + V + O',
    'Ôn tập: Cấu trúc Hiện tại đơn',
  ]

  const ELEMENTARY_TOPICS = [
    // Nhóm Thì
    'Quá khứ đơn - Động từ có quy tắc',
    'Quá khứ đơn - Động từ bất quy tắc',
    'Quá khứ đơn với Was / Were',
    'Quá khứ đơn - Câu phủ định',
    'Quá khứ đơn - Câu hỏi',
    'Hiện tại tiếp diễn - Đang xảy ra',
    'Hiện tại tiếp diễn - Kế hoạch tương lai',
    'Quá khứ tiếp diễn',
    'Tương lai đơn với Will',
    'Be going to - Kế hoạch đã định',
    // Nhóm So sánh & Trạng từ
    'So sánh hơn - Tính từ ngắn',
    'So sánh hơn - Tính từ dài',
    'So sánh nhất - Superlative',
    'So sánh bằng - As...As',
    'Trạng từ cách thức với -ly',
    'Trạng từ: Well, Fast, Hard, Late',
    // Nhóm Cấu trúc đặc biệt
    'Used to - Thói quen trong quá khứ',
    'Too + Tính từ',
    'Tính từ + Enough',
    'Cụm động từ - Look for, Get up',
    'Cụm động từ - Turn on, Put on',
    'Danh động từ làm chủ ngữ',
    'Danh động từ sau giới từ',
    'Động từ nguyên mẫu chỉ mục đích',
    // Nhóm Động từ khuyết thiếu
    'Should / Shouldn\'t - Lời khuyên',
    'Have to / Don\'t have to - Bắt buộc',
    'May / Might - Khả năng có thể',
    // Nhóm Giới từ nâng cao
    'Giới từ chỉ sự chuyển động',
    'Giới từ - Across, Through, Towards',
    'Liên từ Although và However',
    // Nhóm Câu phức
    'Câu điều kiện loại 1',
    'Mệnh đề thời gian - When, While, Until',
    'Đại từ quan hệ - Who, Which, That',
    'Mệnh đề quan hệ xác định',
    'Câu hỏi đuôi khẳng định',
    'Câu hỏi đuôi phủ định',
    'So và Such - Nhấn mạnh',
    // Nhóm Câu tường thuật
    'Câu tường thuật - Câu trần thuật',
    'Câu tường thuật - Câu hỏi',
    'Câu tường thuật - Câu mệnh lệnh',
    // Nhóm Đại từ & Từ chỉ lượng
    'Đại từ phản thân - Myself, Yourself...',
    'Each other / One another',
    'Few và Little - Không nhiều',
    'Both, Either, Neither',
    'Từ chỉ số lượng - Much, Many, A lot',
    'Something, Anything, Nothing',
    // Nhóm Cấu trúc đặc biệt
    'Câu hỏi gián tiếp',
    'Câu cảm thán - What a...! How...!',
    'So do I / Neither do I',
    'Make vs Do - Cụm từ cố định',
    'Say vs Tell',
    'Look vs See vs Watch',
    'Hear vs Listen',
    // Nhóm Hiện tại hoàn thành (giới thiệu)
    'Hiện tại hoàn thành - Kinh nghiệm (ever/never)',
    'Hiện tại hoàn thành với Just',
    'Hiện tại hoàn thành với For và Since',
    // Nhóm Bổ sung
    'Biểu đạt ý kiến - I think, I believe',
    'Biểu đạt sự chắc chắn - Definitely, Probably',
    'Văn phong trang trọng và thân mật',
    'Tổ chức đoạn văn',
    'Cụm từ cố định với Make',
    'Cụm từ cố định với Take',
    'Cụm từ cố định với Have',
    'Cụm từ cố định với Do',
    'Cụm động từ với Get',
    'Cụm động từ với Turn',
  ]

  const INTERMEDIATE_TOPICS = [
    // Nhóm Thì hoàn thành
    'Hiện tại hoàn thành đơn - Hành động vừa xong',
    'Hiện tại hoàn thành tiếp diễn',
    'Quá khứ hoàn thành đơn',
    'Quá khứ hoàn thành tiếp diễn',
    'Tương lai hoàn thành',
    'Tương lai tiếp diễn',
    // Nhóm Câu điều kiện
    'Câu điều kiện loại 0 - Sự thật hiển nhiên',
    'Câu điều kiện loại 1 - Tương lai có thể xảy ra',
    'Câu điều kiện loại 2 - Giả định hiện tại',
    'Câu điều kiện loại 3 - Giả định quá khứ',
    'Câu điều kiện hỗn hợp',
    // Nhóm Câu ước
    'Wish + Quá khứ đơn - Ước hiện tại',
    'Wish + Quá khứ hoàn thành - Ước quá khứ',
    'Wish + Would - Ước về hành vi người khác',
    // Nhóm Mệnh đề quan hệ
    'Mệnh đề quan hệ xác định',
    'Mệnh đề quan hệ không xác định',
    // Nhóm Câu bị động
    'Câu bị động - Hiện tại đơn',
    'Câu bị động - Quá khứ đơn',
    'Câu bị động - Thì hoàn thành',
    'Câu bị động với Động từ khuyết thiếu',
    // Nhóm Câu tường thuật nâng cao
    'Câu tường thuật - Đổi thì động từ',
    'Câu tường thuật - Câu hỏi gián tiếp',
    'Câu tường thuật - Câu mệnh lệnh',
    // Nhóm Danh động từ & Nguyên mẫu
    'Danh động từ vs Nguyên mẫu - Nghĩa thay đổi',
    'Động từ chỉ đi với Danh động từ',
    'Động từ chỉ đi với Động từ nguyên mẫu',
    // Nhóm Cấu trúc đặc biệt
    'Cấu trúc nhờ/bị - Have/Get something done',
    'Câu chẻ - It is...that',
    'Câu chẻ - What...is',
    'Đảo ngữ nhấn mạnh',
    'Thức giả định - Subjunctive',
    // Nhóm Động từ khuyết thiếu nâng cao
    'Động từ khuyết thiếu - Phỏng đoán hiện tại',
    'Động từ khuyết thiếu - Phỏng đoán quá khứ',
    'Need to / Needn\'t',
    'Be supposed to',
    // Nhóm Cấu trúc phức tạp
    'Mệnh đề phân từ - Participle Clauses',
    'Đưa thành phần lên đầu câu nhấn mạnh',
    'Tỉnh lược và thay thế trong câu',
    'Từ nối văn phong trang trọng',
    'Từ nối văn phong thân mật',
    // Nhóm Ngữ pháp học thuật
    'Danh hóa động từ - Nominalisation',
    'Cụm danh từ phức tạp',
    'Mạo từ với danh từ trừu tượng',
    'Giới từ nâng cao',
    'Cụm giới từ nhấn mạnh',
    'Ngôn ngữ rào đón - Hedging',
    'Quy ước văn phong học thuật',
    'Từ nối - Tương phản',
    'Từ nối - Nguyên nhân và kết quả',
    'Văn phong trang trọng và ngôn ngữ chuẩn',
  ]

  const allGrammarPoints = [
    ...BEGINNER_TOPICS.map((title, i) => ({
      slug: `beg-${i + 1}`,
      title,
      level: 'Beginner',
      explanation: `Giải thích về ${title} ở trình độ Beginner. Sẽ được AI cập nhật chi tiết.`,
      example: `Example sentence for ${title}`,
    })),
    ...ELEMENTARY_TOPICS.map((title, i) => ({
      slug: `elem-${i + 1}`,
      title,
      level: 'Elementary',
      explanation: `Giải thích về ${title} ở trình độ Elementary. Sẽ được AI cập nhật chi tiết.`,
      example: `Example sentence for ${title}`,
    })),
    ...INTERMEDIATE_TOPICS.map((title, i) => ({
      slug: `inter-${i + 1}`,
      title,
      level: 'Intermediate',
      explanation: `Giải thích về ${title} ở trình độ Intermediate. Sẽ được AI cập nhật chi tiết.`,
      example: `Example sentence for ${title}`,
    })),
  ]

  for (const p of allGrammarPoints) {
    await prisma.grammarPoint.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        explanation: p.explanation,
        example: p.example,
        level: p.level,
        structure: null,        // Reset để batch AI điền lại
        exampleSentence: null,
        exerciseData: { set: null },
      },
      create: p,
    })
  }

  console.log(`\n✨ HOÀN TẤT CHIẾN DỊCH!`)
  console.log(`🏺 Tổng cộng: ${allGrammarPoints.length} chủ điểm ngữ pháp thực tế đã sẵn sàng.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
