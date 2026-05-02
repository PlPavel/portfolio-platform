'use client'

import { cn } from '@/lib/utils'

interface Props {
  name: string
  selected: boolean
  onClick: () => void
}

export default function SkillChip({ name, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-sm leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background hover:bg-muted',
      )}
    >
      {name}
    </button>
  )
}
