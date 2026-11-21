import { useCallback, useMemo, useRef, useState } from 'react'
import { HomePage } from './components/HomePage'
import { SlideList } from './components/SlideList'
import { HookCreator } from './components/HookCreator'
import { CarouselPreview } from './components/CarouselPreview'
import { PasteImagesModal } from './components/PasteImagesModal'
import { useRevokeObjectUrls } from './hooks/useObjectUrl'
import type { AppStep, SavedHook, SlideItem } from './types'

function newSlide(file: File): SlideItem {
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
  }
}

export default function App() {
  const [step, setStep] = useState<AppStep>('upload')
  const [slides, setSlides] = useState<SlideItem[]>([])
  const [hook, setHook] = useState<SavedHook | null>(null)
  const [pasteOpen, setPasteOpen] = useState(false)
  const [pasteSessionStartCount, setPasteSessionStartCount] = useState(0)
  const pasteButtonRef = useRef<HTMLButtonElement>(null)

  const objectUrls = useMemo(() => {
    const urls = slides.map((s) => s.previewUrl)
    if (hook) urls.push(hook.previewUrl)
    return urls
  }, [slides, hook])
  useRevokeObjectUrls(objectUrls)

  const addFiles = useCallback((files: File[]) => {
    setSlides((prev) => [...prev, ...files.map(newSlide)])
    setStep('upload')
  }, [])

  const openPasteModal = useCallback(() => {
    setPasteSessionStartCount(slides.length)
    setPasteOpen(true)
  }, [slides.length])

  const closePasteModal = useCallback(() => {
    setPasteOpen(false)
    requestAnimationFrame(() => pasteButtonRef.current?.focus())
  }, [])

  const pasteSessionCount = Math.max(0, slides.length - pasteSessionStartCount)
  const pasteSessionPreviewUrls = useMemo(
    () => slides.slice(pasteSessionStartCount).map((s) => s.previewUrl),
    [slides, pasteSessionStartCount],
  )

  const removeSlide = useCallback((id: string) => {
    setSlides((prev) => {
      const removed = prev.find((s) => s.id === id)
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((s) => s.id !== id)
    })
  }, [])

  const saveHook = useCallback((saved: SavedHook) => {
    setHook((prev) => {
      if (prev?.previewUrl && prev.previewUrl !== saved.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl)
      }
      return saved
    })
    setStep('upload')
  }, [])

  const clearHook = () => {
    if (hook?.previewUrl) URL.revokeObjectURL(hook.previewUrl)
    setHook(null)
  }

  return (
    <main className="min-h-screen px-4 pb-16 pt-4 md:px-8">
      {step === 'upload' && (
        <HomePage
          onFilesSelected={addFiles}
          onOpenPaste={openPasteModal}
          pasteButtonRef={pasteButtonRef}
          hasSlides={slides.length > 0}
        />
      )}

      {step !== 'upload' && (
        <p className="mb-6 text-center text-sm font-semibold text-gray-800 md:mb-8">
          LinkedIn Carousel Maker
        </p>
      )}

      {step === 'upload' && slides.length > 0 && (
        <SlideList
          slides={slides}
          hook={hook}
          onReorder={setSlides}
          onRemove={removeSlide}
          onAddMore={openPasteModal}
          onCreateHook={() => setStep('hook')}
          onSkipHook={() => {
            clearHook()
            setStep('preview')
          }}
          onContinueToPreview={() => setStep('preview')}
        />
      )}

      {step === 'hook' && (
        <HookCreator
          initial={hook}
          onSave={saveHook}
          onBack={() => setStep('upload')}
        />
      )}

      {step === 'preview' && (
        <CarouselPreview
          hook={hook}
          slides={slides}
          onEditHook={() => setStep('hook')}
          onBack={() => setStep('upload')}
        />
      )}

      <PasteImagesModal
        open={pasteOpen}
        onClose={closePasteModal}
        onImages={addFiles}
        sessionCount={pasteSessionCount}
        sessionPreviewUrls={pasteSessionPreviewUrls}
      />
    </main>
  )
}