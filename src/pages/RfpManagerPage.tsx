import { useMemo, useState, type ReactNode } from 'react'
import {
  ArrowUpRight,
  Banknote,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Download,
  FileSpreadsheet,
  Flag,
  Gauge,
  Layers,
  Minus,
  Percent,
  Plus,
  Search,
  Send,
  TriangleAlert,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Tip } from '@/components/Tip'
import { RfpLaneDrawer } from '@/components/rfp/RfpLaneDrawer'
import {
  annualMargin,
  annualRevenue,
  boardTotals,
  compactCount,
  compactMoney,
  confidenceBand,
  confidenceLabel,
  isClosed,
  isOpen,
  isPriced,
  laneConfidence,
  laneFlags,
  laneMargin,
  lowConfidence,
  money,
  needsLook,
  rateForMargin,
  rfpFlagHex,
  rfpStatusHex,
  rfps as rfpBook,
  rfpTotals,
  signed,
  vsIncumbent,
  type ConfidenceBand,
  type Rfp,
  type RfpLane,
  type RfpStatus,
} from '@/data/rfpManager'

type Props = { search: string }

type BoardTab = 'all' | 'open' | 'submitted' | 'closed'
type LaneFilter = 'all' | 'flagged' | 'thin' | 'unpriced' | 'manual'
type MarginBand = 'under' | 'at' | 'over' | 'none'
type Scope = 'all' | 'filtered' | 'selected'

const BOARD_TABS: Array<{ id: BoardTab; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'closed', label: 'Closed' },
]

const CONF_ROWS: Array<{ id: ConfidenceBand; label: string; range: string }> = [
  { id: 'high', label: 'High', range: '85+' },
  { id: 'medium', label: 'Workable', range: '50–84' },
  { id: 'thin', label: 'Thin', range: 'under 50' },
]

const MARGIN_COLS: Array<{ id: MarginBand; label: string; short: string }> = [
  { id: 'under', label: 'Under target', short: 'Under' },
  { id: 'at', label: 'At target', short: 'At' },
  { id: 'over', label: 'Over target', short: 'Over' },
  { id: 'none', label: 'Not priced', short: 'Unpriced' },
]

type CellTone = 'empty' | 'good' | 'watch' | 'danger' | 'idle'

/** Colour a cell by what sitting there means, not just by how many lanes. */
function cellTone(conf: ConfidenceBand, band: MarginBand, count: number): CellTone {
  if (count === 0) return 'empty'
  if (isDanger(conf, band)) return 'danger'
  if (isWatch(conf, band)) return 'watch'
  if (band === 'none') return 'idle'
  return 'good'
}

function marginBand(lane: RfpLane, target: number): MarginBand {
  const margin = laneMargin(lane)
  if (margin === null || lane.noBid) return 'none'
  if (margin < target - 1.5) return 'under'
  if (margin > target + 1.5) return 'over'
  return 'at'
}

const laneFilterHint: Record<LaneFilter, string> = {
  all: 'Every lane in the file.',
  flagged: 'Off target, above the incumbent, or priced on a wide cost spread.',
  thin: 'Confidence under 50, so our cost is a guess more than a record.',
  unpriced: 'Still waiting on a rate, and not marked no bid.',
  manual: 'Rates typed by hand. Bulk apply never touches these.',
}

const isDanger = (conf: ConfidenceBand, band: MarginBand) => conf === 'thin' && band === 'under'

const isWatch = (conf: ConfidenceBand, band: MarginBand) =>
  (conf === 'thin' && band !== 'none') || (conf === 'medium' && band === 'under')

