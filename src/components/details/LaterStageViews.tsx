import { useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ExternalLink,
  FileText,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import type { LoadDetail } from '@/data/loadDetail'

function awardedBid(detail: LoadDetail) {
  return (
    detail.bids.find((b) => b.status === 'Accepted') ??
    detail.bids.find((b) => b.best) ??
    detail.bids[0]
  )
}

function StageHead({
  title,
  hint,
  actions,
}: {
  title: string
  hint: string
  actions?: ReactNode
}) {
  return (
    <div className="dd-sthead">
      <div>
        <h2>{title}</h2>
        <p>{hint}</p>
      </div>
      {actions ? <div className="dd-sthead__actions">{actions}</div> : null}
    </div>
  )
}

function Facts({
  title,
  rows,
}: {
  title: string
  rows: { label: string; value: string; mono?: boolean; link?: boolean }[]
}) {
  return (
    <section className="dd-stpanel">
      <div className="dd-stpanel__title">{title}</div>
      <div className="dd-ov-facts">
        {rows.map((r) => (
          <div key={r.label} className={rows.length % 2 === 1 && r === rows[rows.length - 1] ? 'dd-ov-facts__wide' : undefined}>
            <span>{r.label}</span>
            <strong className={cn(r.mono && 'mono', r.link && 'is-link')}>{r.value}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Finalize Tender ── */
export function FinalizeTenderView({ detail }: { detail: LoadDetail }) {
  const awarded = awardedBid(detail)
  const pickup = detail.stops[0]
  const delivery = detail.stops[detail.stops.length - 1]
  const [confirmed, setConfirmed] = useState(!!awarded && awarded.status === 'Accepted')

  const checks = [
    { label: 'Insurance on file', ok: true },
    { label: 'Authority active', ok: true },
    { label: 'Rate within max buy', ok: !!awarded && awarded.vsTarget.startsWith('-') },
    { label: 'Contact verified', ok: !!awarded?.phone },
  ]

  return (
    <div className="dd-stage dd-stage--apple">
      <StageHead
        title="Finalize Tender"
        hint="Confirm the awarded carrier, review rates, and clear compliance checks."
        actions={
          <button
            type="button"
            className={cn('dd-pill-btn', confirmed ? 'dd-pill-btn--emphasis' : 'dd-pill-btn--emphasis')}
            disabled={!awarded}
            onClick={() => setConfirmed(true)}
          >
            <Check size={14} />
            {confirmed ? 'Carrier Confirmed' : 'Confirm Carrier'}
          </button>
        }
      />

      {awarded ? (
        <div className="dd-stgrid">
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
              <div className="dd-award-hero__rate">
                <span>All-in</span>
                <strong>{awarded.allIn ?? awarded.amount}</strong>
              </div>
            </div>
            <div className="dd-ov-facts" style={{ marginTop: 10 }}>
              <div>
                <span>Bid / mi</span>
                <strong>{awarded.amount}</strong>
              </div>
              <div>
                <span>vs target</span>
                <strong>{awarded.vsTarget.replace(' vs Target', '')}</strong>
              </div>
              <div>
                <span>Contact</span>
                <strong>{awarded.contact ?? '—'}</strong>
              </div>
              <div>
                <span>Channel</span>
                <strong>{awarded.channel ?? '—'}</strong>
              </div>
              <div>
                <span>Equipment</span>
                <strong>{awarded.equipment ?? detail.load.equipment}</strong>
              </div>
              <div>
                <span>Team</span>
                <strong>{detail.load.team}</strong>
              </div>
            </div>
          </section>

          <Facts
            title="Lane & load"
            rows={[
              { label: 'Probill', value: detail.load.id, mono: true },
              { label: 'Order', value: detail.orderNumber, link: true },
              { label: 'Pickup', value: `${pickup?.city ?? '—'} · ${pickup?.when ?? ''}` },
              { label: 'Delivery', value: `${delivery?.city ?? '—'} · ${delivery?.when ?? ''}` },
              { label: 'Miles', value: `${detail.load.miles.toLocaleString()} mi`, mono: true },
              { label: 'Book now', value: detail.bookNowRate, mono: true },
            ]}
          />

          <section className="dd-stpanel">
            <div className="dd-stpanel__title">Pre-confirm checks</div>
            <div className="dd-checklist">
              {checks.map((c) => (
                <div key={c.label} className={cn('dd-checkrow', c.ok && 'is-ok')}>
                  <span>{c.label}</span>
                  <em>{c.ok ? 'Pass' : 'Review'}</em>
                </div>
              ))}
            </div>
          </section>
        </div>
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
  const [ran, setRan] = useState(false)
  const checks = useMemo(
    () => [
      { id: 'auth', label: 'FMCSA authority', detail: 'Active · Common carrier', ok: true },
      { id: 'ins', label: 'Cargo insurance', detail: '$100,000 · expires Dec 2026', ok: true },
      { id: 'rate', label: 'Rate vs reject threshold', detail: `${awarded?.amount ?? '—'} ≤ ${detail.rejectAbove}`, ok: true },
      { id: 'docs', label: 'W9 / COI packet', detail: awarded ? 'On file' : 'Missing', ok: !!awarded },
      { id: 'safety', label: 'Safety score', detail: 'Satisfactory', ok: true },
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

      <StageHead
        title="CMT Validate"
        hint={`Compliance validation · ${ran ? `${passed} checks · ${passed} passed` : '0 checks · 0 passed'}`}
        actions={
          <>
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
              Confirm Award
            </button>
          </>
        }
      />

      <div className="dd-stgrid dd-stgrid--2">
        <section className="dd-stpanel">
          <div className="dd-stpanel__title">Validation checks</div>
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
                { name: 'Certificate of Insurance.pdf', meta: 'Uploaded · Jul 10' },
                { name: 'W9 — Midwest.pdf', meta: 'Uploaded · Jun 22' },
                { name: 'Carrier packet.zip', meta: 'Uploaded · Jul 12' },
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
    const rows: { when: string; title: string; tag: string; status: 'Complete' | 'InProgress'; path: string; who?: string }[] = []
    for (const block of detail.stages) {
      for (const item of block.items) {
        rows.push({
          when: item.done ? 'Jun 5 17:48' : 'Jul 13 12:36',
          title: item.label,
          tag: item.done ? 'PATCH' : 'INPROGRESS',
          status: item.done ? 'Complete' : 'InProgress',
          path: `${block.stage} → ${item.label}`,
          who: item.done ? 'ops@chargerlogistics.com' : undefined,
        })
      }
    }
    return rows.slice(0, 10)
  }, [detail.stages])

  return (
    <div className="dd-stage dd-stage--apple">
      <StageHead
        title="Awaiting carrier acknowledgement"
        hint="Carrier Award Confirmation"
        actions={
          <button type="button" className="dd-pill-btn dd-pill-btn--emphasis">
            Move to Booking
            <ArrowRight size={14} />
          </button>
        }
      />

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
                    {e.who && <small>{e.who}</small>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

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
      </div>
    </div>
  )
}

/* ── Create Contract wizard ── */
export function CreateContractView({ detail }: { detail: LoadDetail }) {
  const [step, setStep] = useState(0)
  const [contractType, setContractType] = useState<'Brokerage' | 'Power Only' | 'Trailer Move'>('Brokerage')
  const pickup = detail.stops[0]
  const delivery = detail.stops[detail.stops.length - 1]
  const steps = ['Load Assignment', 'Contract Properties', 'Driver & Equipment', 'Carrier Confirmation']
  const awarded = awardedBid(detail)

  return (
    <div className="dd-stage dd-stage--apple">
      <div className="dd-stcrumb">
        Stage · Pre-execution · Create Contract · {steps[step]}
      </div>

      <StageHead
        title={`Step ${step + 1} of ${steps.length} — ${steps[step]}`}
        hint={`Contract creation wizard · ${step} of ${steps.length} steps complete`}
        actions={
          <button
            type="button"
            className="dd-pill-btn dd-pill-btn--emphasis"
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
          >
            {step < steps.length - 1 ? `Next: ${steps[step + 1]}` : 'Finish contract'}
            <ArrowRight size={14} />
          </button>
        }
      />

      <div className="dd-stepper">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            className={cn('dd-stepper__item', i === step && 'is-active', i < step && 'is-done')}
            onClick={() => setStep(i)}
          >
            <span>{i + 1}</span>
            {s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="dd-ststack">
          <section className="dd-stpanel">
            <div className="dd-stpanel__title-row">
              <span className="dd-stpanel__title">Contract type — choose first to filter legs & carriers</span>
              <em className="dd-pill-soft">{contractType}</em>
            </div>
            <p className="dd-stpanel__q">How will this carrier operate on this load?</p>
            <div className="dd-choice-list">
              {(
                [
                  ['Brokerage', 'Carrier provides truck + trailer'],
                  ['Power Only', 'Carrier provides truck, we provide trailer'],
                  ['Trailer Move', 'Moving our trailer between yards'],
                ] as const
              ).map(([label, desc]) => (
                <button
                  key={label}
                  type="button"
                  className={cn('dd-choice', contractType === label && 'is-active')}
                  onClick={() => setContractType(label)}
                >
                  <strong>{label}</strong>
                  <em>{desc}</em>
                  {contractType === label && <Check size={14} />}
                </button>
              ))}
            </div>
          </section>

          <section className="dd-stpanel">
            <div className="dd-stpanel__title-row">
              <span className="dd-stpanel__title">Load — pickup & delivery from this shipment</span>
              <em className="dd-pill-soft">{detail.load.equipment}</em>
            </div>
            <div className="dd-leggrid">
              <div>
                <span>Pickup</span>
                <strong>{pickup?.facility ?? '—'}</strong>
                <em>
                  {pickup?.city} · {pickup?.when}
                </em>
                <i>{pickup?.status}</i>
              </div>
              <div>
                <span>Delivery</span>
                <strong>{delivery?.facility ?? '—'}</strong>
                <em>
                  {delivery?.city} · {delivery?.when}
                </em>
                <i>{delivery?.status}</i>
              </div>
            </div>
          </section>

          <section className="dd-stpanel">
            <div className="dd-stpanel__title">Equipment type</div>
            <p className="dd-stpanel__q">
              Carrier provides the trailer — equipment is auto-selected based on contract type.
            </p>
            <div className="dd-choice is-active">
              <strong>{detail.load.equipment}</strong>
              <em>Auto-selected for {contractType}</em>
              <Check size={14} />
            </div>
          </section>
        </div>
      )}

      {step === 1 && (
        <div className="dd-stgrid dd-stgrid--2">
          <Facts
            title="Contract properties"
            rows={[
              { label: 'Contract type', value: contractType },
              { label: 'Currency', value: detail.currency },
              { label: 'Book now', value: detail.bookNowRate, mono: true },
              { label: 'Awarded rate', value: awarded?.amount ?? '—', mono: true },
              { label: 'All-in', value: awarded?.allIn ?? '—', mono: true },
              { label: 'Payment terms', value: 'Net 30' },
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
              { label: 'CSR', value: detail.csr },
            ]}
          />
        </div>
      )}

      {step === 2 && (
        <div className="dd-stgrid dd-stgrid--2">
          <Facts
            title="Driver"
            rows={[
              { label: 'Driver name', value: 'Assigned at dispatch' },
              { label: 'Phone', value: awarded?.phone ?? '—' },
              { label: 'CDL', value: 'Pending upload' },
              { label: 'HOS status', value: 'Available' },
            ]}
          />
          <Facts
            title="Equipment"
            rows={[
              { label: 'Trailer type', value: detail.load.equipment },
              { label: 'Contract type', value: contractType },
              { label: 'Tractor', value: contractType === 'Trailer Move' ? 'Internal' : 'Carrier supplied' },
              { label: 'Reefer setpoint', value: detail.load.equipment.includes('REEFER') ? '34°F' : 'N/A' },
            ]}
          />
        </div>
      )}

      {step === 3 && (
        <div className="dd-stgrid">
          <section className="dd-stpanel dd-stpanel--hero">
            <div className="dd-stpanel__title">Carrier confirmation</div>
            <div className="dd-award-hero">
              <div>
                <strong>{awarded?.carrier ?? 'No carrier'}</strong>
                <em>
                  {contractType} · {detail.load.equipment} · {detail.load.miles.toLocaleString()} mi
                </em>
              </div>
              <div className="dd-award-hero__rate">
                <span>Confirm at</span>
                <strong>{awarded?.allIn ?? awarded?.amount ?? '—'}</strong>
              </div>
            </div>
            <div className="dd-checklist" style={{ marginTop: 12 }}>
              {[
                'Rate and equipment match award',
                'Pickup appointment confirmed',
                'Carrier acknowledge requested',
              ].map((t) => (
                <div key={t} className="dd-checkrow is-ok">
                  <span>{t}</span>
                  <em>Ready</em>
                </div>
              ))}
            </div>
          </section>
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
  const copy =
    kind === 'Send Confirmation'
      ? {
          title: 'Send Confirmation',
          hint: 'Email the rate confirmation to the awarded carrier and track acknowledgement.',
          action: 'Send to carrier',
        }
      : kind === 'Signed Confirmation'
        ? {
            title: 'Signed Confirmation',
            hint: 'Track signed RC return and store the executed packet.',
            action: 'Mark signed',
          }
        : {
            title: 'Resources',
            hint: 'Assign drivers, equipment, and tracking resources before execute.',
            action: 'Assign resources',
          }

  return (
    <div className="dd-stage dd-stage--apple">
      <StageHead
        title={copy.title}
        hint={copy.hint}
        actions={
          <button type="button" className="dd-pill-btn dd-pill-btn--emphasis">
            <Check size={14} />
            {copy.action}
          </button>
        }
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
          ]}
        />
        <Facts
          title={kind === 'Resources' ? 'Resource board' : 'Confirmation status'}
          rows={
            kind === 'Resources'
              ? [
                  { label: 'Driver', value: 'Unassigned' },
                  { label: 'Tractor', value: 'Unassigned' },
                  { label: 'Trailer', value: detail.load.equipment },
                  { label: 'Tracking', value: 'FourKites · pending' },
                  { label: 'Dispatcher', value: detail.csr },
                  { label: 'Ready to execute', value: 'No' },
                ]
              : [
                  { label: 'Channel', value: 'Email + Portal' },
                  { label: 'Sent at', value: kind === 'Send Confirmation' ? 'Not sent' : 'Jul 13 · 09:12' },
                  { label: 'Opened', value: kind === 'Signed Confirmation' ? 'Yes' : '—' },
                  { label: 'Signed', value: kind === 'Signed Confirmation' ? 'Pending' : '—' },
                  { label: 'Contact', value: awarded?.email ?? '—' },
                  { label: 'Follow-up', value: 'Auto reminder · 4h' },
                ]
          }
        />
      </div>
    </div>
  )
}
