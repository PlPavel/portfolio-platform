import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types'
import OnboardingProgress from './OnboardingProgress'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = user.user_metadata?.role as UserRole | undefined
  if (role === 'recruiter') redirect('/search')

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-xl mx-auto px-4 py-12 space-y-8">
        <OnboardingProgress />
        {children}
      </div>
    </div>
  )
}
