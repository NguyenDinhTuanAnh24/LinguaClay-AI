import { describe, expect, it } from 'vitest'
import { CEFR_LABEL_VI, formatCefrLevel, isCefrLevel, normalizeCefrLevel } from '@/lib/levels'

describe('levels', () => {
  it('isCefrLevel should validate known CEFR levels case-insensitively', () => {
    expect(isCefrLevel('A1')).toBe(true)
    expect(isCefrLevel('b2')).toBe(true)
    expect(isCefrLevel('c2')).toBe(true)
    expect(isCefrLevel('C3')).toBe(false)
    expect(isCefrLevel('A0')).toBe(false)
    expect(isCefrLevel('')).toBe(false)
    expect(isCefrLevel(null)).toBe(false)
  })

  it('normalizeCefrLevel should normalize direct CEFR values', () => {
    expect(normalizeCefrLevel(' a2 ')).toBe('A2')
    expect(normalizeCefrLevel('c1')).toBe('C1')
  })

  it('normalizeCefrLevel should map legacy levels and fallback when unknown', () => {
    expect(normalizeCefrLevel('pre intermediate')).toBe('A2')
    expect(normalizeCefrLevel('UPPERINTERMEDIATE')).toBe('B2')
    expect(normalizeCefrLevel(' upper  intermediate ')).toBe('B2')
    expect(normalizeCefrLevel('advanced')).toBe('C1')
    expect(normalizeCefrLevel('unknown', 'B1')).toBe('B1')
    expect(normalizeCefrLevel(undefined)).toBe('A1')
    expect(normalizeCefrLevel('')).toBe('A1')
  })

  it('formatCefrLevel should optionally include vietnamese label', () => {
    expect(formatCefrLevel('beginner')).toBe('A1')
    expect(formatCefrLevel('A2', true)).toBe(`A2 • ${CEFR_LABEL_VI.A2}`)
    expect(formatCefrLevel('not-a-level', true)).toBe(`A1 • ${CEFR_LABEL_VI.A1}`)
  })
})
