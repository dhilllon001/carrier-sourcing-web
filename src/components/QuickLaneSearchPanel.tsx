import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeftRight,
  Calendar,
  CheckCircle2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Route,
  Search,
  Settings2,
  Star,
  Trash2,
  Truck,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'

export type LaneCarrier = {
  id: string
  name: string
  mc?: string
  dot?: string
  source: 'Network' | 'Past' | 'DAT' | 'Truckstop' | 'Highway' | 'New'
  lastUsed: string
  lastUsedRel: string
  dhP: number
  dhD: number
  lastRate: string
  loads: number
  legs: number
  phone?: string
  email?: string
  contact?: string
  equipment?: string
  lastContacted?: string
  lastContactChannel?: string
  contactedRecently?: boolean
}

type FavouriteLane = {
  id: string
  origin: string
  destination: string
  trailer: string
  tag?: string
  powerOnly?: boolean
}

type MarketCard = {
  id: 'dat' | 'truckstop' | 'loadlink'
  source: string
  badge: string
  badgeTone: 'broker' | 'market' | 'thin'
  total?: string
  rpm?: string
  low?: string
  high?: string
  markerPct?: number
  fillStart?: number
  fillEnd?: number
  meta: string
  empty?: boolean
  emptySub?: string
  trend?: number[]
  historic?: string
}

