import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  CheckCheck,
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
  Timer,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import type { BidOffer, LoadDetail } from '@/data/loadDetail'
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

          <div className="fp-tbl" role="table">
            <div className="fp-tbl__head" role="row">
              <span className="fp-tbl__pick">
                <input
                  type="checkbox"
                  checked={rows.length > 0 && selected.size === rows.length}
                  onChange={toggleAll}
                  aria-label="Select all carriers"
                />
              </span>
              <span className="fp-th" role="columnheader">
                Carrier
              </span>
              <span className="fp-th is-num" role="columnheader">
                Last rate
              </span>
              <span className="fp-th is-num" role="columnheader">
                Deadhead
              </span>
              <span className="fp-th is-num" role="columnheader">
                Loads
              </span>
              <span className="fp-th is-mid" role="columnheader">
                Offer
              </span>
              <span className="fp-th is-mid" role="columnheader">
                Reach
              </span>
            </div>

            <div className="fp-tbl__body">
              {rows.map((c) => {
                const idLine = [c.mc ? `MC ${c.mc}` : null, c.dot ? `DOT ${c.dot}` : null]
                  .filter(Boolean)
                  .join(' · ')
                const touched =
                  c.lastContacted && c.lastContacted !== 'Never'
                    ? `Contacted ${c.lastContacted}`
                    : 'Never contacted'
                return (
                  <div
                    key={c.id}
                    role="row"
                    className={cn('fp-tr', selected.has(c.id) && 'is-on')}
                  >
                    <span className="fp-tbl__pick">
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggle(c.id)}
                        aria-label={`Select ${c.name}`}
                      />
                    </span>

                    <span className="fp-tr__who">
                      <span className="fp-tr__name">
                        {c.favorite && <Star size={11} className="is-star" />}
                        <strong>{c.name}</strong>
                        <em className={cn('fp-src', `is-${c.source.toLowerCase()}`)}>{c.source}</em>
                        {c.recommended && <em className="fp-rec">Match {c.recommendScore}</em>}
                      </span>
                      <span className="fp-tr__meta">
                        {idLine || 'No MC on file'} · Last used {c.lastUsedRel} ·{' '}
                        <i className={cn(c.contactedRecently && 'is-touched')}>{touched}</i>
                      </span>
                    </span>

                    <span className="fp-tr__num is-strong">{c.lastRate}</span>
                    <span className="fp-tr__num">
                      {c.dhP} / {c.dhD} <i>mi</i>
                    </span>
                    <span className="fp-tr__num">{c.loads}</span>
                    <span className="fp-tr__offer">
                      <em className={cn('fp-pill', c.offer === 'Sent' ? 'is-sent' : 'is-idle')}>
                        {c.offer ?? 'Not sent'}
                      </em>
                    </span>

                    <span className="fp-tr__reach">
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
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

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

/** Counts a bid's price hold down to zero, ticking once a second. */
function BidTimer({ deadline, big }: { deadline: number; big?: boolean }) {
  const [left, setLeft] = useState(() => deadline - Date.now())

  useEffect(() => {
    setLeft(deadline - Date.now())
    const id = window.setInterval(() => setLeft(deadline - Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [deadline])

  const out = left <= 0
  const mins = left / 60000
  const tone = out ? 'is-out' : mins < 5 ? 'is-hot' : mins < 20 ? 'is-warm' : 'is-cool'

  const total = Math.max(0, Math.floor(left / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  const clock = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`

  return (
    <span className={cn('dd-timer', tone, big && 'is-big')}>
      <Timer size={big ? 12 : 11} strokeWidth={2.2} />
      {out ? 'Expired' : clock}
      {big && !out && <em>left on this bid</em>}
    </span>
  )
}

function bidInitials(name: string) {
  return name
    .replace(/[^A-Za-z ]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export function OffersBidsView({
  detail,
  onAddOffer,
  onAcceptBest,
}: {
  detail: LoadDetail
  onAddOffer: () => void
  onAcceptBest?: (bid: BidOffer) => void
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
  /* pin each hold to a wall-clock deadline once, so the countdown stays honest across re-renders */
  const deadlines = useMemo(() => {
    const now = Date.now()
    const map = new Map<string, number>()
    for (const b of detail.bids) {
      if (b.expiresInMin) map.set(b.id, now + b.expiresInMin * 60_000)
    }
    return map
  }, [detail.bids])
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
        actions={
          <>
            <button
              type="button"
              className="dd-pill-btn dd-pill-btn--emphasis"
              onClick={() => bestBid && onAcceptBest?.(bestBid)}
            >
              <Check size={14} />
              {bestBid ? `Accept ${bestBid.carrier}` : 'Accept best bid'}
            </button>
            <button type="button" className="dd-pill-btn">
              <Mail size={14} />
              Re-send offers
            </button>
            <button type="button" className="dd-pill-btn" onClick={onAddOffer}>
              <Plus size={14} />
              Add offer
            </button>
            <button type="button" className="dd-pill-btn">
              <RefreshCw size={14} />
              Refresh
            </button>
          </>
        }
      />

      <div className="dd-offers__grid">
        <aside className="dd-bids-panel">
          <div className="dd-bids-list__head">
            <div>
              <strong>Carrier bids</strong>
              <div className="dd-muted">{detail.bids.length} offers on this load</div>
            </div>
            <span className="dd-best-pill">Best {bestBid?.allIn ?? bestBid?.amount ?? '—'}</span>
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
          <div className="dd-offer-list">
            {filtered.map((b) => {
              const under = b.vsTarget.trim().startsWith('-')
              const deadline = deadlines.get(b.id)
              return (
                <button
                  key={b.id}
                  type="button"
                  className={cn('dd-offer', selected === b.id && 'is-on', b.best && 'is-best')}
                  onClick={() => setSelected(b.id)}
                >
                  <span className="dd-offer__main">
                    <span className="dd-offer__avatar" aria-hidden>
                      {bidInitials(b.carrier)}
                    </span>
                    <span className="dd-offer__who">
                      <span className="dd-offer__name">
                        <strong>{b.carrier}</strong>
                        {b.best && <span className="dd-offer__best">Best</span>}
                      </span>
                      <em>
                        MC {b.mc}
                        {b.loads ? ` · ${b.loads} loads` : ''}
                        {b.source ? ` · ${b.source}` : ''}
                      </em>
                      <span className="dd-offer__foot">
                        <span className={cn('dd-offer__state', `is-${b.status.toLowerCase()}`)}>
                          {b.status}
                        </span>
                        <em>{[b.contact, b.channel].filter(Boolean).join(' · ')}</em>
                      </span>
                    </span>
                  </span>

                  <span className="dd-offer__side">
                    <b>{b.allIn ?? b.amount}</b>
                    <i className={cn(under && 'is-pos')}>
                      {b.vsTarget.replace(' vs Target', '')} vs target
                    </i>
                    {deadline ? (
                      <BidTimer deadline={deadline} />
                    ) : (
                      <span className="dd-timer is-none">No hold</span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="dd-wa">
          {bid ? (
            <>
              <div className="dd-wa__head">
                <span className="dd-wa__avatar" aria-hidden>
                  {bidInitials(bid.carrier)}
                </span>
                <div className="dd-wa__who">
                  <strong>{bid.carrier}</strong>
                  <span>
                    {[bid.contact, bid.phone, bid.channel ?? 'Chat'].filter(Boolean).join(' · ')}
                  </span>
                </div>
                {deadlines.get(bid.id) && <BidTimer deadline={deadlines.get(bid.id)!} big />}
                <div className="dd-wa__head-acts">
                  <button type="button" aria-label="Call carrier">
                    <Phone size={14} />
                  </button>
                  <button type="button" aria-label="Email carrier">
                    <Mail size={14} />
                  </button>
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
                    <span className="dd-wa-time">
                      {m.time}
                      {m.from === 'me' && <CheckCheck size={13} strokeWidth={2.4} />}
                    </span>
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
