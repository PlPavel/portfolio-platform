'use client'

import type { ContextContent } from '@/lib/types'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  content: ContextContent
  onChange: (content: ContextContent) => void
}

export default function ContextBlock({ content, onChange }: Props) {
  function set<K extends keyof ContextContent>(key: K, value: string) {
    onChange({ ...content, [key]: value })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Контекст</h2>
        <p className="text-sm text-muted-foreground">
          Почему возник этот проект и какую проблему он решал
        </p>
      </div>

      <div className="space-y-2">
        <Label>Бизнес-контекст</Label>
        <Textarea
          value={content.businessContext}
          onChange={(e) => set('businessContext', e.target.value)}
          placeholder="Опишите ситуацию в бизнесе: рынок, конкуренты, цели компании"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>
          Постановка проблемы <span className="text-destructive">*</span>
        </Label>
        <Textarea
          value={content.problemStatement}
          onChange={(e) => set('problemStatement', e.target.value)}
          placeholder="Какую конкретную проблему нужно было решить?"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Цели проекта</Label>
        <Textarea
          value={content.goals}
          onChange={(e) => set('goals', e.target.value)}
          placeholder="Что должно было измениться в результате? Метрики успеха?"
          rows={3}
        />
      </div>
    </div>
  )
}
