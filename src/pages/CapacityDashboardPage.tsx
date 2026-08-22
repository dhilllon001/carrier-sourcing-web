import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  CircleAlert,
  Clock3,
  Gauge,
  Network,
  Route,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { capacityLanes, laneMetrics } from '@/data/capacityLanes'
import { cn } from '@/lib/cn'

type Props = {
  search: string
  onCreateRfp: (laneIds: string[]) => void
  onOpenManager: () => void
}

export function CapacityDashboardPage({ search, onCreateRfp, onOpenManager }: Props) {
  const [risk, setRisk] = useState<'all' | 'critical' | 'watch' | 'covered'>('all')
  const [selected, setSelected] = useState<string[]>(() =>
    capacityLanes.filter((lane) => laneMetrics(lane).gap > 0).map((lane) => lane.id)
  )
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return capacityLanes
      .map((lane) => ({ lane, metrics: laneMetrics(lane) }))
      .filter(({ lane, metrics }) => {
        const band = metrics.coverage < 75 ? 'critical' : metrics.coverage < 95 ? 'watch' : 'covered'
        if (risk !== 'all' && risk !== band) return false
        if (!q) return true
        return [lane.origin, lane.destination, lane.customer, lane.equipment, lane.corridor]
          .join(' ')
          .toLowerCase()
          .includes(q)
      })
      .sort((a, b) => b.metrics.gap - a.metrics.gap)
  }, [risk, search])

  const all = capacityLanes.map((lane) => ({ lane, metrics: laneMetrics(lane) }))
  const uncovered = all.reduce((sum, item) => sum + item.metrics.gap, 0)
  const needsSourcing = all.filter((item) => item.metrics.gap > 0)
  const fullyCovered = all.filter((item) => item.metrics.coverage >= 100)
  const forecast = all.reduce((sum, item) => sum + item.lane.loadsPerWk, 0)
  const committed = all.reduce((sum, item) => sum + item.metrics.committed, 0)
  const selectedGap = all
    .filter((item) => selected.includes(item.lane.id))
    .reduce((sum, item) => sum + item.metrics.gap, 0)
  const corridors = Array.from(new Set(capacityLanes.map((lane) => lane.corridor))).map((corridor) => {
    const lanes = all.filter((item) => item.lane.corridor === corridor)
    const demand = lanes.reduce((sum, item) => sum + item.lane.loadsPerWk, 0)
    const held = lanes.reduce((sum, item) => sum + item.metrics.committed, 0)
    return { corridor, lanes: lanes.length, demand, coverage: demand ? Math.round((held / demand) * 100) : 100 }
  })

  const createRfp = (laneIds = selected) => {
    if (laneIds.length) onCreateRfp(laneIds)
  }

  return (
    <div className="sr-page capdash-page">
      <section className="capdash-hero">
        <div>
          <span className="capdash-kicker">Network coverage control tower</span>
          <h2>Where the network needs a carrier next</h2>
          <p>
            Forecast demand against committed capacity, isolate uncovered lanes, then move those
            lanes directly into an RFP.
          </p>
        </div>
        <button type="button" className="capdash-primary" disabled={!selected.length} onClick={() => createRfp()}>
          Create RFP · {selected.length} lanes <ArrowRight size={14} />
        </button>
      </section>

      <section className="capdash-stats">
        <Stat icon={Route} label="Network lanes" value={String(all.length)} note={`${forecast} loads / week`} />
        <Stat
          icon={CircleAlert}
          label="Needs sourcing"
          value={String(needsSourcing.length)}
          note={`${uncovered} uncovered loads`}
          tone="danger"
        />
        <Stat
          icon={Gauge}
          label="Committed capacity"
          value={`${forecast ? Math.round((committed / forecast) * 100) : 100}%`}
          note={`${committed} of ${forecast} loads`}
          tone="action"
        />
        <Stat
          icon={ShieldCheck}
          label="Fully covered"
          value={String(fullyCovered.length)}
          note="no sourcing action"
          tone="good"
        />
      </section>

      <section className="capdash-card">
        <header className="capdash-card__head">
          <div>
            <span>Lane sourcing priorities</span>
            <strong>Select uncovered lanes and send them into RFP Design</strong>
          </div>
          <div className="capdash-filters" role="tablist" aria-label="Coverage risk">
            {(['all', 'critical', 'watch', 'covered'] as const).map((id) => (
              <button
                key={id}
                type="button"
                className={risk === id ? 'is-on' : undefined}
                onClick={() => setRisk(id)}
              >
                {id === 'all' ? 'All lanes' : id === 'critical' ? 'Critical' : id === 'watch' ? 'Watch' : 'Covered'}
              </button>
            ))}
          </div>
        </header>

        <div className="capdash-table">
          <div className="capdash-row capdash-row--head">
            <span>
              <button
                type="button"
                className={cn('capdash-select', selected.length === needsSourcing.length && 'is-on')}
                aria-label="Select all lanes needing sourcing"
                onClick={() =>
                  setSelected(selected.length === needsSourcing.length ? [] : needsSourcing.map((item) => item.lane.id))
                }
              >
                {selected.length === needsSourcing.length && <Check size={11} />}
              </button>
            </span>
            <span>Lane / customer</span>
            <span>Forecast</span>
            <span>Committed</span>
            <span>Coverage</span>
            <span>Gap</span>
            <span>Recommendation</span>
            <span />
          </div>
          {rows.map(({ lane, metrics }) => {
            const tone = metrics.coverage < 75 ? 'danger' : metrics.coverage < 95 ? 'watch' : 'good'
            return (
              <div className="capdash-row" key={lane.id}>
                <span>
                  <button
                    type="button"
                    className={cn('capdash-select', selected.includes(lane.id) && 'is-on')}
                    disabled={!metrics.gap}
                    aria-label={`Select ${lane.origin} to ${lane.destination}`}
                    onClick={() =>
                      setSelected((current) =>
                        current.includes(lane.id)
                          ? current.filter((id) => id !== lane.id)
                          : [...current, lane.id]
                      )
                    }
                  >
                    {selected.includes(lane.id) && <Check size={11} />}
                  </button>
                </span>
                <span className="capdash-lane">
                  <strong>{lane.origin} → {lane.destination}</strong>
                  <em>{lane.customer} · {lane.equipment} · {lane.corridor}</em>
                </span>
                <span className="capdash-num"><b>{lane.loadsPerWk}</b><em>/ week</em></span>
                <span className="capdash-num"><b>{metrics.committed}</b><em>loads held</em></span>
                <span className="capdash-coverage">
                  <b className={`is-${tone}`}>{metrics.coverage}%</b>
                  <i><span className={`is-${tone}`} style={{ width: `${Math.min(100, metrics.coverage)}%` }} /></i>
                </span>
                <span className={cn('capdash-gap', metrics.gap > 0 ? 'is-danger' : 'is-good')}>
                  {metrics.gap > 0 ? `${metrics.gap} short` : 'Covered'}
                </span>
                <span className="capdash-reco">
                  {metrics.gap > 0
                    ? metrics.coverage < 75
                      ? 'Launch RFP and invite new carriers'
                      : 'Add backup capacity'
                    : 'Monitor committed carriers'}
                </span>
                <button
                  type="button"
                  className="capdash-action"
                  onClick={metrics.gap > 0 ? () => createRfp([lane.id]) : onOpenManager}
                >
                  {metrics.gap > 0 ? 'Source lane' : 'Open manager'} <ArrowRight size={13} />
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <section className="capdash-insights">
        <div className="capdash-card">
          <header className="capdash-card__head">
            <div><span>Coverage by corridor</span><strong>Where commitment is strongest and weakest</strong></div>
            <Network size={16} />
          </header>
          <div className="capdash-corridors">
            {corridors.map((item) => {
              const tone = item.coverage < 75 ? 'danger' : item.coverage < 95 ? 'watch' : 'good'
              return (
                <article key={item.corridor}>
                  <span><strong>{item.corridor}</strong><em>{item.lanes} lanes · {item.demand} loads/wk</em></span>
                  <b className={`is-${tone}`}>{item.coverage}%</b>
                  <i><span className={`is-${tone}`} style={{ width: `${Math.min(100, item.coverage)}%` }} /></i>
                </article>
              )
            })}
          </div>
        </div>

        <div className="capdash-card">
          <header className="capdash-card__head">
            <div><span>Sourcing workload</span><strong>Actions already moving through the funnel</strong></div>
            <Clock3 size={16} />
          </header>
          <div className="capdash-pipeline">
            <article><i className="is-danger" /><span><strong>7 lanes identified</strong><em>25 uncovered loads per week</em></span><b>Today</b></article>
            <article><i className="is-action" /><span><strong>3 RFPs in market</strong><em>18 carrier invitations outstanding</em></span><b>Active</b></article>
            <article><i className="is-watch" /><span><strong>9 bids to evaluate</strong><em>4 require rate negotiation</em></span><b>Due soon</b></article>
            <article><i className="is-good" /><span><strong>5 lanes awarded</strong><em>11 weekly loads secured this month</em></span><b>Complete</b></article>
          </div>
        </div>
      </section>

      <section className="capdash-callout">
        <TrendingUp size={17} />
        <div>
          <strong>{selectedGap} weekly loads across {selected.length} selected lanes are ready for sourcing</strong>
          <span>RFP Design will inherit exactly the lanes selected above.</span>
        </div>
        <button type="button" disabled={!selected.length} onClick={() => createRfp()}>Review selected lanes</button>
      </section>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: typeof Route
  label: string
  value: string
  note: string
  tone?: 'danger' | 'action' | 'good'
}) {
  return (
    <article className={cn('capdash-stat', tone && `is-${tone}`)}>
      <i><Icon size={16} /></i>
      <span><em>{label}</em><strong>{value}</strong><small>{note}</small></span>
    </article>
  )
}
