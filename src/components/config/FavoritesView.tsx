import { useMemo, useState } from 'react'
import { MapPin, Star, Users } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  FAV_ALL_CARRIERS,
  FAV_BUSINESS_UNITS,
  FAV_LANES,
  FAV_TEAMS,
  type FavCarrier,
} from '@/data/autoWorkflows'

type FavScope = 'all' | 'teams' | 'lanes' | 'bu'

function RankPill({ n }: { n: number }) {
  return <em className={cn('fav-rank', n <= 3 && 'is-top')}>#{n}</em>
}

function CarrierRow({ c, showRank = true }: { c: FavCarrier; showRank?: boolean }) {
  return (
    <li className="fav-row">
      {showRank && <RankPill n={c.rank} />}
      <span className="fav-row__main">
        <strong>{c.name}</strong>
        <em>
          {c.mc} · {c.city}
        </em>
      </span>
      <span className="fav-row__meta">
        <i className={cn('fav-ch', `is-${c.channel.toLowerCase()}`)}>{c.channel}</i>
        <span>{c.contact}</span>
      </span>
      <span className="fav-row__stat">
        <b>{c.loads90}</b>
        <em>loads / 90d</em>
      </span>
      <span className="fav-row__stat">
        <b>{c.onTime}</b>
        <em>on time</em>
      </span>
    </li>
  )
}

export function FavoritesView() {
  const [scope, setScope] = useState<FavScope>('all')
  const [teamId, setTeamId] = useState(FAV_TEAMS[0].id)
  const [buId, setBuId] = useState(FAV_BUSINESS_UNITS[0].id)
  const [laneId, setLaneId] = useState(FAV_LANES[0].id)
  const [q, setQ] = useState('')

  const team = FAV_TEAMS.find((t) => t.id === teamId) ?? FAV_TEAMS[0]
  const bu = FAV_BUSINESS_UNITS.find((b) => b.id === buId) ?? FAV_BUSINESS_UNITS[0]
  const lane = FAV_LANES.find((l) => l.id === laneId) ?? FAV_LANES[0]

  const allFiltered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return FAV_ALL_CARRIERS
    return FAV_ALL_CARRIERS.filter((c) =>
      [c.name, c.mc, c.city, c.contact].join(' ').toLowerCase().includes(needle)
    )
  }, [q])

  const scopes: [FavScope, string, number][] = [
    ['all', 'All favourites', FAV_ALL_CARRIERS.length],
    ['teams', 'By team', FAV_TEAMS.length],
    ['lanes', 'Favourite lanes', FAV_LANES.length],
    ['bu', 'By business unit', FAV_BUSINESS_UNITS.length],
  ]

  return (
    <div className="fav">
      <header className="fav__head">
        <div>
          <strong>Favourite carriers</strong>
          <p>
            Shared shortlists used by auto sourcing — by person, team, lane and business unit.
          </p>
        </div>
        <div className="fav__stats">
          <span>
            <b>{FAV_ALL_CARRIERS.length}</b> carriers
          </span>
          <span>
            <b>{FAV_TEAMS.length}</b> teams
          </span>
          <span>
            <b>{FAV_LANES.length}</b> lanes
          </span>
          <span>
            <b>{FAV_BUSINESS_UNITS.length}</b> business units
          </span>
        </div>
      </header>

      <div className="fav__scopes" role="tablist" aria-label="Favourites view">
        {scopes.map(([id, label, n]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={scope === id}
            className={cn(scope === id && 'is-on')}
            onClick={() => setScope(id)}
          >
            {label}
            <i>{n}</i>
          </button>
        ))}
      </div>

      {scope === 'all' && (
        <section className="fav__panel">
          <div className="fav__toolbar">
            <label className="fav__search">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search favourite carrier, MC, city…"
                aria-label="Search favourite carriers"
              />
            </label>
            <em>
              {allFiltered.length} of {FAV_ALL_CARRIERS.length}
            </em>
          </div>
          <ul className="fav__list">
            {allFiltered.map((c) => (
              <CarrierRow key={c.id} c={c} />
            ))}
            {allFiltered.length === 0 && (
              <li className="fav__blank">No favourites match that search.</li>
            )}
          </ul>
        </section>
      )}

      {scope === 'teams' && (
        <div className="fav__split">
          <aside className="fav__nav">
            <span className="fav__navlabel">
              <Users size={12} />
              Teams
            </span>
            {FAV_TEAMS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={cn('fav__navitem', teamId === t.id && 'is-on')}
                onClick={() => setTeamId(t.id)}
              >
                <strong>{t.name}</strong>
                <em>
                  {t.lead} · {t.carriers.length} fav
                </em>
              </button>
            ))}
          </aside>
          <section className="fav__panel">
            <header className="fav__panelhead">
              <div>
                <strong>{team.name}</strong>
                <p>
                  Lead {team.lead} · {team.bu}
                </p>
              </div>
              <span className="fav__badge">
                <Star size={11} fill="currentColor" />
                {team.carriers.length} favourites
              </span>
            </header>
            <ul className="fav__list">
              {team.carriers.map((c) => (
                <CarrierRow key={c.id} c={c} />
              ))}
            </ul>
          </section>
        </div>
      )}

      {scope === 'lanes' && (
        <div className="fav__split">
          <aside className="fav__nav">
            <span className="fav__navlabel">
              <MapPin size={12} />
              Lanes
            </span>
            {FAV_LANES.map((l) => (
              <button
                key={l.id}
                type="button"
                className={cn('fav__navitem', laneId === l.id && 'is-on')}
                onClick={() => setLaneId(l.id)}
              >
                <strong>
                  {l.origin.split(',')[0]} → {l.destination.split(',')[0]}
                </strong>
                <em>
                  {l.loads30} loads / 30d · {l.carriers.length} carriers
                </em>
              </button>
            ))}
          </aside>
          <section className="fav__panel">
            <header className="fav__panelhead">
              <div>
                <strong>
                  {lane.origin} → {lane.destination}
                </strong>
                <p>
                  {lane.miles} mi · {lane.equipment} · {lane.loads30} loads in the last 30 days
                </p>
              </div>
            </header>
            <ul className="fav__list">
              {lane.carriers.map((c) => (
                <li key={c.mc} className="fav-row">
                  <RankPill n={c.rank} />
                  <span className="fav-row__main">
                    <strong>{c.name}</strong>
                    <em>{c.mc}</em>
                  </span>
                  <span className="fav-row__meta is-muted">Lane favourite</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {scope === 'bu' && (
        <div className="fav__split">
          <aside className="fav__nav">
            <span className="fav__navlabel">Business units</span>
            {FAV_BUSINESS_UNITS.map((b) => (
              <button
                key={b.id}
                type="button"
                className={cn('fav__navitem', buId === b.id && 'is-on')}
                onClick={() => setBuId(b.id)}
              >
                <strong>{b.name}</strong>
                <em>
                  {b.code} · {b.teams} team{b.teams === 1 ? '' : 's'} · {b.carriers.length} fav
                </em>
              </button>
            ))}
          </aside>
          <section className="fav__panel">
            <header className="fav__panelhead">
              <div>
                <strong>{bu.name}</strong>
                <p>
                  {bu.code} · {bu.teams} team{bu.teams === 1 ? '' : 's'} sharing this shortlist
                </p>
              </div>
              <span className="fav__badge">
                <Star size={11} fill="currentColor" />
                {bu.carriers.length} favourites
              </span>
            </header>
            <ul className="fav__list">
              {bu.carriers.map((c) => (
                <CarrierRow key={c.id} c={c} />
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}
