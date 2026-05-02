'use client'

import { cn } from '@/lib/utils'
import type { BlockType } from '@/lib/types'

export const BLOCK_LABELS: Record<BlockType, string> = {
  overview: 'Обзор',
  context:  'Контекст',
  research: 'Исследование',
  design:   'Дизайн',
  results:  'Результаты',
}

interface Props {
  activeBlock: BlockType
  filledBlocks: Set<BlockType>
  onSelect: (block: BlockType) => void
  saveStatus: 'saved' | 'saving' | 'error'
}

const ORDER: BlockType[] = ['overview', 'context', 'research', 'design', 'results']

export default function BlockSidebar({
  activeBlock,
  filledBlocks,
  onSelect,
  saveStatus,
}: Props) {
  return (
    <aside className="w-44 shrink-0 flex flex-col gap-1">
      {ORDER.map((block) => {
        const filled = filledBlocks.has(block)
        const active = activeBlock === block
        return (
          <button
            key={block}
            onClick={() => onSelect(block)}
            className={cn(
              'text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between',
              active
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground',
              filled && !active && 'text-foreground font-medium',
            )}
          >
            <span>{BLOCK_LABELS[block]}</span>
            {filled && <span className="text-xs opacity-60">✓</span>}
          </button>
        )
      })}

      <div className="mt-auto pt-4 text-xs text-muted-foreground">
        {saveStatus === 'saving' && '💾 Сохранение...'}
        {saveStatus === 'saved'  && '✓ Сохранено'}
        {saveStatus === 'error'  && '⚠ Ошибка сохранения'}
      </div>
    </aside>
  )
}
