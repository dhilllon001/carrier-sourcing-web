import {
  Activity,
  ArrowRight,
  CalendarClock,
  Check,
  DollarSign,
  Gauge,
  Layers,
  Mail,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  UserPlus,
  Users,
  Wand2,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import type { DetailStage, LoadDetail } from '@/data/loadDetail'
type StructureSelect = (stage: DetailStage, sub: string) => void

function readinessAlerts(detail: LoadDetail) {
  const alerts: { id: string; title: string; done: boolean }[] = []
  const maxUnset = !detail.maxBuy || detail.maxBuy === '—' || detail.maxBuy === '$0.00'
  const bookUnset = !detail.bookNowRate || detail.bookNowRate === '—'
  const hookMissing = detail.stops.some(
    (s) => (s.role === 'Hook' || s.kind === 'Pickup') && s.appointmentRequired
  )
  const dropMissing = detail.stops.some(
    (s) => (s.role === 'Drop' || s.kind === 'Delivery') && s.appointmentRequired
  )

  alerts.push({ id: 'maxbuy', title: 'Max buy set', done: !maxUnset })
  alerts.push({ id: 'book', title: 'Book now set', done: !bookUnset })
  alerts.push({ id: 'hook', title: 'Hook appointment', done: !hookMissing })
  alerts.push({ id: 'drop', title: 'Drop appointment', done: !dropMissing })
  alerts.push({ id: 'broker', title: 'Owning broker assigned', done: Boolean(detail.load.broker) })
  return alerts
}

export function LoadStructureTree({
  detail,
  stage,
  subStage: _subStage,
  onSelect,
}: {
  detail: LoadDetail
  stage: DetailStage
  subStage: string
  onSelect: StructureSelect
}) {
  return (
    <aside className="v3-struct">
      <header className="v3-struct__head">
        <span>Load structure</span>
        <strong>{detail.load.id}</strong>
        <em>
          {detail.load.origin} → {detail.load.destination}
        </em>
      </header>

      <div className="v3-struct__body">
        <div className="v3-struct__group is-static">
          <Layers size={13} />
          <span>Lifecycle</span>
          <em>
            {detail.completedSubs}/{detail.totalSubs}
          </em>
        </div>
        {detail.stages.map((block) => {
          const doneCount = block.items.filter((i) => i.done).length
          const stageDone = doneCount === block.items.length && block.items.length > 0
          const active = block.stage === stage
          return (
            <div key={block.stage} className={cn('v3-struct__stage', active && 'is-on')}>
              <button
                type="button"
                className={cn('v3-struct__row', stageDone && 'is-done')}
                onClick={() => onSelect(block.stage, block.items[0]?.label ?? 'ALL')}
              >
                <i className={cn('v3-struct__mark', stageDone && 'is-done')}>
                  {stageDone ? <Check size={10} strokeWidth={3} /> : null}
                </i>
                <span>{block.stage}</span>
                <em>
                  {doneCount}/{block.items.length}
                </em>
              </button>
              {active && (
                <div className="v3-struct__chip">{block.items.filter((i) => i.done).length === block.items.length && block.items.length > 0 ? 'Complete' : `${doneCount} of ${block.items.length} done`}</div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

export type CaseActionId =
  | 'maxbuy'
  | 'hook'
  | 'drop'
  | 'broker'
  | 'post'
  | 'offers'
  | 'finalize'
  | 'cmt'
  | 'award'
  | 'override'
  | 'contract'
  | 'confirm'
  | 'ai-rate'
  | 'ai-email'
  | 'ai-score'
  | 'ai-counter'
  | 'ai-explain'
export type CaseTab = 'overview' | 'instructions' | 'documents'

const rateOrDash = (v: string) => (!v || v === '—' || v === '$0.00' ? null : v)
const toNum = (v: string) => Number(v.replace(/[^0-9.]/g, '')) || 0
const money = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function CaseWorkBar({
  tab,
  onTab,
  docCount,
  stage,
  subStage,
  status,
  autoLabel,
  onAuto,
}: {
  tab: CaseTab
  onTab: (tab: CaseTab) => void
  docCount: number
  stage: string
  subStage: string
  status: string
  autoLabel: string | null
  onAuto: () => void
}) {
  const tabs: [CaseTab, string, number | null][] = [
    ['overview', 'Overview', null],
    ['instructions', 'Instructions', null],
    ['documents', 'Documents', docCount],
  ]

  return (
    <div className="v3-bar">
      <div className="v3-bar__tabs" role="tablist">
        {tabs.map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={cn(tab === id && 'is-on')}
            onClick={() => onTab(id)}
          >
            {label}
            {count !== null && <i>{count}</i>}
          </button>
        ))}
      </div>
      <div className="v3-bar__right">
        <span className="v3-bar__stage">
          {stage} · {subStage}
        </span>
        <span className={cn('v3-bar__status', status === 'NeedCarrier' && 'is-warn')}>{status}</span>
        {autoLabel && (
          <button type="button" className="v3-case__cta" onClick={onAuto}>
            <Zap size={13} />
            {autoLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export function CaseCenterHeader({
  detail,
  stage,
  onAction,
}: {
  detail: LoadDetail
  stage: DetailStage
  onAction: (id: CaseActionId) => void
}) {
  const alerts = readinessAlerts(detail)
  const blocking = alerts.filter((a) => !a.done).length
  /* readiness tracks the posting checks, so it moves the moment an action lands */
  const readinessPct = Math.round(((alerts.length - blocking) / alerts.length) * 100)
  const bookNow = rateOrDash(detail.bookNowRate)
  const maxBuy = rateOrDash(detail.maxBuy)
  const rejectAbove = rateOrDash(detail.rejectAbove)
  const customerRate = detail.load.fee
  const margin = maxBuy === null ? null : customerRate - toNum(maxBuy)

  const accepted = detail.bids.find((b) => b.status === 'Accepted')
  const actions: { id: CaseActionId; label: string; icon: typeof Zap; primary?: boolean }[] = []
  if (stage === 'Sourcing') {
    if (!maxBuy) actions.push({ id: 'maxbuy', label: 'Set max buy', icon: DollarSign, primary: true })
    if (!alerts.find((a) => a.id === 'hook')?.done)
      actions.push({ id: 'hook', label: 'Add hook appointment', icon: CalendarClock })
    if (!alerts.find((a) => a.id === 'drop')?.done)
      actions.push({ id: 'drop', label: 'Add drop appointment', icon: CalendarClock })
    if (!detail.load.broker) actions.push({ id: 'broker', label: 'Assign broker', icon: UserPlus })
    if (blocking === 0) actions.push({ id: 'post', label: 'Post to sourcing', icon: ArrowRight, primary: true })
    if (detail.bids.length > 0) actions.push({ id: 'offers', label: `Review ${detail.bids.length} offers`, icon: Users })
  } else if (stage === 'Tender') {
    actions.push({ id: 'ai-score', label: 'Score offers', icon: Gauge, primary: true })
    if (accepted) actions.push({ id: 'finalize', label: `Confirm ${accepted.carrier}`, icon: Check })
    else actions.push({ id: 'offers', label: 'Accept selected offer', icon: Users })
  } else if (stage === 'Award') {
    if (!detail.cmtCleared) actions.push({ id: 'cmt', label: 'Run CMT', icon: Check, primary: true })
    actions.push({ id: 'award', label: 'Award recommended', icon: Zap, primary: detail.cmtCleared })
    actions.push({ id: 'override', label: 'Award another carrier', icon: Users })
  } else if (stage === 'Booking') {
    actions.push({ id: 'contract', label: 'Open contract', icon: ArrowRight, primary: true })
    actions.push({ id: 'confirm', label: 'Send confirmation', icon: Mail })
  }

  return (
    <div className="v3-case">
      <section className="v3-ready">
        <div className="v3-ready__head">
          <div>
            <strong>
              {stage === 'Tender' ? 'Offers' : stage === 'Award' ? 'Award readiness' : stage === 'Booking' ? 'Booking' : 'Readiness'}
            </strong>
            <span>
              {stage === 'Tender'
                ? `${detail.bids.length} offers in · ${accepted ? `1 accepted (${accepted.carrier})` : 'none accepted yet'}.`
                : stage === 'Award'
                  ? detail.cmtCleared
                    ? 'CMT clear — award the recommended carrier or override with a reason.'
                    : 'Run CMT before this load can auto-award.'
                  : stage === 'Booking'
                    ? 'Contract, confirmation, resources and dispatch live on one screen.'
                    : blocking === 0
                      ? 'All required data points clear — ready to post and run automation.'
                      : `${blocking} blocking item${blocking === 1 ? '' : 's'} before this load can post.`}
            </span>
          </div>
          <em className={cn(blocking === 0 ? 'is-ok' : 'is-warn')}>
            {stage === 'Tender'
              ? `${detail.bids.length}`
              : stage === 'Award'
                ? detail.cmtCleared
                  ? 'Ready'
                  : 'Hold'
                : `${readinessPct}%`}
          </em>
        </div>
        <div className="v3-ready__bar">
          <i style={{ width: `${readinessPct}%` }} className={blocking === 0 ? 'is-ok' : undefined} />
        </div>
        {stage === 'Sourcing' && (
        <ul className="v3-ready__checks">
          {alerts.map((a) => (
            <li key={a.id} className={cn(a.done && 'is-done')}>
              <i>{a.done ? <Check size={9} strokeWidth={3.5} /> : null}</i>
              {a.title}
            </li>
          ))}
        </ul>
        )}
      </section>

      <div className="v3-rates">
        <article>
          <span>Customer rate</span>
          <strong>
            {money(customerRate)} {detail.currency}
          </strong>
        </article>
        <article>
          <span>Book now</span>
          <strong className={cn(!bookNow && 'is-empty')}>{bookNow ?? 'Not set'}</strong>
        </article>
        <article>
          <span>Max buy · hard limit</span>
          <strong className={cn(!maxBuy && 'is-empty')}>{maxBuy ?? 'Not set'}</strong>
        </article>
        <article>
          <span>Reject above</span>
          <strong className={cn(!rejectAbove && 'is-empty')}>{rejectAbove ?? 'Not set'}</strong>
        </article>
        <article>
          <span>Margin at max buy</span>
          <strong className={cn(margin === null && 'is-empty', margin !== null && (margin >= 0 ? 'is-pos' : 'is-neg'))}>
            {margin === null ? 'Not set' : `${margin >= 0 ? '+' : '−'}${money(Math.abs(margin))}`}
          </strong>
        </article>
        <article>
          <span>Revenue / mile</span>
          <strong>${(customerRate / Math.max(1, detail.load.miles)).toFixed(2)}</strong>
        </article>
      </div>

      {actions.length > 0 && (
        <div className="v3-acts">
          <span className="v3-acts__label">Next actions</span>
          <div className="v3-acts__row">
            {actions.map((a) => (
              <button
                key={a.id}
                type="button"
                className={cn('v3-acts__btn', a.primary && 'is-primary')}
                onClick={() => onAction(a.id)}
              >
                <a.icon size={13} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {(stage === 'Sourcing' || stage === 'Tender' || stage === 'Award') && (
      <div className="v3-ai">
        <span className="v3-ai__label">
          <Sparkles size={12} />
          AI assist
        </span>
        <div className="v3-ai__row">
          {stage === 'Sourcing' && (
            <>
              <button type="button" className="v3-ai__btn" onClick={() => onAction('ai-rate')}>
                <Wand2 size={13} />
                Suggest max buy
              </button>
              <button type="button" className="v3-ai__btn" onClick={() => onAction('ai-email')}>
                <Mail size={13} />
                Draft carrier blast
              </button>
            </>
          )}
          {stage === 'Tender' && (
            <>
              <button type="button" className="v3-ai__btn" onClick={() => onAction('ai-score')}>
                <Gauge size={13} />
                Score offers
              </button>
              <button type="button" className="v3-ai__btn" onClick={() => onAction('ai-counter')}>
                <Mail size={13} />
                Draft counter
              </button>
            </>
          )}
          {stage === 'Award' && (
            <>
              <button type="button" className="v3-ai__btn" onClick={() => onAction('ai-score')}>
                <Gauge size={13} />
                Re-score
              </button>
              <button type="button" className="v3-ai__btn" onClick={() => onAction('ai-explain')}>
                <Sparkles size={13} />
                Explain recommendation
              </button>
            </>
          )}
        </div>
      </div>
      )}

    </div>
  )
}

export function StageWorkBar({
  stage,
  chip,
  status,
  autoLabel,
  autoDisabled,
  autoHint,
  onAuto,
  onBack,
}: {
  stage: string
  chip: string
  status: string
  autoLabel: string | null
  autoDisabled?: boolean
  autoHint?: string
  onAuto: () => void
  onBack?: () => void
}) {
  return (
    <div className="v3-bar">
      <div className="v3-bar__tabs">
        <strong className="v3-bar__stage">{stage}</strong>
        <span className="v3-bar__chip">{chip}</span>
      </div>
      <div className="v3-bar__right">
        <span className={cn('v3-bar__status', status === 'NeedCarrier' && 'is-warn')}>{status}</span>
        {autoLabel && (
          <button
            type="button"
            className="v3-case__cta"
            disabled={autoDisabled}
            title={autoHint}
            onClick={onAuto}
          >
            <Zap size={13} />
            {autoLabel}
          </button>
        )}
        {onBack && (
          <button type="button" className="dd-btn" onClick={onBack}>
            Back
          </button>
        )}
      </div>
    </div>
  )
}

export type CaseEvent = {
  id: string
  /* consecutive entries with the same key collapse into one, so typing a rate logs once */
  key?: string
  title: string
  detail?: string
  who: string
  when: string
  status: 'ok' | 'warn' | 'info'
}

export function CaseActivityRail({
  events,
  collapsed,
  onToggle,
}: {
  events: CaseEvent[]
  collapsed: boolean
  onToggle: () => void
}) {
  if (collapsed) {
    return (
      <aside className="v3-act is-collapsed">
        <button
          type="button"
          className="v3-act__reopen"
          onClick={onToggle}
          aria-expanded={false}
          title="Show activity"
        >
          <PanelRightOpen size={15} />
          <span>Activity</span>
          {events.length > 0 && <em>{events.length}</em>}
        </button>
      </aside>
    )
  }

  return (
    <aside className="v3-act">
      <header className="v3-act__head">
        <strong>Activity</strong>
        <div className="v3-act__headside">
          {events.length > 0 && <em>{events.length}</em>}
          <button
            type="button"
            className="v3-act__collapse"
            onClick={onToggle}
            aria-expanded
            title="Hide activity"
          >
            <PanelRightClose size={15} />
          </button>
        </div>
      </header>

      {events.length === 0 ? (
        <div className="v3-act__blank">
          <Activity size={18} />
          <strong>Nothing yet</strong>
          <p>Every action you take on this load is logged here as it happens.</p>
        </div>
      ) : (
        <ol className="v3-act__list">
          {events.map((item) => (
            <li key={item.id} className={cn(`is-${item.status}`)}>
              <i className="v3-act__mark" aria-hidden />
              <div>
                <div className="v3-act__top">
                  <strong>{item.title}</strong>
                  <em>{item.when}</em>
                </div>
                {item.detail && <p>{item.detail}</p>}
                <span>{item.who}</span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </aside>
  )
}
