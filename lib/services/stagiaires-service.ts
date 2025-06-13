import { BaseService } from './base-service'
import type { Stagiaire, StagiaireInsert, StagiaireUpdate } from '@/lib/types'

export class StagiairesService extends BaseService {
  private readonly tableName = 'stagiaires'

  async getAllStagiaires(): Promise<Stagiaire[]> {
    return this.getAll<Stagiaire>(this.tableName)
  }

  async getStagiaireById(id: string): Promise<Stagiaire | null> {
    return this.getById<Stagiaire>(this.tableName, id)
  }

  async createStagiaire(stagiaire: StagiaireInsert): Promise<Stagiaire> {
    return this.create<Stagiaire>(this.tableName, stagiaire)
  }

  async updateStagiaire(id: string, updates: StagiaireUpdate): Promise<Stagiaire> {
    return this.update<Stagiaire>(this.tableName, id, updates)
  }

  async deleteStagiaire(id: string): Promise<void> {
    return this.delete(this.tableName, id)
  }

  async searchStagiaires(searchTerm: string, filters?: Record<string, any>): Promise<Stagiaire[]> {
    const searchFields = ['nom', 'prenom', 'email', 'ecole', 'departement']
    return this.search<Stagiaire>(this.tableName, searchFields, searchTerm, '*', filters)
  }

  async getStagiairesByTuteur(tuteurId: string): Promise<Stagiaire[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('tuteur_id', tuteurId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getStagiairesStats(): Promise<any> {
    const total = await this.getCount(this.tableName)
    const actifs = await this.getCount(this.tableName, { statut: 'actif' })
    const inactifs = total - actifs

    return {
      total,
      actifs,
      inactifs
    }
  }
}

export const stagiairesService = new StagiairesService()