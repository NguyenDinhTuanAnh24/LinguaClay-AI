import { describe, expect, it } from 'vitest'
import { parseCsvText, slugify } from '@/lib/csv'

describe('csv utils', () => {
  it('parseCsvText should return empty array for less than two lines', () => {
    expect(parseCsvText('header-only')).toEqual([])
    expect(parseCsvText('')).toEqual([])
  })

  it('parseCsvText should parse simple csv rows and normalize headers', () => {
    const csv = ' Term , Definition \n Hello , Xin chao \n World , The gioi '
    const rows = parseCsvText(csv)

    expect(rows).toEqual([
      { term: 'Hello', definition: 'Xin chao' },
      { term: 'World', definition: 'The gioi' },
    ])
  })

  it('parseCsvText should handle quoted commas and escaped quotes', () => {
    const csv = 'term,example\n"check-in","At the ""check-in"" desk, please."\n'
    const rows = parseCsvText(csv)

    expect(rows).toEqual([
      {
        term: 'check-in',
        example: 'At the "check-in" desk, please.',
      },
    ])
  })

  it('parseCsvText should skip blank rows and pad missing values', () => {
    const csv = 'term,definition,example\n,\nhello,xin chao\nworld,the gioi,example text\n'
    const rows = parseCsvText(csv)

    expect(rows).toEqual([
      { term: 'hello', definition: 'xin chao', example: '' },
      { term: 'world', definition: 'the gioi', example: 'example text' },
    ])
  })

  it('slugify should normalize text to url-safe slug', () => {
    expect(slugify('  Hoc Tieng Anh Co Ban  ')).toBe('hoc-tieng-anh-co-ban')
    expect(slugify('A/B Test!!! 2026')).toBe('ab-test-2026')
    expect(slugify('one---two    three')).toBe('one-two-three')
  })
})
