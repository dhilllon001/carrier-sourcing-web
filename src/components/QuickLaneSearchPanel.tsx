import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeftRight,
  Calendar,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Route,
  Search,
  Settings2,
  Star,
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
  const [trailer, setTrailer] = useState<(typeof TRAILERS)[number] | ''>('DRY-VAN')
  const [radius, setRadius] = useState('50')
  const [available, setAvailable] = useState('2026-08-11')
  const [originZip, setOriginZip] = useState('')
  const [destZip, setDestZip] = useState('')
  const [powerOnly, setPowerOnly] = useState(true)
  const [ctpatOnly, setCtpatOnly] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'loading' | 'results'>('idle')
  const [carrierQ, setCarrierQ] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [favourites, setFavourites] = useState<FavouriteLane[]>(DEFAULT_FAVOURITES)
  const [manageOpen, setManageOpen] = useState(false)
  const [miles] = useState(431)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (manageOpen) setManageOpen(false)
        else onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, manageOpen])

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
          f.trailer === trailer
      )?.id ?? null
    )
  }, [favourites, origin, destination, trailer])

  const results = useMemo(() => {
    if (phase !== 'results') return []
    let rows = [...LANE_CARRIERS]
    if (powerOnly) rows = rows.filter((r) => r.source !== 'New')
    if (ctpatOnly) rows = rows.filter((r) => r.source === 'Network' || r.source === 'Past')
    if (trailer === 'FLATBED') rows = rows.filter((r) => r.id !== 'lc1')
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
  }, [phase, powerOnly, ctpatOnly, trailer, carrierQ])

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
    setTrailer('DRY-VAN')
    setRadius('50')
    setAvailable('2026-08-11')
    setOriginZip('')
    setDestZip('')
    setPowerOnly(false)
    setCtpatOnly(false)
    setCarrierQ('')
    setSelected(new Set())
  }

  const search = () => {
    if (!origin.trim() || !destination.trim() || !trailer) return
    setPhase('loading')
    setSelected(new Set())
    window.setTimeout(() => setPhase('results'), 550)
  }

  const applyFavourite = (fav: FavouriteLane) => {
    setOrigin(fav.origin)
    setDestination(fav.destination)
    setTrailer(fav.trailer as (typeof TRAILERS)[number])
    setPowerOnly(Boolean(fav.powerOnly))
    setPhase('loading')
    window.setTimeout(() => setPhase('results'), 450)
  }

  const toggleFavouriteCurrent = () => {
    if (!origin.trim() || !destination.trim() || !trailer) return
    if (activeFavId) {
      setFavourites((prev) => prev.filter((f) => f.id !== activeFavId))
      return
    }
    setFavourites((prev) => [
      {
        id: `fav-${Date.now()}`,
        origin: origin.trim(),
        destination: destination.trim(),
        trailer,
        powerOnly,
        tag: powerOnly ? 'P0' : undefined,
      },
      ...prev,
    ])
  }

  const removeFavourite = (id: string) => {
    setFavourites((prev) => prev.filter((f) => f.id !== id))
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
              disabled={!origin.trim() || !destination.trim() || !trailer}
              title={activeFavId ? 'Remove from favourites' : 'Save current lane'}
            >
              <Star size={12} fill={activeFavId ? 'currentColor' : 'none'} />
              {activeFavId ? 'Saved' : 'Save'}
            </button>
            <button type="button" className="qls__manage" onClick={() => setManageOpen(true)}>
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

            <label className="qls__field">
              <span className="qls__label">Equipment</span>
              <div className={cn('qls__control', !trailer && 'is-invalid')}>
                <Truck size={14} />
                <select
                  value={trailer}
                  onChange={(e) => setTrailer(e.target.value as (typeof TRAILERS)[number] | '')}
                >
                  <option value="">Select</option>
                  {TRAILERS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </label>

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
                        <div className="qls-mcard__value">{card.total}</div>
                        <div className="qls-mcard__rpm">{card.rpm}</div>
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
                <strong>Carriers ({results.length})</strong>
                <label className="qls__carrier-search">
                  <Search size={13} />
                  <input
                    value={carrierQ}
                    onChange={(e) => setCarrierQ(e.target.value)}
                    placeholder="Carrier, MC#, DOT#…"
                  />
                </label>
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
                        <td colSpan={10} className="qls__table-empty">
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
                  <strong>Manage favourite lanes</strong>
                  <em>Save lanes you search often. Use Save next to Manage to add the current search.</em>
                </div>
                <button
                  type="button"
                  className="qls__icon-btn"
                  aria-label="Close manage"
                  onClick={() => setManageOpen(false)}
                >
                  <X size={15} />
                </button>
              </div>

              <div className="qls-manage__list">
                {favourites.length === 0 && (
                  <div className="qls-manage__empty">No favourites saved.</div>
                )}
                {favourites.map((fav) => (
                  <div key={fav.id} className="qls-manage__row">
                    <button type="button" className="qls-manage__main" onClick={() => {
                      applyFavourite(fav)
                      setManageOpen(false)
                    }}>
                      <Star size={14} fill="currentColor" />
                      <div>
                        <strong>
                          {fav.origin} → {fav.destination}
                        </strong>
                        <em>
                          {fav.trailer}
                          {fav.powerOnly ? ' · Power only' : ''}
                          {fav.tag ? ` · ${fav.tag}` : ''}
                        </em>
                      </div>
                    </button>
                    <button
                      type="button"
                      className="qls-manage__remove"
                      onClick={() => removeFavourite(fav.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="qls-manage__foot">
                <button
                  type="button"
                  className="qls__search-btn qls__search-btn--ghost"
                  onClick={() => {
                    toggleFavouriteCurrent()
                  }}
                  disabled={!origin.trim() || !destination.trim() || !trailer}
                >
                  <Star size={14} />
                  {activeFavId ? 'Unsave current lane' : 'Save current lane'}
                </button>
                <button type="button" className="qls__search-btn" onClick={() => setManageOpen(false)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
