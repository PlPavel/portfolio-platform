'use client'

import { useState, KeyboardEvent } from 'react'
import type { OverviewContent } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface Props {
  content: OverviewContent
  onChange: (content: OverviewContent) => void
}

export default function OverviewBlock({ content, onChange }: Props) {
  const [tagInput, setTagInput] = useState('')

  function set<K extends keyof OverviewContent>(key: K, value: OverviewContent[K]) {
    onChange({ ...content, [key]: value })
  }

  function addTag(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter' && e.key !== ',') return
    e.preventDefault()
    const tag = tagInput.trim()
    if (tag && !content.tags.includes(tag)) {
      set('tags', [...content.tags, tag])
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    set('tags', content.tags.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Обзор проекта</h2>
        <p className="text-sm text-muted-foreground">
          Краткое введение — кто, что и зачем
        </p>
      </div>

      <div className="space-y-2">
        <Label>
          Название проекта <span className="text-destructive">*</span>
        </Label>
        <Input
          value={content.projectName}
          onChange={(e) => set('projectName', e.target.value)}
          placeholder="Редизайн главной страницы"
        />
      </div>

      <div className="space-y-2">
        <Label>Краткое описание</Label>
        <Textarea
          value={content.shortDescription}
          onChange={(e) => set('shortDescription', e.target.value)}
          placeholder="Опишите суть проекта в 1–2 предложениях"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ваша роль</Label>
          <Input
            value={content.role}
            onChange={(e) => set('role', e.target.value)}
            placeholder="Lead Product Designer"
          />
        </div>
        <div className="space-y-2">
          <Label>Команда</Label>
          <Input
            value={content.team}
            onChange={(e) => set('team', e.target.value)}
            placeholder="2 дизайнера, 1 PM, 3 разработчика"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Сроки</Label>
        <Input
          value={content.timeline}
          onChange={(e) => set('timeline', e.target.value)}
          placeholder="3 месяца, март–май 2024"
        />
      </div>

      <div className="space-y-2">
        <Label>Теги</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {content.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-muted-foreground hover:text-foreground"
                aria-label="Удалить тег"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={addTag}
          placeholder="Введите тег и нажмите Enter"
        />
        <p className="text-xs text-muted-foreground">
          Enter или запятая — добавить тег
        </p>
      </div>
    </div>
  )
}
