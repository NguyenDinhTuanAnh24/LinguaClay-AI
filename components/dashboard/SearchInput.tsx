'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'

export default function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="relative w-full md:w-96 group">
      <input 
        type="text" 
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Tìm chủ đề học tập..."
        className={`w-full h-14 pl-14 pr-6 bg-white/80 rounded-[25px] shadow-clay-button border-4 border-transparent outline-none font-heading font-black text-clay-deep placeholder:text-clay-muted/50 transition-all ${
          isPending ? 'opacity-70 grayscale-[0.5]' : 'focus:border-clay-blue/30'
        }`}
      />
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl group-focus-within:scale-110 transition-transform">
        {isPending ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-clay-blue border-t-transparent" />
        ) : (
          '🔍'
        )}
      </div>
    </div>
  )
}
