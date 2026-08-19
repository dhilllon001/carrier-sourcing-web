import { Fragment, useMemo, useState } from 'react'
import { LayoutGrid, Search, Star, Table2, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  capacityLanes,
  capacityTeams,
  laneInsights,
  laneMetrics,
  teamScore,
  type CapacityLane,
} from '@/data/capacityLanes'
import {
  Caret,
  LaneWorkspace,
  TeamRing,
  coverageTone,
  money,
  pctTone,
} from '@/components/capacity/LaneWorkspace'

type Props = { search: string }

type Sort = 'volume' | 'gap' | 'coverage' | 'rate'

const CHIPS = ['Needs attention', 'My team', 'Above market', 'Has a favourite'] as const
type Chip = (typeof CHIPS)[number]

export function CapacityManagerPage({ search }: Props) {
  const [lanes, setLanes] = useState<CapacityLane[]>(capacityLanes)
  const [mode, setMode] = useState<'cards' | 'table'>('cards')
  const [localQ, setLocalQ] = useState('')
  const [team, setTeam] = useState('all')
  const [equipment, setEquipment] = useState('all')
  const [corridor, setCorridor] = useState('all')
  const [chips, setChips] = useState<Chip[]>([])
  const [sort, setSort] = useState<Sort>('volume')
  const [openLane, setOpenLane] = useState(capacityLanes[0]?.id ?? '')
  const [closedTeams, setClosedTeams] = useState<string[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])

  const q = (search || localQ).trim().toLowerCase()

  const filtered = useMemo(() => {
    let rows = lanes.filter((lane) => {
      const m = laneMetrics(lane)
      const teamName = capacityTeams.find((t) => t.id === lane.teamId)
      if (team !== 'all' && lane.teamId !== team) return false
      if (equipment !== 'all' && lane.equipment !== equipment) return false
      if (corridor !== 'all' && lane.corridor !== corridor) return false
      if (chips.includes('Needs attention') && m.gap === 0) return false
      if (chips.includes('My team') && !teamName?.myTeam) return false
      if (chips.includes('Above market') && m.vsMarketPct <= 2) return false
      if (chips.includes('Has a favourite') && !lane.carriers.some((c) => c.favourite)) return false
      if (q) {
        const hay = [
          lane.origin,
          lane.destination,
          lane.customer,
          lane.equipment,
          lane.corridor,
          teamName?.name ?? '',
          teamName?.lead ?? '',
          ...lane.carriers.map((c) => c.name),
        ]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })

    rows = [...rows].sort((a, b) => {
      const ma = laneMetrics(a)
      const mb = laneMetrics(b)
      if (sort === 'gap') return mb.gap - ma.gap
      if (sort === 'coverage') return ma.coverage - mb.coverage
      if (sort === 'rate') return mb.vsMarketPct - ma.vsMarketPct
      return b.loadsPerWk - a.loadsPerWk
    })

    return rows
  }, [lanes, team, equipment, corridor, chips, q, sort])

  const totals = useMemo(() => {
    const loads = filtered.reduce((sum, l) => sum + l.loadsPerWk, 0)
    const committed = filtered.reduce((sum, l) => sum + laneMetrics(l).committed, 0)
    const atRisk = filtered.filter((l) => laneMetrics(l).gap > 0)
    return {
      lanes: filtered.length,
      loads,
      committed,
      coverage: loads ? Math.round((committed / loads) * 100) : 100,
      uncovered: filtered.reduce((sum, l) => sum + laneMetrics(l).gap, 0),
      atRiskLanes: atRisk.length,
    }
  }, [filtered])

  const active = filtered.find((l) => l.id === openLane) ?? filtered[0]
  const activeTeam = capacityTeams.find((t) => t.id === active?.teamId)

  const grouped = useMemo(
    () =>
      capacityTeams
        .map((t) => ({ team: t, lanes: filtered.filter((l) => l.teamId === t.id) }))
        .filter((g) => g.lanes.length > 0),
    [filtered]
  )

  const patchCarrier = (
    laneId: string,
    carrierId: string,
    patch: (c: CapacityLane['carriers'][number]) => CapacityLane['carriers'][number]
  ) =>
    setLanes((prev) =>
      prev.map((lane) =>
        lane.id !== laneId
          ? lane
          : { ...lane, carriers: lane.carriers.map((c) => (c.id === carrierId ? patch(c) : c)) }
      )
    )

  const onCommit = (laneId: string, carrierId: string, delta: number) =>
    patchCarrier(laneId, carrierId, (c) => ({ ...c, committed: Math.max(0, c.committed + delta) }))

  const onTogglePause = (laneId: string, carrierId: string) =>
    patchCarrier(laneId, carrierId, (c) => ({ ...c, paused: !c.paused }))

  const onMakePrimary = (laneId: string, carrierId: string) =>
    setLanes((prev) =>
      prev.map((lane) =>
        lane.id !== laneId
          ? lane
          : {
              ...lane,
              carriers: lane.carriers.map((c) =>
                c.id === carrierId
                  ? { ...c, standing: 'Primary' as const }
                  : c.standing === 'Primary'
                    ? { ...c, standing: 'Backup' as const }
                    : c
              ),
            }
      )
    )

  const onToggleFavourite = (laneId: string, carrierId: string) =>
    setLanes((prev) =>
      prev.map((lane) =>
        lane.id !== laneId
          ? lane
          : {
              ...lane,
              carriers: lane.carriers.map((c) => ({
                ...c,
                favourite: c.id === carrierId ? !c.favourite : false,
              })),
            }
      )
    )

  const onDismissInsight = (laneId: string, insightId: string) =>
    setDismissed((prev) => [...prev, `${laneId}:${insightId}`])

  const equipmentOpts = Array.from(new Set(lanes.map((l) => l.equipment)))
  const corridorOpts = Array.from(new Set(lanes.map((l) => l.corridor)))

  return (
    <div className="sr-page cap-page">
      <div className="cap-summary">
        <div className="cap-sum">
          <span>Lanes</span>
          <strong>{totals.lanes}</strong>
        </div>
        <div className="cap-sum">
          <span>Loads / week</span>
          <strong>{totals.loads}</strong>
        </div>
        <div className="cap-sum">
          <span>Committed</span>
          <strong>{totals.committed}</strong>
        </div>
        <div className="cap-sum cap-sum--wide">
          <span>Coverage</span>
          <strong className={coverageTone(totals.coverage)}>{totals.coverage}%</strong>
          <i className="cap-sum__bar">
            <b
              className={coverageTone(totals.coverage)}
              style={{ width: `${Math.min(100, totals.coverage)}%` }}
            />
          </i>
        </div>
        <div className={cn('cap-sum', totals.uncovered > 0 && 'is-alert')}>
          <span>Falls to spot</span>
          <strong>{totals.uncovered} loads</strong>
        </div>
        <div className={cn('cap-sum', totals.atRiskLanes > 0 && 'is-alert')}>
          <span>Lanes at risk</span>
          <strong>{totals.atRiskLanes}</strong>
        </div>
      </div>

      <div className="cap-toolbar">
        <label className="cap-search">
          <Search size={14} strokeWidth={1.9} />
          <input
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Search lane, customer, or carrier…"
            aria-label="Search lanes"
          />
          {localQ && (
            <button type="button" aria-label="Clear search" onClick={() => setLocalQ('')}>
              <X size={13} />
            </button>
          )}
        </label>

        <select value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Team">
          <option value="all">All teams</option>
          {capacityTeams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          aria-label="Equipment"
        >
          <option value="all">All equipment</option>
          {equipmentOpts.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>

        <select value={corridor} onChange={(e) => setCorridor(e.target.value)} aria-label="Corridor">
          <option value="all">All corridors</option>
          {corridorOpts.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="cap-chips">
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              className={cn('cap-chip', chips.includes(c) && 'is-on')}
              aria-pressed={chips.includes(c)}
              onClick={() =>
                setChips((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
              }
            >
              {c}
            </button>
          ))}
          {(chips.length > 0 || team !== 'all' || equipment !== 'all' || corridor !== 'all') && (
            <button
              type="button"
              className="cap-clear"
              onClick={() => {
                setChips([])
                setTeam('all')
                setEquipment('all')
                setCorridor('all')
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="cap-toolbar__right">
          <div className="cap-seg" role="group" aria-label="View mode">
            <button
              type="button"
              className={cn(mode === 'cards' && 'is-on')}
              onClick={() => setMode('cards')}
            >
              <LayoutGrid size={13} />
              Lanes
            </button>
            <button
              type="button"
              className={cn(mode === 'table' && 'is-on')}
              onClick={() => setMode('table')}
            >
              <Table2 size={13} />
              Table
            </button>
          </div>
          <select
            className="cap-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Sort lanes"
          >
            <option value="volume">Sort: volume</option>
            <option value="gap">Sort: biggest gap</option>
            <option value="coverage">Sort: lowest coverage</option>
            <option value="rate">Sort: most above market</option>
          </select>
        </div>
      </div>

      {mode === 'cards' ? (
        <div className="cap-body">
          <aside className="cap-rail">
            <div className="cap-rail__head">
              <span>Lanes by team</span>
              <em>
                {totals.lanes} {totals.lanes === 1 ? 'lane' : 'lanes'}
              </em>
            </div>
            <div className="cap-rail__body">
              {grouped.map(({ team: t, lanes: laneRows }) => {
                const open = !closedTeams.includes(t.id)
                const loads = laneRows.reduce((sum, l) => sum + l.loadsPerWk, 0)
                return (
                  <section key={t.id} className="cap-group">
                    <button
                      type="button"
                      className="cap-group__head"
                      onClick={() =>
                        setClosedTeams((prev) =>
                          prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id]
                        )
                      }
                    >
                      <i className="cap-avatar">{t.initials}</i>
                      <span className="cap-group__who">
                        <strong>
                          {t.name}
                          {t.myTeam && <em className="cap-mine">My team</em>}
                        </strong>
                        <span>
                          {t.lead} · {laneRows.length} lanes · {loads} loads/wk
                        </span>
                      </span>
                      <TeamRing score={teamScore(laneRows)} />
                      <Caret open={open} />
                    </button>

                    {open && (
                      <div className="cap-group__lanes">
                        {laneRows.map((lane) => {
                          const m = laneMetrics(lane)
                          const fav = lane.carriers.find((c) => c.favourite)
                          return (
                            <button
                              key={lane.id}
                              type="button"
                              className={cn('cap-lane-row', active?.id === lane.id && 'is-on')}
                              onClick={() => setOpenLane(lane.id)}
                            >
                              <span className="cap-lane-row__top">
                                <strong>
                                  {lane.origin.split(',')[0]} → {lane.destination.split(',')[0]}
                                </strong>
                                <em>{lane.loadsPerWk}/wk</em>
                              </span>
                              <span className="cap-lane-row__meta">
                                {lane.equipment} · {lane.miles.toLocaleString()} mi · {lane.customer}
                              </span>
                              <span className="cap-lane-row__bar">
                                <i
                                  className={coverageTone(m.coverage)}
                                  style={{ width: `${m.coverage}%` }}
                                />
                              </span>
                              <span className="cap-lane-row__foot">
                                <em className={m.gap > 0 ? 'is-bad' : 'is-good'}>
                                  {m.gap > 0 ? `${m.gap} short · ${m.coverage}%` : `Fully covered`}
                                </em>
                                {fav && (
                                  <em className="cap-fav">
                                    <Star size={9} fill="currentColor" />
                                    {fav.name.split(' ')[0]}
                                  </em>
                                )}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </section>
                )
              })}
              {grouped.length === 0 && <p className="cap-empty">No lanes match these filters.</p>}
            </div>
          </aside>

          <main className="cap-main">
            {active ? (
              <LaneWorkspace
                lane={active}
                team={activeTeam}
                dismissed={dismissed}
                onDismissInsight={onDismissInsight}
                onCommit={onCommit}
                onToggleFavourite={onToggleFavourite}
                onTogglePause={onTogglePause}
                onMakePrimary={onMakePrimary}
              />
            ) : (
              <div className="cap-card cap-card__pad">
                <p className="cap-empty">Pick a lane on the left to see its capacity.</p>
              </div>
            )}
          </main>
        </div>
      ) : (
        <div className="cap-tablewrap">
          <table className="cap-table cap-table--lanes">
            <thead>
              <tr>
                <th>Team</th>
                <th>Lane</th>
                <th>Equip</th>
                <th>Customer</th>
                <th className="cap-num">Loads / wk</th>
                <th className="cap-num">Committed</th>
                <th>Coverage</th>
                <th className="cap-num">Gap</th>
                <th className="cap-num">Weighted rate</th>
                <th className="cap-num">vs market</th>
                <th className="cap-num">Accept</th>
                <th className="cap-num">On time</th>
                <th>Lane favourite</th>
                <th className="cap-num">Insights</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lane) => {
                const m = laneMetrics(lane)
                const t = capacityTeams.find((x) => x.id === lane.teamId)
                const fav = lane.carriers.find((c) => c.favourite)
                const open = active?.id === lane.id
                const insightCount = laneInsights(lane).filter(
                  (i) => !dismissed.includes(`${lane.id}:${i.id}`)
                ).length
                return (
                  <Fragment key={lane.id}>
                    <tr
                      className={cn('cap-tr', open && 'is-open')}
                      onClick={() => setOpenLane(open ? '' : lane.id)}
                    >
                      <td>
                        <div className="cap-cell-2">
                          <strong>{t?.name}</strong>
                          <span>{t?.lead}</span>
                        </div>
                      </td>
                      <td>
                        <div className="cap-cell-2">
                          <strong>
                            {lane.origin} → {lane.destination}
                          </strong>
                          <span>
                            {lane.miles.toLocaleString()} mi · {lane.corridor}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="cap-equip">{lane.equipment}</span>
                      </td>
                      <td>{lane.customer}</td>
                      <td className="cap-num">{lane.loadsPerWk}</td>
                      <td className="cap-num">{m.committed}</td>
                      <td>
                        <div className="cap-cover">
                          <b className={coverageTone(m.coverage)}>{m.coverage}%</b>
                          <i>
                            <span
                              className={coverageTone(m.coverage)}
                              style={{ width: `${m.coverage}%` }}
                            />
                          </i>
                        </div>
                      </td>
                      <td className="cap-num">
                        {m.gap > 0 ? (
                          <span className="cap-flag is-bad">{m.gap} short</span>
                        ) : (
                          <span className="cap-flag is-good">Covered</span>
                        )}
                      </td>
                      <td className="cap-num">{money(lane.weightedRate)}</td>
                      <td
                        className={cn('cap-num cap-pct', m.vsMarketPct > 2 ? 'is-bad' : 'is-good')}
                      >
                        {m.vsMarketPct >= 0 ? '+' : ''}
                        {m.vsMarketPct.toFixed(1)}%
                      </td>
                      <td className={cn('cap-num cap-pct', pctTone(m.accept))}>{m.accept}%</td>
                      <td className={cn('cap-num cap-pct', pctTone(m.onTime))}>{m.onTime}%</td>
                      <td>
                        {fav ? (
                          <span className="cap-fav">
                            <Star size={10} fill="currentColor" />
                            {fav.name}
                          </span>
                        ) : (
                          <span className="cap-flag is-warn">None set</span>
                        )}
                      </td>
                      <td className="cap-num">
                        <span className="cap-count">{insightCount}</span>
                      </td>
                    </tr>
                    {open && (
                      <tr className="cap-tr-detail">
                        <td colSpan={14}>
                          <LaneWorkspace
                            lane={lane}
                            team={t}
                            dismissed={dismissed}
                            onDismissInsight={onDismissInsight}
                            onCommit={onCommit}
                            onToggleFavourite={onToggleFavourite}
                            onTogglePause={onTogglePause}
                            onMakePrimary={onMakePrimary}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={14} className="cap-empty">
                    No lanes match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="cap-tablefoot">
            <span>
              {totals.lanes} lanes · {totals.loads} loads/wk · {totals.uncovered} uncovered
            </span>
            <span>Click a row to open the lane in place</span>
          </div>
        </div>
      )}
    </div>
  )
}
