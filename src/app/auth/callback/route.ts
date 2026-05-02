import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=verification_failed`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user?.user_metadata?.role as UserRole | undefined

  if (role === 'recruiter') {
    return NextResponse.redirect(`${origin}/search`)
  }

  // Designer → onboarding (layout guard prevents re-entry if profile exists)
  return NextResponse.redirect(`${origin}/onboarding/step-1`)
}
