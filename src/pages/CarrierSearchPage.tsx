import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  Send,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { reportLoads } from '@/data/report'
import {
  buildLaneSearch,
  equipmentOptions,
  laneCities,
  laneSearches as seedLanes,
  laneStats,
  sourceOptions,
  todayStamp,
  type LaneSearch,
  type SearchCarrier,
  type SearchSource,
} from '@/data/carrierSearch'
import {
  CarrierHoverCard,
  ConfidenceCell,
  useCarrierHover,
} from '@/components/carriers/searchParts'

type Props = {
  search: string
  onOpenCarrier?: (id: string) => void
}

type Channel = 'email' | 'whatsapp'

type AssignTarget = { laneId: string; carrier: SearchCarrier }

const money = (value: number) => `$${value.toLocaleString()}`

function OfferCell({ carrier }: { carrier: SearchCarrier }) {
  if (carrier.offer === 'Not sent') return <em className="cs-quiet">Not sent</em>
  const tone =
    carrier.offer === 'Awarded' ? 'is-awarded' : carrier.offer === 'Quoted' ? 'is-quoted' : 'is-sent'
  return (
    <span className={cn('cs-offer', tone)}>
      {carrier.offer}
      {carrier.offerAmount ? ` · ${money(carrier.offerAmount)}` : ''}
    </span>
  )
}

