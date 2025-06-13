
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/services/server-auth-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'
    const filters = {
      statut: searchParams.get('statut'),
      departement: searchParams.get('departement'),
      periode: searchParams.get('periode')
    }

    let results = {
      stagiaires: [],
      demandes: [],
      documents: [],
      users: []
    }

    // Recherche dans les stagiaires
    if (type === 'all' || type === 'stagiaires') {
      let stagiaireQuery = supabase
        .from('stagiaires')
        .select(`
          *,
          users(name, email)
        `)

      if (query) {
        stagiaireQuery = stagiaireQuery.or(
          `nom.ilike.%${query}%,prenom.ilike.%${query}%,email.ilike.%${query}%,etablissement.ilike.%${query}%`
        )
      }

      if (filters.statut) {
        stagiaireQuery = stagiaireQuery.eq('statut', filters.statut)
      }

      if (filters.departement) {
        stagiaireQuery = stagiaireQuery.eq('specialite', filters.departement)
      }

      const { data: stagiaires } = await stagiaireQuery.limit(20)
      results.stagiaires = stagiaires || []
    }

    // Recherche dans les demandes
    if (type === 'all' || type === 'demandes') {
      let demandeQuery = supabase
        .from('demandes')
        .select(`
          *,
          stagiaires(nom, prenom, email)
        `)

      if (query) {
        demandeQuery = demandeQuery.or(
          `type.ilike.%${query}%,details.ilike.%${query}%,motif.ilike.%${query}%`
        )
      }

      if (filters.statut) {
        demandeQuery = demandeQuery.eq('statut', filters.statut)
      }

      const { data: demandes } = await demandeQuery.limit(20)
      results.demandes = demandes || []
    }

    // Recherche dans les documents
    if (type === 'all' || type === 'documents') {
      let documentQuery = supabase
        .from('documents')
        .select('*')

      if (query) {
        documentQuery = documentQuery.or(
          `nom.ilike.%${query}%,description.ilike.%${query}%,type.ilike.%${query}%`
        )
      }

      const { data: documents } = await documentQuery.limit(20)
      results.documents = documents || []
    }

    // Recherche dans les utilisateurs
    if (type === 'all' || type === 'users') {
      let userQuery = supabase
        .from('users')
        .select('*')

      if (query) {
        userQuery = userQuery.or(
          `name.ilike.%${query}%,email.ilike.%${query}%`
        )
      }

      const { data: users } = await userQuery.limit(20)
      results.users = users || []
    }

    return NextResponse.json({
      results,
      total: Object.values(results).reduce((sum, arr) => sum + arr.length, 0),
      query,
      filters
    })

  } catch (error: any) {
    console.error('Erreur de recherche:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
