'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type AuthTab = 'signin' | 'signup'

interface AuthContextType {
  isAuthOpen: boolean
  authTab: AuthTab
  redirectAfterLogin: string
  openAuth: (tab?: AuthTab, redirectTo?: string) => void
  closeAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<AuthTab>('signin')
  const [redirectAfterLogin, setRedirectAfterLogin] = useState('/dashboard')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('login') === 'true') {
        setIsAuthOpen(true)
        setAuthTab('signin')
        urlParams.delete('login')
        const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '') + window.location.hash
        window.history.replaceState({}, '', newUrl || '/')
      }
    }
  }, [])

  const openAuth = (tab: AuthTab = 'signin', redirectTo = '/dashboard') => {
    setAuthTab(tab)
    setRedirectAfterLogin(redirectTo)
    setIsAuthOpen(true)
  }

  const closeAuth = () => {
    setIsAuthOpen(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthOpen, authTab, redirectAfterLogin, openAuth, closeAuth }}>
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
