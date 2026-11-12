import { PAGE_HEIGHT, PAGE_WIDTH } from '../types'
import { normalizeHookForPdf, normalizeSlideToPage } from './normalizeSlide'

async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const buf = await blob.arrayBuffer()
  return new Uint8Array(buf)
}

export type PageInput =
  | { kind: 'hook'; blob: Blob }
  | { kind: 'slide'; blob: Blob | File }

async function pageToPngBlob(input: PageInput): Promise<Blob> {
  if (input.kind === 'hook') {
    return normalizeHookForPdf(input.blob)
  }
  return normalizeSlideToPage(input.blob)
}

export async function buildPdf(pages: PageInput[]): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib')
  const pdf = await PDFDocument.create()

  for (const input of pages) {
    const pageBlob = await pageToPngBlob(input)
    const bytes = await blobToUint8Array(pageBlob)
    const embedded = await pdf.embedPng(bytes)

    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    page.drawImage(embedded, {
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
    })
  }

  return pdf.save()
}

export function downloadPdf(bytes: Uint8Array, filename = 'linkedin-carousel.pdf') {
  const copy = new Uint8Array(bytes)
  const blob = new Blob([copy], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
