import { useMemo, useState } from 'react'
import { Check, Flag } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { BidOffer, LoadDetail } from '@/data/loadDetail'
import { OVERRIDE_REASONS, scoreBids, type ScoredBid } from '@/data/awardScore'
import { loadProfiles } from '@/data/automationProfiles'
import { FindPostView } from '@/components/details/StageViews'

export function TenderWorkspace({
  detail,
  onAccept,
  onAddOffer,
}: {
  detail: LoadDetail
  onAccept: (bid: BidOffer) => void
  onAddOffer: () => void
}) {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(detail.bids[0]?.id)
  const [msg, setMsg] = useState('')
  const [messages, setMessages] = useState<{ id: string; from: 'them' | 'me'; text: string; time: string }[]>([
    { id: 'm1', from: 'them', text: 'We can cover this lane. Quote attached on the offer card.', time: '12:36 PM' },
  ])
  const weights = loadProfiles().tender[1]?.weights
  const scored = useMemo(() => scoreBids(detail.bids, detail.maxBuy, weights), [detail.bids, detail.maxBuy, weights])
  const bid = scored.find((s) => s.bid.id === selected) ?? scored[0]
  const accepted = detail.bids.find((b) => b.status === 'Accepted')
  const counts = useMemo(() => {
    const base = { All: detail.bids.length, Pending: 0, Countered: 0, Accepted: 0 }
    for (const b of detail.bids) {
      if (b.status === 'Pending' || b.status === 'Sent') base.Pending++
      if (b.status === 'Accepted') base.Accepted++
      if (b.status === 'Countered') base.Countered++
    }
    return base
  }, [detail.bids])
  const filtered =
    filter === 'All'
      ? scored
      : scored.filter((s) =>
          filter === 'Pending' ? s.bid.status === 'Pending' || s.bid.status === 'Sent' : s.bid.status === filter
        )
  const checks = [
    { label: 'Insurance on file', ok: true },
    { label: 'Authority active', ok: true },
    { label: 'Rate within max buy', ok: !!accepted && !scoreBids([accepted], detail.maxBuy)[0]?.overLimit },
    { label: 'Contact verified', ok: Boolean(accepted?.phone) },
    { label: 'Equipment match', ok: true },
  ]

  return (
    <div className="v3-ws">
      <div className="fp__bar">
        <span className="fp__count">
          <strong>{detail.bids.length}</strong> offers
          <em>
            {scored.filter((s) => s.suggested).length ? '1 suggested' : 'No suggestion'} · {counts.Accepted} accepted
          </em>
        </span>
        <button type="button" className="fp__all" onClick={onAddOffer}>
          Add offer
        </button>
      </div>
      <div className="v3-ws__filters">
        {Object.entries(counts).map(([k, n]) => (
          <button key={k} type="button" className={cn(filter === k && 'is-on')} onClick={() => setFilter(k)}>
            {k} {n}
          </button>
        ))}
      </div>
      <ul className="fp__list">
        {filtered.map((s) => (
          <OfferCard
            key={s.bid.id}
            scored={s}
            selected={selected === s.bid.id}
            onSelect={() => setSelected(s.bid.id)}
            onAccept={() => onAccept(s.bid)}
          />
        ))}
      </ul>
      {bid && (
        <section className="v3-thread">
          <header>
            <strong>{bid.bid.carrier}</strong>
            <span>
              {bid.bid.contact} · {bid.bid.phone}
            </span>
          </header>
          <div className="v3-thread__body">
            {messages.map((m) => (
              <p key={m.id} className={cn(m.from === 'me' && 'is-me')}>
                {m.text}
                <em>{m.time}</em>
              </p>
            ))}
          </div>
          <div className="v3-thread__composer">
            {['Can you do $2,500 all-in?', 'Earliest pickup?'].map((t) => (
              <button key={t} type="button" onClick={() => setMsg(t)}>
                {t}
              </button>
            ))}
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Type a counter…"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && msg.trim()) {
                  setMessages((prev) => [...prev, { id: `${Date.now()}`, from: 'me', text: msg.trim(), time: 'Just now' }])
                  setMsg('')
                }
              }}
            />
          </div>
        </section>
      )}
      <section className="v3-finalize">
        <strong>Finalize tender</strong>
        <ul>
          {checks.map((c) => (
            <li key={c.label} className={cn(c.ok && 'is-done')}>
              <i>{c.ok ? <Check size={9} strokeWidth={3.5} /> : null}</i>
              {c.label}
            </li>
          ))}
        </ul>
        {accepted && (
          <button type="button" className="v3-acts__btn is-primary" onClick={() => onAccept(accepted)}>
            Confirm {accepted.carrier}
          </button>
        )}
      </section>
    </div>
  )
}

