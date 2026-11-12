import type { BackgroundStyle } from '../types'
import { PAGE_HEIGHT, PAGE_WIDTH } from '../types'

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  const n = parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function mix(a: string, b: string, t: number): string {
  const ca = parseHex(a)
  const cb = parseHex(b)
  const r = Math.round(ca.r + (cb.r - ca.r) * t)
  const g = Math.round(ca.g + (cb.g - ca.g) * t)
  const bl = Math.round(ca.b + (cb.b - ca.b) * t)
  return `rgb(${r},${g},${bl})`
}

function dotColorFor(bg: string): string {
  const { r, g, b } = parseHex(bg)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.55 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)'
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  style: BackgroundStyle,
  color: string,
  w = PAGE_WIDTH,
  h = PAGE_HEIGHT,
): void {
  ctx.clearRect(0, 0, w, h)

  if (style === 'solid') {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, w, h)
    return
  }

  if (style === 'softGradient') {
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, color)
    grad.addColorStop(1, mix(color, '#ffffff', 0.35))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    return
  }

  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)

  if (style === 'dotGrid') {
    ctx.fillStyle = dotColorFor(color)
    const step = 24
    const r = 2
    for (let y = step; y < h; y += step) {
      for (let x = step; x < w; x += step) {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    return
  }

  if (style === 'minimalGeo') {
    ctx.strokeStyle = dotColorFor(color)
    ctx.lineWidth = 2
    const size = 140
    for (let y = -size; y < h + size; y += size) {
      for (let x = -size; x < w + size; x += size) {
        ctx.strokeRect(x + size * 0.25, y + size * 0.25, size * 0.5, size * 0.5)
      }
    }
    return
  }

  if (style === 'lightTexture') {
    const dot = dotColorFor(color)
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * w
      const y = Math.random() * h
      ctx.fillStyle = dot
      ctx.fillRect(x, y, 1, 1)
    }
  }
}
