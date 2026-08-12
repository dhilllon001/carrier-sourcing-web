import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Award,
  BadgeCheck,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Gauge,
  Layers,
  Loader2,
  Mail,
  MessageCircle,
  Plus,
  RadioTower,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import type { BidOffer, CarrierRow, LoadDetail } from '@/data/loadDetail'

export type AutoMode = 'sourcing' | 'tender' | 'award'

export const AUTO_MODE_LABEL: Record<AutoMode, string> = {
  sourcing: 'Auto Sourcing',
  tender: 'Auto Tender',
  award: 'Auto Award',
}

/* ── Mock outreach counts ── */
const INTERNAL_EMAIL = 25
const INTERNAL_WA = 20
const HIGHWAY_CARRIERS = 32
const UNIQUE_CONTACTS = 30

type ChannelId = 'internal' | 'highway' | 'email' | 'whatsapp' | 'dat' | 'loadlink'

const CHANNEL_META: Record<ChannelId, { label: string; hint: string; icon: typeof Mail }> = {
  internal: { label: 'Internal carrier base', hint: '45 approved carriers', icon: Users },
  highway: { label: 'Highway-sourced carriers', hint: `${HIGHWAY_CARRIERS} verified via Highway`, icon: ShieldCheck },
  email: { label: 'Blast email', hint: `${INTERNAL_EMAIL} with verified email`, icon: Mail },
  whatsapp: { label: 'Blast WhatsApp', hint: `${INTERNAL_WA} WhatsApp enabled`, icon: MessageCircle },
  dat: { label: 'Post to DAT', hint: 'Auto-refresh every 20 min', icon: RadioTower },
  loadlink: { label: 'Post to Loadlink', hint: 'Load board posting', icon: RadioTower },
}

type SourcingRule = {
  id: string
  name: string
  description: string
  channels: ChannelId[]
  custom?: boolean
}

const PRESET_RULES: SourcingRule[] = [
  {
    id: 'internal-only',
    name: 'Internal carriers only',
    description: 'Blast email + WhatsApp to our approved carrier base. No public boards.',
    channels: ['internal', 'email', 'whatsapp'],
  },
  {
    id: 'internal-dat',
    name: 'Internal + DAT',
    description: 'Blast the internal base and post to DAT only.',
    channels: ['internal', 'email', 'dat'],
  },
  {
    id: 'max-reach',
    name: 'Maximum reach',
    description: 'Internal base, Highway-sourced carriers, DAT and Loadlink — everything.',
    channels: ['internal', 'highway', 'email', 'whatsapp', 'dat', 'loadlink'],
  },
]

