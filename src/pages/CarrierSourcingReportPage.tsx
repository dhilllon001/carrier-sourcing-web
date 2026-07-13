import { useCallback, useMemo, useState } from 'react'
import {
  AppliedFiltersRow,
  SrDataTable,
  type SrColumn,
} from '@/components/report'
import { LifecycleBattery } from '@/components/report/LifecycleBattery'
import {
  colFiltersApplied,
  searchApplied,
  selectApplied,
} from '@/lib/report/filters'
import {
  COL_FILTER_DEFS,
  DEFAULT_FILTERS,
  SELECT_FILTER_DEFS,
  countByMode,
  countByStatus,
  countLifecycle,
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
}

function statusPill(status: ReportLoad['status']) {
  const map = {
    NeedCarrier: 'sr-status-pill--negative',
    Posted: 'sr-status-pill--warning',
    Covered: 'sr-status-pill--positive',
  } as const
  const label = status === 'NeedCarrier' ? 'Need carrier' : status
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
}: CarrierSourcingReportPageProps) {
  const [filters, setFilters] = useState<ReportFilters>({ ...DEFAULT_FILTERS })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const patch = useCallback((p: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...p }))
  }, [])

  // Keep header search in sync with page filter state
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

  const modeCounts = useMemo(() => countByMode(reportLoads), [])
  const statusCounts = useMemo(() => countByStatus(reportLoads), [])
  const lifecycle = useMemo(() => countLifecycle(reportLoads), [])

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
        key: 'id',
        header: 'Probill',
        cell: (row) => (
          <div>
            <div className="rep-name mono" style={{ color: 'var(--sr-action)' }}>
              {row.id}
            </div>
            <div style={{ fontSize: 11, color: 'var(--sr-text-meta)' }}>{row.identifier}</div>
          </div>
        ),
      },
      {
        key: 'mode',
        header: 'Mode',
        cell: (row) => (
          <div>
            <div className="rep-name">{row.mode}</div>
            <div style={{ fontSize: 11, color: 'var(--sr-text-meta)' }}>{row.equipment}</div>
          </div>
        ),
      },
      {
        key: 'stage',
        header: 'Stage',
        cell: (row) => (
          <div>
            <div className="rep-name">{row.stage}</div>
            <div style={{ fontSize: 11, color: 'var(--sr-text-meta)' }}>{row.subStage}</div>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row) => statusPill(row.status),
      },
      {
        key: 'customer',
        header: 'Customer',
        filter: { type: 'text' },
        cell: (row) => <span className="rep-name">{row.customer}</span>,
      },
      {
        key: 'route',
        header: 'Route',
        cell: (row) => (
          <div>
            <div style={{ fontWeight: 500 }}>
              {row.origin} → {row.destination}
            </div>
            <div style={{ fontSize: 11, color: 'var(--sr-text-meta)' }}>
              {row.miles.toLocaleString()} mi · {row.pickupDate}
            </div>
          </div>
        ),
      },
      {
        key: 'miles',
        header: 'Miles',
        align: 'right',
        filter: { type: 'range' },
        cell: (row) => <span className="mono">{row.miles.toLocaleString()}</span>,
      },
      {
        key: 'fee',
        header: 'Fee',
        align: 'right',
        filter: { type: 'range' },
        cell: (row) => <span className="mono">{money(row.fee)}</span>,
      },
      {
        key: 'team',
        header: 'Team',
        cell: (row) => row.team,
      },
    ],
    []
  )

  return (
    <div className="sr-page">
      <div className="sr-express-rail">
        <div className="sr-express-group" role="group" aria-label="Mode">
          {(
            [
              ['Spot', 'Spot', modeCounts.Spot],
              ['Expedited', 'Expedited', modeCounts.Expedited],
              ['Managed', 'Managed', modeCounts.Managed],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              className={cn('sr-express-card', filters.mode === key && 'is-active')}
              onClick={() => patch({ mode: filters.mode === key ? 'ALL' : key })}
            >
              <span className="sr-express-card__name">{label}</span>
              <span className="sr-express-card__value">{count}</span>
            </button>
          ))}
        </div>

        <div className="sr-express-divider" aria-hidden />

        <div className="sr-express-group" role="group" aria-label="Status">
          {(
            [
              ['NeedCarrier', 'Need carrier', statusCounts.NeedCarrier],
              ['Posted', 'Posted', statusCounts.Posted],
              ['Covered', 'Covered', statusCounts.Covered],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              className={cn('sr-express-card', filters.status === key && 'is-active')}
              onClick={() => patch({ status: filters.status === key ? 'ALL' : key })}
            >
              <span className="sr-express-card__name">{label}</span>
              <span className="sr-express-card__value">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <LifecycleBattery
        blocks={lifecycle}
        totalCount={reportLoads.length}
        stage={filters.stage}
        subStage={filters.subStage}
        onSelectAll={() => patch({ stage: 'ALL', subStage: 'ALL' })}
        onSelectStage={(stage) =>
          patch({
            stage: filters.stage === stage && filters.subStage === 'ALL' ? 'ALL' : stage,
            subStage: 'ALL',
          })
        }
        onSelectSubStage={(stage, sub) =>
          patch({
            stage,
            subStage: filters.subStage === sub ? 'ALL' : sub,
          })
        }
      />

      {appliedFilters.length > 0 && (
        <AppliedFiltersRow chips={appliedFilters} onClearAll={resetFilters} />
      )}

      <section className="sr-card sr-card--table" style={{ padding: 0, overflow: 'hidden' }}>
        {viewMode === 'table' ? (
          <SrDataTable
            rows={filtered}
            columns={columns}
            colFilters={filters.colFilters}
            onColFilterChange={(colFilters) => patch({ colFilters })}
            selectedIds={selectedId ? new Set([selectedId]) : undefined}
            onRowClick={(row) => setSelectedId(row.id)}
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
            maxHeight="min(68vh, 720px)"
          />
        ) : (
          <div className="sr-cards-board">
            {lifecycle.map((block) => {
              const cards = filtered.filter((r) => r.stage === block.stage)
              return (
                <section key={block.stage} className="sr-cards-col">
                  <div className="sr-cards-col__head">
                    <span className="sr-pipeline__num">{block.number}</span>
                    <strong>{block.stage}</strong>
                    <span className="sr-pipeline__value">{cards.length}</span>
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
                        onClick={() => setSelectedId(row.id)}
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
  )
}
