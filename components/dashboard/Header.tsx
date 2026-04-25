'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, Bell } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { formatCefrLevel } from '@/lib/levels'

interface HeaderProps {
  user: {
    email?: string | null
    user_metadata?: {
      full_name?: string | null
      avatar_url?: string | null
    } | null
  } | null
  dbUser?: {
    name?: string | null
    image?: string | null
    proficiencyLevel?: string | null
  } | null
  wordsToday?: number
}

type NotificationItem = {
  id: string
  type: string
  title: string
  message: string
  createdAt: string
  readAt: string | null
}

function formatNotificationTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
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

export default function Header({ user, dbUser, wordsToday = 0 }: HeaderProps) {
  const tGreeting = useTranslations('greeting')
  const tDashboard = useTranslations('dashboard')
  const tNotifications = useTranslations('notifications')
  const tHeader = useTranslations('dashboardUi.header')
  const [greetingText, setGreetingText] = useState('')
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifPage, setNotifPage] = useState(1)
  const [notifTotalPages, setNotifTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const notifPanelRef = useRef<HTMLDivElement | null>(null)

  const resolveGreeting = () => {
    const hour = getVNHour()
    if (hour >= 5 && hour < 12) return tGreeting('morning')
    if (hour >= 12 && hour < 18) return tGreeting('afternoon')
    if (hour >= 18 && hour < 22) return tGreeting('evening')
    return tGreeting('night')
  }

  useEffect(() => {
    setGreetingText(resolveGreeting())
    const update = () => setGreetingText(resolveGreeting())
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000
    const t = setTimeout(() => {
      update()
      const iv = setInterval(update, 60_000)
      return () => clearInterval(iv)
    }, msToNextMinute)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!notifPanelRef.current) return
      if (notifPanelRef.current.contains(event.target as Node)) return
      setIsNotifOpen(false)
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const fetchNotifications = async (page: number, shouldMarkRead = false) => {
    setNotifLoading(true)
    try {
      const res = await fetch(`/api/notifications?page=${page}&pageSize=8`, { cache: 'no-store' })
      const data = (await res.json()) as {
        ok?: boolean
        items?: NotificationItem[]
        page?: number
        totalPages?: number
        unreadCount?: number
      }

      if (!res.ok || !data.ok) return
      setNotifications(data.items || [])
      setNotifPage(data.page || page)
      setNotifTotalPages(data.totalPages || 1)
      setUnreadCount(data.unreadCount || 0)

      if (shouldMarkRead && (data.unreadCount || 0) > 0) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mark_read_all' }),
        })
        setUnreadCount(0)
      }
    } catch {
      // no-op
    } finally {
      setNotifLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchNotifications(1)
    }, 0)
    const iv = setInterval(() => {
      void fetchNotifications(1)
    }, 60_000)
    return () => {
      clearTimeout(t)
      clearInterval(iv)
    }
  }, [])

  const displayName = dbUser?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || tHeader('student')
  const avatarUrl = dbUser?.image || user?.user_metadata?.avatar_url || null
  const nameParts = displayName.split(' ').filter(Boolean)
  const initials = nameParts.length >= 2 ? (nameParts[0][0] + nameParts[1][0]).toUpperCase() : displayName.slice(0, 2).toUpperCase()
  const levelLabel = formatCefrLevel(dbUser?.proficiencyLevel, true)

  return (
    <div className="flex items-center justify-between gap-4 w-full min-w-0">
      <div className="min-w-0 flex-auto">
        <h2 className="font-serif font-black text-[#141414] vietnamese-text text-[clamp(18px,2.5vw,24px)] leading-[1.2] whitespace-nowrap overflow-hidden text-ellipsis">
          {greetingText}, {displayName}!
        </h2>
        <p className={`vietnamese-text text-[11px] font-extrabold mt-1 uppercase tracking-[0.05em] ${wordsToday >= 10 ? 'text-[#dc2626]' : 'text-[#4B4B4B]'}`}>
          {wordsToday >= 10 ? tDashboard('goalComplete', { count: wordsToday }) : tDashboard('goalProgress', { current: wordsToday })}
        </p>
      </div>

      <div className="flex items-center gap-[10px] shrink-0">
        <div className="hidden md:block relative">
          <Search size={13} strokeWidth={1.75} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#4B4B4B] pointer-events-none" />
          <input
            type="text"
            placeholder={tHeader('searchPlaceholder')}
            className="h-[36px] w-[200px] pl-[30px] pr-3 border-2 border-[#141414] bg-white/70 text-[11px] text-[#141414] outline-none focus:border-[#141414] transition-colors"
          />
        </div>

        <div ref={notifPanelRef} className="relative">
          <button
            onClick={() => {
              const nextOpen = !isNotifOpen
              setIsNotifOpen(nextOpen)
              if (nextOpen) void fetchNotifications(1, true)
            }}
            className="w-[36px] h-[36px] border-2 border-[#141414] bg-white/70 flex items-center justify-center text-[#141414] cursor-pointer relative hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-0.5 transition-all outline-none"
          >
            <Bell size={14} strokeWidth={2.5} />
            {unreadCount > 0 ? (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B91C1C] border border-[#141414] text-white text-[9px] font-black leading-[16px] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </button>

          {isNotifOpen ? (
            <div className="absolute right-0 top-[44px] z-50 w-[360px] max-w-[88vw] border-[3px] border-[#141414] bg-[#F5F0E8] shadow-[10px_10px_0px_0px_rgba(20,20,20,1)]">
              <div className="flex items-center justify-between border-b-[2px] border-[#141414] px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#141414]">{tNotifications('title')}</p>
                <button
                  onClick={() => void fetchNotifications(notifPage)}
                  className="border border-[#141414] bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] hover:bg-[#141414] hover:text-white"
                >
                  {tNotifications('refresh')}
                </button>
              </div>

              <div className="max-h-[320px] overflow-y-auto p-2 space-y-2">
                {notifLoading ? <p className="px-2 py-3 text-xs font-semibold text-[#4B4B4B]">{tNotifications('loading')}</p> : null}
                {!notifLoading && notifications.length === 0 ? <p className="px-2 py-3 text-xs font-semibold text-[#4B4B4B]">{tNotifications('empty')}</p> : null}
                {notifications.map((item) => (
                  <div key={item.id} className="border border-[#141414] bg-white p-2">
                    <p className="text-[11px] font-black text-[#141414]">{item.title}</p>
                    <p className="mt-1 text-[11px] text-[#333]">{item.message}</p>
                    <p className="mt-1 text-[10px] font-semibold text-[#4B4B4B]">{formatNotificationTime(item.createdAt)}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t-[2px] border-[#141414] px-3 py-2">
                <button
                  disabled={notifPage <= 1 || notifLoading}
                  onClick={() => void fetchNotifications(notifPage - 1)}
                  className="border border-[#141414] bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#141414] hover:text-white"
                >
                  {tNotifications('prev')}
                </button>
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#141414]">{tNotifications('page', { current: notifPage, total: notifTotalPages })}</span>
                <button
                  disabled={notifPage >= notifTotalPages || notifLoading}
                  onClick={() => void fetchNotifications(notifPage + 1)}
                  className="border border-[#141414] bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#141414] hover:text-white"
                >
                  {tNotifications('next')}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <Link
          href="/dashboard/settings"
          className="flex items-center border-2 border-[#141414] bg-white/70 no-underline w-9 h-9 sm:w-auto sm:h-auto justify-center sm:justify-start gap-0 sm:gap-2 sm:pr-3 hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-0.5 transition-all"
        >
          <div className="w-[36px] h-[36px] bg-[#141414] flex items-center justify-center shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[11px] font-black text-white tracking-[0.05em]">{initials}</span>
            )}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="vietnamese-text text-[11px] font-extrabold text-[#141414] leading-none">{displayName}</span>
            <span className="text-[9px] text-[#4B4B4B] font-extrabold tracking-[0.15em] uppercase mt-[2px]">{levelLabel}</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
