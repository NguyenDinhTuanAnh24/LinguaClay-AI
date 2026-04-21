'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { Search, Loader2 } from 'lucide-react'

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
        placeholder="TÌM CHỦ ĐỀ HỌC TẬP..."
        className={`w-full h-14 pl-14 pr-6 bg-white border-[3px] border-newsprint-black shadow-brutalist-soft outline-none font-sans font-black text-xs uppercase tracking-widest placeholder:text-newsprint-gray transition-all ${
          isPending ? 'opacity-70 grayscale-[0.5]' : 'focus:bg-newsprint-paper'
        }`}
      />
      <div className="absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:rotate-3 transition-transform">
        {isPending ? (
          <Loader2 className="animate-spin text-newsprint-black" size={20} />
        ) : (
          <Search className="text-newsprint-black" size={20} strokeWidth={3} />
        )}
      </div>
    </div>
  )
}
