'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAutoSave } from '@/hooks/useAutoSave'
import { cn } from '@/lib/utils'
import type {
  BlockType,
  OverviewContent,
  ContextContent,
  ResearchContent,
  DesignContent,
  ResultsContent,
} from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BlockSidebar from './BlockSidebar'
import OverviewBlock  from './blocks/OverviewBlock'
import ContextBlock   from './blocks/ContextBlock'
import ResearchBlock  from './blocks/ResearchBlock'
import DesignBlock    from './blocks/DesignBlock'
import ResultsBlock   from './blocks/ResultsBlock'
import { buttonVariants } from '@/components/ui/button'

interface RawBlock {
  id: string
  block_type: string
  content: Record<string, unknown>
  order_index: number
}

interface Props {
  caseId: string
  initialTitle: string
  initialStatus: string
  initialVisibility: string
  initialCoverImageUrl: string
  initialBlocks: RawBlock[]
  username: string
}

interface EditorState {
  title: string
  overview: OverviewContent
  context: ContextContent
  research: ResearchContent
  design: DesignContent
  results: ResultsContent
}

function initOverview(c: Record<string, unknown>): OverviewContent {
  return {
    projectName:      String(c.projectName      ?? ''),
    shortDescription: String(c.shortDescription ?? ''),
    role:             String(c.role             ?? ''),
    team:             String(c.team             ?? ''),
    timeline:         String(c.timeline         ?? ''),
    tags:             Array.isArray(c.tags) ? (c.tags as string[]) : [],
  }
}
function initContext(c: Record<string, unknown>): ContextContent {
  return {
    businessContext:   String(c.businessContext   ?? ''),
    problemStatement:  String(c.problemStatement  ?? ''),
    goals:             String(c.goals             ?? ''),
  }
}
function initResearch(c: Record<string, unknown>): ResearchContent {
  return {
    methods:     Array.isArray(c.methods) ? (c.methods as string[]) : [],
    keyInsights: String(c.keyInsights ?? ''),
    personas:    String(c.personas    ?? ''),
  }
}
function initDesign(c: Record<string, unknown>): DesignContent {
  return {
    processDescription:     String(c.processDescription     ?? ''),
    decisionJustification:  String(c.decisionJustification  ?? ''),
    iterations:             String(c.iterations             ?? ''),
    imageUrls:              Array.isArray(c.imageUrls) ? (c.imageUrls as string[]) : [],
  }
}
function initResults(c: Record<string, unknown>): ResultsContent {
  return {
    metrics: Array.isArray(c.metrics)
      ? (c.metrics as ResultsContent['metrics'])
      : [],
    qualitativeResults: String(c.qualitativeResults ?? ''),
    reflection:         String(c.reflection         ?? ''),
  }
}

function isFilled(content: Record<string, unknown>): boolean {
  return Object.values(content).some((v) =>
    Array.isArray(v) ? v.length > 0 : String(v ?? '').trim().length > 0,
  )
}

