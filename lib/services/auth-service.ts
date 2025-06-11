

import { createClient } from "@/lib/supabase/client"

export class AuthService {
  private supabase = createClient()

  async signUp(email: string, password: string, userData: any) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error
      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { user: data.user, session: data.session, error: null }
    } catch (error) {
      return { user: null, session: null, error: error as Error }
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      return { user: null, error: error as Error }
    }  
  }

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) throw error
      return { profile: data, error: null }
    } catch (error) {
      return { profile: null, error: error as Error }
    }
  }

  async updateUserProfile(userId: string, updates: any) {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .update(updates)
        .eq("id", userId)
        .select()
        .single()

      if (error) throw error
      return { profile: data, error: null }
    } catch (error) {
      return { profile: null, error: error as Error }
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }
}

export const authService = new AuthService()
