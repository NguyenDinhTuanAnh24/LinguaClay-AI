'use client'

import { useEffect, useState } from 'react'

export default function BackgroundBlobs() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const blobs = [
    { color: 'bg-clay-blue/8', size: 600, top: 10, left: 15, delay: 0 },
    { color: 'bg-clay-green/8', size: 500, top: 60, left: 70, delay: 2 },
    { color: 'bg-clay-pink/8', size: 450, top: 30, left: 40, delay: 4 },
    { color: 'bg-clay-orange/8', size: 550, top: 75, left: 20, delay: 6 },
  ]

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {blobs.map((blob, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-3xl ${blob.color} animate-blob`}
          style={{
            width: `${blob.size}px`,
            height: `${blob.size}px`,
            top: `${blob.top}%`,
            left: `${blob.left}%`,
            animationDuration: `${15 + i * 3}s`,
            animationDelay: `${blob.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
