import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Step2Form from './Step2Form'
import type { Skill } from '@/lib/types'

export default async function Step2Page() {
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

  const { data: skills } = await supabase
    .from('skills')
    .select('*')
    .order('category')
    .order('name')

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Ваши навыки</h1>
      <p className="text-muted-foreground">
        Выберите навыки — рекрутеры будут находить вас через них
      </p>
      <div className="pt-4">
        <Step2Form designerId={designer.id} skills={(skills ?? []) as Skill[]} />
      </div>
    </div>
  )
}
