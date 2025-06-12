
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  role: string
  nom?: string
  prenom?: string
}

export const authService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) return null
      
      // Get user profile data
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      return {
        id: user.id,
        email: user.email!,
        role: profile?.role || 'stagiaire',
        nom: profile?.nom,
        prenom: profile?.prenom
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error }
    }
  },

  async signUp(email: string, password: string, userData: any) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (error) throw error
      
      // Create user profile
      if (data.user) {
        await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            email: data.user.email,
            ...userData
          }])
      }
      
      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error }
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }
}
