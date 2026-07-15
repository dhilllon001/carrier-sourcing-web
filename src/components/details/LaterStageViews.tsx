import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Download,
  ExternalLink,
  FileText,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import type { LoadDetail } from '@/data/loadDetail'
import { StageActionBar } from '@/components/details/StageActionBar'
import {
  CARRIER_CONFIRMATION_ID,
  CARRIER_CONFIRMATION_PDF,
  CarrierConfirmationPdf,
} from '@/components/details/CarrierConfirmationPdf'

function awardedBid(detail: LoadDetail) {
  return (
    detail.bids.find((b) => b.status === 'Accepted') ??
    detail.bids.find((b) => b.best) ??
    detail.bids[0]
  )
}

function Facts({
  title,
  rows,
}: {
  title: string
  rows: { label: string; value: string; mono?: boolean; link?: boolean; wide?: boolean }[]
}) {
  return (
    <section className="dd-stpanel">
      <div className="dd-stpanel__title">{title}</div>
      <div className="dd-ov-facts">
        {rows.map((r) => (
          <div key={r.label} className={cn(r.wide && 'dd-ov-facts__wide')}>
            <span>{r.label}</span>
            <strong className={cn(r.mono && 'mono', r.link && 'is-link')}>{r.value}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

function MetricStrip({
  items,
}: {
  items: { label: string; value: string; tone?: 'book' | 'max' | 'reject' }[]
}) {
  return (
    <div className="dd-stmetrics">
      {items.map((item) => (
        <div key={item.label} className={cn(item.tone && `is-${item.tone}`)}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  )
}

/* ── Finalize Tender ── */
export function FinalizeTenderView({ detail }: { detail: LoadDetail }) {
  const awarded = awardedBid(detail)
  const [confirmed, setConfirmed] = useState(!!awarded && awarded.status === 'Accepted')

  const checks = [
    { label: 'Insurance on file', ok: true, note: 'COI valid through Dec 2026' },
    { label: 'Authority active', ok: true, note: 'FMCSA common carrier' },
    {
      label: 'Rate within max buy',
      ok: !!awarded && awarded.vsTarget.startsWith('-'),
      note: `${awarded?.amount ?? '—'} vs ${detail.maxBuy}`,
    },
    { label: 'Contact verified', ok: !!awarded?.phone, note: awarded?.phone ?? 'Missing phone' },
    { label: 'Equipment match', ok: true, note: awarded?.equipment ?? detail.load.equipment },
  ]

  return (
    <div className="dd-stage dd-stage--apple">
      <StageActionBar
        label="Finalize Tender"
        actions={
          <>
            <button type="button" className="dd-pill-btn" aria-label="Refresh">
              <RefreshCw size={14} />
            </button>
            <button type="button" className="dd-pill-btn">
              <FileText size={14} />
              Export packet
            </button>
            <button
              type="button"
              className="dd-pill-btn dd-pill-btn--emphasis"
              disabled={!awarded}
              onClick={() => setConfirmed(true)}
            >
              <Check size={14} />
              {confirmed ? 'Carrier Confirmed' : 'Confirm Carrier'}
            </button>
          </>
        }
      />

      {awarded ? (
        <>
          <MetricStrip
            items={[
              { label: 'All-in', value: awarded.allIn ?? awarded.amount, tone: 'book' },
              { label: 'Rate / mi', value: awarded.amount },
              { label: 'Max buy', value: detail.maxBuy, tone: 'max' },
              { label: 'vs target', value: awarded.vsTarget.replace(' vs Target', '') },
            ]}
          />

          <div className="dd-stgrid dd-stgrid--3">
            <section className="dd-stpanel dd-stpanel--hero">
              <div className="dd-stpanel__title">Awarded carrier</div>
              <div className="dd-award-hero">
                <div>
                  <strong>{awarded.carrier}</strong>
                  <em>
                    MC# {awarded.mc}
                    {awarded.dot ? ` · DOT ${awarded.dot}` : ''}
                  </em>
                </div>
                <span className={cn('dd-ststatus', confirmed ? 'is-ok' : 'is-live')}>
                  {confirmed ? 'Confirmed' : awarded.status}
                </span>
              </div>
              <div className="dd-ov-facts" style={{ marginTop: 10 }}>
                <div>
                  <span>Contact</span>
                  <strong>{awarded.contact ?? '—'}</strong>
                </div>
                <div>
                  <span>Channel</span>
                  <strong>{awarded.channel ?? '—'}</strong>
                </div>
                <div>
                  <span>Phone</span>
                  <strong>{awarded.phone ?? '—'}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{awarded.email ?? '—'}</strong>
                </div>
                <div>
                  <span>Equipment</span>
                  <strong>{awarded.equipment ?? detail.load.equipment}</strong>
                </div>
                <div>
                  <span>Source</span>
                  <strong>{awarded.source ?? '—'}</strong>
                </div>
              </div>
            </section>

            <Facts
              title="Shipment"
              rows={[
                { label: 'Probill', value: detail.load.id, mono: true },
                { label: 'Order', value: detail.orderNumber, link: true },
                { label: 'Customer', value: detail.load.customer, link: true },
                { label: 'Miles', value: `${detail.load.miles.toLocaleString()} mi`, mono: true },
                { label: 'Book now', value: detail.bookNowRate, mono: true },
                { label: 'Team', value: detail.load.team },
              ]}
            />

            <section className="dd-stpanel">
              <div className="dd-stpanel__title">Pre-confirm checks</div>
              <div className="dd-checklist">
                {checks.map((c) => (
                  <div key={c.label} className={cn('dd-checkrow', c.ok ? 'is-ok' : 'is-fail')}>
                    <div>
                      <span>{c.label}</span>
                      <small>{c.note}</small>
                    </div>
                    <em>{c.ok ? 'Pass' : 'Review'}</em>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      ) : (
        <div className="dd-stempty">
          <TrophyIcon />
          <strong>No awarded carrier yet</strong>
          <p>Accept a bid in Offers &amp; Bids to populate this view.</p>
        </div>
      )}
    </div>
  )
}

function TrophyIcon() {
  return (
    <div className="dd-stempty__ico">
      <Truck size={22} strokeWidth={1.6} />
    </div>
  )
}

/* ── CMT Validate ── */
export function CmtValidateView({ detail }: { detail: LoadDetail }) {
  const awarded = awardedBid(detail)
  const [ran, setRan] = useState(!!awarded)
  const checks = useMemo(
    () => [
      { id: 'auth', label: 'FMCSA authority', detail: 'Active · Common carrier', ok: true },
      { id: 'ins', label: 'Cargo insurance', detail: '$100,000 · expires Dec 2026', ok: true },
      {
        id: 'rate',
        label: 'Rate vs reject threshold',
        detail: `${awarded?.amount ?? '—'} ≤ ${detail.rejectAbove}`,
        ok: true,
      },
      {
        id: 'docs',
        label: 'W9 / COI packet',
        detail: awarded ? 'On file · 3 docs' : 'Missing',
        ok: !!awarded,
      },
      { id: 'safety', label: 'Safety score', detail: 'Satisfactory · no out-of-service', ok: true },
      { id: 'watch', label: 'Watchlist screen', detail: 'Clear · no hits', ok: true },
    ],
    [awarded, detail.rejectAbove]
  )
  const passed = ran ? checks.filter((c) => c.ok).length : 0

  return (
    <div className="dd-stage dd-stage--apple">
      {!awarded && (
        <div className="dd-stbanner">
          <AlertTriangle size={14} />
          No accepted offer found for the brokerage leg — accept a carrier offer first.
        </div>
      )}

      <StageActionBar
        label="CMT Validate"
        actions={
          <>
            <button type="button" className="dd-pill-btn" aria-label="Refresh">
              <RefreshCw size={14} />
            </button>
            <button type="button" className="dd-pill-btn">
              <ExternalLink size={14} />
              Open FMCSA
            </button>
            <button
              type="button"
              className="dd-pill-btn dd-pill-btn--emphasis"
              onClick={() => setRan(true)}
              disabled={!awarded}
            >
              <Check size={14} />
              {ran ? 'Re-run checks' : 'Confirm Award'}
            </button>
          </>
        }
      />

      {awarded && (
        <MetricStrip
          items={[
            { label: 'Carrier', value: awarded.carrier },
            { label: 'All-in', value: awarded.allIn ?? awarded.amount, tone: 'book' },
            { label: 'Reject above', value: detail.rejectAbove, tone: 'reject' },
            { label: 'Checks', value: ran ? `${passed}/${checks.length}` : 'Pending' },
          ]}
        />
      )}

      <div className="dd-stgrid dd-stgrid--2">
        <section className="dd-stpanel">
          <div className="dd-stpanel__title-row">
            <span className="dd-stpanel__title">Validation checks</span>
            {ran && <em>{passed} passed</em>}
          </div>
          {ran ? (
            <div className="dd-checklist">
              {checks.map((c) => (
                <div key={c.id} className={cn('dd-checkrow', c.ok ? 'is-ok' : 'is-fail')}>
                  <div>
                    <span>{c.label}</span>
                    <small>{c.detail}</small>
                  </div>
                  <em>{c.ok ? 'Passed' : 'Failed'}</em>
                </div>
              ))}
            </div>
          ) : (
            <div className="dd-stempty dd-stempty--sm">
              <ShieldCheck size={22} strokeWidth={1.6} />
              <strong>No checks available</strong>
              <p>Click Confirm Award to run CMT validation.</p>
            </div>
          )}
        </section>

        <section className="dd-stpanel">
          <div className="dd-stpanel__title">Carrier documents</div>
          {awarded ? (
            <div className="dd-doclist">
              {[
                { name: 'Certificate of Insurance.pdf', meta: 'Uploaded · Jul 10 · 248 KB' },
                { name: 'W9 — Carrier.pdf', meta: 'Uploaded · Jun 22 · 91 KB' },
                { name: 'Carrier packet.zip', meta: 'Uploaded · Jul 12 · 1.4 MB' },
                { name: 'Authority screenshot.png', meta: 'Uploaded · Jul 12 · 620 KB' },
              ].map((d) => (
                <div key={d.name} className="dd-doclist__row">
                  <FileText size={14} />
                  <div>
                    <strong>{d.name}</strong>
                    <em>{d.meta}</em>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dd-stempty dd-stempty--sm">
              <FileText size={22} strokeWidth={1.6} />
              <strong>No documents on file</strong>
              <p>Carrier documents will appear here once uploaded.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

/* ── Finalize Carrier Award ── */
export function FinalizeAwardView({ detail }: { detail: LoadDetail }) {
  const awarded = awardedBid(detail)
  const events = useMemo(() => {
    const stamps = [
      'Jun 5 09:12',
      'Jun 5 11:40',
      'Jun 5 14:08',
      'Jun 5 16:22',
      'Jun 5 17:48',
      'Jul 10 08:15',
      'Jul 12 10:04',
      'Jul 13 09:30',
      'Jul 13 11:18',
      'Jul 13 12:36',
    ]
    const rows: {
      when: string
      title: string
      tag: string
      status: 'Complete' | 'InProgress'
      path: string
      who?: string
      note?: string
    }[] = []
    let i = 0
    for (const block of detail.stages) {
      for (const item of block.items) {
        rows.push({
          when: stamps[i % stamps.length],
          title: item.label,
          tag: item.done ? 'COMPLETE' : 'IN PROGRESS',
          status: item.done ? 'Complete' : 'InProgress',
          path: `${block.stage} → ${item.label}`,
          who: item.done ? 'ops@chargerlogistics.com' : 'pending@chargerlogistics.com',
          note: item.done ? 'Logged by desk' : 'Awaiting next action',
        })
        i++
      }
    }
    return rows.slice(0, 10)
  }, [detail.stages])

  return (
    <div className="dd-stage dd-stage--apple">
      <StageActionBar
        label="Finalize Carrier Award"
        actions={
          <>
            <button type="button" className="dd-pill-btn" aria-label="Refresh">
              <RefreshCw size={14} />
            </button>
            <button type="button" className="dd-pill-btn">
              <FileText size={14} />
              View timeline
            </button>
            <button type="button" className="dd-pill-btn dd-pill-btn--emphasis">
              Move to Booking
              <ArrowRight size={14} />
            </button>
          </>
        }
      />

      {awarded && (
        <MetricStrip
          items={[
            { label: 'Awarded', value: awarded.carrier },
            { label: 'All-in', value: awarded.allIn ?? awarded.amount, tone: 'book' },
            { label: 'Status', value: 'Awaiting ack' },
            { label: 'Events', value: String(events.length) },
          ]}
        />
      )}

      <div className="dd-stgrid dd-stgrid--award">
        <section className="dd-stpanel">
          <div className="dd-stpanel__title-row">
            <span className="dd-stpanel__title">Lifecycle timeline</span>
            <em>{events.length} events</em>
          </div>
          <div className="dd-timeline">
            {events.map((e, i) => (
              <div key={`${e.title}-${i}`} className="dd-timeline__item">
                <div className="dd-timeline__when">{e.when}</div>
                <div className={cn('dd-timeline__dot', e.status === 'Complete' ? 'is-done' : 'is-live')} />
                <div className="dd-timeline__card">
                  <div className="dd-timeline__top">
                    <strong>{e.title}</strong>
                    <span>{e.tag}</span>
                  </div>
                  <div className="dd-timeline__bot">
                    <em className={e.status === 'Complete' ? 'is-ok' : 'is-live'}>{e.status}</em>
                    <span>{e.path}</span>
                    {e.note && <small>{e.note}</small>}
                    {e.who && <small>{e.who}</small>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="dd-ststack">
          <section className="dd-stpanel">
            <div className="dd-stpanel__title">Awarded to</div>
            {awarded ? (
              <div className="dd-award-side">
                <strong>{awarded.carrier}</strong>
                <em>
                  MC# {awarded.mc} · {awarded.contact ?? 'Dispatch'}
                </em>
                <div className="dd-ov-facts" style={{ marginTop: 10 }}>
                  <div>
                    <span>All-in</span>
                    <strong>{awarded.allIn ?? awarded.amount}</strong>
                  </div>
                  <div>
                    <span>Rate / mi</span>
                    <strong>{awarded.amount}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{awarded.phone ?? '—'}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{awarded.email ?? '—'}</strong>
                  </div>
                  <div>
                    <span>Equipment</span>
                    <strong>{awarded.equipment ?? detail.load.equipment}</strong>
                  </div>
                  <div>
                    <span>Channel</span>
                    <strong>{awarded.channel ?? '—'}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="dd-stempty dd-stempty--sm">
                <Truck size={22} strokeWidth={1.6} />
                <strong>No awarded carrier yet</strong>
                <p>The awarded carrier will appear here once confirmed.</p>
              </div>
            )}
          </section>

          <Facts
            title="Next actions"
            rows={[
              { label: 'Ack due', value: 'Today · 6:00 PM' },
              { label: 'Reminders', value: 'Auto · every 2h' },
              { label: 'Escalation', value: detail.csr },
              { label: 'Booking gate', value: awarded ? 'Unlocked' : 'Locked' },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

/* ── Create Contract wizard ── */
export function CreateContractView({ detail }: { detail: LoadDetail }) {
  const [step, setStep] = useState(0)
  const [contractType, setContractType] = useState<'Brokerage' | 'Power Only' | 'Trailer Move'>(
    'Brokerage'
  )
  const [arrangedWith, setArrangedWith] = useState('')
  const [dispatchedBy, setDispatchedBy] = useState(detail.csr)
  const [role, setRole] = useState('Brokerage Spot')
  const [category, setCategory] = useState(detail.load.team)
  const [carrierRef, setCarrierRef] = useState('')
  const [rate, setRate] = useState(
    (awardedBid(detail)?.allIn ?? detail.targetAllIn ?? '0').replace(/[^0-9.]/g, '') || '0.00'
  )

  const pickup = detail.stops[0]
  const delivery = detail.stops[detail.stops.length - 1]
  const awarded = awardedBid(detail)
  const steps = [
    { label: 'Load Assignment', hint: 'Type · legs · equipment' },
    { label: 'Contract Properties', hint: 'Terms · ownership · rate' },
    { label: 'Driver & Equipment', hint: 'Assets · readiness' },
    { label: 'Carrier Confirmation', hint: 'Packet · review' },
  ] as const

  const contractOptions = [
    {
      label: 'Brokerage' as const,
      desc: 'Carrier provides truck + trailer',
      tone: 'is-blue',
    },
    {
      label: 'Power Only' as const,
      desc: 'Carrier provides truck, we provide trailer',
      tone: 'is-orange',
    },
    {
      label: 'Trailer Move' as const,
      desc: 'Moving our trailer between yards',
      tone: 'is-green',
    },
  ]

  return (
    <div className="dd-stage dd-stage--apple dd-wizard">
      <StageActionBar
        label="Create Contract"
        leading={<span className="dd-chip-soft">{`Step ${step + 1} of ${steps.length}`}</span>}
        actions={
          <>
            <button
              type="button"
              className="dd-pill-btn"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </button>
            <button type="button" className="dd-pill-btn" aria-label="Refresh">
              <RefreshCw size={14} />
            </button>
            <button
              type="button"
              className="dd-pill-btn dd-pill-btn--emphasis"
              onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            >
              {step < steps.length - 1 ? `Next: ${steps[step + 1].label}` : 'Finish contract'}
              <ArrowRight size={14} />
            </button>
          </>
        }
      />

      <div className="dd-wizard__progress">
        <div className="dd-wizard__progress-head">
          <div>
            <strong>{steps[step].label}</strong>
            <em>
              Step {step + 1} of {steps.length} · {steps[step].hint}
            </em>
          </div>
          <span className="dd-wizard__pct">{Math.round(((step + 1) / steps.length) * 100)}% complete</span>
        </div>
        <div className="dd-wizard__track" aria-hidden>
          <i style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="dd-wizard__steps">
          {steps.map((s, i) => {
            const done = i < step
            const active = i === step
            return (
              <button
                key={s.label}
                type="button"
                className={cn(
                  'dd-wizard__step',
                  active && 'is-active',
                  done && 'is-done'
                )}
                onClick={() => setStep(i)}
              >
                <span className="dd-wizard__bullet">
                  {done ? <Check size={12} strokeWidth={2.5} /> : i + 1}
                </span>
                <span className="dd-wizard__step-copy">
                  <strong>{s.label}</strong>
                  <em>{s.hint}</em>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {step === 0 && (
        <div className="dd-wizard__body">
          <section className="dd-wizard-card">
            <div className="dd-wizard-card__head">
              <div>
                <strong>Contract type</strong>
                <em>Choose first to filter legs &amp; carriers</em>
              </div>
              <span className="dd-wizard-badge is-blue">{contractType}</span>
            </div>
            <p className="dd-wizard-card__q">How will this carrier operate on this load?</p>
            <div className="dd-wizard-choices">
              {contractOptions.map((opt) => {
                const selected = contractType === opt.label
                return (
                  <button
                    key={opt.label}
                    type="button"
                    className={cn('dd-wizard-choice', opt.tone, selected && 'is-active')}
                    onClick={() => setContractType(opt.label)}
                  >
                    <div>
                      <strong>{opt.label}</strong>
                      <em>{opt.desc}</em>
                    </div>
                    {selected ? (
                      <span className="dd-wizard-choice__tag">Selected</span>
                    ) : (
                      <span className="dd-wizard-choice__radio" />
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="dd-wizard-card">
            <div className="dd-wizard-card__head">
              <div>
                <strong>Load</strong>
                <em>Pickup &amp; delivery from this shipment</em>
              </div>
              <span className="dd-wizard-badge is-neutral">{detail.load.equipment}</span>
            </div>
            <div className="dd-wizard-legs">
              <article className="dd-wizard-leg is-pickup">
                <div className="dd-wizard-leg__top">
                  <span>
                    <MapPin size={12} />
                    Pickup
                  </span>
                  <em>{pickup?.status ?? 'Window'}</em>
                </div>
                <strong>{pickup?.facility ?? '—'}</strong>
                <p>
                  {pickup?.city ?? '—'}
                  {pickup?.when ? ` · ${pickup.when}` : ''}
                </p>
                <div className="dd-wizard-leg__meta">
                  <span>Ref</span>
                  <strong className="mono">{detail.references.shipper || detail.load.id}</strong>
                </div>
              </article>
              <article className="dd-wizard-leg is-delivery">
                <div className="dd-wizard-leg__top">
                  <span>
                    <MapPin size={12} />
                    Delivery
                  </span>
                  <em>{delivery?.status ?? 'Window'}</em>
                </div>
                <strong>{delivery?.facility ?? '—'}</strong>
                <p>
                  {delivery?.city ?? '—'}
                  {delivery?.when ? ` · ${delivery.when}` : ''}
                </p>
                <div className="dd-wizard-leg__meta">
                  <span>Ref</span>
                  <strong className="mono">{detail.references.consignee || detail.orderNumber}</strong>
                </div>
              </article>
            </div>
          </section>

          <section className="dd-wizard-card">
            <div className="dd-wizard-card__head">
              <div>
                <strong>Equipment type</strong>
                <em>Auto-selected from contract type and load specs</em>
              </div>
              <span className="dd-wizard-badge is-green">Auto</span>
            </div>
            <div className="dd-wizard-equip">
              <div className="dd-wizard-equip__ico">
                <Truck size={18} />
              </div>
              <div>
                <strong>{detail.load.equipment}</strong>
                <em>
                  Auto-selected for {contractType} · {detail.load.miles.toLocaleString()} mi lane
                </em>
              </div>
              <Check size={16} className="dd-wizard-equip__check" />
            </div>
          </section>
        </div>
      )}

      {step === 1 && (
        <div className="dd-wizard__body">
          {!awarded && (
            <div className="dd-stbanner">
              <AlertTriangle size={14} />
              No awarded carrier on this leg yet — fill terms manually for the packet.
            </div>
          )}
          <section className="dd-wizard-card">
            <div className="dd-wizard-card__head">
              <div>
                <strong>Contract terms</strong>
                <em>Fill assignment and rate details for this contract</em>
              </div>
              <span className="dd-wizard-badge is-blue">{detail.currency}</span>
            </div>
            <div className="dd-wizard-form">
              <label className="dd-wizard-field">
                <span>
                  Arranged with <i>*</i>
                </span>
                <select value={arrangedWith} onChange={(e) => setArrangedWith(e.target.value)}>
                  <option value="">Select carrier contact…</option>
                  {awarded && (
                    <option value={awarded.contact ?? awarded.carrier}>
                      {awarded.contact ?? awarded.carrier}
                      {awarded.email ? ` · ${awarded.email}` : ''}
                    </option>
                  )}
                  <option value="Dispatch desk">Dispatch desk</option>
                </select>
                <em>Primary contact at this carrier for this contract</em>
              </label>
              <label className="dd-wizard-field">
                <span>
                  Dispatched by <i>*</i>
                </span>
                <select value={dispatchedBy} onChange={(e) => setDispatchedBy(e.target.value)}>
                  <option value={detail.csr}>{detail.csr}</option>
                  <option value={detail.salesRep}>{detail.salesRep}</option>
                  <option value={detail.accountManager}>{detail.accountManager}</option>
                </select>
                <em>Internal user owning this contract</em>
              </label>
              <label className="dd-wizard-field">
                <span>
                  Rate <i>*</i>
                </span>
                <div className="dd-wizard-rate">
                  <em>{detail.currency} $</em>
                  <input value={rate} onChange={(e) => setRate(e.target.value)} />
                </div>
                <em>Agreed total payable to carrier</em>
              </label>
              <label className="dd-wizard-field">
                <span>
                  Role <i>*</i>
                </span>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option>Brokerage Spot</option>
                  <option>Power Only</option>
                  <option>Dedicated</option>
                  <option>Trailer Move</option>
                </select>
                <em>Movement type for this contract</em>
              </label>
              <label className="dd-wizard-field">
                <span>
                  Category <i>*</i>
                </span>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value={detail.load.team}>{detail.load.team}</option>
                  <option>Ontario</option>
                  <option>Midwest</option>
                  <option>West</option>
                </select>
                <em>Operating region / category bucket</em>
              </label>
              <label className="dd-wizard-field">
                <span>Carrier reference (optional)</span>
                <input
                  value={carrierRef}
                  onChange={(e) => setCarrierRef(e.target.value)}
                  placeholder="e.g. CR-2026-0412"
                />
                <em>Carrier&apos;s own internal load / PO number</em>
              </label>
            </div>
          </section>

          <div className="dd-wizard-split">
            <Facts
              title="Rate summary"
              rows={[
                { label: 'Contract type', value: contractType },
                { label: 'Book now', value: detail.bookNowRate, mono: true },
                { label: 'Awarded rate', value: awarded?.amount ?? '—', mono: true },
                { label: 'All-in draft', value: `$${rate || '0.00'}`, mono: true },
                { label: 'Payment terms', value: 'Net 30' },
                { label: 'Fuel surcharge', value: 'Included' },
              ]}
            />
            <Facts
              title="Ownership"
              rows={[
                { label: 'Carrier', value: awarded?.carrier ?? '—' },
                { label: 'MC #', value: awarded?.mc ?? '—', mono: true },
                { label: 'Team', value: detail.load.team },
                { label: 'Broker', value: detail.load.broker || '—' },
                { label: 'Sales rep', value: detail.salesRep },
                { label: 'Division', value: detail.division, wide: true },
              ]}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="dd-wizard__body">
          <div className="dd-wizard-split">
            <section className="dd-wizard-card">
              <div className="dd-wizard-card__head">
                <div>
                  <strong>Driver</strong>
                  <em>Assigned at dispatch unless carrier provides details now</em>
                </div>
                <span className="dd-wizard-badge is-orange">Pending</span>
              </div>
              <div className="dd-ov-facts">
                <div>
                  <span>Driver name</span>
                  <strong>Assigned at dispatch</strong>
                </div>
                <div>
                  <span>Phone</span>
                  <strong>{awarded?.phone ?? '—'}</strong>
                </div>
                <div>
                  <span>CDL</span>
                  <strong>Pending upload</strong>
                </div>
                <div>
                  <span>HOS status</span>
                  <strong>Available</strong>
                </div>
                <div>
                  <span>ELD provider</span>
                  <strong>Samsara</strong>
                </div>
                <div>
                  <span>Languages</span>
                  <strong>EN · ES</strong>
                </div>
              </div>
            </section>
            <section className="dd-wizard-card">
              <div className="dd-wizard-card__head">
                <div>
                  <strong>Equipment</strong>
                  <em>Linked to {contractType} selection</em>
                </div>
                <span className="dd-wizard-badge is-green">Ready</span>
              </div>
              <div className="dd-ov-facts">
                <div>
                  <span>Trailer type</span>
                  <strong>{detail.load.equipment}</strong>
                </div>
                <div>
                  <span>Contract type</span>
                  <strong>{contractType}</strong>
                </div>
                <div>
                  <span>Tractor</span>
                  <strong>{contractType === 'Trailer Move' ? 'Internal' : 'Carrier supplied'}</strong>
                </div>
                <div>
                  <span>Reefer setpoint</span>
                  <strong>
                    {detail.load.equipment.toUpperCase().includes('REEFER') ? '34°F' : 'N/A'}
                  </strong>
                </div>
                <div>
                  <span>Length</span>
                  <strong>53 ft</strong>
                </div>
                <div>
                  <span>Plate / unit</span>
                  <strong>Pending assign</strong>
                </div>
              </div>
            </section>
          </div>
          <section className="dd-wizard-card is-soft">
            <div className="dd-wizard-equip">
              <div className="dd-wizard-equip__ico">
                <Package size={18} />
              </div>
              <div>
                <strong>Resource readiness</strong>
                <em>
                  Driver details can be completed after confirmation. Equipment is locked to{' '}
                  {detail.load.equipment}.
                </em>
              </div>
              <span className="dd-wizard-badge is-blue">Step 3</span>
            </div>
          </section>
        </div>
      )}

      {step === 3 && (
        <div className="dd-wizard__body dd-wizard__body--confirm">
          <section className="dd-wizard-card dd-wizard-card--hero">
            <div className="dd-wizard-card__head">
              <div>
                <strong>Carrier information</strong>
                <em>Review packet before finishing the contract</em>
              </div>
              <span className="dd-wizard-badge is-green">Ready</span>
            </div>
            <div className="dd-award-hero">
              <div>
                <strong>{awarded?.carrier ?? 'No carrier'}</strong>
                <em>
                  {contractType} · {detail.load.equipment} · {detail.load.miles.toLocaleString()} mi
                </em>
              </div>
              <div className="dd-award-hero__rate">
                <span>Confirm at</span>
                <strong>{awarded?.allIn ?? `$${rate || '0.00'}`}</strong>
              </div>
            </div>
            <div className="dd-ov-facts" style={{ marginTop: 10 }}>
              <div>
                <span>Document</span>
                <strong className="mono">Carrier_Confirmation_{CARRIER_CONFIRMATION_ID}.pdf</strong>
              </div>
              <div>
                <span>Contract #</span>
                <strong className="mono">{CARRIER_CONFIRMATION_ID}</strong>
              </div>
              <div>
                <span>Contact</span>
                <strong>{awarded?.contact ?? (arrangedWith || '—')}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{awarded?.email ?? '—'}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{awarded?.phone ?? '—'}</strong>
              </div>
              <div>
                <span>MC #</span>
                <strong className="mono">{awarded?.mc ?? '—'}</strong>
              </div>
            </div>
            <div className="dd-checklist" style={{ marginTop: 12 }}>
              {[
                'Rate and equipment match award',
                'Pickup appointment confirmed',
                'Carrier acknowledgement requested',
                'Contract packet ready to send',
              ].map((t) => (
                <div key={t} className="dd-checkrow is-ok">
                  <span>{t}</span>
                  <em>Ready</em>
                </div>
              ))}
            </div>
          </section>
          <CarrierConfirmationPdf />
        </div>
      )}
    </div>
  )
}

/* ── Booking confirmation / resources ── */
export function BookingStageView({
  detail,
  kind,
}: {
  detail: LoadDetail
  kind: 'Send Confirmation' | 'Signed Confirmation' | 'Resources'
}) {
  const awarded = awardedBid(detail)
  const [note, setNote] = useState('')
  const [ccName, setCcName] = useState('Sukhdeep')
  const contactLabel = awarded
    ? `${awarded.contact ?? awarded.carrier}${awarded.email ? ` [${awarded.email}]` : ''}`
    : 'Select carrier contact…'

  if (kind === 'Resources') {
    return (
      <div className="dd-stage dd-stage--apple">
        <StageActionBar
          label="Resources"
          actions={
            <>
              <button type="button" className="dd-pill-btn" aria-label="Refresh">
                <RefreshCw size={14} />
              </button>
              <button type="button" className="dd-pill-btn">
                <FileText size={14} />
                Preview
              </button>
              <button type="button" className="dd-pill-btn dd-pill-btn--emphasis">
                <Check size={14} />
                Assign resources
              </button>
            </>
          }
        />

        <MetricStrip
          items={[
            { label: 'Carrier', value: awarded?.carrier ?? '—' },
            { label: 'All-in', value: awarded?.allIn ?? awarded?.amount ?? '—', tone: 'book' },
            { label: 'Customer', value: detail.load.customer },
            { label: 'Miles', value: `${detail.load.miles.toLocaleString()} mi` },
          ]}
        />

        <div className="dd-stgrid dd-stgrid--2">
          <Facts
            title="Shipment"
            rows={[
              { label: 'Probill', value: detail.load.id, mono: true },
              { label: 'Customer', value: detail.load.customer, link: true },
              { label: 'Carrier', value: awarded?.carrier ?? '—' },
              { label: 'Rate', value: awarded?.allIn ?? awarded?.amount ?? '—', mono: true },
              { label: 'Origin', value: detail.load.origin },
              { label: 'Destination', value: detail.load.destination },
              { label: 'Equipment', value: detail.load.equipment },
              { label: 'Team', value: detail.load.team },
            ]}
          />
          <Facts
            title="Resource board"
            rows={[
              { label: 'Driver', value: 'Unassigned' },
              { label: 'Tractor', value: 'Unassigned' },
              { label: 'Trailer', value: detail.load.equipment },
              { label: 'Tracking', value: 'FourKites · pending' },
              { label: 'Dispatcher', value: detail.csr },
              { label: 'Ready to execute', value: 'No' },
            ]}
          />
        </div>
      </div>
    )
  }

  const isSigned = kind === 'Signed Confirmation'

  return (
    <div className="dd-stage dd-stage--apple">
      <StageActionBar
        label={isSigned ? 'Signed Confirmation' : 'Send Confirmation'}
        leading={
          <span className="dd-chip-soft">Contract {CARRIER_CONFIRMATION_ID} · DocuSign</span>
        }
        actions={
          <>
            <a className="dd-pill-btn" href={CARRIER_CONFIRMATION_PDF} download>
              <Download size={14} />
              Download
            </a>
            <button type="button" className="dd-pill-btn dd-pill-btn--emphasis">
              {isSigned ? (
                <>
                  <Check size={14} />
                  Mark signed
                </>
              ) : (
                <>
                  <Send size={14} />
                  Send
                </>
              )}
            </button>
          </>
        }
      />

      <div className="dd-confirm-layout">
        <section className="dd-stpanel dd-send-form">
          <div className="dd-stpanel__title">
            {isSigned ? 'Carrier acknowledgement' : 'Send carrier confirmation'}
          </div>
          <p className="dd-stpanel__q">
            Contract {CARRIER_CONFIRMATION_ID} — select contacts and{' '}
            {isSigned ? 'track the signed packet.' : 'send via DocuSign.'}
          </p>

          <label className="dd-field">
            <span>
              Carrier contact <i>*</i>
            </span>
            <div className="dd-contact-chip">{contactLabel}</div>
            <em>Primary carrier recipient for this confirmation</em>
          </label>

          <label className="dd-field">
            <span>Email CC</span>
            <div className="dd-cc-row">
              <input value={ccName} onChange={(e) => setCcName(e.target.value)} />
              <span className="dd-cc-domain">@chargerlogistics.com</span>
              <button type="button" className="dd-cc-add" aria-label="Add CC">
                <Plus size={14} />
              </button>
            </div>
            <em>Internal recipients copied on the confirmation</em>
          </label>

          <label className="dd-field">
            <span>Note</span>
            <textarea
              rows={5}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)."
            />
          </label>

          <div className="dd-ov-facts" style={{ marginTop: 4 }}>
            <div>
              <span>Document</span>
              <strong className="mono">Carrier_Confirmation_{CARRIER_CONFIRMATION_ID}.pdf</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{isSigned ? 'Signed · on file' : 'Ready to send'}</strong>
            </div>
            <div>
              <span>Carrier</span>
              <strong>{awarded?.carrier ?? '—'}</strong>
            </div>
            <div>
              <span>All-in</span>
              <strong>{awarded?.allIn ?? awarded?.amount ?? '—'}</strong>
            </div>
          </div>
        </section>

        <CarrierConfirmationPdf title={`Carrier Confirmation · ${CARRIER_CONFIRMATION_ID}`} />
      </div>
    </div>
  )
}
