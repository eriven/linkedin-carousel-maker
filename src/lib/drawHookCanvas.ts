import type { HookConfig } from '../types'
import { PAGE_HEIGHT, PAGE_WIDTH } from '../types'
import { drawBackground } from './drawBackground'
import { drawImageCover, type CanvasImageSource } from './coverFit'
import {
  FONT_FAMILY,
  FONT_SIZE_PX,
  FONT_WEIGHT,
} from './fonts'

export type HookDrawOptions = {
  customBackground?: CanvasImageSource | null
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const paragraphs = text.split('\n')
  const lines: string[] = []
  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      lines.push('')
      continue
    }
    let current = words[0]
    for (let i = 1; i < words.length; i++) {
      const test = `${current} ${words[i]}`
      if (ctx.measureText(test).width <= maxWidth) {
        current = test
      } else {
        lines.push(current)
        current = words[i]
      }
    }
    lines.push(current)
  }
  return lines
}

function drawTextScrim(
  ctx: CanvasRenderingContext2D,
  startY: number,
  blockHeight: number,
  padX: number,
  maxWidth: number,
  alignment: HookConfig['alignment'],
): void {
  const inset = 24
  const y = Math.max(0, startY - inset)
  const h = Math.min(PAGE_HEIGHT - y, blockHeight + inset * 2)
  const x = alignment === 'center' ? padX : padX - inset
  const w =
    alignment === 'center' ? PAGE_WIDTH - padX * 2 : maxWidth + inset * 2

  const gradient = ctx.createLinearGradient(0, y, 0, y + h)
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(0.15, 'rgba(0,0,0,0.35)')
  gradient.addColorStop(0.85, 'rgba(0,0,0,0.35)')
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(x, y, w, h)
}

export function drawHookCanvas(
  canvas: HTMLCanvasElement,
  config: HookConfig,
  options?: HookDrawOptions,
): void {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  canvas.width = PAGE_WIDTH * dpr
  canvas.height = PAGE_HEIGHT * dpr

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const customBg = options?.customBackground
  if (customBg) {
    drawImageCover(ctx, customBg, PAGE_WIDTH, PAGE_HEIGHT)
  } else {
    drawBackground(ctx, config.backgroundStyle, config.backgroundColor)
  }

  const padX = 80
  const maxWidth = PAGE_WIDTH - padX * 2
  const fontSize = FONT_SIZE_PX[config.fontSize]
  const family = FONT_FAMILY[config.font]
  const weight = FONT_WEIGHT[config.font]

  ctx.fillStyle = config.textColor
  ctx.font = `${weight} ${fontSize}px ${family}`
  ctx.textBaseline = 'top'

  const lines = wrapLines(ctx, config.text.trim() || 'Your hook text', maxWidth)
  const lineHeight = fontSize * 1.25
  const blockHeight = lines.length * lineHeight
  const startY = (PAGE_HEIGHT - blockHeight) / 2

  if (customBg && config.useTextScrim) {
    drawTextScrim(ctx, startY, blockHeight, padX, maxWidth, config.alignment)
  }

  lines.forEach((line, i) => {
    const y = startY + i * lineHeight
    if (config.alignment === 'center') {
      ctx.textAlign = 'center'
      ctx.fillText(line, PAGE_WIDTH / 2, y, maxWidth)
    } else {
      ctx.textAlign = 'left'
      ctx.fillText(line, padX, y, maxWidth)
    }
  })
}

export function hookCanvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to export hook image'))
      },
      'image/png',
      1,
    )
  })
}