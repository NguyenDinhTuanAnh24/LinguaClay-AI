export const ADMIN_EMAIL = 'admin@gmail.com'
export const ADMIN_ROLE = 'admin'

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
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
  return isAdminEmail(user.email) && getUserRole(user) === ADMIN_ROLE
}
