'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Skill } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import SkillChip from '@/components/shared/SkillChip'

const CATEGORY_LABELS: Record<Skill['category'], string> = {
  research: 'Исследования',
  design: 'Дизайн',
  tools: 'Инструменты',
  methods: 'Методы',
}

const CATEGORY_ORDER: Skill['category'][] = ['research', 'design', 'tools', 'methods']

interface Props {
  designerId: string
  skills: Skill[]
}

export default function Step2Form({ designerId, skills }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [customSkills, setCustomSkills] = useState<Skill[]>([])
  const [customInput, setCustomInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  const allSkills = [...skills, ...customSkills]

  const grouped = CATEGORY_ORDER
    .map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      skills: allSkills.filter((s) => s.category === cat),
    }))
    .filter((g) => g.skills.length > 0)

  async function handleAddCustom() {
    const name = customInput.trim()
    if (!name) return

    const existing = allSkills.find((s) => s.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      setSelected((prev) => { const n = new Set(prev); n.add(existing.id); return n })
      setCustomInput('')
      return
    }

    const supabase = createClient()
    const { data } = await supabase
      .from('skills')
      .upsert({ name, category: 'tools' }, { onConflict: 'name' })
      .select('id, name, category')
      .single()

    if (data) {
      setCustomSkills((prev) => [...prev, data as Skill])
      setSelected((prev) => { const n = new Set(prev); n.add(data.id); return n })
      setCustomInput('')
    }
  }

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      if (selected.size > 0) {
        const rows = Array.from(selected).map((skillId) => ({
          designer_id: designerId,
          skill_id: skillId,
        }))
        const { error: dbError } = await supabase.from('designer_skills').insert(rows)
        if (dbError) throw dbError
      }
      router.push('/onboarding/step-3')
      router.refresh()
    } catch {
      setError('Не удалось сохранить навыки. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
            {error}
          </p>
        )}

        {grouped.length > 0 ? (
          grouped.map((group, i) => (
            <div key={group.category}>
              {i > 0 && <Separator className="mb-6" />}
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <SkillChip
                    key={skill.id}
                    name={skill.name}
                    selected={selected.has(skill.id)}
                    onClick={() => toggle(skill.id)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Навыки не найдены — добавьте свои ниже
          </p>
        )}

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Свой навык
          </p>
          <div className="flex gap-2">
            <Input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleAddCustom() }
              }}
              placeholder="Название навыка..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddCustom}
              disabled={!customInput.trim()}
            >
              Добавить
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            {selected.size > 0
              ? `Выбрано: ${selected.size}`
              : 'Можно продолжить без навыков'}
          </span>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Сохранение...' : 'Далее →'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
