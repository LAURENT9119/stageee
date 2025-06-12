
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

export function createAuthClient() {
  return createClient()
}

// Client-side auth functions only
export async function signOut() {
  const supabase = createAuthClient()
  await supabase.auth.signOut()
}

export async function getUser() {
  const supabase = createAuthClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const auth = {
  async signOut() {
    const supabase = createAuthClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getUser() {
    const supabase = createAuthClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async signIn(email: string, password: string) {
    const supabase = createAuthClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }
}
