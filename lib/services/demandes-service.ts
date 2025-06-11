import { createClient } from "@/lib/supabase/client"
import type { Database } from "../supabase/database.types"

export type Demande = Database["public"]["Tables"]["demandes"]["Row"]
export type DemandeInsert = Database["public"]["Tables"]["demandes"]["Insert"]
export type DemandeUpdate = Database["public"]["Tables"]["demandes"]["Update"]
export type Commentaire = Database["public"]["Tables"]["commentaires"]["Row"]

export class DemandesService {
  private supabase = createClient()

  // GET - Récupérer toutes les demandes avec relations
  async getAllDemandes(
    filters: {
      statut?: string
      type?: string
      stagiaireId?: string
      tuteurId?: string
    } = {},
  ) {
    try {
      let query = this.supabase.from("demandes").select(`
          *,
          stagiaire:stagiaires!stagiaire_id(
            id,
            nom,
            prenom,
            email
          ),
          tuteur:users!tuteur_id(
            id,
            name,
            email
          ),
          commentaires(
            id,
            message,
            date,
            user:users!user_id(name, role)
          )
        `)

      // Appliquer les filtres
      if (filters.statut) query = query.eq("statut", filters.statut)
      if (filters.type) query = query.eq("type", filters.type)
      if (filters.stagiaireId) query = query.eq("stagiaire_id", filters.stagiaireId)
      if (filters.tuteurId) query = query.eq("tuteur_id", filters.tuteurId)

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes:", error)
      return []
    }
  }

