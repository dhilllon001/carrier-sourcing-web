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
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import type { LoadDetail } from '@/data/loadDetail'
import { StageActionBar } from '@/components/details/StageActionBar'

/* ── Find & Post ── */
export function FindPostView({
  detail,
  onPostLoad,
  onAdvanceToOffers,
  variant = 'table',
}: {
  detail: LoadDetail
  onPostLoad: () => void
  onAdvanceToOffers: () => void
  /* 'cards' keeps the list readable inside the narrow View 3 centre pane */
  variant?: 'table' | 'cards'
}) {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [excludeContacted, setExcludeContacted] = useState(false)
  const [blastOpen, setBlastOpen] = useState(false)
  const [blastChannel, setBlastChannel] = useState<'Email' | 'WhatsApp'>('Email')
  const [blastSubject, setBlastSubject] = useState('')
  const [blastBody, setBlastBody] = useState('')
  const [blastResponses, setBlastResponses] = useState<
    { id: string; channel: 'Email' | 'WhatsApp'; carriers: number; subject: string; at: string }[]
  >([])

  const rows = detail.carriers.filter((c) => {
    if (excludeContacted && c.contactedRecently) return false
    if (!q) return true
    const needle = q.toLowerCase()
    return (
      c.name.toLowerCase().includes(needle) ||
      (c.mc ?? '').includes(q) ||
      (c.dot ?? '').toLowerCase().includes(needle) ||
      (c.email ?? '').toLowerCase().includes(needle)
    )
  })

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

  const openBlast = (channel: 'Email' | 'WhatsApp') => {
    if (selected.size === 0) return
    setBlastChannel(channel)
    setBlastSubject(
      channel === 'Email'
        ? `Load ${detail.load.identifier} — ${detail.stops[0]?.facility ?? 'Pickup'} → ${detail.stops[detail.stops.length - 1]?.facility ?? 'Delivery'}`
        : ''
    )
    setBlastBody('')
    setBlastOpen(true)
  }

  const mockSendBlast = () => {
    setBlastResponses((prev) => [
      {
        id: `br-${Date.now()}`,
        channel: blastChannel,
        carriers: selected.size,
        subject: blastSubject || '(no subject)',
        at: 'Just now',
      },
      ...prev,
    ])
    setBlastOpen(false)
    onAdvanceToOffers()
  }

  return (
    <div className="dd-stage dd-find">
      <StageActionBar
        leading={
          <>
            <label className="dd-search dd-search--toolbar">
              <Search size={14} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search carrier, MC #, or contact…"
              />
            </label>
            <button
              type="button"
              className={cn('dd-exclude-toggle', excludeContacted && 'is-on')}
              aria-pressed={excludeContacted}
              onClick={() => setExcludeContacted((v) => !v)}
            >
              Exclude contacted
            </button>
          </>
        }
        actions={
          <>
            <button type="button" className="dd-pill-btn" aria-label="Refresh">
              <RefreshCw size={14} />
            </button>
            <button
              type="button"
              className="dd-pill-btn"
              disabled={selected.size === 0}
              onClick={() => openBlast('Email')}
            >
              <Mail size={14} />
              Blast email
            </button>
            <button
              type="button"
              className="dd-pill-btn"
              disabled={selected.size === 0}
              onClick={() => openBlast('WhatsApp')}
            >
              <MessageCircle size={14} />
              Blast WhatsApp
            </button>
            <button type="button" className="dd-pill-btn dd-pill-btn--emphasis" onClick={onPostLoad}>
              <Share2 size={14} />
              Post to Load
            </button>
          </>
        }
      />

      {blastResponses.length > 0 && (
        <div className="dd-blast-trail" aria-live="polite">
          {blastResponses.slice(0, 3).map((r) => (
            <span key={r.id} className="dd-chip-soft">
              Mock {r.channel} → {r.carriers} · {r.at}
            </span>
          ))}
        </div>
      )}

      {variant === 'cards' && (
        <div className="fp">
          <div className="fp__bar">
            <span className="fp__count">
              <strong>{rows.length}</strong> carrier{rows.length === 1 ? '' : 's'} in reach
              <em>
                {rows.filter((c) => c.recommended).length} recommended ·{' '}
                {rows.filter((c) => c.contactedRecently).length} contacted recently
              </em>
            </span>
            <div className="fp__barside">
              {selected.size > 0 && <span className="fp__sel">{selected.size} selected</span>}
              <button type="button" className="fp__all" onClick={toggleAll}>
                {rows.length > 0 && selected.size === rows.length ? 'Clear selection' : 'Select all'}
              </button>
            </div>
          </div>

          <ul className="fp__list">
            {rows.map((c) => {
              const idLine = [c.mc ? `MC ${c.mc}` : null, c.dot ? `DOT ${c.dot}` : null]
                .filter(Boolean)
                .join(' · ')
              const touched =
                c.lastContacted && c.lastContacted !== 'Never'
                  ? `Contacted ${c.lastContacted}${c.lastContactChannel ? ` · ${c.lastContactChannel}` : ''}`
                  : 'Never contacted'
              return (
                <li key={c.id} className={cn('fp-row', selected.has(c.id) && 'is-selected')}>
                  <input
                    type="checkbox"
                    className="fp-row__pick"
                    checked={selected.has(c.id)}
                    onChange={() => toggle(c.id)}
                    aria-label={`Select ${c.name}`}
                  />
                  <div className="fp-row__body">
                    <div className="fp-row__head">
                      {c.favorite && <Star size={11} className="is-star" />}
                      <strong>{c.name}</strong>
                      <span className={cn('fp-src', `is-${c.source.toLowerCase()}`)}>{c.source}</span>
                      {c.recommended && <span className="fp-rec">Match {c.recommendScore}</span>}
                    </div>
                    <div className="fp-row__meta">
                      <span className="mono">{idLine || 'No MC on file'}</span>
                      <span>Last used {c.lastUsedRel}</span>
                      <span className={cn(c.contactedRecently && 'is-touched')}>{touched}</span>
                    </div>
                    <div className="fp-row__stats">
                      <div>
                        <span>DH-P</span>
                        <strong>{c.dhP} mi</strong>
                      </div>
                      <div>
                        <span>DH-D</span>
                        <strong>{c.dhD} mi</strong>
                      </div>
                      <div>
                        <span>Last rate</span>
                        <strong>{c.lastRate}</strong>
                      </div>
                      <div>
                        <span>Loads</span>
                        <strong>{c.loads}</strong>
                      </div>
                      <div>
                        <span>Config rate</span>
                        <strong>{c.configRate ?? '—'}</strong>
                      </div>
                      <div>
                        <span>Offer</span>
                        <strong className={cn(c.offer === 'Sent' && 'is-sent')}>
                          {c.offer ?? 'Not sent'}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="fp-row__contact">
                    {c.phone && (
                      <a className="fp-ico" href={`tel:${c.phone}`} title={c.phone}>
                        <Phone size={13} />
                      </a>
                    )}
                    {c.email && (
                      <a className="fp-ico" href={`mailto:${c.email}`} title={c.email}>
                        <Mail size={13} />
                      </a>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>

          {rows.length === 0 && (
            <p className="fp__blank">No carriers match this search — clear the filters to widen the pool.</p>
          )}
        </div>
      )}

      {variant === 'table' && (
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
              <th>Last contacted</th>
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
              const contacted =
                c.lastContacted && c.lastContacted !== 'Never'
                  ? `${c.lastContacted}${c.lastContactChannel ? ` · ${c.lastContactChannel}` : ''}`
                  : (c.lastContacted ?? '—')
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
                      {c.recommended && <span className="dd-rec-chip">Recommended</span>}
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
                  <td className="dd-muted">{contacted}</td>
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
      )}

      {blastOpen && (
        <div className="dd-modal-root" role="dialog" aria-modal="true" aria-labelledby="dd-blast-title">
          <button
            type="button"
            className="dd-modal-backdrop"
            aria-label="Close"
            onClick={() => setBlastOpen(false)}
          />
          <div className="dd-modal dd-blast-modal">
            <header className="dd-modal__head">
              <div>
                <div className="dd-modal__eyebrow">No probill required · mock</div>
                <h3 id="dd-blast-title">Blast {blastChannel}</h3>
                <p>
                  Free-form message to {selected.size} selected carrier
                  {selected.size === 1 ? '' : 's'}.
                </p>
              </div>
              <button
                type="button"
                className="dd-icon-btn dd-icon-btn--light"
                onClick={() => setBlastOpen(false)}
              >
                <X size={16} />
              </button>
            </header>
            <div className="dd-modal__body">
              <section className="dd-modal-card">
                <div className="dd-seg">
                  <span className="dd-field__label">Channel</span>
                  <div>
                    {(['Email', 'WhatsApp'] as const).map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        className={cn(blastChannel === ch && 'is-active')}
                        onClick={() => setBlastChannel(ch)}
                      >
                        {blastChannel === ch && <Check size={12} />}
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
                {blastChannel === 'Email' && (
                  <label>
                    Subject
                    <input
                      value={blastSubject}
                      onChange={(e) => setBlastSubject(e.target.value)}
                      placeholder="Subject line…"
                    />
                  </label>
                )}
                <label>
                  Message
                  <textarea
                    value={blastBody}
                    onChange={(e) => setBlastBody(e.target.value)}
                    placeholder="Write your blast…"
                    rows={5}
                  />
                </label>
                <p className="dd-muted dd-blast-modal__count">
                  Selected carriers: <strong>{selected.size}</strong>
                </p>
              </section>
            </div>
            <footer className="dd-modal__foot">
              <button type="button" className="dd-btn" onClick={() => setBlastOpen(false)}>
                Cancel
              </button>
              <button type="button" className="dd-btn dd-btn--primary" onClick={mockSendBlast}>
                <Send size={14} />
                Mock send
              </button>
            </footer>
          </div>
        </div>
      )}
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
  const bestBid = detail.bids.find((b) => b.best) ?? detail.bids[0]
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
      <StageActionBar
        label="Offers · Bids"
        actions={
          <>
            <button type="button" className="dd-pill-btn" aria-label="Refresh">
              <RefreshCw size={14} />
            </button>
            <button type="button" className="dd-pill-btn">
              <Mail size={14} />
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
          </>
        }
      />

      <div className="dd-offers__grid">
        <aside className="dd-bids-panel">
          <div className="dd-bids-list__head">
            <div>
              <strong>Carrier Bids</strong>
              <div className="dd-muted">{detail.bids.length} offers on this load</div>
            </div>
            <span className="dd-best-pill">Best {bestBid?.amount ?? '—'}</span>
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
                    <span className="dd-bid-card__meta">
                      MC# {b.mc}
                      {b.dot ? ` · DOT ${b.dot}` : ''}
                    </span>
                  </div>
                  <div className="dd-bid-card__tags">
                    {b.best && <span className="dd-tag-best">Best</span>}
                    <span
                      className={cn(
                        'dd-tag-status',
                        b.status === 'Accepted' && 'is-accepted',
                        b.status === 'Pending' && 'is-pending',
                        b.status === 'Sent' && 'is-sent',
                        b.status === 'Rejected' && 'is-rejected'
                      )}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>

                <div className="dd-bid-card__stats" aria-label="Bid metrics">
                  <div>
                    <span>Bid / mi</span>
                    <strong>{b.amount}</strong>
                  </div>
                  <div>
                    <span>All-in</span>
                    <strong>{b.allIn ?? '—'}</strong>
                  </div>
                  <div>
                    <span>vs target</span>
                    <strong className={cn(b.vsTarget.startsWith('-') && 'is-pos')}>
                      {b.vsTarget.replace(' vs Target', '')}
                    </strong>
                  </div>
                </div>

                <dl className="dd-bid-card__facts">
                  <div>
                    <dt>Equip</dt>
                    <dd>{b.equipment ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>Source</dt>
                    <dd>{b.source ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>DH-P</dt>
                    <dd>{b.dhP ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>DH-D</dt>
                    <dd>{b.dhD ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>Loads</dt>
                    <dd>{b.loads ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>Via</dt>
                    <dd>{b.channel ?? '—'}</dd>
                  </div>
                </dl>

                <div className="dd-bid-card__foot">
                  <span>{b.contact ?? 'Dispatch'}</span>
                  <span>{b.updated ?? b.sentAt ?? '—'}</span>
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
                  <div className="dd-muted">
                    MC# {bid.mc}
                    {bid.contact ? ` · ${bid.contact}` : ''}
                    {bid.phone ? ` · ${bid.phone}` : ''}
                  </div>
                </div>
                <div className="dd-wa__head-right">
                  <span
                    className={cn(
                      'dd-tag-status',
                      bid.status === 'Accepted' && 'is-accepted',
                      bid.status === 'Pending' && 'is-pending'
                    )}
                  >
                    {bid.status}
                  </span>
                  <span className="dd-wa__channel">{bid.channel ?? 'Chat'}</span>
                </div>
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
                        <strong>{bid.allIn ?? bid.amount}</strong>
                      </div>
                    </div>

                    <div className="dd-wa-card__facts">
                      <div>
                        <span>Rate / mi</span>
                        <strong>{bid.amount}</strong>
                      </div>
                      <div>
                        <span>Equipment</span>
                        <strong>{bid.equipment ?? detail.load.equipment}</strong>
                      </div>
                      <div>
                        <span>Miles</span>
                        <strong>{detail.load.miles.toLocaleString()} mi</strong>
                      </div>
                      <div>
                        <span>Channel</span>
                        <strong>{bid.channel ?? '—'}</strong>
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
                  <span className="dd-wa-time">{bid.sentAt?.split(' · ').pop() ?? '12:34 PM'}</span>
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

/* ── Finalize Tender moved to LaterStageViews ── */
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
  const [contact, setContact] = useState<'Email' | 'Phone' | 'WhatsApp' | 'SMS'>('Email')
  const [datOn, setDatOn] = useState(true)
  const [loadlinkOn, setLoadlinkOn] = useState(false)
  const marketplaceCount = (datOn ? 1 : 0) + (loadlinkOn ? 1 : 0)

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
                  {(['Email', 'Phone', 'WhatsApp', 'SMS'] as const).map((c) => (
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
            <div className="dd-market-tiles">
              <button
                type="button"
                className={cn('dd-market-tile', datOn && 'is-active')}
                onClick={() => setDatOn((v) => !v)}
              >
                {datOn && <Check size={14} />}
                DAT
              </button>
              <button
                type="button"
                className={cn('dd-market-tile', loadlinkOn && 'is-active')}
                onClick={() => setLoadlinkOn((v) => !v)}
              >
                {loadlinkOn && <Check size={14} />}
                Loadlink
              </button>
            </div>
            <p className="dd-muted">
              Will post to {marketplaceCount} marketplace{marketplaceCount === 1 ? '' : 's'}.
            </p>
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
          <button
            type="button"
            className="dd-btn dd-btn--primary"
            onClick={onClose}
            disabled={marketplaceCount === 0}
          >
            <CloudUpload size={14} />
            Post Load (mock)
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
