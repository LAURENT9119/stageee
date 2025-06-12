
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  role: string
  nom?: string
  prenom?: string
}

const supabase = createClient()

export const authService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) return null
      
      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        console.warn('Profile not found, using default role')
      }
      
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
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            email: data.user.email,
            ...userData
          }])
        
        if (insertError) {
          console.error('Error creating user profile:', insertError)
        }
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
  },

  async getUserProfile(userId: string) {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      return { profile, error }
    } catch (error) {
      return { profile: null, error }
    }
  }
}
