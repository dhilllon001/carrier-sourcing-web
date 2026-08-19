import { useState } from 'react'
import {
  AlertTriangle,
  ChevronDown,
  Minus,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  TrendingUp,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  laneInsights,
  laneMetrics,
  weekCoverage,
  type CapacityLane,
  type CapacityTeam,
  type LaneCarrier,
} from '@/data/capacityLanes'

export function coverageTone(coverage: number) {
  if (coverage >= 95) return 'is-good'
  if (coverage >= 75) return 'is-warn'
  return 'is-bad'
}

export function pctTone(value: number) {
  if (value >= 93) return 'is-good'
  if (value >= 85) return 'is-warn'
  return 'is-bad'
}

export function money(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}

function Metric({
  label,
  value,
  sub,
  tone,
  bar,
}: {
  label: string
  value: string
  sub?: string
  tone?: string
  bar?: number
}) {
  return (
    <div className="cap-metric">
      <span className="cap-metric__label">{label}</span>
      <strong className={cn('cap-metric__value', tone)}>{value}</strong>
      {bar !== undefined && (
        <span className="cap-metric__bar">
          <i className={cn(coverageTone(bar))} style={{ width: `${Math.min(100, bar)}%` }} />
        </span>
      )}
      {sub && <span className="cap-metric__sub">{sub}</span>}
    </div>
  )
}

function StandingChip({ standing }: { standing: LaneCarrier['standing'] }) {
  return (
    <span className={cn('cap-standing', `is-${standing.toLowerCase()}`)}>
      {standing}
    </span>
  )
}