/** 'Aug 29, 2026' → '08-29', the way the bid calendar reads. */
function shortDate(due: string) {
  const parsed = new Date(due)
  if (Number.isNaN(parsed.getTime())) return due
  return `${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
}

export function RfpManagerPage({ search }: Props) {
  const [book, setBook] = useState<Rfp[]>(rfpBook)
  const [openId, setOpenId] = useState<string | null>(null)
  const [tab, setTab] = useState<BoardTab>('all')
  const [localQ, setLocalQ] = useState('')
  const [laneFilter, setLaneFilter] = useState<LaneFilter>('all')
  const [cell, setCell] = useState<{ conf: ConfidenceBand; band: MarginBand } | null>(null)
  const [scope, setScope] = useState<Scope>('all')
  const [selected, setSelected] = useState<string[]>([])
  const [riskOpen, setRiskOpen] = useState(true)
  const [walkId, setWalkId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const active = book.find((rfp) => rfp.id === openId) ?? null
  const board = boardTotals(book)
  const query = (search || localQ).trim().toLowerCase()

  const say = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2600)
  }

  const patch = (id: string, apply: (rfp: Rfp) => Rfp) =>
    setBook((prev) => prev.map((rfp) => (rfp.id === id ? apply(rfp) : rfp)))

  const patchLane = (rfpId: string, laneId: string, apply: (lane: RfpLane) => RfpLane) =>
    patch(rfpId, (rfp) => ({
      ...rfp,
      lanes: rfp.lanes.map((lane) => (lane.id === laneId ? apply(lane) : lane)),
    }))

  /* ── board list ── */

  const rows = useMemo(() => {
    return book.filter((rfp) => {
      if (tab === 'open' && !isOpen(rfp)) return false
      if (tab === 'submitted' && rfp.status !== 'Submitted') return false
      if (tab === 'closed' && !isClosed(rfp)) return false
      if (!query) return true
      return [rfp.id, rfp.customer, rfp.title, rfp.file, rfp.owner]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [book, query, tab])

  const tabCount = (id: BoardTab) =>
    book.filter((rfp) =>
      id === 'open'
        ? isOpen(rfp)
        : id === 'submitted'
          ? rfp.status === 'Submitted'
          : id === 'closed'
            ? isClosed(rfp)
            : true
    ).length

  if (!active) {
    return (
      <div className="rfp-page">
        <section className="rfp-hero">
          <div className="rfp-hero__intro">
            <span className="rfp-kicker">Pricing · bids · rounds</span>
            <strong>Every customer bid file, priced from our own cost record</strong>
            <p>
              Upload the customer sheet, walk the lanes with our history behind each one, and send
              the round back in their own format.
            </p>
            <button type="button" className="rfp-btn rfp-btn--primary" onClick={() => say('Drop a customer bid file to start a new RFP.')}>
              <Upload size={14} /> Upload RFP
            </button>
          </div>
          <Fact
            icon={Layers}
            label="Open RFPs"
            value={String(board.open)}
            note="being priced"
            hint="Files in draft or pricing that have not gone back to the customer yet."
          />
          <Fact
            icon={Gauge}
            label="Lanes to price"
            value={String(board.toPrice)}
            note="across open files"
            hint="Lanes on open files with no rate yet, excluding anything marked no bid."
          />
          <Fact
            icon={CalendarClock}
            label="Due in 5 days"
            value={String(board.dueSoon)}
            note="customer deadline"
            tone={board.dueSoon > 0 ? 'warn' : undefined}
            hint="Open files whose customer deadline lands inside the next five days."
          />
          <Fact
            icon={Percent}
            label="Win rate"
            value={board.winRate === null ? '—' : `${board.winRate}%`}
            note="last 12 decisions"
            tone="good"
            hint="Share of the last twelve decided files that came back awarded."
          />
        </section>

        <section className="rfp-bar">
          <label className="rfp-search">
            <Search size={14} />
            <input
              value={localQ}
              onChange={(event) => setLocalQ(event.target.value)}
              placeholder="Customer, RFP, owner…"
            />
          </label>

          <div className="rfp-pills" role="tablist" aria-label="RFP status">
            {BOARD_TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                className={cn(tab === item.id && 'is-active')}
                onClick={() => setTab(item.id)}
              >
                {item.label} <b>{tabCount(item.id)}</b>
              </button>
            ))}
          </div>

          <span className="rfp-bar__count">
            {rows.length} of {book.length} RFPs
          </span>
          <button type="button" className="rfp-btn" onClick={() => say('Drop a customer bid file to start a new RFP.')}>
            <Upload size={14} /> Upload RFP
          </button>
        </section>

        <section className="rfp-card">
          <div className="rfp-grid rfp-grid--board">
            <div className="rfp-grid__head">
              <span>RFP</span>
              <span>Customer / file</span>
              <Head tip="Which bid round we are on, and how many have already gone back.">
                Round
              </Head>
              <Head num tip="Lane rows in the customer sheet, with the annual volume behind them.">
                Lanes
              </Head>
              <Head tip="Share of biddable lanes that carry a rate. No-bid lanes are excluded.">
                Priced
              </Head>
              <Head num tip="Revenue-weighted margin across every priced lane on the file.">
                Avg margin
              </Head>
              <Head num tip="Days left until the customer deadline, with the calendar date.">
                Due
              </Head>
              <Head tip="Where the file sits: draft, pricing, submitted, awarded or lost.">
                Status
              </Head>
              <span />
            </div>

            {rows.map((rfp) => {
              const totals = rfpTotals(rfp)
              const sent = rfp.rounds.filter((round) => round.sentOn).length
              return (
                <button
                  key={rfp.id}
                  type="button"
                  className="rfp-grid__row"
                  onClick={() => {
                    setOpenId(rfp.id)
                    setLaneFilter('all')
                    setCell(null)
                    setSelected([])
                  }}
                >
                  <span className="rfp-cell--id">
                    <b>{rfp.id}</b>
                    <em>{rfp.owner}</em>
                  </span>
                  <span className="rfp-cell--name">
                    <b>{rfp.customer}</b>
                    <em>
                      <FileSpreadsheet size={11} /> {rfp.file}
                    </em>
                  </span>
                  <span className="rfp-cell--round">
                    <i>{rfp.rounds[rfp.rounds.length - 1]?.label ?? 'Round 1'}</i>
                    {sent > 0 ? <em>{sent} sent</em> : null}
                  </span>
                  <span className="is-num rfp-cell--stack">
                    <b>{totals.lanes}</b>
                    <em>{compactCount(totals.loads)} loads/yr</em>
                  </span>
                  <span className="rfp-cell--priced">
                    <div>
                      <b className={cn(totals.pricedPct === 100 && 'is-good')}>
                        {totals.pricedPct}
                      </b>
                      <Bar value={totals.pricedPct} tone={totals.pricedPct === 100 ? 'good' : 'idle'} />
                    </div>
                    <em>
                      {totals.priced}/{totals.lanes} lanes
                    </em>
                  </span>
                  <span className="is-num rfp-cell--margin">
                    {totals.marginPct === null ? '—' : `${totals.marginPct.toFixed(1)}%`}
                  </span>
                  <span className="is-num rfp-cell--due">
                    <b className={cn(rfp.dueIn !== null && rfp.dueIn <= 5 && 'is-warn')}>
                      {rfp.dueIn === null ? 'closed' : `${rfp.dueIn}d`}
                    </b>
                    <em>{shortDate(rfp.due)}</em>
                  </span>
                  <span className="rfp-cell--status">
                    <StatusChip status={rfp.status} />
                    {totals.flagged > 0 ? (
                      <em className="is-warn">{totals.flagged} flagged</em>
                    ) : null}
                  </span>
                  <span className="rfp-cell--go">
                    <ChevronRight size={15} />
                  </span>
                </button>
              )
            })}

            {rows.length === 0 ? (
              <p className="rfp-empty">No RFP matches this filter.</p>
            ) : null}
          </div>
        </section>

        {toast ? <div className="rfp-toast">{toast}</div> : null}
      </div>
    )
  }

  /* ── one RFP: the pricing walk ── */

  const target = active.targetMargin
  const totals = rfpTotals(active)
  const lastRound = active.rounds[active.rounds.length - 1]
  const roundNo = active.rounds.length

  const shown = active.lanes.filter((lane) => {
    if (laneFilter === 'flagged' && !needsLook(lane, target)) return false
    if (laneFilter === 'thin' && !lowConfidence(lane)) return false
    if (laneFilter === 'unpriced' && (isPriced(lane) || lane.noBid)) return false
    if (laneFilter === 'manual' && !lane.manual) return false
    if (cell) {
      if (confidenceBand(laneConfidence(lane)) !== cell.conf) return false
      if (marginBand(lane, target) !== cell.band) return false
    }
    if (!query) return true
    return [lane.origin, lane.destination, lane.equipment, lane.laneId]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  const walkIndex = shown.findIndex((lane) => lane.id === walkId)
  const walkLane = walkIndex >= 0 ? shown[walkIndex] : null

  const laneFilters: Array<{ id: LaneFilter; label: string; count: number }> = [
    { id: 'all', label: 'All', count: active.lanes.length },
    { id: 'flagged', label: 'Flagged', count: totals.flagged },
    { id: 'thin', label: 'Low confidence', count: totals.thin },
    {
      id: 'unpriced',
      label: 'Unpriced',
      count: active.lanes.filter((lane) => !isPriced(lane) && !lane.noBid).length,
    },
    { id: 'manual', label: 'Manual', count: totals.manual },
  ]

  const scopePool =
    scope === 'selected'
      ? active.lanes.filter((lane) => selected.includes(lane.id))
      : scope === 'filtered'
        ? shown
        : active.lanes

  const applyMargin = () => {
    const touch = scopePool.filter((lane) => !lane.manual && !lane.noBid)
    const skipped = scopePool.length - touch.length
    const ids = new Set(touch.map((lane) => lane.id))
    patch(active.id, (rfp) => ({
      ...rfp,
      status: rfp.status === 'Draft' ? 'Pricing' : rfp.status,
      lanes: rfp.lanes.map((lane) =>
        ids.has(lane.id)
          ? { ...lane, rate: Math.round(rateForMargin(lane.ourCost, target)) }
          : lane
      ),
    }))
    say(
      `${touch.length} lane${touch.length === 1 ? '' : 's'} priced at ${target}%${
        skipped ? ` · ${skipped} left alone` : ''
      }`
    )
  }

  const setTarget = (next: number) =>
    patch(active.id, (rfp) => ({
      ...rfp,
      targetMargin: Math.min(40, Math.max(2, Math.round(next * 10) / 10)),
    }))

  const setRate = (laneId: string, rate: number | null) =>
    patchLane(active.id, laneId, (lane) => ({ ...lane, rate, manual: rate !== null }))

  const toggleNoBid = (laneId: string) =>
    patchLane(active.id, laneId, (lane) => ({ ...lane, noBid: !lane.noBid }))

  const addRound = () => {
    patch(active.id, (rfp) => ({
      ...rfp,
      status: 'Pricing',
      rounds: [
        ...rfp.rounds,
        { id: `r${rfp.rounds.length + 1}`, label: `R${rfp.rounds.length + 1}`, sentOn: null, margin: null },
      ],
    }))
    say(`Round ${roundNo + 1} opened — rates carried over from the last round.`)
  }

  const submitRound = () => {
    patch(active.id, (rfp) => ({
      ...rfp,
      status: 'Submitted',
      rounds: rfp.rounds.map((round, index) =>
        index === rfp.rounds.length - 1
          ? { ...round, sentOn: 'Aug 22', margin: rfpTotals(rfp).marginPct ?? round.margin }
          : round
      ),
    }))
    say(`Round ${roundNo} sent to ${active.customer} in their own format.`)
  }

  const dangerCount = active.lanes.filter((lane) =>
    isDanger(confidenceBand(laneConfidence(lane)), marginBand(lane, target))
  ).length

  return (
    <div className="rfp-page">
      <header className="rfp-head">
        <button type="button" className="rfp-back" onClick={() => setOpenId(null)}>
          <ChevronLeft size={14} /> All RFPs
        </button>

        <div className="rfp-head__title">
          <h2>
            {active.customer} <i>·</i> {active.title}
          </h2>
          <em>
            {active.id} · {active.file} · {active.owner}
          </em>
        </div>

        <StatusChip status={active.status} />

        <div className="rfp-head__rounds">
          {active.rounds.map((round) => (
            <span key={round.id} className={cn('rfp-round', !round.sentOn && 'is-open')}>
              {round.label}
              <b>{round.margin === null ? 'pricing' : `${round.margin.toFixed(1)}%`}</b>
            </span>
          ))}
          <button type="button" className="rfp-btn rfp-btn--sm" onClick={addRound}>
            <Plus size={13} /> Round {roundNo + 1}
          </button>
        </div>

        <div className="rfp-head__actions">
          <button
            type="button"
            className="rfp-btn"
            onClick={() => say(`${active.file} rebuilt with our rates in their column order.`)}
          >
            <Download size={14} /> Export
          </button>
          <button type="button" className="rfp-btn rfp-btn--primary" onClick={submitRound}>
            <Send size={14} /> Submit {lastRound?.label ?? 'round'}
          </button>
        </div>
      </header>

      <section className="rfp-stats">
        <Stat
          label="Lanes"
          value={String(totals.lanes)}
          note={`${totals.noBid} no-bid`}
          hint="Every lane row in the customer sheet, including the ones we chose not to bid."
        />
        <Stat
          label="Priced"
          value={String(totals.priced)}
          note={`of ${totals.lanes - totals.noBid} to price`}
          tone={totals.pricedPct === 100 ? 'good' : undefined}
          hint="Lanes that carry a rate right now. No-bid lanes are left out of the count."
        />
        <Stat
          label="Annual revenue"
          value={compactMoney(totals.revenue)}
          note={`${compactMoney(totals.margin)} margin`}
          hint="Annual loads times our rate on every priced lane, with the margin that leaves."
        />
        <Stat
          label="Avg margin"
          value={totals.marginPct === null ? '—' : `${totals.marginPct.toFixed(1)}%`}
          note={`target ${target}%`}
          tone={
            totals.marginPct === null
              ? undefined
              : totals.marginPct >= target - 0.5
                ? 'good'
                : 'warn'
          }
          hint="Revenue-weighted margin across the file, so the big lanes carry more weight."
        />
        <Stat
          label="Flagged"
          value={String(totals.flagged)}
          note="need a look"
          tone={totals.flagged > 0 ? 'warn' : undefined}
          hint="Lanes off target, above the incumbent rate, or built on a wide cost spread."
        />
        <Stat
          label="Low confidence"
          value={String(totals.thin)}
          note="thin history"
          tone={totals.thin > 0 ? 'warn' : undefined}
          hint="Lanes scoring under 50, where we have too little history to trust the cost."
        />
        <p className="rfp-stats__note">
          <CircleCheckBig size={13} />
          {totals.manual} manual override{totals.manual === 1 ? '' : 's'} protected from bulk apply
        </p>
      </section>

      <section className="rfp-tools">
        <Tip
          className="rfp-target"
          tip={
            <>
              <b>Target margin</b>
              <em>
                The margin bulk pricing aims for. Lanes land in the risk map against this number.
              </em>
            </>
          }
        >
          <span>Target margin</span>
          <button type="button" aria-label="Lower target" onClick={() => setTarget(target - 0.5)}>
            <Minus size={13} />
          </button>
          <b>{target}%</b>
          <button type="button" aria-label="Raise target" onClick={() => setTarget(target + 0.5)}>
            <Plus size={13} />
          </button>
        </Tip>

        <div className="rfp-scope" role="group" aria-label="Apply to">
          <Tip tip="Price every lane on the file.">
            <button
              type="button"
              className={cn(scope === 'all' && 'is-active')}
              onClick={() => setScope('all')}
            >
              All {active.lanes.length}
            </button>
          </Tip>
          <Tip tip="Price only the lanes the filters and risk map are showing.">
            <button
              type="button"
              className={cn(scope === 'filtered' && 'is-active')}
              onClick={() => setScope('filtered')}
            >
              Filtered {shown.length}
            </button>
          </Tip>
          <Tip tip="Price only the lanes you ticked in the table.">
            <button
              type="button"
              className={cn(scope === 'selected' && 'is-active')}
              onClick={() => setScope('selected')}
            >
              Selected {selected.length}
            </button>
          </Tip>
        </div>

        <Tip
          tip={
            <>
              <b>
                Price {scopePool.length} lane{scopePool.length === 1 ? '' : 's'} at {target}%
              </b>
              <em>Manual overrides and no-bid lanes are left exactly as they are.</em>
            </>
          }
        >
          <button
            type="button"
            className="rfp-btn rfp-btn--accent"
            disabled={scopePool.length === 0}
            onClick={applyMargin}
          >
            <Percent size={13} /> Apply margin
          </button>
        </Tip>

        <div className="rfp-pills rfp-pills--lane">
          {laneFilters.map((item) => (
            <Tip
              key={item.id}
              tip={
                <>
                  <b>
                    {item.label} · {item.count} lane{item.count === 1 ? '' : 's'}
                  </b>
                  <em>{laneFilterHint[item.id]}</em>
                </>
              }
            >
              <button
                type="button"
                className={cn(laneFilter === item.id && 'is-active')}
                onClick={() => {
                  setLaneFilter(item.id)
                  setCell(null)
                }}
              >
                {item.label} <b>{item.count}</b>
              </button>
            </Tip>
          ))}
        </div>

        <span className="rfp-tools__count">
          {shown.length} of {active.lanes.length} lanes
        </span>
      </section>

      <section className={cn('rfp-risk', !riskOpen && 'is-closed')}>
        <button type="button" className="rfp-risk__head" onClick={() => setRiskOpen((v) => !v)}>
          <Gauge size={14} />
          <strong>Margin × confidence risk map</strong>
          <em className={dangerCount ? 'is-warn' : undefined}>
            {dangerCount
              ? `${dangerCount} lane${dangerCount === 1 ? '' : 's'} in the danger cells`
              : 'no lanes in the danger cells'}
          </em>
          <ChevronDown size={15} className={cn('rfp-risk__caret', riskOpen && 'is-open')} />
        </button>

        {riskOpen ? (
          <>
            <div className="rfp-map">
              <span className="rfp-map__corner">
                Confidence <i>/</i> margin
              </span>
              {MARGIN_COLS.map((col) => (
                <span key={col.id} className="rfp-map__col">
                  {col.label}
                </span>
              ))}

              {CONF_ROWS.map((row) => (
                <div className="contents" key={row.id}>
                  <span className="rfp-map__row">
                    <b>{row.label}</b>
                    <em>{row.range}</em>
                  </span>
                  {MARGIN_COLS.map((col) => {
                    const lanes = active.lanes.filter(
                      (lane) =>
                        confidenceBand(laneConfidence(lane)) === row.id &&
                        marginBand(lane, target) === col.id
                    )
                    const on = cell?.conf === row.id && cell?.band === col.id
                    const tone = cellTone(row.id, col.id, lanes.length)
                    const share = lanes.length / Math.max(1, active.lanes.length)
                    return (
                      <Tip
                        key={col.id}
                        block
                        className="rfp-map__slot"
                        tip={
                          <>
                            <b>
                              {row.label} confidence · {col.label.toLowerCase()}
                            </b>
                            <em>
                              {lanes.length
                                ? `${lanes.length} of ${active.lanes.length} lanes${
                                    tone === 'danger'
                                      ? ' — thin history priced under target, the riskiest place to be.'
                                      : tone === 'watch'
                                        ? ' — worth a second look before you send.'
                                        : tone === 'idle'
                                          ? ' — still waiting on a rate.'
                                          : ' — priced on history we trust.'
                                  }`
                                : 'Nothing sits here.'}
                            </em>
                            {lanes.length ? <em>Click to filter the table to this cell.</em> : null}
                          </>
                        }
                      >
                        <button
                          type="button"
                          data-col={col.short}
                          disabled={lanes.length === 0}
                          style={{ ['--fill' as string]: share.toFixed(3) }}
                          className={cn('rfp-map__cell', `is-${tone}`, on && 'is-on')}
                          onClick={() => {
                            setCell(on ? null : { conf: row.id, band: col.id })
                            setLaneFilter('all')
                          }}
                        >
                          <b>{lanes.length || '–'}</b>
                          {lanes.length ? <em>{Math.round(share * 100)}%</em> : null}
                        </button>
                      </Tip>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="rfp-map__legend">
              {(
                [
                  ['good', 'Priced on solid history'],
                  ['watch', 'Watch before you send'],
                  ['danger', 'Thin history, under target'],
                  ['idle', 'Not priced yet'],
                ] as Array<[CellTone, string]>
              ).map(([tone, label]) => (
                <span key={tone} className={`is-${tone}`}>
                  <i />
                  {label}
                </span>
              ))}
              <em>
                {cell
                  ? 'Table filtered to the selected cell — click it again to clear.'
                  : 'Click a cell to filter the lane table below.'}
              </em>
            </div>
          </>
        ) : null}
      </section>

      <section className="rfp-card">
        <div className="rfp-grid rfp-grid--lanes">
          <div className="rfp-grid__head">
            <span>
              <input
                type="checkbox"
                aria-label="Select all shown lanes"
                checked={shown.length > 0 && shown.every((lane) => selected.includes(lane.id))}
                onChange={(event) =>
                  setSelected(event.target.checked ? shown.map((lane) => lane.id) : [])
                }
              />
            </span>
            <span>Lane</span>
            <Head num tip="Loads a year on this lane, taken straight from the customer sheet.">
              Volume
            </Head>
            <Head num tip="What it costs us to move the load, and where that number came from.">
              Our cost
            </Head>
            <Head tip="How much history sits behind our cost: loads, recency, carriers and source.">
              Confidence
            </Head>
            <Head num tip="The rate we bid. Typing here marks the lane as a manual override.">
              Our rate
            </Head>
            <Head num tip="Margin our rate leaves against our cost, per load and as a percentage.">
              Margin
            </Head>
            <Head num tip="Our rate against the rate the customer is paying today, where they gave it.">
              vs incumbent
            </Head>
            <Head tip="Anything worth a second look before this lane goes back.">Flags</Head>
            <span />
          </div>

          {shown.map((lane) => {
            const score = laneConfidence(lane)
            const band = confidenceBand(score)
            const margin = laneMargin(lane)
            const vs = vsIncumbent(lane)
            const flags = laneFlags(lane, target)
            const picked = selected.includes(lane.id)
            return (
              <div
                key={lane.id}
                className={cn(
                  'rfp-grid__row',
                  picked && 'is-picked',
                  lane.noBid && 'is-nobid',
                  walkId === lane.id && 'is-open'
                )}
              >
                <span>
                  <input
                    type="checkbox"
                    aria-label={`Select ${lane.origin} to ${lane.destination}`}
                    checked={picked}
                    onChange={() =>
                      setSelected((prev) =>
                        picked ? prev.filter((id) => id !== lane.id) : [...prev, lane.id]
                      )
                    }
                  />
                </span>

                <span className="rfp-cell--lane">
                  <b>
                    {lane.origin} <ChevronRight size={12} /> {lane.destination}
                  </b>
                  <em>
                    row {lane.row} · {lane.miles.toLocaleString()} mi · {lane.equipment}
                  </em>
                </span>

                <span className="is-num rfp-cell--stack">
                  <b>{lane.annualLoads}</b>
                  <em>loads/yr</em>
                </span>

                <span className="is-num rfp-cell--stack">
                  <b>{money(lane.ourCost)}</b>
                  <em>{lane.costSource}</em>
                </span>

                <Tip
                  block
                  className="rfp-cell--conf"
                  tip={
                    <>
                      <b>
                        {score} · {confidenceLabel[band]}
                      </b>
                      <em>
                        {lane.history.loads} loads over {lane.history.months} months,{' '}
                        {lane.history.carriers} carriers, last run {lane.history.lastRun.toLowerCase()}
                        , cost from {lane.costSource.toLowerCase()}.
                      </em>
                      <em>Open the lane to see the full score breakdown.</em>
                    </>
                  }
                >
                  <div>
                    <b className={`is-${band}`}>{score}</b>
                    <Bar value={score} tone={band === 'thin' ? 'warn' : band === 'medium' ? 'idle' : 'good'} />
                  </div>
                  <em>
                    {lane.history.loads} loads · {lane.history.carriers} carriers
                  </em>
                </Tip>

                <span className="is-num">
                  <input
                    className="rfp-rate"
                    inputMode="decimal"
                    aria-label={`Rate for ${lane.origin} to ${lane.destination}`}
                    value={lane.rate ?? ''}
                    placeholder="—"
                    onChange={(event) => {
                      const next = Number(event.target.value.replace(/[^0-9.]/g, ''))
                      setRate(lane.id, Number.isFinite(next) && next > 0 ? next : null)
                    }}
                  />
                </span>

                <span className="is-num rfp-cell--stack">
                  <b
                    className={cn(
                      margin !== null && margin < target - 1.5 && 'is-warn',
                      margin !== null && margin >= target - 1.5 && 'is-good'
                    )}
                  >
                    {margin === null ? '—' : `${margin.toFixed(1)}%`}
                  </b>
                  <em>{lane.rate ? `${money(lane.rate - lane.ourCost)}/load` : 'not priced'}</em>
                </span>

                <span className="is-num rfp-cell--stack">
                  <b className={cn(vs !== null && vs > 0 && 'is-warn', vs !== null && vs <= 0 && 'is-good')}>
                    {vs === null ? 'not given' : signed(vs)}
                  </b>
                  <em>{lane.incumbent ? money(lane.incumbent) : '—'}</em>
                </span>

                <Tip
                  block
                  className="rfp-cell--flags"
                  tip={
                    <>
                      <b>
                        {flags.length} flag{flags.length === 1 ? '' : 's'} on this lane
                      </b>
                      <em>{flags.map((flag) => flag.label).join(' · ')}</em>
                    </>
                  }
                >
                  {flags.slice(0, 2).map((flag) => (
                    <i key={flag.label} style={{ ['--tone' as string]: rfpFlagHex[flag.tone] }}>
                      {flag.label}
                    </i>
                  ))}
                  {flags.length > 2 ? <i className="is-more">+{flags.length - 2}</i> : null}
                </Tip>

                <button
                  type="button"
                  className="rfp-cell--go"
                  aria-label="Open lane"
                  onClick={() => setWalkId(lane.id)}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )
          })}

          {shown.length === 0 ? (
            <p className="rfp-empty">
              No lane matches this filter.{' '}
              <button
                type="button"
                onClick={() => {
                  setLaneFilter('all')
                  setCell(null)
                }}
              >
                Clear filters
              </button>
            </p>
          ) : null}
        </div>
      </section>

      <section className="rfp-foot">
        <div className="rfp-foot__block">
          <span>
            <Banknote size={13} /> Annual revenue at these rates
          </span>
          <strong>{compactMoney(totals.revenue)}</strong>
          <em>{compactMoney(totals.margin)} margin · {compactCount(totals.loads)} loads/yr</em>
        </div>
        <div className="rfp-foot__block">
          <span>
            <TriangleAlert size={13} /> Before you send
          </span>
          <strong>
            {totals.flagged + (totals.lanes - totals.noBid - totals.priced)} open item
            {totals.flagged + (totals.lanes - totals.noBid - totals.priced) === 1 ? '' : 's'}
          </strong>
          <em>
            {totals.lanes - totals.noBid - totals.priced} unpriced · {totals.flagged} flagged ·{' '}
            {totals.thin} thin history
          </em>
        </div>
        <div className="rfp-foot__block">
          <span>
            <Flag size={13} /> Biggest lane in the file
          </span>
          {(() => {
            const top = [...active.lanes].sort(
              (a, b) => annualRevenue(b) - annualRevenue(a) || b.annualLoads - a.annualLoads
            )[0]
            return (
              <>
                <strong>
                  {top.origin} → {top.destination}
                </strong>
                <em>
                  {top.annualLoads} loads/yr ·{' '}
                  {top.rate ? `${compactMoney(annualMargin(top))} margin` : 'not priced yet'}
                </em>
              </>
            )
          })()}
        </div>
        <button
          type="button"
          className="rfp-foot__link"
          onClick={() => say('Carrier capacity opens with this file’s lanes pre-loaded.')}
        >
          Find capacity for these lanes <ArrowUpRight size={13} />
        </button>
      </section>

      {walkLane ? (
        <RfpLaneDrawer
          rfp={active}
          lane={walkLane}
          index={walkIndex}
          total={shown.length}
          onClose={() => setWalkId(null)}
          onStep={(delta) => setWalkId(shown[walkIndex + delta]?.id ?? walkLane.id)}
          onRate={(rate) => setRate(walkLane.id, rate)}
          onNoBid={() => toggleNoBid(walkLane.id)}
        />
      ) : null}

      {toast ? <div className="rfp-toast">{toast}</div> : null}
    </div>
  )
}

/* ── small pieces ── */

const statusHint: Record<RfpStatus, string> = {
  Draft: 'File is loaded but nothing has been priced yet.',
  Pricing: 'Lanes are being priced. Nothing has gone back to the customer.',
  Submitted: 'Latest round is with the customer and we are waiting on an answer.',
  Awarded: 'Customer gave us the freight at these rates.',
  Lost: 'Customer awarded the freight elsewhere.',
}

function StatusChip({ status }: { status: RfpStatus }) {
  return (
    <Tip
      tip={
        <>
          <b>{status}</b>
          <em>{statusHint[status]}</em>
        </>
      }
    >
      <span className="rfp-status" style={{ ['--tone' as string]: rfpStatusHex[status] }}>
        {status}
      </span>
    </Tip>
  )
}

/** Column heading that explains itself on hover. */
function Head({
  tip,
  num,
  children,
}: {
  tip: string
  num?: boolean
  children: ReactNode
}) {
  return (
    <Tip
      className={cn('rfp-head-tip', num && 'is-num')}
      tip={
        <>
          <b>{children}</b>
          <em>{tip}</em>
        </>
      }
    >
      <span className="rfp-head-label">{children}</span>
    </Tip>
  )
}

function Bar({ value, tone }: { value: number; tone: 'good' | 'warn' | 'idle' }) {
  return (
    <i className={cn('rfp-meter', `is-${tone}`)}>
      <u style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </i>
  )
}

function Fact({
  icon: Icon,
  label,
  value,
  note,
  tone,
  hint,
}: {
  icon: typeof Layers
  label: string
  value: string
  note: string
  tone?: 'good' | 'warn'
  hint: string
}) {
  return (
    <Tip
      block
      tip={
        <>
          <b>{label}</b>
          <em>{hint}</em>
        </>
      }
    >
      <article className="rfp-fact">
        <i>
          <Icon size={15} strokeWidth={1.9} />
        </i>
        <span>{label}</span>
        <strong className={tone ? `is-${tone}` : undefined}>{value}</strong>
        <em>{note}</em>
      </article>
    </Tip>
  )
}

function Stat({
  label,
  value,
  note,
  tone,
  hint,
}: {
  label: string
  value: string
  note: string
  tone?: 'good' | 'warn'
  hint: string
}) {
  return (
    <Tip
      block
      tip={
        <>
          <b>{label}</b>
          <em>{hint}</em>
        </>
      }
    >
      <article className="rfp-stat">
        <span>{label}</span>
        <strong className={tone ? `is-${tone}` : undefined}>{value}</strong>
        <em>{note}</em>
      </article>
    </Tip>
  )
}
