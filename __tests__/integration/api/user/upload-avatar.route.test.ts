import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
  adminCreateClient: vi.fn(),
  updateUser: vi.fn(),
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

vi.mock('@/repositories/user.repository', () => ({
  UserRepository: {
    update: mocks.updateUser,
  },
}))

describe('POST /api/user/upload-avatar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    mocks.upload.mockResolvedValue({ data: { path: 'u-1/avatar.png' }, error: null })
    mocks.getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn/avatar.png' } })
    mocks.updateUser.mockResolvedValue({ id: 'u-1' })
    mocks.from.mockReturnValue({
      upload: mocks.upload,
      getPublicUrl: mocks.getPublicUrl,
    })
  })

  it('should return 401 when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('@/app/api/user/upload-avatar/route')
    const response = await POST(new Request('http://localhost/api/user/upload-avatar', { method: 'POST', body: new FormData() }) as any)

    expect(response.status).toBe(401)
  })

  it('should validate missing file', async () => {
    const { POST } = await import('@/app/api/user/upload-avatar/route')
    const response = await POST(new Request('http://localhost/api/user/upload-avatar', { method: 'POST', body: new FormData() }) as any)

    expect(response.status).toBe(400)
  })

  it('should reject oversized file', async () => {
    const file = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'avatar.png', { type: 'image/png' })
    const form = new FormData()
    form.append('file', file)
    const { POST } = await import('@/app/api/user/upload-avatar/route')
    const response = await POST(new Request('http://localhost/api/user/upload-avatar', { method: 'POST', body: form }) as any)

    expect(response.status).toBe(400)
  })

  it('should upload avatar and update user profile', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'avatar.png', { type: 'image/png' })
    const form = new FormData()
    form.append('file', file)
    const { POST } = await import('@/app/api/user/upload-avatar/route')
    const response = await POST(new Request('http://localhost/api/user/upload-avatar', { method: 'POST', body: form }) as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(data.url).toContain('https://cdn/avatar.png')
    expect(mocks.upload).toHaveBeenCalledTimes(1)
    expect(mocks.updateUser).toHaveBeenCalledWith('u-1', expect.objectContaining({ image: expect.stringContaining('https://cdn/avatar.png') }))
  })

  it('should use admin storage client when service role key is provided', async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
    const adminFrom = vi.fn().mockReturnValue({
      upload: mocks.upload,
      getPublicUrl: mocks.getPublicUrl,
    })
    mocks.adminCreateClient.mockReturnValue({ storage: { from: adminFrom } })

    const file = new File([new Uint8Array([1])], 'avatar.png', { type: 'image/png' })
    const form = new FormData()
    form.append('file', file)
    const { POST } = await import('@/app/api/user/upload-avatar/route')
    const response = await POST(new Request('http://localhost/api/user/upload-avatar', { method: 'POST', body: form }) as any)

    expect(response.status).toBe(200)
    expect(mocks.adminCreateClient).toHaveBeenCalledTimes(1)
    expect(adminFrom).toHaveBeenCalledWith('avatars')
  })
})
