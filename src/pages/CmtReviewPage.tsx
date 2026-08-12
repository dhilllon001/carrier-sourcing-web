import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  ExternalLink,
  FileText,
  Shield,
  X,
} from 'lucide-react'
import { cmtReviewQueue, type CmtReviewItem } from '@/data/cmtReview'

type Props = {
  search: string
  refreshKey: number
}

export function CmtReviewPage({ search, refreshKey }: Props) {
  const [items, setItems] = useState(() => [...cmtReviewQueue])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    setItems([...cmtReviewQueue])
    setActiveId(null)
  }, [refreshKey])

  const pending = useMemo(() => items.filter((r) => r.status === 'Pending'), [items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return pending
    return pending.filter(
      (r) =>
        r.carrier.toLowerCase().includes(q) ||
        r.mc.includes(q) ||
        (r.dot ?? '').includes(q) ||
        r.loadId.toLowerCase().includes(q) ||
        r.origin.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        r.equipment.toLowerCase().includes(q) ||
        r.flags.some((f) => f.code.toLowerCase().includes(q) || f.detail.toLowerCase().includes(q))
    )
  }, [pending, search])

  const active = filtered.find((r) => r.id === activeId) ?? null

  const decide = (id: string, status: 'Approved' | 'Rejected') => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    setActiveId(null)
    setToast(status === 'Approved' ? 'Override approved' : 'Override rejected')
    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <div className="cmt-page">
      <div className="cmt-toolbar">
        <span>
          <strong>{filtered.length}</strong> pending
        </span>
      </div>

      <div className="cmt-board">
        {filtered.length === 0 && (
          <div className="cmt-empty">
            <Shield size={24} strokeWidth={1.5} />
            <strong>Queue clear</strong>
            <p>No pending CMT overrides match this search.</p>
          </div>
        )}

        {filtered.map((item) => (
          <CmtCard key={item.id} item={item} onReview={() => setActiveId(item.id)} />
        ))}
      </div>

      {active && (
        <div className="cmt-drawer" role="dialog" aria-modal="true" aria-label="Review override">
          <button
            type="button"
            className="cmt-drawer__backdrop"
            aria-label="Close"
            onClick={() => setActiveId(null)}
          />
          <aside className="cmt-drawer__panel">
            <header className="cmt-drawer__head">
              <div>
                <span className="cmt-eyebrow">CMT override</span>
                <strong>{active.carrier}</strong>
                <em>
                  MC# {active.mc}
                  {active.dot ? ` · DOT ${active.dot}` : ''} · {active.loadId}
                </em>
              </div>
              <button
                type="button"
                className="sr-btn sr-btn--icon"
                aria-label="Close review"
                onClick={() => setActiveId(null)}
              >
                <X size={15} />
              </button>
            </header>

            <div className="cmt-drawer__body">
              <div className="cmt-route cmt-route--block">
                <div>
                  <strong>{active.origin}</strong>
                  <em>{active.pickupAt}</em>
                </div>
                <div className="cmt-route__mid">
                  <span />
                  <b>{active.miles.toFixed(1)} mi</b>
                  <span />
                </div>
                <div className="is-end">
                  <strong>{active.destination}</strong>
                  <em>{active.deliveryAt}</em>
                </div>
              </div>

              <div className="cmt-drawer__rate">
                <span>Proposed rate</span>
                <strong>{active.proposedRate}</strong>
                <em>
                  {active.currency} · {active.equipment}
                </em>
              </div>

              <div className="cmt-drawer__flags">
                <span className="cmt-eyebrow">Flags</span>
                {active.flags.map((f) => (
                  <div key={f.id} className="cmt-flag-row">
                    <strong>{f.code}</strong>
                    <span>{f.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <footer className="cmt-drawer__foot">
              <button
                type="button"
                className="cmt-btn cmt-btn--ghost"
                onClick={() => decide(active.id, 'Rejected')}
              >
                <X size={14} />
                Reject
              </button>
              <a className="cmt-link" href="#log" onClick={(e) => e.preventDefault()}>
                <FileText size={13} />
                View log
              </a>
              <button
                type="button"
                className="cmt-btn cmt-btn--gold"
                onClick={() => decide(active.id, 'Approved')}
              >
                <Check size={14} />
                Approve
                <ExternalLink size={13} />
              </button>
            </footer>
          </aside>
        </div>
      )}

      {toast && <div className="cmt-toast">{toast}</div>}
    </div>
  )
}

function CmtCard({
  item,
  onReview,
}: {
  item: CmtReviewItem
  onReview: () => void
}) {
  return (
    <article className="cmt-card">
      <div className="cmt-card__col cmt-card__col--carrier">
        <strong>{item.carrier}</strong>
        <em>
          MC# {item.mc}
          {item.dot ? ` · DOT ${item.dot}` : ''}
        </em>
        <span>
          {item.loadId} · {item.equipment}
        </span>
      </div>

      <div className="cmt-card__col cmt-card__col--route">
        <div className="cmt-route">
          <div>
            <strong>{item.origin}</strong>
            <em>{item.pickupAt}</em>
          </div>
          <div className="cmt-route__mid">
            <span />
            <b>{item.miles.toFixed(1)} mi</b>
            <span />
          </div>
          <div className="is-end">
            <strong>{item.destination}</strong>
            <em>{item.deliveryAt}</em>
          </div>
        </div>
      </div>

      <div className="cmt-card__col cmt-card__col--flags">
        {item.flags.map((f) => (
          <span key={f.id} className="cmt-chip" title={f.detail}>
            {f.code}
          </span>
        ))}
      </div>

      <div className="cmt-card__col cmt-card__col--rate">
        <strong>{item.proposedRate}</strong>
        <em>{item.submittedAt}</em>
      </div>

      <div className="cmt-card__col cmt-card__col--action">
        <button type="button" className="cmt-btn cmt-btn--gold" onClick={onReview}>
          Review
          <ExternalLink size={13} />
        </button>
        <a className="cmt-link" href="#log" onClick={(e) => e.preventDefault()}>
          View log
        </a>
      </div>
    </article>
  )
}
