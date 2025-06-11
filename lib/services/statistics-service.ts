import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export const statisticsService = {
  async getStagiairesByMonth() {
    // const supabase = createClient()

    const { data, error } = await supabase.from("stagiaires").select("date_debut").not("date_debut", "is", null)

    if (error) throw error

    // Traiter les données pour obtenir le nombre de stagiaires par mois
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]
    const currentYear = new Date().getFullYear()
    const stagiairesByMonth = Array(12).fill(0)

    data.forEach((stagiaire) => {
      const date = new Date(stagiaire.date_debut)
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth()
        stagiairesByMonth[month]++
      }
    })

    return months.map((month, index) => ({
      mois: month,
      nombre: stagiairesByMonth[index],
    }))
  },

  async getDemandesByType() {
    // const supabase = createClient()

    const { data, error } = await supabase.from("demandes").select("type")

    if (error) throw error

    // Compter les demandes par type
    const types: Record<string, number> = {}

    data.forEach((demande) => {
      const type = demande.type
      types[type] = (types[type] || 0) + 1
    })

    // Formater les données pour le graphique
    return Object.entries(types).map(([type, nombre]) => {
      let name = type

      switch (type) {
        case "stage_academique":
          name = "Stage académique"
          break
        case "stage_professionnel":
          name = "Stage professionnel"
          break
        case "conge":
          name = "Congé"
          break
        case "prolongation":
          name = "Prolongation"
          break
        case "attestation":
          name = "Attestation"
          break
      }

      return { type: name, nombre }
    })
  },

  async getTauxAcceptation() {
    // const supabase = createClient()

    const { data, error } = await supabase.from("demandes").select("statut")

    if (error) throw error

    // Compter les demandes par statut
    let acceptees = 0
    let refusees = 0
    let enAttente = 0

    data.forEach((demande) => {
      if (demande.statut === "approuvee") acceptees++
      else if (demande.statut === "rejetee") refusees++
      else enAttente++
    })

    const total = data.length

    return [
      { type: "Acceptées", pourcentage: total > 0 ? (acceptees / total) * 100 : 0 },
      { type: "Refusées", pourcentage: total > 0 ? (refusees / total) * 100 : 0 },
      { type: "En attente", pourcentage: total > 0 ? (enAttente / total) * 100 : 0 },
    ]
  },

  async getStagiairesByDepartement() {
    // const supabase = createClient()

    const { data, error } = await supabase.from("stagiaires").select(`
        profiles!inner(department)
      `)

    if (error) throw error

    // Compter les stagiaires par département
    const departements: Record<string, number> = {}

    data.forEach((stagiaire) => {
      const dept = stagiaire.profiles?.department || "Non spécifié"
      departements[dept] = (departements[dept] || 0) + 1
    })

    // Formater les données pour le graphique
    return Object.entries(departements).map(([nom, nombre]) => ({
      nom,
      nombre,
    }))
  },

  async getGlobalStats() {
    // const supabase = createClient()

    // Nombre total de stagiaires
    const { count: totalStagiaires } = await supabase.from("stagiaires").select("*", { count: "exact", head: true })

    // Nombre de stagiaires actifs
    const { count: stagiaireActifs } = await supabase
      .from("stagiaires")
      .select("*", { count: "exact", head: true })
      .eq("statut", "actif")

    // Nombre total de demandes
    const { count: totalDemandes } = await supabase.from("demandes").select("*", { count: "exact", head: true })

    // Demandes en attente
    const { count: demandesEnAttente } = await supabase
      .from("demandes")
      .select("*", { count: "exact", head: true })
      .eq("statut", "en_attente")

    // Demandes approuvées
    const { count: demandesApprouvees } = await supabase
      .from("demandes")
      .select("*", { count: "exact", head: true })
      .eq("statut", "approuvee")

    // Taux d'acceptation
    const tauxAcceptation = totalDemandes > 0 ? ((demandesApprouvees || 0) / totalDemandes) * 100 : 0

    return {
      totalStagiaires: totalStagiaires || 0,
      stagiaireActifs: stagiaireActifs || 0,
      totalDemandes: totalDemandes || 0,
      demandesEnAttente: demandesEnAttente || 0,
      demandesApprouvees: demandesApprouvees || 0,
      tauxAcceptation: Math.round(tauxAcceptation),
    }
  },
}