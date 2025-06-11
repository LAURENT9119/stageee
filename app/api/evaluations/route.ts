
import { NextRequest, NextResponse } from 'next/server'
import { evaluationsService } from '@/lib/services/evaluations-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      stagiaireId: searchParams.get('stagiaireId') || undefined,
      tuteurId: searchParams.get('tuteurId') || undefined,
    }

    const evaluations = await evaluationsService.getAll(filters)
    return NextResponse.json(evaluations)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { evaluation, competences } = await request.json()
    const newEvaluation = await evaluationsService.create(evaluation, competences)
    return NextResponse.json(newEvaluation, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
