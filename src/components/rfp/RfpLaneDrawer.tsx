import { ChevronLeft, ChevronRight, CircleCheckBig, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Tip } from '@/components/Tip'
import {
  annualMargin,
  annualRevenue,
  compactMoney,
  confidenceBand,
  confidenceLabel,
  confidenceParts,
  laneConfidence,
  laneFlags,
  laneMargin,
  money,
  perLoadMargin,
  rateForMargin,
  rfpFlagHex,
  signed,
  vsIncumbent,
  type Rfp,
  type RfpLane,
} from '@/data/rfpManager'

type Props = {
  rfp: Rfp
  lane: RfpLane
  index: number
  total: number
  onClose: () => void
  onStep: (delta: number) => void
  onRate: (rate: number | null) => void
  onNoBid: () => void
}

/** Round margin ladder around the target, the way a pricer thinks in steps. */
function ladder(target: number) {
  const base = Math.round(target / 2) * 2 - 6
  return [0, 1, 2, 3, 4].map((step) => base + step * 2).filter((pct) => pct > 0)
}

export function RfpLaneDrawer({
  rfp,
  lane,
  index,
  total,
  onClose,
  onStep,
  onRate,
  onNoBid,
}: Props) {
  const target = rfp.targetMargin
  const score = laneConfidence(lane)
  const band = confidenceBand(score)
  const margin = laneMargin(lane)
  const perLoad = perLoadMargin(lane)
  const vs = vsIncumbent(lane)
  const flags = laneFlags(lane, target)
  const clear = flags.length === 1 && flags[0].tone === 'clear'

  return (
    <div className="rfp-drawer" role="dialog" aria-label={`${lane.origin} to ${lane.destination}`}>
      <button type="button" className="rfp-drawer__backdrop" aria-label="Close" onClick={onClose} />

      <section className="rfp-drawer__panel">
        <header className="rfp-drawer__head">
          <div>
            <h2>
              {lane.origin} <ChevronRight size={15} /> {lane.destination}
              <span className="rfp-equip">{lane.equipment}</span>
            </h2>
            <em>
              row {lane.row} in their file · {lane.miles.toLocaleString()} mi ·{' '}
              {lane.annualLoads} loads/yr
            </em>
          </div>
          <div className="rfp-drawer__nav">
            <button
              type="button"
              className="rfp-icon-btn"
              aria-label="Previous lane"
              disabled={index === 0}
              onClick={() => onStep(-1)}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              className="rfp-icon-btn"
              aria-label="Next lane"
              disabled={index >= total - 1}
              onClick={() => onStep(1)}
            >
              <ChevronRight size={15} />
            </button>
            <button type="button" className="rfp-btn" onClick={onClose}>
              <X size={14} /> Close
            </button>
          </div>
        </header>

        <div className="rfp-drawer__body">
          <div className="rfp-drawer__row">
            <article className="rfp-panel">
              <span className="rfp-panel__kicker">Rate &amp; margin</span>

              <div className="rfp-price">
                <div className="rfp-price__cost">
                  <span>Our cost</span>
                  <strong>{money(lane.ourCost)}</strong>
                  <em>from {lane.costSource.toLowerCase()}</em>
                </div>
                <label className="rfp-price__rate">
                  <span>Our rate (target {target}%)</span>
                  <input
                    inputMode="decimal"
                    value={lane.rate ?? ''}
                    placeholder="—"
                    onChange={(event) => {
                      const next = Number(event.target.value.replace(/[^0-9.]/g, ''))
                      onRate(Number.isFinite(next) && next > 0 ? next : null)
                    }}
                  />
                </label>
              </div>

              <div className="rfp-ladder">
                {ladder(target).map((pct) => {
                  const rate = rateForMargin(lane.ourCost, pct)
                  return (
                    <Tip
                      key={pct}
                      tip={
                        <>
                          <b>
                            Price at {pct}% · {money(rate)}
                          </b>
                          <em>
                            Leaves {money(rate - lane.ourCost)} a load,{' '}
                            {compactMoney((rate - lane.ourCost) * lane.annualLoads)} across the year.
                          </em>
                        </>
                      }
                    >
                      <button type="button" onClick={() => onRate(Math.round(rate * 100) / 100)}>
                        {pct}% <i>→</i> {money(rate)}
                      </button>
                    </Tip>
                  )
                })}
                <Tip tip={`Snap back to this file's ${target}% target margin.`}>
                  <button
                    type="button"
                    className="rfp-ladder__reset"
                    onClick={() => onRate(Math.round(rateForMargin(lane.ourCost, target)))}
                  >
                    target {target}%
                  </button>
                </Tip>
              </div>

              <div className="rfp-price__facts">
                <div>
                  <span>Margin</span>
                  <strong className={cn(margin !== null && margin < target - 1.5 && 'is-warn')}>
                    {margin === null ? '—' : `${margin.toFixed(1)}%`}
                  </strong>
                </div>
                <div>
                  <span>Per load</span>
                  <strong>{perLoad === null ? '—' : money(perLoad)}</strong>
                </div>
                <div>
                  <span>Annual revenue</span>
                  <strong>{lane.rate ? compactMoney(annualRevenue(lane)) : '—'}</strong>
                </div>
                <div>
                  <span>Annual margin</span>
                  <strong>{lane.rate ? compactMoney(annualMargin(lane)) : '—'}</strong>
                </div>
              </div>

              <footer className="rfp-panel__foot">
                <span>vs their incumbent rate</span>
                <b className={cn(vs !== null && vs > 0 && 'is-warn', vs !== null && vs <= 0 && 'is-good')}>
                  {vs === null ? 'not given' : `${signed(vs)} of ${money(lane.incumbent ?? 0)}`}
                </b>
              </footer>
            </article>

            <article className="rfp-panel">
              <span className="rfp-panel__kicker">Confidence — why {score}</span>

              <div className="rfp-conf">
                <strong className={`is-${band}`}>{score}</strong>
                <div>
                  <span className={`rfp-conf__band is-${band}`}>{confidenceLabel[band]}</span>
                  <p>
                    {band === 'thin'
                      ? 'Mostly market reference — we have barely run this lane.'
                      : 'Built from our own record on this lane, not a vendor feed.'}
                  </p>
                </div>
              </div>

              <ul className="rfp-score">
                {confidenceParts(lane).map((part) => (
                  <Tip
                    key={part.label}
                    as="li"
                    tip={
                      <>
                        <b>
                          {part.got} of {part.of} points
                        </b>
                        <em>
                          {part.label}: {part.detail}. This factor is worth up to {part.of} of the
                          100-point score.
                        </em>
                      </>
                    }
                  >
                    <span>{part.label}</span>
                    <em>{part.detail}</em>
                    <b>
                      {part.got} / {part.of}
                    </b>
                    <i>
                      <u style={{ width: `${(part.got / part.of) * 100}%` }} />
                    </i>
                  </Tip>
                ))}
              </ul>
            </article>
          </div>

          <article className="rfp-panel">
            <span className="rfp-panel__kicker">Flags on this lane</span>
            {clear ? (
              <p className="rfp-note is-good">
                <CircleCheckBig size={14} />
                Nothing flagged — priced at {margin === null ? `${target}%` : `${margin.toFixed(1)}%`}{' '}
                with {confidenceLabel[band]}.
              </p>
            ) : (
              <ul className="rfp-flag-list">
                {flags.map((flag) => (
                  <li key={flag.label} style={{ ['--tone' as string]: rfpFlagHex[flag.tone] }}>
                    <TriangleAlert size={13} />
                    <strong>{flag.label}</strong>
                    <span>{flagCopy(flag.label, lane, target)}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="rfp-panel">
            <span className="rfp-panel__kicker">Their row, their shape</span>
            <div className="rfp-fields">
              <Field label="Lane ID" value={lane.laneId} />
              <Field label="Orig city / prov" value={lane.origin} />
              <Field label="Dest city / prov" value={lane.destination} />
              <Field label="Equip" value={lane.equipment} />
              <Field label="Annual loads" value={String(lane.annualLoads)} />
              <Field label="Distance (mi)" value={String(lane.miles)} />
              <Field
                label="Incumbent rate"
                value={lane.incumbent ? money(lane.incumbent) : 'not given'}
              />
              <Field label="Fuel program" value={lane.fuelProgram} unmapped />
              <Field label="Award split %" value={String(lane.awardSplit)} unmapped />
              <Field label="Comments" value={lane.comments} unmapped />
            </div>
            <p className="rfp-fields__note">
              Dashed columns weren&rsquo;t mapped — they&rsquo;re written back to the export exactly
              as they arrived.
            </p>
          </article>
        </div>

        <footer className="rfp-drawer__foot">
          <span>
            Lane {index + 1} of {total} in this walk · row {lane.row} in their file
          </span>
          <button type="button" className={cn('rfp-btn', lane.noBid && 'is-on')} onClick={onNoBid}>
            {lane.noBid ? 'Undo no bid' : 'No bid'}
          </button>
          <button
            type="button"
            className="rfp-btn rfp-btn--primary"
            disabled={index >= total - 1}
            onClick={() => onStep(1)}
          >
            Next lane <ChevronRight size={14} />
          </button>
        </footer>
      </section>
    </div>
  )
}

function Field({
  label,
  value,
  unmapped,
}: {
  label: string
  value: string
  unmapped?: boolean
}) {
  return (
    <div className={cn('rfp-field', unmapped && 'is-unmapped')}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function flagCopy(label: string, lane: RfpLane, target: number) {
  if (label === 'Cross-border') return 'Customs paperwork and a border wait sit inside the cost.'
  if (label === 'Thin history') return 'Cost leans on market reference, so treat the rate as a guess.'
  if (label === 'Above incumbent') return 'We are asking more than the carrier they use today.'
  if (label.startsWith('±')) return 'Our own cost record swings this much on the lane.'
  if (label === 'Under target') return `Priced under the ${target}% target for this file.`
  if (label === 'Over target') return `Priced over the ${target}% target — check we stay competitive.`
  if (label === 'Manual') return 'Someone typed this rate, so bulk apply leaves it alone.'
  if (label === 'No bid') return 'Returned blank to the customer on purpose.'
  return `Row ${lane.row} in their file.`
}
