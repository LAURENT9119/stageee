
import { NextRequest, NextResponse } from 'next/server'
import { statisticsService } from '@/lib/services/statistics-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    switch (type) {
      case 'stagiaires-by-month':
        const stagiairesByMonth = await statisticsService.getStagiairesByMonth()
        return NextResponse.json(stagiairesByMonth)
      
      case 'demandes-by-type':
        const demandesByType = await statisticsService.getDemandesByType()
        return NextResponse.json(demandesByType)
      
      case 'taux-acceptation':
        const tauxAcceptation = await statisticsService.getTauxAcceptation()
        return NextResponse.json(tauxAcceptation)
      
      case 'stagiaires-by-departement':
        const stagiairesByDept = await statisticsService.getStagiairesByDepartement()
        return NextResponse.json(stagiairesByDept)
      
      case 'global':
        const globalStats = await statisticsService.getGlobalStats()
        return NextResponse.json(globalStats)
      
      default:
        return NextResponse.json({ error: 'Type de statistique non supporté' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/services/server-auth-service''

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '2025'

    // Récupérer les statistiques générales
    const { data: stagiaires } = await supabase
      .from('stagiaires')
      .select('*')
      .gte('created_at', `${period}-01-01`)
      .lt('created_at', `${parseInt(period) + 1}-01-01`)

    const { data: demandes } = await supabase
      .from('demandes')
      .select('*')
      .gte('created_at', `${period}-01-01`)
      .lt('created_at', `${parseInt(period) + 1}-01-01`)

    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .gte('created_at', `${period}-01-01`)
      .lt('created_at', `${parseInt(period) + 1}-01-01`)

    const { data: users } = await supabase
      .from('users')
      .select('*')
      .gte('created_at', `${period}-01-01`)
      .lt('created_at', `${parseInt(period) + 1}-01-01`)

    // Calculs des statistiques
    const stats = {
      total_stagiaires: stagiaires?.length || 0,
      total_demandes: demandes?.length || 0,
      total_documents: documents?.length || 0,
      total_users: users?.length || 0,
      demandes_en_attente: demandes?.filter(d => d.statut === 'En attente').length || 0,
      demandes_validees: demandes?.filter(d => d.statut === 'Validé').length || 0,
      demandes_rejetees: demandes?.filter(d => d.statut === 'Rejeté').length || 0,
      stagiaires_actifs: stagiaires?.filter(s => s.statut === 'actif').length || 0,
      stagiaires_inactifs: stagiaires?.filter(s => s.statut === 'inactif').length || 0,
      taux_validation: demandes?.length > 0 ? 
        Math.round((demandes.filter(d => d.statut === 'Validé').length / demandes.length) * 100) : 0,
      evolution_mensuelle: {
        stagiaires: stagiaires?.length || 0,
        demandes: demandes?.length || 0,
        documents: documents?.length || 0
      }
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
