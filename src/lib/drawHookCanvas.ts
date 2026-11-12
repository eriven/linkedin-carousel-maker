import type { HookConfig } from '../types'
import { PAGE_HEIGHT, PAGE_WIDTH } from '../types'
import { drawBackground } from './drawBackground'
import {
  FONT_FAMILY,
  FONT_SIZE_PX,
  FONT_WEIGHT,
} from './fonts'

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

export function drawHookCanvas(
  canvas: HTMLCanvasElement,
  config: HookConfig,
): void {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  canvas.width = PAGE_WIDTH * dpr
  canvas.height = PAGE_HEIGHT * dpr

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  drawBackground(ctx, config.backgroundStyle, config.backgroundColor)

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
