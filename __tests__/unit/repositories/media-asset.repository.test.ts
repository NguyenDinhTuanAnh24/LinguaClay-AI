import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MediaAssetRepository } from '@/repositories/media-asset.repository'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mediaAsset: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('MediaAssetRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getDelegate should return media delegate when model exists', async () => {
    const delegate = MediaAssetRepository.getDelegate()

    expect(delegate).toBeTruthy()
  })

  it('listRows should map IMAGE/AUDIO labels and fallback size', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.mediaAsset.findMany).mockResolvedValue([
      {
        id: 'm-1',
        type: 'IMAGE',
        name: 'cover.png',
        url: 'https://cdn/cover.png',
        size: null,
      },
      {
        id: 'm-2',
        type: 'AUDIO',
        name: 'a1.mp3',
        url: 'https://cdn/a1.mp3',
        size: '4MB',
      },
    ] as never)

    const result = await MediaAssetRepository.listRows()

    expect(result).toEqual([
      {
        id: 'm-1',
        type: 'Ảnh',
        name: 'cover.png',
        url: 'https://cdn/cover.png',
        size: 'N/A',
      },
      {
        id: 'm-2',
        type: 'Âm thanh',
        name: 'a1.mp3',
        url: 'https://cdn/a1.mp3',
        size: '4MB',
      },
    ])
    expect(prisma.mediaAsset.findMany).toHaveBeenCalledWith({
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
  })

  it('listRows should throw when delegate is missing', async () => {
    const { prisma } = await import('@/lib/prisma')
    const oldDelegate = (prisma as any).mediaAsset
    ;(prisma as any).mediaAsset = null

    await expect(MediaAssetRepository.listRows()).rejects.toThrow('MEDIA_ASSET_MODEL_MISSING')

    ;(prisma as any).mediaAsset = oldDelegate
  })

  it('create should call delegate create', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.mediaAsset.create).mockResolvedValue({ id: 'm-1' } as never)
    const data = { type: 'IMAGE' as const, name: 'n', url: 'u', size: null }

    await MediaAssetRepository.create(data)

    expect(prisma.mediaAsset.create).toHaveBeenCalledWith({ data })
  })

  it('update should call delegate update', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.mediaAsset.update).mockResolvedValue({ id: 'm-1' } as never)
    const data = { type: 'AUDIO' as const, name: 'n2', url: 'u2', size: '1MB' }

    await MediaAssetRepository.update('m-1', data)

    expect(prisma.mediaAsset.update).toHaveBeenCalledWith({
      where: { id: 'm-1' },
      data,
    })
  })

  it('delete should call delegate delete', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.mediaAsset.delete).mockResolvedValue({ id: 'm-1' } as never)

    await MediaAssetRepository.delete('m-1')

    expect(prisma.mediaAsset.delete).toHaveBeenCalledWith({
      where: { id: 'm-1' },
    })
  })

  it('create should throw when delegate is missing', async () => {
    const { prisma } = await import('@/lib/prisma')
    const oldDelegate = (prisma as any).mediaAsset
    ;(prisma as any).mediaAsset = null

    await expect(
      MediaAssetRepository.create({
        type: 'IMAGE',
        name: 'x',
        url: 'y',
        size: null,
      })
    ).rejects.toThrow('MEDIA_ASSET_MODEL_MISSING')

    ;(prisma as any).mediaAsset = oldDelegate
  })
})
