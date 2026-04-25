import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { defaultLocale, locales, type Locale } from '@/i18n.config'
import enMessages from '@/messages/en.json'
import viMessages from '@/messages/vi.json'

function resolveLocale(value?: string): Locale {
  if (value && (locales as readonly string[]).includes(value)) {
    return value as Locale
  }
  return defaultLocale
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const locale = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value)

  return {
    locale,
    messages: locale === 'en' ? enMessages : viMessages,
  }
})
