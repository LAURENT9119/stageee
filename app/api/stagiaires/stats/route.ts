
import { NextResponse } from 'next/server'
import { stagiairesService } from '@/lib/services/stagiaires-service'

export async function GET() {
  try {
    const result = await stagiairesService.getStagiairesStats()
    if (result.success) {
      return NextResponse.json(result.data)
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
