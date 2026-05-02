'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ExperienceEntry {
  company: string
  position: string
  startDate: string
  endDate: string      // empty string means current job
  description: string
}

function emptyEntry(): ExperienceEntry {
  return { company: '', position: '', startDate: '', endDate: '', description: '' }
}

interface Props {
  designerId: string
}

export default function Step3Form({ designerId }: Props) {
  const router = useRouter()
  const [entries, setEntries] = useState<ExperienceEntry[]>([emptyEntry()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateEntry(index: number, key: keyof ExperienceEntry, value: string) {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [key]: value } : e))
    )
  }

  function addEntry() {
    setEntries((prev) => [...prev, emptyEntry()])
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSkip() {
    router.push('/dashboard')
    router.refresh()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const filled = entries.filter((e) => e.company.trim() && e.position.trim() && e.startDate)
    if (filled.length === 0) {
      await handleSkip()
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const rows = filled.map((e, i) => ({
        designer_id: designerId,
        company: e.company.trim(),
        position: e.position.trim(),
        start_date: e.startDate,
        end_date: e.endDate || null,
        description: e.description.trim() || null,
        order_index: i,
      }))

      const { error: dbError } = await supabase
        .from('work_experience')
        .insert(rows)

      if (dbError) throw dbError

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Не удалось сохранить опыт. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      {entries.map((entry, i) => (
        <Card key={i}>
          <CardContent className="pt-6 space-y-4">
            {entries.length > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Место работы {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeEntry(i)}
                  className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  Удалить
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`company-${i}`}>
                  Компания <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`company-${i}`}
                  value={entry.company}
                  onChange={(e) => updateEntry(i, 'company', e.target.value)}
                  placeholder="Яндекс"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`position-${i}`}>
                  Должность <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`position-${i}`}
                  value={entry.position}
                  onChange={(e) => updateEntry(i, 'position', e.target.value)}
                  placeholder="Product Designer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`start-${i}`}>
                  Начало <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`start-${i}`}
                  type="month"
                  value={entry.startDate}
                  onChange={(e) => updateEntry(i, 'startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`end-${i}`}>Конец</Label>
                <Input
                  id={`end-${i}`}
                  type="month"
                  value={entry.endDate}
                  onChange={(e) => updateEntry(i, 'endDate', e.target.value)}
                  placeholder="Текущее место"
                />
                {!entry.endDate && entry.startDate && (
                  <p className="text-xs text-muted-foreground">Текущее место работы</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`desc-${i}`}>Описание</Label>
              <Input
                id={`desc-${i}`}
                value={entry.description}
                onChange={(e) => updateEntry(i, 'description', e.target.value)}
                placeholder="Чем занимались, каков результат"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="w-full py-3 border border-dashed rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
      >
        + Добавить ещё одно место работы
      </button>

      <Separator />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleSkip}
          disabled={loading}
        >
          Пропустить
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Сохранение...' : 'Завершить →'}
        </Button>
      </div>
    </form>
  )
}