export function CarrierSearchPage({ search, onOpenCarrier }: Props) {
  const [lanes, setLanes] = useState<LaneSearch[]>(seedLanes)
  const [openLanes, setOpenLanes] = useState<string[]>([seedLanes[0].id])
  const [localQuery, setLocalQuery] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [assign, setAssign] = useState<AssignTarget | null>(null)
  const [probill, setProbill] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const { hover, bind } = useCarrierHover()

  const [origin, setOrigin] = useState('Brampton, ON')
  const [destination, setDestination] = useState('Woodstock, ON')
  const [equipment, setEquipment] = useState('DRY-VAN')
  const [pickup, setPickup] = useState('2026-08-20')
  const [radius, setRadius] = useState('150')
  const [sources, setSources] = useState<SearchSource[]>(['PAST', 'DAT'])

  const q = (search || localQuery).trim().toLowerCase()

  const visible = useMemo(() => {
    if (!q) return lanes
    return lanes
      .map((lane) => {
        const laneHit =
          lane.origin.toLowerCase().includes(q) ||
          lane.destination.toLowerCase().includes(q) ||
          lane.equipment.toLowerCase().includes(q)
        const carriers = lane.carriers.filter(
          (carrier) =>
            carrier.name.toLowerCase().includes(q) ||
            carrier.mc.includes(q) ||
            carrier.dot.includes(q) ||
            (carrier.contact ?? '').includes(q) ||
            (carrier.email ?? '').toLowerCase().includes(q)
        )
        if (laneHit) return lane
        return carriers.length ? { ...lane, carriers } : null
      })
      .filter((lane): lane is LaneSearch => Boolean(lane))
  }, [lanes, q])

  const openLoads = reportLoads.filter((load) => load.status === 'NeedCarrier')

  const toggleLane = (id: string) =>
    setOpenLanes((current) =>
      current.includes(id) ? current.filter((laneId) => laneId !== id) : [...current, id]
    )

  const toggleCarrier = (laneId: string, carrierId: string) =>
    setSelected((current) => {
      const list = current[laneId] ?? []
      return {
        ...current,
        [laneId]: list.includes(carrierId)
          ? list.filter((id) => id !== carrierId)
          : [...list, carrierId],
      }
    })

  const toggleSource = (source: SearchSource) =>
    setSources((current) =>
      current.includes(source) ? current.filter((item) => item !== source) : [...current, source]
    )

  const runSearch = () => {
    const lane = buildLaneSearch({
      origin,
      destination,
      equipment,
      pickup: new Date(`${pickup}T12:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      radius: Number(radius) || 100,
      sources: sources.length ? sources : ['PAST', 'DAT'],
    })
    setLanes((current) => [lane, ...current])
    setOpenLanes((current) => [lane.id, ...current])
    setPanelOpen(false)
    setNotice(`${lane.carriers.length} carriers found for ${origin} → ${destination}.`)
  }

  const blast = (lane: LaneSearch, channel: Channel) => {
    const ids = selected[lane.id] ?? []
    if (!ids.length) return
    const stamp = todayStamp()
    setLanes((current) =>
      current.map((item) =>
        item.id !== lane.id
          ? item
          : {
              ...item,
              carriers: item.carriers.map((carrier) =>
                ids.includes(carrier.id) && carrier.offer === 'Not sent'
                  ? { ...carrier, offer: 'Sent', updated: stamp.date, updatedTime: stamp.time }
                  : carrier
              ),
            }
      )
    )
    setSelected((current) => ({ ...current, [lane.id]: [] }))
    setNotice(
      `${channel === 'email' ? 'Email' : 'WhatsApp'} blast sent to ${ids.length} carriers on ${
        lane.origin
      } → ${lane.destination}.`
    )
  }

  const confirmAssign = () => {
    if (!assign || !probill) return
    setLanes((current) =>
      current.map((lane) =>
        lane.id !== assign.laneId
          ? lane
          : {
              ...lane,
              carriers: lane.carriers.map((carrier) =>
                carrier.id === assign.carrier.id
                  ? { ...carrier, assignedProbill: probill, offer: 'Awarded' }
                  : carrier
              ),
            }
      )
    )
    setNotice(`Probill ${probill} assigned to ${assign.carrier.name}.`)
    setAssign(null)
    setProbill('')
  }

  return (
    <div className="cs-page">
      <div className="cs-bar">
        <label className="cs-searchbar">
          <Search size={15} strokeWidth={2} />
          <input
            value={localQuery}
            onChange={(event) => setLocalQuery(event.target.value)}
            placeholder="Search a lane, carrier, MC or DOT…"
            aria-label="Search lanes and carriers"
          />
          {localQuery && (
            <button type="button" aria-label="Clear" onClick={() => setLocalQuery('')}>
              <X size={13} />
            </button>
          )}
        </label>
        <button
          type="button"
          className="cs-btn cs-btn--primary"
          onClick={() => setPanelOpen(true)}
        >
          <SlidersHorizontal size={13} />
          New lane search
        </button>
        <span className="cs-bar__meta">
          {visible.length} {visible.length === 1 ? 'search' : 'searches'} ·{' '}
          {visible.reduce((sum, lane) => sum + lane.carriers.length, 0)} carriers
        </span>
      </div>

      {notice && (
        <div className="cs-notice">
          <CheckCircle2 size={14} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
            <X size={13} />
          </button>
        </div>
      )}

      <div className="cs-lanes">
        {visible.map((lane) => {
          const open = openLanes.includes(lane.id)
          const stats = laneStats(lane)
          const picked = selected[lane.id] ?? []

          return (
            <section key={lane.id} className={cn('cs-lane', open && 'is-open')}>
              <button
                type="button"
                className="cs-lane__head"
                aria-expanded={open}
                onClick={() => toggleLane(lane.id)}
              >
                <ChevronRight size={14} className={cn('cs-caret', open && 'is-open')} />
                <span className="cs-lane__route">
                  <strong>{lane.origin}</strong>
                  <ArrowRight size={12} />
                  <strong>{lane.destination}</strong>
                </span>
                <span className="cs-chip">{lane.equipment}</span>
                <span className="cs-chip is-quiet">{lane.radius} mi radius</span>
                <span className="cs-lane__pickup">Pickup {lane.pickup}</span>
                <span className="cs-lane__stats">
                  <em>
                    <b>{stats.total}</b> carriers
                  </em>
                  <em>
                    <b>{stats.past}</b> used before
                  </em>
                  <em>
                    <b>{stats.strong}</b> high confidence
                  </em>
                  <em>
                    <b>{stats.contacted}</b> contacted
                  </em>
                  {stats.bestQuote && (
                    <em className="is-good">
                      best <b>{money(stats.bestQuote)}</b>
                    </em>
                  )}
                  {stats.assigned && (
                    <em className="cs-assigned">
                      <ClipboardCheck size={11} />
                      {stats.assigned.assignedProbill}
                    </em>
                  )}
                </span>
                <span className="cs-lane__when">{lane.searchedAt}</span>
              </button>

              {open && (
                <div className="cs-lane__body">
                  <div className="cs-actions">
                    <span>
                      {picked.length ? `${picked.length} selected` : 'Select carriers to contact'}
                    </span>
                    <button
                      type="button"
                      className="cs-btn"
                      disabled={!picked.length}
                      onClick={() => blast(lane, 'email')}
                    >
                      <Mail size={12} />
                      Blast email
                    </button>
                    <button
                      type="button"
                      className="cs-btn cs-btn--wa"
                      disabled={!picked.length}
                      onClick={() => blast(lane, 'whatsapp')}
                    >
                      <MessageCircle size={12} />
                      Blast WhatsApp
                    </button>
                  </div>

                  <div className="cs-tablewrap">
                    <table className="cs-table">
                      <thead>
                        <tr className="cs-groups">
                          <th className="cs-col-check" />
                          <th colSpan={3}>Carrier</th>
                          <th colSpan={1} className="cs-gsep">
                            Match
                          </th>
                          <th colSpan={2} className="cs-gsep">
                            Deadhead
                          </th>
                          <th colSpan={4} className="cs-gsep">
                            History with us
                          </th>
                          <th colSpan={3} className="cs-gsep">
                            Sourcing
                          </th>
                          <th colSpan={2} className="cs-gsep">
                            Contact
                          </th>
                          <th className="cs-col-act cs-gsep" />
                        </tr>
                        <tr className="cs-cols">
                          <th className="cs-col-check">
                            <input
                              type="checkbox"
                              aria-label="Select all carriers"
                              checked={
                                lane.carriers.length > 0 && picked.length === lane.carriers.length
                              }
                              onChange={(event) =>
                                setSelected((current) => ({
                                  ...current,
                                  [lane.id]: event.target.checked
                                    ? lane.carriers.map((carrier) => carrier.id)
                                    : [],
                                }))
                              }
                            />
                          </th>
                          <th>Carrier</th>
                          <th>MC # / DOT #</th>
                          <th>Source</th>
                          <th className="cs-num cs-gsep">Confidence</th>
                          <th className="cs-num cs-gsep">DH-P</th>
                          <th className="cs-num">DH-D</th>
                          <th className="cs-gsep">Last used</th>
                          <th className="cs-num">Last rate</th>
                          <th className="cs-num">Loads</th>
                          <th className="cs-num">Legs</th>
                          <th className="cs-gsep">Offer</th>
                          <th className="cs-num">Config rate</th>
                          <th>Updated</th>
                          <th className="cs-gsep">Contact</th>
                          <th>Email</th>
                          <th className="cs-col-act cs-gsep" aria-label="Assign" />
                        </tr>
                      </thead>
                      <tbody>
                        {lane.carriers.map((carrier) => (
                          <tr
                            key={carrier.id}
                            className={cn(picked.includes(carrier.id) && 'is-selected')}
                          >
                            <td className="cs-col-check">
                              <input
                                type="checkbox"
                                checked={picked.includes(carrier.id)}
                                onChange={() => toggleCarrier(lane.id, carrier.id)}
                                aria-label={`Select ${carrier.name}`}
                              />
                            </td>
                            <td {...bind(carrier, lane)}>
                              <button
                                type="button"
                                className="cs-name"
                                onClick={() => onOpenCarrier?.(carrier.id)}
                              >
                                {carrier.name}
                              </button>
                            </td>
                            <td>
                              <div className="cs-stack">
                                <span>{carrier.mc}</span>
                                <em>DOT {carrier.dot}</em>
                              </div>
                            </td>
                            <td>
                              <span className={cn('cs-source', `is-${carrier.source.toLowerCase()}`)}>
                                {carrier.source}
                              </span>
                            </td>
                            <td className="cs-num cs-gsep">
                              <ConfidenceCell carrier={carrier} />
                            </td>
                            <td className="cs-num cs-gsep">
                              {carrier.dhP || <em className="cs-quiet">0</em>}
                            </td>
                            <td className="cs-num">{carrier.dhD || <em className="cs-quiet">0</em>}</td>
                            <td className="cs-gsep">
                              {carrier.lastUsed ? (
                                <div className="cs-stack">
                                  <span>{carrier.lastUsed}</span>
                                  <em>
                                    {carrier.lastUsedTime} · {carrier.lastUsedAgo}
                                  </em>
                                </div>
                              ) : (
                                <em className="cs-quiet">Never</em>
                              )}
                            </td>
                            <td className="cs-num">
                              {carrier.lastRate ? (
                                <span className="cs-rate">
                                  <i>{carrier.rateCountry}</i>
                                  {money(carrier.lastRate)}
                                </span>
                              ) : (
                                <em className="cs-quiet">—</em>
                              )}
                            </td>
                            <td className="cs-num">{carrier.loads}</td>
                            <td className="cs-num">{carrier.legs}</td>
                            <td className="cs-gsep">
                              <OfferCell carrier={carrier} />
                            </td>
                            <td className="cs-num">
                              {carrier.configRate ? (
                                money(carrier.configRate)
                              ) : (
                                <em className="cs-quiet">—</em>
                              )}
                            </td>
                            <td>
                              {carrier.updated ? (
                                <div className="cs-stack">
                                  <span>{carrier.updated}</span>
                                  <em>{carrier.updatedTime}</em>
                                </div>
                              ) : (
                                <em className="cs-quiet">—</em>
                              )}
                            </td>
                            <td className="cs-gsep">
                              {carrier.contact ? (
                                <span className="cs-contact">
                                  {carrier.contact}
                                  {carrier.whatsapp && <MessageCircle size={10} />}
                                </span>
                              ) : (
                                <em className="cs-quiet">—</em>
                              )}
                            </td>
                            <td className="cs-email">
                              {carrier.email ?? <em className="cs-quiet">—</em>}
                            </td>
                            <td className="cs-col-act cs-gsep">
                              {carrier.assignedProbill ? (
                                <span className="cs-probill">
                                  <ClipboardCheck size={11} />
                                  {carrier.assignedProbill}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  className="cs-btn cs-btn--sm"
                                  onClick={() => {
                                    setAssign({ laneId: lane.id, carrier })
                                    setProbill('')
                                  }}
                                >
                                  Assign probill
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )
        })}

        {visible.length === 0 && (
          <div className="cs-empty">
            <Search size={18} />
            <strong>No lane matches that search</strong>
            <p>Clear the filter, or run a new lane search from the button above.</p>
          </div>
        )}
      </div>

      <CarrierHoverCard hover={hover} />

      {panelOpen && (
        <div className="cs-panel" role="presentation" onClick={() => setPanelOpen(false)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="New lane search"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <strong>New lane search</strong>
                <p>Match carriers on city pairs, then contact them from the results.</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setPanelOpen(false)}>
                <X size={14} />
              </button>
            </header>

            <div className="cs-panel__body">
              <label className="cs-field">
                <span>From city</span>
                <input
                  list="cs-cities"
                  value={origin}
                  onChange={(event) => setOrigin(event.target.value)}
                />
              </label>
              <label className="cs-field">
                <span>To city</span>
                <input
                  list="cs-cities"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                />
              </label>
              <datalist id="cs-cities">
                {laneCities.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>

              <div className="cs-field__row">
                <label className="cs-field">
                  <span>Equipment</span>
                  <select
                    value={equipment}
                    onChange={(event) => setEquipment(event.target.value)}
                  >
                    {equipmentOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="cs-field">
                  <span>Deadhead radius</span>
                  <select value={radius} onChange={(event) => setRadius(event.target.value)}>
                    {['50', '75', '100', '150', '250'].map((option) => (
                      <option key={option} value={option}>
                        {option} mi
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="cs-field">
                <span>Pickup date</span>
                <input
                  type="date"
                  value={pickup}
                  onChange={(event) => setPickup(event.target.value)}
                />
              </label>

              <div className="cs-field">
                <span>Look in</span>
                <div className="cs-sources">
                  {sourceOptions.map((source) => (
                    <button
                      key={source}
                      type="button"
                      className={cn('cs-source-pick', sources.includes(source) && 'is-on')}
                      aria-pressed={sources.includes(source)}
                      onClick={() => toggleSource(source)}
                    >
                      <Check size={11} />
                      {source}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <footer>
              <button
                type="button"
                className="cs-btn"
                onClick={() => setPanelOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cs-btn cs-btn--primary"
                disabled={!origin || !destination}
                onClick={runSearch}
              >
                <Send size={13} />
                Search carriers
              </button>
            </footer>
          </aside>
        </div>
      )}

      {assign && (
        <div className="cs-modal" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="cs-assign-title">
            <header>
              <div>
                <strong id="cs-assign-title">Assign probill</strong>
                <p>Attach an open load to {assign.carrier.name}.</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setAssign(null)}>
                <X size={14} />
              </button>
            </header>

            <label className="cs-field">
              <span>Open probill</span>
              <select value={probill} onChange={(event) => setProbill(event.target.value)}>
                <option value="">Select a probill…</option>
                {openLoads.map((load) => (
                  <option key={load.id} value={load.id}>
                    {load.id} · {load.origin} → {load.destination} · {load.equipment}
                  </option>
                ))}
              </select>
            </label>

            {probill && (
              <div className="cs-modal__load">
                {(() => {
                  const load = openLoads.find((item) => item.id === probill)
                  if (!load) return null
                  return (
                    <>
                      <span>
                        <MapPin size={11} />
                        {load.origin} <ArrowRight size={10} /> {load.destination}
                      </span>
                      <span>
                        {load.pickupDate} · {load.miles} mi · {load.equipment} · {load.customer}
                      </span>
                    </>
                  )
                })()}
              </div>
            )}

            <footer>
              <button type="button" className="cs-btn" onClick={() => setAssign(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="cs-btn cs-btn--primary"
                disabled={!probill}
                onClick={confirmAssign}
              >
                <ClipboardCheck size={13} />
                Assign probill
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  )
}
