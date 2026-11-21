import type { SavedHook, SlideItem } from '../types'
import { buildPdf, type PageInput } from './buildPdf'
import { normalizeSlideToPage } from './normalizeSlide'

export async function buildPdfFromSession(
  slides: SlideItem[],
  hook: SavedHook | null,
): Promise<Uint8Array> {
  const pages: PageInput[] = []
  if (hook) pages.push({ kind: 'hook', blob: hook.blob })

  for (const slide of slides) {
    const normalized = await normalizeSlideToPage(slide.file)
    pages.push({ kind: 'slide', blob: normalized })
  }

  return buildPdf(pages)
}