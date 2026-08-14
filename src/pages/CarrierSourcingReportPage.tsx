import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { SrDataTable, TagPopover, type SrColumn } from '@/components/report'
import { LifecycleRail } from '@/components/report/LifecycleRail'
import {
  colFiltersApplied,
  searchApplied,
  selectApplied,
} from '@/lib/report/filters'
import {
  COL_FILTER_DEFS,
  DEFAULT_FILTERS,
  LIFECYCLE,
  LIFECYCLE_DISPLAY,
  MODE_DISPLAY_COUNTS,
  SELECT_FILTER_DEFS,
  STATUS_DISPLAY_COUNTS,
  filterReportLoads,
  reportLoads,
  type ReportFilters,
  type ReportLoad,
} from '@/data/report'
import { cn } from '@/lib/cn'

export type ViewMode = 'table' | 'cards'

type CarrierSourcingReportPageProps = {
  search: string
  onSearchChange: (value: string) => void
  viewMode: ViewMode
  refreshKey: number
  onOpenLoad: (id: string) => void
}

function statusPill(status: ReportLoad['status']) {
  const map = {
    NeedCarrier: 'sr-status-pill--negative',
    Posted: 'sr-status-pill--warning',
    Covered: 'sr-status-pill--neutral',
  } as const
  const label = status === 'NeedCarrier' ? 'NeedCarrier' : status
  return <span className={`sr-status-pill ${map[status]}`}>{label}</span>
}

