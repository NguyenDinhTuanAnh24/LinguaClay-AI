'use client'

import React, { createContext, useContext, useState } from 'react'

type AuthTab = 'signin' | 'signup'

interface AuthContextType {
  isAuthOpen: boolean
  authTab: AuthTab
  openAuth: (tab?: AuthTab) => void
  closeAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<AuthTab>('signin')

  const openAuth = (tab: AuthTab = 'signin') => {
    setAuthTab(tab)
    setIsAuthOpen(true)
  }

  const closeAuth = () => {
    setIsAuthOpen(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthOpen, authTab, openAuth, closeAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
