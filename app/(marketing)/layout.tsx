import React from 'react'
import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-clay-cream selection:bg-clay-blue/30 selection:text-clay-deep">
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </div>
  )
}
