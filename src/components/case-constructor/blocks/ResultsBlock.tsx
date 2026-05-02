'use client'

import type { ResultsContent, Metric } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Props {
  content: ResultsContent
  onChange: (content: ResultsContent) => void
}

function emptyMetric(): Metric {
  return { label: '', before: '', after: '', improvement: '' }
}

export default function ResultsBlock({ content, onChange }: Props) {
  function set<K extends keyof ResultsContent>(key: K, value: ResultsContent[K]) {
    onChange({ ...content, [key]: value })
  }

  function addMetric() {
    set('metrics', [...content.metrics, emptyMetric()])
  }

  function updateMetric(i: number, key: keyof Metric, value: string) {
    const updated = content.metrics.map((m, idx) =>
      idx === i ? { ...m, [key]: value } : m,
    )
    set('metrics', updated)
  }

  function removeMetric(i: number) {
    set('metrics', content.metrics.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Результаты</h2>
        <p className="text-sm text-muted-foreground">
          Что изменилось после вашей работы
        </p>
      </div>

      {/* Metrics table */}
      <div className="space-y-3">
        <Label>Метрики</Label>
        {content.metrics.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground px-1">
              <span>Метрика</span>
              <span>До</span>
              <span>После</span>
              <span>Изменение</span>
            </div>
            {content.metrics.map((m, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 items-center">
                <Input
                  value={m.label}
                  onChange={(e) => updateMetric(i, 'label', e.target.value)}
                  placeholder="Конверсия"
                  className="text-sm"
                />
                <Input
                  value={m.before}
                  onChange={(e) => updateMetric(i, 'before', e.target.value)}
                  placeholder="2.1%"
                  className="text-sm"
                />
                <Input
                  value={m.after}
                  onChange={(e) => updateMetric(i, 'after', e.target.value)}
                  placeholder="3.8%"
                  className="text-sm"
                />
                <div className="flex gap-1">
                  <Input
                    value={m.improvement}
                    onChange={(e) => updateMetric(i, 'improvement', e.target.value)}
                    placeholder="+81%"
                    className="text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeMetric(i)}
                    className="text-muted-foreground hover:text-destructive px-1 shrink-0"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button type="button" variant="outline" size="sm" onClick={addMetric}>
          + Добавить метрику
        </Button>
      </div>

      <div className="space-y-2">
        <Label>
          Качественные результаты <span className="text-destructive">*</span>
        </Label>
        <Textarea
          value={content.qualitativeResults}
          onChange={(e) => set('qualitativeResults', e.target.value)}
          placeholder="Что изменилось с точки зрения пользователей и бизнеса?"
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label>Рефлексия</Label>
        <Textarea
          value={content.reflection ?? ''}
          onChange={(e) => set('reflection', e.target.value)}
          placeholder="Что бы сделали иначе? Чему научились?"
          rows={3}
        />
      </div>
    </div>
  )
}
