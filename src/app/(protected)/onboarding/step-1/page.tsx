import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Step1Form from './Step1Form'

export default async function Step1Page() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // If profile already exists → onboarding complete, go to dashboard
  const { data: designer } = await supabase
    .from('designers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (designer) redirect('/dashboard')

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Расскажите о себе</h1>
      <p className="text-muted-foreground">
        Эта информация будет видна на вашей публичной странице
      </p>
      <div className="pt-4">
        <Step1Form userId={user.id} />
      </div>
    </div>
  )
}
