import { useCallback, useRef, useState, type RefObject } from 'react'
import { imageFilesFromFileList } from '../lib/clipboardImages'

interface HomePageProps {
  onFilesSelected: (files: File[]) => void
  onOpenPaste: () => void
  pasteButtonRef?: RefObject<HTMLButtonElement | null>
  hasSlides: boolean
}

export function HomePage({
  onFilesSelected,
  onOpenPaste,
  pasteButtonRef,
  hasSlides,
}: HomePageProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const localPasteRef = useRef<HTMLButtonElement>(null)
  const pasteRef = pasteButtonRef ?? localPasteRef
  const [dragOver, setDragOver] = useState(false)

  const pickFiles = useCallback(
    (fileList: FileList | null) => {
      const images = imageFilesFromFileList(fileList)
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

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
          className="w-full max-w-xs rounded-md bg-brand px-8 py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-brand-hover sm:w-auto"
        >
          Select images
        </button>
        <button
          ref={pasteRef}
          type="button"
          onClick={onOpenPaste}
          className="w-full max-w-xs rounded-md border border-gray-300 bg-white px-8 py-4 text-lg font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50 sm:w-auto"
        >
          Paste images
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