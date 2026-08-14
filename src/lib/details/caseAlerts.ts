import type { BidOffer, LoadDetail } from '@/data/loadDetail'
import type { CaseActionId } from '@/components/details/View3CaseLayout'

export type CaseAlertLevel = 'blocker' | 'warn' | 'ok'
export type CaseAlertScope = 'load' | 'network' | 'carrier'

/** How the alert gets cleared from its action button. */
export type CaseAlertAuto = {
  /** Applied on click, or pre-filled into the amount dialog when `amount` is set. */
  value: string
  /** Button text — the action only, never the value. */
  label: string
  /** Rates open a small dialog so the user types the number themselves. */
  amount?: boolean
}

export type CaseAlert = {
  id: CaseActionId
  scope: CaseAlertScope
  /** Short label for the action button. */
  title: string
  /** Why it is open — shown as the button tooltip. */
  detail: string
  level: CaseAlertLevel
  auto?: CaseAlertAuto
}

export const EQUIPMENT_OPTIONS = [
  'DRY-VAN',
  'REEFER',
  'FLATBED',
  'INTERMODAL',
  'POWER-ONLY',
]

/** Default appointment slots used when booking a missing appointment automatically. */
export const PICKUP_SLOT = '08:00'
export const DELIVERY_SLOT = '15:00'

/** Margin the automatic Max Buy leaves against the customer rate. */
const TARGET_MARGIN = 0.12
const BOOK_NOW_UNDER = 0.075
const REJECT_OVER = 0.08

const unset = (v?: string) => !v || v === '—' || v === '$0.00' || v.trim() === ''