const LANE_CARRIERS: LaneCarrier[] = [
  {
    id: 'lc1',
    name: 'UACL LOGISTICS LLC',
    mc: '884120',
    dot: '2551021',
    source: 'Past',
    lastUsed: '27 May, 14:59',
    lastUsedRel: '10d ago',
    dhP: 18,
    dhD: 42,
    lastRate: '$1,355',
    loads: 279,
    legs: 14,
    contact: 'Dispatch',
    phone: '+1 (416) 555-0142',
    email: 'dispatch@uacl.example',
    equipment: 'DRY-VAN',
    lastContacted: '08 Aug, 09:12',
    lastContactChannel: 'Phone',
    contactedRecently: true,
  },
  {
    id: 'lc2',
    name: 'KULDIP TRANSPORT INC',
    mc: '712904',
    dot: '1984412',
    source: 'DAT',
    lastUsed: '12 Jun, 09:12',
    lastUsedRel: '8d ago',
    dhP: 12,
    dhD: 8,
    lastRate: '$1,420',
    loads: 64,
    legs: 6,
    contact: 'Ops desk',
    phone: '+1 (905) 555-0198',
    email: 'ops@kuldip.example',
    equipment: 'DRY-VAN',
    lastContacted: '02 Aug, 15:40',
    lastContactChannel: 'Email',
    contactedRecently: false,
  },
  {
    id: 'lc3',
    name: 'MIDWEST POWER HAUL INC',
    mc: '551002',
    source: 'Network',
    lastUsed: '01 Jul, 16:40',
    lastUsedRel: '4d ago',
    dhP: 34,
    dhD: 18,
    lastRate: '$1,510',
    loads: 12,
    legs: 2,
    contact: 'Rates',
    phone: '+1 (312) 555-0110',
    email: 'rates@midwestpower.example',
    equipment: 'POWER ONLY',
    lastContacted: '10 Aug, 11:05',
    lastContactChannel: 'SMS',
    contactedRecently: true,
  },
  {
    id: 'lc4',
    name: 'ONTARIO EXPRESS CARRIERS',
    mc: '339811',
    source: 'Past',
    lastUsed: '08 Jul, 11:05',
    lastUsedRel: '9d ago',
    dhP: 6,
    dhD: 9,
    lastRate: '$1,380',
    loads: 41,
    legs: 5,
    contact: 'Desk',
    phone: '+1 (647) 555-0177',
    email: 'desk@ontarioexpress.example',
    equipment: 'REEFER',
    lastContacted: '28 Jul, 13:22',
    lastContactChannel: 'Phone',
    contactedRecently: false,
  },
  {
    id: 'lc5',
    name: 'PEAK FLATBED SOLUTIONS',
    mc: '229441',
    source: 'Truckstop',
    lastUsed: '—',
    lastUsedRel: 'Never',
    dhP: 55,
    dhD: 40,
    lastRate: '$1,600',
    loads: 0,
    legs: 0,
    contact: 'New desk',
    phone: '+1 (214) 555-0133',
    email: 'new@peakflatbed.example',
    equipment: 'FLATBED',
    lastContacted: '—',
    lastContactChannel: undefined,
    contactedRecently: false,
  },
  {
    id: 'lc6',
    name: 'GREAT LAKES FREIGHT CO',
    mc: '441902',
    source: 'Highway',
    lastUsed: '03 Jul, 08:20',
    lastUsedRel: '14d ago',
    dhP: 22,
    dhD: 15,
    lastRate: '$1,410',
    loads: 28,
    legs: 3,
    contact: 'Samir K.',
    phone: '+1 (519) 555-0188',
    email: 'lanes@greatlakes.example',
    equipment: 'DRY-VAN',
    lastContacted: '09 Aug, 16:50',
    lastContactChannel: 'Email',
    contactedRecently: true,
  },
  {
    id: 'lc7',
    name: 'ATLAS VAN LINES PARTNER',
    mc: '118204',
    source: 'Network',
    lastUsed: '15 Jun, 13:44',
    lastUsedRel: '12d ago',
    dhP: 9,
    dhD: 21,
    lastRate: '$1,480',
    loads: 93,
    legs: 11,
    contact: 'Alex R.',
    phone: '+1 (289) 555-0120',
    email: 'cover@atlas.example',
    equipment: 'STEP DECK',
    lastContacted: '01 Aug, 08:18',
    lastContactChannel: 'Phone',
    contactedRecently: false,
  },
  {
    id: 'lc8',
    name: 'RED RIVER HAULING LLC',
    mc: '667301',
    source: 'New',
    lastUsed: '—',
    lastUsedRel: 'Never',
    dhP: 71,
    dhD: 33,
    lastRate: '—',
    loads: 0,
    legs: 0,
    contact: 'Intake',
    phone: '+1 (204) 555-0166',
    email: 'intake@redriver.example',
    // no equipment — included when any equip selected
    lastContacted: '—',
    contactedRecently: false,
  },
  {
    id: 'lc9',
    name: 'SOUTHLAND EXPRESS LLC',
    mc: '902114',
    source: 'DAT',
    lastUsed: '22 Jul, 10:11',
    lastUsedRel: '6d ago',
    dhP: 14,
    dhD: 27,
    lastRate: '$1,390',
    loads: 37,
    legs: 4,
    contact: 'Maya P.',
    phone: '+1 (210) 555-0190',
    email: 'desk@southland.example',
    equipment: 'REEFER',
    lastContacted: '11 Aug, 07:44',
    lastContactChannel: 'SMS',
    contactedRecently: true,
  },
  {
    id: 'lc10',
    name: 'BORDERLINE POWER INC',
    mc: '554018',
    source: 'Truckstop',
    lastUsed: '19 Jul, 17:02',
    lastUsedRel: '7d ago',
    dhP: 3,
    dhD: 11,
    lastRate: '$1,455',
    loads: 19,
    legs: 2,
    contact: 'Luis M.',
    phone: '+1 (956) 555-0144',
    email: 'power@borderline.example',
    equipment: 'POWER ONLY',
    lastContacted: '05 Aug, 12:30',
    lastContactChannel: 'Phone',
    contactedRecently: false,
  },
  {
    id: 'lc11',
    name: 'PRAIRIE STAR CARRIERS',
    mc: '331900',
    source: 'Past',
    lastUsed: '05 Jul, 09:40',
    lastUsedRel: '15d ago',
    dhP: 28,
    dhD: 16,
    lastRate: '$1,365',
    loads: 52,
    legs: 7,
    contact: 'Nina S.',
    phone: '+1 (701) 555-0112',
    email: 'ops@prairiestar.example',
    equipment: 'FLATBED',
    lastContacted: '30 Jul, 10:05',
    lastContactChannel: 'Email',
    contactedRecently: false,
  },
  {
    id: 'lc12',
    name: 'TEXAS CROSSHAUL LLC',
    mc: '778201',
    source: 'Network',
    lastUsed: '28 Jul, 12:18',
    lastUsedRel: '3d ago',
    dhP: 8,
    dhD: 5,
    lastRate: '$1,430',
    loads: 88,
    legs: 9,
    contact: 'Jordan B.',
    phone: '+1 (214) 555-0177',
    email: 'lanes@texascross.example',
    equipment: 'DRY-VAN',
    lastContacted: '10 Aug, 18:02',
    lastContactChannel: 'Phone',
    contactedRecently: true,
  },
]

const DEFAULT_FAVOURITES: FavouriteLane[] = [
  {
    id: 'fav1',
    origin: 'Laredo, TX',
    destination: 'Dallas, TX',
    trailer: 'DRY-VAN',
    tag: 'P0',
    powerOnly: true,
  },
  {
    id: 'fav2',
    origin: 'Brampton, ON',
    destination: 'Chicago, IL',
    trailer: 'DRY-VAN',
    tag: 'Hot',
  },
  {
    id: 'fav3',
    origin: 'Toronto, ON',
    destination: 'Detroit, MI',
    trailer: 'REEFER',
  },
]

const TRAILERS = ['DRY-VAN', 'REEFER', 'FLATBED', 'STEP DECK', 'POWER ONLY'] as const

type FavForm = {
  origin: string
  destination: string
  trailer: (typeof TRAILERS)[number] | ''
  tag: string
  powerOnly: boolean
}

const EMPTY_FAV_FORM: FavForm = {
  origin: '',
  destination: '',
  trailer: 'DRY-VAN',
  tag: '',
  powerOnly: false,
}

