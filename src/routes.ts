export const ROUTES = {
  home: '/',
  hook: '/hook',
  preview: '/preview',
  done: '/done',
} as const

export type FlowStep = 'images' | 'hook' | 'preview' | 'done'

export function pathnameToStep(pathname: string): FlowStep {
  if (pathname === ROUTES.hook) return 'hook'
  if (pathname === ROUTES.preview) return 'preview'
  if (pathname === ROUTES.done) return 'done'
  return 'images'
}

export function stepToPath(step: FlowStep): string {
  switch (step) {
    case 'hook':
      return ROUTES.hook
    case 'preview':
      return ROUTES.preview
    case 'done':
      return ROUTES.done
    default:
      return ROUTES.home
  }
}

export function isGuardedPath(pathname: string): boolean {
  return (
    pathname === ROUTES.hook ||
    pathname === ROUTES.preview ||
    pathname === ROUTES.done
  )
}