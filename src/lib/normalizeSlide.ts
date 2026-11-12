import { PAGE_HEIGHT, PAGE_WIDTH } from '../types'

async function loadImageSource(
  source: Blob | File,
): Promise<{ drawable: ImageBitmap | HTMLImageElement; cleanup: () => void }> {
  if (typeof createImageBitmap !== 'undefined') {
    const bitmap = await createImageBitmap(source, {
      imageOrientation: 'from-image',
    })
    return {
      drawable: bitmap,
      cleanup: () => bitmap.close(),
    }
  }

  const url = URL.createObjectURL(source)
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image'))
    image.src = url
  })
  return {
    drawable: img,
    cleanup: () => URL.revokeObjectURL(url),
  }
}

function drawableSize(drawable: ImageBitmap | HTMLImageElement): {
  width: number
  height: number
} {
  if (drawable instanceof ImageBitmap) {
    return { width: drawable.width, height: drawable.height }
  }
  return { width: drawable.naturalWidth, height: drawable.naturalHeight }
}

export async function normalizeSlideToPage(
  source: Blob | File,
  background = '#ffffff',
): Promise<Blob> {
  const { drawable, cleanup } = await loadImageSource(source)
  try {
    const { width: imgW, height: imgH } = drawableSize(drawable)
    if (imgW === 0 || imgH === 0) {
      throw new Error('Invalid image dimensions')
    }

    const canvas = document.createElement('canvas')
    canvas.width = PAGE_WIDTH
    canvas.height = PAGE_HEIGHT
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not available')

    ctx.fillStyle = background
    ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)

    const scale = Math.min(PAGE_WIDTH / imgW, PAGE_HEIGHT / imgH)
    const w = imgW * scale
    const h = imgH * scale
    const x = (PAGE_WIDTH - w) / 2
    const y = (PAGE_HEIGHT - h) / 2

    ctx.drawImage(drawable, x, y, w, h)

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Normalize failed'))),
        'image/png',
      )
    })
  } finally {
    cleanup()
  }
}

export async function normalizeHookForPdf(hookBlob: Blob): Promise<Blob> {
  const { drawable, cleanup } = await loadImageSource(hookBlob)
  try {
    const { width, height } = drawableSize(drawable)
    if (width === PAGE_WIDTH && height === PAGE_HEIGHT) {
      return hookBlob
    }
  } finally {
    cleanup()
  }
  return normalizeSlideToPage(hookBlob, '#ffffff')
}
