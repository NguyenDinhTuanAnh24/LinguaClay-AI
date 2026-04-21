'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Bell, Target } from 'lucide-react'

interface HeaderProps {
  user: any
  dbUser?: {
    name?: string | null
    image?: string | null
    proficiencyLevel?: string | null
  } | null
}

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

  useEffect(() => {
    const update = () => setGreeting(getGreeting(getVNHour()))
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000
    const initialTimeout = setTimeout(() => {
      update()
      const interval = setInterval(update, 60_000)
      return () => clearInterval(interval)
    }, msToNextMinute)
    return () => clearTimeout(initialTimeout)
  }, [])

  const displayName = dbUser?.name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Học viên'

  const avatarUrl = dbUser?.image || user?.user_metadata?.avatar_url || null

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 px-2">
      {/* Personalized Greeting */}
      <div className="flex flex-col gap-1 w-full lg:w-auto">
        <h2 className="text-2xl md:text-3xl font-heading font-black text-clay-deep leading-tight">
          {greeting.text}, <span className="text-clay-orange">{displayName}</span>!{' '}
          <span className="inline-block animate-bounce">{greeting.emoji}</span>
        </h2>
        <div className="flex items-center gap-2">
           <Target size={14} className="text-clay-muted" />
           <p className="text-sm font-bold text-clay-muted">
              Mục tiêu hôm nay: <span className="font-black text-clay-blue">10</span> từ mới.
           </p>
        </div>
      </div>

      {/* Recessed Search Bar */}
      <div className="flex-1 max-w-lg w-full relative group order-last lg:order-none">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-clay-muted group-focus-within:text-clay-blue transition-colors">
          <Search size={18} strokeWidth={2.5} />
        </div>
        <input
          type="text"
          placeholder="Tìm bài học, từ vựng..."
          className="w-full h-12 pl-12 pr-6 bg-[#F5F0E8]/50 rounded-[20px] focus:bg-white focus:outline-none focus:shadow-clay-inset transition-all text-sm font-bold placeholder:text-clay-muted/50 border-2 border-transparent focus:border-white text-clay-deep shadow-clay-inset"
        />
      </div>

      {/* User Actions & Profile */}
      <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
        <button className="p-3 bg-white/70 backdrop-blur-md rounded-full shadow-clay-button hover:shadow-clay-button-hover active:scale-95 transition-all text-clay-muted hover:text-clay-blue">
          <Bell size={20} strokeWidth={2.5} />
        </button>

        <Link
          href="/dashboard/settings"
          className="flex items-center gap-4 bg-white/70 backdrop-blur-md p-1 pr-4 rounded-full shadow-clay-button hover:shadow-clay-button-hover active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-clay-cream/50 flex items-center justify-center overflow-hidden shadow-clay-inset">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-clay-orange font-heading font-black text-lg">{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex flex-col text-left hidden sm:flex">
            <span className="text-sm font-black text-clay-deep group-hover:text-clay-blue transition-colors">
              {displayName}
            </span>
            <span className="text-[10px] font-bold text-clay-muted uppercase tracking-wider">
              {dbUser?.proficiencyLevel ? (
                dbUser.proficiencyLevel === 'Beginner' ? 'STARTING UP' :
                dbUser.proficiencyLevel === 'Advanced' ? 'ADVANCED' :
                dbUser.proficiencyLevel.toUpperCase()
              ) : 'NEWBIE'}
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}


