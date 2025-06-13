import { createServerSupabaseClient } from "@/lib/supabase/server"

// Export the createServerSupabaseClient function
export { createServerSupabaseClient }

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
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerSupabaseClient() {
  const cookieStore = cookies()

  // Utiliser des valeurs par défaut si les variables d'environnement ne sont pas configurées
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://blmyaizvefkfmwgggid.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'default-key'

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variables d\'environnement Supabase manquantes')
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
