
import { NextRequest, NextResponse } from 'next/server'
import { stagiairesService } from '@/lib/services/stagiaires-service'
import { demandesService } from '@/lib/services/demandes-service'
import { documentsService } from '@/lib/services/documents-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    
    let data: any[] = []
    let filename = ''

    switch (params.type) {
      case 'stagiaires':
        data = await stagiairesService.getAllStagiaires()
        filename = 'stagiaires'
        break
      case 'demandes':
        data = await demandesService.getAllDemandes()
        filename = 'demandes'
        break
      case 'documents':
        data = await documentsService.getAllDocuments()
        filename = 'documents'
        break
      default:
        return NextResponse.json({ error: 'Type d\'export non supporté' }, { status: 400 })
    }

    if (format === 'csv') {
      const csv = convertToCSV(data)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        return typeof value === 'string' ? `"${value}"` : value
      }).join(',')
    )
  ].join('\n')
  
  return csvContent
}
import { NextRequest, NextResponse } from 'next/server'
import { stagiairesService } from '@/lib/services/stagiaires-service'
import { demandesService } from '@/lib/services/demandes-service'
import { documentsService } from '@/lib/services/documents-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const type = params.type

    let data: any[] = []
    
    // Récupérer les données selon le type
    switch (type) {
      case 'stagiaires':
        data = await stagiairesService.getAllStagiaires()
        break
      case 'demandes':
        data = await demandesService.getAllDemandes()
        break
      case 'documents':
        data = await documentsService.getAllDocuments()
        break
      default:
        return NextResponse.json({ error: 'Type non supporté' }, { status: 400 })
    }

    if (format === 'csv') {
      // Générer CSV
      const csv = generateCSV(data, type)
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type}_export.csv"`,
        },
      })
    } else if (format === 'pdf') {
      // Pour le PDF, retourner une réponse simple pour l'instant
      return new Response('PDF export not implemented yet', {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${type}_export.pdf"`,
        },
      })
    }

    return NextResponse.json({ error: 'Format non supporté' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function generateCSV(data: any[], type: string): string {
  if (!data.length) return ''

  // Définir les colonnes selon le type
  let headers: string[] = []
  
  switch (type) {
    case 'stagiaires':
      headers = ['ID', 'Nom', 'Prénom', 'Email', 'École', 'Département', 'Statut']
      break
    case 'demandes':
      headers = ['ID', 'Type', 'Statut', 'Date de création', 'Stagiaire']
      break
    case 'documents':
      headers = ['ID', 'Nom', 'Type', 'Taille', 'Date de création']
      break
  }

  // Créer le CSV
  const csvContent = [
    headers.join(','),
    ...data.map(row => {
      switch (type) {
        case 'stagiaires':
          return [
            row.id,
            row.nom || '',
            row.prenom || '',
            row.email || '',
            row.ecole || '',
            row.departement || '',
            row.statut || ''
          ].map(field => `"${field}"`).join(',')
        case 'demandes':
          return [
            row.id,
            row.type || '',
            row.statut || '',
            row.created_at || '',
            row.stagiaire?.nom || ''
          ].map(field => `"${field}"`).join(',')
        case 'documents':
          return [
            row.id,
            row.nom || '',
            row.type || '',
            row.taille || '',
            row.created_at || ''
          ].map(field => `"${field}"`).join(',')
        default:
          return ''
      }
    })
  ].join('\n')

  return csvContent
}
