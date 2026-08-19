import { Fragment } from 'react'
import { ChevronRight, Download, Mail, Phone, Star } from 'lucide-react'
import { cn } from '@/lib/cn'
import { isLapsed, perLoad, vsMarketPct, type BookCarrier } from '@/data/carrierBook'
import { CarrierHoverCard, Sparkline, money, pctTone, useCarrierHover } from './bookParts'

const RANGES = ['All time', 'Last 90 days', 'Last 30 days'] as const
const FLAGS = ['Lapsed', 'New', 'Has claims', 'Above market'] as const

export type TrackRange = (typeof RANGES)[number]
export type TrackFlag = (typeof FLAGS)[number]

function LaneShare({ c }: { c: BookCarrier }) {
  return (
    <div className="bk-detail__lanes">
      {c.lanes.map((l) => (
        <div key={l.lane} className="bk-detail__lane">
          <span>
            {l.favourite && <Star size={10} fill="currentColor" />}
            {l.lane}
          </span>
          <em>{l.loads} loads</em>
          <b>{Math.round((l.loads / c.loadsRun) * 100)}% of total</b>
        </div>
      ))}
    </div>
  )
}

function MonthBars({ months }: { months: number[] }) {
  const peak = Math.max(...months, 1)
  const labels = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
  return (
    <div className="bk-months">
      {months.map((m, i) => (
        <div key={i} className="bk-month">
          <div className="bk-month__bar" style={{ height: `${Math.max(3, (m / peak) * 100)}%` }} />
          <span>{labels[i]}</span>
          <em>{m}</em>
        </div>
      ))}
    </div>
  )
}

