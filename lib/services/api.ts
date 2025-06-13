// Types définis localement pour éviter la dépendance aux mock-data
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

// Configuration API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Utilitaire pour les requêtes
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  // Ajouter le token d'authentification si disponible
  const token = localStorage.getItem("auth-token")
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`)
    }

    // Si la réponse est un blob (pour les fichiers), la retourner directement
    if (response.headers.get('content-type')?.includes('application/pdf') || 
        response.headers.get('content-type')?.includes('text/csv')) {
      return response.blob() as any
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, "Network error")
  }
}

// Services Auth
export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  async register(userData: Partial<User>): Promise<{ user: User; token: string }> {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  async logout(): Promise<void> {
    return apiRequest("/auth/logout", { method: "POST" })
  },

  async refreshToken(): Promise<{ token: string }> {
    return apiRequest("/auth/refresh", { method: "POST" })
  },
}

// Services Users
export const usersApiService = {
  async getAll(role?: string): Promise<User[]> {
    const params = role ? `?role=${role}` : ""
    return apiRequest(`/users${params}`)
  },

  async getById(id: string): Promise<User> {
    return apiRequest(`/users/${id}`)
  },

  async create(user: Partial<User>): Promise<User> {
    return apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(user),
    })
  },

  async update(id: string, user: Partial<User>): Promise<User> {
    return apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    })
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/users/${id}`, { method: "DELETE" })
  },
}

// Services Stagiaires
export const stagiairesApiService = {
  async getAll(filters?: any): Promise<Stagiaire[]> {
    const params = new URLSearchParams(filters)
    return apiRequest(`/stagiaires?${params}`)
  },

  async getById(id: string): Promise<Stagiaire> {
    return apiRequest(`/stagiaires/${id}`)
  },

  async create(stagiaire: Partial<Stagiaire>): Promise<Stagiaire> {
    return apiRequest("/stagiaires", {
      method: "POST",
      body: JSON.stringify(stagiaire),
    })
  },

  async update(id: string, stagiaire: Partial<Stagiaire>): Promise<Stagiaire> {
    return apiRequest(`/stagiaires/${id}`, {
      method: "PUT",
      body: JSON.stringify(stagiaire),
    })
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/stagiaires/${id}`, { method: "DELETE" })
  },

  async getStats(): Promise<any> {
    return apiRequest("/stagiaires/stats")
  },
}

// Services Demandes
export const demandesApiService = {
  async getAll(filters?: any): Promise<Demande[]> {
    const params = new URLSearchParams(filters)
    return apiRequest(`/demandes?${params}`)
  },

  async getById(id: string): Promise<Demande> {
    return apiRequest(`/demandes/${id}`)
  },

  async create(demande: Partial<Demande>): Promise<Demande> {
    return apiRequest("/demandes", {
      method: "POST",
      body: JSON.stringify(demande),
    })
  },

  async update(id: string, demande: Partial<Demande>): Promise<Demande> {
    return apiRequest(`/demandes/${id}`, {
      method: "PUT",
      body: JSON.stringify(demande),
    })
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/demandes/${id}`, { method: "DELETE" })
  },

  async approve(id: string, userId: string, role: string, comment?: string): Promise<Demande> {
    return apiRequest(`/demandes/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ userId, role, commentaire: comment }),
    })
  },

  async reject(id: string, userId: string, role: string, comment?: string): Promise<Demande> {
    return apiRequest(`/demandes/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ userId, role, commentaire: comment }),
    })
  },

  async addComment(id: string, userId: string, message: string): Promise<any> {
    return apiRequest(`/demandes/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ userId, message }),
    })
  },

  async getStats(): Promise<any> {
    return apiRequest("/demandes/stats")
  },
}

// Services Documents
export const documentsApiService = {
  async getAll(filters?: any): Promise<Document[]> {
    const params = new URLSearchParams(filters)
    return apiRequest(`/documents?${params}`)
  },

  async getById(id: string): Promise<Document> {
    return apiRequest(`/documents/${id}`)
  },

  async upload(file: File, metadata: Partial<Document>): Promise<Document> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("metadata", JSON.stringify(metadata))

    return apiRequest("/documents", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    })
  },

  async update(id: string, updates: Partial<Document>): Promise<Document> {
    return apiRequest(`/documents/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/documents/${id}`, { method: "DELETE" })
  },

  async getStats(): Promise<any> {
    return apiRequest("/documents/stats")
  },
}

// Services Evaluations
export const evaluationsApiService = {
  async getAll(filters?: any): Promise<any[]> {
    const params = new URLSearchParams(filters)
    return apiRequest(`/evaluations?${params}`)
  },

  async getById(id: string): Promise<any> {
    return apiRequest(`/evaluations/${id}`)
  },

  async create(evaluation: any, competences: any[]): Promise<any> {
    return apiRequest("/evaluations", {
      method: "POST",
      body: JSON.stringify({ evaluation, competences }),
    })
  },

  async update(id: string, evaluation: any, competences?: any[]): Promise<any> {
    return apiRequest(`/evaluations/${id}`, {
      method: "PUT",
      body: JSON.stringify({ evaluation, competences }),
    })
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/evaluations/${id}`, { method: "DELETE" })
  },
}

