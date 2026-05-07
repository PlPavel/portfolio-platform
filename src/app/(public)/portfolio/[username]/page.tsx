import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const revalidate = 60
export const dynamicParams = true

interface Props {
  params: { username: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Портфолио @${params.username}` }
}

export default async function PublicPortfolioPage({ params }: Props) {
  const supabase = createServiceClient()

  const { data: designer } = await supabase
    .from('designers')
    .select(`
      *,
      designer_skills ( skill_id, skills ( id, name, category ) ),
      work_experience ( * )
    `)
    .eq('username', params.username)
    .single()

  if (!designer) notFound()

  const { data: cases } = await supabase
    .from('cases')
    .select('id, slug, title, short_description, cover_image_url, tags, order_index')
    .eq('designer_id', designer.id)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .order('order_index')

  const skills = (designer.designer_skills ?? []).map(
    (ds: { skills: { id: string; name: string; category: string } }) => ds.skills,
  )

  const experiences = [...(designer.work_experience ?? [])].sort(
    (a: { order_index: number }, b: { order_index: number }) =>
      a.order_index - b.order_index,
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">
      {/* Profile header */}
      <section className="flex items-start gap-6">
        {designer.avatar_url ? (
          <Image
            src={designer.avatar_url}
            alt={designer.name}
            width={96}
            height={96}
            className="rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-2xl shrink-0">
            {designer.name.charAt(0)}
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{designer.name}</h1>
            {designer.is_available && (
              <Badge variant="secondary" className="text-xs">
                Открыт к предложениям
              </Badge>
            )}
          </div>
          {designer.headline && (
            <p className="text-muted-foreground">{designer.headline}</p>
          )}
          {designer.location && (
            <p className="text-sm text-muted-foreground">📍 {designer.location}</p>
          )}
          <div className="flex gap-3 text-sm flex-wrap">
            {designer.email && (
              <a href={`mailto:${designer.email}`} className="text-muted-foreground hover:text-foreground">
                Email
              </a>
            )}
            {designer.telegram && (
              <a href={`https://t.me/${designer.telegram.replace('@', '')}`} target="_blank" rel="noopener" className="text-muted-foreground hover:text-foreground">
                Telegram
              </a>
            )}
            {designer.linkedin && (
              <a href={designer.linkedin} target="_blank" rel="noopener" className="text-muted-foreground hover:text-foreground">
                LinkedIn
              </a>
            )}
            {designer.behance && (
              <a href={designer.behance} target="_blank" rel="noopener" className="text-muted-foreground hover:text-foreground">
                Behance
              </a>
            )}
          </div>
        </div>
      </section>

      {designer.bio && (
        <section>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{designer.bio}</p>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Навыки</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((s: { id: string; name: string }) => (
              <Badge key={s.id} variant="outline">
                {s.name}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Work experience */}
      {experiences.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Опыт работы</h2>
          {experiences.map(
            (exp: {
              id: string
              company: string
              position: string
              start_date: string
              end_date: string | null
              description: string | null
            }) => (
              <div key={exp.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{exp.position}</p>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                  </div>
                  <p className="text-sm text-muted-foreground shrink-0">
                    {exp.start_date?.slice(0, 7)} —{' '}
                    {exp.end_date ? exp.end_date.slice(0, 7) : 'н.в.'}
                  </p>
                </div>
                {exp.description && (
                  <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>
                )}
              </div>
            ),
          )}
        </section>
      )}

      {/* Cases grid */}
      {cases && cases.length > 0 && (
        <section className="space-y-4">
          <Separator />
          <h2 className="text-lg font-semibold">Кейсы ({cases.length})</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {cases.map((c) => (
              <Link
                key={c.id}
                href={`/portfolio/${params.username}/cases/${c.slug}`}
                className="group border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {c.cover_image_url ? (
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <Image
                      src={c.cover_image_url}
                      alt={c.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Нет обложки</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold group-hover:underline">{c.title}</h3>
                  {c.short_description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {c.short_description}
                    </p>
                  )}
                  {c.tags && c.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
