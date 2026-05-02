import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Step3Form from './Step3Form'

export default async function Step3Page() {
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

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Опыт работы</h1>
      <p className="text-muted-foreground">
        Добавьте места работы — это необязательно, но повышает доверие
      </p>
      <div className="pt-4">
        <Step3Form designerId={designer.id} />
      </div>
    </div>
  )
}