function OfferCard({
  scored,
  selected,
  onSelect,
  onAccept,
}: {
  scored: ScoredBid
  selected: boolean
  onSelect: () => void
  onAccept: () => void
}) {
  const b = scored.bid
  return (
    <li className={cn('fp-row', selected && 'is-selected', scored.suggested && 'is-suggested')}>
      <button type="button" className="fp-row__body v3-offer" onClick={onSelect}>
        <div className="fp-row__head">
          <strong>{b.carrier}</strong>
          <span className={cn('fp-src', scored.overLimit ? 'is-new' : 'is-dat')}>{b.status}</span>
          {scored.suggested && <span className="fp-rec">Suggested {scored.score}</span>}
          {!scored.suggested && !scored.overLimit && <span className="fp-src">Score {scored.score}</span>}
        </div>
        <div className="fp-row__meta">
          <span className="mono">MC {b.mc}</span>
          <span>{b.source}</span>
          <span className={cn(scored.overLimit ? 'is-touched' : undefined)}>
            {scored.overLimit ? 'Over hard limit' : `${b.allIn ?? b.amount} all-in`}
          </span>
        </div>
        <div className="fp-row__stats">
          <div>
            <span>Highway</span>
            <strong>{scored.trust.highwayOnboarded ? 'Onboarded' : '—'}</strong>
          </div>
          <div>
            <span>TMS</span>
            <strong>{scored.trust.tmsOnTime}%</strong>
          </div>
          <div>
            <span>GenLogs</span>
            <strong>{scored.trust.genlogsAlerts === 0 ? 'Clear' : `${scored.trust.genlogsAlerts} alert`}</strong>
          </div>
          <div>
            <span>Rating</span>
            <strong>{scored.trust.internalRating}/5</strong>
          </div>
        </div>
      </button>
      {!scored.overLimit && (
        <button type="button" className="fp__all" onClick={onAccept}>
          Accept
        </button>
      )}
    </li>
  )
}

