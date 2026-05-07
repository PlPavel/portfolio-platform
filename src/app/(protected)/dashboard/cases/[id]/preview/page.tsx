import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import CaseView from '@/components/case-constructor/CaseView'

interface Props {
  params: { id: string }
}

export default async function PreviewPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: designer } = await supabase
    .from('designers')
    .select('id, name, username, avatar_url')
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
    .select('block_type, content, order_index')
    .eq('case_id', params.id)
    .order('order_index')

  return (
    <div className="min-h-screen bg-background">
      {/* Preview banner */}
      <div className="sticky top-0 z-50 bg-amber-50 border-b border-amber-200">
        <div className="max-w-5xl mx-auto px-4 h-11 flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800 font-medium">
            Предпросмотр — так выглядит кейс для рекрутеров
          </p>
          <Link
            href={`/dashboard/cases/${params.id}/edit`}
            className={buttonVariants({ size: 'sm', variant: 'outline' })}
          >
            ← Вернуться к редактору
          </Link>
        </div>
      </div>

      <CaseView
        caseData={caseData}
        blocks={blocks ?? []}
        designer={designer}
      />
    </div>
  )
}