function money(n: number) {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

/* ── Planning boards (mock) ── */
const PLANNING_BOARDS = [
  'B1 NAZ NorthBound DED',
  'BMW - MX JIX',
  'TS-NB Highway Expedite',
  'TS-SB Highway Expedite',
  'TS-NB Regional Expedite',
  'TS-SB Regional Expedite',
  'FCA MX NorthBound',
  'Michael Pilot Team',
  'CDN East Coast Inbound',
  'Dallas Local',
  'Linamar Dedicated',
] as const

function boardHash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function boardOf(id: string) {
  return PLANNING_BOARDS[boardHash(id) % PLANNING_BOARDS.length]
}

const CA_PROV = new Set(['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE'])
const MX_HINT = ['MX', 'Nuevo Laredo', 'Monterrey', 'Sonora', 'Juarez']

function flagFor(place: string) {
  const state = place.split(',').pop()?.trim() ?? ''
  if (MX_HINT.some((h) => place.includes(h))) return '🇲🇽'
  if (CA_PROV.has(state)) return '🇨🇦'
  return '🇺🇸'
}

/* Mock hard-limit ceiling derived from the load fee */
function maxBuyFor(row: ReportLoad) {
  return Math.max(1, Math.round(row.fee / 100))
}

export function CarrierSourcingReportPage({
  search,
  onSearchChange,
  viewMode,
  refreshKey,
  onOpenLoad,
}: CarrierSourcingReportPageProps) {
  const [filters, setFilters] = useState<ReportFilters>({ ...DEFAULT_FILTERS })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [lifeCollapsed, setLifeCollapsed] = useState(false)
  const [board, setBoard] = useState<string>('ALL')
  const [boardQuery, setBoardQuery] = useState('')
  const [rowTags, setRowTags] = useState<Record<string, string[]>>({
    '11436778': ['Priority'],
    '11440520': ['Hot lane', 'Hazmat'],
    '11402376': ['Appointment'],
    '11445002': ['Border', 'Team driver'],
    '11445007': ['Reefer'],
    '11445011': ['High value', 'Priority'],
    '11445015': ['Hot lane'],
    '11445018': ['Appointment', 'Reefer'],
  })

  const patch = useCallback((p: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...p }))
  }, [])

  const setTagsFor = useCallback((id: string, tags: string[]) => {
    setRowTags((prev) => ({ ...prev, [id]: tags }))
  }, [])

  const mergedFilters = useMemo(
    () => ({ ...filters, search }),
    [filters, search]
  )

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS })
    onSearchChange('')
    setSelectedId(null)
  }, [onSearchChange])

  const baseFiltered = useMemo(
    () => filterReportLoads(reportLoads, mergedFilters),
    [mergedFilters, refreshKey]
  )

  const filtered = useMemo(
    () => (board === 'ALL' ? baseFiltered : baseFiltered.filter((r) => boardOf(r.id) === board)),
    [baseFiltered, board]
  )

  const boardCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of baseFiltered) {
      const b = boardOf(r.id)
      counts.set(b, (counts.get(b) ?? 0) + 1)
    }
    return counts
  }, [baseFiltered])

  const visibleBoards = useMemo(() => {
    const q = boardQuery.trim().toLowerCase()
    return q ? PLANNING_BOARDS.filter((b) => b.toLowerCase().includes(q)) : [...PLANNING_BOARDS]
  }, [boardQuery])

  const tabsRef = useRef<HTMLDivElement>(null)
  const [tabScroll, setTabScroll] = useState({ left: false, right: false })

  const syncTabScroll = useCallback(() => {
    const el = tabsRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setTabScroll({ left: el.scrollLeft > 2, right: el.scrollLeft < max - 2 })
  }, [])

  useEffect(() => {
    syncTabScroll()
    const el = tabsRef.current
    if (!el) return
    const ro = new ResizeObserver(syncTabScroll)
    ro.observe(el)
    return () => ro.disconnect()
  }, [syncTabScroll, visibleBoards])

  const scrollTabs = useCallback((dir: -1 | 1) => {
    const el = tabsRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.7), behavior: 'smooth' })
  }, [])

  /* Let a vertical wheel gesture pan the tab strip horizontally */
  const onTabsWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
    if (el.scrollWidth <= el.clientWidth) return
    el.scrollLeft += e.deltaY
  }, [])

  const appliedFilters = useMemo(
    () => [
      ...searchApplied(search, () => onSearchChange('')),
      ...selectApplied(mergedFilters, SELECT_FILTER_DEFS, (p) => {
        const next = { ...p }
        if (next.stage === 'ALL') next.subStage = 'ALL'
        if ('search' in next) onSearchChange(String(next.search ?? ''))
        patch(next)
      }),
      ...colFiltersApplied(filters.colFilters, COL_FILTER_DEFS, (colFilters) =>
        patch({ colFilters })
      ),
    ],
    [mergedFilters, filters.colFilters, search, onSearchChange, patch]
  )

  const columns: SrColumn<ReportLoad>[] = useMemo(
    () => [
      {
        key: 'mode',
        header: 'Mode',
        thClassName: 'col-mode',
        width: 120,
        minWidth: 96,
        cell: (row) => (
          <div className="sr-mode-cell">
            <span className={cn('sr-mode-badge', `sr-mode-badge--${row.mode.toLowerCase()}`)}>
              {row.mode.toUpperCase()}
            </span>
            <span className="sr-mode-detail">{row.modeDetail}</span>
          </div>
        ),
      },
      {
        key: 'tags',
        header: 'Tags',
        thClassName: 'col-tags',
        width: 168,
        minWidth: 120,
        cell: (row) => (
          <TagPopover
            tags={rowTags[row.id] ?? []}
            onChange={(tags) => setTagsFor(row.id, tags)}
          />
        ),
      },
      {
        key: 'id',
        header: 'Probill',
        filter: { type: 'text' },
        thClassName: 'col-probill',
        width: 118,
        minWidth: 96,
        cell: (row) => (
          <div className="sr-probill-cell">
            <button type="button" className="sr-probill-link">
              {row.id}
            </button>
            <span className="sr-probill-po">{row.identifier}</span>
          </div>
        ),
      },
      {
        key: 'stage',
        header: 'Stage',
        thClassName: 'col-stage',
        width: 132,
        minWidth: 100,
        cell: (row) => (
          <div className="sr-stage-cell">
            <span className="sr-stage-main">{row.stage}</span>
            <span className="sr-stage-sub">{row.subStage}</span>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        thClassName: 'col-status',
        width: 118,
        minWidth: 96,
        cell: (row) => statusPill(row.status),
      },
      {
        key: 'customer',
        header: 'Customer',
        filter: { type: 'text' },
        thClassName: 'col-customer',
        width: 132,
        minWidth: 100,
        cell: (row) => <span className="rep-name">{row.customer}</span>,
      },
      {
        key: 'equipment',
        header: 'Equip',
        filter: { type: 'text' },
        thClassName: 'col-equip',
        width: 96,
        minWidth: 80,
        cell: (row) => <span className="sr-equip">{row.equipment}</span>,
      },
      {
        key: 'route',
        header: 'Route',
        filter: { type: 'range', key: 'miles' },
        thClassName: 'col-route',
        width: 280,
        minWidth: 220,
        cell: (row) => (
          <div className="sr-route-cell">
            <div className="sr-route-line">
              <div className="sr-route-end">
                <span className="sr-route-city">{row.origin}</span>
                <span className="sr-route-time">{row.pickupDate}</span>
              </div>
              <span className="sr-route-miles">{row.miles.toLocaleString()} mi</span>
              <div className="sr-route-end sr-route-end--right">
                <span className="sr-route-city">{row.destination}</span>
                <span className="sr-route-time">{row.deliveryDate}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'rate',
        header: 'Rate',
        align: 'right',
        thClassName: 'col-rate',
        width: 104,
        minWidth: 84,
        cell: (row) => (
          <div className="sr-rate-cell">
            <span className="sr-rate-line">
              <span className="sr-rate-flag" aria-hidden>
                {flagFor(row.destination)}
              </span>
              <span className={cn('mono sr-rate-amt', !row.rate && 'sr-empty')}>
                {row.rate ?? '—'}
              </span>
            </span>
            <span className="sr-rate-max">Max Buy {maxBuyFor(row)}</span>
          </div>
        ),
      },
      {
        key: 'broker',
        header: 'Broker',
        filter: { type: 'text' },
        thClassName: 'col-broker',
        width: 104,
        minWidth: 80,
        cell: (row) => (
          <span className={cn(!row.broker && 'sr-empty')}>{row.broker ?? '—'}</span>
        ),
      },
      {
        key: 'team',
        header: 'Team',
        filter: { type: 'text' },
        thClassName: 'col-team',
        width: 100,
        minWidth: 76,
        cell: (row) => <span className="sr-team">{row.team}</span>,
      },
    ],
    [rowTags, setTagsFor]
  )

  return (
    <div className="sr-page">
      <div
        className={cn(
          'sr-boards',
          tabScroll.left && 'has-left',
          tabScroll.right && 'has-right'
        )}
        role="tablist"
        aria-label="Planning boards"
      >
        <button
          type="button"
          className="sr-boards__nav is-left"
          aria-label="Scroll boards left"
          tabIndex={-1}
          onClick={() => scrollTabs(-1)}
        >
          <ChevronLeft size={15} />
        </button>
        <div
          className="sr-boards__tabs"
          ref={tabsRef}
          onScroll={syncTabScroll}
          onWheel={onTabsWheel}
        >
          <button
            type="button"
            role="tab"
            aria-selected={board === 'ALL'}
            className={cn('sr-boards__tab', board === 'ALL' && 'is-active')}
            onClick={() => setBoard('ALL')}
          >
            All boards
            <em>{baseFiltered.length.toLocaleString()}</em>
          </button>
          {visibleBoards.map((b) => (
            <button
              key={b}
              type="button"
              role="tab"
              aria-selected={board === b}
              className={cn('sr-boards__tab', board === b && 'is-active')}
              onClick={() => setBoard(board === b ? 'ALL' : b)}
            >
              {b}
              <em>{(boardCounts.get(b) ?? 0).toLocaleString()}</em>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="sr-boards__nav is-right"
          aria-label="Scroll boards right"
          tabIndex={-1}
          onClick={() => scrollTabs(1)}
        >
          <ChevronRight size={15} />
        </button>
        <label className="sr-boards__find">
          <Search size={13} aria-hidden />
          <input
            type="text"
            value={boardQuery}
            onChange={(e) => setBoardQuery(e.target.value)}
            placeholder="Find board"
            aria-label="Find planning board"
          />
        </label>
      </div>

      <div className="sr-quick" role="toolbar" aria-label="Mode and status filters">
        {(
          [
            ['Spot', 'Spot', MODE_DISPLAY_COUNTS.Spot],
            ['Expedited', 'Expedited', MODE_DISPLAY_COUNTS.Expedited],
            ['Managed', 'Managed', MODE_DISPLAY_COUNTS.Managed],
            ['Mexico', 'Mexico', MODE_DISPLAY_COUNTS.Mexico],
            ['PowerOnly', 'P/O', MODE_DISPLAY_COUNTS.PowerOnly],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            className={cn('sr-quick__pill', filters.mode === key && 'is-active')}
            onClick={() => patch({ mode: filters.mode === key ? 'ALL' : key })}
          >
            {label}
            <em>{count.toLocaleString()}</em>
          </button>
        ))}

        <span className="sr-quick__split" aria-hidden />

        {(
          [
            ['NeedCarrier', 'Need carrier', STATUS_DISPLAY_COUNTS.NeedCarrier],
            ['Posted', 'Posted', STATUS_DISPLAY_COUNTS.Posted],
            ['Covered', 'Covered', STATUS_DISPLAY_COUNTS.Covered],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            className={cn('sr-quick__pill', filters.status === key && 'is-active')}
            onClick={() => patch({ status: filters.status === key ? 'ALL' : key })}
          >
            {label}
            <em>{count.toLocaleString()}</em>
          </button>
        ))}

        {appliedFilters.length > 0 && (
          <button type="button" className="sr-quick__clear" onClick={resetFilters}>
            Clear {appliedFilters.length}
          </button>
        )}
      </div>

      <div className={cn('sr-page__split', lifeCollapsed && 'is-life-collapsed')}>
        <LifecycleRail
          collapsed={lifeCollapsed}
          onToggle={() => setLifeCollapsed((v) => !v)}
          stage={filters.stage}
          subStage={filters.subStage}
          onSelectAll={() => patch({ stage: 'ALL', subStage: 'ALL' })}
          onSelectStage={(stage) => patch({ stage, subStage: 'ALL' })}
          onSelectSubStage={(stage, sub) => patch({ stage, subStage: sub })}
        />

        <section className="sr-card sr-card--table" style={{ padding: 0, overflow: 'hidden' }}>
          {viewMode === 'table' ? (
            <SrDataTable
              rows={filtered}
              columns={columns}
              colFilters={filters.colFilters}
              onColFilterChange={(colFilters) => patch({ colFilters })}
              selectedIds={selectedId ? new Set([selectedId]) : undefined}
              onRowClick={(row) => {
                setSelectedId(row.id)
                onOpenLoad(row.id)
              }}
              hoverTitle={(row) => row.customer}
              hoverSubtitle={(row) => `${row.origin} → ${row.destination}`}
              hoverDetails={(row) => [
                { label: 'Probill', value: row.id },
                { label: 'Stage', value: `${row.stage} / ${row.subStage}` },
                { label: 'Status', value: row.status },
                { label: 'Miles', value: row.miles.toLocaleString() },
                { label: 'Fee', value: money(row.fee) },
                { label: 'Team', value: row.team },
              ]}
              emptyTitle="No loads match these filters"
              emptyHint="Clear filters to widen results"
              wrapClassName="sr-table-wrap--flush"
              tableClassName="sr-table--ops"
              maxHeight="none"
              footerBar={`${filtered.length.toLocaleString()} loads`}
            />
          ) : (
            <div className="sr-cards-board">
              {LIFECYCLE.map((block) => {
                const cards = filtered.filter((r) => r.stage === block.stage)
                const display =
                  LIFECYCLE_DISPLAY.stages.find((s) => s.stage === block.stage)?.count ??
                  cards.length
                return (
                  <section key={block.stage} className="sr-cards-col">
                    <div className="sr-cards-col__head">
                      <span className="sr-cards-col__num">{Number(block.number)}</span>
                      <strong>{block.stage}</strong>
                      <span className="sr-cards-col__count">{display.toLocaleString()}</span>
                    </div>
                    <div className="sr-cards-col__body">
                      {cards.map((row) => (
                        <button
                          key={row.id}
                          type="button"
                          className={cn(
                            'sr-load-card',
                            selectedId === row.id && 'is-selected'
                          )}
                          onClick={() => {
                            setSelectedId(row.id)
                            onOpenLoad(row.id)
                          }}
                        >
                          <div className="sr-load-card__top">
                            <span className="sr-load-card__id">{row.id}</span>
                            {statusPill(row.status)}
                          </div>
                          <div className="sr-load-card__customer">{row.customer}</div>
                          <div className="sr-load-card__meta">
                            {row.mode} · {row.subStage} · {row.equipment}
                          </div>
                          <div className="sr-load-card__route">
                            <span>{row.origin}</span>
                            <span className="sr-load-card__miles">{row.miles} mi</span>
                            <span>{row.destination}</span>
                          </div>
                        </button>
                      ))}
                      {cards.length === 0 && (
                        <div className="sr-cards-empty">No loads in this stage</div>
                      )}
                    </div>
                  </section>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