export function AwardWorkspace({
  detail,
  onRunCmt,
  onAward,
}: {
  detail: LoadDetail
  onRunCmt: () => void
  onAward: (bid: BidOffer, reason?: { code: string; note: string }) => void
}) {
  const weights = loadProfiles().award[0]?.weights
  const scored = useMemo(() => scoreBids(detail.bids, detail.maxBuy, weights), [detail.bids, detail.maxBuy, weights])
  const suggested = scored.find((s) => s.suggested)
  const [override, setOverride] = useState<ScoredBid | null>(null)
  const [code, setCode] = useState<(typeof OVERRIDE_REASONS)[number]>('Customer requested')
  const [note, setNote] = useState('')
  const checks = [
    { label: 'FMCSA authority', ok: true, note: 'Active · common carrier' },
    { label: 'Cargo insurance', ok: true, note: '$100,000 · Dec 2026' },
    { label: 'Rate vs hard limit', ok: Boolean(suggested && !suggested.overLimit), note: suggested ? `${suggested.bid.allIn}` : '—' },
    { label: 'W9 / COI packet', ok: true, note: '3 docs on file' },
    { label: 'Safety score', ok: true, note: 'Satisfactory' },
    { label: 'Watchlist', ok: !suggested?.trust.highwayWatchlist, note: suggested?.trust.highwayWatchlist ? 'Hit — review' : 'Clear' },
  ]
  const passed = checks.filter((c) => c.ok).length

  return (
    <div className="v3-ws">
      <section className="v3-cmt">
        <div className="fp__bar">
          <span className="fp__count">
            <strong>CMT</strong>
            <em>
              {detail.cmtCleared ? `${passed}/6 clear` : 'Not run yet'}
            </em>
          </span>
          <button type="button" className="fp__all" onClick={onRunCmt}>
            {detail.cmtCleared ? 'Re-run checks' : 'Run CMT'}
          </button>
        </div>
        <ul className="v3-cmt__list">
          {checks.map((c) => (
            <li key={c.label} className={cn(c.ok && detail.cmtCleared && 'is-done')}>
              <i>{c.ok && detail.cmtCleared ? <Check size={9} strokeWidth={3.5} /> : null}</i>
              <div>
                <strong>{c.label}</strong>
                <span>{c.note}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <ul className="fp__list">
        {scored.map((s) => (
          <li key={s.bid.id} className={cn('fp-row', s.suggested && 'is-suggested')}>
            <div className="fp-row__body">
              <div className="fp-row__head">
                <strong>{s.bid.carrier}</strong>
                {s.suggested && <span className="fp-rec">Recommended {s.score}</span>}
                {!s.suggested && <span className="fp-src">Score {s.score}</span>}
              </div>
              <div className="fp-row__meta">
                <span>{s.bid.allIn ?? s.bid.amount}</span>
                <span>Confirm to {s.confirmTo}</span>
              </div>
              <p className="v3-ws__why">{s.reasons.join(' · ')}</p>
            </div>
            {s.suggested ? (
              <button type="button" className="v3-acts__btn is-primary" onClick={() => onAward(s.bid)}>
                Award recommended
              </button>
            ) : (
              <button type="button" className="fp__all" disabled={s.overLimit} onClick={() => setOverride(s)}>
                Award this carrier
              </button>
            )}
          </li>
        ))}
      </ul>

      {override && (
        <div className="dd-modal-root" role="dialog" aria-modal="true">
          <button type="button" className="dd-modal-backdrop" aria-label="Close" onClick={() => setOverride(null)} />
          <div className="dd-modal" style={{ width: 440 }}>
            <header className="dd-modal__head">
              <div>
                <h3>Reason required</h3>
                <p>You are awarding a carrier the system did not recommend.</p>
              </div>
            </header>
            <div className="dd-modal__body">
              <label>
                Reason code
                <select value={code} onChange={(e) => setCode(e.target.value as typeof code)}>
                  {OVERRIDE_REASONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label>
                Note
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Why this carrier?" />
              </label>
            </div>
            <footer className="dd-modal__foot">
              <button type="button" className="dd-btn" onClick={() => setOverride(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="dd-btn dd-btn--primary"
                disabled={code === 'Other' && !note.trim()}
                onClick={() => {
                  onAward(override.bid, { code, note })
                  setOverride(null)
                }}
              >
                Award {override.bid.carrier}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}

export function BookingWorkspace({
  detail,
  onAutoBook,
}: {
  detail: LoadDetail
  onAutoBook?: () => void
}) {
  const awarded = detail.bids.find((b) => b.id === detail.awardedBidId) ?? detail.bids.find((b) => b.status === 'Accepted')
  const [open, setOpen] = useState('contract')
  const sections = [
    { id: 'contract', title: 'Contract draft', body: `Rate confirmation for ${awarded?.carrier ?? 'the awarded carrier'} · ${awarded?.allIn ?? 'rate pending'}.` },
    { id: 'confirm', title: 'Confirmation packet', body: `Send to ${awarded?.email ?? 'verified Highway email'} once the contract is ready.` },
    { id: 'resources', title: 'Resources', body: 'Driver, tractor, trailer and tracking are still unassigned.' },
    { id: 'handoff', title: 'Dispatch handoff', body: 'Checklist for the ops desk after the confirmation is signed.' },
  ]
  return (
    <div className="v3-ws">
      <div className="fp__bar">
        <span className="fp__count">
          <strong>Booking</strong>
          <em>{awarded ? awarded.carrier : 'No carrier finalized'}</em>
        </span>
        {onAutoBook && (
          <button type="button" className="v3-acts__btn is-primary" onClick={onAutoBook}>
            Auto Booking
          </button>
        )}
      </div>
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          className={cn('v3-acc', open === s.id && 'is-on')}
          onClick={() => setOpen(s.id)}
        >
          <strong>{s.title}</strong>
          {open === s.id && <p>{s.body}</p>}
        </button>
      ))}
    </div>
  )
}

export function TransitWorkspace({ onLog }: { onLog: (title: string, detail: string) => void }) {
  const events = [
    { title: 'Dispatched', detail: 'Carrier accepted the tracking ping.', done: true },
    { title: 'Pickup confirm', detail: 'Waiting on the hook appointment.', done: false },
    { title: 'In transit updates', detail: 'No check-calls yet.', done: false },
    { title: 'ETA watch', detail: 'ETA will populate after pickup.', done: false },
    { title: 'Delivery confirm', detail: 'Not started.', done: false },
    { title: 'POD received', detail: 'Not started.', done: false },
  ]
  return (
    <div className="v3-ws">
      <div className="fp__bar">
        <span className="fp__count">
          <strong>In transit</strong>
          <em>1 of 6 events logged</em>
        </span>
        <div className="fp__barside">
          <button type="button" className="fp__all" onClick={() => onLog('Check-call logged', 'Mock location ping · on time.')}>
            Log update
          </button>
          <button
            type="button"
            className="fp__all"
            onClick={() => onLog('Exception flagged', 'Mock delay at the hook — broker notified.')}
          >
            <Flag size={12} /> Flag exception
          </button>
        </div>
      </div>
      <ol className="v3-tl">
        {events.map((e) => (
          <li key={e.title} className={cn(e.done && 'is-done')}>
            <i>{e.done ? <Check size={9} strokeWidth={3.5} /> : null}</i>
            <div>
              <strong>{e.title}</strong>
              <span>{e.detail}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function SettlementWorkspace({ onCloseFile }: { onCloseFile: () => void }) {
  const cards = [
    { title: 'Invoice review', value: 'Draft', note: 'Waiting on POD' },
    { title: 'Carrier pay', value: '$1,100.00', note: 'Held until close' },
    { title: 'Customer bill', value: '$1,250.00', note: 'Ready to draft' },
    { title: 'Close file', value: 'Open', note: 'All three must clear' },
  ]
  return (
    <div className="v3-ws">
      <div className="v3-rates">
        {cards.map((c) => (
          <article key={c.title}>
            <span>{c.title}</span>
            <strong>{c.value}</strong>
          </article>
        ))}
      </div>
      <div className="v3-acts">
        <span className="v3-acts__label">Next actions</span>
        <button type="button" className="v3-acts__btn is-primary" onClick={onCloseFile}>
          Close file
        </button>
      </div>
    </div>
  )
}

export function SourcingWorkspace({
  detail,
  onPostLoad,
  onAdvanceToOffers,
}: {
  detail: LoadDetail
  onPostLoad: () => void
  onAdvanceToOffers: () => void
}) {
  return (
    <FindPostView detail={detail} variant="cards" onPostLoad={onPostLoad} onAdvanceToOffers={onAdvanceToOffers} />
  )
}

export function BatchAutoBar({
  selected,
  onRun,
  onClear,
}: {
  selected: { id: string; stage: string }[]
  onRun: (mode: 'sourcing' | 'tender' | 'award') => void
  onClear: () => void
}) {
  if (selected.length === 0) return null
  const stages = new Set(selected.map((s) => s.stage))
  const mode = stages.has('Award') ? 'award' : stages.has('Tender') ? 'tender' : 'sourcing'
  return (
    <div className="sr-batch">
      <strong>{selected.length} selected</strong>
      <span>Run the stage profile on these loads.</span>
      <button type="button" className="sr-batch__run" onClick={() => onRun(mode)}>
        Run Auto {mode === 'sourcing' ? 'Sourcing' : mode === 'tender' ? 'Tender' : 'Award'}
      </button>
      <button type="button" className="sr-batch__clear" onClick={onClear}>
        Clear
      </button>
    </div>
  )
}

