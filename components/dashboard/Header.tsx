'use client'

import React, { useState, useEffect } from 'react'
import { Search, Bell } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  user: any
  dbUser?: {
    name?: string | null
    image?: string | null
    proficiencyLevel?: string | null
  } | null
  wordsToday?: number
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

function getGreeting(hour: number): { text: string } {
  if (hour >= 5 && hour < 12)  return { text: 'Chào buổi sáng' }
  if (hour >= 12 && hour < 18) return { text: 'Chào buổi chiều' }
  if (hour >= 18 && hour < 22) return { text: 'Chào buổi tối' }
  return { text: 'Chào đêm khuya' }
}

export default function Header({ user, dbUser, wordsToday = 0 }: HeaderProps) {
  const [greeting, setGreeting] = useState(() => getGreeting(getVNHour()))

  useEffect(() => {
    const update = () => setGreeting(getGreeting(getVNHour()))
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000
    const t = setTimeout(() => {
      update()
      const iv = setInterval(update, 60_000)
      return () => clearInterval(iv)
    }, msToNextMinute)
    return () => clearTimeout(t)
  }, [])

  const displayName = dbUser?.name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Học viên'

  const avatarUrl = dbUser?.image || user?.user_metadata?.avatar_url || null

  const nameParts = displayName.split(' ').filter(Boolean)
  const initials = nameParts.length >= 2
    ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
    : displayName.slice(0, 2).toUpperCase()

  const levelLabel = dbUser?.proficiencyLevel
    ? dbUser.proficiencyLevel.toUpperCase()
    : 'ELEMENTARY'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        width: '100%',
        minWidth: 0,
      }}
    >
      {/* ── Left: Greeting ── */}
      <div style={{ minWidth: 0, flex: '1 1 auto' }}>
        <h2
          className="font-serif font-black text-[#141414] vietnamese-text"
          style={{
            fontSize: 'clamp(18px, 2.5vw, 24px)',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {greeting.text}, {displayName}!
        </h2>
        <p 
          className="vietnamese-text"
          style={{ 
            fontSize: 11, 
            color: wordsToday >= 10 ? '#dc2626' : '#4B4B4B', 
            fontWeight: 800, 
            marginTop: 4, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em' 
          }}
        >
          {wordsToday >= 10 
            ? `★ Mục tiêu đã hoàn thành (${wordsToday} từ)!` 
            : `Mục tiêu hôm nay: ${wordsToday}/10 từ mới.`}
        </p>
      </div>

      {/* ── Right: Search + Bell + User ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

        {/* Search */}
        <div style={{ position: 'relative' }} className="hidden md:block">
          <Search
            size={13}
            strokeWidth={1.75}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#4B4B4B',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Tìm bài học, từ vựng..."
            style={{
              height: 36,
              width: 200,
              paddingLeft: 30,
              paddingRight: 12,
              border: '2px solid #141414',
              background: 'rgba(255,255,255,0.7)',
              fontSize: 11,
              color: '#141414',
              outline: 'none',
            }}
            className="focus:border-[#141414] transition-colors"
          />
        </div>

        {/* Bell */}
        <button
          style={{
            width: 36,
            height: 36,
            border: '2px solid #141414',
            background: 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#141414',
            cursor: 'pointer',
          }}
          className="hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-0.5 transition-all outline-none"
        >
          <Bell size={14} strokeWidth={2.5} />
        </button>

        {/* User chip */}
        <Link
          href="/dashboard/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '2px solid #141414',
            background: 'rgba(255,255,255,0.7)',
            textDecoration: 'none',
          }}
          className="w-9 h-9 sm:w-auto sm:h-auto justify-center sm:justify-start gap-0 sm:gap-2 sm:pr-3 hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-0.5 transition-all"
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: '#141414',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>
                {initials}
              </span>
            )}
          </div>
          <div className="hidden sm:flex flex-col">
            <span
              className="vietnamese-text"
              style={{ fontSize: 11, fontWeight: 800, color: '#141414', lineHeight: 1 }}
            >
              {displayName}
            </span>
            <span style={{ fontSize: 9, color: '#4B4B4B', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>
              {levelLabel}
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}
