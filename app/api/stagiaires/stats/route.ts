
import { NextResponse } from 'next/server'
import { stagiairesService } from '@/lib/services/stagiaires-service'

export async function GET() {
  try {
    const stats = await stagiairesService.getStagiairesStats()
    return NextResponse.json(stats)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
