
import { NextRequest, NextResponse } from 'next/server'
import { demandesService } from '@/lib/services/demandes-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, role, commentaire } = await request.json()
    const demande = await demandesService.approuverDemande(params.id, userId, role, commentaire)
    return NextResponse.json(demande)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { demandesService } from '@/lib/services/demandes-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId et role requis' }, { status: 400 })
    }

    const demande = await demandesService.approveDemande(params.id, userId, role)
    return NextResponse.json(demande)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
