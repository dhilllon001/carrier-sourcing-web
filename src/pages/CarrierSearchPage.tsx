import { useMemo, useState, type CSSProperties } from 'react'
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
  ShieldCheck,
  Star,
  Truck,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { reportLoads } from '@/data/report'
import {
  bestLane,
  laneCities,
  laneMatchScore,
  searchCarriers,
  type SearchCarrier,
} from '@/data/carrierSearch'
import {
  driverAssignmentSubStatusColors,
  getColorByType,
  transitStatusColors,
} from '@/data/statusColors'

type Props = {
  search: string
  onOpenCarrier: (id: string) => void
}

type SearchTab = 'search' | 'sourced'
type Channel = 'email' | 'whatsapp'
type Outreach = {
  carrierId: string
  channels: Channel[]
  sentAt: string
  quotedRate?: number
  assignedProbill?: string
}

const seedOutreach: Outreach[] = [
  {
    carrierId: 'c-roadlink',
    channels: ['email', 'whatsapp'],
    sentAt: 'Today · 9:42 AM',
    quotedRate: 735,
    assignedProbill: '11436778',
  },
  {
    carrierId: 'c-ontario',
    channels: ['email'],
    sentAt: 'Today · 9:42 AM',
  },
]

const statusStyle = (hex: string) =>
  ({
    '--csearch-status': hex,
    '--csearch-status-bg': `${hex}14`,
    '--csearch-status-line': `${hex}38`,
  }) as CSSProperties

function StatusPill({
  label,
  type,
}: {
  label: string
  type: 'Pending' | 'Assigned' | 'Completed' | 'Sent for Confirmation'
}) {
  const palette =
    type === 'Sent for Confirmation'
      ? driverAssignmentSubStatusColors
      : transitStatusColors
  const color = getColorByType(palette, type)
  return (
    <span
      className="csearch-status"
      style={statusStyle(color?.hex ?? '#64748B')}
    >
      <i />
      {label}
    </span>
  )
}

function CarrierName({
  carrier,
  onOpen,
}: {
  carrier: SearchCarrier
  onOpen: () => void
}) {
  return (
    <button type="button" className="csearch-carrier" onClick={onOpen}>
      <span className="csearch-carrier__avatar">
        {carrier.name
          .split(' ')
          .slice(0, 2)
          .map((word) => word[0])
          .join('')}
      </span>
      <span>
        <strong>{carrier.name}</strong>
        <em>
          MC {carrier.mc} · {carrier.city}, {carrier.state}
        </em>
      </span>
    </button>
  )
}

