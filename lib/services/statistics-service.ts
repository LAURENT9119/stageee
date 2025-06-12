import { createClient } from '@/lib/supabase/client'
import type { Database } from "../supabase/database.types"

const supabase = createClient()

export const statisticsService = {
  async getStagiairesByMonth() {
    const { data, error } = await supabase
      .from('stagiaires')
      .select('created_at, statut')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getDemandesByType() {
    const { data, error } = await supabase
      .from('demandes')
      .select('type, statut')

    if (error) throw error
    return data
  },

  async getStagiairesByDepartment() {
    const { data, error } = await supabase
      .from('stagiaires')
      .select('departement, statut')

    if (error) throw error
    return data
  },

  async getDocumentsByType() {
    const { data, error } = await supabase
      .from('documents')
      .select('type, created_at')

    if (error) throw error
    return data
  },

  async getDashboardStats() {
    const [
      stagiaires,
      demandes,
      documents,
      evaluations
    ] = await Promise.all([
      supabase.from('stagiaires').select('id', { count: 'exact' }),
      supabase.from('demandes').select('id', { count: 'exact' }),
      supabase.from('documents').select('id', { count: 'exact' }),
      supabase.from('evaluations').select('id', { count: 'exact' })
    ])

    return {
      stagiaires: stagiaires.count || 0,
      demandes: demandes.count || 0,
      documents: documents.count || 0,
      evaluations: evaluations.count || 0
    }
  }
}