function shortLane(city: string) {
  const part = city.split(',')[0]?.trim() ?? city
  if (part.length <= 10) return part.toUpperCase()
  return part.slice(0, 3).toUpperCase()
}

function RateSourceMark({ id }: { id: MarketCard['id'] }) {
  if (id === 'dat') {
    return (
      <span className="qls-brand qls-brand--dat" aria-hidden>
        <svg viewBox="0 0 32 16" width="32" height="16">
          <rect width="32" height="16" rx="3" fill="#0062BE" />
          <text
            x="16"
            y="11.5"
            textAnchor="middle"
            fill="#fff"
            fontSize="8.5"
            fontWeight="700"
            fontFamily="Inter, system-ui, sans-serif"
            letterSpacing="0.4"
          >
            DAT
          </text>
        </svg>
      </span>
    )
  }
  if (id === 'truckstop') {
    return (
      <span className="qls-brand qls-brand--truckstop" aria-hidden>
        <svg viewBox="0 0 18 18" width="18" height="18">
          <rect width="18" height="18" rx="4" fill="#F36C00" />
          <text
            x="9"
            y="12.2"
            textAnchor="middle"
            fill="#fff"
            fontSize="8"
            fontWeight="700"
            fontFamily="Inter, system-ui, sans-serif"
          >
            TS
          </text>
        </svg>
      </span>
    )
  }
  return (
    <span className="qls-brand qls-brand--loadlink" aria-hidden>
      <svg viewBox="0 0 18 18" width="18" height="18">
        <rect width="18" height="18" rx="4" fill="#C8102E" />
        <text
          x="9"
          y="12.2"
          textAnchor="middle"
          fill="#fff"
          fontSize="8"
          fontWeight="700"
          fontFamily="Inter, system-ui, sans-serif"
        >
          LL
        </text>
      </svg>
    </span>
  )
}

