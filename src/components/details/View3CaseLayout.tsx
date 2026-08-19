import { useState, type ReactNode } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Check,
  ChevronDown,
  DollarSign,
  Layers,
  Lock,
  Mail,
  MessageSquare,
  PanelRightClose,
  Search,
  ShieldCheck,
  Truck,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import type { DetailStage, LoadDetail } from '@/data/loadDetail'
import { buildCaseAlerts, openAlerts, type CaseAlert } from '@/lib/details/caseAlerts'
type StructureSelect = (stage: DetailStage, sub: string) => void

const ALERT_ICON: Partial<Record<CaseActionId, typeof Zap>> = {
  hook: CalendarClock,
  drop: CalendarClock,
  equipment: Truck,
  maxbuy: DollarSign,
  booknow: DollarSign,
  reject: DollarSign,
  broker: UserPlus,
  network: Users,
  contact: UserPlus,
  channel: MessageSquare,
  insurance: ShieldCheck,
  cmt: Layers,
}

export function LoadStructureTree({
  detail,
  stage,
  subStage,
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
                {stageDone ? (
                  <em className="is-done" aria-label="Stage complete">
                    <Check size={11} strokeWidth={3.2} />
                  </em>
                ) : (
                  <em>
                    {doneCount}/{block.items.length}
                  </em>
                )}
              </button>
              {active && (
                <ul className="v3-struct__subs">
                  {block.items.map((item) => (
                    <li key={item.label}>
                      <button
                        type="button"
                        className={cn(
                          'v3-struct__sub',
                          item.done && 'is-done',
                          subStage === item.label && 'is-current'
                        )}
                        onClick={() => onSelect(block.stage, item.label)}
                      >
                        <i>{item.done ? <Check size={9} strokeWidth={3} /> : null}</i>
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
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
  | 'booknow'
  | 'reject'
  | 'hook'
  | 'drop'
  | 'broker'
  | 'equipment'
  | 'network'
  | 'contact'
  | 'channel'
  | 'insurance'
  | 'cmt'
  | 'boards'
  | 'shortlist'
  | 'post'
  | 'findpost'
  | 'blast'
  | 'offers'
  | 'ai-rate'
  | 'ai-book'
  | 'ai-email'
  | 'ai-score'
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
  showTabs = true,
  slotRef,
}: {
  tab: CaseTab
  onTab: (tab: CaseTab) => void
  docCount: number
  stage: string
  subStage: string
  status: string
  autoLabel: string | null
  onAuto: () => void
  /** Stage workspaces drop the tabs and keep only the action row. */
  showTabs?: boolean
  /** Receives the element that stage actions are portalled into. */
  slotRef?: (el: HTMLDivElement | null) => void
}) {
  const tabs: [CaseTab, string, number | null][] = [
    ['overview', 'Overview', null],
    ['instructions', 'Instructions', null],
    ['documents', 'Documents', docCount],
  ]

  return (
    <div className="v3-bar">
      {showTabs ? (
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
      ) : (
        <span className="v3-bar__where">
          {stage} · {subStage}
        </span>
      )}
      <div className="v3-bar__right">
        {showTabs && (
          <span className="v3-bar__stage">
            {stage} · {subStage}
          </span>
        )}
        <span className={cn('v3-bar__status', status === 'NeedCarrier' && 'is-warn')}>{status}</span>
        <div className="v3-bar__slot" ref={slotRef} />
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

/** One open alert as a list row. Most buttons apply the fix; rates ask for the amount. */
function AlertRow({
  alert,
  onAction,
  onResolve,
  onAmount,
}: {
  alert: CaseAlert
  onAction: (id: CaseActionId) => void
  onResolve: (id: CaseActionId, value: string) => void
  onAmount: (alert: CaseAlert) => void
}) {
  const Icon = ALERT_ICON[alert.id] ?? AlertTriangle
  const auto = alert.auto

  const run = () => {
    if (!auto) return onAction(alert.id)
    if (auto.amount) return onAmount(alert)
    onResolve(alert.id, auto.value)
  }

  return (
    <li className={cn('v3-todo__row', `is-${alert.level}`)}>
      <i className="v3-todo__icon" aria-hidden>
        <Icon size={13} />
      </i>
      <span className="v3-todo__main">
        <strong>{alert.title}</strong>
        <em>{alert.detail}</em>
      </span>
      <button type="button" className="v3-todo__btn" onClick={run}>
        {auto ? auto.label : 'Open'}
      </button>
    </li>
  )
}

/** Small centred dialog for the rate items — the only place a number is typed. */
export function RateDialog({
  title,
  note,
  suggest,
  onClose,
  onSave,
}: {
  title: string
  note?: string
  /** Pre-fills the field and backs the "Use suggested" shortcut. */
  suggest?: string
  onClose: () => void
  onSave: (value: string) => void
}) {
  const suggested = (suggest ?? '').replace(/[^0-9.]/g, '')
  const [draft, setDraft] = useState(suggested)

  const save = () => {
    const clean = draft.replace(/[^0-9.]/g, '')
    if (!clean || Number(clean) <= 0) return
    onSave(clean)
  }

  return (
    <div
      className="v3-amt"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div className="v3-amt__sheet" onClick={(e) => e.stopPropagation()}>
        <strong>{title}</strong>
        {note && <span>{note}</span>}
        <label className="v3-amt__field">
          <i>$</i>
          <input
            autoFocus
            value={draft}
            inputMode="decimal"
            placeholder="0.00"
            onChange={(e) => setDraft(e.target.value.replace(/[^0-9.]/g, ''))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') onClose()
            }}
          />
        </label>
        {suggested && (
          <button
            type="button"
            className="v3-amt__suggest"
            onClick={() => setDraft(suggested)}
          >
            Use suggested ${suggested}
          </button>
        )}
        <div className="v3-amt__foot">
          <button type="button" className="v3-amt__cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="v3-amt__save" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * The open alerts as a to-do list. Blockers lead; advisories hide behind "Show more"
 * until there is nothing blocking left.
 */
export function CaseNextActions({
  detail,
  onAction,
  onResolve,
  footer,
  expanded = false,
}: {
  detail: LoadDetail
  onAction: (id: CaseActionId) => void
  onResolve: (id: CaseActionId, value: string) => void
  /** Flow buttons rendered under the list. */
  footer?: ReactNode
  /** Rails have the height to show everything at once. */
  expanded?: boolean
}) {
  const [showAll, setShowAll] = useState(expanded)
  const [amountFor, setAmountFor] = useState<CaseAlert | null>(null)
  const open = openAlerts(buildCaseAlerts(detail))
  const blocking = open.filter((a) => a.level === 'blocker').length

  const blockersOnly = open.filter((a) => a.level === 'blocker')
  const preview = blockersOnly.length > 0 ? blockersOnly.slice(0, 3) : open.slice(0, 2)
  const shown = showAll ? open : preview
  const hidden = open.length - shown.length

  if (open.length === 0 && !footer) {
    return (
      <div className="v3-acts is-clear">
        <div className="v3-acts__top">
          <span className="v3-acts__label">Next actions</span>
        </div>
        <p className="v3-acts__clear">
          <Check size={13} />
          Everything needed to post is set.
        </p>
      </div>
    )
  }

  return (
    <div className="v3-acts">
      <div className="v3-acts__top">
        <span className="v3-acts__label">Next actions</span>
        {open.length > 0 && (
          <em className="v3-acts__count">
            {blocking > 0 && <b>{blocking} blocking</b>}
            {blocking > 0 && open.length > blocking ? ' · ' : ''}
            {open.length > blocking ? `${open.length - blocking} advisory` : ''}
          </em>
        )}
      </div>

      {shown.length > 0 && (
        <ul className="v3-todo">
          {shown.map((a) => (
            <AlertRow
              key={a.id}
              alert={a}
              onAction={onAction}
              onResolve={onResolve}
              onAmount={setAmountFor}
            />
          ))}
        </ul>
      )}

      {hidden > 0 && (
        <button type="button" className="v3-todo__more" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Show fewer' : `Show ${hidden} more`}
          <ChevronDown size={12} className={cn(showAll && 'is-up')} />
        </button>
      )}

      {footer}

      {amountFor && (
        <RateDialog
          title={amountFor.title}
          note={amountFor.detail}
          suggest={amountFor.auto?.value}
          onClose={() => setAmountFor(null)}
          onSave={(value) => {
            onResolve(amountFor.id, value)
            setAmountFor(null)
          }}
        />
      )}
    </div>
  )
}

/** Numbered, collapsible stage card — the Overview workspace is built from these. */
export function CaseStep({
  n,
  title,
  hint,
  badge,
  badgeTone = 'neutral',
  open,
  onToggle,
  summary,
  locked,
  bodyRef,
  children,
}: {
  n: number
  title: string
  hint?: string
  badge?: string
  badgeTone?: 'neutral' | 'ok' | 'warn' | 'blocker'
  open: boolean
  onToggle: () => void
  /** Shown in place of the body once the step is collapsed. */
  summary?: ReactNode
  /** Reason the step cannot be opened yet. */
  locked?: string
  bodyRef?: (el: HTMLElement | null) => void
  children: ReactNode
}) {
  const isOpen = open && !locked

  return (
    <section
      className={cn('v3-step', isOpen && 'is-open', locked && 'is-locked')}
      ref={bodyRef}
    >
      <button
        type="button"
        className="v3-step__head"
        onClick={onToggle}
        disabled={Boolean(locked)}
        aria-expanded={isOpen}
      >
        <i className="v3-step__n" aria-hidden>
          {locked ? <Lock size={11} strokeWidth={2.6} /> : n}
        </i>
        <span className="v3-step__title">
          <strong>{title}</strong>
          {(locked || hint) && <em>{locked ?? hint}</em>}
        </span>
        {badge && <span className={cn('v3-step__badge', `is-${badgeTone}`)}>{badge}</span>}
        {!locked && <ChevronDown size={15} className="v3-step__caret" />}
      </button>

      {isOpen && <div className="v3-step__body">{children}</div>}
      {!isOpen && !locked && summary && <div className="v3-step__summary">{summary}</div>}
    </section>
  )
}

export function CaseCenterHeader({
  detail,
  onAction,
  onResolve,
}: {
  detail: LoadDetail
  onAction: (id: CaseActionId) => void
  onResolve: (id: CaseActionId, value: string) => void
}) {
  const alerts = buildCaseAlerts(detail)
  const open = openAlerts(alerts)
  const loadScope = alerts.filter((a) => a.scope === 'load')
  const blocking = open.filter((a) => a.level === 'blocker').length
  /* readiness tracks the posting checks, so it moves the moment an action lands */
  const cleared = loadScope.filter((a) => a.level === 'ok').length
  const readinessPct = Math.round((cleared / loadScope.length) * 100)
  const bookNow = rateOrDash(detail.bookNowRate)
  const maxBuy = rateOrDash(detail.maxBuy)
  const rejectAbove = rateOrDash(detail.rejectAbove)
  const customerRate = detail.load.fee
  const margin = maxBuy === null ? null : customerRate - toNum(maxBuy)

  /* Flow steps sit after the alerts in the same row */
  type Act = { id: CaseActionId; label: string; icon: typeof Zap; primary?: boolean }
  const flow: Act[] = []
  if (maxBuy && bookNow) {
    if (blocking === 0)
      flow.push({ id: 'findpost', label: 'Go to Find & Post', icon: ArrowRight, primary: true })
    else flow.push({ id: 'findpost', label: 'Find & Post', icon: Search })
    flow.push({ id: 'blast', label: 'Blast carriers', icon: Mail })
  }
  if (detail.bids.length > 0)
    flow.push({ id: 'offers', label: `Review ${detail.bids.length} offers`, icon: Users })

  return (
    <div className="v3-case">
      <section className="v3-ready">
        <div className="v3-ready__head">
          <div>
            <strong>Readiness</strong>
            <span>
              {open.length === 0
                ? 'All required data points clear — ready to post and run automation.'
                : `${blocking} blocking · ${open.length} open alert${open.length === 1 ? '' : 's'} — each Next action below applies the fix in one click.`}
            </span>
          </div>
          <em className={cn(blocking === 0 ? 'is-ok' : 'is-warn')}>{readinessPct}%</em>
        </div>
        <div className="v3-ready__bar">
          <i style={{ width: `${readinessPct}%` }} className={blocking === 0 ? 'is-ok' : undefined} />
        </div>
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

      {(open.length > 0 || flow.length > 0) && (
        <CaseNextActions
          detail={detail}
          onAction={onAction}
          onResolve={onResolve}
          footer={
            flow.length > 0 ? (
              <div className="v3-acts__row">
                {flow.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={cn('v3-acts__btn', a.primary ? 'is-primary' : 'is-flow')}
                    onClick={() => onAction(a.id)}
                  >
                    <a.icon size={13} />
                    {a.label}
                  </button>
                ))}
              </div>
            ) : null
          }
        />
      )}
    </div>
  )
}

export type CaseEvent = {
  id: string
  /* consecutive entries with the same key collapse into one, so typing a rate logs once */
  key?: string
  /** Load area or lifecycle stage where the event happened. */
  area: string
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
    return null
  }

  return (
    <aside className="v3-act">
      <header className="v3-act__head">
        <div>
          <strong>Recent activity</strong>
          <span>Complete load history</span>
        </div>
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
                <span className="v3-act__area">{item.area}</span>
                <div className="v3-act__top">
                  <strong>{item.title}</strong>
                </div>
                {item.detail && <p>{item.detail}</p>}
                <div className="v3-act__meta">
                  <strong>{item.who}</strong>
                  <span>{item.when}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </aside>
  )
}
