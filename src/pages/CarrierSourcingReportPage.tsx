import { useCallback, useMemo, useState } from 'react'
import {
  AppliedFiltersRow,
  SrDataTable,
  TagPopover,
  type SrColumn,
} from '@/components/report'
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

  const filtered = useMemo(
    () => filterReportLoads(reportLoads, mergedFilters),
    [mergedFilters, refreshKey]
  )

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
        thClassName: 'col-route',
        width: 360,
        minWidth: 280,
        cell: (row) => (
          <div className="sr-route-cell">
            <div className="sr-route-line">
              <div className="sr-route-end">
                <span className="sr-route-city">{row.origin}</span>
                <span className="sr-route-time">{row.pickupDate}</span>
              </div>
              <div className="sr-route-mid">
                <span className="sr-route-miles">{row.miles.toLocaleString()} mi</span>
                <span className="sr-route-dots" aria-hidden />
              </div>
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
        width: 84,
        minWidth: 68,
        cell: (row) => (
          <span className={cn('mono', !row.rate && 'sr-empty')}>{row.rate ?? '—'}</span>
        ),
      },
      {
        key: 'broker',
        header: 'Broker',
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
      <div className="sr-express-rail">
        <div className="sr-express-group" role="group" aria-label="Mode">
          {(
            [
              ['Spot', 'Spot', MODE_DISPLAY_COUNTS.Spot, 'spot'],
              ['Expedited', 'Expedited', MODE_DISPLAY_COUNTS.Expedited, 'expedited'],
              ['Managed', 'Managed', MODE_DISPLAY_COUNTS.Managed, 'managed'],
            ] as const
          ).map(([key, label, count, tone]) => (
            <button
              key={key}
              type="button"
              className={cn(
                'sr-express-card',
                `sr-express-card--${tone}`,
                filters.mode === key && 'is-active'
              )}
              onClick={() => patch({ mode: filters.mode === key ? 'ALL' : key })}
            >
              <span className="sr-express-card__name">{label}</span>
              <span className="sr-express-card__value">{count.toLocaleString()}</span>
            </button>
          ))}
        </div>

        <div className="sr-express-divider" aria-hidden />

        <div className="sr-express-group" role="group" aria-label="Status">
          {(
            [
              ['NeedCarrier', 'Need carrier', STATUS_DISPLAY_COUNTS.NeedCarrier, 'need'],
              ['Posted', 'Posted', STATUS_DISPLAY_COUNTS.Posted, 'posted'],
              ['Covered', 'Covered', STATUS_DISPLAY_COUNTS.Covered, 'covered'],
            ] as const
          ).map(([key, label, count, tone]) => (
            <button
              key={key}
              type="button"
              className={cn(
                'sr-express-card',
                `sr-express-card--${tone}`,
                filters.status === key && 'is-active'
              )}
              onClick={() => patch({ status: filters.status === key ? 'ALL' : key })}
            >
              <span className="sr-express-card__name">{label}</span>
              <span className="sr-express-card__value">{count.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      {appliedFilters.length > 0 && (
        <AppliedFiltersRow chips={appliedFilters} onClearAll={resetFilters} />
      )}

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
                      <span className="sr-life-section__num">{block.number}</span>
                      <strong>{block.stage}</strong>
                      <span className="sr-life-section__badge">{display.toLocaleString()}</span>
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
