'use client'

import React from 'react'
import { useAuth } from '@/providers/AuthProvider'

interface AuthTriggerProps {
  children: React.ReactNode
  className?: string
  tab?: 'signin' | 'signup'
}

export default function AuthTrigger({ children, className, tab = 'signin' }: AuthTriggerProps) {
  const { openAuth } = useAuth()
  
  return (
    <button 
      onClick={() => openAuth(tab)} 
      className={className}
    >
      {children}
    </button>
  )
}
