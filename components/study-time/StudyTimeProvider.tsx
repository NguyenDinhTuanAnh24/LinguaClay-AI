'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

type StudyTimeContextValue = {
  activeSeconds: number
  goalSeconds: number
  progressPct: number
  isLive: boolean
  refresh: () => Promise<void>
}

const DEFAULT_GOAL_SECONDS = 3 * 60 * 60
const INTERACTION_TIMEOUT_MS = 60_000
const HEARTBEAT_INTERVAL_MS = 10_000

const StudyTimeContext = createContext<StudyTimeContextValue | null>(null)

function clamp(num: number, min: number, max: number) {
  return Math.min(max, Math.max(min, num))
}

function getVNDayKey(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function StudyTimeProvider({ children }: { children: React.ReactNode }) {
  const [activeSeconds, setActiveSeconds] = useState(0)
  const [goalSeconds, setGoalSeconds] = useState(DEFAULT_GOAL_SECONDS)
  const [isLive, setIsLive] = useState(false)
  const [dayKey, setDayKey] = useState(() => getVNDayKey())

  const lastInteractionAtRef = useRef(0)
  const unsentSecondsRef = useRef(0)

  const isActivelyStudying = useCallback(() => {
    if (typeof document === 'undefined') return false
    const visible = document.visibilityState === 'visible'
    const focused = document.hasFocus()
    const recentlyInteracted = Date.now() - lastInteractionAtRef.current < INTERACTION_TIMEOUT_MS
    return visible && focused && recentlyInteracted
  }, [])

  const refresh = useCallback(async () => {
    const res = await fetch('/api/study-time/today', { cache: 'no-store' })
    const data = await res.json()
    if (!res.ok) return
    setActiveSeconds(typeof data.activeSeconds === 'number' ? data.activeSeconds : 0)
    setGoalSeconds(typeof data.goalSeconds === 'number' ? data.goalSeconds : DEFAULT_GOAL_SECONDS)
  }, [])

  const sendHeartbeatChunk = useCallback(async (delta: number, keepalive = false) => {
    const res = await fetch('/api/study-time/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      cache: 'no-store',
      keepalive,
      body: JSON.stringify({ activeSeconds: delta }),
    })
    if (!res.ok) return false
    const data = await res.json()
    if (typeof data.activeSeconds === 'number') {
      setActiveSeconds(data.activeSeconds)
    }
    if (typeof data.goalSeconds === 'number') {
      setGoalSeconds(data.goalSeconds)
    }
    return true
  }, [])

  const flushPending = useCallback(
    async (keepalive = false) => {
      let pending = Math.floor(unsentSecondsRef.current)
      if (pending <= 0) return true
      unsentSecondsRef.current = 0

      while (pending > 0) {
        const chunk = clamp(pending, 1, 30)
        const isLastChunk = pending <= 30
        const ok = await sendHeartbeatChunk(chunk, keepalive && isLastChunk)
        if (!ok) {
          unsentSecondsRef.current += pending
          return false
        }
        pending -= chunk
      }
      return true
    },
    [sendHeartbeatChunk]
  )

  const sendHeartbeat = useCallback(async () => {
    if (unsentSecondsRef.current <= 0) return
    await flushPending(false)
  }, [flushPending])

  useEffect(() => {
    const markInteraction = () => {
      lastInteractionAtRef.current = Date.now()
    }

    window.addEventListener('mousemove', markInteraction, { passive: true })
    window.addEventListener('keydown', markInteraction, { passive: true })
    window.addEventListener('pointerdown', markInteraction, { passive: true })
    window.addEventListener('scroll', markInteraction, { passive: true })
    window.addEventListener('touchstart', markInteraction, { passive: true })
    window.addEventListener('focus', markInteraction, { passive: true })

    return () => {
      window.removeEventListener('mousemove', markInteraction)
      window.removeEventListener('keydown', markInteraction)
      window.removeEventListener('pointerdown', markInteraction)
      window.removeEventListener('scroll', markInteraction)
      window.removeEventListener('touchstart', markInteraction)
      window.removeEventListener('focus', markInteraction)
    }
  }, [])

  useEffect(() => {
    const now = Date.now()
    lastInteractionAtRef.current = now
    const timer = setTimeout(() => {
      void refresh()
    }, 0)
    return () => clearTimeout(timer)
  }, [refresh])

  useEffect(() => {
    const tick = window.setInterval(() => {
      const currentDayKey = getVNDayKey()
      if (currentDayKey !== dayKey) {
        setDayKey(currentDayKey)
        setActiveSeconds(0)
        setIsLive(false)
        unsentSecondsRef.current = 0
        void refresh()
        return
      }

      const active = isActivelyStudying()
      setIsLive(active)
      if (active) {
        setActiveSeconds((prev) => prev + 1)
        unsentSecondsRef.current += 1
      }
    }, 1000)
    return () => window.clearInterval(tick)
  }, [dayKey, isActivelyStudying, refresh])

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!isActivelyStudying() && unsentSecondsRef.current <= 0) return
      void sendHeartbeat()
    }, HEARTBEAT_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [isActivelyStudying, sendHeartbeat])

  useEffect(() => {
    const flushIfLeaving = () => {
      setIsLive(false)
      void flushPending(true)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushIfLeaving()
      }
    }

    window.addEventListener('blur', flushIfLeaving, { passive: true })
    window.addEventListener('pagehide', flushIfLeaving, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('blur', flushIfLeaving)
      window.removeEventListener('pagehide', flushIfLeaving)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void flushPending(true)
    }
  }, [flushPending])

  useEffect(() => {
    const id = window.setInterval(() => {
      void refresh()
    }, 60_000)
    return () => window.clearInterval(id)
  }, [refresh])

  const progressPct = useMemo(() => {
    if (goalSeconds <= 0) return 0
    return clamp(Math.round((activeSeconds / goalSeconds) * 100), 0, 100)
  }, [activeSeconds, goalSeconds])

  const value = useMemo(
    () => ({
      activeSeconds,
      goalSeconds,
      progressPct,
      isLive,
      refresh,
    }),
    [activeSeconds, goalSeconds, progressPct, isLive, refresh]
  )

  return <StudyTimeContext.Provider value={value}>{children}</StudyTimeContext.Provider>
}

export function useStudyTime() {
  const ctx = useContext(StudyTimeContext)
  if (!ctx) {
    throw new Error('useStudyTime must be used inside StudyTimeProvider')
  }
  return ctx
}

export function formatHhMmSs(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
