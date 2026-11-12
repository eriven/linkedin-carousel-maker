export type BackgroundStyle =
  | 'dotGrid'
  | 'solid'
  | 'softGradient'
  | 'minimalGeo'
  | 'lightTexture'

export type HookFont = 'boldSans' | 'cleanSans' | 'serif'
export type HookFontSize = 'small' | 'medium' | 'large'
export type TextAlignment = 'left' | 'center'

export type AppStep = 'upload' | 'hook' | 'preview'

export interface SlideItem {
  id: string
  file: File
  previewUrl: string
}

export interface HookConfig {
  backgroundStyle: BackgroundStyle
  backgroundColor: string
  text: string
  textColor: string
  font: HookFont
  fontSize: HookFontSize
  alignment: TextAlignment
}

export interface SavedHook extends HookConfig {
  blob: Blob
  previewUrl: string
}

export const PAGE_WIDTH = 1080
export const PAGE_HEIGHT = 1350
