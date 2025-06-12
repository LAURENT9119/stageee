import { supabase } from '@/lib/supabase/client'

class UsersService {
  private supabase = createClient()

const supabase = createClient()

export class UsersService {
  private supabase = supabase

  // GET - Récupérer tous les utilisateurs
  async getAllUsers() {
    try {
      const { data, error } = await this.supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error)
      return []
    }
  }

  // GET - Récupérer un utilisateur par ID
  async getUserById(id: string) {
    try {
      const { data, error } = await this.supabase.from("users").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error)
      return null
    }
  }

  // GET - Récupérer les utilisateurs par rôle
  async getUsersByRole(role: string) {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("*")
        .eq("role", role)
        .order("name", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs par rôle:", error)
      return []
    }
  }

  // POST - Créer un nouvel utilisateur
  async createUser(userData: {
    email: string
    name: string
    role: string
    phone?: string
    address?: string
    department?: string
    position?: string
  }) {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error)
      throw error
    }
  }

  // PUT - Mettre à jour un utilisateur
  async updateUser(
    id: string,
    updates: Partial<{
      name: string
      phone: string
      address: string
      department: string
      position: string
    }>,
  ) {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
      throw error
    }
  }

  // DELETE - Supprimer un utilisateur
  async deleteUser(id: string) {
    try {
      const { error } = await this.supabase.from("users").delete().eq("id", id)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error)
      throw error
    }
  }
}

export const usersService = new UsersService()