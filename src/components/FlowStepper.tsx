import { Link, useLocation } from 'react-router-dom'
import { pathnameToStep, stepToPath, type FlowStep } from '../routes'

const STEPS: { id: FlowStep; label: string }[] = [
  { id: 'images', label: 'Images' },
  { id: 'hook', label: 'Hook' },
  { id: 'preview', label: 'Preview' },
  { id: 'done', label: 'Done' },
]

interface FlowStepperProps {
  hasSlides: boolean
  hasHook: boolean
}

function stepIndex(step: FlowStep): number {
  return STEPS.findIndex((s) => s.id === step)
}

function canNavigateTo(
  target: FlowStep,
  current: FlowStep,
  hasSlides: boolean,
): boolean {
  if (target === 'images') return true
  if (!hasSlides) return false
  if (target === 'hook') return true
  if (target === 'preview' || target === 'done') return true
  return stepIndex(target) <= stepIndex(current)
}

export function FlowStepper({ hasSlides, hasHook }: FlowStepperProps) {
  const location = useLocation()
  const current = pathnameToStep(location.pathname)

  if (!hasSlides && current === 'images') return null

  return (
    <nav
      aria-label="Carousel progress"
      className="mx-auto mb-8 flex max-w-lg flex-wrap items-center justify-center gap-1 text-xs sm:gap-2 sm:text-sm"
    >
      {STEPS.map((step, i) => {
        const idx = stepIndex(current)
        const targetIdx = stepIndex(step.id)
        const isCurrent = step.id === current
        const isPast = targetIdx < idx
        const isFuture = targetIdx > idx
        const reachable = canNavigateTo(step.id, current, hasSlides)

        const dot = (
          <span
            className={`whitespace-nowrap px-2 py-1 rounded-full ${
              isCurrent
                ? 'bg-gray-900 font-semibold text-white'
                : isPast
                  ? 'text-gray-700'
                  : 'text-gray-400'
            } ${!reachable && isFuture ? 'opacity-50' : ''}`}
          >
            {step.label}
            {step.id === 'hook' && hasHook && !isCurrent ? ' ✓' : ''}
          </span>
        )

        return (
          <span key={step.id} className="flex items-center gap-1 sm:gap-2">
            {i > 0 && (
              <span className="text-gray-300" aria-hidden>
                →
              </span>
            )}
            {reachable && !isCurrent ? (
              <Link
                to={stepToPath(step.id)}
                className="hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {dot}
              </Link>
            ) : (
              dot
            )}
          </span>
        )
      })}
    </nav>
  )
}