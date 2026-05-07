import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CaseConstructor from '@/components/case-constructor/CaseConstructor'
import type { BlockType } from '@/lib/types'

export const metadata: Metadata = { title: 'Редактор кейса' }

interface Props {
  params: { id: string }
}

export default async function EditCasePage({ params }: Props) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: designer } = await supabase
    .from('designers')
    .select('id, username')
    .eq('user_id', user.id)
    .single()
  if (!designer) redirect('/dashboard')

  const { data: caseData } = await supabase
    .from('cases')
    .select('*')
    .eq('id', params.id)
    .eq('designer_id', designer.id)
    .single()

  if (!caseData) redirect('/dashboard')

  const { data: blocks } = await supabase
    .from('case_blocks')
    .select('*')
    .eq('case_id', params.id)
    .order('order_index')

  // Ensure all 5 blocks exist
  const TYPES: BlockType[] = ['overview', 'context', 'research', 'design', 'results']
  const missing = TYPES.filter(
    (t) => !(blocks ?? []).some((b) => b.block_type === t),
  )
  if (missing.length > 0) {
    await supabase.from('case_blocks').insert(
      missing.map((t) => ({
        case_id: params.id,
        block_type: t,
        content: {},
        order_index: TYPES.indexOf(t),
      })),
    )
  }

  const { data: freshBlocks } = await supabase
    .from('case_blocks')
    .select('*')
    .eq('case_id', params.id)
    .order('order_index')

  return (
    <CaseConstructor
      caseId={params.id}
      initialTitle={caseData.title}
      initialStatus={caseData.status}
      initialVisibility={caseData.visibility}
      initialCoverImageUrl={caseData.cover_image_url ?? ''}
      initialBlocks={freshBlocks ?? []}
      username={designer.username}
    />
  )
}
