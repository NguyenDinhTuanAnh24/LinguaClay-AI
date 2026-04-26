import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
  adminCreateClient: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
    storage: { from: mocks.from },
  })),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: mocks.adminCreateClient,
}))

describe('POST /api/support/upload-attachment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    mocks.upload.mockResolvedValue({ data: { path: 'u-1/abc.png' }, error: null })
    mocks.getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn/support.png' } })
    mocks.from.mockReturnValue({
      upload: mocks.upload,
      getPublicUrl: mocks.getPublicUrl,
    })
  })

  it('should return 401 when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('@/app/api/support/upload-attachment/route')
    const response = await POST(new Request('http://localhost/api/support/upload-attachment', { method: 'POST', body: new FormData() }) as any)

    expect(response.status).toBe(401)
  })

  it('should reject non-image files', async () => {
    const form = new FormData()
    form.append('file', new File([new Uint8Array([1])], 'doc.txt', { type: 'text/plain' }))
    const { POST } = await import('@/app/api/support/upload-attachment/route')
    const response = await POST(new Request('http://localhost/api/support/upload-attachment', { method: 'POST', body: form }) as any)

    expect(response.status).toBe(400)
  })

  it('should upload attachment successfully', async () => {
    const form = new FormData()
    form.append('file', new File([new Uint8Array([1, 2])], 'img.png', { type: 'image/png' }))
    const { POST } = await import('@/app/api/support/upload-attachment/route')
    const response = await POST(new Request('http://localhost/api/support/upload-attachment', { method: 'POST', body: form }) as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(data.url).toContain('https://cdn/support.png')
    expect(mocks.upload).toHaveBeenCalledTimes(1)
  })

  it('should fallback to 500 when storage upload fails', async () => {
    mocks.upload.mockResolvedValue({ data: null, error: { message: 'storage failed' } })
    const form = new FormData()
    form.append('file', new File([new Uint8Array([1])], 'img.png', { type: 'image/png' }))
    const { POST } = await import('@/app/api/support/upload-attachment/route')
    const response = await POST(new Request('http://localhost/api/support/upload-attachment', { method: 'POST', body: form }) as any)

    expect(response.status).toBe(500)
  })
})