export function TrackRecordView({
  carriers,
  range,
  setRange,
  flags,
  toggleFlag,
  openId,
  setOpenId,
  favourites,
  onToggleFavourite,
}: {
  carriers: BookCarrier[]
  range: TrackRange
  setRange: (r: TrackRange) => void
  flags: TrackFlag[]
  toggleFlag: (f: TrackFlag) => void
  openId: string | null
  setOpenId: (id: string | null) => void
  favourites: string[]
  onToggleFavourite: (id: string) => void
}) {
  const { hover, bind } = useCarrierHover()
  const loads = carriers.reduce((sum, c) => sum + c.loadsRun, 0)
  const spend = carriers.reduce((sum, c) => sum + c.spend, 0)
  const lapsed = carriers.filter(isLapsed).length

  return (
    <div className="bk-view">
      <div className="bk-filters">
        <div className="bk-seg" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              className={cn(range === r && 'is-on')}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="bk-chips">
          {FLAGS.map((f) => (
            <button
              key={f}
              type="button"
              className={cn('bk-chip', flags.includes(f) && 'is-on')}
              aria-pressed={flags.includes(f)}
              onClick={() => toggleFlag(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button type="button" className="bk-btn bk-btn--quiet bk-filters__export">
          <Download size={12} />
          Export history
        </button>
      </div>

      <div className="bk-tablewrap">
        <table className="bk-table bk-table--record">
          <thead>
            <tr>
              <th className="bk-col-caret" aria-label="Expand" />
              <th>Carrier</th>
              <th className="bk-num">Loads run</th>
              <th>Last 6 months</th>
              <th>Last load</th>
              <th className="bk-num">Spend</th>
              <th className="bk-num">Accept</th>
              <th className="bk-num">On time</th>
              <th className="bk-num">Claims</th>
              <th className="bk-num">vs market</th>
              <th>Owned by</th>
              <th className="bk-col-star" aria-label="Favourite" />
            </tr>
          </thead>
          <tbody>
            {carriers.map((c) => {
              const open = openId === c.id
              const vs = vsMarketPct(c)
              const fav = favourites.includes(c.id)
              return (
                <Fragment key={c.id}>
                  <tr
                    className={cn('bk-tr', open && 'is-open')}
                    onClick={() => setOpenId(open ? null : c.id)}
                  >
                    <td className="bk-col-caret">
                      <ChevronRight size={13} className={cn('bk-caret', open && 'is-open')} />
                    </td>
                    <td {...bind(c)}>
                      <div className="bk-cell-2">
                        <strong>{c.name}</strong>
                        <span>
                          MC {c.mc} · {c.city}, {c.state}
                        </span>
                      </div>
                    </td>
                    <td className="bk-num">
                      <div className="bk-cell-2 is-right">
                        <strong>{c.loadsRun.toLocaleString()}</strong>
                        <span>since {c.since}</span>
                      </div>
                    </td>
                    <td>
                      <Sparkline months={c.months} />
                    </td>
                    <td>
                      <div className="bk-cell-2">
                        <span className={cn('bk-last', isLapsed(c) && 'is-bad')}>{c.lastLoad}</span>
                        {isLapsed(c) && <em className="bk-tag is-warn">lapsed</em>}
                        {c.isNew && !isLapsed(c) && <em className="bk-tag is-info">new</em>}
                      </div>
                    </td>
                    <td className="bk-num">
                      <div className="bk-cell-2 is-right">
                        <strong>{money(c.spend)}</strong>
                        <span>{money(perLoad(c))} / load</span>
                      </div>
                    </td>
                    <td className={cn('bk-num bk-pct', pctTone(c.accept))}>{c.accept}%</td>
                    <td className={cn('bk-num bk-pct', pctTone(c.onTime))}>{c.onTime}%</td>
                    <td className="bk-num">
                      <span
                        className={cn(
                          'bk-tag',
                          c.claims === 0 ? 'is-good' : c.claims > 1 ? 'is-bad' : 'is-warn'
                        )}
                      >
                        {c.claims === 0 ? 'none' : c.claims}
                      </span>
                    </td>
                    <td className={cn('bk-num bk-pct', vs > 3 ? 'is-bad' : vs > 0 ? 'is-warn' : 'is-good')}>
                      {vs >= 0 ? '+' : ''}
                      {vs.toFixed(1)}%
                    </td>
                    <td>
                      {c.owner === 'You' ? (
                        <span className="bk-role is-rep">
                          <i />
                          You
                        </span>
                      ) : (
                        <span className="bk-muted">{c.owner}</span>
                      )}
                    </td>
                    <td className="bk-col-star">
                      <button
                        type="button"
                        className={cn('bk-star', fav && 'is-on')}
                        aria-pressed={fav}
                        aria-label={fav ? `Remove ${c.name} from favourites` : `Add ${c.name} to favourites`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavourite(c.id)
                        }}
                      >
                        <Star size={13} fill={fav ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                  </tr>

                  {open && (
                    <tr className="bk-tr-detail">
                      <td colSpan={12}>
                        <div className="bk-detail">
                          <header className="bk-detail__head">
                            <div className="bk-detail__who">
                              <strong>{c.name}</strong>
                              {fav && (
                                <span className="bk-rankpill">
                                  <Star size={9} fill="currentColor" />
                                  Favourite{c.rank ? ` #${c.rank}` : ''}
                                </span>
                              )}
                              <span>
                                MC {c.mc} · DOT {c.dot} · owned by{' '}
                                {c.owner === 'You' ? 'you' : c.owner}
                                {c.backupRep ? ` · backup ${c.backupRep}` : ''} · insurance to{' '}
                                {c.insuranceExpiry}
                              </span>
                            </div>
                            <div className="bk-detail__acts">
                              <button type="button" className="bk-btn bk-btn--quiet">
                                <Mail size={12} />
                                Email
                              </button>
                              <button type="button" className="bk-btn bk-btn--quiet">
                                <Phone size={12} />
                                Call
                              </button>
                              <button
                                type="button"
                                className="bk-btn bk-btn--quiet"
                                onClick={() => onToggleFavourite(c.id)}
                              >
                                <Star size={12} fill={fav ? 'currentColor' : 'none'} />
                                {fav ? 'Remove favourite' : 'Make favourite'}
                              </button>
                            </div>
                          </header>

                          <div className="bk-detail__metrics">
                            <div className="bk-tile">
                              <span>Loads run</span>
                              <strong>{c.loadsRun.toLocaleString()}</strong>
                              <em>
                                first {c.since} · last {c.lastLoad}
                              </em>
                            </div>
                            <div className="bk-tile">
                              <span>Total spend</span>
                              <strong>{money(c.spend)}</strong>
                              <em>{money(perLoad(c))} per load</em>
                            </div>
                            <div className="bk-tile">
                              <span>Acceptance</span>
                              <strong className={pctTone(c.accept)}>{c.accept}%</strong>
                              <em>on {c.lanes.length} lanes</em>
                            </div>
                            <div className="bk-tile">
                              <span>On time</span>
                              <strong className={pctTone(c.onTime)}>{c.onTime}%</strong>
                              <em>rolling</em>
                            </div>
                            <div className="bk-tile">
                              <span>Claims</span>
                              <strong className={c.claims ? 'is-bad' : 'is-good'}>{c.claims}</strong>
                              <em>lifetime</em>
                            </div>
                            <div className="bk-tile">
                              <span>Rate vs market</span>
                              <strong className={vs > 3 ? 'is-bad' : vs > 0 ? 'is-warn' : 'is-good'}>
                                {vs >= 0 ? '+' : ''}
                                {vs.toFixed(1)}%
                              </strong>
                              <em>
                                {money(perLoad(c))} against {money(c.marketPerLoad)}
                              </em>
                            </div>
                          </div>

                          <div className="bk-detail__split">
                            <section className="bk-panel">
                              <div className="bk-panel__head">
                                <strong>Lanes we have run together</strong>
                                <p>Where the volume actually went.</p>
                              </div>
                              <LaneShare c={c} />
                            </section>

                            <section className="bk-panel">
                              <div className="bk-panel__head">
                                <strong>Volume by month</strong>
                                <p>Loads moved, last six months.</p>
                              </div>
                              <MonthBars months={c.months} />
                            </section>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
            {carriers.length === 0 && (
              <tr>
                <td colSpan={12} className="bk-empty">
                  No history matches these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="bk-tablefoot">
          <span>
            {carriers.length} carriers · {loads.toLocaleString()} loads · {money(spend)} spend
            {lapsed > 0 ? ` · ${lapsed} lapsed` : ''}
          </span>
          <span>Click a row to open the full history</span>
        </div>
      </div>

      <CarrierHoverCard hover={hover} />
    </div>
  )
}