function sparklinePoints(values: number[], width = 72, height = 22, pad = 2) {
  if (values.length === 0) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  return values
    .map((v, i) => {
      const x = pad + (i / Math.max(values.length - 1, 1)) * (width - pad * 2)
      const y = height - pad - ((v - min) / span) * (height - pad * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function RateSparkline({ values }: { values: number[] }) {
  const points = sparklinePoints(values)
  if (!points) return null
  const rising = values[values.length - 1]! >= values[0]!
  return (
    <svg
      className={cn('qls-spark', rising ? 'is-up' : 'is-down')}
      viewBox="0 0 72 22"
      width="72"
      height="22"
      aria-hidden
    >
      <polyline fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" points={points} />
    </svg>
  )
}

function buildMarketCards(miles: number, powerOnly: boolean): MarketCard[] {
  const mid = powerOnly ? 1412 : 1280
  const rpm = (mid / Math.max(miles, 1)).toFixed(2)
  return [
    {
      id: 'dat',
      source: 'DAT',
      badge: 'Broker rate',
      badgeTone: 'broker',
      total: mid.toLocaleString('en-US'),
      rpm: `$${rpm} / mi · USD`,
      low: '1,180',
      high: '1,690',
      markerPct: 52,
      fillStart: 22,
      fillEnd: 78,
      meta: '142 reports · 15-day average · updated 11:04',
      trend: [1180, 1210, 1195, 1240, 1265, 1290, mid],
      historic: 'Our hist $1,380',
    },
    {
      id: 'truckstop',
      source: 'Truckstop',
      badge: 'Market',
      badgeTone: 'market',
      total: (mid + 43).toLocaleString('en-US'),
      rpm: `$${((mid + 43) / Math.max(miles, 1)).toFixed(2)} / mi · USD`,
      low: '1,225',
      high: '1,740',
      markerPct: 55,
      fillStart: 24,
      fillEnd: 80,
      meta: '88 reports · 7-day average · updated 10:58',
      trend: [1240, 1260, 1285, 1270, 1305, 1320, mid + 43],
      historic: 'Our hist $1,410',
    },
    {
      id: 'loadlink',
      source: 'Loadlink',
      badge: 'Thin',
      badgeTone: 'thin',
      empty: true,
      emptySub: 'Canada-weighted index',
      meta: 'Under 10 reports on this lane',
    },
  ]
}

type Props = {
  open: boolean
  onClose: () => void
}

export function QuickLaneSearchPanel({ open, onClose }: Props) {
  const [origin, setOrigin] = useState('Laredo, TX')
  const [destination, setDestination] = useState('Dallas, TX')
  const [equipment, setEquipment] = useState<string[]>(['DRY-VAN'])
  const [radius, setRadius] = useState('50')
  const [available, setAvailable] = useState('2026-08-11')
  const [originZip, setOriginZip] = useState('')
  const [destZip, setDestZip] = useState('')
  const [powerOnly, setPowerOnly] = useState(true)
  const [ctpatOnly, setCtpatOnly] = useState(false)
  const [excludeContacted, setExcludeContacted] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'loading' | 'results'>('idle')
  const [carrierQ, setCarrierQ] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [favourites, setFavourites] = useState<FavouriteLane[]>(DEFAULT_FAVOURITES)
  const [manageOpen, setManageOpen] = useState(false)
  const [manageMode, setManageMode] = useState<'list' | 'add' | 'edit'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [favForm, setFavForm] = useState<FavForm>(EMPTY_FAV_FORM)
  const [miles] = useState(431)

  const primaryEquip = equipment[0] ?? ''

  const toggleEquip = (t: string) => {
    setEquipment((prev) => {
      if (prev.includes(t)) {
        if (prev.length === 1) return prev
        return prev.filter((x) => x !== t)
      }
      return [...prev, t]
    })
  }

  const closeManage = () => {
    setManageOpen(false)
    setManageMode('list')
    setEditingId(null)
    setFavForm(EMPTY_FAV_FORM)
  }

  const openManage = () => {
    setManageMode('list')
    setEditingId(null)
    setFavForm(EMPTY_FAV_FORM)
    setManageOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (manageOpen) {
          if (manageMode !== 'list') {
            setManageMode('list')
            setEditingId(null)
            setFavForm(EMPTY_FAV_FORM)
          } else {
            closeManage()
          }
        } else onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, manageOpen, manageMode])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const activeFavId = useMemo(() => {
    return (
      favourites.find(
        (f) =>
          f.origin.toLowerCase() === origin.trim().toLowerCase() &&
          f.destination.toLowerCase() === destination.trim().toLowerCase() &&
          equipment.length === 1 &&
          equipment[0] === f.trailer
      )?.id ?? null
    )
  }, [favourites, origin, destination, equipment])

  const results = useMemo(() => {
    if (phase !== 'results') return []
    let rows = [...LANE_CARRIERS]
    const radiusMi = Number(radius || 50)
    rows = rows.filter((r) => r.dhP <= radiusMi)
    rows = rows.filter((r) => !r.equipment || equipment.includes(r.equipment))
    if (powerOnly) rows = rows.filter((r) => r.source !== 'New')
    if (ctpatOnly) rows = rows.filter((r) => r.source === 'Network' || r.source === 'Past')
    if (excludeContacted) rows = rows.filter((r) => !r.contactedRecently)
    const q = carrierQ.trim().toLowerCase()
    if (q) {
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.mc ?? '').includes(q) ||
          (r.dot ?? '').includes(q) ||
          (r.contact ?? '').toLowerCase().includes(q)
      )
    }
    return rows
  }, [phase, powerOnly, ctpatOnly, equipment, radius, excludeContacted, carrierQ])

  const marketCards = useMemo(
    () => buildMarketCards(miles, powerOnly),
    [miles, powerOnly]
  )

  const swap = () => {
    setOrigin(destination)
    setDestination(origin)
    setOriginZip(destZip)
    setDestZip(originZip)
  }

  const reset = () => {
    setPhase('idle')
    setOrigin('Laredo, TX')
    setDestination('Dallas, TX')
    setEquipment(['DRY-VAN'])
    setRadius('50')
    setAvailable('2026-08-11')
    setOriginZip('')
    setDestZip('')
    setPowerOnly(false)
    setCtpatOnly(false)
    setExcludeContacted(false)
    setCarrierQ('')
    setSelected(new Set())
  }

  const search = () => {
    if (!origin.trim() || !destination.trim() || equipment.length === 0) return
    setPhase('loading')
    setSelected(new Set())
    window.setTimeout(() => setPhase('results'), 550)
  }

  const applyFavourite = (fav: FavouriteLane) => {
    setOrigin(fav.origin)
    setDestination(fav.destination)
    setEquipment([fav.trailer])
    setPowerOnly(Boolean(fav.powerOnly))
    setPhase('loading')
    window.setTimeout(() => setPhase('results'), 450)
  }

  const toggleFavouriteCurrent = () => {
    if (!origin.trim() || !destination.trim() || !primaryEquip) return
    if (activeFavId) {
      setFavourites((prev) => prev.filter((f) => f.id !== activeFavId))
      return
    }
    setFavourites((prev) => [
      {
        id: `fav-${Date.now()}`,
        origin: origin.trim(),
        destination: destination.trim(),
        trailer: primaryEquip,
        powerOnly,
        tag: powerOnly ? 'P0' : undefined,
      },
      ...prev,
    ])
  }

  const removeFavourite = (id: string) => {
    setFavourites((prev) => prev.filter((f) => f.id !== id))
    if (editingId === id) {
      setManageMode('list')
      setEditingId(null)
      setFavForm(EMPTY_FAV_FORM)
    }
  }

  const startAddFavourite = () => {
    setManageMode('add')
    setEditingId(null)
    setFavForm({
      origin: origin.trim() || '',
      destination: destination.trim() || '',
      trailer: (TRAILERS.includes(primaryEquip as (typeof TRAILERS)[number])
        ? primaryEquip
        : 'DRY-VAN') as (typeof TRAILERS)[number],
      tag: '',
      powerOnly,
    })
  }

  const startEditFavourite = (fav: FavouriteLane) => {
    setManageMode('edit')
    setEditingId(fav.id)
    setFavForm({
      origin: fav.origin,
      destination: fav.destination,
      trailer: (TRAILERS.includes(fav.trailer as (typeof TRAILERS)[number])
        ? fav.trailer
        : 'DRY-VAN') as (typeof TRAILERS)[number],
      tag: fav.tag || '',
      powerOnly: Boolean(fav.powerOnly),
    })
  }

  const saveFavouriteForm = () => {
    const o = favForm.origin.trim()
    const d = favForm.destination.trim()
    if (!o || !d || !favForm.trailer) return

    const next: FavouriteLane = {
      id: manageMode === 'edit' && editingId ? editingId : `fav-${Date.now()}`,
      origin: o,
      destination: d,
      trailer: favForm.trailer,
      tag: favForm.tag.trim() || undefined,
      powerOnly: favForm.powerOnly,
    }

    setFavourites((prev) => {
      if (manageMode === 'edit' && editingId) {
        return prev.map((f) => (f.id === editingId ? next : f))
      }
      const exists = prev.some(
        (f) =>
          f.origin.toLowerCase() === o.toLowerCase() &&
          f.destination.toLowerCase() === d.toLowerCase() &&
          f.trailer === favForm.trailer
      )
      if (exists) {
        return prev.map((f) =>
          f.origin.toLowerCase() === o.toLowerCase() &&
          f.destination.toLowerCase() === d.toLowerCase() &&
          f.trailer === favForm.trailer
            ? { ...next, id: f.id }
            : f
        )
      }
      return [next, ...prev]
    })

    setManageMode('list')
    setEditingId(null)
    setFavForm(EMPTY_FAV_FORM)
  }

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === results.length) setSelected(new Set())
    else setSelected(new Set(results.map((r) => r.id)))
  }

  if (!open) return null

  return (
    <div className="qls" role="dialog" aria-modal="true" aria-label="Quick lane search">
      <button type="button" className="qls__backdrop" aria-label="Close panel" onClick={onClose} />
      <aside className="qls__panel">
        <div className="qls__top">
          <header className="qls__head">
            <div className="qls__brand">
              <strong>Quick lane search</strong>
              <em>Rates, availability, and carriers for a lane</em>
            </div>
            <div className="qls__head-actions">
              <button type="button" className="qls__icon-btn" aria-label="Refresh" onClick={reset}>
                <RefreshCw size={14} />
              </button>
              <button type="button" className="qls__icon-btn" aria-label="Close" onClick={onClose}>
                <X size={15} />
              </button>
            </div>
          </header>

          <div className="qls__favs">
            <span className="qls__favs-label">Favourites</span>
            <div className="qls__favs-row">
              {favourites.length === 0 && (
                <span className="qls__favs-empty">No saved lanes yet</span>
              )}
              {favourites.map((fav) => (
                <button
                  key={fav.id}
                  type="button"
                  className={cn('qls__fav-pill', activeFavId === fav.id && 'is-active')}
                  onClick={() => applyFavourite(fav)}
                  title={`${fav.origin} → ${fav.destination}`}
                >
                  <Star size={11} fill="currentColor" />
                  <span>
                    {shortLane(fav.origin)} → {shortLane(fav.destination)}
                    {fav.powerOnly ? ' · power' : ''}
                  </span>
                  <em>{fav.trailer}</em>
                  {fav.tag && <i>{fav.tag}</i>}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={cn('qls__save', activeFavId && 'is-saved')}
              onClick={toggleFavouriteCurrent}
              disabled={!origin.trim() || !destination.trim() || equipment.length === 0}
              title={activeFavId ? 'Remove from favourites' : 'Save current lane'}
            >
              <Star size={12} fill={activeFavId ? 'currentColor' : 'none'} />
              {activeFavId ? 'Saved' : 'Save'}
            </button>
            <button type="button" className="qls__manage" onClick={openManage}>
              <Settings2 size={13} />
              Manage
            </button>
          </div>

          <div className="qls__form">
          <div className="qls__grid qls__grid--lane">
            <label className="qls__field">
              <span className="qls__label">Origin</span>
              <div className="qls__control">
                <MapPin size={14} className="is-origin" />
                <input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="City, state or ZIP"
                />
              </div>
            </label>

            <button type="button" className="qls__swap" aria-label="Swap origin and destination" onClick={swap}>
              <ArrowLeftRight size={14} />
            </button>

            <label className="qls__field">
              <span className="qls__label">Destination</span>
              <div className="qls__control">
                <MapPin size={14} className="is-dest" />
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="City, state or ZIP"
                />
              </div>
            </label>

            <div className="qls__field qls__field--equip">
              <span className="qls__label">Equipment</span>
              <div
                className={cn('qls__equip-chips', equipment.length === 0 && 'is-invalid')}
                role="group"
                aria-label="Equipment"
              >
                <Truck size={14} className="qls__equip-ico" aria-hidden />
                {TRAILERS.map((t) => {
                  const on = equipment.includes(t)
                  return (
                    <button
                      key={t}
                      type="button"
                      className={cn('qls__equip-chip', on && 'is-on')}
                      aria-pressed={on}
                      onClick={() => toggleEquip(t)}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            <button type="button" className="qls__search-btn" onClick={search}>
              <Search size={15} />
              Search lane
            </button>
          </div>

          <div className="qls__grid qls__grid--meta">
            <label className="qls__field">
              <span className="qls__label">Radius</span>
              <div className="qls__control qls__control--suffix">
                <input value={radius} onChange={(e) => setRadius(e.target.value)} />
                <em>mi</em>
              </div>
            </label>

            <label className="qls__field">
              <span className="qls__label">Available date</span>
              <div className="qls__control">
                <Calendar size={14} />
                <input type="date" value={available} onChange={(e) => setAvailable(e.target.value)} />
              </div>
            </label>

            <label className="qls__field">
              <span className="qls__label">Origin ZIP</span>
              <div className="qls__control">
                <input
                  value={originZip}
                  onChange={(e) => setOriginZip(e.target.value)}
                  placeholder="ZIP"
                />
              </div>
            </label>

            <label className="qls__field">
              <span className="qls__label">Dest ZIP</span>
              <div className="qls__control">
                <input
                  value={destZip}
                  onChange={(e) => setDestZip(e.target.value)}
                  placeholder="ZIP"
                />
              </div>
            </label>

            <label className="qls__check">
              <input
                type="checkbox"
                checked={powerOnly}
                onChange={(e) => setPowerOnly(e.target.checked)}
              />
              <span>Power only</span>
            </label>

            <label className="qls__check">
              <input
                type="checkbox"
                checked={ctpatOnly}
                onChange={(e) => setCtpatOnly(e.target.checked)}
              />
              <span>CTPAT only</span>
            </label>

            <button type="button" className="qls__reset" onClick={reset}>
              Reset
            </button>
          </div>
          </div>
        </div>

        <div className="qls__body">
          {phase === 'idle' && (
            <div className="qls__empty">
              <div className="qls__empty-ico" aria-hidden>
                <Route size={22} />
              </div>
              <strong>Search a lane for carriers and market rates</strong>
              <p>Pick a favourite, or enter origin and destination, then search.</p>
            </div>
          )}

          {phase === 'loading' && (
            <div className="qls__loading" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="qls__skeleton-row">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              ))}
            </div>
          )}

          {phase === 'results' && (
            <div className="qls__results">
              <div className="qls__market">
                {marketCards.map((card) => (
                  <article
                    key={card.id}
                    className={cn('qls-mcard', card.empty && 'is-empty')}
                  >
                    <div className="qls-mcard__head">
                      <div className="qls-mcard__brand">
                        <RateSourceMark id={card.id} />
                        <strong>{card.source}</strong>
                      </div>
                      <span className={cn('qls-mcard__badge', `is-${card.badgeTone}`)}>
                        {card.badge}
                      </span>
                    </div>
                    {card.empty ? (
                      <>
                        <div className="qls-mcard__value is-muted">No quote</div>
                        <div className="qls-mcard__rpm">{card.emptySub}</div>
                        <div className="qls-mcard__range is-muted">
                          <span>— low</span>
                          <div className="qls-mcard__bar" />
                          <span>— high</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="qls-mcard__value-row">
                          <div className="qls-mcard__value">{card.total}</div>
                          {card.trend && card.trend.length > 0 ? (
                            <RateSparkline values={card.trend} />
                          ) : null}
                        </div>
                        <div className="qls-mcard__rpm">{card.rpm}</div>
                        {card.historic ? (
                          <div className="qls-mcard__hist">
                            Our hist · {card.historic.replace(/^Our hist\s+/i, '')}
                          </div>
                        ) : null}
                        <div className="qls-mcard__range">
                          <span>{card.low} low</span>
                          <div className="qls-mcard__bar">
                            <i
                              className="qls-mcard__fill"
                              style={{
                                left: `${card.fillStart}%`,
                                width: `${(card.fillEnd ?? 0) - (card.fillStart ?? 0)}%`,
                              }}
                            />
                            <b style={{ left: `${card.markerPct}%` }} />
                          </div>
                          <span>{card.high} high</span>
                        </div>
                      </>
                    )}
                    <div className="qls-mcard__meta">{card.meta}</div>
                  </article>
                ))}
              </div>

              <div className="qls__carriers-head">
                <div className="qls__carriers-title">
                  <strong>Carriers ({results.length})</strong>
                  <em>Within {radius || 50} mi DH-P</em>
                </div>
                <div className="qls__carriers-tools">
                  <label className="qls__exclude">
                    <input
                      type="checkbox"
                      checked={excludeContacted}
                      onChange={(e) => setExcludeContacted(e.target.checked)}
                    />
                    <span>Exclude contacted</span>
                  </label>
                  <label className="qls__carrier-search">
                    <Search size={13} />
                    <input
                      value={carrierQ}
                      onChange={(e) => setCarrierQ(e.target.value)}
                      placeholder="Carrier, MC#, DOT#…"
                    />
                  </label>
                </div>
              </div>

              <div className="qls__table-wrap">
                <table className="qls__table">
                  <thead>
                    <tr>
                      <th className="qls__check-col">
                        <input
                          type="checkbox"
                          checked={results.length > 0 && selected.size === results.length}
                          onChange={toggleAll}
                          aria-label="Select all carriers"
                        />
                      </th>
                      <th>Carrier</th>
                      <th>Source</th>
                      <th>Last used</th>
                      <th>Last contacted</th>
                      <th>DH-P</th>
                      <th>DH-D</th>
                      <th>Last rate</th>
                      <th>History</th>
                      <th>Contact</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.id} className={cn(selected.has(r.id) && 'is-selected')}>
                        <td className="qls__check-col">
                          <input
                            type="checkbox"
                            checked={selected.has(r.id)}
                            onChange={() => toggleRow(r.id)}
                            aria-label={`Select ${r.name}`}
                          />
                        </td>
                        <td>
                          <div className="qls__cell-2">
                            <strong>{r.name}</strong>
                            <em className="num">
                              {r.mc ? `MC# ${r.mc}` : '—'}
                              {r.dot ? ` · DOT ${r.dot}` : ''}
                            </em>
                          </div>
                        </td>
                        <td>
                          <span className={cn('qls__source', `is-${r.source.toLowerCase()}`)}>
                            {r.source}
                          </span>
                        </td>
                        <td>
                          <div className="qls__cell-2">
                            <strong>{r.lastUsed}</strong>
                            <em>{r.lastUsedRel}</em>
                          </div>
                        </td>
                        <td>
                          <div className="qls__cell-2">
                            <strong>{r.lastContacted ?? '—'}</strong>
                            <em>{r.lastContactChannel ?? (r.contactedRecently ? 'Recent' : '—')}</em>
                          </div>
                        </td>
                        <td className="num">{r.dhP}</td>
                        <td className="num">{r.dhD}</td>
                        <td className="num">{r.lastRate}</td>
                        <td>
                          <div className="qls__cell-2">
                            <strong className="num">{r.loads} loads</strong>
                            <em className="num">{r.legs} legs</em>
                          </div>
                        </td>
                        <td>
                          <div className="qls__cell-2">
                            <strong>{r.contact ?? '—'}</strong>
                            {r.phone ? (
                              <a href={`tel:${r.phone}`} className="qls__link">
                                {r.phone}
                              </a>
                            ) : (
                              <em>—</em>
                            )}
                          </div>
                        </td>
                        <td>
                          {r.email ? (
                            <a href={`mailto:${r.email}`} className="qls__link">
                              {r.email}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                    {results.length === 0 && (
                      <tr>
                        <td colSpan={11} className="qls__table-empty">
                          No carriers match these filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {phase === 'results' && (
          <footer className="qls__foot">
            <div className="qls__foot-meta">
              <CheckCircle2 size={14} />
              <span>
                <strong>{results.length} carriers matched</strong>
                {' · '}
                live rates from DAT, Truckstop &amp; Loadlink · USD
                {selected.size > 0 ? ` · ${selected.size} selected` : ''}
              </span>
            </div>
          </footer>
        )}

        {manageOpen && (
          <div className="qls-manage" role="dialog" aria-label="Manage favourite lanes">
            <div className="qls-manage__card">
              <div className="qls-manage__head">
                <div>
                  <strong>
                    {manageMode === 'add'
                      ? 'Add favourite lane'
                      : manageMode === 'edit'
                        ? 'Edit favourite lane'
                        : 'Manage favourite lanes'}
                  </strong>
                  <em>
                    {manageMode === 'list'
                      ? 'Add, edit, or remove lanes you search often.'
                      : 'Origin, destination, and equipment define the saved lane.'}
                  </em>
                </div>
                <button
                  type="button"
                  className="qls__icon-btn"
                  aria-label="Close manage"
                  onClick={closeManage}
                >
                  <X size={15} />
                </button>
              </div>

              {manageMode === 'list' ? (
                <>
                  <div className="qls-manage__toolbar">
                    <span className="qls-manage__count">
                      {favourites.length} saved lane{favourites.length === 1 ? '' : 's'}
                    </span>
                    <button type="button" className="qls-manage__add" onClick={startAddFavourite}>
                      <Plus size={14} strokeWidth={2.4} />
                      Add lane
                    </button>
                  </div>

                  <div className="qls-manage__list">
                    {favourites.length === 0 && (
                      <div className="qls-manage__empty">
                        <Star size={22} strokeWidth={1.6} />
                        <strong>No favourites yet</strong>
                        <em>Add a lane here, or save the current search from the toolbar.</em>
                        <button type="button" className="qls-manage__add" onClick={startAddFavourite}>
                          <Plus size={14} strokeWidth={2.4} />
                          Add your first lane
                        </button>
                      </div>
                    )}
                    {favourites.map((fav) => (
                      <div key={fav.id} className="qls-manage__row">
                        <button
                          type="button"
                          className="qls-manage__main"
                          onClick={() => {
                            applyFavourite(fav)
                            closeManage()
                          }}
                          title="Apply this lane"
                        >
                          <span className="qls-manage__star" aria-hidden>
                            <Star size={13} fill="currentColor" />
                          </span>
                          <div className="qls-manage__meta">
                            <strong>
                              {fav.origin} → {fav.destination}
                            </strong>
                            <em>
                              <span>{fav.trailer}</span>
                              {fav.powerOnly ? <span>Power only</span> : null}
                              {fav.tag ? <span className="qls-manage__tag">{fav.tag}</span> : null}
                            </em>
                          </div>
                        </button>
                        <div className="qls-manage__actions">
                          <button
                            type="button"
                            className="qls-manage__icon-btn"
                            aria-label={`Edit ${fav.origin} to ${fav.destination}`}
                            title="Edit"
                            onClick={() => startEditFavourite(fav)}
                          >
                            <Pencil size={13} strokeWidth={2.2} />
                          </button>
                          <button
                            type="button"
                            className="qls-manage__icon-btn is-danger"
                            aria-label={`Remove ${fav.origin} to ${fav.destination}`}
                            title="Remove"
                            onClick={() => removeFavourite(fav.id)}
                          >
                            <Trash2 size={13} strokeWidth={2.2} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="qls-manage__foot">
                    <button
                      type="button"
                      className="qls__search-btn qls__search-btn--ghost"
                      onClick={toggleFavouriteCurrent}
                      disabled={!origin.trim() || !destination.trim() || equipment.length === 0}
                    >
                      <Star size={14} fill={activeFavId ? 'currentColor' : 'none'} />
                      {activeFavId ? 'Unsave current' : 'Save current search'}
                    </button>
                    <button type="button" className="qls__search-btn" onClick={closeManage}>
                      Done
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <form
                    className="qls-manage__form"
                    onSubmit={(e) => {
                      e.preventDefault()
                      saveFavouriteForm()
                    }}
                  >
                    <label className="qls-manage__field">
                      <span>Origin</span>
                      <input
                        value={favForm.origin}
                        onChange={(e) => setFavForm((f) => ({ ...f, origin: e.target.value }))}
                        placeholder="e.g. Laredo, TX"
                        autoFocus
                      />
                    </label>
                    <label className="qls-manage__field">
                      <span>Destination</span>
                      <input
                        value={favForm.destination}
                        onChange={(e) => setFavForm((f) => ({ ...f, destination: e.target.value }))}
                        placeholder="e.g. Dallas, TX"
                      />
                    </label>
                    <div className="qls-manage__form-row">
                      <label className="qls-manage__field">
                        <span>Equipment</span>
                        <select
                          value={favForm.trailer}
                          onChange={(e) =>
                            setFavForm((f) => ({
                              ...f,
                              trailer: e.target.value as FavForm['trailer'],
                            }))
                          }
                        >
                          {TRAILERS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="qls-manage__field">
                        <span>Tag</span>
                        <input
                          value={favForm.tag}
                          onChange={(e) => setFavForm((f) => ({ ...f, tag: e.target.value }))}
                          placeholder="Optional · P0, Hot…"
                          maxLength={12}
                        />
                      </label>
                    </div>
                    <label className="qls-manage__check">
                      <input
                        type="checkbox"
                        checked={favForm.powerOnly}
                        onChange={(e) =>
                          setFavForm((f) => ({ ...f, powerOnly: e.target.checked }))
                        }
                      />
                      <span>Power only</span>
                    </label>
                  </form>

                  <div className="qls-manage__foot">
                    <button
                      type="button"
                      className="qls__search-btn qls__search-btn--ghost"
                      onClick={() => {
                        setManageMode('list')
                        setEditingId(null)
                        setFavForm(EMPTY_FAV_FORM)
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="qls__search-btn"
                      onClick={saveFavouriteForm}
                      disabled={
                        !favForm.origin.trim() || !favForm.destination.trim() || !favForm.trailer
                      }
                    >
                      {manageMode === 'edit' ? 'Save changes' : 'Add favourite'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
