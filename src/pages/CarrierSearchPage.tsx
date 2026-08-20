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
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { DomainIcon, type DomainIconName } from '@/components/icons/DomainIcons'
import { reportLoads } from '@/data/report'
import {
  buildLaneSearch,
  carrierConfidence,
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
import { useFavoriteCarriers } from '@/lib/favoriteCarriers'
import { useMyBookCarriers } from '@/lib/myBookCarriers'
import {
  CarrierHoverCard,
  ConfidenceCell,
  ContextMenu,
  useCarrierHover,
  useContextMenu,
  type MenuItem,
} from '@/components/carriers/searchParts'

type Props = {
  search: string
  onOpenCarrier?: (id: string) => void
  /** The New lane search button lives in the app header for this page. */
  panelOpen: boolean
  onPanelOpenChange: (open: boolean) => void
}

/** Board filters. Every one maps to a column a rep can already see. */
type Chip = 'fav' | 'high' | 'past' | 'open' | 'quoted' | 'insurance'

const CHIPS: { id: Chip; label: string; alert?: boolean; icon?: DomainIconName }[] = [
  { id: 'fav', label: 'Favourites', icon: 'favCarrier' },
  { id: 'high', label: 'High confidence' },
  { id: 'past', label: 'Used before', icon: 'pastCarrier' },
  { id: 'open', label: 'Not contacted' },
  { id: 'quoted', label: 'Has offer' },
  { id: 'insurance', label: 'Insurance', alert: true },
]

function formatReply(min: number) {
  if (min < 60) return `${Math.round(min)} min`
  const hours = Math.floor(min / 60)
  const rest = Math.round(min % 60)
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

function insuranceIssue(carrier: SearchCarrier) {
  return carrier.insurance === 'soon' || carrier.insurance === 'expired'
}

type Channel = 'email' | 'whatsapp'

type AssignTarget = { laneId: string; carrier: SearchCarrier }

const money = (value: number) => `$${value.toLocaleString()}`

let capacityRequestSequence = 1043

function createCapacityId() {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = String(now.getFullYear()).slice(-2)
  return `CAP-${day}${month}${year}-${capacityRequestSequence++}`
}

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

export function CarrierSearchPage({
  search,
  onOpenCarrier,
  panelOpen,
  onPanelOpenChange,
}: Props) {
  const [lanes, setLanes] = useState<LaneSearch[]>(seedLanes)
  const [openLanes, setOpenLanes] = useState<string[]>([seedLanes[0].id])
  const [chips, setChips] = useState<Chip[]>([])
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [assign, setAssign] = useState<AssignTarget | null>(null)
  const [probill, setProbill] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const { hover, bind } = useCarrierHover()
  const { menu, open: openMenu, close: closeMenu } = useContextMenu()
  const { isFavorite, toggle: toggleFav } = useFavoriteCarriers()
  const { isInBook, add: addToBook } = useMyBookCarriers()

  const [origin, setOrigin] = useState('Brampton, ON')
  const [destination, setDestination] = useState('Woodstock, ON')
  const [equipment, setEquipment] = useState('DRY-VAN')
  const [pickup, setPickup] = useState('2026-08-20')
  const [delivery, setDelivery] = useState('2026-08-20')
  const [radius, setRadius] = useState('150')
  const [sources, setSources] = useState<SearchSource[]>(['PAST', 'DAT'])

  const q = search.trim().toLowerCase()

  const searched = useMemo(() => {
    if (!q) return lanes
    return lanes
      .map((lane) => {
        const laneHit =
          lane.origin.toLowerCase().includes(q) ||
          lane.destination.toLowerCase().includes(q) ||
          lane.equipment.toLowerCase().includes(q) ||
          (lane.capacityId ?? '').toLowerCase().includes(q)
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

  const totals = useMemo(() => {
    const all = searched.flatMap((lane) => lane.carriers)
    const quotes = all
      .filter((carrier) => carrier.offerAmount)
      .map((carrier) => carrier.offerAmount as number)
    const replies = all
      .map((carrier) => carrier.repliedInMin)
      .filter((min): min is number => typeof min === 'number')
    const covered = all.filter(
      (carrier) => carrier.offer === 'Awarded' || Boolean(carrier.assignedProbill)
    ).length
    const need = searched.reduce((sum, lane) => sum + lane.need, 0)
    return {
      lanes: searched.length,
      carriers: all.length,
      fav: all.filter((carrier) => isFavorite(carrier.id)).length,
      high: all.filter((carrier) => carrierConfidence(carrier).level === 'High').length,
      past: all.filter((carrier) => carrier.loads > 0).length,
      open: all.filter((carrier) => carrier.offer === 'Not sent').length,
      quoted: all.filter((carrier) => carrier.offer === 'Quoted' || carrier.offer === 'Awarded')
        .length,
      covered,
      need,
      insurance: all.filter(insuranceIssue).length,
      avgReply: replies.length
        ? Math.round(replies.reduce((sum, min) => sum + min, 0) / replies.length)
        : undefined,
      best: quotes.length ? Math.min(...quotes) : undefined,
    }
  }, [searched, isFavorite])

  const keep = (carrier: SearchCarrier) => {
    if (chips.includes('fav') && !isFavorite(carrier.id)) return false
    if (chips.includes('high') && carrierConfidence(carrier).level !== 'High') return false
    if (chips.includes('past') && carrier.loads === 0) return false
    if (chips.includes('open') && carrier.offer !== 'Not sent') return false
    if (chips.includes('quoted') && carrier.offer !== 'Quoted' && carrier.offer !== 'Awarded')
      return false
    if (chips.includes('insurance') && !insuranceIssue(carrier)) return false
    return true
  }

  const visible = useMemo(() => {
    if (!chips.length) return searched
    return searched
      .map((lane) => ({ ...lane, carriers: lane.carriers.filter(keep) }))
      .filter((lane) => lane.carriers.length > 0)
    /* keep() reads chips and favourites, both listed below */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searched, chips, isFavorite])

  const chipCount = (id: Chip) => totals[id]

  const toggleChip = (id: Chip) =>
    setChips((current) =>
      current.includes(id) ? current.filter((chip) => chip !== id) : [...current, id]
    )

  const openLoads = reportLoads.filter((load) => load.status === 'NeedCarrier')

  /** One lane at a time, so the open lane is the only thing competing for attention. */
  const toggleLane = (id: string) =>
    setOpenLanes((current) => (current.includes(id) ? [] : [id]))

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
      delivery: new Date(`${delivery}T12:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      radius: Number(radius) || 100,
      sources: sources.length ? sources : ['PAST', 'DAT'],
    })
    setLanes((current) => [lane, ...current])
    setOpenLanes((current) => [lane.id, ...current])
    onPanelOpenChange(false)
    setNotice(`${lane.carriers.length} carriers found for ${origin} → ${destination}.`)
  }

  const blast = (lane: LaneSearch, channel: Channel, ids = selected[lane.id] ?? []) => {
    if (!ids.length) return
    const stamp = todayStamp()
    const capacityId = lane.capacityId ?? createCapacityId()
    setLanes((current) =>
      current.map((item) =>
        item.id !== lane.id
          ? item
          : {
              ...item,
              capacityId,
              capacityCreatedAt:
                item.capacityCreatedAt ?? `${stamp.date.replace(', 2026', '')} · ${stamp.time}`,
              carriers: item.carriers.map((carrier) =>
                ids.includes(carrier.id) && carrier.offer === 'Not sent'
                  ? { ...carrier, offer: 'Sent', updated: stamp.date, updatedTime: stamp.time }
                  : carrier
              ),
            }
      )
    )
    setSelected((current) =>
      JSON.stringify(ids) === JSON.stringify(current[lane.id] ?? [])
        ? { ...current, [lane.id]: [] }
        : current
    )
    setNotice(
      `${channel === 'email' ? 'Email' : 'WhatsApp'} blast sent to ${ids.length} carriers on ${
        lane.origin
      } → ${lane.destination}. Capacity ID ${capacityId}.`
    )
  }

  const award = (laneId: string, carrier: SearchCarrier) => {
    const stamp = todayStamp()
    setLanes((current) =>
      current.map((lane) =>
        lane.id !== laneId
          ? lane
          : {
              ...lane,
              carriers: lane.carriers.map((item) =>
                item.id === carrier.id
                  ? { ...item, offer: 'Awarded', updated: stamp.date, updatedTime: stamp.time }
                  : item
              ),
            }
      )
    )
    setNotice(`Awarded to ${carrier.name}${carrier.offerAmount ? ` at ${money(carrier.offerAmount)}` : ''}.`)
  }

  const favOnLane = (lane: LaneSearch) => lane.carriers.filter((carrier) => isFavorite(carrier.id))

  const laneMenu = (lane: LaneSearch, open: boolean): MenuItem[] => {
    const favs = favOnLane(lane)
    const picked = selected[lane.id] ?? []
    return [
      {
        id: 'expand',
        label: open ? 'Collapse carriers' : 'Expand carriers',
        onSelect: () => toggleLane(lane.id),
      },
      { type: 'sep' },
      {
        id: 'blast-fav-email',
        label: 'Blast email to favourites',
        hint: favs.length ? `${favs.length}` : undefined,
        disabled: !favs.length,
        onSelect: () => blast(lane, 'email', favs.map((carrier) => carrier.id)),
      },
      {
        id: 'blast-fav-wa',
        label: 'Blast WhatsApp to favourites',
        hint: favs.length ? `${favs.length}` : undefined,
        disabled: !favs.length,
        onSelect: () => blast(lane, 'whatsapp', favs.map((carrier) => carrier.id)),
      },
      {
        id: 'blast-sel-email',
        label: 'Blast email to selected',
        hint: picked.length ? `${picked.length}` : undefined,
        disabled: !picked.length,
        onSelect: () => blast(lane, 'email'),
      },
      { type: 'sep' },
      {
        id: 'copy',
        label: 'Copy pickup → delivery',
        onSelect: () => {
          void navigator.clipboard?.writeText(`${lane.origin} → ${lane.destination}`)
          setNotice('Lane copied.')
        },
      },
    ]
  }

  const carrierMenu = (lane: LaneSearch, carrier: SearchCarrier): MenuItem[] => {
    const fav = isFavorite(carrier.id)
    const booked = isInBook(carrier.id)
    const items: MenuItem[] = [
      {
        id: 'open',
        label: 'Open carrier',
        onSelect: () => onOpenCarrier?.(carrier.id),
      },
      {
        id: 'fav',
        label: fav ? 'Remove from favourites' : 'Add to favourites',
        onSelect: () => {
          toggleFav(carrier.id)
          setNotice(fav ? `${carrier.name} removed from favourites.` : `${carrier.name} added to favourites.`)
        },
      },
      {
        id: 'book',
        label: booked ? 'Already in My carriers' : 'Add to My carriers',
        disabled: booked,
        onSelect: () => {
          addToBook(carrier.id)
          setNotice(`${carrier.name} added to My carriers.`)
        },
      },
      { type: 'sep' },
      {
        id: 'email',
        label: 'Blast email',
        onSelect: () => blast(lane, 'email', [carrier.id]),
      },
      {
        id: 'wa',
        label: 'Blast WhatsApp',
        disabled: !carrier.whatsapp && !carrier.contact,
        onSelect: () => blast(lane, 'whatsapp', [carrier.id]),
      },
    ]
    if (carrier.offer === 'Quoted') {
      items.push({
        id: 'award',
        label: `Award${carrier.offerAmount ? ` ${money(carrier.offerAmount)}` : ''}`,
        onSelect: () => award(lane.id, carrier),
      })
    }
    if (!carrier.assignedProbill) {
      items.push({
        id: 'assign',
        label: 'Assign probill',
        onSelect: () => {
          setAssign({ laneId: lane.id, carrier })
          setProbill('')
        },
      })
    }
    return items
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
      <div className="cs-status">
        <div className="cs-facts">
          <div className="cs-fact">
            <span>Lanes</span>
            <strong>{totals.lanes}</strong>
          </div>
          <div className="cs-fact">
            <span>Carriers</span>
            <strong>{totals.carriers}</strong>
          </div>
          <div className="cs-fact">
            <span>Best offer</span>
            <strong className="is-good">{totals.best ? money(totals.best) : '—'}</strong>
          </div>
          <div className="cs-fact">
            <span>Covered today</span>
            <strong
              className={cn(
                totals.covered >= totals.need && totals.need > 0 && 'is-good',
                totals.covered < totals.need && 'is-warn'
              )}
            >
              {totals.covered}/{totals.need}
            </strong>
          </div>
          <div className="cs-fact">
            <span>Avg reply</span>
            <strong>{totals.avgReply ? formatReply(totals.avgReply) : '—'}</strong>
          </div>
          <div className="cs-fact">
            <span>Waiting on reply</span>
            <strong className={cn(totals.open > 0 && 'is-warn')}>{totals.open}</strong>
          </div>
        </div>

        <div className="cs-chips" role="group" aria-label="Board filters">
          {CHIPS.map((chip) => {
            const on = chips.includes(chip.id)
            return (
              <button
                key={chip.id}
                type="button"
                className={cn(
                  'cs-fchip',
                  on && 'is-on',
                  chip.id === 'fav' && 'is-fav',
                  chip.alert && 'is-alert'
                )}
                aria-pressed={on}
                onClick={() => toggleChip(chip.id)}
              >
                {chip.icon && <DomainIcon name={chip.icon} size={14} />}
                {chip.label}
                <em>{chipCount(chip.id)}</em>
              </button>
            )
          })}
          {chips.length > 0 && (
            <button type="button" className="cs-fchip is-clear" onClick={() => setChips([])}>
              Clear
            </button>
          )}
        </div>
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

      <div className={cn('cs-lanes', openLanes.length > 0 && 'is-focused')}>
        {visible.length > 0 && (
          <div className="cs-lanerow cs-lanehead">
            <span />
            <span>Pickup lane</span>
            <span>Delivery lane</span>
            <span>Pickup</span>
            <span>Delivery</span>
            <span>Equipment</span>
            <span>Radius</span>
            <span className="cs-num">Carriers</span>
            <span className="cs-num">Used before</span>
            <span className="cs-num">High conf.</span>
            <span className="cs-num">Contacted</span>
            <span className="cs-num">Best rate</span>
            <span>Probill</span>
            <span>Capacity ID</span>
            <span className="cs-num">Searched</span>
          </div>
        )}

        {visible.map((lane) => {
          const open = openLanes.includes(lane.id)
          const stats = laneStats(lane)
          const picked = selected[lane.id] ?? []

          return (
            <section key={lane.id} className={cn('cs-lane', open && 'is-open')}>
              <button
                type="button"
                className="cs-lanerow cs-lane__head"
                aria-expanded={open}
                onClick={() => toggleLane(lane.id)}
                onContextMenu={(event) =>
                  openMenu(event, {
                    title: `${lane.origin} → ${lane.destination}`,
                    subtitle: `${lane.pickup} pickup · ${lane.delivery} delivery`,
                    items: laneMenu(lane, open),
                  })
                }
              >
                <ChevronRight size={14} className={cn('cs-caret', open && 'is-open')} />
                <span className="cs-lane__city">{lane.origin}</span>
                <span className="cs-lane__city">{lane.destination}</span>
                <span className="cs-lane__cell">{lane.pickup}</span>
                <span className="cs-lane__cell">{lane.delivery}</span>
                <span>
                  <span className="cs-chip">{lane.equipment}</span>
                </span>
                <span className="cs-lane__cell">{lane.radius} mi</span>
                <span className="cs-num cs-lane__val">{stats.total}</span>
                <span className="cs-num cs-lane__val">
                  {stats.past || <em className="cs-quiet">0</em>}
                </span>
                <span className="cs-num cs-lane__val">
                  {stats.strong || <em className="cs-quiet">0</em>}
                </span>
                <span className="cs-num cs-lane__val">
                  {stats.contacted || <em className="cs-quiet">0</em>}
                </span>
                <span className="cs-num cs-lane__val is-good">
                  {stats.bestQuote ? money(stats.bestQuote) : <em className="cs-quiet">—</em>}
                </span>
                <span>
                  {stats.assigned ? (
                    <span className="cs-probill">
                      <ClipboardCheck size={11} />
                      {stats.assigned.assignedProbill}
                    </span>
                  ) : (
                    <em className="cs-quiet">—</em>
                  )}
                </span>
                <span className={cn('cs-capacity', !lane.capacityId && 'is-pending')}>
                  {lane.capacityId ? (
                    <>
                      <strong>{lane.capacityId}</strong>
                      <em>{lane.capacityCreatedAt}</em>
                    </>
                  ) : (
                    <>
                      <strong>Not created</strong>
                      <em>Created on first send</em>
                    </>
                  )}
                </span>
                <span className="cs-num cs-lane__when">{lane.searchedAt}</span>
              </button>

              {open && (
                <div className="cs-lane__body">
                  <div className="cs-actions">
                    <div className="cs-actions__context">
                      <span>
                        {picked.length ? `${picked.length} selected` : 'Select carriers to contact'}
                      </span>
                      <em>
                        {lane.capacityId
                          ? `Capacity request ${lane.capacityId}`
                          : 'A capacity ID will be created on the first send'}
                      </em>
                    </div>
                    <button
                      type="button"
                      className="cs-btn"
                      disabled={!favOnLane(lane).length}
                      onClick={() =>
                        blast(
                          lane,
                          'email',
                          favOnLane(lane).map((carrier) => carrier.id)
                        )
                      }
                    >
                      <Mail size={12} />
                      Blast favourites
                    </button>
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
                            className={cn(
                              picked.includes(carrier.id) && 'is-selected',
                              isFavorite(carrier.id) && 'is-fav'
                            )}
                            onContextMenu={(event) =>
                              openMenu(event, {
                                title: carrier.name,
                                subtitle: `MC ${carrier.mc} · ${carrier.offer}`,
                                items: carrierMenu(lane, carrier),
                              })
                            }
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
                                {isFavorite(carrier.id) && (
                                  <em className="cs-favmark" title="Favourite">
                                    ★
                                  </em>
                                )}
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
                              <div className="cs-quick">
                                {carrier.offer === 'Quoted' && !carrier.assignedProbill && (
                                  <button
                                    type="button"
                                    className="cs-btn cs-btn--sm cs-btn--green"
                                    onClick={() => award(lane.id, carrier)}
                                  >
                                    Award
                                  </button>
                                )}
                                {carrier.assignedProbill ? (
                                  <span className="cs-probill">
                                    <ClipboardCheck size={11} />
                                    {carrier.assignedProbill}
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    className="cs-btn cs-btn--sm cs-btn--blue"
                                    onClick={() => {
                                      setAssign({ laneId: lane.id, carrier })
                                      setProbill('')
                                    }}
                                  >
                                    Assign
                                  </button>
                                )}
                              </div>
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
            <strong>
              {chips.length ? 'No carriers match those filters' : 'No lane matches that search'}
            </strong>
            <p>
              {chips.length
                ? 'Clear a filter above to widen the board.'
                : 'Clear the search, or run a new lane search from the header.'}
            </p>
          </div>
        )}
      </div>

      <CarrierHoverCard hover={menu ? null : hover} />
      <ContextMenu menu={menu} onClose={closeMenu} />

      {panelOpen && (
        <div className="cs-panel" role="presentation" onClick={() => onPanelOpenChange(false)}>
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
              <button type="button" aria-label="Close" onClick={() => onPanelOpenChange(false)}>
                <X size={14} />
              </button>
            </header>

            <div className="cs-panel__body">
              <label className="cs-field">
                <span>Pickup city</span>
                <input
                  list="cs-cities"
                  value={origin}
                  onChange={(event) => setOrigin(event.target.value)}
                />
              </label>
              <label className="cs-field">
                <span>Delivery city</span>
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

              <div className="cs-field__row">
                <label className="cs-field">
                  <span>Pickup date</span>
                  <input
                    type="date"
                    value={pickup}
                    onChange={(event) => setPickup(event.target.value)}
                  />
                </label>
                <label className="cs-field">
                  <span>Delivery date</span>
                  <input
                    type="date"
                    value={delivery}
                    onChange={(event) => setDelivery(event.target.value)}
                  />
                </label>
              </div>

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
                onClick={() => onPanelOpenChange(false)}
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
