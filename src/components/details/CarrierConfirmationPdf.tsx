import { useEffect, useState } from 'react'
import { Download, ExternalLink, FileText, LoaderCircle } from 'lucide-react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { cn } from '@/lib/cn'

GlobalWorkerOptions.workerSrc = pdfWorker

export const CARRIER_CONFIRMATION_PDF = '/docs/Carrier_Confirmation_11441197.pdf'
export const CARRIER_CONFIRMATION_ID = '11441197'

type PagePreview = {
  pageNumber: number
  dataUrl: string
  width: number
  height: number
}

async function renderPdfPages(url: string): Promise<PagePreview[]> {
  const loadingTask = getDocument({ url, withCredentials: false })
  const pdf = await loadingTask.promise
  const pages: PagePreview[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const base = page.getViewport({ scale: 1 })
    const scale = Math.min(1.55, 860 / base.width)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) continue

    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    await page.render({ canvas, canvasContext: context, viewport }).promise
    pages.push({
      pageNumber,
      dataUrl: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height,
    })
  }

  return pages
}

export function CarrierConfirmationPdf({
  className,
  compact,
  title = `Carrier Confirmation ${CARRIER_CONFIRMATION_ID}`,
}: {
  className?: string
  compact?: boolean
  title?: string
}) {
  const [pages, setPages] = useState<PagePreview[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setError('')

    renderPdfPages(CARRIER_CONFIRMATION_PDF)
      .then((next) => {
        if (cancelled) return
        setPages(next)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Unable to load PDF')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className={cn('dd-pdf-panel', compact && 'is-compact', className)}>
      <div className="dd-pdf-panel__head">
        <div className="dd-pdf-panel__title">
          <span className="dd-pdf-panel__ico">
            <FileText size={15} />
          </span>
          <div>
            <strong>{title}</strong>
            <em>
              {status === 'ready'
                ? `${pages.length} page${pages.length === 1 ? '' : 's'} · Carrier_Confirmation_${CARRIER_CONFIRMATION_ID}.pdf`
                : 'Carrier information · PDF document'}
            </em>
          </div>
        </div>
        <div className="dd-pdf-panel__actions">
          <a
            className="dd-pill-btn"
            href={CARRIER_CONFIRMATION_PDF}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={14} />
            Open
          </a>
          <a className="dd-pill-btn dd-pill-btn--emphasis" href={CARRIER_CONFIRMATION_PDF} download>
            <Download size={14} />
            Download
          </a>
        </div>
      </div>

      <div className="dd-pdf-panel__body">
        {status === 'loading' && (
          <div className="dd-pdf-panel__state">
            <LoaderCircle size={18} className="dd-pdf-spin" />
            <span>Loading carrier confirmation…</span>
          </div>
        )}

        {status === 'error' && (
          <div className="dd-pdf-panel__state is-error">
            <strong>Couldn’t preview the PDF</strong>
            <span>{error || 'Open or download the file instead.'}</span>
            <a className="dd-pill-btn dd-pill-btn--emphasis" href={CARRIER_CONFIRMATION_PDF} target="_blank" rel="noreferrer">
              Open PDF
            </a>
          </div>
        )}

        {status === 'ready' && (
          <div className="dd-pdf-pages">
            {pages.map((page) => (
              <figure key={page.pageNumber} className="dd-pdf-page">
                <figcaption>Page {page.pageNumber}</figcaption>
                <img
                  src={page.dataUrl}
                  alt={`Carrier confirmation page ${page.pageNumber}`}
                  width={page.width}
                  height={page.height}
                />
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
