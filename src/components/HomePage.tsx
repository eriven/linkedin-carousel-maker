import { useCallback, useRef, useState } from 'react'

interface HomePageProps {
  onFilesSelected: (files: File[]) => void
  hasSlides: boolean
}

export function HomePage({ onFilesSelected, hasSlides }: HomePageProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const pickFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) return
      const images = Array.from(fileList).filter((f) =>
        f.type.startsWith('image/'),
      )
      if (images.length) onFilesSelected(images)
    },
    [onFilesSelected],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    pickFiles(e.dataTransfer.files)
  }

  return (
    <header
      className={`text-center transition-opacity ${hasSlides ? 'mb-10 opacity-90' : 'mb-16 pt-12 md:pt-20'}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <h1 className="text-4xl font-bold tracking-tight text-gray-800 md:text-5xl">
        LinkedIn Carousel Maker
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 md:text-lg">
        Turn your images into a LinkedIn-ready carousel PDF. Create a custom hook
        image that gets clicks.
      </p>

      <div className="mt-8">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            pickFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-brand px-8 py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-brand-hover"
        >
          Select images
        </button>
      </div>

      <p
        className={`mt-6 text-sm text-gray-400 ${dragOver ? 'font-medium text-brand' : ''}`}
      >
        or drop images here
      </p>
    </header>
  )
}
