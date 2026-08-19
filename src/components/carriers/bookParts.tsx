import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Mail, MapPin, Phone, ShieldCheck, Star } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  isLapsed,
  perLoad,
  vsMarketPct,
  type BookCarrier,
} from '@/data/carrierBook'

export const money = (n: number) => `$${Math.round(n).toLocaleString()}`

export function pctTone(v: number) {
  if (v >= 93) return 'is-good'
  if (v >= 85) return 'is-warn'
  return 'is-bad'
}

export function Sparkline({ months, tone }: { months: number[]; tone?: string }) {
  const peak = Math.max(...months, 1)
  return (
    <span className={cn('bk-spark', tone)} aria-hidden>
      {months.map((m, i) => (
        <i key={i} style={{ height: `${Math.max(8, (m / peak) * 100)}%` }} data-zero={m === 0} />
      ))}
    </span>
  )
}

export function RoleChip({ c }: { c: BookCarrier }) {
  return (
    <span className={cn('bk-role', `is-${c.role.toLowerCase()}`)}>
      {c.role === 'Rep' && <i />}
      {c.role}
    </span>
  )
}

export function InsuranceCell({ c }: { c: BookCarrier }) {
  if (c.insurance === 'ok') return <span className="bk-ins">{c.insuranceExpiry}</span>
  return (
    <span className={cn('bk-ins', c.insurance === 'expired' ? 'is-expired' : 'is-soon')}>
      <ShieldCheck size={10} />
      {c.insuranceExpiry}
    </span>
  )
}

export function LaneChips({ c, max = 2 }: { c: BookCarrier; max?: number }) {
  const shown = c.lanes.slice(0, max)
  const rest = c.lanes.length - shown.length
  return (
    <span className="bk-lanes">
      {shown.map((l) => (
        <span key={l.lane} className={cn('bk-lane', l.favourite && 'is-fav')}>
          {l.favourite && <Star size={9} fill="currentColor" />}
          {l.lane}
        </span>
      ))}
      {rest > 0 && <span className="bk-lane is-more">+{rest}</span>}
    </span>
  )
}

/* ── hover card ─────────────────────────────────────────────
   Rests under the cursor after a short delay so scanning a table
   doesn't flash cards, and flips sides near the viewport edge. */

type HoverState = { carrier: BookCarrier; x: number; y: number } | null

export function useCarrierHover() {
  const [hover, setHover] = useState<HoverState>(null)
  const timer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    []
  )

  const open = (carrier: BookCarrier, e: React.MouseEvent) => {
    const x = e.clientX
    const y = e.clientY
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setHover({ carrier, x, y }), 170)
  }

  const close = () => {
    if (timer.current) window.clearTimeout(timer.current)
    setHover(null)
  }

  const bind = (carrier: BookCarrier) => ({
    onMouseEnter: (e: React.MouseEvent) => open(carrier, e),
    onMouseMove: (e: React.MouseEvent) => {
      if (hover?.carrier.id === carrier.id) setHover({ carrier, x: e.clientX, y: e.clientY })
    },
    onMouseLeave: close,
  })

  return { hover, bind, close }
}

function Fact({ label, value, tone }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="bk-hover__fact">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
    </div>
  )
}

export function CarrierHoverCard({ hover }: { hover: HoverState }) {
  if (!hover) return null
  const { carrier: c, x, y } = hover
  const width = 320
  const flipX = x + width + 24 > window.innerWidth
  const flipY = y + 320 > window.innerHeight
  const vs = vsMarketPct(c)

  return createPortal(
    <div
      className="bk-hover"
      style={{
        left: flipX ? x - width - 14 : x + 14,
        top: flipY ? Math.max(12, y - 300) : y + 14,
        width,
      }}
      role="tooltip"
    >
      <div className="bk-hover__head">
        <div>
          <strong>{c.name}</strong>
          <span>
            MC {c.mc} · DOT {c.dot}
          </span>
        </div>
        {c.rank && (
          <span className="bk-rankpill">
            <Star size={9} fill="currentColor" />#{c.rank}
          </span>
        )}
      </div>

      <div className="bk-hover__who">
        <span>
          <MapPin size={10} />
          {c.city}, {c.state}
        </span>
        <span>{c.contact}</span>
        <span>
          <Phone size={10} />
          {c.phone}
        </span>
        <span>
          <Mail size={10} />
          {c.email}
        </span>
      </div>

      <div className="bk-hover__facts">
        <Fact label="Loads run" value={c.loadsRun.toLocaleString()} />
        <Fact label="Since" value={c.since} />
        <Fact label="Spend" value={money(c.spend)} />
        <Fact label="Per load" value={money(perLoad(c))} />
        <Fact label="Acceptance" value={`${c.accept}%`} tone={pctTone(c.accept)} />
        <Fact label="On time" value={`${c.onTime}%`} tone={pctTone(c.onTime)} />
        <Fact
          label="vs market"
          value={`${vs >= 0 ? '+' : ''}${vs.toFixed(1)}%`}
          tone={vs > 3 ? 'is-bad' : vs > 0 ? 'is-warn' : 'is-good'}
        />
        <Fact
          label="Claims"
          value={c.claims === 0 ? 'None' : `${c.claims}`}
          tone={c.claims > 1 ? 'is-bad' : c.claims === 1 ? 'is-warn' : 'is-good'}
        />
        <Fact
          label="Insurance"
          value={c.insuranceExpiry}
          tone={c.insurance === 'expired' ? 'is-bad' : c.insurance === 'soon' ? 'is-warn' : 'is-good'}
        />
        <Fact
          label="Last load"
          value={c.lastLoad}
          tone={isLapsed(c) ? 'is-bad' : undefined}
        />
      </div>

      <div className="bk-hover__lanes">
        <span className="bk-hover__label">Lanes we have run together</span>
        {c.lanes.map((l) => (
          <div key={l.lane} className="bk-hover__lane">
            <span>
              {l.favourite && <Star size={9} fill="currentColor" />}
              {l.lane}
            </span>
            <em>
              {l.loads} loads · {Math.round((l.loads / c.loadsRun) * 100)}%
            </em>
          </div>
        ))}
      </div>

      <div className="bk-hover__foot">
        {c.owner === 'You' ? 'In your book' : `Owned by ${c.owner}`}
        {c.backupRep ? ` · backup ${c.backupRep}` : ''}
      </div>
    </div>,
    document.body
  )
}
