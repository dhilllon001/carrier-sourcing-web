import { useMemo, useState } from 'react'
import {
  Check,
  CloudUpload,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Share2,
  Star,
  Trophy,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import type { LoadDetail } from '@/data/loadDetail'

function ModeChip({ mode }: { mode: string }) {
  return (
    <span className={cn('dd-chip', `dd-chip--${mode.toLowerCase()}`)}>
      Mode: {mode}
    </span>
  )
}

function WorkflowChip() {
  return <span className="dd-chip">Workflow: Simultaneous</span>
}

/* ── Find & Post (purple table) ── */
export function FindPostView({
  detail,
  onPostLoad,
}: {
  detail: LoadDetail
  onPostLoad: () => void
}) {
  const [q, setQ] = useState('')
  const rows = detail.carriers.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      (c.mc ?? '').includes(q) ||
      (c.dot ?? '').toLowerCase().includes(q.toLowerCase()) ||
      (c.email ?? '').toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="dd-stage dd-find">
      <div className="dd-stage__head">
        <div>
          <h2 className="dd-stage__title">Find &amp; Post</h2>
          <p className="dd-stage__sub">
            Search carriers, blast outreach, and post this load to marketplaces.
          </p>
        </div>
        <div className="dd-stage__head-meta">
          <ModeChip mode={detail.load.mode} />
          <WorkflowChip />
        </div>
      </div>

      <div className="dd-find__bar">
        <label className="dd-search">
          <Search size={14} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search carrier, MC #, or contact…"
          />
        </label>

        <div className="dd-find__meta">
          <ModeChip mode={detail.load.mode} />
          <span className="dd-meta-pill">Last email · 2h ago</span>
          <span className="dd-meta-pill">Last WhatsApp · —</span>
        </div>

        <div className="dd-find__actions">
          <button type="button" className="dd-icon-btn" aria-label="Refresh">
            <RefreshCw size={14} />
          </button>
          <button type="button" className="dd-btn dd-btn--mail">
            <Mail size={14} />
            Blast Email
          </button>
          <button type="button" className="dd-btn dd-btn--wa">
            <MessageCircle size={14} />
            Blast WhatsApp
          </button>
          <button type="button" className="dd-btn dd-btn--primary" onClick={onPostLoad}>
            <Share2 size={14} />
            Post to Load
          </button>
        </div>
      </div>

      <div className="dd-card dd-find__table-wrap dd-find__table-wrap--purple">
        <table className="dd-carrier-table dd-carrier-table--purple">
          <thead>
            <tr>
              <th className="col-check" />
              <th>Carrier</th>
              <th>MC # / DOT #</th>
              <th>Source</th>
              <th>Last used</th>
              <th>DH-P</th>
              <th>DH-D</th>
              <th>Last rate</th>
              <th>Loads</th>
              <th>Legs</th>
              <th>Offer</th>
              <th>Config rate</th>
              <th>Updated</th>
              <th>Contact</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  <input type="checkbox" aria-label={`Select ${c.name}`} />
                </td>
                <td>
                  <div className="dd-carrier-name">
                    {c.favorite && <Star size={12} className="is-star" />}
                    <div>
                      <strong>{c.name}</strong>
                      {c.dot && <span className="dd-carrier-sub">DOT: {c.dot}</span>}
                    </div>
                  </div>
                </td>
                <td className="mono">{c.mc ? `MC: ${c.mc}` : c.dot ? `DOT: ${c.dot}` : '—'}</td>
                <td>
                  <span className={cn('dd-source', `dd-source--${c.source.toLowerCase()}`)}>
                    {c.source}
                  </span>
                </td>
                <td>
                  <div className="dd-last-used">
                    <span>{c.lastUsed}</span>
                    <span>{c.lastUsedRel}</span>
                  </div>
                </td>
                <td className="mono">{c.dhP}</td>
                <td className="mono">{c.dhD}</td>
                <td className="mono">{c.lastRate}</td>
                <td className="mono">{c.loads}</td>
                <td className="mono">{c.legs}</td>
                <td className="dd-muted">{c.offer ?? 'Not sent'}</td>
                <td className="mono">{c.configRate ?? '—'}</td>
                <td className="dd-muted">{c.updated ?? '—'}</td>
                <td>
                  {c.phone ? <a className="dd-link" href={`tel:${c.phone}`}>{c.phone}</a> : '—'}
                </td>
                <td>
                  {c.email ? <a className="dd-link" href={`mailto:${c.email}`}>{c.email}</a> : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Offers & Bids ── */
export function OffersBidsView({
  detail,
  onAddOffer,
}: {
  detail: LoadDetail
  onAddOffer: () => void
}) {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(detail.bids[0]?.id)
  const [msg, setMsg] = useState('')
  const bid = detail.bids.find((b) => b.id === selected) ?? detail.bids[0]
  const counts = useMemo(() => {
    const base = {
      All: detail.bids.length,
      Drafted: 0,
      Pending: 0,
      Countered: 0,
      Accepted: 0,
      Rejected: 0,
      Closed: 0,
    }
    for (const b of detail.bids) {
      if (b.status === 'Pending') base.Pending++
      if (b.status === 'Sent') base.Pending++
      if (b.status === 'Accepted') base.Accepted++
      if (b.status === 'Rejected') base.Rejected++
      if (b.status === 'Countered') base.Countered++
      if (b.status === 'Drafted') base.Drafted++
      if (b.status === 'Closed') base.Closed++
    }
    return base
  }, [detail.bids])

  const filtered =
    filter === 'All'
      ? detail.bids
      : detail.bids.filter((b) =>
          filter === 'Pending' ? b.status === 'Pending' || b.status === 'Sent' : b.status === filter
        )

  const stop = detail.stops[0]
  const del = detail.stops[detail.stops.length - 1]

  return (
    <div className="dd-stage dd-offers">
      <div className="dd-stage__head">
        <div>
          <h2 className="dd-stage__title">Offers &amp; Bids</h2>
          <p className="dd-stage__sub">Negotiate offers, accept, counter, or reject.</p>
        </div>
        <div className="dd-stage__head-meta">
          <ModeChip mode={detail.load.mode} />
          <WorkflowChip />
          <button type="button" className="dd-btn">
            <RefreshCw size={14} />
            Re-send Offers
          </button>
          <button type="button" className="dd-btn dd-btn--success">
            <Check size={14} />
            Mark reviewed
          </button>
          <button type="button" className="dd-btn dd-btn--primary" onClick={onAddOffer}>
            <Plus size={14} />
            Add Offer
          </button>
        </div>
      </div>

      <div className="dd-offers__grid">
        <aside className="dd-card dd-bids-list">
          <div className="dd-bids-list__head">
            <strong>Carrier Bids</strong>
            <span className="dd-best-pill">Best offer {bid?.amount ?? '—'}</span>
          </div>
          <label className="dd-search">
            <Search size={13} />
            <input placeholder="Search bids…" />
          </label>
          <div className="dd-bid-filters">
            {Object.entries(counts).map(([k, n]) => (
              <button
                key={k}
                type="button"
                className={cn(filter === k && 'is-active')}
                onClick={() => setFilter(k)}
              >
                {k} {n}
              </button>
            ))}
          </div>
          <div className="dd-bid-cards">
            {filtered.map((b) => (
              <button
                key={b.id}
                type="button"
                className={cn('dd-bid-card', selected === b.id && 'is-selected')}
                onClick={() => setSelected(b.id)}
              >
                <div className="dd-bid-card__top">
                  <strong>{b.carrier}</strong>
                  <div className="dd-bid-card__tags">
                    {b.best && <span className="dd-tag-best">Best</span>}
                    <span className="dd-tag-status">{b.status}</span>
                  </div>
                </div>
                <div className="dd-bid-card__meta">MC# {b.mc}</div>
                <div className="dd-bid-card__row">
                  <span>
                    Bid <strong className="is-pos">{b.amount}</strong>
                  </span>
                  <span className="dd-muted">{b.vsTarget}</span>
                </div>
                <span className="dd-btn dd-btn--danger-ghost">Reject offer</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="dd-card dd-bid-thread">
          {bid ? (
            <>
              <div className="dd-bid-thread__head">
                <div>
                  <strong>{bid.carrier}</strong>
                  <div className="dd-muted">MC# {bid.mc}</div>
                </div>
                <span className="dd-tag-status">{bid.status}</span>
              </div>
              <div className="dd-bid-thread__body">
                <article className="dd-offer-bubble">
                  <div className="dd-offer-bubble__id">
                    Load #{detail.orderNumber} · <strong>{bid.amount}</strong>
                  </div>
                  <div className="dd-offer-bubble__stops">
                    <div>
                      <span>Pickup</span>
                      <strong>{stop?.facility}</strong>
                      <em>{stop?.when}</em>
                    </div>
                    <div>
                      <span>Delivery</span>
                      <strong>{del?.facility}</strong>
                      <em>{del?.when}</em>
                    </div>
                  </div>
                </article>
              </div>
              <div className="dd-quick-replies">
                {[
                  'Can you do $2,500 all-in?',
                  'What’s your earliest pickup?',
                  'Confirm equipment type',
                ].map((t) => (
                  <button key={t} type="button" onClick={() => setMsg(t)}>
                    {t}
                  </button>
                ))}
              </div>
              <label className="dd-composer">
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Type a message…"
                />
                <button type="button" className="dd-icon-btn" aria-label="Send">
                  <Send size={14} />
                </button>
              </label>
            </>
          ) : (
            <div className="dd-empty-state">No bids yet</div>
          )}
        </section>
      </div>
    </div>
  )
}

/* ── Finalize Tender ── */
export function FinalizeTenderView({ detail }: { detail: LoadDetail }) {
  const awarded = detail.bids.find((b) => b.status === 'Accepted')

  return (
    <div className="dd-stage">
      <div className="dd-stage__head">
        <div>
          <h2 className="dd-stage__title">Finalize Tender</h2>
          <p className="dd-stage__sub">
            Confirm the awarded carrier, review rates, and clear compliance checks.
          </p>
        </div>
        <button type="button" className="dd-btn dd-btn--success" disabled={!awarded}>
          <Check size={14} />
          Confirm Carrier
        </button>
      </div>

      {awarded ? (
        <div className="dd-card dd-finalize-card">
          <div className="dd-fields dd-fields--wide">
            <div className="dd-field">
              <div className="dd-field__label">Carrier</div>
              <div className="dd-field__value">{awarded.carrier}</div>
            </div>
            <div className="dd-field">
              <div className="dd-field__label">MC #</div>
              <div className="dd-field__value mono">{awarded.mc}</div>
            </div>
            <div className="dd-field">
              <div className="dd-field__label">Awarded rate</div>
              <div className="dd-field__value mono">{awarded.amount}</div>
            </div>
            <div className="dd-field">
              <div className="dd-field__label">Team</div>
              <div className="dd-field__value">{detail.load.team}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="dd-card dd-empty-state dd-empty-state--lg">
          <Trophy size={28} strokeWidth={1.5} />
          <strong>No awarded carrier yet</strong>
          <p>Accept a bid in Offers &amp; Bids to populate this view.</p>
        </div>
      )}
    </div>
  )
}

/* ── Post to Marketplace modal ── */
export function PostMarketplaceModal({
  detail,
  onClose,
}: {
  detail: LoadDetail
  onClose: () => void
}) {
  const pickup = detail.stops[0]
  const delivery = detail.stops[detail.stops.length - 1]
  const [refreshEvery, setRefreshEvery] = useState('6')
  const [contact, setContact] = useState<'Email' | 'Phone'>('Email')

  return (
    <div className="dd-modal-root" role="dialog" aria-modal="true">
      <button type="button" className="dd-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="dd-modal">
        <header className="dd-modal__head">
          <div>
            <h3>Post Load to Marketplace</h3>
            <p>
              Pro {detail.load.id} · {detail.load.identifier}
            </p>
          </div>
          <button type="button" className="dd-icon-btn dd-icon-btn--light" onClick={onClose}>
            <X size={16} />
          </button>
        </header>

        <div className="dd-modal__body">
          <section className="dd-modal-card">
            <div className="dd-card__title">Load details</div>
            <div className="dd-modal-route">
              <article>
                <span>
                  Pickup {pickup?.when}
                </span>
                <strong>{pickup?.facility}</strong>
                <em>{pickup?.address}</em>
                <i className={cn('dd-stop__status', `is-${pickup?.statusTone}`)}>
                  {pickup?.status}
                </i>
              </article>
              <div className="dd-modal-route__mid">{detail.load.miles} mi</div>
              <article>
                <span>
                  Delivery {delivery?.when}
                </span>
                <strong>{delivery?.facility}</strong>
                <em>{delivery?.address}</em>
                <i className={cn('dd-stop__status', `is-${delivery?.statusTone}`)}>
                  {delivery?.status}
                </i>
              </article>
            </div>
            <div className="dd-modal-grid">
              <label>
                Load type
                <input readOnly value={detail.type} />
              </label>
              <label>
                Equipment *
                <input readOnly value={detail.load.equipment} />
              </label>
              <label>
                Contact name
                <input readOnly value={detail.salesRep} />
              </label>
              <label>
                Primary phone
                <input readOnly value="N/A" />
              </label>
              <label>
                Alternate phone
                <input readOnly value="N/A" />
              </label>
              <label>
                Email
                <input readOnly value={`${detail.salesRep.split(' ')[0].toLowerCase()}@chargerlogistics.com`} />
              </label>
            </div>
          </section>

          <section className="dd-modal-card">
            <div className="dd-card__title">Posting details</div>
            <div className="dd-modal-grid">
              <label>
                Posting as
                <input defaultValue="desk@chargerlogistics.com" />
              </label>
              <label>
                Audience
                <select defaultValue="Public">
                  <option>Public</option>
                  <option>Private network</option>
                </select>
              </label>
              <div className="dd-seg">
                <span className="dd-field__label">Preferred contact</span>
                <div>
                  {(['Email', 'Phone'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={cn(contact === c && 'is-active')}
                      onClick={() => setContact(c)}
                    >
                      {contact === c && <Check size={12} />}
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <label>
                Price
                <input defaultValue={detail.bookNowRate === '—' ? '$0.93' : detail.bookNowRate} />
              </label>
            </div>
            <div className="dd-refresh-chips">
              <span className="dd-field__label">Refresh interval</span>
              <div>
                {['1', '3', '6', '12', '24'].map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={cn(refreshEvery === h && 'is-active')}
                    onClick={() => setRefreshEvery(h)}
                  >
                    {refreshEvery === h && <Check size={12} />}
                    Every {h} hour{h === '1' ? '' : 's'}
                  </button>
                ))}
              </div>
            </div>
            <label>
              Team
              <select defaultValue="">
                <option value="">Select team (optional)</option>
                <option>{detail.load.team}</option>
              </select>
            </label>
          </section>

          <section className="dd-modal-card">
            <div className="dd-card__title">Marketplaces</div>
            <button type="button" className="dd-market-tile is-active">
              <Check size={14} />
              DAT
            </button>
            <p className="dd-muted">Will post to 1 marketplace.</p>
          </section>

          <section className="dd-modal-card">
            <div className="dd-card__title">Notes</div>
            <textarea placeholder="Any extra context for the marketplace listing…" />
          </section>
        </div>

        <footer className="dd-modal__foot">
          <button type="button" className="dd-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="dd-btn dd-btn--primary" onClick={onClose}>
            <CloudUpload size={14} />
            Post Load
          </button>
        </footer>
      </div>
    </div>
  )
}

/* ── Manual Offer modal ── */
export function ManualOfferModal({ onClose }: { onClose: () => void }) {
  const [notify, setNotify] = useState('Email')
  const [name, setName] = useState('')

  return (
    <div className="dd-modal-root" role="dialog" aria-modal="true">
      <button type="button" className="dd-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="dd-modal">
        <header className="dd-modal__head">
          <div>
            <div className="dd-modal__eyebrow">Manual offer</div>
            <h3>Log offer on behalf of carrier</h3>
            <p>
              Capture a quote you took outside the platform. The carrier is matched automatically if
              the contact info already exists.
            </p>
          </div>
          <button type="button" className="dd-icon-btn dd-icon-btn--light" onClick={onClose}>
            <X size={16} />
          </button>
        </header>
        <div className="dd-modal__body">
          <section className="dd-modal-card">
            <div className="dd-card__title">Carrier</div>
            <div className="dd-modal-grid">
              <label className="dd-span-2">
                Carrier name *
                <span className="dd-input-icon">
                  <Search size={14} />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Type at least 2 letters to search…"
                  />
                </span>
              </label>
              <label>
                MC #
                <input placeholder="MC-123456" />
              </label>
              <label>
                DOT #
                <input placeholder="DOT-987654" />
              </label>
            </div>
          </section>
          <section className="dd-modal-card">
            <div className="dd-card__title">Contact</div>
            <div className="dd-modal-grid dd-modal-grid--3">
              <label>
                Contact name
                <input placeholder="John Doe" />
              </label>
              <label>
                Phone
                <span className="dd-input-icon">
                  <Phone size={14} />
                  <input placeholder="+1 (555) 000-0000" />
                </span>
              </label>
              <label>
                Email
                <input placeholder="dispatch@acme.example" />
              </label>
            </div>
          </section>
          <section className="dd-modal-card">
            <div className="dd-card__title">Quote</div>
            <div className="dd-modal-grid">
              <label>
                Source
                <select defaultValue="Phone">
                  <option>Phone</option>
                  <option>Email</option>
                  <option>WhatsApp</option>
                </select>
              </label>
              <label>
                Quote (USD) *
                <input placeholder="$0.00" />
              </label>
              <label className="dd-span-2">
                Notes — optional
                <textarea placeholder="Quoted during dispatcher call at 10:42 EDT" />
              </label>
            </div>
          </section>
          <section className="dd-modal-card">
            <div className="dd-card__title">Notify</div>
            <div className="dd-notify">
              {['Email', 'SMS', 'WhatsApp'].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={cn(notify === n && 'is-active')}
                  onClick={() => setNotify(n)}
                >
                  {notify === n && <Check size={14} />}
                  {n}
                </button>
              ))}
            </div>
          </section>
        </div>
        <footer className="dd-modal__foot">
          {!name.trim() && <span className="dd-form-error">Carrier name is required.</span>}
          <div className="dd-modal__foot-actions">
            <button type="button" className="dd-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="dd-btn dd-btn--primary"
              disabled={!name.trim()}
              onClick={onClose}
            >
              <Plus size={14} />
              Add Log offer
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
