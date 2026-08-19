import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Check,
  Mail,
  MessageCircle,
  Minus,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  carrierConfidence,
  type LaneSearch,
  type SearchCarrier,
} from '@/data/carrierSearch'

const money = (value: number) => `$${value.toLocaleString()}`

export function confidenceTone(level: 'High' | 'Medium' | 'Low') {
  return level === 'High' ? 'is-high' : level === 'Medium' ? 'is-mid' : 'is-low'
}

export function ConfidenceCell({ carrier }: { carrier: SearchCarrier }) {
  const { score, level } = carrierConfidence(carrier)
  return (
    <div className={cn('cs-conf', confidenceTone(level))} title={`${level} confidence`}>
      <b>{score}</b>
      <span>
        <i style={{ width: `${score}%` }} />
      </span>
    </div>
  )
}

type HoverState = { carrier: SearchCarrier; lane: LaneSearch; x: number; y: number } | null

export function useCarrierHover() {
  const [hover, setHover] = useState<HoverState>(null)
  const timer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    []
  )

  const bind = (carrier: SearchCarrier, lane: LaneSearch) => ({
    onMouseEnter: (event: React.MouseEvent) => {
      const x = event.clientX
      const y = event.clientY
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setHover({ carrier, lane, x, y }), 160)
    },
    onMouseMove: (event: React.MouseEvent) => {
      setHover((current) =>
        current && current.carrier.id === carrier.id
          ? { ...current, x: event.clientX, y: event.clientY }
          : current
      )
    },
    onMouseLeave: () => {
      if (timer.current) window.clearTimeout(timer.current)
      setHover(null)
    },
  })

  return { hover, bind }
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="cs-hover__fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

/** Days between today and an expiry label like "Nov 30, 2026". */
function daysUntil(label?: string) {
  if (!label) return undefined
  const target = new Date(`${label} 12:00:00`)
  if (Number.isNaN(target.getTime())) return undefined
  const now = new Date()
  now.setHours(12, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 86_400_000)
}

function InsuranceCard({ carrier }: { carrier: SearchCarrier }) {
  const left = daysUntil(carrier.insuranceExpiry)
  const state = carrier.insurance ?? 'ok'
  const expiry = carrier.insuranceExpiry

  if (state === 'expired') {
    return (
      <div className="cs-hover__ins is-expired">
        <ShieldAlert size={13} />
        <div>
          <strong>Insurance expired</strong>
          <span>
            {expiry ? `Lapsed ${expiry}` : 'No certificate on file'}
            {left !== undefined && left < 0 ? ` · ${Math.abs(left)}d ago` : ''}
          </span>
        </div>
        <em>Do not tender</em>
      </div>
    )
  }

  if (state === 'soon') {
    return (
      <div className="cs-hover__ins is-soon">
        <ShieldAlert size={13} />
        <div>
          <strong>Insurance expiring</strong>
          <span>
            {expiry ? `Valid to ${expiry}` : 'Expiry date missing'}
            {left !== undefined && left >= 0 ? ` · ${left}d left` : ''}
          </span>
        </div>
        <em>Renew COI</em>
      </div>
    )
  }

  return (
    <div className="cs-hover__ins is-ok">
      <ShieldCheck size={13} />
      <div>
        <strong>Insurance active</strong>
        <span>{expiry ? `Valid to ${expiry}` : 'Certificate on file'}</span>
      </div>
      <em>Cleared</em>
    </div>
  )
}

