
export interface Stagiaire {
  id: string
  nom: string
  prenom: string
  email: string
  telephone?: string
  departement?: string
  ecole?: string
  niveau?: string
  date_debut?: string
  date_fin?: string
  tuteur_id?: string
  created_at?: string
  updated_at?: string
}

export interface Demande {
  id: string
  stagiaire_id: string
  type: string
  statut: 'en_attente' | 'approuvee' | 'refusee'
  details?: string
  motif?: string
  date_debut?: string
  date_fin?: string
  created_at: string
  updated_at?: string
}

export interface Document {
  id: string
  nom: string
  description?: string
  type: string
  format: string
  url: string
  stagiaire_id?: string
  created_at: string
  updated_at?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'rh' | 'tuteur' | 'stagiaire'
  created_at?: string
  updated_at?: string
}

export interface Template {
  id: string
  nom: string
  description?: string
  contenu: string
  type: string
  created_at: string
  updated_at?: string
}

export interface Evaluation {
  id: string
  stagiaire_id: string
  tuteur_id: string
  note: number
  commentaires?: string
  competences?: any
  created_at: string
  updated_at?: string
}
