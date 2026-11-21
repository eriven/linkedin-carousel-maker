import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { HomePage } from './components/HomePage'
import { SlideList } from './components/SlideList'
import { HookCreator } from './components/HookCreator'
import { CarouselPreview } from './components/CarouselPreview'
import { DownloadComplete } from './components/DownloadComplete'
import { PasteImagesModal } from './components/PasteImagesModal'
import { FlowStepper } from './components/FlowStepper'
import {
  clearCarouselSession,
  hydrateCarouselSession,
  usePersistCarouselSession,
} from './hooks/useCarouselSession'
import { useRevokeObjectUrls } from './hooks/useObjectUrl'
import { buildPdfFromSession } from './lib/buildPdfFromSession'
import { pathnameToStep, ROUTES } from './routes'
import type { SavedHook, SlideItem } from './types'

function newSlide(file: File): SlideItem {
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
  }
}

function RouteGuards({
  hydrating,
  hasSlides,
}: {
  hydrating: boolean
  hasSlides: boolean
}) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (hydrating) return
    const path = location.pathname

    if (path === ROUTES.hook || path === ROUTES.preview) {
      if (!hasSlides) navigate(ROUTES.home, { replace: true })
    }
    if (path === ROUTES.done && !hasSlides) {
      navigate(ROUTES.home, { replace: true })
    }
  }, [hydrating, location.pathname, hasSlides, navigate])

  return null
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const [hydrating, setHydrating] = useState(true)
  const [slides, setSlides] = useState<SlideItem[]>([])
  const [hook, setHook] = useState<SavedHook | null>(null)
  const [pasteOpen, setPasteOpen] = useState(false)
  const [pasteSessionStartCount, setPasteSessionStartCount] = useState(0)
  const [lastPdfBytes, setLastPdfBytes] = useState<Uint8Array | null>(null)
  const pasteButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let cancelled = false
    void hydrateCarouselSession().then((session) => {
      if (cancelled) {
        session.slides.forEach((s) => URL.revokeObjectURL(s.previewUrl))
        if (session.hook) URL.revokeObjectURL(session.hook.previewUrl)
        return
      }
      setSlides(session.slides)
      setHook(session.hook)
      setHydrating(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  usePersistCarouselSession(slides, hook, hydrating)

  const objectUrls = useMemo(() => {
    const urls = slides.map((s) => s.previewUrl)
    if (hook) urls.push(hook.previewUrl)
    return urls
  }, [slides, hook])
  useRevokeObjectUrls(objectUrls)

  const addFiles = useCallback(
    (files: File[]) => {
      setSlides((prev) => [...prev, ...files.map(newSlide)])
      if (location.pathname !== ROUTES.home) {
        navigate(ROUTES.home)
      }
    },
    [location.pathname, navigate],
  )

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

  const saveHook = useCallback(
    (saved: SavedHook) => {
      setHook((prev) => {
        if (prev?.previewUrl && prev.previewUrl !== saved.previewUrl) {
          URL.revokeObjectURL(prev.previewUrl)
        }
        return saved
      })
      navigate(ROUTES.preview)
    },
    [navigate],
  )

  const clearHook = useCallback(() => {
    setHook((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl)
      return null
    })
  }, [])

  const onDownloadSuccess = useCallback(
    (bytes: Uint8Array) => {
      setLastPdfBytes(bytes)
      navigate(ROUTES.done)
    },
    [navigate],
  )

  const regeneratePdf = useCallback(
    () => buildPdfFromSession(slides, hook),
    [slides, hook],
  )

  const startOver = useCallback(() => {
    slides.forEach((s) => URL.revokeObjectURL(s.previewUrl))
    if (hook?.previewUrl) URL.revokeObjectURL(hook.previewUrl)
    setSlides([])
    setHook(null)
    setLastPdfBytes(null)
    setPasteOpen(false)
    setPasteSessionStartCount(0)
    void clearCarouselSession()
    navigate(ROUTES.home)
  }, [slides, hook, navigate])

  const hasSlides = slides.length > 0
  const step = pathnameToStep(location.pathname)
  const showChrome = step !== 'images' || hasSlides

  if (hydrating) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-gray-500">Restoring your carousel…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 pb-16 pt-4 md:px-8">
      <RouteGuards hydrating={hydrating} hasSlides={hasSlides} />

      {showChrome && (
        <>
          {step !== 'images' && (
            <p className="mb-4 text-center text-sm font-semibold text-gray-800">
              LinkedIn Carousel Maker
            </p>
          )}
          <FlowStepper hasSlides={hasSlides} hasHook={hook != null} />
        </>
      )}

      <Routes>
        <Route
          path={ROUTES.home}
          element={
            <>
              <HomePage
                onFilesSelected={addFiles}
                onOpenPaste={openPasteModal}
                pasteButtonRef={pasteButtonRef}
                hasSlides={hasSlides}
              />
              {hasSlides && (
                <SlideList
                  slides={slides}
                  hook={hook}
                  onReorder={setSlides}
                  onRemove={removeSlide}
                  onAddMore={openPasteModal}
                  onCreateHook={() => navigate(ROUTES.hook)}
                  onEditHook={() => navigate(ROUTES.hook)}
                  onSkipHook={() => {
                    clearHook()
                    navigate(ROUTES.preview)
                  }}
                  onContinueToPreview={() => navigate(ROUTES.preview)}
                />
              )}
            </>
          }
        />
        <Route
          path={ROUTES.hook}
          element={
            hasSlides ? (
              <HookCreator
                initial={hook}
                onSave={saveHook}
                onBack={() => navigate(ROUTES.home)}
              />
            ) : (
              <Navigate to={ROUTES.home} replace />
            )
          }
        />
        <Route
          path={ROUTES.preview}
          element={
            hasSlides ? (
              <CarouselPreview
                hook={hook}
                slides={slides}
                onEditHook={() => navigate(ROUTES.hook)}
                onBack={() => navigate(ROUTES.home)}
                onDownloadSuccess={onDownloadSuccess}
              />
            ) : (
              <Navigate to={ROUTES.home} replace />
            )
          }
        />
        <Route
          path={ROUTES.done}
          element={
            hasSlides ? (
              <DownloadComplete
                pdfBytes={lastPdfBytes}
                onStartOver={startOver}
                onRegeneratePdf={regeneratePdf}
              />
            ) : (
              <Navigate to={ROUTES.home} replace />
            )
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>

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