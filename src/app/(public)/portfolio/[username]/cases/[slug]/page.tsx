import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import CaseView from '@/components/case-constructor/CaseView'

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

  const blocks: Array<{ block_type: string; content: Record<string, unknown>; order_index: number }> =
    caseData.case_blocks ?? []

  return (
    <CaseView
      caseData={caseData}
      blocks={blocks}
      designer={designer}
    />
  )
}
