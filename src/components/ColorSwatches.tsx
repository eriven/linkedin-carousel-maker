interface Swatch {
  id: string
  color: string
}

interface ColorSwatchesProps {
  label: string
  swatches: readonly Swatch[]
  selected: string
  onSelect: (color: string) => void
}

function contrastCheck(color: string): boolean {
  const h = color.replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  const n = parseInt(full, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.7
}

export function ColorSwatches({
  label,
  swatches,
  selected,
  onSelect,
}: ColorSwatchesProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {swatches.map((s) => {
          const isSelected = selected.toLowerCase() === s.color.toLowerCase()
          return (
            <button
              key={s.id}
              type="button"
              aria-label={s.id}
              onClick={() => onSelect(s.color)}
              className={`h-9 w-9 rounded-lg border-2 transition-shadow ${
                isSelected ? 'border-gray-900 shadow-md' : 'border-gray-200'
              }`}
              style={{ backgroundColor: s.color }}
            >
              {isSelected && (
                <span
                  className={`text-sm font-bold ${
                    contrastCheck(s.color) ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
