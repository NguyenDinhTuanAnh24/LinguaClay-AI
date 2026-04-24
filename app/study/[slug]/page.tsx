import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import FlashcardStudy from '@/components/study/FlashcardStudy'

function getStableWeight(value: string, seed: string) {
  const input = `${value}:${seed}`
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

export default async function StudyPage({ 
  params, 
}: { 
  params: { slug: string }
}) {
  const { slug } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Đảm bảo User tồn tại trong DB của Prisma
  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email! },
    create: {
      id: user.id,
      email: user.email!,
      targetLanguage: 'EN',
      proficiencyLevel: 'A1'
    }
  })

  // Tìm Topic theo slug thay vì id
  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      words: {
        include: {
          userProgress: {
            where: { userId: user.id }
          }
        }
      }
    }
  })

  if (!topic) {
    notFound()
  }

  const learningData = {
    id: topic.id,
    title: topic.name,
    language: topic.language,
    words: topic.isAIGenerated 
      ? topic.words 
      : [...topic.words].sort(
          (a, b) => getStableWeight(a.id, user.id) - getStableWeight(b.id, user.id),
        )
  }

  return (
    <div className="min-h-screen bg-clay-cream overflow-hidden">
      <FlashcardStudy 
        vocabSet={learningData} 
        userId={user.id} 
      />
    </div>
  )
}
