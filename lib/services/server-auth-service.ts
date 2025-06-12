import { createServerSupabaseClient } from "@/lib/supabase/server"

// Server-side auth helper
export async function getServerUser() {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return user
}

export async function requireServerAuth() {
  const user = await getServerUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function getUserRole() {
  const user = await getServerUser()
  if (!user) return null

  // Récupérer le rôle depuis les métadonnées ou la base de données
  return user.user_metadata?.role || 'stagiaire'
}