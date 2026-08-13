import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Gauge,
  Layers,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { SEED_ACTIVITY, makeActivity, type ActivityEvent } from '@/data/activityLog'
import type { AiActivityEntry } from '@/data/aiActivity'
import type { DetailStage, LoadDetail } from '@/data/loadDetail'
import type { ReportLoad } from '@/data/report'
import { TagPopover } from '@/components/report/TagPopover'

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
  subStage,
  onSelect,
}: {
  detail: LoadDetail
  stage: DetailStage
  subStage: string
  onSelect: StructureSelect
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    lifecycle: true,
    alerts: true,
    offers: true,
    documents: false,
  })

  const alerts = readinessAlerts(detail)
  const alertDone = alerts.filter((a) => a.done).length

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
        <button
          type="button"
          className="v3-struct__group"
          onClick={() => setOpen((p) => ({ ...p, lifecycle: !p.lifecycle }))}
        >
          {open.lifecycle ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          <Layers size={13} />
          <span>Lifecycle</span>
          <em>
            {detail.completedSubs}/{detail.totalSubs}
          </em>
        </button>
        {open.lifecycle &&
          detail.stages.map((block) => {
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

        <button
          type="button"
          className="v3-struct__group"
          onClick={() => setOpen((p) => ({ ...p, alerts: !p.alerts }))}
        >
          {open.alerts ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          <AlertTriangle size={13} />
          <span>Alerts</span>
          <em>
            {alertDone}/{alerts.length}
          </em>
        </button>
        {open.alerts && (
          <ul className="v3-struct__list">
            {alerts.map((a) => (
              <li key={a.id} className={cn(a.done && 'is-done')}>
                <i>{a.done ? <Check size={9} strokeWidth={3} /> : null}</i>
                <span>{a.title}</span>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          className="v3-struct__group"
          onClick={() => setOpen((p) => ({ ...p, offers: !p.offers }))}
        >
          {open.offers ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          <Users size={13} />
          <span>Carriers / Offers</span>
          <em>{detail.bids.length}</em>
        </button>
        {open.offers && (
          <ul className="v3-struct__list">
            {detail.bids.length === 0 ? (
              <li className="is-empty">No offers yet</li>
            ) : (
              detail.bids.slice(0, 4).map((b) => (
                <li key={b.id} className="is-done">
                  <i>
                    <Check size={9} strokeWidth={3} />
                  </i>
                  <span>
                    {b.carrier} · {b.allIn ?? b.amount}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}

        <button
          type="button"
          className="v3-struct__group"
          onClick={() => setOpen((p) => ({ ...p, documents: !p.documents }))}
        >
          {open.documents ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          <FileText size={13} />
          <span>Documents</span>
          <em>{detail.documents.length}</em>
        </button>
        {open.documents && (
          <ul className="v3-struct__list">
            {detail.documents.map((d) => (
              <li key={d.id} className="is-done">
                <i>
                  <Check size={9} strokeWidth={3} />
                </i>
                <span>{d.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}

export function CaseCenterHeader({
  detail,
  load,
  stage,
  subStage,
  readinessPct,
  tags,
  onTags,
  autoLabel,
  onAuto,
}: {
  detail: LoadDetail
  load: ReportLoad
  stage: string
  subStage: string
  readinessPct: number
  tags: string[]
  onTags: (tags: string[]) => void
  autoLabel: string | null
  onAuto: () => void
}) {
  const alerts = readinessAlerts(detail)
  const blocking = alerts.filter((a) => !a.done).length

  return (
    <div className="v3-case">
      <div className="v3-case__pills">
        <span>{load.id}</span>
        <span>{load.mode}</span>
        <span>
          {stage} · {subStage}
        </span>
        <span className={cn(load.status === 'NeedCarrier' && 'is-warn')}>{load.status}</span>
        {blocking > 0 && <em className="is-overdue">{blocking} open</em>}
      </div>

      <h2>
        {load.origin} → {load.destination}
      </h2>
      <p>
        {load.customer} · {load.equipment} · {load.miles.toLocaleString()} mi ·{' '}
        {detail.load.fee.toFixed(2)} {detail.currency}
      </p>

      <div className="v3-case__ai">
        <div className="v3-case__ai-top">
          <strong>AI readiness {readinessPct}%</strong>
          <span>
            {blocking === 0
              ? 'All required data points clear — ready to run automation.'
              : `${blocking} blocking item${blocking === 1 ? '' : 's'} before posting.`}
          </span>
        </div>
        <div className="v3-case__bar">
          <i style={{ width: `${readinessPct}%` }} />
        </div>
        <div className="v3-case__ai-foot">
          <span>
            Book now {detail.bookNowRate === '—' ? 'not set' : detail.bookNowRate} · Max buy{' '}
            {detail.maxBuy === '—' || detail.maxBuy === '$0.00' ? 'not set' : detail.maxBuy}
          </span>
          {autoLabel && (
            <button type="button" className="v3-case__cta" onClick={onAuto}>
              <Zap size={13} />
              {autoLabel}
            </button>
          )}
        </div>
      </div>

      <div className="v3-ents">
        <article className="is-blue">
          <span>Customer</span>
          <strong>{load.customer}</strong>
        </article>
        <article className="is-purple">
          <span>Equipment</span>
          <strong>{load.equipment}</strong>
        </article>
        <article className="is-green">
          <span>Broker</span>
          <strong>{load.broker || 'Unassigned'}</strong>
        </article>
        <article className="is-amber">
          <span>Team</span>
          <strong>{load.team}</strong>
        </article>
      </div>

      <div className="v3-case__tags">
        <TagPopover tags={tags} onChange={onTags} />
      </div>

      <div className="v3-agents">
        <article>
          <ClipboardCheck size={14} />
          <div>
            <strong>Readiness agent · {readinessPct}%</strong>
            <p>Checked book now, max buy, appointments and broker ownership against posting rules.</p>
          </div>
        </article>
        <article>
          <Sparkles size={14} />
          <div>
            <strong>Reach agent · mock</strong>
            <p>Would blast internal carriers and post boards once rates and appointments are set.</p>
          </div>
        </article>
        <article>
          <Gauge size={14} />
          <div>
            <strong>Offer score · {detail.bids.length} bids</strong>
            <p>
              {detail.bids.length > 0
                ? `Top suggestion ${detail.bids[0].carrier} at ${detail.bids[0].allIn ?? detail.bids[0].amount}.`
                : 'No offers to score yet — run Auto Sourcing first.'}
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}

type ActivityFilter = 'all' | 'ai' | 'system'

export function CaseActivityRail({
  detail,
  aiLog,
}: {
  detail: LoadDetail
  aiLog: AiActivityEntry[]
}) {
  const [filter, setFilter] = useState<ActivityFilter>('all')

  const systemEvents: ActivityEvent[] = useMemo(
    () => [
      makeActivity({
        when: detail.startedAt,
        who: detail.csr,
        action: 'other',
        text: 'Opened Overview for load review',
        loadId: detail.load.id,
      }),
      ...SEED_ACTIVITY.map((e) => ({ ...e, loadId: detail.load.id })),
    ],
    [detail]
  )

  const items = useMemo(() => {
    const aiItems = aiLog.map((e) => ({
      id: e.id,
      kind: 'ai' as const,
      title: e.title,
      detail: e.detail,
      who: e.run,
      when: e.when,
      status: e.status,
    }))
    const sysItems = systemEvents.map((e) => ({
      id: e.id,
      kind: 'system' as const,
      title: e.text,
      detail: e.action.replace(/_/g, ' '),
      who: e.who,
      when: e.when,
      status: 'info' as const,
    }))
    if (filter === 'ai') return aiItems
    if (filter === 'system') return sysItems
    return [...aiItems, ...sysItems]
  }, [aiLog, filter, systemEvents])

  return (
    <aside className="v3-act">
      <header className="v3-act__head">
        <strong>
          Activity
          <i className="v3-act__live" aria-hidden />
        </strong>
        <div className="v3-act__tabs" role="tablist">
          {(
            [
              ['all', 'All'],
              ['ai', 'AI'],
              ['system', 'System'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filter === id}
              className={cn(filter === id && 'is-on')}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <ol className="v3-act__list">
        {items.map((item) => (
          <li key={item.id} className={cn(`is-${item.status}`, item.kind === 'ai' && 'is-ai')}>
            <i className="v3-act__mark" aria-hidden />
            <div>
              <div className="v3-act__top">
                <strong>{item.title}</strong>
                <em>{item.when}</em>
              </div>
              <p>{item.detail}</p>
              <span className={cn(item.kind === 'ai' && 'is-ai')}>{item.who}</span>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="v3-act__empty">No activity for this filter</li>}
      </ol>
    </aside>
  )
}
