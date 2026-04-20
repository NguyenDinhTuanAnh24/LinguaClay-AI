'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface HeaderProps {
  user: any
  dbUser?: {
    name?: string | null
    image?: string | null
    proficiencyLevel?: string | null
  } | null
}

/** Lấy giờ hiện tại theo múi giờ GMT+7 (Việt Nam) */
function getVNHour(): number {
  return parseInt(
    new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: 'numeric',
      hour12: false,
    }),
    10
  )
}

function getGreeting(hour: number): { text: string; emoji: string } {
  if (hour >= 5 && hour < 12)  return { text: 'Chào buổi sáng', emoji: '☀️' }
  if (hour >= 12 && hour < 18) return { text: 'Chào buổi chiều', emoji: '🌤️' }
  if (hour >= 18 && hour < 22) return { text: 'Chào buổi tối',   emoji: '🌙' }
  return { text: 'Chào đêm khuya', emoji: '🌟' }
}

export default function Header({ user, dbUser }: HeaderProps) {
  const [greeting, setGreeting] = useState(() => getGreeting(getVNHour()))

  // Cập nhật lời chào theo thời gian thực GMT+7, kiểm tra mỗi phút
  useEffect(() => {
    const update = () => setGreeting(getGreeting(getVNHour()))

    // Tính thời gian đến đầu phút tiếp theo để đồng bộ chính xác
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000
    const initialTimeout = setTimeout(() => {
      update()
      const interval = setInterval(update, 60_000)
      return () => clearInterval(interval)
    }, msToNextMinute)

    return () => clearTimeout(initialTimeout)
  }, [])

  // Ưu tiên: Prisma name → Supabase metadata → email prefix
  const displayName = dbUser?.name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Người bạn'

  // Ưu tiên avatar từ Prisma (Supabase Storage) → Supabase metadata
  const avatarUrl = dbUser?.image || user?.user_metadata?.avatar_url || null

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-warm-white/60 backdrop-blur-md rounded-[35px] shadow-clay-card p-4 md:p-6 border-2 border-white">
      {/* Personalized Greeting */}
      <div className="flex items-center gap-4 px-2">
        <div className="flex flex-col">
          <h2 className="text-xl md:text-2xl font-heading font-black text-clay-deep leading-tight">
            {greeting.text}, <span className="text-clay-blue">{displayName}!</span>{' '}
            <span className="inline-block">{greeting.emoji}</span>
          </h2>
          <p className="text-xs text-clay-muted font-medium">Hôm nay hãy cùng chinh phục thêm 10 từ mới nhé.</p>
        </div>
      </div>

      {/* Recessed Search Bar */}
      <div className="flex-1 max-w-md w-full relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-clay-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm bài học, từ vựng..."
          className="w-full h-12 pl-12 pr-6 bg-soft-gray/30 rounded-[22px] shadow-clay-inset border-2 border-transparent focus:border-clay-blue/30 focus:outline-none transition-all duration-300 text-sm font-body"
        />
      </div>

      {/* User Avatar & Identity - Link to Settings */}
      <Link
        href="/dashboard/settings"
        className="flex items-center gap-3 bg-white px-2 py-1.5 rounded-[22px] shadow-clay-button border border-soft-gray/20 hover:shadow-clay-button-hover transition-all"
      >
        <div className="flex-col text-right hidden lg:flex mr-1">
          <span className="text-xs font-heading font-black text-clay-deep truncate max-w-[100px]">{displayName}</span>
          <span className="text-[10px] text-clay-green font-bold">
            {dbUser?.proficiencyLevel ? (
              dbUser.proficiencyLevel === 'Beginner' ? '🌱 Mới bắt đầu' :
              dbUser.proficiencyLevel === 'Elementary' ? '📗 Sơ cấp' :
              dbUser.proficiencyLevel === 'Intermediate' ? '📘 Trung cấp' :
              dbUser.proficiencyLevel === 'Advanced' ? '🎓 Nâng cao' :
              dbUser.proficiencyLevel
            ) : '🌱 Mới bắt đầu'}
          </span>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-clay-blue to-clay-green rounded-full shadow-clay-button border-2 border-white flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold text-sm">{displayName.charAt(0).toUpperCase()}</span>
          )}
        </div>
      </Link>
    </div>
  )
}

