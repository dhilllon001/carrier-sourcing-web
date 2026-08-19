import { ArrowDown, ArrowUp, Plus, Star } from 'lucide-react'
import { cn } from '@/lib/cn'
import { vsMarketPct, type BookCarrier } from '@/data/carrierBook'
import { CarrierHoverCard, pctTone, useCarrierHover } from './bookParts'

export function FavouritesRankView({
  ranked,
  poolAccept,
  onMove,
  onRemove,
  onOpen,
}: {
  ranked: BookCarrier[]
  poolAccept: number
  onMove: (id: string, delta: number) => void
  onRemove: (id: string) => void
  onOpen: (id: string) => void
}) {
  const { hover, bind } = useCarrierHover()
  const avgAccept = ranked.length
    ? Math.round(ranked.reduce((sum, c) => sum + c.accept, 0) / ranked.length)
    : 0

  return (
    <div className="bk-view">
      <section className="bk-note">
        <span className="bk-note__icon">
          <Star size={12} fill="currentColor" />
        </span>
        <div className="bk-note__body">
          <strong>Ranked shortlist — sourcing tenders these first</strong>
          <p>
            Any workflow set to “favourites first” walks this list in order, before the open market.
            A lane favourite overrides the rank on its own lane.
          </p>
        </div>
        <div className="bk-note__stats">
          <span className="bk-tag">
            {ranked.length} {ranked.length === 1 ? 'favourite' : 'favourites'}
          </span>
          <span className="bk-tag is-good">
            {avgAccept}% avg accept · pool {poolAccept}%
          </span>
        </div>
        <button type="button" className="bk-btn bk-btn--primary">
          <Plus size={12} strokeWidth={2.4} />
          Add favourite
        </button>
      </section>

      <div className="bk-tablewrap">
        <table className="bk-table">
          <thead>
            <tr>
              <th className="bk-col-rank">Rank</th>
              <th>Carrier</th>
              <th>Why they’re here</th>
              <th>Lane favourite on</th>
              <th className="bk-num">Accept</th>
              <th className="bk-num">On time</th>
              <th className="bk-num">vs market</th>
              <th className="bk-col-acts" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {ranked.map((c, i) => {
              const vs = vsMarketPct(c)
              const laneFav = c.lanes.find((l) => l.favourite)
              return (
                <tr key={c.id} className="bk-tr" onClick={() => onOpen(c.id)}>
                  <td className="bk-col-rank">
                    <div className="bk-rank">
                      <b>{i + 1}</b>
                      <span>
                        <button
                          type="button"
                          aria-label={`Move ${c.name} up`}
                          disabled={i === 0}
                          onClick={(e) => {
                            e.stopPropagation()
                            onMove(c.id, -1)
                          }}
                        >
                          <ArrowUp size={10} strokeWidth={2.6} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Move ${c.name} down`}
                          disabled={i === ranked.length - 1}
                          onClick={(e) => {
                            e.stopPropagation()
                            onMove(c.id, 1)
                          }}
                        >
                          <ArrowDown size={10} strokeWidth={2.6} />
                        </button>
                      </span>
                    </div>
                  </td>
                  <td {...bind(c)}>
                    <div className="bk-cell-2">
                      <strong>{c.name}</strong>
                      <span>
                        MC {c.mc} · {c.city}, {c.state}
                      </span>
                    </div>
                  </td>
                  <td className="bk-why">
                    {c.loadsRun.toLocaleString()} loads · {c.accept}% accept ·{' '}
                    {c.claims === 0 ? 'no claims' : `${c.claims} claim${c.claims > 1 ? 's' : ''}`}
                  </td>
                  <td>
                    {laneFav ? (
                      <span className="bk-lane is-fav">
                        <Star size={9} fill="currentColor" />
                        {laneFav.lane}
                      </span>
                    ) : (
                      <span className="bk-muted">Global favourite only</span>
                    )}
                  </td>
                  <td className={cn('bk-num bk-pct', pctTone(c.accept))}>
                    {c.accept}%
                    <em className="bk-sub">{c.lanes.length} lanes</em>
                  </td>
                  <td className={cn('bk-num bk-pct', pctTone(c.onTime))}>{c.onTime}%</td>
                  <td className={cn('bk-num bk-pct', vs > 3 ? 'is-bad' : vs > 0 ? 'is-warn' : 'is-good')}>
                    {vs >= 0 ? '+' : ''}
                    {vs.toFixed(1)}%
                  </td>
                  <td className="bk-col-acts">
                    <button
                      type="button"
                      className="bk-btn bk-btn--quiet"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemove(c.id)
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              )
            })}
            {ranked.length === 0 && (
              <tr>
                <td colSpan={8} className="bk-empty">
                  No favourites yet — star a carrier in My book to build the shortlist.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CarrierHoverCard hover={hover} />
    </div>
  )
}
