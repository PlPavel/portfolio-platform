import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

interface Props {
  params: { id: string }
}

export async function GET(_request: Request, { params }: Props) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cases')
      .select('*, case_blocks(*)')
      .eq('id', params.id)
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify the case belongs to the current user
    const { data: designer } = await supabase
      .from('designers')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!designer) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()

    // Use service client to bypass potential RLS issues — ownership already verified above
    const service = createServiceClient()
    const { data, error } = await service
      .from('cases')
      .update(body)
      .eq('id', params.id)
      .eq('designer_id', designer.id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to update case' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: designer } = await supabase
      .from('designers')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!designer) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const service = createServiceClient()
    const { error } = await service
      .from('cases')
      .delete()
      .eq('id', params.id)
      .eq('designer_id', designer.id)
    if (error) throw error
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Failed to delete case' }, { status: 500 })
  }
}
