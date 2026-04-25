/**
 * next-intl locale configuration for LinguaClay.
 *
 * Supported locales: Vietnamese (vi) — default, English (en).
 */

export const locales = ['vi', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'vi'
