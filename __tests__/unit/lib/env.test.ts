import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalEnv = { ...process.env }

function setValidEnv() {
  process.env.DATABASE_URL = 'https://db.example.com'
  process.env.GROQ_API_KEY = 'groq-key'
  process.env.PAYOS_CLIENT_ID = 'client-id'
  process.env.PAYOS_API_KEY = 'api-key'
  process.env.PAYOS_CHECKSUM_KEY = 'checksum'
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon'
  process.env.NEXT_PUBLIC_DOMAIN = 'https://app.example.com'
}

describe('env validation', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    setValidEnv()
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('envClient should parse valid client env vars', async () => {
    const { envClient } = await import('@/lib/env.client')
    expect(envClient.NEXT_PUBLIC_SUPABASE_URL).toBe('https://example.supabase.co')
    expect(envClient.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('anon')
    expect(envClient.NEXT_PUBLIC_DOMAIN).toBe('https://app.example.com')
  })

  it('envClient should throw when required client env is missing', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    await expect(import('@/lib/env.client')).rejects.toThrow('Invalid environment variables')
    spy.mockRestore()
  })

  it('envServer should parse valid server env vars', async () => {
    const { envServer } = await import('@/lib/env.server')
    expect(envServer.DATABASE_URL).toBe('https://db.example.com')
    expect(envServer.GROQ_API_KEY).toBe('groq-key')
    expect(envServer.PAYOS_CLIENT_ID).toBe('client-id')
  })

  it('envServer should throw when required server env is invalid', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    process.env.DATABASE_URL = 'not-a-url'

    await expect(import('@/lib/env.server')).rejects.toThrow('Invalid server environment variables')
    spy.mockRestore()
  })
})
