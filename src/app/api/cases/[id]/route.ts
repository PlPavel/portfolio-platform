import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const body = await request.json()
    const { data, error } = await supabase
      .from('cases')
      .update(body)
      .eq('id', params.id)
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
    const { error } = await supabase.from('cases').delete().eq('id', params.id)
    if (error) throw error
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Failed to delete case' }, { status: 500 })
  }
}
