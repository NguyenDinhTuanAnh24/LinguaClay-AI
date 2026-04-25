import { prisma } from '@/lib/prisma'

export type MediaRow = {
  id: string
  type: 'IMAGE' | 'AUDIO'
  name: string
  url: string
  size: string | null
}

type MediaDelegate = {
  findMany: (args: unknown) => Promise<MediaRow[]>
  create: (args: unknown) => Promise<unknown>
  update: (args: unknown) => Promise<unknown>
  delete: (args: unknown) => Promise<unknown>
}

function getMediaDelegate(): MediaDelegate | null {
  const delegate = (prisma as unknown as { mediaAsset?: MediaDelegate }).mediaAsset
  return delegate || null
}

export class MediaAssetRepository {
  static getDelegate() {
    return getMediaDelegate()
  }

  static async listRows() {
    const media = getMediaDelegate()
    if (!media) throw new Error('MEDIA_ASSET_MODEL_MISSING')

    const rows = await media.findMany({
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

    return rows.map((row) => ({
      id: row.id,
      type: row.type === 'IMAGE' ? 'Ảnh' : 'Âm thanh',
      name: row.name,
      url: row.url,
      size: row.size || 'N/A',
    }))
  }

  static async create(data: { type: 'IMAGE' | 'AUDIO'; name: string; url: string; size: string | null }) {
    const media = getMediaDelegate()
    if (!media) throw new Error('MEDIA_ASSET_MODEL_MISSING')
    return media.create({ data })
  }

  static async update(id: string, data: { type: 'IMAGE' | 'AUDIO'; name: string; url: string; size: string | null }) {
    const media = getMediaDelegate()
    if (!media) throw new Error('MEDIA_ASSET_MODEL_MISSING')
    return media.update({
      where: { id },
      data,
    })
  }

  static async delete(id: string) {
    const media = getMediaDelegate()
    if (!media) throw new Error('MEDIA_ASSET_MODEL_MISSING')
    return media.delete({ where: { id } })
  }
}
