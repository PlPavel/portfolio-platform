import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function NewCasePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: designer } = await supabase
    .from('designers')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!designer) redirect('/onboarding/step-1')

  const slug = 'case-' + Date.now().toString(36)

  const { data: newCase, error } = await supabase
    .from('cases')
    .insert({
      designer_id: designer.id,
      title: 'Без названия',
      slug,
      status: 'draft',
      visibility: 'private',
      tags: [],
      order_index: 0,
    })
    .select('id')
    .single()

  if (error || !newCase) redirect('/dashboard')

  await supabase.from('case_blocks').insert([
    { case_id: newCase.id, block_type: 'overview', content: {}, order_index: 0 },
    { case_id: newCase.id, block_type: 'context',  content: {}, order_index: 1 },
    { case_id: newCase.id, block_type: 'research', content: {}, order_index: 2 },
    { case_id: newCase.id, block_type: 'design',   content: {}, order_index: 3 },
    { case_id: newCase.id, block_type: 'results',  content: {}, order_index: 4 },
  ])

  redirect(`/dashboard/cases/${newCase.id}/edit`)
}
