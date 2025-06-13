import { createClient } from '@/lib/supabase/client'
import type { Database } from "../supabase/database.types"

export type Stagiaire = Database["public"]["Tables"]["stagiaires"]["Row"]
export type StagiaireInsert = Database["public"]["Tables"]["stagiaires"]["Insert"]
export type StagiaireUpdate = Database["public"]["Tables"]["stagiaires"]["Update"]

export class StagiairesService {
  private supabase = createClient()

  async getAll() {
    const { data, error } = await this.supabase
      .from('stagiaires')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('stagiaires')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async create(stagiaire: StagiaireInsert) {
    const { data, error } = await this.supabase
      .from('stagiaires')
      .insert(stagiaire)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, updates: StagiaireUpdate) {
    const { data, error } = await this.supabase
      .from('stagiaires')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('stagiaires')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async getByTuteur(tuteurId: string) {
    const { data, error } = await this.supabase
      .from('stagiaires')
      .select('*')
      .eq('tuteur_id', tuteurId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async search(searchTerm: string) {
    const { data, error } = await this.supabase
      .from('stagiaires')
      .select('*')
      .or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}

export const stagiairesService = new StagiairesService()