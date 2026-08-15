import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Check,
  ChevronDown,
  Mail,
  MessageCircle,
  Pencil,
  Search,
  Share2,
  SlidersHorizontal,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import type { CarrierRow, LoadDetail } from '@/data/loadDetail'
import { RateDialog, type CaseActionId } from './View3CaseLayout'
import { useStageActionSlot } from './stageActionSlot'

const toNum = (v?: string) => Number(String(v ?? '').replace(/[^0-9.]/g, '')) || 0
const rateOrNull = (v: string) => (!v || v === '—' || v === '$0.00' ? null : v)
const money = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

type RateKey = 'booknow' | 'maxbuy' | 'reject'

const RATE_COPY: Record<RateKey, { title: string; note: string; tone: string }> = {
  booknow: {
    title: 'Book now',
    note: 'Auto-accept at or below · default −7.5% of Max Buy',
    tone: 'is-book',
  },
  maxbuy: {
    title: 'Max buy',
    note: 'Internal ceiling · drives the other two',
    tone: 'is-max',
  },
  reject: {
    title: 'Reject above',
    note: 'Auto-reject above this rate · default +25% of Max Buy',
    tone: 'is-reject',
  },
}

/* ─────────────── Bidding thresholds ─────────────── */

export function V4Thresholds({
  detail,
  posted,
  onPostSourcing,
  onResolve,
}: {
  detail: LoadDetail
  posted: boolean
  onPostSourcing: () => void
  onResolve: (id: CaseActionId, value: string) => void
}) {
  const [hidden, setHidden] = useState(false)
  const [editing, setEditing] = useState<RateKey | null>(null)

  const value: Record<RateKey, string | null> = {
    booknow: rateOrNull(detail.bookNowRate),
    maxbuy: rateOrNull(detail.maxBuy),
    reject: rateOrNull(detail.rejectAbove),
  }

  const ceiling = toNum(value.maxbuy ?? '')
  const suggest: Record<RateKey, string> = {
    maxbuy: (detail.load.fee * 0.88).toFixed(2),
    booknow: (ceiling > 0 ? ceiling * 0.925 : detail.load.fee * 0.81).toFixed(2),
    reject: (ceiling > 0 ? ceiling * 1.25 : detail.load.fee * 1.1).toFixed(2),
  }

  /* the ruler spans a little past the widest threshold so every marker stays inside */
  const marks = (['booknow', 'maxbuy', 'reject'] as RateKey[])
    .map((k) => ({ key: k, n: toNum(value[k] ?? '') }))
    .filter((m) => m.n > 0)
  const top = Math.max(...marks.map((m) => m.n), 1) * 1.18
  const pct = (n: number) => Math.min(97, Math.max(3, (n / top) * 100))

  return (
    <section className="v4-thr">
      <header className="v4-thr__head">
        <span className="v4-thr__title">Bidding thresholds</span>
        <em className="v4-thr__cur">
          {detail.currency === 'CAD' ? '🇨🇦' : '🇺🇸'} {detail.currency}
        </em>
        <div className="v4-thr__acts">
          <button
            type="button"
            className={cn('v4-btn', posted ? 'is-done' : 'is-ghost')}
            onClick={onPostSourcing}
          >
            <Check size={13} />
            {posted ? 'Posted to Sourcing' : 'Post to Sourcing'}
          </button>
          <button
            type="button"
            className="v4-btn is-plain"
            onClick={() => setHidden((v) => !v)}
            aria-expanded={!hidden}
          >
            <ChevronDown size={13} className={cn('v4-btn__caret', hidden && 'is-up')} />
            {hidden ? 'Show rates' : 'Hide rates'}
          </button>
        </div>
      </header>

      {!hidden && (
        <>
          <div className="v4-thr__cards">
            {(['booknow', 'maxbuy', 'reject'] as RateKey[]).map((k) => (
              <button
                key={k}
                type="button"
                className={cn('v4-rate', RATE_COPY[k].tone, !value[k] && 'is-empty')}
                onClick={() => setEditing(k)}
              >
                <span className="v4-rate__label">{RATE_COPY[k].title}</span>
                <strong className="v4-rate__val">
                  {value[k] ?? 'Set rate'}
                  {value[k] && <i>{detail.currency}</i>}
                </strong>
                <em className="v4-rate__note">{RATE_COPY[k].note}</em>
                <Pencil size={12} className="v4-rate__edit" />
              </button>
            ))}

            <div className="v4-bench">
              <div className="v4-bench__head">
                <span>Vendor benchmarks</span>
                <em>
                  <i className="v4-dot" />
                  Live
                </em>
              </div>
              <div className="v4-bench__row">
                <span>DAT</span>
                <strong>{detail.marketMid}</strong>
              </div>
              <div className="v4-bench__row">
                <span>Loadlink</span>
                <strong className="is-muted">No quote</strong>
              </div>
            </div>
          </div>

          <div className="v4-ruler">
            <div className="v4-ruler__track">
              {marks.map((m) => (
                <i
                  key={m.key}
                  className={cn('v4-ruler__pin', RATE_COPY[m.key].tone)}
                  style={{ left: `${pct(m.n)}%` }}
                />
              ))}
            </div>
            <div className="v4-ruler__labels">
              {marks.length === 0 ? (
                <span className="v4-ruler__empty">
                  Set a max buy and the book-now and reject lines follow it.
                </span>
              ) : (
                marks.map((m) => (
                  <span
                    key={m.key}
                    className={cn('v4-ruler__lab', RATE_COPY[m.key].tone)}
                    style={{ left: `${pct(m.n)}%` }}
                  >
                    {RATE_COPY[m.key].title} {money(m.n)}
                  </span>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {editing && (
        <RateDialog
          title={RATE_COPY[editing].title}
          note={RATE_COPY[editing].note}
          suggest={suggest[editing]}
          onClose={() => setEditing(null)}
          onSave={(v) => {
            onResolve(editing, v)
            setEditing(null)
          }}
        />
      )}
    </section>
  )
}

/* ─────────────── Carrier board ─────────────── */

type Chip = 'all' | 'fav' | 'past' | 'sent' | 'quoted' | 'notsent'

const laneMatch = (c: CarrierRow) => c.recommendScore ?? Math.max(28, 92 - c.dhP - c.dhD)

export function V4CarrierBoard({
  detail,
  onPostBoard,
  onBlast,
  onOpenCarrierPrefs,
}: {
  detail: LoadDetail
  onPostBoard: () => void
  onBlast: (channel: 'Email' | 'WhatsApp', count: number) => void
  onOpenCarrierPrefs?: () => void
}) {
  const slot = useStageActionSlot()
  const [q, setQ] = useState('')
  const [chip, setChip] = useState<Chip>('all')
  const [mode, setMode] = useState<'Spot' | 'Managed'>('Spot')
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [stars, setStars] = useState<Set<string>>(
    () => new Set(detail.carriers.filter((c) => c.favorite).map((c) => c.id))
  )
  const [offer, setOffer] = useState('')

  const all = detail.carriers
  const counts = {
    all: all.length,
    fav: all.filter((c) => stars.has(c.id)).length,
    past: all.filter((c) => c.source === 'PAST').length,
    sent: all.filter((c) => c.offer === 'Sent').length,
    quoted: all.filter((c) => c.offer && !['Sent', 'Not sent'].includes(c.offer)).length,
    notsent: all.filter((c) => !c.offer || c.offer === 'Not sent').length,
  }

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return all
      .filter((c) => {
        if (chip === 'fav' && !stars.has(c.id)) return false
        if (chip === 'past' && c.source !== 'PAST') return false
        if (chip === 'sent' && c.offer !== 'Sent') return false
        if (chip === 'quoted' && (!c.offer || ['Sent', 'Not sent'].includes(c.offer))) return false
        if (chip === 'notsent' && c.offer && c.offer !== 'Not sent') return false
        if (!needle) return true
        return [c.name, c.mc, c.dot, c.email, c.phone]
          .filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(needle))
      })
      .sort((a, b) => laneMatch(b) - laneMatch(a))
  }, [all, chip, q, stars])

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const star = (id: string) =>
    setStars((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const allPicked = rows.length > 0 && rows.every((c) => picked.has(c.id))
  const blastCount = picked.size || Math.min(10, rows.length)

  /* blasting and posting belong in the work bar next to the Auto Sourcing button */
  const blast = (
    <>
      <button type="button" className="v4-btn is-mail" onClick={() => onBlast('Email', blastCount)}>
        <Mail size={13} />
        Blast Email
      </button>
      <button
        type="button"
        className="v4-btn is-wa"
        onClick={() => onBlast('WhatsApp', blastCount)}
      >
        <MessageCircle size={13} />
        Blast WhatsApp
      </button>
      <button type="button" className="v4-btn is-ghost" onClick={onPostBoard}>
        <Share2 size={13} />
        Post to Load Board
      </button>
    </>
  )

  const chips: [Chip, string, number][] = [
    ['all', 'All', counts.all],
    ['fav', 'Favourites', counts.fav],
    ['past', 'Past', counts.past],
    ['sent', 'Sent', counts.sent],
    ['quoted', 'Quoted', counts.quoted],
    ['notsent', 'Not sent', counts.notsent],
  ]

  return (
    <section className="v4-board">
      <div className="v4-board__tools">
        <label className="v4-search">
          <Search size={14} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search carrier, MC #, or contact…"
          />
        </label>

        <div className="v4-chips" role="tablist">
          {chips.map(([id, label, n]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={chip === id}
              className={cn('v4-chip', chip === id && 'is-on')}
              onClick={() => setChip(id)}
            >
              {label}
              <i>{n}</i>
            </button>
          ))}
        </div>

        <div className="v4-mode">
          <span>Mode</span>
          <div className="v4-seg">
            {(['Spot', 'Managed'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={cn(mode === m && 'is-on')}
                onClick={() => setMode(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="v4-offer">
          <span>Offer</span>
          <input
            value={offer}
            inputMode="decimal"
            placeholder={rateOrNull(detail.bookNowRate)?.replace('$', '') ?? '0.00'}
            onChange={(e) => setOffer(e.target.value.replace(/[^0-9.]/g, ''))}
          />
          <em>{detail.currency}</em>
          <button
            type="button"
            className="v4-offer__btn"
            onClick={() => setOffer(String(toNum(detail.bookNowRate) || ''))}
          >
            Book Now
          </button>
        </div>

        {slot ? createPortal(blast, slot) : <div className="v4-blast">{blast}</div>}
      </div>

      <div className="v4-selbar">
        <span className="v4-selbar__msg">
          {picked.size === 0 ? (
            <>
              Nothing selected — a blast will go to the{' '}
              <b>top {Math.min(10, rows.length)} by lane match</b>
            </>
          ) : (
            <>
              <b>{picked.size} selected</b> · blast reaches these carriers only
            </>
          )}
        </span>
        <div className="v4-selbar__acts">
          {onOpenCarrierPrefs && (
            <button type="button" className="v4-selbar__prefs" onClick={onOpenCarrierPrefs}>
              <SlidersHorizontal size={12} />
              Carrier preferences
            </button>
          )}
          <button
            type="button"
            onClick={() => setPicked(new Set(rows.slice(0, 10).map((c) => c.id)))}
          >
            Select top 10
          </button>
          <button
            type="button"
            onClick={() => setPicked(new Set(rows.filter((c) => stars.has(c.id)).map((c) => c.id)))}
          >
            Select favourites
          </button>
          <button
            type="button"
            onClick={() => setOffer(String(toNum(detail.bookNowRate) || ''))}
          >
            Offer = Book Now
          </button>
        </div>
      </div>

      <div className="v4-tbl" role="table">
        <div className="v4-tbl__head" role="row">
          <span className="v4-c-pick">
            <input
              type="checkbox"
              checked={allPicked}
              onChange={() =>
                setPicked(allPicked ? new Set() : new Set(rows.map((c) => c.id)))
              }
              aria-label="Select all carriers"
            />
          </span>
          <span className="v4-c-star" />
          <span className="v4-c-name">Carrier</span>
          <span className="v4-c-id">MC # / DOT #</span>
          <span className="v4-c-src">Source</span>
          <span className="v4-c-lane">Lane match</span>
          <span className="v4-c-used">Last used</span>
          <span className="v4-c-num">DH-P</span>
          <span className="v4-c-num">DH-D</span>
          <span className="v4-c-num">Last rate</span>
          <span className="v4-c-num">Loads</span>
          <span className="v4-c-offer">Offer / reply</span>
        </div>

        <div className="v4-tbl__body">
          {rows.map((c) => {
            const match = laneMatch(c)
            const sent = c.offer === 'Sent'
            return (
              <div key={c.id} className={cn('v4-tr', picked.has(c.id) && 'is-on')} role="row">
                <span className="v4-c-pick">
                  <input
                    type="checkbox"
                    checked={picked.has(c.id)}
                    onChange={() => toggle(c.id)}
                    aria-label={`Select ${c.name}`}
                  />
                </span>
                <span className="v4-c-star">
                  <button
                    type="button"
                    className={cn('v4-star', stars.has(c.id) && 'is-on')}
                    onClick={() => star(c.id)}
                    aria-pressed={stars.has(c.id)}
                    aria-label={stars.has(c.id) ? 'Remove favourite' : 'Mark favourite'}
                  >
                    <Star size={13} />
                  </button>
                </span>
                <span className="v4-c-name">
                  <strong>{c.name}</strong>
                  {c.contactedRecently && c.lastContacted && (
                    <em>Contacted {c.lastContacted}</em>
                  )}
                </span>
                <span className="v4-c-id">
                  {c.mc ? `MC ${c.mc}` : 'Canada Only'}
                  {c.dot && <i>DOT {c.dot}</i>}
                </span>
                <span className="v4-c-src">
                  <em className={cn('v4-src', `is-${c.source.toLowerCase()}`)}>{c.source}</em>
                </span>
                <span className="v4-c-lane">
                  <b>{match}%</b>
                  <i>
                    <u
                      style={{ width: `${match}%` }}
                      className={match >= 70 ? 'is-hi' : match >= 50 ? 'is-mid' : 'is-lo'}
                    />
                  </i>
                </span>
                <span className="v4-c-used">
                  {c.lastUsed}
                  <i>{c.lastUsedRel}</i>
                </span>
                <span className="v4-c-num">{c.dhP}</span>
                <span className="v4-c-num">{c.dhD}</span>
                <span className="v4-c-num is-strong">{c.lastRate}</span>
                <span className="v4-c-num">{c.loads}</span>
                <span className="v4-c-offer">
                  <em className={cn('v4-pill', sent ? 'is-sent' : 'is-idle')}>
                    {c.offer ?? 'Not sent'}
                  </em>
                </span>
              </div>
            )
          })}

          {rows.length === 0 && (
            <p className="v4-tbl__blank">No carriers match this filter — widen the search.</p>
          )}
        </div>
      </div>

      <footer className="v4-board__foot">
        <span>
          {rows.length} of {all.length} carriers
        </span>
        <span>
          {mode} · Simultaneous
        </span>
      </footer>
    </section>
  )
}
