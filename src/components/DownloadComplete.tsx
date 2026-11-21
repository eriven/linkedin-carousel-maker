import { useState } from 'react'
import { downloadPdf } from '../lib/buildPdf'

interface DownloadCompleteProps {
  pdfBytes: Uint8Array | null
  onStartOver: () => void
  onRegeneratePdf: () => Promise<Uint8Array>
}

export function DownloadComplete({
  pdfBytes: initialBytes,
  onStartOver,
  onRegeneratePdf,
}: DownloadCompleteProps) {
  const [pdfBytes, setPdfBytes] = useState(initialBytes)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownloadAgain = async () => {
    setError(null)
    try {
      let bytes = pdfBytes
      if (!bytes) {
        setRegenerating(true)
        bytes = await onRegeneratePdf()
        setPdfBytes(bytes)
        setRegenerating(false)
      }
      downloadPdf(bytes)
    } catch (e) {
      setRegenerating(false)
      setError(e instanceof Error ? e.message : 'Could not create PDF')
    }
  }

  return (
    <section className="mx-auto w-full max-w-md pt-8 text-center md:pt-16">
      <div className="rounded-2xl border border-gray-100 bg-white px-6 py-10 shadow-sm md:px-8">
        <p className="text-4xl text-brand" aria-hidden>
          ✓
        </p>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-800">
          Thanks for downloading!
        </h2>
        <p className="mt-3 text-sm text-gray-500">
          Your download has started. Upload the PDF to a LinkedIn document post.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Ready to make another carousel?
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onStartOver}
            className="rounded-md bg-brand px-6 py-3 text-base font-semibold text-white hover:bg-brand-hover"
          >
            Create another carousel
          </button>
          <button
            type="button"
            disabled={regenerating}
            onClick={() => void handleDownloadAgain()}
            className="rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {regenerating ? 'Preparing PDF…' : 'Download PDF again'}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600" role="status">
            {error}
          </p>
        )}
      </div>
    </section>
  )
}