/* ── Carrier intelligence (deterministic mock) ── */
function seedOf(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

type CarrierIntel = {
  rating: number
  highwayVerified: boolean
  onboarding: 'Complete' | 'Pending'
  monitoringAlerts: number
}

function intelFor(name: string): CarrierIntel {
  const seed = seedOf(name)
  return {
    rating: Math.round((3.5 + ((seed >> 3) % 15) / 10) * 10) / 10,
    highwayVerified: seed % 3 !== 0,
    onboarding: seed % 4 === 0 ? 'Pending' : 'Complete',
    monitoringAlerts: seed % 5 === 0 ? 1 : 0,
  }
}

function moneyToNumber(v?: string) {
  if (!v) return NaN
  return Number(v.replace(/[^0-9.]/g, ''))
}

type ScoredOffer = {
  bid: BidOffer
  intel: CarrierIntel
  allIn: number
  score: number
  overLimit: boolean
  reasons: string[]
}

function scoreOffers(bids: BidOffer[], hardLimit: number): ScoredOffer[] {
  const scored = bids.map((bid) => {
    const intel = intelFor(bid.carrier)
    const allIn = moneyToNumber(bid.allIn ?? bid.amount)
    const overLimit = hardLimit > 0 && allIn > hardLimit
    const rateScore =
      hardLimit > 0 && Number.isFinite(allIn)
        ? Math.max(0, Math.min(34, ((hardLimit - allIn) / hardLimit) * 260))
        : 15
    const score = overLimit
      ? 0
      : Math.min(
          100,
          Math.round(
            rateScore +
              intel.rating * 8 +
              (intel.highwayVerified ? 12 : 0) +
              (intel.onboarding === 'Complete' ? 8 : 0) -
              intel.monitoringAlerts * 15
          )
        )
    const reasons: string[] = []
    if (overLimit) reasons.push(`All-in $${allIn.toLocaleString()} exceeds hard limit`)
    else {
      if (hardLimit > 0 && allIn < hardLimit)
        reasons.push(`$${(hardLimit - allIn).toLocaleString()} under max buy`)
      reasons.push(`${intel.rating.toFixed(1)}★ carrier rating`)
      if (intel.highwayVerified) reasons.push('Highway identity verified')
      else reasons.push('Not Highway verified')
      reasons.push(
        intel.onboarding === 'Complete' ? 'Onboarding complete' : 'Onboarding pending'
      )
      if (intel.monitoringAlerts > 0) reasons.push(`${intel.monitoringAlerts} open monitoring alert`)
    }
    return { bid, intel, allIn, score, overLimit, reasons }
  })
  return scored.sort((a, b) => b.score - a.score)
}

type TaskState = 'queued' | 'running' | 'done' | 'failed'

type CarrierLog = {
  kind: 'carrier'
  name: string
  mc: string
  dot: string
  source: 'Past' | 'DAT' | 'Highway' | 'GenLogs' | 'Internal' | 'NEW'
  lastUsed: string
  blastRate: string
  loads: number
  contactName: string
  phone: string
  email: string
}

type MetaLog = {
  kind: 'meta'
  name: string
  detail: string
  meta?: string
}

type LogRow = CarrierLog | MetaLog

type RunTask = {
  id: string
  label: string
  result: string
  failResult?: string
  state: TaskState
  logTitle?: string
  logs?: LogRow[]
}

const EXTRA_CARRIERS: Omit<CarrierLog, 'kind' | 'blastRate'>[] = [
  {
    name: 'Summit Freight Partners',
    mc: '441902',
    dot: '2918401',
    source: 'DAT',
    lastUsed: '3d ago',
    loads: 18,
    contactName: 'Chris Lang',
    email: 'desk@summitfreight.example',
    phone: '+1 (216) 555-0188',
  },
  {
    name: 'Lake Erie Hauling',
    mc: '552013',
    dot: '3029512',
    source: 'Past',
    lastUsed: '1w ago',
    loads: 44,
    contactName: 'Dana Mills',
    email: 'ops@lakeerie.example',
    phone: '+1 (419) 555-0144',
  },
  {
    name: 'Heartland Van Lines',
    mc: '663124',
    dot: '3140623',
    source: 'Highway',
    lastUsed: '2d ago',
    loads: 9,
    contactName: 'Evan Cho',
    email: 'rates@heartlandvan.example',
    phone: '+1 (317) 555-0190',
  },
  {
    name: 'Crossroads Express LLC',
    mc: '774235',
    dot: '3251734',
    source: 'GenLogs',
    lastUsed: '5d ago',
    loads: 27,
    contactName: 'Priya Shah',
    email: 'dispatch@crossroadsx.example',
    phone: '+1 (502) 555-0162',
  },
  {
    name: 'Prairie Wind Transport',
    mc: '885346',
    dot: '3362845',
    source: 'DAT',
    lastUsed: 'Never',
    loads: 0,
    contactName: 'Noah Blake',
    email: 'team@prairiewind.example',
    phone: '+1 (701) 555-0117',
  },
  {
    name: 'Blue Ridge Carriers',
    mc: '996457',
    dot: '3473956',
    source: 'Past',
    lastUsed: '12d ago',
    loads: 61,
    contactName: 'Sam Ortiz',
    email: 'load@blueridge.example',
    phone: '+1 (828) 555-0139',
  },
  {
    name: 'Ironbound Logistics',
    mc: '107568',
    dot: '3584067',
    source: 'Highway',
    lastUsed: '6h ago',
    loads: 7,
    contactName: 'Kim Hale',
    email: 'ops@ironbound.example',
    phone: '+1 (973) 555-0155',
  },
  {
    name: 'Sunbelt Power Haul',
    mc: '218679',
    dot: '3695178',
    source: 'Internal',
    lastUsed: 'Yesterday',
    loads: 33,
    contactName: 'Jordan Lee',
    email: 'desk@sunbeltpower.example',
    phone: '+1 (480) 555-0171',
  },
  {
    name: 'Northstar Dryvan Co',
    mc: '329780',
    dot: '3706289',
    source: 'DAT',
    lastUsed: '4d ago',
    loads: 15,
    contactName: 'Alex Quinn',
    email: 'quotes@northstardry.example',
    phone: '+1 (612) 555-0123',
  },
  {
    name: 'Coastal Bridge Freight',
    mc: '430891',
    dot: '3817390',
    source: 'GenLogs',
    lastUsed: '8d ago',
    loads: 22,
    contactName: 'Riley Fox',
    email: 'ops@coastalbridge.example',
    phone: '+1 (757) 555-0180',
  },
  {
    name: 'Highway Path Carriers',
    mc: '541902',
    dot: '3928401',
    source: 'Highway',
    lastUsed: '2w ago',
    loads: 11,
    contactName: 'Morgan Diaz',
    email: 'dispatch@highwaypath.example',
    phone: '+1 (615) 555-0148',
  },
  {
    name: 'Valley Forge Trucking',
    mc: '652013',
    dot: '4039512',
    source: 'Past',
    lastUsed: '9d ago',
    loads: 48,
    contactName: 'Taylor Brooks',
    email: 'rates@valleyforge.example',
    phone: '+1 (610) 555-0166',
  },
  {
    name: 'Great Lakes Linehaul',
    mc: '763124',
    dot: '4150623',
    source: 'DAT',
    lastUsed: '1d ago',
    loads: 19,
    contactName: 'Casey Ng',
    email: 'desk@greatlakeslh.example',
    phone: '+1 (313) 555-0192',
  },
  {
    name: 'Red Rock Expedite',
    mc: '874235',
    dot: '4261734',
    source: 'NEW',
    lastUsed: 'Never',
    loads: 0,
    contactName: 'Jamie Ruiz',
    email: 'ops@redrockexp.example',
    phone: '+1 (505) 555-0134',
  },
  {
    name: 'Keystone Relay Inc',
    mc: '985346',
    dot: '4372845',
    source: 'Internal',
    lastUsed: '3h ago',
    loads: 72,
    contactName: 'Pat Singh',
    email: 'team@keystonerelay.example',
    phone: '+1 (717) 555-0159',
  },
  {
    name: 'Atlas Corridor LLC',
    mc: '196457',
    dot: '4483956',
    source: 'Highway',
    lastUsed: '11d ago',
    loads: 5,
    contactName: 'Drew Patel',
    email: 'load@atlascorridor.example',
    phone: '+1 (214) 555-0177',
  },
  {
    name: 'Silverline Transport',
    mc: '207568',
    dot: '4594067',
    source: 'Past',
    lastUsed: '6d ago',
    loads: 36,
    contactName: 'Blair Chen',
    email: 'dispatch@silverline.example',
    phone: '+1 (704) 555-0111',
  },
  {
    name: 'Pine Belt Carriers',
    mc: '318679',
    dot: '4605178',
    source: 'GenLogs',
    lastUsed: '14d ago',
    loads: 13,
    contactName: 'Shawn Kelly',
    email: 'ops@pinebelt.example',
    phone: '+1 (601) 555-0129',
  },
  {
    name: 'Metro Link Freight',
    mc: '429780',
    dot: '4716289',
    source: 'DAT',
    lastUsed: 'Yesterday',
    loads: 24,
    contactName: 'Avery Cole',
    email: 'desk@metrolinkfr.example',
    phone: '+1 (201) 555-0140',
  },
  {
    name: 'Horizon Bulk Haul',
    mc: '530891',
    dot: '4827390',
    source: 'Past',
    lastUsed: '7d ago',
    loads: 40,
    contactName: 'Reese Grant',
    email: 'rates@horizonbulk.example',
    phone: '+1 (918) 555-0168',
  },
  {
    name: 'Cascade Lane Logistics',
    mc: '641902',
    dot: '4938401',
    source: 'Highway',
    lastUsed: '4h ago',
    loads: 8,
    contactName: 'Quinn Adams',
    email: 'ops@cascadelane.example',
    phone: '+1 (503) 555-0183',
  },
  {
    name: 'Delta Span Carriers',
    mc: '752013',
    dot: '5049512',
    source: 'Internal',
    lastUsed: '2d ago',
    loads: 55,
    contactName: 'Harper West',
    email: 'dispatch@deltaspan.example',
    phone: '+1 (901) 555-0152',
  },
  {
    name: 'Frontier Mile Inc',
    mc: '863124',
    dot: '5160623',
    source: 'GenLogs',
    lastUsed: '10d ago',
    loads: 16,
    contactName: 'Logan Park',
    email: 'team@frontiermile.example',
    phone: '+1 (406) 555-0174',
  },
  {
    name: 'Beacon Roadways',
    mc: '974235',
    dot: '5271734',
    source: 'DAT',
    lastUsed: 'Never',
    loads: 2,
    contactName: 'Cameron Holt',
    email: 'load@beaconroad.example',
    phone: '+1 (860) 555-0196',
  },
  {
    name: 'Oak Ridge Transit',
    mc: '185346',
    dot: '5382845',
    source: 'Past',
    lastUsed: '5d ago',
    loads: 29,
    contactName: 'Skyler Moon',
    email: 'ops@oakridgetrans.example',
    phone: '+1 (865) 555-0131',
  },
  {
    name: 'Twin Ports Express',
    mc: '296457',
    dot: '5493956',
    source: 'Highway',
    lastUsed: '1d ago',
    loads: 12,
    contactName: 'Emery Shaw',
    email: 'desk@twinports.example',
    phone: '+1 (218) 555-0147',
  },
  {
    name: 'Sandstone Freight Co',
    mc: '307568',
    dot: '5504067',
    source: 'DAT',
    lastUsed: '13d ago',
    loads: 6,
    contactName: 'Finley Ross',
    email: 'rates@sandstonefr.example',
    phone: '+1 (405) 555-0160',
  },
  {
    name: 'Riverbend Haulers',
    mc: '418679',
    dot: '5615178',
    source: 'GenLogs',
    lastUsed: '8h ago',
    loads: 21,
    contactName: 'Hayden Cruz',
    email: 'ops@riverbendhaul.example',
    phone: '+1 (563) 555-0189',
  },
]

const CONTACT_FIRST = ['Alex', 'Jordan', 'Sam', 'Priya', 'Chris', 'Dana', 'Morgan', 'Taylor']
const CONTACT_LAST = ['Nguyen', 'Patel', 'Brooks', 'Singh', 'Lopez', 'Kim', 'Walsh', 'Reed']

function sourceFromCarrier(c: CarrierRow): CarrierLog['source'] {
  if (c.source === 'PAST') return 'Past'
  if (c.source === 'DAT') return 'DAT'
  if (c.source === 'NEW') return 'NEW'
  return 'Internal'
}

function poolCarriers(carriers: CarrierRow[], blastRate: string): CarrierLog[] {
  const fromLoad: CarrierLog[] = carriers.map((c, i) => ({
    kind: 'carrier',
    name: c.name,
    mc: c.mc ?? '—',
    dot: c.dot ?? String(2800000 + (i + 1) * 117),
    source: sourceFromCarrier(c),
    lastUsed: c.lastUsedRel || c.lastUsed || '—',
    blastRate,
    loads: c.loads,
    contactName: `${CONTACT_FIRST[i % CONTACT_FIRST.length]} ${CONTACT_LAST[i % CONTACT_LAST.length]}`,
    phone: c.phone ?? '—',
    email: c.email ?? '—',
  }))
  const extras: CarrierLog[] = EXTRA_CARRIERS.map((c) => ({
    kind: 'carrier',
    ...c,
    blastRate,
  }))
  return [...fromLoad, ...extras]
}

function takeCarrierLogs(pool: CarrierLog[], count: number): CarrierLog[] {
  return pool.slice(0, count)
}

function meta(name: string, detail: string, note?: string): MetaLog {
  return { kind: 'meta', name, detail, meta: note }
}

/* ── Per-channel color identity for run rows ── */
const TASK_THEME: Record<string, { cls: string; icon: typeof Mail }> = {
  rates: { cls: 'rates', icon: Gauge },
  blast_email: { cls: 'email', icon: Mail },
  blast_whatsapp: { cls: 'whatsapp', icon: MessageCircle },
  highway: { cls: 'highway', icon: ShieldCheck },
  post_dat: { cls: 'dat', icon: RadioTower },
  post_loadlink: { cls: 'loadlink', icon: RadioTower },
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function mockTime(i: number) {
  const minute = (8 + i * 3) % 60
  return `12:${String(minute).padStart(2, '0')} PM`
}

/* ── Email blast — inbox-style log ── */
function EmailLogView({ rows, subject, preview }: { rows: CarrierLog[]; subject: string; preview: string }) {
  return (
    <div className="dd-mailog">
      <div className="dd-mailog__subject">
        <i>
          <Mail size={14} />
        </i>
        <div>
          <strong>{subject}</strong>
          <span>{preview}</span>
        </div>
        <em>Sent · just now</em>
      </div>
      <div className="dd-mailog__list">
        {rows.map((r, i) => (
          <div key={`${r.name}-${i}`} className="dd-mailog__row">
            <span className={cn('dd-mailog__avatar', `is-c${i % 6}`)}>{initialsOf(r.name)}</span>
            <div className="dd-mailog__who">
              <strong>{r.name}</strong>
              <span>
                {r.email} · MC {r.mc} · DOT {r.dot}
              </span>
            </div>
            <div className="dd-mailog__meta">
              <strong>{r.contactName}</strong>
              <span>{mockTime(i)}</span>
            </div>
            <em className={cn('dd-mailog__chip', i % 4 === 0 && 'is-opened')}>
              {i % 4 === 0 ? 'Opened' : 'Delivered'}
            </em>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── WhatsApp blast — chat-style log ── */
function WhatsAppLogView({ rows, message }: { rows: CarrierLog[]; message: string }) {
  const replies = [
    { who: rows[2]?.name ?? 'Ontario Express', text: 'Interested — what’s the all-in on this one?', time: '12:11 PM' },
    { who: rows[5]?.name ?? 'Twin Ports Express', text: 'Truck empty in Columbus Fri AM. Sending an offer now.', time: '12:14 PM' },
  ]
  const tickState = (i: number) => (i % 3 === 0 ? 'read' : i % 3 === 1 ? 'delivered' : 'sent')
  return (
    <div className="dd-walog">
      <div className="dd-walog__chat">
        <span className="dd-walog__day">Today</span>
        <div className="dd-walog__bubble is-out">
          <p>{message}</p>
          <span>
            12:08 PM <CheckCheck size={13} className="is-read" />
          </span>
        </div>
        {replies.map((rep) => (
          <div key={rep.who} className="dd-walog__bubble is-in">
            <strong>{rep.who}</strong>
            <p>{rep.text}</p>
            <span>{rep.time}</span>
          </div>
        ))}
      </div>
      <div className="dd-walog__list">
        {rows.map((r, i) => {
          const state = tickState(i)
          return (
            <div key={`${r.name}-${i}`} className="dd-walog__row">
              <span className="dd-walog__avatar">{initialsOf(r.name)}</span>
              <div>
                <strong>{r.name}</strong>
                <span>
                  {r.phone} · {r.contactName}
                </span>
              </div>
              <em className={cn('dd-walog__tick', `is-${state}`)}>
                {state === 'sent' ? <Check size={13} /> : <CheckCheck size={13} />}
                {state}
              </em>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Highway outreach — verification cards ── */
function HighwayLogView({ rows }: { rows: CarrierLog[] }) {
  return (
    <div className="dd-hwlog">
      {rows.map((r, i) => (
        <div key={`${r.name}-${i}`} className={cn('dd-hwlog__card', r.source === 'GenLogs' && 'is-genlogs')}>
          <div className="dd-hwlog__top">
            <i>
              <ShieldCheck size={14} />
            </i>
            <strong>{r.name}</strong>
            <em>{r.source === 'GenLogs' ? 'GenLogs' : 'Verified'}</em>
          </div>
          <span className="dd-hwlog__id">
            {r.source === 'GenLogs' ? 'GEN' : 'HGW'}-{String(4100 + i * 37)}
          </span>
          <div className="dd-hwlog__meta">
            <span>
              MC {r.mc} · DOT {r.dot}
            </span>
            <span>
              {r.contactName} · {r.phone}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── DAT / Loadlink — posting details grid ── */
function BoardTicketView({
  board,
  postingId,
  lane,
  equipment,
  miles,
  rate,
  hardLimit,
  extras,
}: {
  board: string
  postingId: string
  lane: string
  equipment: string
  miles: number
  rate: string
  hardLimit: string
  extras: MetaLog[]
}) {
  const fields: { label: string; value: string; note?: string }[] = [
    { label: 'Load board', value: board },
    { label: 'Posting ID', value: postingId },
    { label: 'Lane', value: lane },
    { label: 'Equipment', value: equipment },
    { label: 'Miles', value: `${miles.toLocaleString()} mi` },
    { label: 'Rate posted', value: rate, note: 'Book now' },
    { label: 'Hard limit', value: hardLimit, note: 'Max buy' },
    ...extras.map((m) => ({ label: m.name, value: m.detail, note: m.meta })),
  ]
  return (
    <div className="dd-boardlog">
      <div className="dd-boardlog__head">
        <i>
          <RadioTower size={14} />
        </i>
        <strong>{lane}</strong>
        <em className="dd-boardlog__live">Live</em>
      </div>
      <div className="dd-boardlog__grid">
        {fields.map((f) => (
          <div key={f.label} className="dd-boardlog__field">
            <span>{f.label}</span>
            <strong>{f.value}</strong>
            {f.note && <em>{f.note}</em>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Rates — stat tiles ── */
function RateTilesView({ rows }: { rows: MetaLog[] }) {
  return (
    <div className="dd-ratelog">
      {rows.map((row, i) => (
        <div key={row.name} className={cn('dd-ratelog__tile', `is-t${i % 3}`)}>
          <span>{row.name}</span>
          <strong>{row.detail}</strong>
          {row.meta && <em>{row.meta}</em>}
        </div>
      ))}
    </div>
  )
}

/* ── Yes / No confirmation popup ── */
export function AutoSourcingConfirm({
  mode,
  probill,
  missingCount,
  offerCount,
  onYes,
  onNo,
}: {
  mode: AutoMode
  probill: string
  missingCount: number
  offerCount: number
  onYes: () => void
  onNo: () => void
}) {
  const label = AUTO_MODE_LABEL[mode]
  const Icon = mode === 'sourcing' ? Zap : mode === 'tender' ? Gauge : Award
  return (
    <div className="dd-modal-root" role="dialog" aria-modal="true" aria-labelledby="dd-auto-confirm-title">
      <button type="button" className="dd-modal-backdrop" aria-label="Close" onClick={onNo} />
      <div className="dd-modal dd-auto-confirm">
        <div className="dd-auto-confirm__icon">
          <Icon size={22} />
        </div>
        <h3 id="dd-auto-confirm-title">Run {label}?</h3>
        {mode === 'sourcing' ? (
          <p>
            Auto Sourcing will check missing data points on <strong>{probill}</strong>
            {missingCount > 0 ? (
              <>
                {' '}
                (<strong>{missingCount}</strong> found), let you fix them in one place, then run your
                automation rule — carrier blasts and board postings — from a single screen.
              </>
            ) : (
              <> — all required data is present. Pick an automation rule and run everything from one screen.</>
            )}
          </p>
        ) : mode === 'tender' ? (
          <p>
            Sourcing is done on <strong>{probill}</strong>. Auto Tender will analyze all{' '}
            <strong>{offerCount}</strong> offers — rate vs your max buy hard limit, carrier rating,
            Highway data, onboarding and monitoring — and suggest which offer to accept.
          </p>
        ) : (
          <p>
            <strong>{probill}</strong> is at the award stage. Auto Award will run final checks across{' '}
            <strong>{offerCount}</strong> offers — hard limit, carrier rating, Highway identity,
            onboarding and monitoring — and suggest the carrier to award.
          </p>
        )}
        <div className="dd-auto-confirm__actions">
          <button type="button" className="dd-btn" onClick={onNo}>
            No, not now
          </button>
          <button type="button" className="dd-btn dd-btn--primary" onClick={onYes}>
            <Sparkles size={14} />
            Yes, run {label}
          </button>
        </div>
        <span className="dd-auto-confirm__note">Mock workflow · no live sends, tenders or awards</span>
      </div>
    </div>
  )
}

/* ── Result popup (shown when a run finishes) ── */
function ResultPopup({
  title,
  lines,
  primaryLabel,
  onPrimary,
  onClose,
  tone = 'success',
}: {
  title: string
  lines: string[]
  primaryLabel: string
  onPrimary: () => void
  onClose: () => void
  tone?: 'success' | 'warn'
}) {
  return (
    <div className="dd-modal-root dd-auto-result-root" role="dialog" aria-modal="true">
      <button type="button" className="dd-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="dd-modal dd-auto-result">
        <div className={cn('dd-auto-result__icon', tone === 'warn' && 'is-warn')}>
          {tone === 'warn' ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
        </div>
        <h3>{title}</h3>
        <ul>
          {lines.map((l) => (
            <li key={l}>
              <i className="dd-auto-result__dot" aria-hidden />
              {l}
            </li>
          ))}
        </ul>
        <div className="dd-auto-confirm__actions">
          <button type="button" className="dd-btn" onClick={onClose}>
            Stay here
          </button>
          <button type="button" className="dd-btn dd-btn--primary" onClick={onPrimary}>
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main panel ── */
export function AutoSourcingPanel({
  detail,
  mode,
  onClose,
  onApplyRates,
  onGoFindPost,
  onSourcingComplete,
}: {
  detail: LoadDetail
  mode: AutoMode
  onClose: () => void
  onApplyRates: (patch: Partial<Pick<LoadDetail, 'maxBuy' | 'bookNowRate' | 'rejectAbove'>>) => void
  onGoFindPost: () => void
  onSourcingComplete?: () => void
}) {
  const maxMissing = !detail.maxBuy || detail.maxBuy === '—' || detail.maxBuy === '$0.00'
  const bookMissing = !detail.bookNowRate || detail.bookNowRate === '—'

  /* shared */
  const [popup, setPopup] = useState<{ title: string; lines: string[]; tone?: 'success' | 'warn' } | null>(null)

  /* sourcing flow */
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [ruleId, setRuleId] = useState<string>(PRESET_RULES[2].id)
  const [customChannels, setCustomChannels] = useState<Set<ChannelId>>(
    () => new Set<ChannelId>(['internal', 'email', 'dat'])
  )
  const [maxBuy, setMaxBuy] = useState(maxMissing ? '' : detail.maxBuy.replace(/[^0-9.]/g, ''))
  const [bookNow, setBookNow] = useState(bookMissing ? '' : detail.bookNowRate.replace(/[^0-9.]/g, ''))
  const [bookTouched, setBookTouched] = useState(!bookMissing)
  const [tasks, setTasks] = useState<RunTask[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const popupShown = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* tender / award flow */
  const [analysis, setAnalysis] = useState<'idle' | 'running' | 'done'>('idle')
  const [analysisStep, setAnalysisStep] = useState(0)

  const maxNum = Number(maxBuy)
  const maxOk = Boolean(maxBuy) && !Number.isNaN(maxNum) && maxNum > 0
  const suggestedBook = maxOk ? (maxNum * 0.925).toFixed(2) : ''
  const bookVal = bookTouched && bookNow ? bookNow : suggestedBook
  const dataReady = maxOk && Boolean(bookVal)

  const rule: SourcingRule =
    ruleId === 'custom'
      ? {
          id: 'custom',
          name: 'Custom rule',
          description: 'Your own channel mix for this run.',
          channels: [...customChannels],
          custom: true,
        }
      : PRESET_RULES.find((r) => r.id === ruleId)!

  const channels = new Set(rule.channels)
  const blastPicked = channels.has('email') || channels.has('whatsapp')

  const checks = useMemo(
    () => [
      {
        label: 'Customer rate',
        ok: detail.load.fee > 0,
        note: `$${detail.load.fee.toFixed(2)} ${detail.currency}`,
      },
      { label: 'Equipment', ok: Boolean(detail.load.equipment), note: detail.load.equipment },
      {
        label: 'Max buy — hard limit',
        ok: maxOk,
        note: maxOk ? `$${maxNum.toFixed(2)} ${detail.currency} · never exceeded` : 'Required · hard ceiling for all offers',
      },
      {
        label: 'Book now rate',
        ok: Boolean(bookVal),
        note: bookVal ? `$${Number(bookVal).toFixed(2)} auto-accept` : 'Required · auto-accept rate',
      },
    ],
    [detail, maxOk, maxNum, bookVal]
  )
  const missingNow = checks.filter((c) => !c.ok).length

  const buildTasks = (): RunTask[] => {
    const blastRate = `$${Number(bookVal).toFixed(2)}`
    const pool = poolCarriers(detail.carriers, blastRate)
    const highwayPool = pool.map((c, i) =>
      i % 2 === 0 ? { ...c, source: 'Highway' as const } : { ...c, source: 'GenLogs' as const }
    )
    const list: RunTask[] = [
      {
        id: 'rates',
        label: 'Apply rates to order',
        result: `Max buy $${maxNum.toFixed(2)} (hard limit) · Book now $${Number(bookVal).toFixed(2)}`,
        state: 'queued',
        logTitle: 'Rate changes applied',
        logs: [
          meta('Max buy (hard limit)', `$${maxNum.toFixed(2)} ${detail.currency}`, 'Enforced on all offers'),
          meta('Book now', `$${Number(bookVal).toFixed(2)} ${detail.currency}`, 'Auto-accept threshold'),
          meta('Reject above', `$${(maxNum * 1.08).toFixed(2)} ${detail.currency}`, 'Derived from max buy + 8%'),
        ],
      },
    ]
    if (channels.has('email'))
      list.push({
        id: 'blast_email',
        label: 'Blast email — internal base',
        result: `Sent to ${INTERNAL_EMAIL} carriers`,
        state: 'queued',
        logTitle: `Carriers emailed (${INTERNAL_EMAIL})`,
        logs: takeCarrierLogs(pool, INTERNAL_EMAIL),
      })
    if (channels.has('whatsapp'))
      list.push({
        id: 'blast_whatsapp',
        label: 'Blast WhatsApp — internal base',
        result: `Sent to ${INTERNAL_WA} carriers`,
        state: 'queued',
        logTitle: `WhatsApp contacts reached (${INTERNAL_WA})`,
        logs: takeCarrierLogs(pool, INTERNAL_WA),
      })
    if (channels.has('highway'))
      list.push({
        id: 'highway',
        label: 'Outreach Highway-sourced carriers',
        result: `${HIGHWAY_CARRIERS} verified carriers contacted`,
        state: 'queued',
        logTitle: `Highway / GenLogs outreach (${HIGHWAY_CARRIERS})`,
        logs: takeCarrierLogs(highwayPool, HIGHWAY_CARRIERS),
      })
    if (channels.has('dat'))
      list.push({
        id: 'post_dat',
        label: 'Post to DAT',
        result: 'Posted · repost every 20 min',
        state: 'queued',
        logTitle: 'DAT posting log',
        logs: [
          meta('Board', 'DAT Load Board', 'Posting ID · DAT-MOCK-88421'),
          meta(
            'Lane',
            `${detail.load.origin} → ${detail.load.destination}`,
            `${detail.load.miles.toLocaleString()} mi · ${detail.load.equipment}`
          ),
          meta('Rate posted', `${blastRate} book now`, `Hard limit $${maxNum.toFixed(2)}`),
          meta('Repost schedule', 'Every 20 minutes', 'Auto-refresh enabled'),
          meta('Posted by', 'Sukhdeep Dhillon', 'Mock session · just now'),
        ],
      })
    if (channels.has('loadlink'))
      list.push({
        id: 'post_loadlink',
        label: 'Post to Loadlink',
        result: 'Posted to Loadlink',
        failResult: 'Failed · Loadlink session expired',
        state: 'queued',
        logTitle: 'Loadlink posting log',
        logs: [
          meta('Board', 'Loadlink', 'Posting ID · LL-MOCK-22014'),
          meta(
            'Lane',
            `${detail.load.origin} → ${detail.load.destination}`,
            `${detail.load.miles.toLocaleString()} mi · ${detail.load.equipment}`
          ),
          meta('Rate posted', `${blastRate} book now`, `Hard limit $${maxNum.toFixed(2)}`),
          meta('Session', 'Mock broker session', 'Expires in 4h (after retry)'),
        ],
      })
    return list
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const finishSourcing = () => {
    setPopup(null)
    onSourcingComplete?.()
  }

  const summaryLines = () => {
    const lines: string[] = []
    if (channels.has('email')) lines.push(`Blast email sent to ${INTERNAL_EMAIL} carriers`)
    if (channels.has('whatsapp')) lines.push(`Blast WhatsApp sent to ${INTERNAL_WA} carriers`)
    if (blastPicked) lines.push(`${UNIQUE_CONTACTS} unique contacts reached`)
    if (channels.has('highway')) lines.push(`${HIGHWAY_CARRIERS} Highway-sourced carriers contacted`)
    if (channels.has('dat')) lines.push('Load posted to DAT')
    if (channels.has('loadlink'))
      lines.push(
        tasks.find((t) => t.id === 'post_loadlink')?.state === 'done'
          ? 'Load posted to Loadlink'
          : 'Loadlink posting failed — retry available'
      )
    lines.push(`Rates applied — max buy $${maxNum.toFixed(2)}, book now $${Number(bookVal || 0).toFixed(2)}`)
    return lines
  }

  const startRun = () => {
    onApplyRates({
      maxBuy: `$${maxNum.toFixed(2)}`,
      bookNowRate: `$${Number(bookVal).toFixed(2)}`,
      rejectAbove: `$${(maxNum * 1.08).toFixed(2)}`,
    })
    popupShown.current = false
    setTasks(buildTasks())
    setStep(3)
  }

  /* advance the mock run one task at a time */
  useEffect(() => {
    if (mode !== 'sourcing' || step !== 3) return
    const idx = tasks.findIndex((t) => t.state === 'queued' || t.state === 'running')
    if (idx === -1) {
      if (tasks.length > 0 && !popupShown.current) {
        popupShown.current = true
        const failed = tasks.some((t) => t.state === 'failed')
        setPopup({
          title: failed ? 'Auto Sourcing finished with issues' : 'Auto Sourcing complete',
          lines: summaryLines(),
          tone: failed ? 'warn' : 'success',
        })
      }
      return
    }
    if (tasks[idx].state === 'queued') {
      setTasks((prev) => prev.map((t, i) => (i === idx ? { ...t, state: 'running' } : t)))
      return
    }
    timerRef.current = setTimeout(() => {
      setTasks((prev) =>
        prev.map((t, i) => (i === idx ? { ...t, state: t.failResult ? 'failed' : 'done' } : t))
      )
    }, 850)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, step, tasks])

  const retryTask = (id: string) => {
    popupShown.current = true /* don't re-popup after retry */
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, failResult: undefined, state: 'running' } : t))
    )
  }

  /* tender / award analysis run */
  const ANALYSIS_STEPS = [
    'Pulling offers & bids',
    'Checking Highway identity & authority',
    'Checking onboarding & monitoring tools',
    'Scoring against max buy hard limit',
  ]

  useEffect(() => {
    if (analysis !== 'running') return
    if (analysisStep >= ANALYSIS_STEPS.length) {
      setAnalysis('done')
      return
    }
    const t = setTimeout(() => setAnalysisStep((s) => s + 1), 620)
    return () => clearTimeout(t)
  }, [analysis, analysisStep, ANALYSIS_STEPS.length])

  const scored = useMemo(
    () => (analysis === 'done' ? scoreOffers(detail.bids, maxOk ? maxNum : 0) : []),
    [analysis, detail.bids, maxOk, maxNum]
  )
  const recommended = scored.find((s) => !s.overLimit)

  const running = tasks.some((t) => t.state === 'queued' || t.state === 'running')
  const failCount = tasks.filter((t) => t.state === 'failed').length
  const modeLabel = AUTO_MODE_LABEL[mode]

  return (
    <>
      <button
        type="button"
        className="dd-auto-panel-shade"
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside className="dd-auto-panel" role="dialog" aria-label={modeLabel}>
        <header className="dd-auto-panel__head">
          <div className="dd-auto-panel__title">
            <span className={cn('dd-auto-mode-badge', `is-${mode}`)}>
              {mode === 'sourcing' ? <Zap size={16} /> : mode === 'tender' ? <Gauge size={16} /> : <Award size={16} />}
            </span>
            <div>
              <strong>{modeLabel}</strong>
              <span>
                {detail.load.id} · {detail.load.origin} → {detail.load.destination} ·{' '}
                {detail.load.equipment}
              </span>
            </div>
          </div>
          <div className="dd-auto-panel__head-right">
            <span className="dd-auto-phase">Phase 1 · single order</span>
            <button type="button" className="dd-icon-btn dd-icon-btn--light" aria-label="Close" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="dd-auto-panel__cols">
          {/* ── main workflow column ── */}
          <div className="dd-auto-panel__mainc">
            {mode === 'sourcing' && (
              <div className="dd-auto-steps">
                {(
                  [
                    [1, 'Automation rule', Layers],
                    [2, 'Data & limits', Gauge],
                    [3, 'Run & results', Zap],
                  ] as const
                ).map(([n, label, StepIcon]) => (
                  <div
                    key={n}
                    className={cn(
                      'dd-auto-steps__item',
                      `is-s${n}`,
                      step === n && 'is-active',
                      step > n && 'is-done'
                    )}
                  >
                    <i>{step > n ? <Check size={12} /> : <StepIcon size={12} />}</i>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="dd-auto-panel__body">
              {/* ── SOURCING · step 1: rules ── */}
              {mode === 'sourcing' && step === 1 && (
                <>
                  <p className="dd-auto-panel__intro">
                    Choose what this run should do. Rules are reusable — create your own mix of
                    carrier reach and load boards.
                  </p>
                  <div className="dd-auto-rules">
                    {PRESET_RULES.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className={cn('dd-auto-rule', ruleId === r.id && 'is-on')}
                        onClick={() => setRuleId(r.id)}
                      >
                        <div className="dd-auto-rule__head">
                          <strong>{r.name}</strong>
                          <i className="dd-auto-action__tick">{ruleId === r.id && <Check size={12} />}</i>
                        </div>
                        <span>{r.description}</span>
                        <div className="dd-auto-rule__chips">
                          {r.channels.map((c) => (
                            <em key={c}>{CHANNEL_META[c].label}</em>
                          ))}
                        </div>
                      </button>
                    ))}

                    <button
                      type="button"
                      className={cn('dd-auto-rule dd-auto-rule--custom', ruleId === 'custom' && 'is-on')}
                      onClick={() => setRuleId('custom')}
                    >
                      <div className="dd-auto-rule__head">
                        <strong>
                          <Plus size={13} />
                          Create your own rule
                        </strong>
                        <i className="dd-auto-action__tick">{ruleId === 'custom' && <Check size={12} />}</i>
                      </div>
                      <span>Pick exactly which channels this run uses.</span>
                      {ruleId === 'custom' && (
                        <div className="dd-auto-rule__picker" role="group">
                          {(Object.keys(CHANNEL_META) as ChannelId[]).map((c) => {
                            const on = customChannels.has(c)
                            const Icon = CHANNEL_META[c].icon
                            return (
                              <span
                                key={c}
                                role="checkbox"
                                aria-checked={on}
                                tabIndex={0}
                                className={cn('dd-auto-chan', on && 'is-on')}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setCustomChannels((prev) => {
                                    const next = new Set(prev)
                                    if (next.has(c)) next.delete(c)
                                    else next.add(c)
                                    return next
                                  })
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setCustomChannels((prev) => {
                                      const next = new Set(prev)
                                      if (next.has(c)) next.delete(c)
                                      else next.add(c)
                                      return next
                                    })
                                  }
                                }}
                              >
                                <Icon size={13} />
                                {CHANNEL_META[c].label}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* ── SOURCING · step 2: data & limits ── */}
              {mode === 'sourcing' && step === 2 && (
                <>
                  <p className="dd-auto-panel__intro">
                    {missingNow > 0 ? (
                      <>
                        <strong>{missingNow}</strong> data point{missingNow === 1 ? ' is' : 's are'} missing.
                        Max buy is a <strong>hard limit</strong> — no offer or auto-accept can ever exceed it.
                      </>
                    ) : (
                      <>All required data points are present. Max buy acts as a hard limit for the whole run.</>
                    )}
                  </p>

                  <div className="dd-auto-checks dd-auto-checks--grid">
                    {checks.map((c) => (
                      <div key={c.label} className={cn('dd-auto-check', !c.ok && 'is-missing')}>
                        {c.ok ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                        <div>
                          <strong>{c.label}</strong>
                          <span>{c.note}</span>
                        </div>
                        <em>{c.ok ? 'OK' : 'Missing'}</em>
                      </div>
                    ))}
                  </div>

                  <div className="dd-auto-fields">
                    <label>
                      Max buy — hard limit ({detail.currency})
                      <input
                        value={maxBuy}
                        placeholder="0.00"
                        inputMode="decimal"
                        onChange={(e) => setMaxBuy(e.target.value.replace(/[^0-9.]/g, ''))}
                      />
                      <span>Auto Sourcing will never offer above this.</span>
                    </label>
                    <label>
                      Book now rate ({detail.currency})
                      <input
                        value={bookVal}
                        placeholder={maxOk ? suggestedBook : '0.00'}
                        inputMode="decimal"
                        onChange={(e) => {
                          setBookTouched(true)
                          setBookNow(e.target.value.replace(/[^0-9.]/g, ''))
                        }}
                      />
                      <span>Suggested: max buy − 7.5%</span>
                    </label>
                  </div>
                </>
              )}

              {/* ── SOURCING · step 3: run ── */}
              {mode === 'sourcing' && step === 3 && (
                <>
                  <p className="dd-auto-panel__intro">
                    {running ? (
                      <>
                        Running <strong>{rule.name}</strong> — stay on this screen, results pop up when done.
                      </>
                    ) : failCount > 0 ? (
                      <>
                        Finished with <strong>{failCount}</strong> failure{failCount === 1 ? '' : 's'}. Retry
                        below or continue.
                      </>
                    ) : (
                      <>All actions completed successfully.</>
                    )}
                  </p>

                  <div className="dd-auto-run">
                    {tasks.map((t) => {
                      const canExpand =
                        (t.state === 'done' || t.state === 'failed') && Boolean(t.logs?.length)
                      const isOpen = expanded.has(t.id)
                      const carrierLogs = (t.logs ?? []).filter(
                        (r): r is CarrierLog => r.kind === 'carrier'
                      )
                      const metaLogs = (t.logs ?? []).filter((r): r is MetaLog => r.kind === 'meta')
                      const theme = TASK_THEME[t.id] ?? TASK_THEME.rates
                      const ThemeIcon = theme.icon
                      const lane = `${detail.load.origin} → ${detail.load.destination}`
                      const rateStr = `$${Number(bookVal || 0).toFixed(2)}`
                      const hardStr = `$${maxNum.toFixed(2)}`
                      return (
                        <div
                          key={t.id}
                          className={cn(
                            'dd-auto-run__item',
                            `is-${theme.cls}`,
                            t.state === 'done' && 'is-done',
                            t.state === 'failed' && 'is-failed',
                            t.state === 'running' && 'is-running',
                            isOpen && 'is-open'
                          )}
                        >
                          <div
                            className={cn('dd-auto-run__row', canExpand && 'is-clickable')}
                            onClick={canExpand ? () => toggleExpand(t.id) : undefined}
                            onKeyDown={
                              canExpand
                                ? (e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault()
                                      toggleExpand(t.id)
                                    }
                                  }
                                : undefined
                            }
                            role={canExpand ? 'button' : undefined}
                            tabIndex={canExpand ? 0 : undefined}
                            aria-expanded={canExpand ? isOpen : undefined}
                          >
                            <span className={cn('dd-auto-tile', `is-${theme.cls}`)}>
                              <ThemeIcon size={15} />
                            </span>
                            <div>
                              <strong>{t.label}</strong>
                              <span>
                                {t.state === 'queued' && 'Queued'}
                                {t.state === 'running' && 'Running…'}
                                {t.state === 'done' && t.result}
                                {t.state === 'failed' && (t.failResult ?? 'Failed')}
                              </span>
                            </div>
                            <i className="dd-auto-state">
                              {t.state === 'done' && <CheckCircle2 size={15} />}
                              {t.state === 'failed' && <AlertTriangle size={15} />}
                              {t.state === 'running' && <Loader2 size={15} className="dd-auto-spin" />}
                              {t.state === 'queued' && <span className="dd-auto-run__dot" />}
                            </i>
                            {t.state === 'failed' && (
                              <button
                                type="button"
                                className="dd-auto-retry"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  retryTask(t.id)
                                }}
                              >
                                <RotateCcw size={12} />
                                Retry
                              </button>
                            )}
                            {canExpand && (
                              <span className="dd-auto-chev" aria-hidden>
                                <ChevronDown size={16} className={cn(isOpen && 'is-rot')} />
                              </span>
                            )}
                          </div>
                          {canExpand && isOpen && (
                            <div className={cn('dd-auto-log', `is-${theme.cls}`)}>
                              <div className="dd-auto-log__head">{t.logTitle}</div>
                              {t.id === 'blast_email' && (
                                <EmailLogView
                                  rows={carrierLogs}
                                  subject={`Load ${detail.load.id} · ${lane} · ${detail.load.equipment}`}
                                  preview={`Book now ${rateStr} all-in · ${detail.load.miles.toLocaleString()} mi · reply to lock it in`}
                                />
                              )}
                              {t.id === 'blast_whatsapp' && (
                                <WhatsAppLogView
                                  rows={carrierLogs}
                                  message={`Load ${detail.load.id}: ${lane}, ${detail.load.equipment}, ${detail.load.miles.toLocaleString()} mi. Book now ${rateStr}. Reply YES to grab it.`}
                                />
                              )}
                              {t.id === 'highway' && <HighwayLogView rows={carrierLogs} />}
                              {(t.id === 'post_dat' || t.id === 'post_loadlink') && (
                                <BoardTicketView
                                  board={t.id === 'post_dat' ? 'DAT Load Board' : 'Loadlink'}
                                  postingId={t.id === 'post_dat' ? 'DAT-MOCK-88421' : 'LL-MOCK-22014'}
                                  lane={lane}
                                  equipment={detail.load.equipment}
                                  miles={detail.load.miles}
                                  rate={rateStr}
                                  hardLimit={hardStr}
                                  extras={metaLogs.filter(
                                    (m) => !['Board', 'Lane', 'Rate posted'].includes(m.name)
                                  )}
                                />
                              )}
                              {t.id === 'rates' && <RateTilesView rows={metaLogs} />}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* ── TENDER / AWARD ── */}
              {mode !== 'sourcing' && (
                <>
                  <p className="dd-auto-panel__intro">
                    {modeLabel} analyzes every offer on this order — rate vs your hard limit, carrier
                    rating, Highway data, onboarding and monitoring — and suggests which one to accept.
                  </p>

                  {analysis === 'idle' && (
                    <div className="dd-auto-analyze">
                      <label className="dd-auto-analyze__limit">
                        Max buy — hard limit ({detail.currency})
                        <input
                          value={maxBuy}
                          placeholder="0.00"
                          inputMode="decimal"
                          onChange={(e) => setMaxBuy(e.target.value.replace(/[^0-9.]/g, ''))}
                        />
                        <span>Offers above this are excluded automatically.</span>
                      </label>
                      <button
                        type="button"
                        className="dd-btn dd-btn--primary"
                        disabled={!maxOk}
                        onClick={() => {
                          onApplyRates({ maxBuy: `$${maxNum.toFixed(2)}` })
                          setAnalysisStep(0)
                          setAnalysis('running')
                        }}
                      >
                        <Sparkles size={14} />
                        Analyze {detail.bids.length} offers
                      </button>
                    </div>
                  )}

                  {analysis === 'running' && (
                    <div className="dd-auto-run">
                      {ANALYSIS_STEPS.map((label, i) => (
                        <div
                          key={label}
                          className={cn(
                            'dd-auto-run__item',
                            i < analysisStep && 'is-done',
                            i === analysisStep && 'is-running'
                          )}
                        >
                          <div className="dd-auto-run__row">
                            <i className="dd-auto-state">
                              {i < analysisStep && <CheckCircle2 size={15} />}
                              {i === analysisStep && <Loader2 size={15} className="dd-auto-spin" />}
                              {i > analysisStep && <span className="dd-auto-run__dot" />}
                            </i>
                            <div>
                              <strong>{label}</strong>
                              <span>{i < analysisStep ? 'Done' : i === analysisStep ? 'Running…' : 'Queued'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {analysis === 'done' && (
                    <div className="dd-auto-offers">
                      {scored.map((s, rank) => {
                        const isRec = recommended === s
                        return (
                          <article
                            key={s.bid.id}
                            className={cn(
                              'dd-auto-offer',
                              isRec && 'is-recommended',
                              s.overLimit && 'is-excluded'
                            )}
                          >
                            {isRec && (
                              <div className="dd-auto-offer__banner">
                                <BadgeCheck size={13} />
                                Suggested — accept this offer
                              </div>
                            )}
                            <div className="dd-auto-offer__row">
                              <div className="dd-auto-offer__who">
                                <strong>{s.bid.carrier}</strong>
                                <span>
                                  MC {s.bid.mc} · {s.bid.source ?? '—'} · {s.bid.loads ?? 0} loads with us
                                </span>
                              </div>
                              <div className="dd-auto-offer__rate">
                                <strong>{s.bid.allIn ?? s.bid.amount}</strong>
                                <span>{s.bid.rpm ?? s.bid.amount} / mi</span>
                              </div>
                              <div className={cn('dd-auto-offer__score', s.overLimit && 'is-zero')}>
                                {s.overLimit ? (
                                  <span>Excluded</span>
                                ) : (
                                  <>
                                    <strong>{s.score}</strong>
                                    <span>score</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="dd-auto-offer__facts">
                              <em className={cn(!s.overLimit && 'is-good')}>
                                <Star size={11} />
                                {s.intel.rating.toFixed(1)} rating
                              </em>
                              <em className={cn(s.intel.highwayVerified ? 'is-good' : 'is-bad')}>
                                <ShieldCheck size={11} />
                                {s.intel.highwayVerified ? 'Highway verified' : 'Not Highway verified'}
                              </em>
                              <em className={cn(s.intel.onboarding === 'Complete' ? 'is-good' : 'is-warn')}>
                                <Layers size={11} />
                                Onboarding {s.intel.onboarding.toLowerCase()}
                              </em>
                              <em className={cn(s.intel.monitoringAlerts === 0 ? 'is-good' : 'is-bad')}>
                                <Gauge size={11} />
                                {s.intel.monitoringAlerts === 0
                                  ? 'Monitoring clear'
                                  : `${s.intel.monitoringAlerts} monitoring alert`}
                              </em>
                              {s.overLimit && (
                                <em className="is-bad">
                                  <AlertTriangle size={11} />
                                  Over ${maxNum.toLocaleString()} hard limit
                                </em>
                              )}
                            </div>
                            <div className="dd-auto-offer__why">{s.reasons.join(' · ')}</div>
                            {rank === 0 && !s.overLimit && (
                              <button
                                type="button"
                                className="dd-btn dd-btn--primary dd-auto-offer__accept"
                                onClick={() =>
                                  setPopup({
                                    title: `${modeLabel}: offer accepted (mock)`,
                                    lines: [
                                      `${s.bid.carrier} — ${s.bid.allIn ?? s.bid.amount} all-in`,
                                      ...s.reasons,
                                      'No live tender was sent · mock only',
                                    ],
                                  })
                                }
                              >
                                <Check size={14} />
                                Accept suggestion
                              </button>
                            )}
                          </article>
                        )
                      })}
                      {!recommended && (
                        <div className="dd-auto-offers__none">
                          <AlertTriangle size={15} />
                          No offer clears the hard limit — raise the max buy or keep sourcing.
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <footer className="dd-auto-panel__foot">
              {mode === 'sourcing' && step === 1 && (
                <>
                  <button type="button" className="dd-btn" onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="dd-btn dd-btn--primary"
                    disabled={rule.channels.length === 0}
                    onClick={() => setStep(2)}
                  >
                    Continue
                    <ChevronRight size={14} />
                  </button>
                </>
              )}
              {mode === 'sourcing' && step === 2 && (
                <>
                  <button type="button" className="dd-btn" onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button type="button" className="dd-btn dd-btn--primary" disabled={!dataReady} onClick={startRun}>
                    <Zap size={14} />
                    Run {rule.name}
                  </button>
                </>
              )}
              {mode === 'sourcing' && step === 3 && (
                <>
                  <button type="button" className="dd-btn" disabled={running} onClick={onGoFindPost}>
                    Open Find &amp; Post
                  </button>
                  <button
                    type="button"
                    className="dd-btn dd-btn--primary"
                    disabled={running}
                    onClick={finishSourcing}
                  >
                    <Check size={14} />
                    Done · mark sourcing complete
                  </button>
                </>
              )}
              {mode !== 'sourcing' && (
                <>
                  <button type="button" className="dd-btn" onClick={onClose}>
                    Close
                  </button>
                  {analysis === 'done' && (
                    <button
                      type="button"
                      className="dd-btn"
                      onClick={() => {
                        setAnalysis('idle')
                        setAnalysisStep(0)
                      }}
                    >
                      <RotateCcw size={13} />
                      Re-run analysis
                    </button>
                  )}
                </>
              )}
            </footer>
          </div>

          {/* ── context rail ── */}
          <aside className="dd-auto-ctx">
            <section>
              <h4>Order</h4>
              <dl>
                <div>
                  <dt>Probill</dt>
                  <dd>{detail.load.id}</dd>
                </div>
                <div>
                  <dt>Lane</dt>
                  <dd>
                    {detail.load.origin} → {detail.load.destination}
                  </dd>
                </div>
                <div>
                  <dt>Equipment</dt>
                  <dd>{detail.load.equipment}</dd>
                </div>
                <div>
                  <dt>Miles</dt>
                  <dd>{detail.load.miles.toLocaleString()} mi</dd>
                </div>
                <div>
                  <dt>Customer rate</dt>
                  <dd>
                    ${detail.load.fee.toFixed(2)} {detail.currency}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="dd-auto-ctx__limit">
              <h4>Hard limit</h4>
              <strong>{maxOk ? `$${maxNum.toFixed(2)} ${detail.currency}` : 'Not set'}</strong>
              <p>Max buy is enforced on every blast, post and suggestion in this run.</p>
            </section>

            {mode === 'sourcing' && (
              <section>
                <h4>This run</h4>
                <div className="dd-auto-ctx__chips">
                  {rule.channels.map((c) => (
                    <em key={c}>{CHANNEL_META[c].label}</em>
                  ))}
                  {rule.channels.length === 0 && <p>No channels selected yet.</p>}
                </div>
              </section>
            )}

            {mode !== 'sourcing' && (
              <section>
                <h4>Signals used</h4>
                <div className="dd-auto-ctx__chips">
                  <em>Rate vs hard limit</em>
                  <em>Carrier rating</em>
                  <em>Highway identity</em>
                  <em>Onboarding status</em>
                  <em>Monitoring alerts</em>
                </div>
              </section>
            )}

            <section className="dd-auto-ctx__scope">
              <h4>Scope</h4>
              <p>Runs on this order only.</p>
              <button type="button" disabled>
                Run on multiple orders — Phase 2
              </button>
            </section>
          </aside>
        </div>
      </aside>

      {popup && (
        <ResultPopup
          title={popup.title}
          lines={popup.lines}
          tone={popup.tone}
          primaryLabel={mode === 'sourcing' ? 'Continue to Auto Tender' : 'Done'}
          onPrimary={() => {
            setPopup(null)
            if (mode === 'sourcing') finishSourcing()
            else onClose()
          }}
          onClose={() => setPopup(null)}
        />
      )}
    </>
  )
}
