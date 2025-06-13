// API Response type
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: string | null
}

// Search filters
export interface SearchFilters {
  search?: string
  status?: string
  department?: string
  tuteurId?: string
  limit?: number
  offset?: number
}

// Statistics type
export interface Statistics {
  total: number
  active: number
  inactive: number
  pending: number
}

// Demande types
export interface Demande {
  id: string
  stagiaire_id: string
  tuteur_id: string
  type_demande: string
  statut: 'en_attente' | 'approuvee' | 'refusee'
  commentaire_tuteur?: string
  motif_refus?: string
  created_at: string
  updated_at: string
  stagiaire?: {
    nom: string
    prenom: string
    email: string
  }
  tuteur?: {
    name: string
    email: string
  }
}

export interface DemandeInsert {
  stagiaire_id: string
  tuteur_id: string
  type_demande: string
  statut?: string
}

export interface DemandeUpdate {
  statut?: string
  commentaire_tuteur?: string
  motif_refus?: string
  updated_at?: string
}

// Types pour les stagiaires
export interface Stagiaire {
  id: string
  user_id: string
  nom: string
  prenom: string
  email: string
  telephone?: string
  adresse?: string
  date_naissance?: string
  lieu_naissance?: string
  cin?: string
  niveau_etude: string
  etablissement: string
  specialite: string
  date_debut_stage: string
  date_fin_stage: string
  tuteur_id?: string
  departement: string
  type_stage: 'academique' | 'professionnel'
  status: 'actif' | 'termine' | 'suspendu'
  created_at: string
  updated_at?: string
  user?: User
  tuteur?: User
}

export interface User {
  id: string
  email: string
  full_name?: string
  role: 'admin' | 'rh' | 'tuteur' | 'stagiaire'
  created_at: string
  updated_at?: string
  user_metadata?: {
    role?: string
    [key: string]: any
  }
}

export interface Document {
  id: string
  nom: string
  type: string
  url: string
  size: number
  stagiaire_id?: string
  demande_id?: string
  created_at: string
}

export interface Evaluation {
  id: string
  stagiaire_id: string
  tuteur_id: string
  periode: string
  note_technique: number
  note_comportement: number
  note_assiduite: number
  commentaires?: string
  recommandations?: string
  created_at: string
  stagiaire?: Stagiaire
  tuteur?: User
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  created_at: string
}

export interface Statistics {
  total_stagiaires: number
  stagiaires_actifs: number
  demandes_en_attente: number
  demandes_ce_mois: number
  evaluations_en_retard: number
  documents_recents: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface Template {
  id: string
  nom: string
  type: 'attestation' | 'evaluation' | 'rapport'
  contenu: string
  variables: string[]
  created_at: string
  updated_at?: string
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<string, number>
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  type: string
  filters?: Record<string, any>
}

export interface StagiaireStats {
  total: number
  actifs: number
  inactifs: number
  enAttente: number
  statsParDepartement: Record<string, number>
}