import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Skill } from '@/lib/types'
import DesignerCard from '@/components/search/DesignerCard'
import SearchClient from './SearchClient'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Поиск дизайнеров' }

const PAGE_SIZE = 20

interface SearchParams {
  q?: string
  skills?: string
  location?: string
  available?: string
  page?: string
}

interface Props {
  searchParams: SearchParams
}

export default async function SearchPage({ searchParams }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: allSkills } = await supabase
    .from('skills')
    .select('*')
    .order('category')
    .order('name')

  const q         = searchParams.q?.trim()        ?? ''
  const location  = searchParams.location?.trim() ?? ''
  const available = searchParams.available === 'true'
  const skillIds  = searchParams.skills?.split(',').filter(Boolean) ?? []
  const page      = Math.max(1, Number(searchParams.page ?? 1))
  const offset    = (page - 1) * PAGE_SIZE

  // Skills filter: get designer IDs that have at least one selected skill
  let skillFilterIds: string[] | null = null
  if (skillIds.length > 0) {
    const { data: ds } = await supabase
      .from('designer_skills')
      .select('designer_id')
      .in('skill_id', skillIds)
    const seen = new Set<string>()
    skillFilterIds = (ds ?? []).map(d => d.designer_id).filter(id => {
      if (seen.has(id)) return false
      seen.add(id)
      return true
    })
  }

  let query = supabase
    .from('designers')
    .select(
      'id, username, name, headline, location, avatar_url, is_available, designer_skills(skills(id, name)), cases(id)',
      { count: 'exact' },
    )
    .range(offset, offset + PAGE_SIZE - 1)

  if (q)               query = query.textSearch('fts', q, { type: 'plain' })
  if (location)        query = query.ilike('location', `%${location}%`)
  if (available)       query = query.eq('is_available', true)
  if (skillFilterIds)  query = query.in('id', skillFilterIds.length > 0 ? skillFilterIds : [''])

  const { data: designers, count } = await query

  const total = count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-sm">Portfolio Platform</Link>
          <span className="text-sm text-muted-foreground">Поиск дизайнеров</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 flex gap-8">
        <Suspense>
          <SearchClient allSkills={(allSkills ?? []) as Skill[]} />
        </Suspense>

        <main className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total > 0
                ? `Найдено: ${total} ${total === 1 ? 'дизайнер' : total < 5 ? 'дизайнера' : 'дизайнеров'}`
                : 'Никого не найдено'}
            </p>
          </div>

          {designers && designers.length > 0 ? (
            <div className="grid gap-3">
              {designers.map((d) => (
                <DesignerCard key={d.id} designer={d as unknown as Parameters<typeof DesignerCard>[0]['designer']} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed rounded-xl p-12 text-center">
              <p className="text-muted-foreground">
                По выбранным фильтрам никто не найден
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {page > 1 && (
                <Link
                  href={`/search?${buildParams(searchParams, page - 1)}`}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  ← Назад
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/search?${buildParams(searchParams, page + 1)}`}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  Далее →
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function buildParams(sp: SearchParams, page: number) {
  const p = new URLSearchParams()
  if (sp.q)        p.set('q',        sp.q)
  if (sp.location) p.set('location', sp.location)
  if (sp.available)p.set('available',sp.available)
  if (sp.skills)   p.set('skills',   sp.skills)
  p.set('page', String(page))
  return p.toString()
}
