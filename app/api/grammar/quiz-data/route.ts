import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Lấy ngẫu nhiên 20 bản ghi có đầy đủ dữ liệu example (tiếng Anh)
    // Cách tối ưu trong SQLite/Postgres cho 200 bản ghi là shuffle bằng JS
    const allPoints = await prisma.grammarPoint.findMany({
      where: {
        example: { not: "" }
      },
      select: {
        id: true,
        title: true,
        example: true,
        exampleSentence: true
      }
    })

    const shuffled = allPoints.sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 20)

    return NextResponse.json(selected)
  } catch (error) {
    logger.error("Quiz Data API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
