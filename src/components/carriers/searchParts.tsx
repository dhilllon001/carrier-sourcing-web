import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Mail, MessageCircle, Minus, Phone, Truck } from 'lucide-react'
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

export function CarrierHoverCard({ hover }: { hover: HoverState }) {
  if (!hover) return null
  const { carrier, lane, x, y } = hover
  const { score, level, reasons } = carrierConfidence(carrier)
  const width = 328
  const flipX = x + width + 26 > window.innerWidth
  const flipY = y + 330 > window.innerHeight

  return createPortal(
    <div
      className="cs-hover"
      role="tooltip"
      style={{
        width,
        left: flipX ? Math.max(12, x - width - 14) : x + 14,
        top: flipY ? Math.max(12, y - 312) : y + 14,
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
        <Fact label="Deadhead" value={`${carrier.dhP} mi in · ${carrier.dhD} mi out`} />
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
