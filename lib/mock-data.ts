
// Ce fichier contenait des données simulées qui ont été remplacées par des appels API réels
// Toutes les données sont maintenant récupérées depuis la base de données via les services

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "rh" | "stagiaire" | "tuteur"
  created_at: string
  updated_at: string
}

export interface Demande {
  id: string
  type: "stage-professionnel" | "stage-academique" | "conge" | "prolongation" | "attestation"
  status: "en_attente" | "approuvee" | "rejetee" | "en_cours"
  stagiaire_id: string
  tuteur_id?: string
  date_debut: string
  date_fin: string
  motif?: string
  commentaire?: string
  documents?: string[]
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  name: string
  type: string
  url: string
  size: number
  uploaded_by: string
  created_at: string
}

export interface Stagiaire {
  id: string
  user_id: string
  nom: string
  prenom: string
  email: string
  telephone?: string
  etablissement?: string
  niveau_etude?: string
  specialite?: string
  tuteur_id?: string
  date_debut_stage?: string
  date_fin_stage?: string
  created_at: string
  updated_at: string
}

// Toutes les données simulées ont été supprimées
// Les tableaux sont maintenant vides car les données proviennent de la base de données
export const mockUsers: User[] = []
export const mockDemandes: Demande[] = []
export const mockDocuments: Document[] = []
export const mockStagiaires: Stagiaire[] = []
