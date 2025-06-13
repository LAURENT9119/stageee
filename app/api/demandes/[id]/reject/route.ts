
import { NextRequest, NextResponse } from 'next/server'
import { demandesService } from '@/lib/services/demandes-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, role, commentaire } = await request.json()
    const demande = await demandesService.rejeterDemande(params.id, userId, role, commentaire)
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
    const { userId, role, motif } = body

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId et role requis' }, { status: 400 })
    }

    const demande = await demandesService.rejectDemande(params.id, userId, role, motif)
    return NextResponse.json(demande)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
