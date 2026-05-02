import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import DashboardCases from './DashboardCases'

export const metadata: Metadata = { title: 'Мои кейсы' }

export default async function DashboardPage() {
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

  if (!designer) redirect('/onboarding/step-1')

  const { data: cases } = await supabase
    .from('cases')
    .select('id, title, short_description, status, visibility, order_index, created_at, tags')
    .eq('designer_id', designer.id)
    .order('order_index')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Мои кейсы</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Управляйте своими проектами
          </p>
        </div>
        <Link href="/dashboard/cases/new" className={buttonVariants()}>
          + Новый кейс
        </Link>
      </div>

      <DashboardCases
        initialCases={cases ?? []}
        designerId={designer.id}
        username={designer.username}
      />
    </div>
  )
}
