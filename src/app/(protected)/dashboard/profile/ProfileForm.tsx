'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Skill } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import SkillChip from '@/components/shared/SkillChip'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DesignerRow {
  id: string
  name: string
  username: string
  headline: string | null
  bio: string | null
  location: string | null
  email: string | null
  telegram: string | null
  linkedin: string | null
  behance: string | null
  avatar_url: string | null
  is_available: boolean
}

interface ExperienceRow {
  id: string
  company: string
  position: string
  start_date: string
  end_date: string | null
  description: string | null
  order_index: number
}

interface ExperienceEntry {
  id?: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
}

const CATEGORY_LABELS: Record<Skill['category'], string> = {
  research: 'Исследования',
  design: 'Дизайн',
  tools: 'Инструменты',
  methods: 'Методы',
}

interface Props {
  designer: DesignerRow
  allSkills: Skill[]
  selectedSkillIds: string[]
  initialExperience: ExperienceRow[]
}

export default function ProfileForm({
  designer,
  allSkills,
  selectedSkillIds,
  initialExperience,
}: Props) {
  const router = useRouter()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Basic info
  const [name, setName] = useState(designer.name)
  const [headline, setHeadline] = useState(designer.headline ?? '')
  const [bio, setBio] = useState(designer.bio ?? '')
  const [location, setLocation] = useState(designer.location ?? '')
  const [email, setEmail] = useState(designer.email ?? '')
  const [telegram, setTelegram] = useState(designer.telegram ?? '')
  const [linkedin, setLinkedin] = useState(designer.linkedin ?? '')
  const [behance, setBehance] = useState(designer.behance ?? '')
  const [avatarUrl, setAvatarUrl] = useState(designer.avatar_url ?? '')
  const [isAvailable, setIsAvailable] = useState(designer.is_available)

  // Skills
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedSkillIds))

  // Work experience
  const [experiences, setExperiences] = useState<ExperienceEntry[]>(
    initialExperience.map((e) => ({
      id: e.id,
      company: e.company,
      position: e.position,
      startDate: e.start_date,
      endDate: e.end_date ?? '',
      description: e.description ?? '',
    })),
  )

  function toggleSkill(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function addExperience() {
    setExperiences((prev) => [
      ...prev,
      { company: '', position: '', startDate: '', endDate: '', description: '' },
    ])
  }

  function updateExp(i: number, key: keyof ExperienceEntry, value: string) {
    setExperiences((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)),
    )
  }

  function removeExp(i: number) {
    setExperiences((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    setError(null)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `avatars/${designer.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('case-images')
        .upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('case-images').getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
    } catch {
      setError('Не удалось загрузить аватар. Попробуйте ещё раз.')
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Имя обязательно')
      return
    }
    setError(null)
    setSaving(true)
    try {
      const supabase = createClient()

      await supabase
        .from('designers')
        .update({
          name: name.trim(),
          headline: headline.trim() || null,
          bio: bio.trim() || null,
          location: location.trim() || null,
          email: email.trim() || null,
          telegram: telegram.trim() || null,
          linkedin: linkedin.trim() || null,
          behance: behance.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          is_available: isAvailable,
        })
        .eq('id', designer.id)

      // Skills: delete all + insert selected
      await supabase.from('designer_skills').delete().eq('designer_id', designer.id)
      if (selected.size > 0) {
        await supabase.from('designer_skills').insert(
          Array.from(selected).map((skillId) => ({
            designer_id: designer.id,
            skill_id: skillId,
          })),
        )
      }

      // Work experience: delete all + insert
      await supabase.from('work_experience').delete().eq('designer_id', designer.id)
      const valid = experiences.filter(
        (e) => e.company.trim() && e.position.trim() && e.startDate,
      )
      if (valid.length > 0) {
        await supabase.from('work_experience').insert(
          valid.map((e, i) => ({
            designer_id: designer.id,
            company: e.company.trim(),
            position: e.position.trim(),
            start_date: e.startDate,
            end_date: e.endDate || null,
            description: e.description.trim() || null,
            order_index: i,
          })),
        )
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } catch {
      setError('Не удалось сохранить. Попробуйте ещё раз.')
    } finally {
      setSaving(false)
    }
  }

  const grouped = (
    ['research', 'design', 'tools', 'methods'] as Skill['category'][]
  )
    .map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      skills: allSkills.filter((s) => s.category === cat),
    }))
    .filter((g) => g.skills.length > 0)

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Имя *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Должность</Label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Product Designer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>О себе</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Расскажите о своём опыте и подходе к работе"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Город</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Москва"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Telegram</Label>
              <Input
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username"
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/..."
              />
            </div>
            <div className="space-y-2">
              <Label>Behance</Label>
              <Input
                value={behance}
                onChange={(e) => setBehance(e.target.value)}
                placeholder="behance.net/..."
              />
            </div>
          </div>

          {/* Avatar upload */}
          <div className="space-y-2">
            <Label>Аватар</Label>
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <div className="relative w-16 h-16 rounded-full overflow-hidden border shrink-0">
                  <Image src={avatarUrl} alt="Аватар" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-medium shrink-0">
                  {name.charAt(0) || '?'}
                </div>
              )}
              <div className="flex-1 space-y-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? 'Загрузка...' : 'Загрузить фото'}
                </Button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="ml-2 text-xs text-muted-foreground hover:text-destructive"
                  >
                    Удалить
                  </button>
                )}
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP — до 5 МБ</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Открыт к предложениям</p>
              <p className="text-xs text-muted-foreground">
                Рекрутеры увидят значок доступности
              </p>
            </div>
            <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Навыки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {grouped.length === 0 && (
            <p className="text-sm text-muted-foreground">Навыки не найдены</p>
          )}
          {grouped.map((group, i) => (
            <div key={group.category}>
              {i > 0 && <Separator className="mb-5" />}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <SkillChip
                    key={skill.id}
                    name={skill.name}
                    selected={selected.has(skill.id)}
                    onClick={() => toggleSkill(skill.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Work experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Опыт работы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {experiences.map((exp, i) => (
            <div key={i} className="space-y-3 pb-4 border-b last:border-0 last:pb-0">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Место {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeExp(i)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Удалить
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Компания</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExp(i, 'company', e.target.value)}
                    placeholder="Яндекс"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Должность</Label>
                  <Input
                    value={exp.position}
                    onChange={(e) => updateExp(i, 'position', e.target.value)}
                    placeholder="Product Designer"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Начало</Label>
                  <Input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => updateExp(i, 'startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Конец (пусто = сейчас)</Label>
                  <Input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) => updateExp(i, 'endDate', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Описание</Label>
                <Input
                  value={exp.description}
                  onChange={(e) => updateExp(i, 'description', e.target.value)}
                  placeholder="Чем занимались"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addExperience}
            className="w-full py-2 border border-dashed rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            + Добавить место работы
          </button>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="min-w-24">
          {saving ? 'Сохранение...' : 'Сохранить'}
        </Button>
        {saved && <span className="text-sm text-muted-foreground">Изменения сохранены ✓</span>}
      </div>
    </div>
  )
}
