import type { HookFont, HookFontSize } from '../types'

export const FONT_FAMILY: Record<HookFont, string> = {
  boldSans: '"DM Sans", system-ui, sans-serif',
  cleanSans: 'Inter, system-ui, sans-serif',
  serif: 'Lora, Georgia, serif',
}

export const FONT_WEIGHT: Record<HookFont, number> = {
  boldSans: 800,
  cleanSans: 600,
  serif: 600,
}

export const FONT_SIZE_PX: Record<HookFontSize, number> = {
  small: 52,
  medium: 68,
  large: 84,
}

export const BACKGROUND_SWATCHES = [
  { id: 'orange', color: '#e85d2c' },
  { id: 'black', color: '#1a1a1a' },
  { id: 'gray', color: '#9ca3af' },
  { id: 'beige', color: '#f5f0e6' },
  { id: 'green', color: '#2d4a3e' },
  { id: 'brown', color: '#6b5344' },
  { id: 'white', color: '#ffffff' },
] as const

export const TEXT_SWATCHES = [
  { id: 'black', color: '#1a1a1a' },
  { id: 'white', color: '#ffffff' },
  { id: 'orange', color: '#e85d2c' },
  { id: 'beige', color: '#f5f0e6' },
] as const

export const BACKGROUND_STYLE_LABELS: Record<
  import('../types').BackgroundStyle,
  string
> = {
  dotGrid: 'Dot grid',
  solid: 'Solid',
  softGradient: 'Gradient',
  minimalGeo: 'Geometric',
  lightTexture: 'Texture',
}
