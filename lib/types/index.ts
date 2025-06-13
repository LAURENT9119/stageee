
// Types principaux basés sur la base de données
export type { Database } from '../supabase/database.types'

// Types pour les tables principales
export type Stagiaire = Database['public']['Tables']['stagiaires']['Row']
export type StagiaireInsert = Database['public']['Tables']['stagiaires']['Insert']
export type StagiaireUpdate = Database['public']['Tables']['stagiaires']['Update']

export type Demande = Database['public']['Tables']['demandes']['Row']
export type DemandeInsert = Database['public']['Tables']['demandes']['Insert']
export type DemandeUpdate = Database['public']['Tables']['demandes']['Update']

export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
export type DocumentUpdate = Database['public']['Tables']['documents']['Update']

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Template = Database['public']['Tables']['templates']['Row']
export type TemplateInsert = Database['public']['Tables']['templates']['Insert']
export type TemplateUpdate = Database['public']['Tables']['templates']['Update']

export type Evaluation = Database['public']['Tables']['evaluations']['Row']
export type EvaluationInsert = Database['public']['Tables']['evaluations']['Insert']
export type EvaluationUpdate = Database['public']['Tables']['evaluations']['Update']

// Types pour les réponses API
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// Types pour les statistiques
export interface StatsData {
  total: number
  [key: string]: number
}

export interface DashboardStats {
  stagiaires_total: number
  stagiaires_actifs: number
  demandes_total: number
  demandes_en_cours: number
  documents_total: number
}

// Types pour les filtres
export interface FilterOptions {
  [key: string]: string | number | boolean | undefined
}

// Types pour la validation
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Types pour les notifications
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
}
