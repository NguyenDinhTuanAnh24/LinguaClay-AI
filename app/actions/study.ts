'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

/**
 * Thuật toán Spaced Repetition System (SRS)
 * 
 * Mastery level: 0–5 (0 = chưa học, 5 = thuộc lòng)
 * 
 * Đúng: level++ → nextReview = now + 2^level days
 * Sai:  level = 0  → nextReview = now + 30 minutes
 */
export async function updateWordProgress(
  userId: string,
  wordId: string,
  isCorrect: boolean
) {
  try {
    const existing = await prisma.userProgress.findUnique({
      where: { userId_wordId: { userId, wordId } }
    })

    const currentLevel = existing?.masteryLevel ?? 0

    // Tính mastery level mới
    let newLevel: number
    if (isCorrect) {
      newLevel = Math.min(5, currentLevel + 1)
    } else {
      newLevel = 0
    }

    // Tính nextReview theo công thức SRS: 2^level ngày
    const nextReview = new Date()
    if (isCorrect) {
      const daysToAdd = Math.pow(2, newLevel)   // L1=2d, L2=4d, L3=8d, L4=16d, L5=32d
      nextReview.setDate(nextReview.getDate() + daysToAdd)
    } else {
      nextReview.setMinutes(nextReview.getMinutes() + 30) // Sai → ôn lại sau 30 phút
    }

    await prisma.userProgress.upsert({
      where: { userId_wordId: { userId, wordId } },
      update: {
        masteryLevel: newLevel,
        lastReviewed: new Date(),
        nextReview,
        isDifficult: !isCorrect,
      },
      create: {
        userId,
        wordId,
        masteryLevel: newLevel,
        lastReviewed: new Date(),
        nextReview,
        isDifficult: !isCorrect,
      }
    })

    revalidatePath('/dashboard')
    return { success: true, newLevel }
  } catch (error) {
    console.error('SRS update error:', error)
    return { success: false, newLevel: 0 }
  }
}
