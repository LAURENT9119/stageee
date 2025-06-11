import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export class StagiairesService {
  private supabase = supabase

  // GET - Récupérer tous les stagiaires avec leurs tuteurs
  async getAllStagiaires() {
    try {
      const { data, error } = await this.supabase
        .from("stagiaires")
        .select(`
          *,
          tuteur:users!tuteur_id(id, name, email)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Erreur lors de la récupération des stagiaires:", error)
      return []
    }
  }

  // GET - Récupérer un stagiaire par ID avec toutes ses relations
  async getStagiaireById(id: string) {
    try {
      const { data, error } = await this.supabase
        .from("stagiaires")
        .select(`
          *,
          tuteur:users!tuteur_id(id, name, email),
          demandes(
            id,
            type,
            statut,
            details,
            date,
            tuteur_decision,
            rh_decision
          ),
          documents(
            id,
            nom,
            type,
            format,
            url,
            date
          ),
          evaluations(
            id,
            date,
            commentaire,
            note_globale,
            competences_evaluation(nom, note)
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Erreur lors de la récupération du stagiaire:", error)
      return null
    }
  }

  // GET - Récupérer les stagiaires par tuteur
  async getStagiairesByTuteur(tuteurId: string) {
    try {
      const { data, error } = await this.supabase
        .from("stagiaires")
        .select(`
          *,
          demandes(count),
          documents(count),
          evaluations(count)
        `)
        .eq("tuteur_id", tuteurId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Erreur lors de la récupération des stagiaires par tuteur:", error)
      return []
    }
  }

  // GET - Rechercher des stagiaires
  async searchStagiaires(
    searchTerm: string,
    filters: {
      statut?: string
      departement?: string
      tuteurId?: string
    } = {},
  ) {
    try {
      let query = this.supabase.from("stagiaires").select(`
          *,
          tuteur:users!tuteur_id(name)
        `)

      // Recherche textuelle
      if (searchTerm) {
        query = query.or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      }

      // Filtres
      if (filters.statut) {
        query = query.eq("statut", filters.statut)
      }
      if (filters.departement) {
        query = query.eq("departement", filters.departement)
      }
      if (filters.tuteurId) {
        query = query.eq("tuteur_id", filters.tuteurId)
      }

      const { data, error } = await query.order("nom", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Erreur lors de la recherche de stagiaires:", error)
      return []
    }
  }

  // POST - Créer un nouveau stagiaire
  async createStagiaire(stagiaireData: {
    user_id?: string
    nom: string
    prenom: string
    email: string
    telephone?: string
    adresse?: string
    date_naissance?: string
    formation?: string
    ecole?: string
    niveau?: string
    periode: string
    date_debut?: string
    date_fin?: string
    tuteur_id?: string
    departement?: string
    statut?: string
  }) {
    try {
      const { data, error } = await this.supabase
        .from("stagiaires")
        .insert({
          ...stagiaireData,
          statut: stagiaireData.statut || "en_attente",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Erreur lors de la création du stagiaire:", error)
      throw error
    }
  }

  // PUT - Mettre à jour un stagiaire
  async updateStagiaire(
    id: string,
    updates: Partial<{
      nom: string
      prenom: string
      email: string
      telephone: string
      adresse: string
      formation: string
      ecole: string
      niveau: string
      periode: string
      date_debut: string
      date_fin: string
      tuteur_id: string
      departement: string
      statut: string
    }>,
  ) {
    try {
      const { data, error } = await this.supabase
        .from("stagiaires")
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
      console.error("Erreur lors de la mise à jour du stagiaire:", error)
      throw error
    }
  }

  // DELETE - Supprimer un stagiaire et toutes ses données associées
  async deleteStagiaire(id: string) {
    try {
      // Supprimer les évaluations et leurs compétences
      const { data: evaluations } = await this.supabase.from("evaluations").select("id").eq("stagiaire_id", id)

      if (evaluations) {
        for (const evaluation of evaluations) {
          await this.supabase.from("competences_evaluation").delete().eq("evaluation_id", evaluation.id)
        }
        await this.supabase.from("evaluations").delete().eq("stagiaire_id", id)
      }

      // Supprimer les demandes et leurs commentaires
      const { data: demandes } = await this.supabase.from("demandes").select("id").eq("stagiaire_id", id)

      if (demandes) {
        for (const demande of demandes) {
          await this.supabase.from("commentaires").delete().eq("demande_id", demande.id)
        }
        await this.supabase.from("demandes").delete().eq("stagiaire_id", id)
      }

      // Supprimer les documents
      await this.supabase.from("documents").delete().eq("stagiaire_id", id)

      // Supprimer le stagiaire
      const { error } = await this.supabase.from("stagiaires").delete().eq("id", id)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Erreur lors de la suppression du stagiaire:", error)
      throw error
    }
  }

  // GET - Statistiques des stagiaires
  async getStagiairesStats() {
    try {
      const { data: all } = await this.supabase.from("stagiaires").select("statut")
      const { data: actifs } = await this.supabase.from("stagiaires").select("id").eq("statut", "actif")
      const { data: termines } = await this.supabase.from("stagiaires").select("id").eq("statut", "termine")
      const { data: enAttente } = await this.supabase.from("stagiaires").select("id").eq("statut", "en_attente")

      return {
        total: all?.length || 0,
        actifs: actifs?.length || 0,
        termines: termines?.length || 0,
        en_attente: enAttente?.length || 0,
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error)
      return { total: 0, actifs: 0, termines: 0, en_attente: 0 }
    }
  }
}

export const stagiairesService = new StagiairesService()