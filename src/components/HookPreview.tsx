import type { RefObject } from 'react'

interface HookPreviewProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
}

export function HookPreview({ canvasRef }: HookPreviewProps) {
  return (
    <div className="mx-auto w-full lg:sticky lg:top-4 lg:self-start">
      <div
        className="mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 sm:max-w-[300px] lg:max-w-[340px]"
        style={{ aspectRatio: '1080 / 1350' }}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </div>
  )
}