export default function CaseConstructor({
  caseId,
  initialTitle,
  initialStatus,
  initialVisibility,
  initialCoverImageUrl,
  initialBlocks,
  username,
}: Props) {
  const router = useRouter()

  const blockIdsRef = useRef<Record<BlockType, string | null>>({
    overview: null, context: null, research: null, design: null, results: null,
  })
  initialBlocks.forEach((b) => {
    if (b.block_type in blockIdsRef.current) {
      blockIdsRef.current[b.block_type as BlockType] = b.id
    }
  })

  const getBlock = (type: BlockType) =>
    initialBlocks.find((b) => b.block_type === type)?.content ?? {}

  const [state, setState] = useState<EditorState>({
    title:    initialTitle,
    overview: initOverview(getBlock('overview')),
    context:  initContext(getBlock('context')),
    research: initResearch(getBlock('research')),
    design:   initDesign(getBlock('design')),
    results:  initResults(getBlock('results')),
  })

  const [activeBlock, setActiveBlock]       = useState<BlockType>('overview')
  const [saveStatus, setSaveStatus]         = useState<'saved' | 'saving' | 'error'>('saved')
  const [publishErrors, setPublishErrors]   = useState<string[]>([])
  const [publishing, setPublishing]         = useState(false)
  const [status, setStatus]                 = useState(initialStatus)
  const [visibility, setVisibility]         = useState(initialVisibility || 'public')
  const [coverImageUrl, setCoverImageUrl]   = useState(initialCoverImageUrl ?? '')
  const [uploadingCover, setUploadingCover] = useState(false)
  const [coverError, setCoverError]         = useState<string | null>(null)

  const coverInputRef = useRef<HTMLInputElement>(null)

  const filledBlocks = useMemo<Set<BlockType>>(() => {
    const s = new Set<BlockType>()
    if (isFilled(state.overview as unknown as Record<string, unknown>)) s.add('overview')
    if (isFilled(state.context  as unknown as Record<string, unknown>)) s.add('context')
    if (isFilled(state.research as unknown as Record<string, unknown>)) s.add('research')
    if (isFilled(state.design   as unknown as Record<string, unknown>)) s.add('design')
    if (isFilled(state.results  as unknown as Record<string, unknown>)) s.add('results')
    return s
  }, [state])

  const saveFn = useCallback(async (s: EditorState) => {
    setSaveStatus('saving')
    try {
      const supabase = createClient()
      await supabase.from('cases').update({ title: s.title }).eq('id', caseId)

      const entries: [BlockType, unknown][] = [
        ['overview', s.overview],
        ['context',  s.context],
        ['research', s.research],
        ['design',   s.design],
        ['results',  s.results],
      ]
      for (const [type, content] of entries) {
        const id = blockIdsRef.current[type]
        if (id) {
          await supabase.from('case_blocks').update({ content }).eq('id', id)
        }
      }
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }, [caseId])

  useAutoSave(state, saveFn)

  function set<K extends keyof EditorState>(key: K, value: EditorState[K]) {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  async function handleManualSave() {
    await saveFn(state)
  }

  async function handleSetVisibility(v: string) {
    setVisibility(v)
    const supabase = createClient()
    await supabase.from('cases').update({ visibility: v }).eq('id', caseId)
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverError(null)
    setUploadingCover(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `covers/${caseId}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('case-images')
        .upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('case-images').getPublicUrl(path)
      setCoverImageUrl(data.publicUrl)
      await supabase.from('cases').update({ cover_image_url: data.publicUrl }).eq('id', caseId)
    } catch {
      setCoverError('Не удалось загрузить обложку. Проверьте bucket case-images в Supabase.')
    } finally {
      setUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  async function handleRemoveCover() {
    setCoverImageUrl('')
    const supabase = createClient()
    await supabase.from('cases').update({ cover_image_url: null }).eq('id', caseId)
  }

  function validate(): string[] {
    const errs: string[] = []
    if (!state.title.trim()) errs.push('Заголовок кейса')
    if (!state.overview.projectName.trim()) errs.push('Обзор: название проекта')
    if (!state.context.problemStatement.trim()) errs.push('Контекст: постановка проблемы')
    if (!state.results.qualitativeResults.trim()) errs.push('Результаты: качественные итоги')
    return errs
  }

  async function handlePublish() {
    const errs = validate()
    if (errs.length > 0) {
      setPublishErrors(errs)
      return
    }
    setPublishErrors([])
    setPublishing(true)
    try {
      await saveFn(state)
      const supabase = createClient()
      await supabase
        .from('cases')
        .update({ status: 'published' })
        .eq('id', caseId)
      setStatus('published')
      if (visibility === 'public') {
        router.push(`/portfolio/${username}`)
      } else {
        router.refresh()
      }
    } catch {
      setSaveStatus('error')
    } finally {
      setPublishing(false)
    }
  }

  async function handleUnpublish() {
    setPublishing(true)
    try {
      const supabase = createClient()
      await supabase
        .from('cases')
        .update({ status: 'draft' })
        .eq('id', caseId)
      setStatus('draft')
      router.refresh()
    } finally {
      setPublishing(false)
    }
  }

  const blockNode: Record<BlockType, React.ReactNode> = {
    overview: (
      <OverviewBlock
        content={state.overview}
        onChange={(v) => set('overview', v)}
      />
    ),
    context: (
      <ContextBlock
        content={state.context}
        onChange={(v) => set('context', v)}
      />
    ),
    research: (
      <ResearchBlock
        content={state.research}
        onChange={(v) => set('research', v)}
      />
    ),
    design: (
      <DesignBlock
        caseId={caseId}
        content={state.design}
        onChange={(v) => set('design', v)}
      />
    ),
    results: (
      <ResultsBlock
        content={state.results}
        onChange={(v) => set('results', v)}
      />
    ),
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            ← Назад
          </Link>
          <Input
            value={state.title}
            onChange={(e) => set('title', e.target.value)}
            className="h-8 text-sm font-medium flex-1 max-w-xs border-0 shadow-none focus-visible:ring-0 px-2"
            placeholder="Название кейса"
          />
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            {/* Preview */}
            <Link
              href={`/dashboard/cases/${caseId}/preview`}
              target="_blank"
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              Предпросмотр
            </Link>

            {/* Cover image upload */}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            {coverImageUrl ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="flex items-center gap-1 border rounded px-2 py-1 text-xs hover:bg-muted transition-colors"
                >
                  <div className="relative w-5 h-5 rounded overflow-hidden">
                    <Image src={coverImageUrl} alt="cover" fill className="object-cover" />
                  </div>
                  Обложка
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="text-xs text-muted-foreground hover:text-destructive"
                  title="Удалить обложку"
                >
                  ×
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="text-xs"
              >
                {uploadingCover ? 'Загрузка...' : '+ Обложка'}
              </Button>
            )}

            {/* Visibility toggle */}
            <div className="flex items-center border rounded-md overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => handleSetVisibility('public')}
                className={cn(
                  'px-2 py-1 transition-colors',
                  visibility === 'public'
                    ? 'bg-secondary font-medium'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                🌐 Публичный
              </button>
              <div className="w-px h-4 bg-border" />
              <button
                type="button"
                onClick={() => handleSetVisibility('private')}
                className={cn(
                  'px-2 py-1 transition-colors',
                  visibility === 'private'
                    ? 'bg-secondary font-medium'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                🔒 Приватный
              </button>
            </div>

            {/* Manual save */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>

            {/* Publish / Unpublish */}
            {status === 'published' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnpublish}
                disabled={publishing}
              >
                Снять с публикации
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? 'Публикация...' : 'Опубликовать'}
              </Button>
            )}
          </div>
        </div>

        {coverError && (
          <div className="max-w-5xl mx-auto px-4 pb-2">
            <p className="text-xs text-destructive">{coverError}</p>
          </div>
        )}

        {publishErrors.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 pb-3">
            <p className="text-sm text-destructive">
              Заполните обязательные поля перед публикацией:
              {' '}{publishErrors.join(', ')}
            </p>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 flex gap-8 flex-1 w-full">
        <BlockSidebar
          activeBlock={activeBlock}
          filledBlocks={filledBlocks}
          onSelect={setActiveBlock}
          saveStatus={saveStatus}
        />
        <div className="flex-1 min-w-0">{blockNode[activeBlock]}</div>
      </div>
    </div>
  )
}