// Services Notifications
export const notificationsApiService = {
  async getAll(userId: string): Promise<any[]> {
    return apiRequest(`/notifications?userId=${userId}`)
  },

  async getUnread(userId: string): Promise<any[]> {
    return apiRequest(`/notifications?userId=${userId}&unreadOnly=true`)
  },

  async markAsRead(id: string): Promise<void> {
    return apiRequest(`/notifications/${id}/read`, { method: "PUT" })
  },

  async markAllAsRead(userId: string): Promise<void> {
    return apiRequest("/notifications/mark-all-read", {
      method: "PUT",
      body: JSON.stringify({ userId }),
    })
  },

  async create(notification: any): Promise<any> {
    return apiRequest("/notifications", {
      method: "POST",
      body: JSON.stringify(notification),
    })
  },
}

// Services Templates
export const templatesApiService = {
  async getAll(filters?: any): Promise<any[]> {
    const params = new URLSearchParams(filters)
    return apiRequest(`/templates?${params}`)
  },

  async getById(id: string): Promise<any> {
    return apiRequest(`/templates/${id}`)
  },

  async create(template: any): Promise<any> {
    return apiRequest("/templates", {
      method: "POST",
      body: JSON.stringify(template),
    })
  },

  async update(id: string, template: any): Promise<any> {
    return apiRequest(`/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(template),
    })
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/templates/${id}`, { method: "DELETE" })
  },

  async generateDocument(templateId: string, data: any): Promise<Blob> {
    return apiRequest(`/templates/${templateId}/generate`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
}

// Services Statistiques
export const statisticsApiService = {
  async getGlobalStats(): Promise<any> {
    return apiRequest("/statistics?type=global")
  },

  async getStagiairesByMonth(): Promise<any> {
    return apiRequest("/statistics?type=stagiaires-by-month")
  },

  async getDemandesByType(): Promise<any> {
    return apiRequest("/statistics?type=demandes-by-type")
  },

  async getTauxAcceptation(): Promise<any> {
    return apiRequest("/statistics?type=taux-acceptation")
  },

  async getStagiairesByDepartement(): Promise<any> {
    return apiRequest("/statistics?type=stagiaires-by-departement")
  },
}

// Services Dashboard
export const dashboardApiService = {
  async getStats(userId: string, role: string): Promise<any> {
    return apiRequest(`/dashboard?userId=${userId}&role=${role}`)
  },
}

// Services Exports
export const exportApiService = {
  async exportToCSV(type: "demandes" | "stagiaires" | "documents", filters?: any): Promise<Blob> {
    const params = new URLSearchParams({ ...filters, format: "csv" })
    return apiRequest(`/export/${type}?${params}`)
  },

  async exportToPDF(type: "demandes" | "stagiaires" | "documents", filters?: any): Promise<Blob> {
    const params = new URLSearchParams({ ...filters, format: "pdf" })
    return apiRequest(`/export/${type}?${params}`)
  },
}

// Export Service
export const exportService = {
  async exportData(type: string, format: string = 'csv'): Promise<Blob> {
    return apiRequest(`/export/${type}?format=${format}`, {
      method: 'GET',
    })
  },

  async exportStagiaires(filters?: any): Promise<Blob> {
    const params = new URLSearchParams(filters)
    return apiRequest(`/export/stagiaires?${params}`, {
      method: 'GET',
    })
  },

  async exportDemandes(filters?: any): Promise<Blob> {
    const params = new URLSearchParams(filters)
    return apiRequest(`/export/demandes?${params}`, {
      method: 'GET',
    })
  }
}