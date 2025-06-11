
import { NextRequest, NextResponse } from 'next/server'
import { stagiairesService } from '@/lib/services/stagiaires-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tuteurId = searchParams.get('tuteurId')
    const search = searchParams.get('search')
    const statut = searchParams.get('statut')
    const departement = searchParams.get('departement')

    if (search) {
      const stagiaires = await stagiairesService.searchStagiaires(search, {
        statut: statut || undefined,
        departement: departement || undefined,
        tuteurId: tuteurId || undefined
      })
      return NextResponse.json(stagiaires)
    }

    if (tuteurId) {
      const stagiaires = await stagiairesService.getStagiairesByTuteur(tuteurId)
      return NextResponse.json(stagiaires)
    }

    const stagiaires = await stagiairesService.getAllStagiaires()
    return NextResponse.json(stagiaires)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const stagiaireData = await request.json()
    const stagiaire = await stagiairesService.createStagiaire(stagiaireData)
    return NextResponse.json(stagiaire, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
