'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import MobileNav from '@/components/dashboard/MobileNav'

type DashboardShellProps = {
  user: any
  dbUser: any
  wordsToday?: number
  children: React.ReactNode
}

export default function DashboardShell({ user, dbUser, wordsToday = 0, children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        background: '#F5F0E8',
        overflow: 'hidden',
      }}
    >
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 transition-[width] duration-300"
        style={{ width: collapsed ? 92 : 260, height: '100vh', overflowY: 'auto' }}
      >
        <Sidebar
          user={user}
          dbUser={dbUser}
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />
      </aside>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            flexShrink: 0,
            background: '#F5F0E8',
            borderBottom: '1px solid #D6CFC4',
            zIndex: 30,
          }}
        >
          <div style={{ maxWidth: 1600, width: '100%', margin: '0 auto', padding: '16px 40px' }}>
            <Header user={user} dbUser={dbUser} wordsToday={wordsToday} />
          </div>
        </header>

        <main
          style={{
            flex: 1,
            overflowY: 'auto',
          }}
          className="scrollbar-hide"
        >
          <div
            style={{
              maxWidth: 1600,
              width: '100%',
              margin: '0 auto',
              padding: '40px 40px 60px',
            }}
          >
            {children}
          </div>
        </main>
      </div>

      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}
