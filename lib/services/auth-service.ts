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

      if (error || !user) {
        return null
      }

      // Récupérer les informations utilisateur depuis la base de données
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError || !userData) {
        return null
      }

      return {
        id: userData.id,
        email: userData.email,
        nom: userData.nom,
        prenom: userData.prenom,
        role: userData.role,
        avatar_url: userData.avatar_url,
        telephone: userData.telephone,
        date_creation: userData.date_creation,
        derniere_connexion: userData.derniere_connexion,
        statut: userData.statut
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
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