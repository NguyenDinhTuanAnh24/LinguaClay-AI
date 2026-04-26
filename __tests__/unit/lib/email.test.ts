import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  resendSend: vi.fn(),
  createTransport: vi.fn(),
  sendMail: vi.fn(),
}))

vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = {
      send: mocks.resendSend,
    }
    constructor(_apiKey: string) {}
  },
}))

vi.mock('nodemailer', () => ({
  default: {
    createTransport: mocks.createTransport,
  },
  createTransport: mocks.createTransport,
}))

describe('sendSystemEmail', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    delete process.env.RESEND_API_KEY
    delete process.env.GMAIL_USER
    delete process.env.GMAIL_PASS
    delete process.env.RESEND_FROM_EMAIL
  })

  it('should send with resend when RESEND_API_KEY is available', async () => {
    process.env.RESEND_API_KEY = 'resend-key'
    mocks.resendSend.mockResolvedValue({ error: null })
    const { sendSystemEmail } = await import('@/lib/email')

    const result = await sendSystemEmail('to@example.com', 'Subject', '<b>Hello</b>', 'Hello')

    expect(result).toEqual({ sent: true, provider: 'resend' })
    expect(mocks.resendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'to@example.com',
        subject: 'Subject',
        text: 'Hello',
      })
    )
  })

  it('should fallback to gmail when resend returns error', async () => {
    process.env.RESEND_API_KEY = 'resend-key'
    process.env.GMAIL_USER = 'gmail@example.com'
    process.env.GMAIL_PASS = 'pass'
    mocks.resendSend.mockResolvedValue({ error: { message: 'resend failed' } })
    mocks.createTransport.mockReturnValue({ sendMail: mocks.sendMail })
    mocks.sendMail.mockResolvedValue({ accepted: ['to@example.com'] })
    const { sendSystemEmail } = await import('@/lib/email')

    const result = await sendSystemEmail('to@example.com', 'Subject', '<b>Hello</b>', 'Hello')

    expect(result).toEqual({ sent: true, provider: 'gmail' })
    expect(mocks.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: { user: 'gmail@example.com', pass: 'pass' },
    })
    expect(mocks.sendMail).toHaveBeenCalledTimes(1)
  })

  it('should return gmail error when gmail send fails', async () => {
    process.env.GMAIL_USER = 'gmail@example.com'
    process.env.GMAIL_PASS = 'pass'
    mocks.createTransport.mockReturnValue({ sendMail: mocks.sendMail })
    mocks.sendMail.mockRejectedValue(new Error('smtp down'))
    const { sendSystemEmail } = await import('@/lib/email')

    const result = await sendSystemEmail('to@example.com', 'Subject', '<b>Hello</b>', 'Hello')

    expect(result).toEqual({ sent: false, provider: null, error: 'Gmail send failed' })
  })

  it('should return missing providers error when no credentials configured', async () => {
    const { sendSystemEmail } = await import('@/lib/email')

    const result = await sendSystemEmail('to@example.com', 'Subject', '<b>Hello</b>', 'Hello')

    expect(result).toEqual({
      sent: false,
      provider: null,
      error: 'Missing RESEND_API_KEY and GMAIL_USER/GMAIL_PASS',
    })
  })

  it('should escape subject in generated html payload', async () => {
    process.env.RESEND_API_KEY = 'resend-key'
    mocks.resendSend.mockResolvedValue({ error: null })
    const { sendSystemEmail } = await import('@/lib/email')

    await sendSystemEmail('to@example.com', '<Alert>', '<b>Hello</b>', 'Hello')

    const payload = mocks.resendSend.mock.calls[0]?.[0]
    expect(payload.html).toContain('&lt;Alert&gt;')
    expect(payload.html).not.toContain('<title><Alert></title>')
  })
})