export function LaneWorkspace({
  lane,
  team,
  dismissed,
  onDismissInsight,
  onCommit,
  onToggleFavourite,
  onTogglePause,
  onMakePrimary,
}: {
  lane: CapacityLane
  team?: CapacityTeam
  dismissed: string[]
  onDismissInsight: (laneId: string, insightId: string) => void
  onCommit: (laneId: string, carrierId: string, delta: number) => void
  onToggleFavourite: (laneId: string, carrierId: string) => void
  onTogglePause: (laneId: string, carrierId: string) => void
  onMakePrimary: (laneId: string, carrierId: string) => void
}) {
  const [hoverDay, setHoverDay] = useState<string | null>(null)
  const m = laneMetrics(lane)
  const insights = laneInsights(lane).filter((i) => !dismissed.includes(`${lane.id}:${i.id}`))
  const favourite = lane.carriers.find((c) => c.favourite)

  const week = weekCoverage(lane)
  const scaleMax = Math.max(...week.map((d) => d.forecast + d.spare), 1)
  const halfTick = Math.round(scaleMax / 2)
  const active = week.find((d) => d.day === hoverDay)
  /* Whoever earns the next load on a short day: the lane favourite first, then
     the carrier with the best acceptance. */
  const coverTarget = [...lane.carriers]
    .filter((c) => !c.paused)
    .sort((a, b) => Number(b.favourite ?? false) - Number(a.favourite ?? false) || b.accept - a.accept)[0]

  return (
    <div className="cap-lane">
      <header className="cap-lane__head">
        <div className="cap-lane__title">
          <h2>
            {lane.origin} <span aria-hidden>→</span> {lane.destination}
          </h2>
          <span className="cap-equip">{lane.equipment}</span>
          {m.gap > 0 ? (
            <span className="cap-flag is-bad">{m.gap} uncovered</span>
          ) : (
            <span className="cap-flag is-good">Fully covered</span>
          )}
        </div>
        <div className="cap-lane__acts">
          <button type="button" className="cap-btn">
            <UserPlus size={13} strokeWidth={2} />
            Add carrier
          </button>
          <button type="button" className="cap-btn cap-btn--primary">
            <RefreshCw size={13} strokeWidth={2} />
            Renew commitments
          </button>
        </div>
      </header>

      <div className="cap-lane__meta">
        {team && (
          <span>
            <i className="cap-avatar is-sm">{team.initials}</i>
            {team.name}
          </span>
        )}
        {team && <span>Lead {team.lead}</span>}
        <span>{lane.customer}</span>
        <span>{lane.miles.toLocaleString()} mi</span>
        <span>{lane.corridor}</span>
        {favourite && (
          <span className="cap-fav">
            <Star size={11} fill="currentColor" />
            {favourite.name}
          </span>
        )}
      </div>

      <div className="cap-metrics">
        <Metric label="Weekly volume" value={`${lane.loadsPerWk}`} sub="loads forecast" />
        <Metric
          label="Coverage"
          value={`${m.coverage}%`}
          tone={coverageTone(m.coverage)}
          bar={m.coverage}
          sub={`${m.committed} of ${lane.loadsPerWk} committed`}
        />
        <Metric label="Actually run" value={`${lane.actuallyRun}`} sub="4-week average" />
        <Metric
          label="Weighted rate"
          value={money(lane.weightedRate)}
          sub={`${m.vsMarketPct >= 0 ? '+' : ''}${m.vsMarketPct.toFixed(1)}% vs ${money(
            lane.marketRate
          )} market`}
          tone={m.vsMarketPct > 2 ? 'is-warn' : undefined}
        />
        <Metric label="Tender accept" value={`${m.accept}%`} tone={pctTone(m.accept)} sub="lane average" />
        <Metric label="On time" value={`${m.onTime}%`} tone={pctTone(m.onTime)} sub="last 90 days" />
      </div>

      <section className="cap-card cap-insights">
        <div className="cap-card__head">
          <div className="cap-card__title">
            <Sparkles size={14} strokeWidth={2} />
            <div>
              <strong>What this lane needs</strong>
              <p>Read straight from the lane's own volume, rates, and carrier behaviour.</p>
            </div>
          </div>
          <span className="cap-count">{insights.length} open</span>
        </div>

        {insights.length === 0 ? (
          <p className="cap-empty">Nothing outstanding — every check on this lane passes.</p>
        ) : (
          <ul className="cap-insight-list">
            {insights.map((i) => (
              <li key={i.id} className={cn('cap-insight', `is-${i.level}`)}>
                <span className="cap-insight__icon">
                  {i.level === 'good' ? (
                    <TrendingUp size={13} strokeWidth={2.2} />
                  ) : (
                    <AlertTriangle size={13} strokeWidth={2.2} />
                  )}
                </span>
                <div className="cap-insight__body">
                  <strong>{i.title}</strong>
                  <p>{i.detail}</p>
                </div>
                <div className="cap-insight__acts">
                  {i.action && (
                    <button
                      type="button"
                      className="cap-btn cap-btn--sm cap-btn--primary"
                      onClick={() => {
                        if (i.carrierId && i.id.startsWith('grow')) onCommit(lane.id, i.carrierId, 3)
                        if (i.carrierId && i.id.startsWith('refuse')) onTogglePause(lane.id, i.carrierId)
                        onDismissInsight(lane.id, i.id)
                      }}
                    >
                      {i.action}
                    </button>
                  )}
                  <button
                    type="button"
                    className="cap-btn cap-btn--sm cap-btn--quiet"
                    onClick={() => onDismissInsight(lane.id, i.id)}
                  >
                    Dismiss
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="cap-card cap-week">
        <div className="cap-card__head">
          <div className="cap-card__title">
            <div>
              <strong>Weekly capacity</strong>
              <p>Which days carriers are holding, and which fall to spot.</p>
            </div>
          </div>
          <div className="capw-head">
            <span className="cap-count">
              {m.committed} of {lane.loadsPerWk} held
            </span>
            {m.gap > 0 && <span className="cap-count is-bad">{m.gap} to spot</span>}
          </div>
        </div>

        <div className="capw">
          <div className="capw-scale" aria-hidden>
            <span style={{ bottom: '100%' }}>{scaleMax}</span>
            <span style={{ bottom: '50%' }}>{halfTick}</span>
            <span style={{ bottom: 0 }}>0</span>
          </div>

          <div className="capw-days" onMouseLeave={() => setHoverDay(null)}>
            {week.map((d) => {
              const isOn = active?.day === d.day
              return (
                <button
                  key={d.day}
                  type="button"
                  className={cn('capw-col', d.short > 0 && 'is-short', isOn && 'is-on')}
                  onMouseEnter={() => setHoverDay(d.day)}
                  onFocus={() => setHoverDay(d.day)}
                  onClick={() => setHoverDay(isOn ? null : d.day)}
                  aria-label={`${d.day}: ${d.covered} of ${d.forecast} loads held`}
                >
                  <span className="capw-plot">
                    {d.spare > 0 && (
                      <i
                        className="capw-seg capw-seg--spare"
                        style={{ height: `${(d.spare / scaleMax) * 100}%` }}
                      />
                    )}
                    {d.short > 0 && (
                      <i
                        className="capw-seg capw-seg--short"
                        style={{ height: `${(d.short / scaleMax) * 100}%` }}
                      />
                    )}
                    {d.covered > 0 && (
                      <i
                        className="capw-seg capw-seg--held"
                        style={{ height: `${(d.covered / scaleMax) * 100}%` }}
                      />
                    )}
                  </span>
                  <span className="capw-col__day">{d.day}</span>
                  <span className="capw-col__num">
                    {d.covered}/{d.forecast}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="capw-foot">
          {active ? (
            <div className="capw-detail">
              <strong>{active.day}</strong>
              <span>
                {active.forecast} forecast · {active.covered} held
                {active.short > 0 && <b className="is-bad"> · {active.short} to spot</b>}
                {active.spare > 0 && <b className="is-spare"> · {active.spare} idle</b>}
              </span>
              <span className="capw-detail__who">
                {active.byCarrier.length
                  ? active.byCarrier.map((c) => `${c.name} ${c.loads}`).join(' · ')
                  : 'Nobody is holding this day'}
              </span>
              {active.short > 0 && coverTarget && (
                <button
                  type="button"
                  className="cap-btn cap-btn--sm cap-btn--primary"
                  onClick={() => onCommit(lane.id, coverTarget.id, 1)}
                >
                  <Plus size={12} strokeWidth={2.4} />
                  Raise {coverTarget.name.split(' ')[0]} +1
                </button>
              )}
            </div>
          ) : (
            <div className="cap-legend">
              <span>
                <i className="is-covered" /> Held by a dedicated carrier
              </span>
              <span>
                <i className="is-short" /> Falls to spot
              </span>
              <span className="capw-hint">Hover a day for the carrier split</span>
            </div>
          )}
        </div>
      </section>

      <section className="cap-card cap-card--flush">
        <div className="cap-card__head">
          <div className="cap-card__title">
            <div>
              <strong>Dedicated carriers</strong>
              <p>The star marks the lane favourite — sourcing tenders it first.</p>
            </div>
          </div>
          <span className="cap-count">
            {m.activeCarriers} active · {lane.carriers.length - m.activeCarriers} paused
          </span>
        </div>

        <table className="cap-table">
          <thead>
            <tr>
              <th className="cap-col-star" aria-label="Lane favourite" />
              <th>Carrier</th>
              <th>Standing</th>
              <th className="cap-num">Committed</th>
              <th className="cap-num">Run / wk</th>
              <th className="cap-num">Accept</th>
              <th className="cap-num">On time</th>
              <th className="cap-num">Rate</th>
              <th className="cap-col-acts">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lane.carriers.map((c) => (
              <tr key={c.id} className={cn(c.paused && 'is-paused')}>
                <td className="cap-col-star">
                  <button
                    type="button"
                    className={cn('cap-star', c.favourite && 'is-on')}
                    aria-pressed={c.favourite}
                    aria-label={c.favourite ? 'Remove lane favourite' : 'Make lane favourite'}
                    onClick={() => onToggleFavourite(lane.id, c.id)}
                  >
                    <Star size={13} fill={c.favourite ? 'currentColor' : 'none'} />
                  </button>
                </td>
                <td>
                  <div className="cap-cell-2">
                    <strong>{c.name}</strong>
                    <span>
                      MC {c.mc} · last ran {c.lastRan}
                    </span>
                  </div>
                </td>
                <td>
                  <StandingChip standing={c.standing} />
                </td>
                <td className="cap-num">
                  <div className="cap-step">
                    <button
                      type="button"
                      aria-label={`Lower ${c.name} commitment`}
                      disabled={c.committed <= 0}
                      onClick={() => onCommit(lane.id, c.id, -1)}
                    >
                      <Minus size={11} strokeWidth={2.6} />
                    </button>
                    <b>{c.committed}</b>
                    <button
                      type="button"
                      aria-label={`Raise ${c.name} commitment`}
                      onClick={() => onCommit(lane.id, c.id, 1)}
                    >
                      <Plus size={11} strokeWidth={2.6} />
                    </button>
                  </div>
                </td>
                <td className="cap-num">
                  <div className="cap-run">
                    <b>{c.runPerWk.toFixed(1)}</b>
                    <span className="cap-run__bar">
                      <i
                        className={cn(
                          c.runPerWk >= c.committed * 0.9
                            ? 'is-good'
                            : c.runPerWk >= c.committed * 0.6
                              ? 'is-warn'
                              : 'is-bad'
                        )}
                        style={{
                          width: `${Math.min(100, (c.runPerWk / Math.max(1, c.committed)) * 100)}%`,
                        }}
                      />
                    </span>
                  </div>
                </td>
                <td className={cn('cap-num cap-pct', pctTone(c.accept))}>{c.accept}%</td>
                <td className={cn('cap-num cap-pct', pctTone(c.onTime))}>{c.onTime}%</td>
                <td className="cap-num">
                  <div className="cap-cell-2 is-right">
                    <strong>{money(c.rate)}</strong>
                    <span className={c.rate > lane.marketRate ? 'is-bad' : 'is-good'}>
                      {c.rate > lane.marketRate ? '+' : ''}
                      {(((c.rate - lane.marketRate) / lane.marketRate) * 100).toFixed(1)}% vs mkt
                    </span>
                  </div>
                </td>
                <td className="cap-col-acts">
                  <div className="cap-row-acts">
                    {c.standing !== 'Primary' && !c.paused && (
                      <button
                        type="button"
                        className="cap-btn cap-btn--sm cap-btn--quiet"
                        onClick={() => onMakePrimary(lane.id, c.id)}
                      >
                        Make primary
                      </button>
                    )}
                    <button
                      type="button"
                      className={cn('cap-btn cap-btn--sm', c.paused ? 'cap-btn--quiet' : 'cap-btn--danger')}
                      onClick={() => onTogglePause(lane.id, c.id)}
                    >
                      {c.paused ? <Play size={11} /> : <Pause size={11} />}
                      {c.paused ? 'Resume' : 'Pause'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export function TeamRing({ score }: { score: number }) {
  const tone = score >= 85 ? '#10B981' : score >= 70 ? '#EAB308' : '#EF4444'
  return (
    <span
      className="cap-ring"
      style={{
        background: `conic-gradient(${tone} ${score * 3.6}deg, #e8ebf0 0)`,
      }}
    >
      <i>{score}</i>
    </span>
  )
}

export function Caret({ open }: { open: boolean }) {
  return <ChevronDown size={13} className={cn('cap-caret', open && 'is-open')} />
}
