import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const child = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(),
  }

  const base = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => child),
  }

  const pinoFn = vi.fn(() => base)
  return { pinoFn, base, child }
})

vi.mock('pino', () => ({
  default: mocks.pinoFn,
}))

vi.unmock('@/lib/logger')

describe('logger', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('should initialize pino with pretty transport in non-production', async () => {
    process.env.NODE_ENV = 'development'
    await import('@/lib/logger')

    const config = mocks.pinoFn.mock.calls[0]?.[0]
    expect(config.level).toBe('debug')
    expect(config.transport?.target).toBe('pino-pretty')
    expect(config.redact).toBeDefined()
  })

  it('should initialize pino without transport in production', async () => {
    process.env.NODE_ENV = 'production'
    await import('@/lib/logger')

    const config = mocks.pinoFn.mock.calls[0]?.[0]
    expect(config.level).toBe('info')
    expect(config.transport).toBeUndefined()
  })

  it('info/warn/debug should log with base logger when reqId is absent', async () => {
    process.env.NODE_ENV = 'test'
    const { logger } = await import('@/lib/logger')

    logger.info('event.info', { a: 1 })
    logger.warn('event.warn')
    logger.debug('event.debug', { b: 2 })

    expect(mocks.base.info).toHaveBeenCalledWith({ a: 1 }, 'event.info')
    expect(mocks.base.warn).toHaveBeenCalledWith({}, 'event.warn')
    expect(mocks.base.debug).toHaveBeenCalledWith({ b: 2 }, 'event.debug')
  })

  it('should use child logger when reqId is provided', async () => {
    process.env.NODE_ENV = 'test'
    const { logger } = await import('@/lib/logger')

    logger.info('event.info', { ok: true }, 'req-1')

    expect(mocks.base.child).toHaveBeenCalledWith({ requestId: 'req-1' })
    expect(mocks.child.info).toHaveBeenCalledWith({ ok: true }, 'event.info')
  })

  it('error should serialize Error object details', async () => {
    process.env.NODE_ENV = 'test'
    const { logger } = await import('@/lib/logger')
    const err = new Error('boom')
    err.name = 'CustomError'

    logger.error('event.error', err)

    expect(mocks.base.error).toHaveBeenCalledWith(
      {
        err: expect.objectContaining({
          message: 'boom',
          name: 'CustomError',
          stack: expect.any(String),
        }),
      },
      'event.error'
    )
  })

  it('error should wrap non-Error payloads', async () => {
    process.env.NODE_ENV = 'test'
    const { logger } = await import('@/lib/logger')

    logger.error('event.error', { code: 'E1' }, 'req-2')

    expect(mocks.base.child).toHaveBeenCalledWith({ requestId: 'req-2' })
    expect(mocks.child.error).toHaveBeenCalledWith({ err: { code: 'E1' } }, 'event.error')
  })

  it('withRequest should return bound logger methods', async () => {
    process.env.NODE_ENV = 'test'
    const { logger } = await import('@/lib/logger')
    const reqLogger = logger.withRequest('req-bound')

    reqLogger.info('bound.info', { x: 1 })
    reqLogger.warn('bound.warn')
    reqLogger.debug('bound.debug')
    reqLogger.error('bound.error', new Error('bad'))

    expect(mocks.base.child).toHaveBeenCalledWith({ requestId: 'req-bound' })
    expect(mocks.child.info).toHaveBeenCalledWith({ x: 1 }, 'bound.info')
    expect(mocks.child.warn).toHaveBeenCalledWith({}, 'bound.warn')
    expect(mocks.child.debug).toHaveBeenCalledWith({}, 'bound.debug')
    expect(mocks.child.error).toHaveBeenCalledWith(
      { err: expect.objectContaining({ message: 'bad', stack: expect.any(String) }) },
      'bound.error'
    )
  })
})
