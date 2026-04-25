'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import MobileNav from '@/components/dashboard/MobileNav'
import { StudyTimeProvider } from '@/components/study-time/StudyTimeProvider'

type DashboardShellProps = {
  user: any
  dbUser: any
  wordsToday?: number
  children: React.ReactNode
}

export default function DashboardShell({ user, dbUser, wordsToday = 0, children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <StudyTimeProvider>
      <div className="flex w-screen h-screen bg-[#F5F0E8] overflow-hidden">
      <aside className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 h-screen overflow-y-auto ${collapsed ? 'w-[92px]' : 'w-[260px]'}`}>
        <Sidebar
          user={user}
          dbUser={dbUser}
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <header className="shrink-0 bg-[#F5F0E8] border-b border-[#D6CFC4] z-30">
          <div className="max-w-[1600px] w-full mx-auto px-10 py-4">
            <Header user={user} dbUser={dbUser} wordsToday={wordsToday} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-[1600px] w-full mx-auto px-10 pt-10 pb-[60px]">
            {children}
          </div>
        </main>
      </div>

      <div className="lg:hidden">
        <MobileNav />
      </div>
      </div>
    </StudyTimeProvider>
  )
}
