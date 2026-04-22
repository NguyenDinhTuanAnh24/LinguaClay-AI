'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type Option = {
  value: string
  label: string
}

type FlashcardFiltersProps = {
  searchText?: string
  selectedLang: string
  selectedLevel: string
  languageOptions: Option[]
  levelOptions: Option[]
}

export default function FlashcardFilters({
  searchText,
  selectedLang,
  selectedLevel,
  languageOptions,
  levelOptions,
}: FlashcardFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const clearHref = useMemo(() => {
    if (!searchText) return pathname
    return `${pathname}?q=${encodeURIComponent(searchText)}`
  }, [pathname, searchText])

  const updateFilter = (key: 'lang' | 'level', value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'all') params.delete(key)
    else params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="border-[3px] border-newsprint-black bg-white p-4 md:p-5">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 md:items-end">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-newsprint-gray-dark mb-2">Ngôn ngữ</label>
          <select
            value={selectedLang}
            onChange={(e) => updateFilter('lang', e.target.value)}
            className="h-11 w-full border-[2px] border-newsprint-black bg-[#F5F0E8] px-3 text-sm font-semibold"
          >
            {languageOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-newsprint-gray-dark mb-2">Trình độ</label>
          <select
            value={selectedLevel}
            onChange={(e) => updateFilter('level', e.target.value)}
            className="h-11 w-full border-[2px] border-newsprint-black bg-[#F5F0E8] px-3 text-sm font-semibold"
          >
            {levelOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:pb-0.5">
          <Link
            href={clearHref}
            className="h-11 px-5 border-[2px] border-newsprint-black bg-white text-newsprint-black text-xs font-black uppercase tracking-widest hover:bg-[#F5F0E8] transition-colors inline-flex items-center justify-center"
          >
            Xóa lọc
          </Link>
        </div>
      </div>
    </div>
  )
}
