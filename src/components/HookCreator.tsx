import { useEffect, useRef, useState } from 'react'
import type { HookConfig, SavedHook } from '../types'
import { ColorSwatches } from './ColorSwatches'
import {
  BACKGROUND_STYLE_LABELS,
  BACKGROUND_SWATCHES,
  TEXT_SWATCHES,
} from '../lib/fonts'
import type { BackgroundStyle } from '../types'
import { drawHookCanvas, hookCanvasToBlob } from '../lib/drawHookCanvas'
import { HookPreview } from './HookPreview'

const DEFAULT_CONFIG: HookConfig = {
  backgroundStyle: 'dotGrid',
  backgroundColor: '#f5f0e6',
  text: '',
  textColor: '#1a1a1a',
  font: 'boldSans',
  fontSize: 'medium',
  alignment: 'left',
}

interface HookCreatorProps {
  initial?: HookConfig | null
  onSave: (hook: SavedHook) => void
  onBack: () => void
}

export function HookCreator({ initial, onSave, onBack }: HookCreatorProps) {
  const [config, setConfig] = useState<HookConfig>(initial ?? DEFAULT_CONFIG)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const id = requestAnimationFrame(() => drawHookCanvas(canvas, config))
    return () => cancelAnimationFrame(id)
  }, [config])

  const patch = (partial: Partial<HookConfig>) => {
    setConfig((c) => ({ ...c, ...partial }))
    setError(null)
  }

  const handleSave = async () => {
    if (!config.text.trim()) {
      setError('Add hook text before saving.')
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return
    drawHookCanvas(canvas, config)
    const blob = await hookCanvasToBlob(canvas)
    const previewUrl = URL.createObjectURL(blob)
    onSave({ ...config, blob, previewUrl })
  }

  const styles = Object.keys(BACKGROUND_STYLE_LABELS) as BackgroundStyle[]

  return (
    <section className="mx-auto w-full max-w-5xl">
      <h2 className="mb-6 text-center text-xl font-semibold text-gray-800 lg:mb-8">
        Create hook image
      </h2>
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <HookPreview canvasRef={canvasRef} />

        <div className="min-w-0 space-y-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Hook text
            </label>
            <textarea
              value={config.text}
              onChange={(e) => patch({ text: e.target.value })}
              rows={4}
              placeholder="5 things I learned building in public"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              Background style
            </p>
            <div className="flex flex-wrap gap-2">
              {styles.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => patch({ backgroundStyle: key })}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    config.backgroundStyle === key
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {BACKGROUND_STYLE_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          <ColorSwatches
            label="Background color"
            swatches={BACKGROUND_SWATCHES}
            selected={config.backgroundColor}
            onSelect={(color) => patch({ backgroundColor: color })}
          />

          <ColorSwatches
            label="Text color"
            swatches={TEXT_SWATCHES}
            selected={config.textColor}
            onSelect={(color) => patch({ textColor: color })}
          />

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Font</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['boldSans', 'Bold Sans'],
                  ['cleanSans', 'Clean Sans'],
                  ['serif', 'Serif'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => patch({ font: value })}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    config.font === value
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Font size</p>
            <div className="flex gap-2">
              {(
                [
                  ['small', 'S'],
                  ['medium', 'M'],
                  ['large', 'L'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => patch({ fontSize: value })}
                  className={`h-9 w-9 rounded-lg border text-sm font-medium ${
                    config.fontSize === value
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Alignment</p>
            <div className="flex gap-2">
              {(['left', 'center'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => patch({ alignment: a })}
                  className={`rounded-lg border px-4 py-1.5 text-sm capitalize ${
                    config.alignment === a
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Save hook
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-md border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
