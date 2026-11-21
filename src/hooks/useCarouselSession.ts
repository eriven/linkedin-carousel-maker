import { useEffect, useRef } from 'react'
import type { SavedHook, SlideItem } from '../types'
import {
  clearCarouselSession,
  loadCarouselSession,
  saveCarouselSession,
} from '../lib/carouselSessionDb'

const SAVE_DEBOUNCE_MS = 300

export function usePersistCarouselSession(
  slides: SlideItem[],
  hook: SavedHook | null,
  hydrating: boolean,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstMount = useRef(true)

  useEffect(() => {
    if (hydrating) return

    if (isFirstMount.current) {
      isFirstMount.current = false
      if (slides.length === 0 && !hook) return
    }

    if (slides.length === 0 && !hook) {
      void clearCarouselSession()
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      void saveCarouselSession(slides, hook).catch(() => {
        /* persistence is best-effort */
      })
    }, SAVE_DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [slides, hook, hydrating])
}

export async function hydrateCarouselSession(): Promise<{
  slides: SlideItem[]
  hook: SavedHook | null
}> {
  const loaded = await loadCarouselSession()
  if (!loaded) return { slides: [], hook: null }
  return loaded
}

export { clearCarouselSession }