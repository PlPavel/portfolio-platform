'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import type { Skill } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
  allSkills: Skill[]
}

export default function SearchClient({ allSkills }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isFirst = useRef(true)

  const [query,     setQuery]     = useState(searchParams.get('q')        ?? '')
  const [location,  setLocation]  = useState(searchParams.get('location') ?? '')
  const [available, setAvailable] = useState(searchParams.get('available') === 'true')
  const [skills,    setSkills]    = useState<string[]>(
    searchParams.get('skills')?.split(',').filter(Boolean) ?? [],
  )

  const debouncedQuery    = useDebounce(query,    300)
  const debouncedLocation = useDebounce(location, 400)

  function buildUrl(overrides: Record<string, string | boolean | string[]> = {}) {
    const q     = (overrides.q        !== undefined ? overrides.q        : debouncedQuery)    as string
    const loc   = (overrides.location !== undefined ? overrides.location : debouncedLocation) as string
    const avail = (overrides.available !== undefined ? overrides.available : available)       as boolean
    const sk    = (overrides.skills   !== undefined ? overrides.skills   : skills)            as string[]

    const params = new URLSearchParams()
    if (q)         params.set('q',        q)
    if (loc)       params.set('location', loc)
    if (avail)     params.set('available','true')
    if (sk.length) params.set('skills',   sk.join(','))
    return `/search${params.size ? '?' + params.toString() : ''}`
  }

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    router.replace(buildUrl(), { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, debouncedLocation])

  function toggleSkill(id: string) {
    const next = skills.includes(id) ? skills.filter(s => s !== id) : [...skills, id]
    setSkills(next)
    router.replace(buildUrl({ skills: next }), { scroll: false })
  }

  function toggleAvailable(val: boolean) {
    setAvailable(val)
    router.replace(buildUrl({ available: val }), { scroll: false })
  }

  const grouped = CATEGORY_ORDER
    .map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      skills: allSkills.filter((s) => s.category === cat),
    }))
    .filter((g) => g.skills.length > 0)

  return (
    <aside className="w-64 shrink-0 space-y-5">
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Поиск
        </Label>
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Имя, должность, bio..."
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Город
        </Label>
        <Input
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Москва"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-sm">Открыт к предложениям</Label>
        <Switch checked={available} onCheckedChange={toggleAvailable} />
      </div>

      {grouped.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Навыки
            </Label>
            {grouped.map((group) => (
              <div key={group.category}>
                <p className="text-xs text-muted-foreground mb-2">{group.label}</p>
                <div className="flex flex-wrap gap-1">
                  {group.skills.map((skill) => (
                    <SkillChip
                      key={skill.id}
                      name={skill.name}
                      selected={skills.includes(skill.id)}
                      onClick={() => toggleSkill(skill.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {(query || location || available || skills.length > 0) && (
        <>
          <Separator />
          <button
            type="button"
            onClick={() => {
              setQuery(''); setLocation(''); setAvailable(false); setSkills([])
              router.replace('/search', { scroll: false })
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Сбросить фильтры
          </button>
        </>
      )}
    </aside>
  )
}
