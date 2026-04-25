import { AppRoles } from '@/lib/constants'
import { logger } from '@/lib/logger'

/**
 * Admin email sourced from environment variable.
 * Set ADMIN_EMAIL in your .env file.
 * Falls back to empty string (no admin access) if not configured.
 */
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase()

if (!ADMIN_EMAIL && process.env.NODE_ENV !== 'test') {
  logger.warn('admin.auth.no_env', { message: 'ADMIN_EMAIL env var is not set — admin access will be denied for everyone.' })
}

export const ADMIN_EMAILS = ADMIN_EMAIL ? [ADMIN_EMAIL] : []

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email || !ADMIN_EMAIL) return false
  return email.trim().toLowerCase() === ADMIN_EMAIL
}

type SupabaseUserLike = {
  email?: string | null
  app_metadata?: Record<string, unknown> | null
  user_metadata?: Record<string, unknown> | null
}

export function getUserRole(user: SupabaseUserLike | null | undefined): string | null {
  if (!user) return null
  const appRole = user.app_metadata?.role
  if (typeof appRole === 'string' && appRole) return appRole
  const userRole = user.user_metadata?.role
  if (typeof userRole === 'string' && userRole) return userRole
  return null
}

export function isAdminUser(user: SupabaseUserLike | null | undefined): boolean {
  if (!user) return false
  if (!isAdminEmail(user.email)) return false
  const role = getUserRole(user)
  // If no role metadata, grant access based on email alone
  if (!role) return true
  return role === AppRoles.ADMIN || role.toLowerCase() === 'admin'
}

