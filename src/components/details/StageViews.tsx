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

/* ── Find & Post ── */
export function FindPostView({
  detail,
  onPostLoad,
  onAdvanceToOffers,
}: {
  detail: LoadDetail
  onPostLoad: () => void
  onAdvanceToOffers: () => void
}) {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const rows = detail.carriers.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      (c.mc ?? '').includes(q) ||
      (c.dot ?? '').toLowerCase().includes(q.toLowerCase()) ||
      (c.email ?? '').toLowerCase().includes(q.toLowerCase())
  )

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === rows.length) setSelected(new Set())
    else setSelected(new Set(rows.map((r) => r.id)))
  }

  const blast = () => {
    if (selected.size === 0) return
    onAdvanceToOffers()
  }

  return (
    <div className="dd-stage dd-find">
      <div className="dd-find__bar">
        <label className="dd-search dd-search--toolbar">
          <Search size={14} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search carrier, MC #, or contact…"
          />
        </label>

        <span className="dd-chip-soft">Workflow · Simultaneous</span>

        <div className="dd-find__actions">
          <button type="button" className="dd-pill-btn" aria-label="Refresh">
            <RefreshCw size={14} />
          </button>
          <button
            type="button"
            className="dd-pill-btn"
            disabled={selected.size === 0}
            onClick={blast}
          >
            <Mail size={14} />
            Last Email
          </button>
          <button
            type="button"
            className="dd-pill-btn"
            disabled={selected.size === 0}
            onClick={blast}
          >
            <MessageCircle size={14} />
            Last WhatsApp
          </button>
          <button type="button" className="dd-pill-btn dd-pill-btn--emphasis" onClick={onPostLoad}>
            <Share2 size={14} />
            Post to Load
          </button>
        </div>
      </div>

      <div className="dd-find__table-wrap">
        <table className="dd-carrier-table">
          <thead>
            <tr>
              <th className="col-check">
                <input
                  type="checkbox"
                  checked={rows.length > 0 && selected.size === rows.length}
                  onChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
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
            {rows.map((c) => {
              const idLine = [c.mc ? `MC ${c.mc}` : null, c.dot ? `DOT ${c.dot}` : null]
                .filter(Boolean)
                .join(' · ')
              return (
                <tr key={c.id} className={cn(selected.has(c.id) && 'is-selected')}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggle(c.id)}
                      aria-label={`Select ${c.name}`}
                    />
                  </td>
                  <td>
                    <div className="dd-carrier-name">
                      {c.favorite && <Star size={12} className="is-star" />}
                      <span className="dd-carrier-name__text">{c.name}</span>
                    </div>
                  </td>
                  <td className="mono">{idLine || '—'}</td>
                  <td>
                    <span className={cn('dd-source', `dd-source--${c.source.toLowerCase()}`)}>
                      {c.source}
                    </span>
                  </td>
                  <td className="mono">
                    {c.lastUsed !== '—' ? `${c.lastUsed} · ${c.lastUsedRel}` : c.lastUsedRel}
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
                    {c.phone ? (
                      <a className="dd-link" href={`tel:${c.phone}`}>
                        {c.phone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {c.email ? (
                      <a className="dd-link" href={`mailto:${c.email}`}>
                        {c.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              )
            })}
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
  const [messages, setMessages] = useState<
    { id: string; from: 'them' | 'me'; text: string; time: string }[]
  >([
    {
      id: 'm1',
      from: 'them',
      text: 'We can cover this lane. Quote attached on the offer card.',
      time: '12:36 PM',
    },
  ])
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

  const send = () => {
    const text = msg.trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      { id: `m${Date.now()}`, from: 'me', text, time: 'Just now' },
    ])
    setMsg('')
  }

  return (
    <div className="dd-stage dd-offers">
      <div className="dd-stage__toolbar">
        <span className="dd-chip-soft">Workflow · Simultaneous</span>
        <div className="dd-stage__toolbar-spacer" />
        <button type="button" className="dd-pill-btn">
          <RefreshCw size={14} />
          Re-send Offers
        </button>
        <button type="button" className="dd-pill-btn">
          <Check size={14} />
          Mark reviewed
        </button>
        <button type="button" className="dd-pill-btn dd-pill-btn--emphasis" onClick={onAddOffer}>
          <Plus size={14} />
          Add Offer
        </button>
      </div>

      <div className="dd-offers__grid">
        <aside className="dd-bids-panel">
          <div className="dd-bids-list__head">
            <strong>Carrier Bids</strong>
            <span className="dd-best-pill">Best {bid?.amount ?? '—'}</span>
          </div>
          <label className="dd-search dd-search--sm dd-search--fixed">
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
                className={cn('dd-bid-card', selected === b.id && 'is-selected', b.best && 'is-best')}
                onClick={() => setSelected(b.id)}
              >
                <div className="dd-bid-card__top">
                  <div className="dd-bid-card__identity">
                    <strong>{b.carrier}</strong>
                    <span className="dd-bid-card__meta">MC# {b.mc}</span>
                  </div>
                  <div className="dd-bid-card__tags">
                    {b.best && <span className="dd-tag-best">Best</span>}
                    <span className="dd-tag-status">{b.status}</span>
                  </div>
                </div>
                <div className="dd-bid-card__row">
                  <div className="dd-bid-card__bid">
                    <span>Bid</span>
                    <strong>{b.amount}</strong>
                  </div>
                  <span className={cn('dd-bid-card__delta', b.vsTarget.startsWith('-') && 'is-pos')}>
                    {b.vsTarget}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="dd-wa">
          {bid ? (
            <>
              <div className="dd-wa__head">
                <div>
                  <strong>{bid.carrier}</strong>
                  <div className="dd-muted">MC# {bid.mc}</div>
                </div>
                <span className="dd-tag-status">{bid.status}</span>
              </div>

              <div className="dd-wa__thread">
                <div className="dd-wa__day">Today</div>

                <div className="dd-wa-bubble dd-wa-bubble--them">
                  <div className="dd-wa-card">
                    <div className="dd-wa-card__top">
                      <div>
                        <span className="dd-wa-card__label">Offer</span>
                        <strong>Load #{detail.orderNumber}</strong>
                      </div>
                      <div className="dd-wa-card__rate">
                        <span>All-in</span>
                        <strong>{bid.amount}</strong>
                      </div>
                    </div>
                    <div className="dd-wa-route">
                      <div className="dd-wa-route__rail" aria-hidden>
                        <span className="dd-wa-route__dot is-pu" />
                        <span className="dd-wa-route__line" />
                        <span className="dd-wa-route__dot is-del" />
                      </div>
                      <div className="dd-wa-route__stops">
                        <div className="dd-wa-leg">
                          <span className="dd-wa-leg__label">Pickup</span>
                          <strong>{stop?.facility}</strong>
                          <em>
                            {stop?.city} · {stop?.when}
                          </em>
                        </div>
                        <div className="dd-wa-leg">
                          <span className="dd-wa-leg__label">Delivery</span>
                          <strong>{del?.facility}</strong>
                          <em>
                            {del?.city} · {del?.when}
                          </em>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="dd-wa-time">12:34 PM</span>
                </div>

                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'dd-wa-bubble',
                      m.from === 'me' ? 'dd-wa-bubble--me' : 'dd-wa-bubble--them'
                    )}
                  >
                    <p>{m.text}</p>
                    <span className="dd-wa-time">{m.time}</span>
                  </div>
                ))}
              </div>

              <div className="dd-wa__composer">
                <div className="dd-wa__quick">
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
                <div className="dd-wa__input-row">
                  <input
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Type a message…"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        send()
                      }
                    }}
                  />
                  <button type="button" className="dd-wa__send" aria-label="Send" onClick={send}>
                    <Send size={15} />
                  </button>
                </div>
              </div>
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
      <div className="dd-stage__toolbar">
        <p className="dd-stage__hint">
          Confirm the awarded carrier, review rates, and clear compliance checks.
        </p>
        <div className="dd-stage__toolbar-spacer" />
        <button type="button" className="dd-btn dd-btn--plain" disabled={!awarded}>
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
