
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/services/server-auth-service'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const body = await request.json()
    const { id } = params

    const updatedEntity = {
      id,
      name: body.name,
      description: body.description || '',
      status: body.status || 'active',
      created_at: new Date().toISOString()
    }

    // En production, vous devriez mettre à jour dans une vraie table
    // const { data, error } = await supabase
    //   .from('test_entities')
    //   .update(updatedEntity)
    //   .eq('id', id)
    //   .select()
    //   .single()

    return NextResponse.json({ data: updatedEntity })
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'entité:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'entité' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id } = params

    // En production, vous devriez supprimer de la vraie table
    // const { error } = await supabase
    //   .from('test_entities')
    //   .delete()
    //   .eq('id', id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'entité:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'entité' },
      { status: 500 }
    )
  }
}