const num = (v?: string) => {
  const n = Number((v ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : 0
}

const usd = (n: number) => `$${n.toFixed(2)}`

export function awardedBid(detail: LoadDetail): BidOffer | undefined {
  return detail.bids.find((b) => b.status === 'Accepted')
}

function loadAlerts(detail: LoadDetail): CaseAlert[] {
  const pickup = detail.stops.find((s) => s.role === 'Hook' || s.kind === 'Pickup')
  const drop = [...detail.stops].reverse().find((s) => s.role === 'Drop' || s.kind === 'Delivery')
  const equipment = detail.load.equipment
  const equipUnset = unset(equipment) || equipment.toUpperCase() === 'GENERAL'

  /* Max Buy anchors Book Now and Reject Above; fall back to the customer rate until it is set */
  const ceiling = num(detail.maxBuy) || detail.load.fee * (1 - TARGET_MARGIN)
  const suggestedMaxBuy = usd(detail.load.fee * (1 - TARGET_MARGIN))
  const suggestedBookNow = usd(ceiling * (1 - BOOK_NOW_UNDER))
  const suggestedReject = usd(ceiling * (1 + REJECT_OVER))

  const equipmentGuess =
    EQUIPMENT_OPTIONS.find((o) =>
      (detail.commodities[0]?.description ?? '').toUpperCase().includes(o)
    ) ?? EQUIPMENT_OPTIONS[0]

  const broker = detail.salesRep || 'Sourcing desk'

  return [
    {
      id: 'hook',
      scope: 'load',
      title: 'Pickup appointment',
      level: pickup?.appointmentRequired ? 'blocker' : 'ok',
      detail: pickup?.appointmentRequired
        ? `Not booked at ${pickup.facility}`
        : `Booked · ${pickup?.when ?? '—'}`,
      auto: { value: PICKUP_SLOT, label: 'Add time' },
    },
    {
      id: 'drop',
      scope: 'load',
      title: 'Delivery appointment',
      level: drop?.appointmentRequired ? 'blocker' : 'ok',
      detail: drop?.appointmentRequired
        ? `Not booked at ${drop.facility}`
        : `Booked · ${drop?.when ?? '—'}`,
      auto: { value: DELIVERY_SLOT, label: 'Add time' },
    },
    {
      id: 'equipment',
      scope: 'load',
      title: 'Equipment type',
      level: equipUnset ? 'blocker' : 'ok',
      detail: equipUnset ? 'Missing on the order — carriers cannot be matched' : equipment,
      auto: { value: equipmentGuess, label: 'Set equipment' },
    },
    {
      id: 'maxbuy',
      scope: 'load',
      title: 'Max buy',
      level: unset(detail.maxBuy) ? 'blocker' : 'ok',
      detail: unset(detail.maxBuy) ? 'Internal ceiling required' : `Hard limit ${detail.maxBuy}`,
      auto: { value: suggestedMaxBuy, label: 'Set amount', amount: true },
    },
    {
      id: 'booknow',
      scope: 'load',
      title: 'Book now',
      level: unset(detail.bookNowRate) ? 'warn' : 'ok',
      detail: unset(detail.bookNowRate)
        ? 'Auto-accept line not set'
        : `Auto-accept at ${detail.bookNowRate}`,
      auto: { value: suggestedBookNow, label: 'Set amount', amount: true },
    },
    {
      id: 'reject',
      scope: 'load',
      title: 'Reject above',
      level: unset(detail.rejectAbove) ? 'warn' : 'ok',
      detail: unset(detail.rejectAbove)
        ? 'Auto-reject ceiling not set'
        : `Auto-reject over ${detail.rejectAbove}`,
      auto: { value: suggestedReject, label: 'Set amount', amount: true },
    },
    {
      id: 'broker',
      scope: 'load',
      title: 'Owning broker',
      level: detail.load.broker ? 'ok' : 'warn',
      detail: detail.load.broker ? detail.load.broker : 'Nobody owns this load yet',
      auto: { value: broker, label: 'Assign broker' },
    },
  ]
}

function networkAlerts(detail: LoadDetail): CaseAlert[] {
  const carriers = detail.carriers
  if (carriers.length === 0)
    return [
      {
        id: 'network',
        scope: 'network',
        title: 'Carrier network',
        level: 'blocker',
        detail: 'No carriers defined for this managed lane.',
      },
    ]

  const expired = carriers.filter((c) => c.insurance === 'Expired')
  const expiring = carriers.filter((c) => c.insurance === 'Expiring')
  const compliant = carriers.length - expired.length

  return [
    {
      id: 'network',
      scope: 'network',
      title: 'Carrier compliance',
      level: expired.length > 0 ? 'warn' : 'ok',
      detail:
        expired.length > 0
          ? `${compliant} of ${carriers.length} compliant · ${expired.length} insurance expired${
              expiring.length > 0 ? `, ${expiring.length} expiring` : ''
            }.`
          : `All ${carriers.length} carriers compliant.`,
    },
  ]
}

function carrierAlerts(detail: LoadDetail, bid: BidOffer): CaseAlert[] {
  const hasPhone = Boolean(bid.phone)
  const hasEmail = Boolean(bid.email)
  const missing = [!hasPhone && 'phone', !hasEmail && 'email'].filter(Boolean) as string[]
  const flags = bid.cmtFlags ?? []

  /* Reach details already on file for this carrier elsewhere in the network */
  const onFile = detail.carriers.find((c) => c.name === bid.carrier)
  const fallbackEmail = `dispatch@${bid.carrier.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`
  const contactValue = !hasPhone
    ? (onFile?.phone ?? '+1 555 0142')
    : (onFile?.email ?? fallbackEmail)

  return [
    {
      id: 'contact',
      scope: 'carrier',
      title: 'Carrier contact',
      level: !hasPhone && !hasEmail ? 'blocker' : missing.length > 0 ? 'warn' : 'ok',
      detail:
        missing.length > 0
          ? `Missing ${missing.join(' and ')} for ${bid.carrier}`
          : `${bid.contact ?? 'Contact'} · ${bid.phone}`,
      auto: { value: contactValue, label: 'Add contact' },
    },
    {
      id: 'channel',
      scope: 'carrier',
      title: 'Preferred channel',
      level: bid.channel ? 'ok' : 'warn',
      detail: bid.channel ? `${bid.channel} preferred` : 'Mode of communication not set',
      auto: { value: 'Email', label: 'Set channel' },
    },
    {
      id: 'insurance',
      scope: 'carrier',
      title: 'Insurance',
      level: bid.insurance === 'Expired' ? 'blocker' : bid.insurance === 'Expiring' ? 'warn' : 'ok',
      detail:
        bid.insurance === 'Expired'
          ? `Certificate expired ${bid.insuranceExpiry ?? ''}`.trim()
          : bid.insurance === 'Expiring'
            ? `Certificate expires ${bid.insuranceExpiry ?? 'soon'}.`
            : `Active through ${bid.insuranceExpiry ?? '—'}`,
    },
    {
      id: 'cmt',
      scope: 'carrier',
      title: 'CMT validation',
      level: flags.length > 0 ? 'warn' : 'ok',
      detail: flags.length > 0 ? flags.join(' · ') : 'No open findings.',
    },
  ]
}

export function buildCaseAlerts(detail: LoadDetail): CaseAlert[] {
  const out = [...loadAlerts(detail)]
  if (detail.load.mode === 'Managed') out.push(...networkAlerts(detail))

  const awarded = awardedBid(detail)
  if (awarded && (detail.load.stage === 'Award' || detail.load.stage === 'Booking'))
    out.push(...carrierAlerts(detail, awarded))

  return out
}

const RANK: Record<CaseAlertLevel, number> = { blocker: 0, warn: 1, ok: 2 }

/** Open alerts, most severe first — this is the order they appear as buttons. */
export function openAlerts(alerts: CaseAlert[]): CaseAlert[] {
  return alerts.filter((a) => a.level !== 'ok').sort((a, b) => RANK[a.level] - RANK[b.level])
}
