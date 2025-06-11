import { createClient } from "@/lib/supabase/client"
import type { Database } from "../supabase/database.types"

export type Document = Database["public"]["Tables"]["documents"]["Row"]
export type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"]
export type DocumentUpdate = Database["public"]["Tables"]["documents"]["Update"]

export class DocumentsService {
  private supabase = createClient()

  // GET - Récupérer tous les documents
  async getAllDocuments(
    filters: {
      type?: string
      format?: string
      stagiaireId?: string
    } = {},
  ) {
    try {
      let query = this.supabase.from("documents").select(`
          *,
          stagiaire:stagiaires!stagiaire_id(
            id,
            nom,
            prenom,
            email
          )
        `)

      // Appliquer les filtres
      if (filters.type) query = query.eq("type", filters.type)
      if (filters.format) query = query.eq("format", filters.format)
      if (filters.stagiaireId) query = query.eq("stagiaire_id", filters.stagiaireId)

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error)
      return []
    }
  }

  // GET - Récupérer un document par ID
  async getDocumentById(id: string) {
    try {
      const { data, error } = await this.supabase
        .from("documents")
        .select(`
          *,
          stagiaire:stagiaires!stagiaire_id(
            id,
            nom,
            prenom,
            email
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Erreur lors de la récupération du document:", error)
      return null
    }
  }

  // POST - Uploader un nouveau document
  async uploadDocument(
    file: File,
    metadata: {
      nom: string
      description?: string
      type: string
      stagiaire_id: string
    },
  ) {
    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `${metadata.stagiaire_id}/${fileName}`

      // Uploader le fichier dans le storage
      const { error: uploadError } = await this.supabase.storage.from("documents").upload(filePath, file)

      if (uploadError) throw uploadError

      // Obtenir l'URL publique
      const { data: publicUrl } = this.supabase.storage.from("documents").getPublicUrl(filePath)

      // Déterminer le format
      const format = this.getFileFormat(fileExt || "")

      // Créer l'entrée dans la base de données
      const { data, error } = await this.supabase
        .from("documents")
        .insert({
          date: new Date().toISOString(),
          nom: metadata.nom,
          description: metadata.description || "",
          format,
          stagiaire_id: metadata.stagiaire_id,
          type: metadata.type,
          url: publicUrl.publicUrl,
          taille: `${(file.size / 1024).toFixed(2)} Ko`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        // En cas d'erreur, supprimer le fichier uploadé
        await this.supabase.storage.from("documents").remove([filePath])
        throw error
      }

      return data
    } catch (error) {
      console.error("Erreur lors de l'upload du document:", error)
      throw error
    }
  }

  // PUT - Mettre à jour un document
  async updateDocument(
    id: string,
    updates: Partial<{
      nom: string
      description: string
      type: string
    }>,
  ) {
    try {
      const { data, error } = await this.supabase
        .from("documents")
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
      console.error("Erreur lors de la mise à jour du document:", error)
      throw error
    }
  }

  // DELETE - Supprimer un document
  async deleteDocument(id: string) {
    try {
      // Récupérer l'URL du fichier
      const { data: document } = await this.supabase.from("documents").select("url").eq("id", id).single()

      if (document?.url) {
        // Extraire le chemin du fichier depuis l'URL
        const urlParts = document.url.split("/")
        const filePath = urlParts.slice(-2).join("/") // stagiaire_id/filename

        // Supprimer le fichier du storage
        await this.supabase.storage.from("documents").remove([filePath])
      }

      // Supprimer l'entrée de la base de données
      const { error } = await this.supabase.from("documents").delete().eq("id", id)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Erreur lors de la suppression du document:", error)
      throw error
    }
  }

  // GET - Télécharger un document
  async downloadDocument(id: string) {
    try {
      const document = await this.getDocumentById(id)
      if (!document) throw new Error("Document non trouvé")

      // Créer un lien de téléchargement
      const link = document.createElement("a")
      link.href = document.url
      link.download = document.nom
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return true
    } catch (error) {
      console.error("Erreur lors du téléchargement du document:", error)
      throw error
    }
  }

  // GET - Statistiques des documents
  async getDocumentsStats() {
    try {
      const { data: all } = await this.supabase.from("documents").select("format, type")

      const stats = {
        total: all?.length || 0,
        par_format: {} as Record<string, number>,
        par_type: {} as Record<string, number>,
      }

      all?.forEach((doc) => {
        stats.par_format[doc.format] = (stats.par_format[doc.format] || 0) + 1
        stats.par_type[doc.type] = (stats.par_type[doc.type] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error)
      return { total: 0, par_format: {}, par_type: {} }
    }
  }

  // Méthode privée pour déterminer le format du fichier
  private getFileFormat(extension: string): "PDF" | "DOC" | "IMG" {
    const ext = extension.toLowerCase()
    if (ext === "pdf") return "PDF"
    if (["doc", "docx"].includes(ext)) return "DOC"
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext)) return "IMG"
    return "PDF" // Par défaut
  }
}

export const documentsService = new DocumentsService()