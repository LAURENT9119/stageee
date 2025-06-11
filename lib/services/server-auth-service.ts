
import { createServerSupabaseClient } from "@/lib/supabase/server"

// Server-side auth helper
export async function getServerUser() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) throw error
    return { user, error: null }
  } catch (error) {
    return { user: null, error: error as Error }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) throw error
    return { profile: data, error: null }
  } catch (error) {
    return { profile: null, error: error as Error }
  }
}
