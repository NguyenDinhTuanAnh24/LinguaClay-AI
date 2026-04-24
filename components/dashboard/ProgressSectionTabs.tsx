'use client'

import { useEffect, useState } from 'react'

const TAB_ITEMS = [
  { id: 'overview-section', label: 'Tổng quan' },
  { id: 'srs-details', label: 'Chi tiết SRS' },
]

export default function ProgressSectionTabs() {
  const [activeId, setActiveId] = useState<string>('overview-section')

  useEffect(() => {
    const updateFromHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'overview-section' || hash === 'srs-details') {
        setActiveId(hash)
      }
    }

    updateFromHash()
    window.addEventListener('hashchange', updateFromHash)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        threshold: 0.35,
        rootMargin: '-120px 0px -45% 0px',
      }
    )

    TAB_ITEMS.forEach((tab) => {
      const el = document.getElementById(tab.id)
      if (el) observer.observe(el)
    })

    return () => {
      window.removeEventListener('hashchange', updateFromHash)
      observer.disconnect()
    }
  }, [])

  return (
    <nav className="border-b border-[#141414]/20">
      <div className="flex items-center gap-8">
        {TAB_ITEMS.map((tab) => {
          const isActive = activeId === tab.id
          return (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className={`pb-3 text-[11px] font-black uppercase tracking-[0.14em] border-b-2 transition-colors ${
                isActive
                  ? 'border-red-600 text-[#141414]'
                  : 'border-transparent text-[#4B4B4B] hover:text-[#141414]'
              }`}
            >
              {tab.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}