export function CarrierSearchPage({ search, onOpenCarrier }: Props) {
  const [tab, setTab] = useState<SearchTab>('search')
  const [origin, setOrigin] = useState('Brampton, ON')
  const [destination, setDestination] = useState('Woodstock, ON')
  const [equipment, setEquipment] = useState('DRY-VAN')
  const [localQuery, setLocalQuery] = useState('')
  const [selected, setSelected] = useState<string[]>(['c-micra', 'c-roadlink'])
  const [channels, setChannels] = useState<Channel[]>(['email', 'whatsapp'])
  const [rate, setRate] = useState('725')
  const [outreach, setOutreach] = useState<Outreach[]>(seedOutreach)
  const [notice, setNotice] = useState<string | null>(null)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [probill, setProbill] = useState('')

  const q = (search || localQuery).trim().toLowerCase()
  const results = useMemo(
    () =>
      searchCarriers
        .map((carrier) => ({
          carrier,
          score: laneMatchScore(carrier, origin, destination),
          lane: bestLane(carrier, origin, destination),
        }))
        .filter(({ carrier, score }) => {
          if (score < 45) return false
          if (!equipment || carrier.equipment.includes(equipment)) {
            return (
              !q ||
              carrier.name.toLowerCase().includes(q) ||
              carrier.mc.includes(q) ||
              carrier.city.toLowerCase().includes(q) ||
              carrier.contactName.toLowerCase().includes(q)
            )
          }
          return false
        })
        .sort((a, b) => b.score - a.score),
    [destination, equipment, origin, q]
  )

  const sourced = useMemo(
    () =>
      outreach
        .map((item) => ({
          item,
          carrier: searchCarriers.find((carrier) => carrier.id === item.carrierId),
        }))
        .filter(
          (row): row is { item: Outreach; carrier: SearchCarrier } =>
            Boolean(row.carrier)
        ),
    [outreach]
  )

  const assignmentCarrier = searchCarriers.find(
    (carrier) => carrier.id === assigningId
  )
  const availableLoads = reportLoads.filter((load) => load.status === 'NeedCarrier')

  const toggleSelected = (id: string) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((carrierId) => carrierId !== id)
        : [...current, id]
    )

  const toggleChannel = (channel: Channel) =>
    setChannels((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel]
    )

  const sendBlast = () => {
    if (!selected.length || !channels.length) return
    const stamp = `Today · ${new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date())}`

    setOutreach((current) => {
      const untouched = current.filter((item) => !selected.includes(item.carrierId))
      const sent = selected.map((carrierId) => {
        const carrier = searchCarriers.find((item) => item.id === carrierId)
        const usableChannels = channels.filter(
          (channel) => channel !== 'whatsapp' || carrier?.whatsapp
        )
        return { carrierId, channels: usableChannels, sentAt: stamp }
      })
      return [...sent, ...untouched]
    })

    const whatsappCount = selected.filter(
      (id) => searchCarriers.find((carrier) => carrier.id === id)?.whatsapp
    ).length
    const channelSummary = [
      channels.includes('email') ? `${selected.length} emails` : null,
      channels.includes('whatsapp') ? `${whatsappCount} WhatsApp messages` : null,
    ]
      .filter(Boolean)
      .join(' and ')
    setNotice(`${channelSummary} sent for ${origin} → ${destination}.`)
    setSelected([])
  }

  const assignProbill = () => {
    if (!assigningId || !probill) return
    setOutreach((current) =>
      current.map((item) =>
        item.carrierId === assigningId
          ? { ...item, assignedProbill: probill }
          : item
      )
    )
    const carrier = searchCarriers.find((item) => item.id === assigningId)
    setNotice(`Probill ${probill} assigned to ${carrier?.name ?? 'carrier'}.`)
    setAssigningId(null)
    setProbill('')
  }

  return (
    <div className="csearch-page">
      <header className="csearch-intro">
        <div>
          <span className="csearch-eyebrow">Carrier sales workspace</span>
          <h2>Find the right carrier for a lane</h2>
          <p>
            Search lane history, contact the best matches, then assign a probill
            when a carrier confirms.
          </p>
        </div>
        <div className="csearch-intro__steps" aria-label="Workflow">
          <span className={cn(tab === 'search' && 'is-on')}>
            <b>1</b> Find and contact
          </span>
          <ChevronRight size={13} />
          <span className={cn(tab === 'sourced' && 'is-on')}>
            <b>2</b> Assign probill
          </span>
        </div>
      </header>

      <nav className="csearch-tabs">
        <button
          type="button"
          className={cn(tab === 'search' && 'is-on')}
          onClick={() => setTab('search')}
        >
          <Search size={13} />
          Search carriers
        </button>
        <button
          type="button"
          className={cn(tab === 'sourced' && 'is-on')}
          onClick={() => setTab('sourced')}
        >
          <Users size={13} />
          Sourced carriers
          <i>{sourced.length}</i>
        </button>
      </nav>

      {notice && (
        <div className="csearch-notice">
          <CheckCircle2 size={14} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
            <X size={13} />
          </button>
        </div>
      )}

      {tab === 'search' ? (
        <>
          <section className="csearch-lane">
            <div className="csearch-lane__title">
              <span>
                <MapPin size={14} />
              </span>
              <div>
                <strong>Search by lane</strong>
                <p>City-level matching uses your carrier and team history first.</p>
              </div>
            </div>
            <label className="csearch-field">
              <span>From city</span>
              <input
                list="csearch-cities"
                value={origin}
                onChange={(event) => setOrigin(event.target.value)}
              />
            </label>
            <span className="csearch-arrow">
              <ArrowRight size={14} />
            </span>
            <label className="csearch-field">
              <span>To city</span>
              <input
                list="csearch-cities"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
              />
            </label>
            <label className="csearch-field is-equipment">
              <span>Equipment</span>
              <select
                value={equipment}
                onChange={(event) => setEquipment(event.target.value)}
              >
                <option>DRY-VAN</option>
                <option>REEFER</option>
                <option>FLATBED</option>
                <option>POWER-ONLY</option>
              </select>
            </label>
            <button type="button" className="csearch-btn csearch-btn--primary">
              <Search size={13} />
              Search carriers
            </button>
            <datalist id="csearch-cities">
              {laneCities.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </section>

          <div className="csearch-summary">
            <span>
              <strong>{results.length}</strong> carrier matches
            </span>
            <span>
              <Star size={11} fill="currentColor" />
              {results.filter((result) => result.carrier.relationship === 'Preferred').length}{' '}
              preferred
            </span>
            <span>
              <MessageCircle size={11} />
              {results.filter((result) => result.carrier.whatsapp).length} available on WhatsApp
            </span>
            <label className="csearch-filter">
              <Search size={12} />
              <input
                value={localQuery}
                onChange={(event) => setLocalQuery(event.target.value)}
                placeholder="Filter carrier or MC…"
              />
            </label>
          </div>

          <div className="csearch-workspace">
            <section className="csearch-tablewrap">
              <table className="csearch-table">
                <thead>
                  <tr>
                    <th className="csearch-check">
                      <input
                        type="checkbox"
                        aria-label="Select all matches"
                        checked={
                          results.length > 0 &&
                          results.every(({ carrier }) => selected.includes(carrier.id))
                        }
                        onChange={(event) =>
                          setSelected(
                            event.target.checked
                              ? results.map(({ carrier }) => carrier.id)
                              : []
                          )
                        }
                      />
                    </th>
                    <th>Carrier</th>
                    <th>Lane match</th>
                    <th>Relationship</th>
                    <th>Performance</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(({ carrier, score, lane }) => (
                    <tr
                      key={carrier.id}
                      className={cn(selected.includes(carrier.id) && 'is-selected')}
                    >
                      <td className="csearch-check">
                        <input
                          type="checkbox"
                          checked={selected.includes(carrier.id)}
                          onChange={() => toggleSelected(carrier.id)}
                          aria-label={`Select ${carrier.name}`}
                        />
                      </td>
                      <td>
                        <CarrierName
                          carrier={carrier}
                          onOpen={() => onOpenCarrier(carrier.id)}
                        />
                      </td>
                      <td>
                        <div className="csearch-match">
                          <span className={cn(score >= 85 ? 'is-high' : 'is-medium')}>
                            {score}% match
                          </span>
                          <strong>
                            {lane.origin} <ArrowRight size={10} /> {lane.destination}
                          </strong>
                          <em>
                            {lane.loads} loads · last at ${lane.lastRate.toLocaleString()}
                          </em>
                        </div>
                      </td>
                      <td>
                        <div className="csearch-relationship">
                          <span className={cn(carrier.relationship === 'Preferred' && 'is-preferred')}>
                            {carrier.relationship === 'Preferred' && (
                              <Star size={9} fill="currentColor" />
                            )}
                            {carrier.relationship}
                          </span>
                          <em>{carrier.source}</em>
                        </div>
                      </td>
                      <td>
                        <div className="csearch-performance">
                          <span>
                            <strong>{carrier.acceptance}%</strong>
                            <em>accept</em>
                          </span>
                          <span>
                            <strong>{carrier.onTime}</strong>
                            <em>on time</em>
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="csearch-contact">
                          <strong>{carrier.contactName}</strong>
                          <span>
                            <Mail size={10} /> Email
                            {carrier.whatsapp && (
                              <>
                                <i />
                                <MessageCircle size={10} /> WhatsApp
                              </>
                            )}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <aside className="csearch-outreach">
              <div className="csearch-outreach__head">
                <span>
                  <Send size={14} />
                </span>
                <div>
                  <strong>Contact selected carriers</strong>
                  <p>{selected.length} selected from this lane search</p>
                </div>
              </div>

              <div className="csearch-selected">
                {selected.length ? (
                  selected.map((id) => {
                    const carrier = searchCarriers.find((item) => item.id === id)
                    if (!carrier) return null
                    return (
                      <div key={id}>
                        <span>{carrier.name}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${carrier.name}`}
                          onClick={() => toggleSelected(id)}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    )
                  })
                ) : (
                  <p>Select carriers from the table to build an outreach list.</p>
                )}
              </div>

              <div className="csearch-outreach__section">
                <span className="csearch-label">Send by</span>
                <button
                  type="button"
                  className={cn('csearch-channel', channels.includes('email') && 'is-on')}
                  onClick={() => toggleChannel('email')}
                >
                  <span><Mail size={13} /></span>
                  <strong>Email</strong>
                  <Check size={12} />
                </button>
                <button
                  type="button"
                  className={cn('csearch-channel', channels.includes('whatsapp') && 'is-on')}
                  onClick={() => toggleChannel('whatsapp')}
                >
                  <span><MessageCircle size={13} /></span>
                  <strong>WhatsApp</strong>
                  <Check size={12} />
                </button>
              </div>

              <label className="csearch-rate">
                <span>Offer rate</span>
                <div>
                  <i>$</i>
                  <input
                    inputMode="decimal"
                    value={rate}
                    onChange={(event) => setRate(event.target.value)}
                  />
                  <em>USD</em>
                </div>
              </label>

              <div className="csearch-message">
                <span className="csearch-label">Message preview</span>
                <p>
                  Available for {origin} to {destination}? {equipment}, offer ${rate || '—'}.
                  Reply with your best rate and ETA.
                </p>
              </div>

              <button
                type="button"
                className="csearch-btn csearch-btn--primary csearch-outreach__send"
                disabled={!selected.length || !channels.length}
                onClick={sendBlast}
              >
                <Send size={13} />
                Send to {selected.length || 0} carriers
              </button>
              <p className="csearch-outreach__foot">
                Carriers contacted here move to Sourced carriers, where a probill can be
                assigned after confirmation.
              </p>
            </aside>
          </div>
        </>
      ) : (
        <section className="csearch-sourced">
          <header>
            <div>
              <h3>Sourced carriers</h3>
              <p>
                Track replies from your outreach and connect a confirmed carrier to an open
                probill.
              </p>
            </div>
            <span>{sourced.length} carriers contacted</span>
          </header>
          <div className="csearch-tablewrap">
            <table className="csearch-table csearch-table--sourced">
              <thead>
                <tr>
                  <th>Carrier</th>
                  <th>Lane</th>
                  <th>Outreach</th>
                  <th>Response</th>
                  <th>Quote</th>
                  <th>Probill</th>
                  <th aria-label="Action" />
                </tr>
              </thead>
              <tbody>
                {sourced.map(({ item, carrier }) => {
                  const lane = bestLane(carrier, origin, destination)
                  return (
                    <tr key={carrier.id}>
                      <td>
                        <CarrierName
                          carrier={carrier}
                          onOpen={() => onOpenCarrier(carrier.id)}
                        />
                      </td>
                      <td>
                        <div className="csearch-route">
                          <strong>{lane.origin}</strong>
                          <ArrowRight size={10} />
                          <strong>{lane.destination}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="csearch-sent">
                          <span>
                            {item.channels.includes('email') && <Mail size={11} />}
                            {item.channels.includes('whatsapp') && (
                              <MessageCircle size={11} />
                            )}
                          </span>
                          <em>{item.sentAt}</em>
                        </div>
                      </td>
                      <td>
                        {item.quotedRate ? (
                          <StatusPill label="Rate received" type="Completed" />
                        ) : (
                          <StatusPill label="Awaiting reply" type="Pending" />
                        )}
                      </td>
                      <td className="csearch-quote">
                        {item.quotedRate ? `$${item.quotedRate.toLocaleString()}` : '—'}
                      </td>
                      <td>
                        {item.assignedProbill ? (
                          <StatusPill
                            label={`Probill ${item.assignedProbill}`}
                            type="Assigned"
                          />
                        ) : (
                          <span className="csearch-muted">Not assigned</span>
                        )}
                      </td>
                      <td className="csearch-action">
                        <button
                          type="button"
                          className={cn(
                            'csearch-btn',
                            item.assignedProbill
                              ? 'csearch-btn--quiet'
                              : 'csearch-btn--primary'
                          )}
                          onClick={() => {
                            if (!item.assignedProbill) {
                              setAssigningId(carrier.id)
                              setProbill('')
                            }
                          }}
                        >
                          {item.assignedProbill ? (
                            <>
                              <ClipboardCheck size={12} /> Assigned
                            </>
                          ) : (
                            <>
                              Assign probill <ChevronRight size={12} />
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {assignmentCarrier && (
        <div className="csearch-modal" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="assign-title">
            <header>
              <span><Truck size={16} /></span>
              <div>
                <h3 id="assign-title">Assign probill</h3>
                <p>Connect a ready load to {assignmentCarrier.name}.</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setAssigningId(null)}
              >
                <X size={14} />
              </button>
            </header>
            <div className="csearch-modal__carrier">
              <ShieldCheck size={14} />
              <span>
                <strong>{assignmentCarrier.name}</strong>
                <em>
                  {assignmentCarrier.acceptance}% acceptance · {assignmentCarrier.onTime}{' '}
                  on time · insurance {assignmentCarrier.insurance.toLowerCase()}
                </em>
              </span>
            </div>
            <label className="csearch-field">
              <span>Open probill</span>
              <select value={probill} onChange={(event) => setProbill(event.target.value)}>
                <option value="">Select a probill…</option>
                {availableLoads.map((load) => (
                  <option key={load.id} value={load.id}>
                    {load.id} · {load.origin} → {load.destination} · {load.equipment}
                  </option>
                ))}
              </select>
            </label>
            {probill && (
              <div className="csearch-modal__load">
                {(() => {
                  const load = availableLoads.find((item) => item.id === probill)
                  return load ? (
                    <>
                      <span>
                        <MapPin size={12} />
                        {load.origin} <ArrowRight size={10} /> {load.destination}
                      </span>
                      <span>
                        {load.pickupDate} · {load.miles} mi · {load.equipment}
                      </span>
                    </>
                  ) : null
                })()}
              </div>
            )}
            <footer>
              <button
                type="button"
                className="csearch-btn csearch-btn--quiet"
                onClick={() => setAssigningId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="csearch-btn csearch-btn--primary"
                disabled={!probill}
                onClick={assignProbill}
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
