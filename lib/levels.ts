export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

export type CefrLevel = (typeof CEFR_LEVELS)[number]

const LEGACY_TO_CEFR: Record<string, CefrLevel> = {
  BEGINNER: 'A1',
  ELEMENTARY: 'A1',
  PRE_INTERMEDIATE: 'A2',
  PREINTERMEDIATE: 'A2',
  INTERMEDIATE: 'B1',
  UPPER_INTERMEDIATE: 'B2',
  UPPERINTERMEDIATE: 'B2',
  ADVANCED: 'C1',
}

export const CEFR_LABEL_VI: Record<CefrLevel, string> = {
  A1: 'Sơ cấp 1',
  A2: 'Sơ cấp 2',
  B1: 'Trung cấp 1',
  B2: 'Trung cấp 2',
  C1: 'Nâng cao 1',
  C2: 'Nâng cao 2',
}

export function isCefrLevel(value: string | null | undefined): value is CefrLevel {
  if (!value) return false
  return CEFR_LEVELS.includes(value.toUpperCase() as CefrLevel)
}

export function normalizeCefrLevel(value: string | null | undefined, fallback: CefrLevel = 'A1'): CefrLevel {
  if (!value) return fallback
  const key = value.trim().toUpperCase().replace(/\s+/g, '_')
  if (isCefrLevel(key)) return key
  return LEGACY_TO_CEFR[key] || fallback
}

export function formatCefrLevel(value: string | null | undefined, withVietnamese = false): string {
  const level = normalizeCefrLevel(value)
  if (!withVietnamese) return level
  return `${level} • ${CEFR_LABEL_VI[level]}`
}

