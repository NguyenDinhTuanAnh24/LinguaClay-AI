import React from 'react'
import MarketingHeader from '@/components/marketing/MarketingHeader'
import MarketingFooter from '@/components/marketing/MarketingFooter'

import { AuthProvider } from '@/providers/AuthProvider'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex-1 bg-[#F5F0E8] flex flex-col">
        <MarketingHeader />
        <main className="w-full overflow-x-hidden shrink-0">
          {children}
        </main>
        <MarketingFooter />
      </div>
    </AuthProvider>
  )
}
