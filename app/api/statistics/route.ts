
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
