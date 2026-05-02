import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'
import type { Skill } from '@/lib/types'

export const metadata: Metadata = { title: 'Редактирование профиля' }

export default async function ProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: designer } = await supabase
    .from('designers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!designer) redirect('/onboarding/step-1')

  const { data: allSkills } = await supabase
    .from('skills')
    .select('*')
    .order('category')
    .order('name')

  const { data: designerSkills } = await supabase
    .from('designer_skills')
    .select('skill_id')
    .eq('designer_id', designer.id)

  const { data: workExperience } = await supabase
    .from('work_experience')
    .select('*')
    .eq('designer_id', designer.id)
    .order('order_index')

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Профиль</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Информация видна всем на вашей публичной странице
        </p>
      </div>

      <ProfileForm
        designer={designer}
        allSkills={(allSkills ?? []) as Skill[]}
        selectedSkillIds={(designerSkills ?? []).map((s) => s.skill_id)}
        initialExperience={workExperience ?? []}
      />
    </div>
  )
}
