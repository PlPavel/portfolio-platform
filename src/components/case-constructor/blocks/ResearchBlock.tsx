'use client'

import { useState, KeyboardEvent } from 'react'
import type { ResearchContent } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface Props {
  content: ResearchContent
  onChange: (content: ResearchContent) => void
}

export default function ResearchBlock({ content, onChange }: Props) {
  const [methodInput, setMethodInput] = useState('')

  function set<K extends keyof ResearchContent>(key: K, value: ResearchContent[K]) {
    onChange({ ...content, [key]: value })
  }

  function addMethod(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter' && e.key !== ',') return
    e.preventDefault()
    const m = methodInput.trim()
    if (m && !content.methods.includes(m)) {
      set('methods', [...content.methods, m])
    }
    setMethodInput('')
  }

  function removeMethod(m: string) {
    set('methods', content.methods.filter((x) => x !== m))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Исследование</h2>
        <p className="text-sm text-muted-foreground">
          Как вы изучали проблему и что узнали
        </p>
      </div>

      <div className="space-y-2">
        <Label>Методы исследования</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {content.methods.map((m) => (
            <Badge key={m} variant="secondary" className="gap-1">
              {m}
              <button
                type="button"
                onClick={() => removeMethod(m)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <Input
          value={methodInput}
          onChange={(e) => setMethodInput(e.target.value)}
          onKeyDown={addMethod}
          placeholder="Пользовательские интервью — Enter"
        />
        <p className="text-xs text-muted-foreground">
          Enter — добавить метод
        </p>
      </div>

      <div className="space-y-2">
        <Label>Ключевые инсайты</Label>
        <Textarea
          value={content.keyInsights}
          onChange={(e) => set('keyInsights', e.target.value)}
          placeholder="Что вы узнали? Какие паттерны выявили?"
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label>Персоны / аудитория</Label>
        <Textarea
          value={content.personas ?? ''}
          onChange={(e) => set('personas', e.target.value)}
          placeholder="Опишите целевых пользователей"
          rows={3}
        />
      </div>
    </div>
  )
}
