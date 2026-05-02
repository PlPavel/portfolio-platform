import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') ?? ''
    const location = searchParams.get('location') ?? ''
    const page = Number(searchParams.get('page') ?? 1)
    const limit = 20
    const offset = (page - 1) * limit

    let dbQuery = supabase
      .from('designers')
      .select('*, designer_skills(skill_id, skills(*))', { count: 'exact' })
      .range(offset, offset + limit - 1)

    if (query) {
      dbQuery = dbQuery.textSearch('fts', query)
    }
    if (location) {
      dbQuery = dbQuery.eq('location', location)
    }

    const { data, error, count } = await dbQuery
    if (error) throw error
    return NextResponse.json({ data, total: count })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch designers' }, { status: 500 })
  }
}
