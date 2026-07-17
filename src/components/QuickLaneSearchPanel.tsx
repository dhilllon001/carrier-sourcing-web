import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeftRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Gauge,
  MapPin,
  RefreshCw,
  Route,
  Search,
  Truck,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'

export type LaneCarrier = {
  id: string
  name: string
  mc?: string
  dot?: string
  source: 'PAST' | 'DAT' | 'HIGHWAY' | 'NEW'
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

const LANE_CARRIERS: LaneCarrier[] = [
  {
    id: 'lc1',
    name: 'UACL LOGISTICS LLC',
    mc: '884120',
    dot: '2551021',
    source: 'PAST',
    lastUsed: '27 May, 14:59',
    lastUsedRel: '2mo ago',
    dhP: 18,
    dhD: 42,
    lastRate: '$2,180',
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
    lastUsedRel: '1mo ago',
    dhP: 12,
    dhD: 8,
    lastRate: '$2,050',
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
    source: 'HIGHWAY',
    lastUsed: '01 Jul, 16:40',
    lastUsedRel: '16d ago',
    dhP: 34,
    dhD: 18,
    lastRate: '$2,420',
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
    source: 'PAST',
    lastUsed: '08 Jul, 11:05',
    lastUsedRel: '9d ago',
    dhP: 6,
    dhD: 9,
    lastRate: '$1,980',
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
    source: 'DAT',
    lastUsed: '—',
    lastUsedRel: 'Never',
    dhP: 55,
    dhD: 40,
    lastRate: '$2,600',
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
    source: 'HIGHWAY',
    lastUsed: '03 Jul, 08:20',
    lastUsedRel: '14d ago',
    dhP: 22,
    dhD: 15,
    lastRate: '$2,110',
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
    source: 'PAST',
    lastUsed: '15 Jun, 13:44',
    lastUsedRel: '1mo ago',
    dhP: 9,
    dhD: 21,
    lastRate: '$2,340',
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
    source: 'NEW',
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
]

const TRAILERS = ['DRY-VAN', 'REEFER', 'FLATBED', 'STEP DECK', 'POWER ONLY'] as const

type Props = {
  open: boolean
  onClose: () => void
}

export function QuickLaneSearchPanel({ open, onClose }: Props) {
  const [origin, setOrigin] = useState('OLD TORONTO, ON')
  const [destination, setDestination] = useState('Dallas, PA')
  const [trailer, setTrailer] = useState<(typeof TRAILERS)[number] | ''>('DRY-VAN')
  const [radius, setRadius] = useState('50')
  const [available, setAvailable] = useState('2026-07-17')
  const [originZip, setOriginZip] = useState('')
  const [destZip, setDestZip] = useState('')
  const [powerOnly, setPowerOnly] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'loading' | 'results'>('idle')
  const [query, setQuery] = useState<{ origin: string; destination: string; trailer: string } | null>(
    null
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const results = useMemo(() => {
    if (phase !== 'results') return []
    let rows = [...LANE_CARRIERS]
    if (powerOnly) rows = rows.filter((r) => r.source !== 'NEW')
    if (trailer === 'FLATBED') rows = rows.filter((r) => r.id !== 'lc1')
    return rows
  }, [phase, powerOnly, trailer])

  const swap = () => {
    setOrigin(destination)
    setDestination(origin)
    setOriginZip(destZip)
    setDestZip(originZip)
  }

  const reset = () => {
    setPhase('idle')
    setQuery(null)
    setOrigin('OLD TORONTO, ON')
    setDestination('Dallas, PA')
    setTrailer('DRY-VAN')
    setRadius('50')
    setAvailable('2026-07-17')
    setOriginZip('')
    setDestZip('')
    setPowerOnly(false)
  }

  const search = () => {
    if (!origin.trim() || !destination.trim() || !trailer) return
    setPhase('loading')
    setQuery({ origin: origin.trim(), destination: destination.trim(), trailer })
    window.setTimeout(() => setPhase('results'), 650)
  }

  if (!open) return null

  return (
    <div className="qls" role="dialog" aria-modal="true" aria-label="Quick Lane Search">
      <button type="button" className="qls__backdrop" aria-label="Close panel" onClick={onClose} />
      <aside className="qls__panel">
        <header className="qls__head">
          <div className="qls__brand">
            <span className="qls__mark" aria-hidden>
              <Route size={15} />
            </span>
            <div>
              <strong>Quick Lane Search</strong>
              <em>Market rates · Carrier availability · Lane intelligence</em>
            </div>
          </div>
          <div className="qls__head-actions">
            <button type="button" className="qls__icon-btn" aria-label="Refresh" onClick={reset}>
              <RefreshCw size={15} />
            </button>
            <button type="button" className="qls__icon-btn" aria-label="Close" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="qls__form">
          <div className="qls__grid qls__grid--lane">
            <label className="qls__field">
              <span className="qls__label">Origin</span>
              <div className="qls__control">
                <MapPin size={14} className="is-origin" />
                <input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Origin — city, state or zip"
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
                  placeholder="Destination — city, state or zip"
                />
              </div>
            </label>

            <label className="qls__field">
              <span className="qls__label">Trailer</span>
              <div className={cn('qls__control', !trailer && 'is-invalid')}>
                <Truck size={14} />
                <select
                  value={trailer}
                  onChange={(e) => setTrailer(e.target.value as (typeof TRAILERS)[number] | '')}
                >
                  <option value="">Select trailer</option>
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
              Search Lane
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
              <span className="qls__label">Available</span>
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
                  placeholder="Add ZIP code"
                />
              </div>
            </label>

            <label className="qls__field">
              <span className="qls__label">Dest ZIP</span>
              <div className="qls__control">
                <input
                  value={destZip}
                  onChange={(e) => setDestZip(e.target.value)}
                  placeholder="Add ZIP code"
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
          </div>
        </div>

        {query && (
          <div className="qls__lane-wrap">
            <div className="qls__lane-bar">
              <span className="qls__dot is-origin" />
              <strong>{query.origin}</strong>
              <span className="qls__lane-arrow" aria-hidden>
                →
              </span>
              <span className="qls__dot is-dest" />
              <strong>{query.destination}</strong>
              <em>{query.trailer}</em>
            </div>
          </div>
        )}

        <div className="qls__body">
          {phase === 'idle' && (
            <div className="qls__empty">
              <div className="qls__empty-ico" aria-hidden>
                <Route size={28} />
                <span>
                  <Search size={14} />
                </span>
              </div>
              <strong>Search any lane for instant intelligence</strong>
              <p>
                See real-time market rates from DAT, Truckstop &amp; Loadlink, carrier trust scores,
                and 30-day performance analytics for any origin–destination pair.
              </p>
              <div className="qls__features">
                <span>
                  <em>$</em> Market Rates
                </span>
                <span>
                  <Truck size={13} /> Carrier Match
                </span>
                <span>
                  <BarChart3 size={13} /> Lane Analytics
                </span>
                <span>
                  <Gauge size={13} /> Difficulty Score
                </span>
              </div>
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
                </div>
              ))}
            </div>
          )}

          {phase === 'results' && (
            <div className="qls__results">
              <div className="qls__results-head">
                <strong>{results.length} carriers matched</strong>
                <em>
                  Radius {radius || '50'} mi · {available}
                  {powerOnly ? ' · Power only' : ''}
                </em>
              </div>

              <div className="qls__table-wrap">
                <table className="qls__table">
                  <thead>
                    <tr>
                      <th>Carrier</th>
                      <th>Source</th>
                      <th>Last used</th>
                      <th>DH-P</th>
                      <th>DH-D</th>
                      <th>Last rate</th>
                      <th>Loads</th>
                      <th>Legs</th>
                      <th>Contact</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div className="qls__carrier">
                            <strong>{r.name}</strong>
                            <em>
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
                          <div className="qls__stack">
                            <strong>{r.lastUsed}</strong>
                            <em>{r.lastUsedRel}</em>
                          </div>
                        </td>
                        <td className="mono">{r.dhP}</td>
                        <td className="mono">{r.dhD}</td>
                        <td className="mono">{r.lastRate}</td>
                        <td className="mono">{r.loads}</td>
                        <td className="mono">{r.legs}</td>
                        <td>
                          <div className="qls__stack">
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
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <footer className="qls__foot">
          <div className="qls__foot-meta">
            {phase === 'results' ? (
              <>
                <CheckCircle2 size={14} />
                <span>
                  <strong>{results.length} carriers matched</strong> on this lane · live rates from
                  DAT, Truckstop &amp; Loadlink
                </span>
              </>
            ) : (
              <span>Enter origin, destination, and trailer to search the lane.</span>
            )}
          </div>
          <div className="qls__foot-actions">
            {phase !== 'idle' && (
              <button type="button" className="qls__ghost-btn" onClick={reset}>
                New Search
              </button>
            )}
            <button type="button" className="qls__search-btn qls__search-btn--sm" onClick={search}>
              <Search size={14} />
              Search Lane
            </button>
          </div>
        </footer>
      </aside>
    </div>
  )
}
