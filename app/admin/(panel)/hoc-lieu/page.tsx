import { prisma } from '@/lib/prisma'
import { HocLieuClient, type FlashcardSetView, type GrammarItemView, type MediaItemView } from './ui-client'

type MediaAssetRow = {
  id: string
  type: 'IMAGE' | 'AUDIO'
  name: string
  url: string
  size: string | null
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export default async function HocLieuPage() {
  const mediaDelegate = (prisma as unknown as { mediaAsset?: { findMany: (args: unknown) => Promise<MediaAssetRow[]> } }).mediaAsset

  const [topics, grammarPoints, mediaAssets] = await Promise.all([
    prisma.topic.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        name: true,
        level: true,
        createdAt: true,
        words: {
          select: {
            id: true,
            original: true,
            translation: true,
            example: true,
            pronunciation: true,
          },
          orderBy: { createdAt: 'asc' },
          take: 200,
        },
      },
    }),
    prisma.grammarPoint.findMany({
      orderBy: { id: 'desc' },
      take: 400,
      select: {
        id: true,
        title: true,
        level: true,
        structure: true,
      },
    }),
    mediaDelegate
      ? mediaDelegate.findMany({
          orderBy: { createdAt: 'desc' },
          take: 500,
          select: {
            id: true,
            type: true,
            name: true,
            url: true,
            size: true,
          },
        })
      : Promise.resolve([]),
  ])

  const flashcardSets: FlashcardSetView[] = topics.map((topic) => ({
    id: topic.id,
    topic: topic.name,
    words: topic.words.length,
    level: topic.level || 'N/A',
    createdAt: formatDate(topic.createdAt),
    items: topic.words.map((word) => ({
      id: word.id,
      term: word.original,
      definition: word.translation,
      example: word.example || '',
      pronunciation: word.pronunciation || '',
    })),
  }))

  const grammarRows: GrammarItemView[] = grammarPoints.map((row) => ({
    id: row.id,
    title: row.title,
    level: row.level || 'N/A',
    structure: row.structure || 'N/A',
    createdAt: '-',
  }))

  const mediaItems: MediaItemView[] = mediaAssets.map((asset) => ({
    id: asset.id,
    type: asset.type === 'IMAGE' ? 'Ảnh' : 'Âm thanh',
    name: asset.name,
    url: asset.url,
    size: asset.size || 'N/A',
  }))

  return <HocLieuClient flashcardSets={flashcardSets} grammarRows={grammarRows} mediaItems={mediaItems} />
}
