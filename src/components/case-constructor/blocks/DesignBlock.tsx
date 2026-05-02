'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import type { DesignContent } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Props {
  caseId: string
  content: DesignContent
  onChange: (content: DesignContent) => void
}

export default function DesignBlock({ caseId, content, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function set<K extends keyof DesignContent>(key: K, value: DesignContent[K]) {
    onChange({ ...content, [key]: value })
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploading(true)
    try {
      const supabase = createClient()
      const path = `${caseId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`
      const { data, error } = await supabase.storage
        .from('case-images')
        .upload(path, file, { upsert: false })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage
        .from('case-images')
        .getPublicUrl(data.path)
      set('imageUrls', [...(content.imageUrls ?? []), publicUrl])
    } catch {
      setUploadError('Не удалось загрузить изображение. Проверьте bucket case-images в Supabase.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function removeImage(url: string) {
    set('imageUrls', (content.imageUrls ?? []).filter((u) => u !== url))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Дизайн</h2>
        <p className="text-sm text-muted-foreground">
          Процесс работы, решения и итерации
        </p>
      </div>

      <div className="space-y-2">
        <Label>Описание процесса</Label>
        <Textarea
          value={content.processDescription}
          onChange={(e) => set('processDescription', e.target.value)}
          placeholder="Как вы подходили к решению? Какие этапы прошли?"
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label>Обоснование решений</Label>
        <Textarea
          value={content.decisionJustification}
          onChange={(e) => set('decisionJustification', e.target.value)}
          placeholder="Почему выбрали именно это решение? Какие альтернативы рассматривали?"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Итерации</Label>
        <Textarea
          value={content.iterations ?? ''}
          onChange={(e) => set('iterations', e.target.value)}
          placeholder="Как менялся дизайн? Что тестировали?"
          rows={3}
        />
      </div>

      {/* Image upload */}
      <div className="space-y-3">
        <Label>Изображения</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(content.imageUrls ?? []).map((url) => (
            <div key={url} className="relative group aspect-video rounded-lg overflow-hidden border">
              <Image
                src={url}
                alt="Case image"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        {uploadError && (
          <p className="text-xs text-destructive">{uploadError}</p>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Загрузка...' : '+ Добавить изображение'}
        </Button>
      </div>
    </div>
  )
}
