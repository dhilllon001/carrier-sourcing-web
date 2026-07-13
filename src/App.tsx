import { useMemo, useState } from 'react'
import {
  LayoutGrid,
  Table2,
  Search,
  RefreshCw,
  Shield,
  Plus,
  X,
  Radar,
  Send,
  ChevronDown,
  Move,
} from 'lucide-react'
import {
  loads,
  modeCounts,
  statusCounts,
  stageNav,
  offers,
  offerStatusFilters,
  quickReplies,
} from './data'
import type { Load, LoadMode, LoadStatus, Stage } from './types'

type ViewMode = 'table' | 'cards'

function statusBadge(status: LoadStatus) {
  const map = {
    NeedCarrier: 'badge-need',
    Posted: 'badge-posted',
    Covered: 'badge-covered',
  } as const
  const label = status === 'NeedCarrier' ? 'Need carrier' : status
  return <span className={`badge ${map[status]}`}>{label}</span>
}

function rankBadge(rank?: 'BEST' | 'HIGH' | 'LOW') {
  if (!rank) return null
  const map = { BEST: 'badge-best', HIGH: 'badge-high', LOW: 'badge-low' } as const
  return <span className={`badge ${map[rank]}`}>{rank}</span>
}

export default function App() {
  const [view, setView] = useState<ViewMode>('table')
  const [modeFilter, setModeFilter] = useState<'All' | LoadMode>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | LoadStatus>('All')
  const [stageFilter, setStageFilter] = useState<'All' | Stage>('All')
  const [subFilter, setSubFilter] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [offersOpen, setOffersOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState(offers[0].id)
  const [offerStatus, setOfferStatus] = useState('All')
  const [showFabTip, setShowFabTip] = useState(true)
  const [message, setMessage] = useState('')

  const filtered = useMemo(() => {
    return loads.filter((load) => {
      if (modeFilter !== 'All' && load.mode !== modeFilter) return false
      if (statusFilter !== 'All' && load.status !== statusFilter) return false
      if (stageFilter !== 'All' && load.stage !== stageFilter) return false
      if (subFilter && load.subStage !== subFilter) return false
      if (query) {
        const q = query.toLowerCase()
        const hay = `${load.id} ${load.po} ${load.customer} ${load.equipment} ${load.origin} ${load.destination}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [modeFilter, statusFilter, stageFilter, subFilter, query])

  const selectedCarrier = offers.find((o) => o.id === selectedOffer) ?? offers[0]
  const offersLoad = loads.find((l) => l.id === '11402376') ?? loads[2]

  function openOffers(load?: Load) {
    if (load && load.subStage === 'Offers & Bids') {
      setOffersOpen(true)
      return
    }
    setOffersOpen(true)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-mark">CS</div>
          <div className="brand-name">Carrier Sourcing</div>
        </div>

        <label className="search">
          <Search size={16} strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search probills, PO number, customer, equipment…"
          />
        </label>

        <div className="header-actions">
          <button type="button" className="btn">
            Quick lane search
          </button>
          <div className="view-toggle" role="group" aria-label="View mode">
            <button
              type="button"
              className={view === 'table' ? 'active' : ''}
              onClick={() => setView('table')}
            >
              <Table2 size={14} strokeWidth={1.75} />
              Table
            </button>
            <button
              type="button"
              className={view === 'cards' ? 'active' : ''}
              onClick={() => setView('cards')}
            >
              <LayoutGrid size={14} strokeWidth={1.75} />
              Cards
            </button>
          </div>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="CMT">
            <Shield size={16} strokeWidth={1.75} />
          </button>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Refresh">
            <RefreshCw size={16} strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <div className="filter-bar">
        <div className="filter-group">
          <span className="filter-label">Mode</span>
          <div className="chips">
            {(Object.keys(modeCounts) as Array<keyof typeof modeCounts>).map((key) => (
              <button
                key={key}
                type="button"
                className={`chip ${modeFilter === key ? 'active' : ''}`}
                onClick={() => setModeFilter(key)}
              >
                {key}
                <span className="count">{modeCounts[key].toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">Status</span>
          <div className="chips">
            {(Object.keys(statusCounts) as Array<keyof typeof statusCounts>).map((key) => (
              <button
                key={key}
                type="button"
                className={`chip ${statusFilter === key ? 'active' : ''}`}
                onClick={() => setStatusFilter(key)}
              >
                {key === 'NeedCarrier' ? 'Need carrier' : key}
                <span className="count">{statusCounts[key].toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-title">
            <span>Lifecycle</span>
            <ChevronDown size={14} />
          </div>
          <button
            type="button"
            className={`nav-all ${stageFilter === 'All' && !subFilter ? 'active' : ''}`}
            onClick={() => {
              setStageFilter('All')
              setSubFilter(null)
            }}
          >
            <span>All stages</span>
            <span>8,672</span>
          </button>

          {stageNav.map((block, index) => (
            <div key={block.stage} className="stage-block">
              <button
                type="button"
                className={`stage-head ${stageFilter === block.stage && !subFilter ? 'active' : ''}`}
                onClick={() => {
                  setStageFilter(block.stage)
                  setSubFilter(null)
                }}
              >
                <span className="stage-num">{String(index + 1).padStart(2, '0')}</span>
                <span>{block.stage}</span>
                <span className="stage-count">{block.count.toLocaleString()}</span>
              </button>
              <div className="sub-nav">
                {block.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className={subFilter === item.label ? 'active' : ''}
                    onClick={() => {
                      setStageFilter(block.stage)
                      setSubFilter(item.label)
                      if (item.label === 'Offers & Bids') setOffersOpen(true)
                    }}
                  >
                    <span>{item.label}</span>
                    <span className="stage-count">{item.count}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <main className="main">
          {view === 'table' ? (
            <div className="table-wrap">
              <div className="table-card">
                <table className="loads">
                  <thead>
                    <tr>
                      <th>Mode</th>
                      <th>Tags</th>
                      <th>Probill</th>
                      <th>Stage</th>
                      <th>Status</th>
                      <th>Customer</th>
                      <th>Equipment</th>
                      <th>Route</th>
                      <th>Rate</th>
                      <th>Broker</th>
                      <th>Team</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((load) => (
                      <tr key={load.id} onDoubleClick={() => openOffers(load)}>
                        <td>
                          <div className="mode-cell">
                            <span className="mode-name">{load.mode.toUpperCase()}</span>
                            <span className="mode-detail">{load.modeDetail}</span>
                          </div>
                        </td>
                        <td>
                          <button type="button" className="tag-btn">
                            <Plus size={12} />
                            Tag
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="id-link"
                            onClick={() => openOffers(load)}
                          >
                            {load.id}
                          </button>
                          <span className="po-sub">{load.po}</span>
                        </td>
                        <td>
                          <div className="stage-cell">
                            <span className="stage-main">{load.stage}</span>
                            <span className="stage-sub">{load.subStage}</span>
                          </div>
                        </td>
                        <td>{statusBadge(load.status)}</td>
                        <td>{load.customer}</td>
                        <td>
                          <span className="mode-pill">{load.equipment}</span>
                        </td>
                        <td>
                          <div className="route-cell">
                            <div className="route-line">
                              <span className="route-city">{load.origin}</span>
                              <div className="route-mid">
                                <div className="route-dots" />
                                <span className="route-miles">{load.miles.toLocaleString()} mi</span>
                              </div>
                              <span className="route-city right">{load.destination}</span>
                            </div>
                            <div className="route-times">
                              <span>{load.pickup}</span>
                              <span>{load.delivery}</span>
                            </div>
                          </div>
                        </td>
                        <td className={load.rate ? '' : 'muted'}>{load.rate ?? '—'}</td>
                        <td className={load.broker ? '' : 'muted'}>{load.broker ?? '—'}</td>
                        <td className={load.team ? '' : 'muted'}>{load.team ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="kanban">
              {stageNav.map((block, index) => {
                const cards = filtered.filter((l) => l.stage === block.stage)
                return (
                  <section key={block.stage} className="kanban-col">
                    <div className="kanban-head">
                      <span className="stage-num">{String(index + 1).padStart(2, '0')}</span>
                      <h3>{block.stage}</h3>
                      <span className="stage-count">{cards.length}</span>
                    </div>
                    <div className="kanban-body">
                      {cards.map((load) => (
                        <button
                          key={load.id}
                          type="button"
                          className="load-card"
                          onClick={() => openOffers(load)}
                        >
                          <div className="load-card-top">
                            <div>
                              <div className="load-card-id">{load.id}</div>
                              <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                                <span className="mode-pill">{load.mode.toUpperCase()}</span>
                                {statusBadge(load.status)}
                              </div>
                            </div>
                            <span className="load-card-meta">
                              {load.rate ?? load.equipment}
                            </span>
                          </div>
                          <div className="load-card-customer">{load.customer}</div>
                          <div className="route-line">
                            <span className="route-city">{load.origin}</span>
                            <div className="route-mid">
                              <div className="route-dots" />
                              <span className="route-miles">{load.miles.toLocaleString()} mi</span>
                            </div>
                            <span className="route-city right">{load.destination}</span>
                          </div>
                          <div className="route-times">
                            <span>{load.pickup}</span>
                            <span>{load.delivery}</span>
                          </div>
                        </button>
                      ))}
                      {cards.length === 0 && (
                        <div className="muted" style={{ padding: 12, fontSize: 12.5 }}>
                          No loads in this stage
                        </div>
                      )}
                    </div>
                  </section>
                )
              })}
            </div>
          )}

          <div className="main-footer">
            <span>
              {filtered.length.toLocaleString()} load{filtered.length === 1 ? '' : 's'}
              {filtered.length !== loads.length ? ' (filtered)' : ''}
            </span>
            <span>Prototype · mock data</span>
          </div>
        </main>
      </div>

      <div className="fab-wrap">
        {showFabTip && (
          <div className="fab-tip">
            <strong>Offers & Bids · 253 total</strong>
            <ul>
              <li>Drag to reposition</li>
              <li>Click to open</li>
            </ul>
          </div>
        )}
        <button
          type="button"
          className="fab"
          aria-label="Lane radar"
          onClick={() => {
            setShowFabTip(false)
            setOffersOpen(true)
          }}
          onMouseEnter={() => setShowFabTip(true)}
        >
          <Radar size={22} strokeWidth={1.75} />
          <span className="fab-badge">99+</span>
        </button>
      </div>

      {offersOpen && (
        <div className="overlay" onClick={() => setOffersOpen(false)}>
          <div
            className="offers-panel"
            role="dialog"
            aria-label="Offers and bids"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="offers-header">
              <h2>Offers & Bids</h2>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                aria-label="Close"
                onClick={() => setOffersOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="offers-filters">
              {offerStatusFilters.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  className={`chip ${offerStatus === f.label ? 'active' : ''}`}
                  onClick={() => setOfferStatus(f.label)}
                >
                  {f.label}
                  <span className="count">{f.count}</span>
                </button>
              ))}
              <span className="offers-meta">All offers · 25 loaded</span>
            </div>

            <div className="offers-body">
              <div className="carrier-list">
                <label className="carrier-search">
                  <Search size={15} strokeWidth={1.75} />
                  <input placeholder="Search carrier, MC#, DOT# or phone…" />
                </label>
                <div className="carrier-scroll">
                  {offers.map((offer) => (
                    <button
                      key={offer.id}
                      type="button"
                      className={`carrier-card ${selectedOffer === offer.id ? 'selected' : ''}`}
                      onClick={() => setSelectedOffer(offer.id)}
                    >
                      <div className="carrier-top">
                        <div>
                          <div className="carrier-name">{offer.name}</div>
                          <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                            {rankBadge(offer.rank)}
                          </div>
                        </div>
                        <span className="carrier-status">{offer.status}</span>
                      </div>
                      <div className="carrier-grid">
                        <div className="carrier-field">
                          <label>MC#</label>
                          <span>{offer.mc}</span>
                        </div>
                        <div className="carrier-field">
                          <label>DOT#</label>
                          <span>{offer.dot}</span>
                        </div>
                        <div className="carrier-field">
                          <label>Bid</label>
                          <span className={offer.vsTargetTone === 'good' ? 'bid-good' : 'bid-warn'}>
                            {offer.bid}
                          </span>
                        </div>
                        <div className="carrier-field">
                          <label>Target</label>
                          <span className={offer.vsTargetTone === 'good' ? 'bid-good' : 'bid-warn'}>
                            {offer.vsTarget}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="detail-pane">
                <div className="detail-top">
                  <div className="detail-route-bar">
                    <span className="mono">P {offersLoad.id}</span>
                    <span>·</span>
                    <span>{offersLoad.po}</span>
                    <span>·</span>
                    <span>
                      {offersLoad.origin} → {offersLoad.destination}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--accent)' }}>
                        {selectedCarrier.name}
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {selectedCarrier.mc}
                      </div>
                    </div>
                    <span className="badge badge-neutral">{selectedCarrier.status}</span>
                  </div>
                </div>

                <div className="offer-box">
                  <div className="offer-box-top">
                    <span className="offer-box-id"># 10000020</span>
                    <span className="offer-box-price">{selectedCarrier.bid}</span>
                  </div>
                  <div className="offer-box-title">CGL&apos;s Load Offer</div>
                  <div className="offer-legs">
                    <div className="offer-leg">
                      <label>Pickup</label>
                      <strong>Charger Brampton Terminal · No trailers</strong>
                      <span>{offersLoad.pickup}</span>
                    </div>
                    <div className="offer-leg">
                      <label>Delivery</label>
                      <strong>Charger Brampton Terminal · No trailers</strong>
                      <span>{offersLoad.delivery}</span>
                    </div>
                  </div>
                </div>

                <div className="chat-area">
                  <div className="chat-thread">
                    <div className="chat-bubble">
                      Following up on this lane — can you confirm availability for the pickup window?
                      <div className="chat-meta">
                        <span>Sukhdeep Dhillon</span>
                        <span>11:38</span>
                        <Move size={11} />
                      </div>
                    </div>
                  </div>

                  <div className="quick-replies">
                    {quickReplies.map((reply) => (
                      <button
                        key={reply}
                        type="button"
                        onClick={() => setMessage(reply)}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>

                  <div className="composer">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message…"
                    />
                    <button type="button" className="send-btn" aria-label="Send">
                      <Send size={15} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
