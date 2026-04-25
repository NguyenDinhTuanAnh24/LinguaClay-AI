/**
 * Utility: Normalize Vietnamese text to NFC (precomposed) to fix diacritic rendering
 *
 * Vietnamese text can be stored in two Unicode forms:
 * - NFC (precomposed): 'ế' as single character U+1EBF
 * - NFD (decomposed): 'ế' as 'e' + '̂' + '́' (3 characters)
 *
 * React/Next.js may render NFD incorrectly on some systems. Normalizing to NFC
 * ensures consistent rendering across all platforms and browsers.
 *
 * Usage: import { normalizeVietnamese } from '@/app/lib/utils/normalize'
 */

export function normalizeVietnamese(text: string): string {
  if (typeof text !== 'string') {
    return text
  }

  try {
    // Normalize to NFC (Canonical Decomposition, followed by Canonical Composition)
    return text.normalize('NFC')
  } catch (error) {
    console.warn('Vietnamese normalization failed:', error)
    return text
  }
}

/**
 * Normalize an array of strings
 */
export function normalizeStringArray(items: string[]): string[] {
  return items.map(normalizeVietnamese)
}

/**
 * Normalize object values that contain Vietnamese text
 */
export function normalizeObject<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[]
): T {
  const normalized = { ...obj }
  keys.forEach((key) => {
    const value = normalized[key]
    if (typeof value === 'string') {
      normalized[key] = normalizeVietnamese(value) as T[keyof T]
    }
  })
  return normalized
}
