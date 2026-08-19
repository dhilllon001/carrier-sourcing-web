import { AlertTriangle, Star, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  bookAlerts,
  isLapsed,
  type BookCarrier,
} from '@/data/carrierBook'
import {
  CarrierHoverCard,
  InsuranceCell,
  LaneChips,
  RoleChip,
  pctTone,
  useCarrierHover,
} from './bookParts'

export function MyBookView({
  carriers,
  dismissed,
  onDismiss,
  favourites,
  onToggleFavourite,
  onOpen,
}: {
  carriers: BookCarrier[]
  dismissed: string[]
  onDismiss: (id: string) => void
  favourites: string[]
  onToggleFavourite: (id: string) => void
  onOpen: (id: string) => void
}) {
  const { hover, bind } = useCarrierHover()
  const alerts = bookAlerts(carriers).filter((a) => !dismissed.includes(a.id))

  return (
    <div className="bk-view">
      {alerts.length > 0 && (
        <section className="bk-needs">
          <div className="bk-needs__head">
            <AlertTriangle size={13} strokeWidth={2.2} />
            <strong>Needs you today</strong>
            <span>
              Only carriers you own · {alerts.length} open {alerts.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="bk-needs__row">
            {alerts.map((a) => (
              <article key={a.id} className={cn('bk-need', `is-${a.level}`)}>
                <span className="bk-need__icon">
                  {a.level === 'critical' ? (
                    <AlertTriangle size={12} strokeWidth={2.3} />
                  ) : (
                    <TrendingUp size={12} strokeWidth={2.3} />
                  )}
                </span>
                <div className="bk-need__body">
                  <strong>{a.title}</strong>
                  <p>{a.detail}</p>
                  <div className="bk-need__acts">
                    <button type="button" className="bk-btn bk-btn--primary">
                      {a.action}
                    </button>
                    <button
                      type="button"
                      className="bk-btn bk-btn--quiet"
                      onClick={() => onDismiss(a.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="bk-tablewrap">
        <table className="bk-table">
          <thead>
            <tr>
              <th>Carrier</th>
              <th>My role</th>
              <th>Lanes we run</th>
              <th className="bk-num">Loads</th>
              <th className="bk-num">Accept</th>
              <th className="bk-num">On time</th>
              <th>Last load</th>
              <th>Insurance</th>
              <th className="bk-col-star" aria-label="Favourite" />
            </tr>
          </thead>
          <tbody>
            {carriers.map((c) => {
              const fav = favourites.includes(c.id)
              return (
                <tr
                  key={c.id}
                  className={cn(
                    'bk-tr',
                    c.insurance !== 'ok' && 'has-flag',
                    isLapsed(c) && 'is-quiet'
                  )}
                  onClick={() => onOpen(c.id)}
                >
                  <td {...bind(c)}>
                    <div className="bk-cell-2">
                      <strong>{c.name}</strong>
                      <span>
                        MC {c.mc} · {c.city}, {c.state}
                      </span>
                    </div>
                  </td>
                  <td>
                    <RoleChip c={c} />
                  </td>
                  <td>
                    <LaneChips c={c} />
                  </td>
                  <td className="bk-num bk-strong">{c.loadsRun.toLocaleString()}</td>
                  <td className={cn('bk-num bk-pct', pctTone(c.accept))}>{c.accept}%</td>
                  <td className={cn('bk-num bk-pct', pctTone(c.onTime))}>{c.onTime}%</td>
                  <td>
                    <div className="bk-cell-2">
                      <span className={cn('bk-last', isLapsed(c) && 'is-bad')}>{c.lastLoad}</span>
                      {isLapsed(c) && <em className="bk-tag is-warn">lapsed</em>}
                    </div>
                  </td>
                  <td>
                    <InsuranceCell c={c} />
                  </td>
                  <td className="bk-col-star">
                    <button
                      type="button"
                      className={cn('bk-star', fav && 'is-on')}
                      aria-pressed={fav}
                      aria-label={fav ? `Remove ${c.name} from favourites` : `Add ${c.name} to favourites`}
                      title={fav ? 'On the ranked shortlist' : 'Add to the ranked shortlist'}
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleFavourite(c.id)
                      }}
                    >
                      <Star size={13} fill={fav ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                </tr>
              )
            })}
            {carriers.length === 0 && (
              <tr>
                <td colSpan={9} className="bk-empty">
                  No carriers in your book match this search.
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
