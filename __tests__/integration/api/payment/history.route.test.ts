import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  countByUserId: vi.fn(),
  findManyByUserId: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}))

vi.mock('@/repositories/order.repository', () => ({
  OrderRepository: {
    countByUserId: mocks.countByUserId,
    findManyByUserId: mocks.findManyByUserId,
  },
}))

describe('GET /api/payment/history', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
    mocks.countByUserId.mockResolvedValue(23)
    mocks.findManyByUserId.mockResolvedValue([{ id: 'o-1' }])
  })

  it('should return 401 when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('@/app/api/payment/history/route')
    const response = await GET(new Request('http://localhost/api/payment/history'))

    expect(response.status).toBe(401)
  })

  it('should return paginated order history with sanitized query params', async () => {
    const { GET } = await import('@/app/api/payment/history/route')
    const response = await GET(new Request('http://localhost/api/payment/history?page=-5&pageSize=100'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(data.page).toBe(1)
    expect(data.pageSize).toBe(20)
    expect(data.totalPages).toBe(2)
    expect(mocks.findManyByUserId).toHaveBeenCalledWith('u-1', { skip: 0, take: 20 })
  })

  it('should return custom page and empty state correctly', async () => {
    mocks.countByUserId.mockResolvedValue(0)
    mocks.findManyByUserId.mockResolvedValue([])
    const { GET } = await import('@/app/api/payment/history/route')
    const response = await GET(new Request('http://localhost/api/payment/history?page=2&pageSize=5'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.page).toBe(2)
    expect(data.pageSize).toBe(5)
    expect(data.total).toBe(0)
    expect(data.totalPages).toBe(1)
    expect(data.orders).toEqual([])
    expect(mocks.findManyByUserId).toHaveBeenCalledWith('u-1', { skip: 5, take: 5 })
  })

  it('should return 500 when repository throws', async () => {
    mocks.countByUserId.mockRejectedValue(new Error('db fail'))
    const { GET } = await import('@/app/api/payment/history/route')
    const response = await GET(new Request('http://localhost/api/payment/history'))

    expect(response.status).toBe(500)
  })
})
