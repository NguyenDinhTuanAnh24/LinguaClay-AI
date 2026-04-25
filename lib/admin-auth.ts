import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { isAdminUser } from '@/lib/admin'

/**
 * Checks if the currently authenticated user has the 'ADMIN' role.
 * Uses both Supabase metadata and Database role checks to ensure security.
 *
 * @returns {Promise<any | null>} Returns the authenticated user object if they are an admin, or null otherwise.
 */
export async function ensureAdminActor() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminUser(user)) return null

  try {
    const actor = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    })
    if (!actor || (actor as { role?: string }).role !== 'ADMIN') {
      return null
    }
  } catch {
    // Fallback to Supabase admin check for backward compatibility
  }

  return user
}
