'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CaseRow {
  id: string
  slug: string
  title: string
  short_description: string | null
  status: 'draft' | 'published'
  visibility: 'public' | 'private'
  order_index: number
  created_at: string
  tags: string[] | null
}

interface Props {
  initialCases: CaseRow[]
  designerId: string
  username: string
}

export default function DashboardCases({ initialCases, username }: Props) {
  const [cases, setCases] = useState<CaseRow[]>(initialCases)
  const [busy, setBusy] = useState<string | null>(null)

  const published = [...cases]
    .sort((a, b) => a.order_index - b.order_index)
    .filter((c) => c.status === 'published')
  const drafts = [...cases]
    .sort((a, b) => a.order_index - b.order_index)
    .filter((c) => c.status === 'draft')

  async function deleteCase(id: string) {
    if (!confirm('Удалить кейс? Это действие нельзя отменить.')) return
    setBusy(id)
    try {
      const res = await fetch(`/api/cases/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setCases((prev) => prev.filter((c) => c.id !== id))
    } finally {
      setBusy(null)
    }
  }

  async function toggleVisibility(c: CaseRow) {
    const next = c.visibility === 'public' ? 'private' : 'public'
    setBusy(c.id)
    try {
      const res = await fetch(`/api/cases/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: next }),
      })
      if (!res.ok) throw new Error('Update failed')
      setCases((prev) => prev.map((x) => (x.id === c.id ? { ...x, visibility: next } : x)))
    } finally {
      setBusy(null)
    }
  }

  async function moveCase(id: string, dir: 'up' | 'down') {
    const sorted = [...cases].sort((a, b) => a.order_index - b.order_index)
    const idx = sorted.findIndex((c) => c.id === id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const a = sorted[idx]
    const b = sorted[swapIdx]
    setBusy(id)
    try {
      await Promise.all([
        fetch(`/api/cases/${a.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_index: b.order_index }),
        }),
        fetch(`/api/cases/${b.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_index: a.order_index }),
        }),
      ])
      setCases((prev) =>
        prev.map((c) => {
          if (c.id === a.id) return { ...c, order_index: b.order_index }
          if (c.id === b.id) return { ...c, order_index: a.order_index }
          return c
        }),
      )
    } finally {
      setBusy(null)
    }
  }

  if (cases.length === 0) {
    return (
      <div className="border border-dashed rounded-xl p-12 text-center">
        <p className="text-muted-foreground mb-4">У вас ещё нет кейсов</p>
        <Link href="/dashboard/cases/new" className={buttonVariants()}>
          Создать первый кейс
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {published.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Опубликованные ({published.length})
          </h2>
          <div className="space-y-2">
            {published.map((c, i) => (
              <CaseCard
                key={c.id}
                caseItem={c}
                index={i}
                total={published.length}
                username={username}
                busy={busy}
                onDelete={deleteCase}
                onToggleVisibility={toggleVisibility}
                onMove={moveCase}
              />
            ))}
          </div>
        </section>
      )}

      {drafts.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Черновики ({drafts.length})
          </h2>
          <div className="space-y-2">
            {drafts.map((c, i) => (
              <CaseCard
                key={c.id}
                caseItem={c}
                index={i}
                total={drafts.length}
                username={username}
                busy={busy}
                onDelete={deleteCase}
                onToggleVisibility={toggleVisibility}
                onMove={moveCase}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

interface CaseCardProps {
  caseItem: CaseRow
  index: number
  total: number
  username: string
  busy: string | null
  onDelete: (id: string) => void
  onToggleVisibility: (c: CaseRow) => void
  onMove: (id: string, dir: 'up' | 'down') => void
}

function CaseCard({
  caseItem: c,
  index,
  total,
  username,
  busy,
  onDelete,
  onToggleVisibility,
  onMove,
}: CaseCardProps) {
  const isBusy = busy === c.id

  return (
    <div className="border rounded-lg px-4 py-3 flex items-center gap-4 bg-card">
      {/* Order controls */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          onClick={() => onMove(c.id, 'up')}
          disabled={index === 0 || isBusy}
          className="text-muted-foreground hover:text-foreground disabled:opacity-25 text-xs leading-none px-1"
          aria-label="Выше"
        >
          ▲
        </button>
        <button
          onClick={() => onMove(c.id, 'down')}
          disabled={index === total - 1 || isBusy}
          className="text-muted-foreground hover:text-foreground disabled:opacity-25 text-xs leading-none px-1"
          aria-label="Ниже"
        >
          ▼
        </button>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{c.title || 'Без названия'}</p>
        {c.short_description && (
          <p className="text-sm text-muted-foreground truncate">{c.short_description}</p>
        )}
      </div>

      {/* Badges */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <Badge variant={c.status === 'published' ? 'default' : 'secondary'}>
          {c.status === 'published' ? 'Опубликован' : 'Черновик'}
        </Badge>
        <Badge variant="outline">
          {c.visibility === 'public' ? '🌐 Публичный' : '🔒 Приватный'}
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {c.status === 'published' && c.visibility === 'public' && (
          <Link
            href={`/portfolio/${username}/cases/${c.slug}`}
            target="_blank"
            rel="noopener"
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            ↗
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleVisibility(c)}
          disabled={isBusy}
          title={c.visibility === 'public' ? 'Сделать приватным' : 'Сделать публичным'}
        >
          {c.visibility === 'public' ? '🌐' : '🔒'}
        </Button>
        <Link
          href={`/dashboard/cases/${c.id}/edit`}
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          Редактировать
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(c.id)}
          disabled={isBusy}
          className="text-destructive hover:text-destructive"
        >
          Удалить
        </Button>
      </div>
    </div>
  )
}
