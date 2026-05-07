'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X } from 'lucide-react'

interface Props {
  images: string[]
}

export default function ImageLightbox({ images }: Props) {
  const [active, setActive] = useState<string | null>(null)

  const close = useCallback(() => setActive(null), [])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [active, close])

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        {images.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => setActive(url)}
            className="relative aspect-video rounded-lg overflow-hidden border cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image
              src={url}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 336px"
              className="object-cover transition-transform duration-200 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative w-full h-full max-w-7xl mx-auto px-4 py-12 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active}
              alt=""
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
