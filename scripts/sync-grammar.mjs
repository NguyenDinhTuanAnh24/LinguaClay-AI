import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("⏳ Đang chuẩn bị dữ liệu từ grammar_master.json...");
  
  const filePath = path.join(process.cwd(), 'grammar_master.json');
  if (!fs.existsSync(filePath)) {
    console.error("❌ Không tìm thấy file grammar_master.json!");
    return;
  }
  
  const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`🚀 Bắt đầu đồng bộ ${rawData.length} chủ điểm lên Database...`);

  let count = 0;
  for (const item of rawData) {
    try {
      let slug = "";
      if (item.id <= 70) slug = `beg-${item.id}`;
      else if (item.id <= 140) slug = `elem-${item.id - 70}`;
      else slug = `inter-${item.id - 140}`;

      let breakdownArray = [];
      if (item.breakdown && typeof item.breakdown === 'object' && !Array.isArray(item.breakdown)) {
        breakdownArray = Object.entries(item.breakdown).map(([key, value]) => ({
          key: key,
          label: key,
          desc: value
        }));
      } else {
        breakdownArray = item.breakdown || [];
      }

      const content = {
        structure: item.structure,
        breakdown: breakdownArray,
        usage: item.usage,
        signs: item.signs,
        notes: item.notes || "",
        example_en: item.example_en,
        example_vi: item.example_vi
      };

      await prisma.grammarPoint.upsert({
        where: { slug: slug },
        update: {
          title: item.title,
          level: item.level.toUpperCase(),
          structure: item.structure,
          explanation: item.usage ? item.usage[0] : "",
          example: item.example_en,
          exampleSentence: item.example_vi,
          content: content
        },
        create: {
          slug: slug,
          title: item.title,
          level: item.level.toUpperCase(),
          structure: item.structure,
          explanation: item.usage ? item.usage[0] : "",
          example: item.example_en,
          exampleSentence: item.example_vi,
          content: content
        },
      });

      count++;
      if (count % 20 === 0) console.log(`✅ Đã đồng bộ ${count}/200 bài...`);
    } catch (error) {
      console.error(`❌ Lỗi tại ID ${item.id} (${item.title}):`, error.message);
    }
  }

  console.log("\n🎉 HOÀN THÀNH! Dữ liệu đã lên Cloud sạch đẹp và sẵn sàng cho UI.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