  // GET - Récupérer une demande par ID
  async getDemandeById(id: string) {
    try {
      const { data, error } = await this.supabase
        .from("demandes")
        .select(`
          *,
          stagiaire:stagiaires!stagiaire_id(
            id,
            nom,
            prenom,
            email,
            telephone
          ),
          tuteur:users!tuteur_id(
            id,
            name,
            email
          ),
          commentaires(
            id,
            message,
            date,
            user:users!user_id(id, name, role)
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Erreur lors de la récupération de la demande:", error)
      return null
    }
  }

  // POST - Créer une nouvelle demande
  async createDemande(demandeData: {
    type: string
    details: string
    stagiaire_id: string
    tuteur_id?: string
    date_debut?: string
    date_fin?: string
    duree?: string
  }) {
    try {
      const { data, error } = await this.supabase
        .from("demandes")
        .insert({
          ...demandeData,
          date: new Date().toISOString(),
          statut: "En attente",
          tuteur_decision: "En attente",
          rh_decision: "En attente",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Créer une notification pour le tuteur si spécifié
      if (demandeData.tuteur_id) {
        await this.supabase.from("notifications").insert({
          user_id: demandeData.tuteur_id,
          titre: "Nouvelle demande",
          message: `Une nouvelle demande de type ${demandeData.type} nécessite votre attention.`,
          type: "info",
          lu: false,
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
      }

      return data
    } catch (error) {
      console.error("Erreur lors de la création de la demande:", error)
      throw error
    }
  }

  // PUT - Mettre à jour une demande
  async updateDemande(
    id: string,
    updates: Partial<{
      statut: string
      tuteur_decision: string
      rh_decision: string
      details: string
      date_debut: string
      date_fin: string
      duree: string
    }>,
  ) {
    try {
      const { data, error } = await this.supabase
        .from("demandes")
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
      console.error("Erreur lors de la mise à jour de la demande:", error)
      throw error
    }
  }

  // POST - Approuver une demande
  async approuverDemande(id: string, userId: string, role: string, commentaire?: string) {
    try {
      const updates: any = {
        updated_at: new Date().toISOString(),
      }

      if (role === "tuteur") {
        updates.tuteur_decision = "Validé"
      } else if (role === "rh" || role === "admin") {
        updates.rh_decision = "Validé"
        updates.statut = "Validé"
      }

      const { data, error } = await this.supabase.from("demandes").update(updates).eq("id", id).select().single()

      if (error) throw error

      // Ajouter un commentaire si fourni
      if (commentaire) {
        await this.addCommentaire(id, userId, commentaire)
      }

      // Créer des notifications
      await this.createNotificationsForApproval(data, role)

      return data
    } catch (error) {
      console.error("Erreur lors de l'approbation de la demande:", error)
      throw error
    }
  }

  // POST - Rejeter une demande
  async rejeterDemande(id: string, userId: string, role: string, commentaire?: string) {
    try {
      const updates: any = {
        statut: "Refusé",
        updated_at: new Date().toISOString(),
      }

      if (role === "tuteur") {
        updates.tuteur_decision = "Refusé"
      } else if (role === "rh" || role === "admin") {
        updates.rh_decision = "Refusé"
      }

      const { data, error } = await this.supabase.from("demandes").update(updates).eq("id", id).select().single()

      if (error) throw error

      // Ajouter un commentaire si fourni
      if (commentaire) {
        await this.addCommentaire(id, userId, commentaire)
      }

      // Créer une notification pour le stagiaire
      await this.supabase.from("notifications").insert({
        user_id: data.stagiaire_id,
        titre: "Demande refusée",
        message: `Votre demande a été refusée par ${role === "tuteur" ? "votre tuteur" : "les RH"}.`,
        type: "error",
        lu: false,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })

      return data
    } catch (error) {
      console.error("Erreur lors du rejet de la demande:", error)
      throw error
    }
  }

  // POST - Ajouter un commentaire
  async addCommentaire(demandeId: string, userId: string, message: string) {
    try {
      const { data, error } = await this.supabase
        .from("commentaires")
        .insert({
          demande_id: demandeId,
          user_id: userId,
          message,
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error)
      throw error
    }
  }

  // DELETE - Supprimer une demande
  async deleteDemande(id: string) {
    try {
      // Supprimer les commentaires associés
      await this.supabase.from("commentaires").delete().eq("demande_id", id)

      // Supprimer la demande
      const { error } = await this.supabase.from("demandes").delete().eq("id", id)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Erreur lors de la suppression de la demande:", error)
      throw error
    }
  }

  // GET - Statistiques des demandes
  async getDemandesStats() {
    try {
      const { data: all } = await this.supabase.from("demandes").select("statut")
      const { data: enAttente } = await this.supabase.from("demandes").select("id").eq("statut", "En attente")
      const { data: validees } = await this.supabase.from("demandes").select("id").eq("statut", "Validé")
      const { data: refusees } = await this.supabase.from("demandes").select("id").eq("statut", "Refusé")

      return {
        total: all?.length || 0,
        en_attente: enAttente?.length || 0,
        validees: validees?.length || 0,
        refusees: refusees?.length || 0,
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error)
      return { total: 0, en_attente: 0, validees: 0, refusees: 0 }
    }
  }

  // Méthode privée pour créer les notifications d'approbation
  private async createNotificationsForApproval(demande: any, role: string) {
    // Notifier le stagiaire
    await this.supabase.from("notifications").insert({
      user_id: demande.stagiaire_id,
      titre: "Demande approuvée",
      message: `Votre demande a été approuvée par ${role === "tuteur" ? "votre tuteur" : "les RH"}.`,
      type: "success",
      lu: false,
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    })

    // Si c'est le tuteur qui approuve, notifier les RH
    if (role === "tuteur") {
      const { data: rhUsers } = await this.supabase.from("users").select("id").eq("role", "rh")

      if (rhUsers) {
        for (const rhUser of rhUsers) {
          await this.supabase.from("notifications").insert({
            user_id: rhUser.id,
            titre: "Demande à valider",
            message: "Une demande approuvée par un tuteur nécessite votre validation finale.",
            type: "info",
            lu: false,
            date: new Date().toISOString(),
            created_at: new Date().toISOString(),
          })
        }
      }
    }
  }
}

export const demandesService = new DemandesService()