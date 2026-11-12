import { useEffect, useRef, useState } from 'react'
import type { SavedHook, SlideItem } from '../types'
import { buildPdf, downloadPdf, type PageInput } from '../lib/buildPdf'
import { normalizeSlideToPage } from '../lib/normalizeSlide'

interface CarouselPreviewProps {
  hook: SavedHook | null
  slides: SlideItem[]
  onEditHook: () => void
  onBack: () => void
}

type PageThumb = {
  key: string
  label: string
  url: string
  blob: Blob
  kind: PageInput['kind']
}

export function CarouselPreview({
  hook,
  slides,
  onEditHook,
  onBack,
}: CarouselPreviewProps) {
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [pages, setPages] = useState<PageThumb[]>([])
  const [loadingPreviews, setLoadingPreviews] = useState(true)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const urlsRef = useRef<string[]>([])

  useEffect(() => {
    let cancelled = false

    async function buildPreviews() {
      setLoadingPreviews(true)
      setPreviewError(null)
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
      urlsRef.current = []

      try {
        const built: PageThumb[] = []

        if (hook) {
          built.push({
            key: 'hook',
            label: 'Hook',
            url: hook.previewUrl,
            blob: hook.blob,
            kind: 'hook',
          })
        }

        for (let i = 0; i < slides.length; i++) {
          const slide = slides[i]
          const normalized = await normalizeSlideToPage(slide.file)
          const url = URL.createObjectURL(normalized)
          urlsRef.current.push(url)
          built.push({
            key: slide.id,
            label: `Slide ${i + 1}`,
            url,
            blob: normalized,
            kind: 'slide',
          })
        }

        if (!cancelled) setPages(built)
      } catch (e) {
        if (!cancelled) {
          setPreviewError(
            e instanceof Error ? e.message : 'Failed to build previews',
          )
          setPages([])
        }
      } finally {
        if (!cancelled) setLoadingPreviews(false)
      }
    }

    void buildPreviews()

    return () => {
      cancelled = true
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
      urlsRef.current = []
    }
  }, [hook, slides])

  const handleGenerate = async () => {
    setGenerating(true)
    setGenError(null)
    try {
      const pageInputs: PageInput[] = pages.map((p) =>
        p.kind === 'hook'
          ? { kind: 'hook', blob: p.blob }
          : { kind: 'slide', blob: p.blob },
      )
      const bytes = await buildPdf(pageInputs)
      downloadPdf(bytes)
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'PDF generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      <h2 className="mb-2 text-center text-xl font-semibold text-gray-800">
        Final order
      </h2>
      <p className="mb-8 text-center text-sm text-gray-500">
        {hook ? 'Hook image → your slides' : 'Your slides (no hook)'}
      </p>

      {loadingPreviews && (
        <p className="text-center text-sm text-gray-500">Preparing preview…</p>
      )}
      {previewError && (
        <p className="text-center text-sm text-red-600">{previewError}</p>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {pages.map((p) => (
          <div key={p.key} className="shrink-0 text-center">
            <div
              className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm"
              style={{ aspectRatio: '1080 / 1350', width: 'min(154px, 38vw)' }}
            >
              <img
                src={p.url}
                alt={p.label}
                className="h-full w-full object-contain"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">{p.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {hook && (
          <button
            type="button"
            onClick={onEditHook}
            className="text-sm font-medium text-brand underline-offset-2 hover:underline"
          >
            Edit hook
          </button>
        )}
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || loadingPreviews || pages.length === 0}
          className="rounded-md bg-brand px-8 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
        >
          {generating ? 'Generating…' : 'Generate PDF'}
        </button>
      </div>
      {genError && (
        <p className="mt-4 text-center text-sm text-red-600">{genError}</p>
      )}
    </section>
  )
}