export function CarrierHoverCard({ hover }: { hover: HoverState }) {
  if (!hover) return null
  const { carrier, lane, x, y } = hover
  const { score, level, reasons } = carrierConfidence(carrier)
  const width = 328
  const flipX = x + width + 26 > window.innerWidth
  const flipY = y + 400 > window.innerHeight

  return createPortal(
    <div
      className="cs-hover"
      role="tooltip"
      style={{
        width,
        left: flipX ? Math.max(12, x - width - 14) : x + 14,
        top: flipY ? Math.max(12, y - 382) : y + 14,
      }}
    >
      <div className="cs-hover__head">
        <div>
          <strong>{carrier.name}</strong>
          <span>
            MC {carrier.mc} · DOT {carrier.dot}
          </span>
        </div>
        <span className={cn('cs-hover__score', confidenceTone(level))}>
          <b>{score}</b>
          {level}
        </span>
      </div>

      <div className="cs-hover__lane">
        <Truck size={11} />
        {lane.origin} → {lane.destination} · {lane.equipment}
      </div>

      <InsuranceCard carrier={carrier} />

      <div className="cs-hover__why">
        {reasons.map((reason) => (
          <span key={reason.text} className={reason.good ? 'is-good' : 'is-bad'}>
            {reason.good ? <Check size={10} /> : <Minus size={10} />}
            {reason.text}
          </span>
        ))}
      </div>

      <div className="cs-hover__facts">
        <Fact label="Source" value={carrier.source} />
        <Fact
          label="Last used"
          value={carrier.lastUsed ? `${carrier.lastUsed} · ${carrier.lastUsedTime}` : 'Never'}
        />
        <Fact label="Loads / legs" value={`${carrier.loads} / ${carrier.legs}`} />
        <Fact
          label="Last rate"
          value={carrier.lastRate ? money(carrier.lastRate) : 'No rate on file'}
        />
        <Fact label="Deadhead" value={`${carrier.dhP} / ${carrier.dhD} mi`} />
        <Fact
          label="Config rate"
          value={carrier.configRate ? money(carrier.configRate) : 'Not set'}
        />
        <Fact
          label="Offer"
          value={
            carrier.offer === 'Not sent'
              ? 'Not sent'
              : carrier.offerAmount
                ? `${carrier.offer} · ${money(carrier.offerAmount)}`
                : carrier.offer
          }
        />
        <Fact
          label="Probill"
          value={carrier.assignedProbill ? carrier.assignedProbill : 'Not assigned'}
        />
      </div>

      <div className="cs-hover__contact">
        {carrier.contact && (
          <span>
            <Phone size={10} />
            {carrier.contact}
          </span>
        )}
        {carrier.email && (
          <span>
            <Mail size={10} />
            {carrier.email}
          </span>
        )}
        {carrier.whatsapp && (
          <span className="is-wa">
            <MessageCircle size={10} />
            WhatsApp active
          </span>
        )}
      </div>
    </div>,
    document.body
  )
}

export type MenuItem =
  | { type: 'sep' }
  | {
      id: string
      label: string
      hint?: string
      disabled?: boolean
      onSelect: () => void
    }

export type MenuState = {
  x: number
  y: number
  title: string
  subtitle?: string
  items: MenuItem[]
}

export function useContextMenu() {
  const [menu, setMenu] = useState<MenuState | null>(null)

  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    const timer = window.setTimeout(() => window.addEventListener('click', close), 0)
    window.addEventListener('scroll', close, true)
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('click', close)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('keydown', onKey)
    }
  }, [menu])

  const open = (event: React.MouseEvent, next: Omit<MenuState, 'x' | 'y'>) => {
    event.preventDefault()
    event.stopPropagation()
    setMenu({ ...next, x: event.clientX, y: event.clientY })
  }

  return { menu, open, close: () => setMenu(null) }
}

export function ContextMenu({
  menu,
  onClose,
}: {
  menu: MenuState | null
  onClose: () => void
}) {
  if (!menu) return null
  const width = 248
  const left = Math.min(menu.x, window.innerWidth - width - 8)
  const top = Math.min(menu.y, window.innerHeight - 12)

  return createPortal(
    <div
      className="cs-menu"
      role="menu"
      style={{ left, top }}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <header>
        <strong>{menu.title}</strong>
        {menu.subtitle && <span>{menu.subtitle}</span>}
      </header>
      {menu.items.map((item, index) =>
        'id' in item ? (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              if (item.disabled) return
              item.onSelect()
              onClose()
            }}
          >
            <span>{item.label}</span>
            {item.hint && <em>{item.hint}</em>}
          </button>
        ) : (
          <hr key={`sep-${index}`} />
        )
      )}
    </div>,
    document.body
  )
}
