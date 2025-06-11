
import { NextRequest, NextResponse } from 'next/server'
import { stagiairesService } from '@/lib/services/stagiaires-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stagiaire = await stagiairesService.getStagiaireById(params.id)
    if (!stagiaire) {
      return NextResponse.json({ error: 'Stagiaire non trouvé' }, { status: 404 })
    }
    return NextResponse.json(stagiaire)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    const stagiaire = await stagiairesService.updateStagiaire(params.id, updates)
    return NextResponse.json(stagiaire)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await stagiairesService.deleteStagiaire(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
