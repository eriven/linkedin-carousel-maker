import { useCallback, useEffect, useId, useRef, useState } from 'react'
import {
  imageFilesFromFileList,
  pasteShortcutLabel,
} from '../lib/clipboardImages'
import { usePasteImages } from '../hooks/usePasteImages'

interface PasteImagesModalProps {
  open: boolean
  onClose: () => void
  onImages: (files: File[]) => void
  sessionPreviewUrls: string[]
  sessionCount: number
}

export function PasteImagesModal({
  open,
  onClose,
  onImages,
  sessionPreviewUrls,
  sessionCount,
}: PasteImagesModalProps) {
  const titleId = useId()
  const zoneRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pasteHint, setPasteHint] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleImages = useCallback(
    (files: File[]) => {
      if (!files.length) return
      onImages(files)
      setPasteHint(null)
    },
    [onImages],
  )

  usePasteImages({
    enabled: open,
    containerRef: zoneRef,
    onImages: handleImages,
    onPasteEmpty: () =>
      setPasteHint('No image on clipboard. Use “Copy image”, not “Copy link”.'),
  })

  useEffect(() => {
    if (!open) return
    setPasteHint(null)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const shortcut = pasteShortcutLabel()
  const thumbnails = sessionPreviewUrls.slice(-5)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="border-b border-gray-100 px-5 pb-4 pt-5 sm:px-6">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">
            Paste images
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Copy an image on the web, click the area below, then press{' '}
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-800">
              {shortcut}
            </kbd>
            . Each paste adds a slide to your carousel.
          </p>
        </div>

        <div className="overflow-y-auto px-5 py-4 sm:px-6">
          <div
            ref={zoneRef}
            tabIndex={0}
            aria-label="Paste images here"
            className={`relative flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20 ${
              dragOver ? 'border-brand bg-red-50/40' : 'border-gray-200 bg-gray-50/50'
            }`}
            style={{ aspectRatio: '1080 / 1350', maxHeight: 'min(50vh, 360px)' }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleImages(imageFilesFromFileList(e.dataTransfer.files))
            }}
          >
            <p className="text-sm font-medium text-gray-700">
              Click here, then paste
            </p>
            <p className="mt-2 text-xs text-gray-500">or drop images in this box</p>
            <button
              type="button"
              className="mt-4 text-sm font-medium text-brand underline-offset-2 hover:underline"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              Browse files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleImages(imageFilesFromFileList(e.target.files))
                e.target.value = ''
              }}
            />
            <div
              contentEditable
              suppressContentEditableWarning
              aria-hidden
              tabIndex={-1}
              className="pointer-events-none absolute inset-0 h-px w-px overflow-hidden opacity-0"
            />
          </div>

          {sessionCount > 0 && (
            <p
              className="mt-3 text-sm font-medium text-gray-700"
              aria-live="polite"
            >
              {sessionCount} image{sessionCount === 1 ? '' : 's'} added
            </p>
          )}

          {pasteHint && (
            <p className="mt-2 text-sm text-amber-700" role="status">
              {pasteHint}
            </p>
          )}

          {thumbnails.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {thumbnails.map((url, i) => (
                <img
                  key={`${url}-${i}`}
                  src={url}
                  alt=""
                  className="h-16 w-12 shrink-0 rounded border border-gray-100 object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-gray-100 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}