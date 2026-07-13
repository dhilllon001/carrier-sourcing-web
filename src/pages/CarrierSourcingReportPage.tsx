import { useCallback, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import {
  AppliedFiltersRow,
  BarChart,
  DonutChart,
  ReportFilterStrip,
  SrDataTable,
  type SrColumn,
} from '@/components/report'
import { usePieChartFilter } from '@/hooks/usePieChartFilter'
import {
  colFiltersApplied,
  countActiveFilters,
  dateRangeApplied,
  presetApplied,
  searchApplied,
  selectApplied,
} from '@/lib/report/filters'
import {
  COL_FILTER_DEFS,
  DATE_PRESETS,
  DEFAULT_FILTERS,
  SELECT_FILTER_DEFS,
  filterReportLoads,
  reportLoads,
  type ReportFilters,
  type ReportLoad,
} from '@/data/report'

const MODE_COLORS: Record<string, string> = {
  Spot: 'var(--sr-chart-1)',
  Expedited: 'var(--sr-chart-5)',
  Managed: 'var(--sr-chart-4)',
}

const STAGE_COLORS: Record<string, string> = {
  Sourcing: 'var(--sr-chart-1)',
  Tender: 'var(--sr-chart-2)',
  Award: 'var(--sr-chart-3)',
  Booking: 'var(--sr-chart-4)',
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
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function CarrierSourcingReportPage() {
  const [filters, setFilters] = useState<ReportFilters>({ ...DEFAULT_FILTERS })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const patch = useCallback((p: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...p }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS })
    setSelectedId(null)
  }, [])

  const filtered = useMemo(() => filterReportLoads(reportLoads, filters), [filters])

  // Charts ignore their own dimension so other slices stay visible
  const modeChartRows = useMemo(
    () => filterReportLoads(reportLoads, filters, { ignoreKey: 'mode' }),
    [filters]
  )
  const stageChartRows = useMemo(
    () => filterReportLoads(reportLoads, filters, { ignoreKey: 'stage' }),
    [filters]
  )

  const modeSlices = useMemo(() => {
    const counts = { Spot: 0, Expedited: 0, Managed: 0 }
    for (const row of modeChartRows) counts[row.mode]++
    return (Object.keys(counts) as Array<keyof typeof counts>).map((id) => ({
      id,
      label: id,
      value: counts[id],
      color: MODE_COLORS[id],
    }))
  }, [modeChartRows])

  const stageBars = useMemo(() => {
    const counts = { Sourcing: 0, Tender: 0, Award: 0, Booking: 0 }
    for (const row of stageChartRows) counts[row.stage]++
    return (Object.keys(counts) as Array<keyof typeof counts>).map((id) => ({
      id,
      label: id,
      value: counts[id],
      color: STAGE_COLORS[id],
    }))
  }, [stageChartRows])

  const modeChart = usePieChartFilter(filters, patch, 'mode')
  const stageChart = usePieChartFilter(filters, patch, 'stage')

  const appliedFilters = useMemo(
    () => [
      ...presetApplied(
        filters.datePreset,
        [...DATE_PRESETS],
        DEFAULT_FILTERS.datePreset,
        (datePreset) => patch({ datePreset })
      ),
      ...dateRangeApplied(filters.dateFrom, filters.dateTo, {
        from: DEFAULT_FILTERS.dateFrom,
        to: DEFAULT_FILTERS.dateTo,
      }, (next) => patch(next)),
      ...searchApplied(filters.search, () => patch({ search: '' })),
      ...selectApplied(filters, SELECT_FILTER_DEFS, patch),
      ...colFiltersApplied(filters.colFilters, COL_FILTER_DEFS, (colFilters) =>
        patch({ colFilters })
      ),
    ],
    [filters, patch]
  )

  const activeCount = useMemo(
    () =>
      countActiveFilters(
        filters as unknown as Record<string, unknown>,
        ['identifier', 'shiftName', 'mode', 'status', 'stage'],
        filters.colFilters
      ) +
      (filters.datePreset !== DEFAULT_FILTERS.datePreset ? 1 : 0) +
      (filters.dateFrom !== DEFAULT_FILTERS.dateFrom ? 1 : 0) +
      (filters.dateTo !== DEFAULT_FILTERS.dateTo ? 1 : 0),
    [filters]
  )

  const totals = useMemo(() => {
    const miles = filtered.reduce((s, r) => s + r.miles, 0)
    const fee = filtered.reduce((s, r) => s + r.fee, 0)
    const margin = filtered.length
      ? filtered.reduce((s, r) => s + r.margin, 0) / filtered.length
      : 0
    return { miles, fee, margin, count: filtered.length }
  }, [filtered])

  const columns: SrColumn<ReportLoad>[] = useMemo(
    () => [
      {
        key: 'id',
        header: 'Probill',
        cell: (row) => (
          <div>
            <div className="rep-name mono">{row.id}</div>
            <div style={{ fontSize: 11, color: 'var(--sr-text-meta)' }}>{row.identifier}</div>
          </div>
        ),
      },
      {
        key: 'customer',
        header: 'Customer',
        filter: { type: 'text' },
        cell: (row) => <span className="rep-name">{row.customer}</span>,
      },
      {
        key: 'mode',
        header: 'Mode',
        cell: (row) => row.mode,
      },
      {
        key: 'stage',
        header: 'Stage',
        cell: (row) => row.stage,
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row) => statusPill(row.status),
      },
      {
        key: 'equipment',
        header: 'Equipment',
        filter: { type: 'text' },
        cell: (row) => row.equipment,
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
        key: 'margin',
        header: 'Margin',
        align: 'right',
        cell: (row) => (
          <span className={`mono ${row.margin >= 0 ? 'val-positive' : 'val-negative'}`}>
            {row.margin >= 0 ? '+' : ''}
            {row.margin.toFixed(1)}%
          </span>
        ),
      },
      {
        key: 'shiftName',
        header: 'Shift',
        cell: (row) => row.shiftName,
      },
    ],
    []
  )

  const stripItems = [
    {
      key: 'mode-all',
      label: 'All modes',
      active: filters.mode === 'ALL',
      onClick: () => patch({ mode: 'ALL' }),
    },
    ...(['Spot', 'Expedited', 'Managed'] as const).map((m) => ({
      key: `mode-${m}`,
      label: m,
      active: filters.mode === m,
      onClick: () => patch({ mode: m }),
      onClear: () => patch({ mode: 'ALL' }),
    })),
    {
      key: 'status-need',
      label: 'Need carrier',
      active: filters.status === 'NeedCarrier',
      onClick: () => patch({ status: 'NeedCarrier' }),
      onClear: () => patch({ status: 'ALL' }),
    },
    {
      key: 'status-covered',
      label: 'Covered',
      active: filters.status === 'Covered',
      onClick: () => patch({ status: 'Covered' }),
      onClear: () => patch({ status: 'ALL' }),
    },
  ]

  return (
    <div className="sr-page">
      <div className="sr-kpi-grid">
        <article className="sr-card sr-card--hoverable sr-card__pad">
          <div className="sr-card__meta">Loads</div>
          <div className="sr-kpi__value">{totals.count.toLocaleString()}</div>
          <div className="sr-kpi__delta is-pos">Filtered set</div>
        </article>
        <article className="sr-card sr-card--hoverable sr-card__pad">
          <div className="sr-card__meta">Total miles</div>
          <div className="sr-kpi__value">{totals.miles.toLocaleString()}</div>
          <div className="sr-kpi__delta is-pos">Across lanes</div>
        </article>
        <article className="sr-card sr-card--hoverable sr-card__pad">
          <div className="sr-card__meta">Total fees</div>
          <div className="sr-kpi__value">{money(totals.fee)}</div>
          <div className="sr-kpi__delta is-pos">Booked value</div>
        </article>
        <article className="sr-card sr-card--hoverable sr-card__pad">
          <div className="sr-card__meta">Avg margin</div>
          <div className="sr-kpi__value">{totals.margin.toFixed(1)}%</div>
          <div className={`sr-kpi__delta ${totals.margin >= 0 ? 'is-pos' : 'is-neg'}`}>
            {totals.margin >= 0 ? 'Healthy' : 'Below target'}
          </div>
        </article>
      </div>

      <div className="sr-charts-row">
        <section className="sr-card sr-card__pad">
          <h3 className="sr-card__title">Mode mix</h3>
          <p className="sr-card__meta">Click a slice to filter · click again to clear</p>
          <div style={{ marginTop: 14 }}>
            <DonutChart
              slices={modeSlices}
              centerLabel="loads"
              selectedIds={modeChart.selectedSliceIds}
              onSliceClick={modeChart.onSliceClick}
            />
          </div>
        </section>
        <section className="sr-card sr-card__pad">
          <h3 className="sr-card__title">Lifecycle volume</h3>
          <p className="sr-card__meta">Stage distribution with hover sync</p>
          <div style={{ marginTop: 14 }}>
            <BarChart
              items={stageBars}
              selectedIds={stageChart.selectedSliceIds}
              onBarClick={stageChart.onSliceClick}
            />
          </div>
        </section>
      </div>

      <ReportFilterStrip items={stripItems} activeCount={activeCount} onReset={resetFilters}>
        <label className="sr-search">
          <Search size={14} strokeWidth={1.75} />
          <input
            value={filters.search}
            onChange={(e) => patch({ search: e.target.value })}
            placeholder="Search probill, customer, equipment…"
          />
        </label>
        <select
          className="sr-select"
          value={filters.datePreset}
          onChange={(e) => patch({ datePreset: e.target.value })}
          aria-label="Date preset"
        >
          {DATE_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <select
          className="sr-select"
          value={filters.shiftName}
          onChange={(e) => patch({ shiftName: e.target.value })}
          aria-label="Shift"
        >
          <option value="ALL">All shifts</option>
          <option value="Day">Day</option>
          <option value="Swing">Swing</option>
          <option value="Night">Night</option>
        </select>
        <select
          className="sr-select"
          value={filters.identifier}
          onChange={(e) => patch({ identifier: e.target.value })}
          aria-label="Identifier"
        >
          <option value="ALL">All identifiers</option>
          {[...new Set(reportLoads.map((r) => r.identifier))].map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </ReportFilterStrip>

      <AppliedFiltersRow chips={appliedFilters} onClearAll={resetFilters} />

      <section className="sr-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderBottom: '1px solid var(--sr-border-1)',
            background: 'var(--sr-surface-2)',
          }}
        >
          <div>
            <h3 className="sr-card__title" style={{ margin: 0 }}>
              Load detail
            </h3>
            <p className="sr-card__meta">
              {filtered.length.toLocaleString()} rows · hover for lane details
            </p>
          </div>
        </div>

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
            { label: 'Miles', value: row.miles.toLocaleString() },
            { label: 'Fee', value: money(row.fee) },
            { label: 'Margin', value: `${row.margin.toFixed(1)}%` },
            { label: 'Team', value: row.team },
            { label: 'Shift', value: row.shiftName },
          ]}
          footer={{
            label: 'Totals',
            cells: [
              null,
              null,
              null,
              null,
              null,
              <span key="m" className="mono">
                {totals.miles.toLocaleString()}
              </span>,
              <span key="f" className="mono">
                {money(totals.fee)}
              </span>,
              <span
                key="g"
                className={`mono ${totals.margin >= 0 ? 'val-positive' : 'val-negative'}`}
              >
                {totals.margin.toFixed(1)}%
              </span>,
              null,
            ],
          }}
          emptyTitle="No loads match these filters"
          emptyHint="Clear chips or Reset to widen the set"
          wrapClassName="sr-table-wrap--flush"
          maxHeight="min(52vh, 560px)"
        />
      </section>
    </div>
  )
}
