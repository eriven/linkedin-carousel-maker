export type CanvasImageSource = ImageBitmap | HTMLImageElement | HTMLCanvasElement

export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  pageW: number,
  pageH: number,
): void {
  const imgW =
    'width' in source && 'naturalWidth' in source
      ? (source as HTMLImageElement).naturalWidth || source.width
      : source.width
  const imgH =
    'height' in source && 'naturalHeight' in source
      ? (source as HTMLImageElement).naturalHeight || source.height
      : source.height

  const scale = Math.max(pageW / imgW, pageH / imgH)
  const w = imgW * scale
  const h = imgH * scale
  const x = (pageW - w) / 2
  const y = (pageH - h) / 2
  ctx.drawImage(source, x, y, w, h)
}