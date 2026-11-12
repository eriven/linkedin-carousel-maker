# LinkedIn Carousel Maker

Turn a set of images into a multi-page PDF for LinkedIn document/carousel posts. Create a custom hook image as page 1 (thumbnail), then append your content slides.

## Requirements

- Node.js 18+

## Commands

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview production build
```

## User flow

1. Select or drop multiple images on the homepage.
2. Reorder (drag) or remove slides.
3. Optionally **Create hook image** (background, text, colors, font) or **Skip**.
4. **Continue to preview** — review order (hook → slides).
5. **Generate PDF** — downloads `linkedin-carousel.pdf`.

## PDF page size

All pages are **1080×1350** (4:5). Uploaded slides are **letterboxed** (contain) onto that frame; the hook fills the page.

## Tech

- Vite + React + TypeScript
- Tailwind CSS
- Canvas hook rendering (`src/lib/drawHookCanvas.ts`)
- pdf-lib (client-side PDF, no backend)

See [SPEC.md](./SPEC.md) for product details.

## Deploy (Git + Vercel)

See [DEPLOY.md](./DEPLOY.md) for initializing git, pushing to GitHub, and connecting Vercel for automatic production and preview deploys.
