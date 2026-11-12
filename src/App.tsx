import { useCallback, useMemo, useState } from 'react'
import { HomePage } from './components/HomePage'
import { SlideList } from './components/SlideList'
import { HookCreator } from './components/HookCreator'
import { CarouselPreview } from './components/CarouselPreview'
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
        <HomePage onFilesSelected={addFiles} hasSlides={slides.length > 0} />
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
    </main>
  )
}
