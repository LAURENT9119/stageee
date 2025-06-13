
import { BaseService } from './base-service'
import { Stagiaire, ApiResponse, Statistics, SearchFilters } from '@/lib/types'

export class StagiairesService extends BaseService {
  constructor() {
    super('/api')
  }

  async getStagiaires(filters?: SearchFilters): Promise<ApiResponse<Stagiaire[]>> {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, String(value))
          }
        })
      }
      
      const queryString = params.toString()
      const endpoint = queryString ? `/stagiaires?${queryString}` : '/stagiaires'
      
      return await this.get<Stagiaire[]>(endpoint)
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getStagiaire(id: string): Promise<ApiResponse<Stagiaire>> {
    try {
      return await this.get<Stagiaire>(`/stagiaires/${id}`)
    } catch (error) {
      return this.handleError(error)
    }
  }

  async createStagiaire(stagiaire: Partial<Stagiaire>): Promise<ApiResponse<Stagiaire>> {
    try {
      return await this.post<Stagiaire>('/stagiaires', stagiaire)
    } catch (error) {
      return this.handleError(error)
    }
  }

  async updateStagiaire(id: string, stagiaire: Partial<Stagiaire>): Promise<ApiResponse<Stagiaire>> {
    try {
      return await this.put<Stagiaire>(`/stagiaires/${id}`, stagiaire)
    } catch (error) {
      return this.handleError(error)
    }
  }

  async deleteStagiaire(id: string): Promise<ApiResponse<void>> {
    try {
      return await this.delete<void>(`/stagiaires/${id}`)
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getStagiairesStats(): Promise<ApiResponse<Statistics>> {
    try {
      return await this.get<Statistics>('/stagiaires/stats')
    } catch (error) {
      return this.handleError(error)
    }
  }

  async searchStagiaires(query: string): Promise<ApiResponse<Stagiaire[]>> {
    try {
      const params = new URLSearchParams({ q: query })
      return await this.get<Stagiaire[]>(`/search?${params.toString()}`)
    } catch (error) {
      return this.handleError(error)
    }
  }
}

export const stagiairesService = new StagiairesService()
