import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type {
  BlockType,
  OverviewContent,
  ContextContent,
  ResearchContent,
  DesignContent,
  ResultsContent,
} from '@/lib/types'

export const revalidate = 60
export const dynamicParams = true

interface Props {
  params: { username: string; slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Кейс — @${params.username}` }
}

export default async function CasePublicPage({ params }: Props) {
  const supabase = createServiceClient()

  const { data: designer } = await supabase
    .from('designers')
    .select('id, name, username, avatar_url')
    .eq('username', params.username)
    .single()

  if (!designer) notFound()

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.slug)

  const query = supabase
    .from('cases')
    .select('*, case_blocks(*)')
    .eq('designer_id', designer.id)
    .eq('status', 'published')
    .eq('visibility', 'public')

  const { data: caseData } = await (isUUID
    ? query.eq('id', params.slug)
    : query.eq('slug', params.slug)
  ).single()

  if (!caseData) notFound()

  const blocksRaw: Array<{ block_type: string; content: Record<string, unknown>; order_index: number }> =
    (caseData.case_blocks ?? []).sort(
      (a: { order_index: number }, b: { order_index: number }) =>
        a.order_index - b.order_index,
    )

  function getBlock(type: BlockType) {
    return blocksRaw.find((b) => b.block_type === type)?.content ?? {}
  }

  const overview  = getBlock('overview')  as Partial<OverviewContent>
  const context   = getBlock('context')   as Partial<ContextContent>
  const research  = getBlock('research')  as Partial<ResearchContent>
  const design    = getBlock('design')    as Partial<DesignContent>
  const results   = getBlock('results')   as Partial<ResultsContent>

  return (
    <article className="max-w-2xl mx-auto px-4 py-12 space-y-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground flex items-center gap-2">
        <Link href={`/portfolio/${params.username}`} className="hover:text-foreground">
          {designer.name}
        </Link>
        <span>›</span>
        <span className="text-foreground">{caseData.title}</span>
      </nav>

      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-3xl font-bold">{caseData.title}</h1>
        {caseData.short_description && (
          <p className="text-lg text-muted-foreground">{caseData.short_description}</p>
        )}
        {caseData.tags && caseData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {caseData.tags.map((t: string) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
          </div>
        )}
        {caseData.cover_image_url && (
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <Image
              src={caseData.cover_image_url}
              alt={caseData.title}
              fill
              className="object-cover"
            />
          </div>
        )}
      </header>

      {/* Overview */}
      {overview.projectName && (
        <Section title="Обзор">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {overview.role && <Def label="Роль" value={overview.role} />}
            {overview.team && <Def label="Команда" value={overview.team} />}
            {overview.timeline && <Def label="Сроки" value={overview.timeline} />}
          </dl>
          {overview.shortDescription && (
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {overview.shortDescription}
            </p>
          )}
        </Section>
      )}

      {/* Context */}
      {(context.businessContext || context.problemStatement || context.goals) && (
        <Section title="Контекст">
          {context.businessContext && <Prose label="Бизнес-контекст" text={context.businessContext} />}
          {context.problemStatement && <Prose label="Проблема" text={context.problemStatement} />}
          {context.goals && <Prose label="Цели" text={context.goals} />}
        </Section>
      )}

      {/* Research */}
      {(research.methods?.length || research.keyInsights) && (
        <Section title="Исследование">
          {research.methods && research.methods.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Методы
              </p>
              <div className="flex flex-wrap gap-2">
                {research.methods.map((m) => (
                  <Badge key={m} variant="secondary">{m}</Badge>
                ))}
              </div>
            </div>
          )}
          {research.keyInsights && <Prose label="Ключевые инсайты" text={research.keyInsights} />}
          {research.personas && <Prose label="Аудитория" text={research.personas} />}
        </Section>
      )}

      {/* Design */}
      {(design.processDescription || design.imageUrls?.length) && (
        <Section title="Дизайн">
          {design.processDescription && (
            <Prose label="Процесс" text={design.processDescription} />
          )}
          {design.decisionJustification && (
            <Prose label="Обоснование решений" text={design.decisionJustification} />
          )}
          {design.iterations && <Prose label="Итерации" text={design.iterations} />}
          {design.imageUrls && design.imageUrls.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {design.imageUrls.map((url) => (
                <div key={url} className="relative aspect-video rounded-lg overflow-hidden border">
                  <Image src={url} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Results */}
      {(results.metrics?.length || results.qualitativeResults) && (
        <Section title="Результаты">
          {results.metrics && results.metrics.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Метрики
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {results.metrics.map((m, i) => (
                  <div key={i} className="border rounded-lg p-3 text-center space-y-1">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-lg font-bold text-primary">{m.improvement}</p>
                    <p className="text-xs text-muted-foreground">{m.before} → {m.after}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {results.qualitativeResults && (
            <Prose label="Итоги" text={results.qualitativeResults} />
          )}
          {results.reflection && <Prose label="Рефлексия" text={results.reflection} />}
        </Section>
      )}

      <Separator />
      <footer className="flex items-center gap-3">
        {designer.avatar_url && (
          <Image
            src={designer.avatar_url}
            alt={designer.name}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        )}
        <div>
          <p className="text-sm font-medium">{designer.name}</p>
          <Link
            href={`/portfolio/${params.username}`}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Все кейсы →
          </Link>
        </div>
      </footer>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Def({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function Prose({ label, text }: { label: string; text: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  )
}
