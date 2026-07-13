import { Download, ExternalLink, FileText } from 'lucide-react'
import { cn } from '@/lib/cn'

export const CARRIER_CONFIRMATION_PDF = '/docs/Carrier_Confirmation_11441197.pdf'
export const CARRIER_CONFIRMATION_ID = '11441197'

export function CarrierConfirmationPdf({
  className,
  compact,
  title = `Carrier Confirmation ${CARRIER_CONFIRMATION_ID}`,
}: {
  className?: string
  compact?: boolean
  title?: string
}) {
  return (
    <section className={cn('dd-pdf-panel', compact && 'is-compact', className)}>
      <div className="dd-pdf-panel__head">
        <div className="dd-pdf-panel__title">
          <FileText size={14} />
          <div>
            <strong>{title}</strong>
            <em>Carrier information · PDF document</em>
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
          <a className="dd-pill-btn" href={CARRIER_CONFIRMATION_PDF} download>
            <Download size={14} />
            Download
          </a>
        </div>
      </div>
      <div className="dd-pdf-panel__frame">
        <iframe
          title={title}
          src={`${CARRIER_CONFIRMATION_PDF}#toolbar=0&navpanes=0&scrollbar=1`}
        />
      </div>
    </section>
  )
}
