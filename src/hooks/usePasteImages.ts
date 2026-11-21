import { useEffect, type RefObject } from 'react'
import { filesFromClipboardEvent } from '../lib/clipboardImages'

interface UsePasteImagesOptions {
  enabled: boolean
  containerRef: RefObject<HTMLElement | null>
  onImages: (files: File[]) => void
  onPasteEmpty?: () => void
}

export function usePasteImages({
  enabled,
  containerRef,
  onImages,
  onPasteEmpty,
}: UsePasteImagesOptions) {
  useEffect(() => {
    if (!enabled) return

    const el = containerRef.current
    if (!el) return

    const onPaste = (e: ClipboardEvent) => {
      const files = filesFromClipboardEvent(e)
      if (files.length > 0) {
        e.preventDefault()
        onImages(files)
      } else {
        onPasteEmpty?.()
      }
    }

    el.addEventListener('paste', onPaste)
    return () => el.removeEventListener('paste', onPaste)
  }, [enabled, containerRef, onImages, onPasteEmpty])

  useEffect(() => {
    if (!enabled) return
    const id = requestAnimationFrame(() => {
      containerRef.current?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [enabled, containerRef])
}