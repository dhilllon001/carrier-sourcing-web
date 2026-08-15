import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  Info,
  Layers,
  Mail,
  MessageCircle,
  Pencil,
  Plus,
  RadioTower,
  RefreshCw,
  Search,
  PanelRightClose,
  Zap,
} from 'lucide-react'
import { TagPopover } from '@/components/report/TagPopover'
import {
  FindPostView,
  ManualOfferModal,
  OffersBidsView,
  PostMarketplaceModal,
} from '@/components/details/StageViews'
import {
  BookingStageView,
  CmtValidateView,
  CreateContractView,
  FinalizeAwardView,
  FinalizeTenderView,
} from '@/components/details/LaterStageViews'
import {
  AUTO_MODE_LABEL,
  AutoSourcingConfirm,
  AutoSourcingPanel,
  type AutoMode,
} from '@/components/details/AutoSourcingPanel'
import {
  CaseActivityRail,
  CaseCenterHeader,
  CaseNextActions,
  CaseStep,
  CaseWorkBar,
  LoadStructureTree,
  type CaseActionId,
  type CaseEvent,
} from '@/components/details/View3CaseLayout'
import { V4CarrierBoard, V4Thresholds } from '@/components/details/View4Workspace'
import { StageActionSlotProvider } from '@/components/details/stageActionSlot'
import { buildCaseAlerts, openAlerts } from '@/lib/details/caseAlerts'
import { cn } from '@/lib/cn'
import {
  SEED_ACTIVITY,
  makeActivity,
  type ActivityAction,
  type ActivityEvent,
} from '@/data/activityLog'
import {
  buildAiActivity,
  clockNow,
  type AiActivityEntry,
  type AiActivityKind,
} from '@/data/aiActivity'
import {
  buildLoadDetail,
  isFindPost,
  type BidOffer,
  type CommodityLine,
  type DetailStage,
  type LoadDetail,
  type RouteStop,
} from '@/data/loadDetail'
import type { ReportLoad } from '@/data/report'

type TabId = 'summary' | 'instructions' | 'documents' | 'activity'

const toRate = (v: string) => Number(v.replace(/[^0-9.]/g, '')) || 0

type LoadDetailsPageProps = {
  load: ReportLoad
  onBack: () => void
  /** Opens Auto sourcing configuration → Carrier prefs. */
  onOpenCarrierPrefs?: () => void
}

function ModeBadge({ mode }: { mode: ReportLoad['mode'] }) {
  return (
    <span className={cn('dd-mode', `dd-mode--${mode.toLowerCase()}`)}>
      {mode === 'Expedited' ? 'EXP' : mode.toUpperCase()}
    </span>
  )
}

function DetailLifecycle({
  detail,
  stage,
  subStage,
  collapsed,
  onToggle,
  onSelect,
}: {
  detail: LoadDetail
  stage: DetailStage
  subStage: string
  collapsed: boolean
  onToggle: () => void
  onSelect: (stage: DetailStage, sub: string) => void
}) {
  const pct = Math.round((detail.completedSubs / detail.totalSubs) * 100)

  if (collapsed) {
    return (
      <button type="button" className="dd-life-bar" onClick={onToggle} aria-label="Expand lifecycle stages">
        <Layers size={13} />
        <span>Stages</span>
      </button>
    )
  }

  return (
    <aside className="dd-life">
      <div className="dd-life__head">
        <div className="dd-life__title">Lifecycle</div>
        <button type="button" className="dd-icon-btn" aria-label="Collapse stages" onClick={onToggle}>
          <ChevronRight size={14} />
        </button>
      </div>

      <p className="dd-life__meta">
        <strong>
          {detail.completedSubs}/{detail.totalSubs}
        </strong>
        done · {pct}%
      </p>

      <ol className="dd-tl">
        {detail.stages.map((block) => {
          const doneCount = block.items.filter((i) => i.done).length
          const stageDone = doneCount === block.items.length && block.items.length > 0
          const active = block.stage === stage
          return (
            <li
              key={block.stage}
              className={cn(
                'dd-tl-stage',
                stageDone && 'is-done',
                active && 'is-active',
                !stageDone && !active && 'is-todo'
              )}
            >
              <button
                type="button"
                className="dd-tl-stage__row"
                onClick={() => onSelect(block.stage, block.items[0]?.label ?? 'ALL')}
              >
                <i className="dd-tl-stage__mark">
                  {stageDone ? <Check size={11} strokeWidth={3.5} /> : null}
                </i>
                <span className="dd-tl-stage__name">{block.stage}</span>
                <em className="dd-tl-stage__count">
                  {doneCount}/{block.items.length}
                </em>
              </button>

              {/* sub-stages belong to the stage you are working in */}
              {active && (
                <ul className="dd-tl-subs">
                  {block.items.map((item) => (
                    <li key={item.label}>
                      <button
                        type="button"
                        className={cn(
                          'dd-tl-sub',
                          item.done && 'is-done',
                          subStage === item.label && 'is-current'
                        )}
                        onClick={() => onSelect(block.stage, item.label)}
                      >
                        <i className="dd-tl-sub__mark">
                          {item.done ? <Check size={9} strokeWidth={3.5} /> : null}
                        </i>
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
    </aside>
  )
}

function SummaryTab({
  detail,
  tags,
  onTags,
  onPostToSourcing,
  onPatchDetail,
  hideReadiness = false,
}: {
  detail: LoadDetail
  tags: string[]
  onTags: (t: string[]) => void
  onPostToSourcing: () => void
  onPatchDetail: (patch: Partial<LoadDetail>) => void
  /* V3 surfaces readiness and next actions in the case header instead */
  hideReadiness?: boolean
}) {
  const [activeProbill, setActiveProbill] = useState(detail.commodities[0]?.probill)
  const [commodities, setCommodities] = useState<CommodityLine[]>(detail.commodities)
  const [maxBuyDraft, setMaxBuyDraft] = useState(
    detail.maxBuy === '—' || detail.maxBuy === '$0.00' ? '' : detail.maxBuy.replace(/[^0-9.]/g, '')
  )
  const [hookAppt, setHookAppt] = useState(
    !detail.stops.some((s) => (s.role === 'Hook' || s.kind === 'Pickup') && s.appointmentRequired)
  )
  const [dropAppt, setDropAppt] = useState(
    !detail.stops.some((s) => (s.role === 'Drop' || s.kind === 'Delivery') && s.appointmentRequired)
  )
  const [brokerAssigned, setBrokerAssigned] = useState(Boolean(detail.load.broker))
  const [whyOpen, setWhyOpen] = useState(false)
  const [posted, setPosted] = useState(
    detail.load.subStage === 'Find & Post' || detail.load.status === 'Posted'
  )

  useEffect(() => {
    setCommodities(detail.commodities)
    setActiveProbill(detail.commodities[0]?.probill)
  }, [detail.commodities])

  /* keep local draft in sync when rates are set elsewhere (e.g. Auto Sourcing) */
  useEffect(() => {
    setMaxBuyDraft(
      detail.maxBuy === '—' || detail.maxBuy === '$0.00'
        ? ''
        : detail.maxBuy.replace(/[^0-9.]/g, '')
    )
  }, [detail.maxBuy])

  const customerRate = `${detail.load.fee.toFixed(2)} ${detail.currency}`
  const maxBuySet = Boolean(maxBuyDraft) && Number(maxBuyDraft) > 0
  const equipmentOk = Boolean(detail.load.equipment)
  const rateOk = detail.load.fee > 0

  const checklist = [
    {
      id: 'equip',
      title: 'Equipment confirmed',
      detail: detail.load.equipment,
      state: equipmentOk ? ('done' as const) : ('required' as const),
      action: null as string | null,
    },
    {
      id: 'rate',
      title: 'Customer rate on file',
      detail: customerRate,
      state: rateOk ? ('done' as const) : ('required' as const),
      action: null as string | null,
    },
    {
      id: 'maxbuy',
      title: maxBuySet ? 'Max buy set' : 'Max buy not set',
      detail: maxBuySet ? `$${Number(maxBuyDraft).toFixed(2)} ${detail.currency}` : 'Internal ceiling required',
      state: maxBuySet ? ('done' as const) : ('required' as const),
      action: maxBuySet ? null : 'Set max buy',
    },
    {
      id: 'hook',
      title: hookAppt ? 'Hook appointment set' : 'Hook appointment missing',
      detail: hookAppt ? 'Confirmed on file' : 'Required before posting',
      state: hookAppt ? ('done' as const) : ('required' as const),
      action: hookAppt ? null : 'Add appointment',
    },
    {
      id: 'drop',
      title: dropAppt ? 'Drop appointment set' : 'Drop appointment missing',
      detail: dropAppt ? 'Confirmed on file' : 'Required before posting',
      state: dropAppt ? ('done' as const) : ('required' as const),
      action: dropAppt ? null : 'Add appointment',
    },
    {
      id: 'broker',
      title: brokerAssigned ? 'Owning broker assigned' : 'No owning broker',
      detail: brokerAssigned ? detail.load.broker || 'Assigned' : 'Assign before posting',
      state: brokerAssigned ? ('done' as const) : ('required' as const),
      action: brokerAssigned ? null : 'Assign',
    },
    {
      id: 'bol',
      title: 'No BOL / commodity data',
      detail: 'Optional enrichment for carriers',
      state: 'advisory' as const,
      action: null as string | null,
    },
    {
      id: 'bench',
      title: 'No market benchmark',
      detail: 'DAT / Loadlink quote not available',
      state: 'advisory' as const,
      action: null as string | null,
    },
  ]

  const requiredItems = checklist.filter((c) => c.id !== 'bol' && c.id !== 'bench')
  const requiredDone = requiredItems.filter((c) => c.state === 'done').length
  const requiredTotal = requiredItems.length
  const blocking = checklist.filter((c) => c.state === 'required')
  const advisories = checklist.filter((c) => c.state === 'advisory')
  const alerts = checklist.filter((c) => c.state === 'required' || c.state === 'advisory')
  const canPost = blocking.length === 0

  const runAction = (id: string) => {
    if (id === 'maxbuy') {
      const el = document.getElementById('dd-max-buy-input') as HTMLInputElement | null
      el?.focus()
      return
    }
    if (id === 'hook') setHookAppt(true)
    if (id === 'drop') setDropAppt(true)
    if (id === 'broker') {
      setBrokerAssigned(true)
      onPatchDetail({
        load: { ...detail.load, broker: detail.load.broker || detail.salesRep },
      })
    }
  }

  const applyMaxBuy = (raw: string) => {
    setMaxBuyDraft(raw)
    const n = Number(raw)
    if (!raw || Number.isNaN(n) || n <= 0) {
      onPatchDetail({ maxBuy: '$0.00', bookNowRate: '—', rejectAbove: '—' })
      return
    }
    const book = (n * 0.925).toFixed(2)
    const reject = (n * 1.08).toFixed(2)
    onPatchDetail({
      maxBuy: `$${n.toFixed(2)}`,
      bookNowRate: `$${book}`,
      rejectAbove: `$${reject}`,
    })
  }

  const goFindPost = () => {
    if (!canPost) {
      setWhyOpen(true)
      return
    }
    setPosted(true)
    onPostToSourcing()
  }

  const activeLines = commodities.filter((c) => c.probill === activeProbill)
  const probills = [...new Set(commodities.map((c) => c.probill))]

  const addCommodity = () => {
    const n = commodities.length + 1
    setCommodities((prev) => [
      ...prev,
      {
        probill: activeProbill || `P${detail.load.id}`,
        bol: `${detail.poNumber}-${String(n).padStart(3, '0')}`,
        qty: '1 SKID',
        weight: '500 LBS',
        description: 'New commodity line',
        pieces: '1',
        classCode: '70',
        hazmat: false,
        dims: '48×40×40 in',
        stackable: true,
      },
    ])
  }

  return (
    <div className="dd-summary dd-overview">
      {!hideReadiness && (
      <section className={cn('dd-ready', canPost ? 'is-ready' : 'is-blocked')}>
        <div className="dd-ready__top">
          <div className="dd-ready__status">
            <div className="dd-ready__icon">
              {canPost ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            </div>
            <div className="dd-ready__copy">
              <strong>{canPost ? 'Ready to post to sourcing' : 'Not ready to post to sourcing'}</strong>
              <span>
                {canPost
                  ? 'Required checks clear — post when you are ready.'
                  : `${blocking.length} blocking alert${blocking.length === 1 ? '' : 's'} before carriers can see this load`}
              </span>
            </div>
          </div>
          <div className="dd-ready__progress">
            <span>
              {requiredDone}/{requiredTotal}
            </span>
            <div className="dd-ready__bar">
              <i style={{ width: `${Math.round((requiredDone / Math.max(requiredTotal, 1)) * 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="dd-ready__split">
          <div className="dd-ready__go">
            <span className="dd-ready__go-label">Sourcing</span>
            <strong>{posted ? 'Live on sourcing' : canPost ? 'Ready to go' : 'Blocked'}</strong>
            <em>
              {canPost
                ? 'Post this load to the carrier marketplace.'
                : 'Resolve alerts on the right to unlock posting.'}
            </em>
            <div className="dd-ready__go-actions">
              <button
                type="button"
                className={cn('dd-btn dd-btn--primary dd-ready__post', !canPost && 'is-disabled')}
                onClick={goFindPost}
                aria-disabled={!canPost}
              >
                {posted ? 'Posted to sourcing' : 'Post to sourcing'}
                {!canPost && <em>{blocking.length}</em>}
              </button>
              {!canPost && (
                <button type="button" className="dd-ready__why" onClick={() => setWhyOpen((v) => !v)}>
                  Why blocked?
                </button>
              )}
              {whyOpen && !canPost && (
                <div className="dd-ready__popover" role="dialog" aria-label="Blocking items">
                  <div className="dd-ready__popover-head">
                    <strong>Resolve to unlock posting</strong>
                    <button type="button" className="dd-icon-btn" onClick={() => setWhyOpen(false)} aria-label="Close">
                      ×
                    </button>
                  </div>
                  {blocking.map((b) => (
                    <div key={b.id} className="dd-ready__popover-row">
                      <div>
                        <strong>{b.title}</strong>
                        <span>{b.detail}</span>
                      </div>
                      {b.action && (
                        <button type="button" className="dd-ready-item__btn" onClick={() => runAction(b.id)}>
                          {b.action}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="dd-ready__tags">
              <span className="dd-meta-inline">Tags</span>
              <TagPopover tags={tags} onChange={onTags} />
            </div>
          </div>

          <div className="dd-ready__alerts">
            <div className="dd-ready__alerts-head">
              <strong>Alerts</strong>
              <span>
                {blocking.length} blocking
                {advisories.length > 0 ? ` · ${advisories.length} advisory` : ''}
              </span>
            </div>
            <div className="dd-ready__alerts-list">
              {alerts.length === 0 && (
                <div className="dd-ready__alerts-empty">
                  <CheckCircle2 size={16} />
                  <span>No open alerts</span>
                </div>
              )}
              {alerts.map((item) => (
                <div key={item.id} className={cn('dd-alert-card', `is-${item.state}`)}>
                  <div className="dd-alert-card__icon">
                    {item.state === 'required' ? <AlertTriangle size={14} /> : <Info size={14} />}
                  </div>
                  <div className="dd-alert-card__body">
                    <div className="dd-alert-card__top">
                      <strong>{item.title}</strong>
                      <span className={cn('dd-ready-tag', `is-${item.state}`)}>
                        {item.state === 'required' ? 'Required' : 'Advisory'}
                      </span>
                    </div>
                    <em>{item.detail}</em>
                  </div>
                  {item.action && (
                    <button type="button" className="dd-ready-item__btn" onClick={() => runAction(item.id)}>
                      {item.action}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      <section className="dd-bid-thresh">
        <div className="dd-bid-thresh__head">
          <strong>Bidding thresholds</strong>
          <span className="dd-chip-soft">{detail.currency}</span>
          <span className="dd-chip-soft is-warn">Required to post</span>
        </div>
        <div className="dd-bid-thresh__grid">
          <div className="dd-bid-card">
            <span>Book now</span>
            <strong className={detail.bookNowRate === '—' ? 'is-empty' : ''}>
              {detail.bookNowRate === '—' ? 'Not set' : detail.bookNowRate}
            </strong>
            <em>Auto-accept at or below this rate</em>
            {detail.bookNowRate !== '—' && <i className="dd-bid-card__badge">AUTO −7.5%</i>}
          </div>
          <div className="dd-bid-card is-focus">
            <span>Max buy</span>
            <label className="dd-bid-card__input">
              <span>$</span>
              <input
                id="dd-max-buy-input"
                value={maxBuyDraft}
                placeholder="0.00"
                onChange={(e) => applyMaxBuy(e.target.value.replace(/[^0-9.]/g, ''))}
              />
            </label>
            <em>Internal ceiling — drives the other two</em>
          </div>
          <div className="dd-bid-card">
            <span>Reject above</span>
            <strong className={detail.rejectAbove === '—' ? 'is-empty' : ''}>
              {detail.rejectAbove === '—' ? 'Not set' : detail.rejectAbove}
            </strong>
            <em>Auto-reject bids above this rate</em>
          </div>
        </div>
      </section>

      <section className="dd-ov-freight">
        <div className="dd-ov-freight__head">
          <div className="dd-ov-panel__title">
            <span>Commodity & routing</span>
          </div>
          <div className="dd-ov-freight__tools">
            <div className="dd-probill-tabs">
              {probills.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={cn(activeProbill === p && 'is-active')}
                  onClick={() => setActiveProbill(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <button type="button" className="dd-pill-btn" onClick={addCommodity}>
              <Plus size={13} />
              Line
            </button>
          </div>
        </div>
        <div className="dd-ov-freight__table">
          <div className="dd-ov-freight__thead">
            <span>Description</span>
            <span>BOL</span>
            <span>Qty</span>
            <span>Weight</span>
            <span>Pieces</span>
            <span>Dims</span>
            <span>Flags</span>
          </div>
          {activeLines.map((c) => (
            <div key={`${c.probill}-${c.bol}`} className="dd-ov-freight__row">
              <strong>{c.description ?? 'Commodity'}</strong>
              <span className="mono">{c.bol}</span>
              <span>{c.qty}</span>
              <span>{c.weight}</span>
              <span>{c.pieces ?? '—'}</span>
              <span>{c.dims ?? '—'}</span>
              <span className="dd-ov-freight__flags">
                {c.hazmat && <i className="is-haz">Haz</i>}
                {c.stackable && <i className="is-ok">Stack</i>}
                <i>Cl {c.classCode ?? '—'}</i>
              </span>
            </div>
          ))}
          {activeLines.length === 0 && <div className="dd-ov-freight__empty">No commodity lines</div>}
        </div>
      </section>
    </div>
  )
}

function InstructionsTab({
  detail,
  onCarrier,
  onInternal,
}: {
  detail: LoadDetail
  onCarrier: (v: string) => void
  onInternal: (v: string) => void
}) {
  const [side, setSide] = useState<'carrier' | 'internal'>('carrier')
  const value = side === 'carrier' ? detail.carrierInstructions : detail.internalInstructions
  const setValue = side === 'carrier' ? onCarrier : onInternal

  return (
    <div className="dd-instructions">
      <aside className="dd-instructions__nav">
        <div className="dd-card__title">Instructions</div>
        <button
          type="button"
          className={cn(side === 'carrier' && 'is-active')}
          onClick={() => setSide('carrier')}
        >
          Carrier
        </button>
        <button
          type="button"
          className={cn(side === 'internal' && 'is-active')}
          onClick={() => setSide('internal')}
        >
          Internal
        </button>
      </aside>
      <section className="dd-card dd-instructions__editor">
        <div className="dd-instructions__head">
          <div>
            <div className="dd-instructions__title">
              {side === 'carrier' ? 'Carrier instructions' : 'Internal instructions'}
            </div>
            <div className="dd-instructions__sub">
              {side === 'carrier'
                ? 'Visible to the carrier — sent when posting the load'
                : 'Internal only — not shared with carriers'}
            </div>
          </div>
          <button type="button" className="dd-btn dd-btn--primary">
            Save
          </button>
        </div>
        <div className="dd-toolbar" aria-hidden>
          <span>B</span>
          <span>I</span>
          <span>H</span>
          <span>•</span>
          <span>1.</span>
          <span>🔗</span>
        </div>
        <textarea
          className="dd-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            side === 'carrier'
              ? 'Add carrier instructions for this leg…'
              : 'Add internal notes…'
          }
        />
        <div className="dd-instructions__foot">
          <span>
            {value.length} characters · {value.split('\n').length} line
            {value.split('\n').length === 1 ? '' : 's'}
          </span>
          <span>{value.trim() ? 'Edited' : 'Not yet written'}</span>
        </div>
      </section>
    </div>
  )
}

function DocumentsTab({ detail }: { detail: LoadDetail }) {
  const folders = useMemo(() => {
    const map = new Map<string, typeof detail.documents>()
    for (const doc of detail.documents) {
      const list = map.get(doc.folder) ?? []
      list.push(doc)
      map.set(doc.folder, list)
    }
    return [...map.entries()]
  }, [detail.documents])

  const [selected, setSelected] = useState(detail.documents[0]?.id)
  const [query, setQuery] = useState('')
  const active = detail.documents.find((d) => d.id === selected) ?? detail.documents[0]

  return (
    <div className="dd-docs">
      <aside className="dd-docs__nav">
        <div className="dd-card__title">Documents</div>
        <label className="dd-docs__search">
          <Search size={13} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files…"
          />
        </label>
        {folders.map(([folder, docs]) => {
          const filtered = docs.filter((d) =>
            d.name.toLowerCase().includes(query.toLowerCase())
          )
          if (filtered.length === 0) return null
          return (
            <div key={folder} className="dd-docs__folder">
              <div className="dd-docs__folder-name">
                {folder} ({filtered.length})
              </div>
              {filtered.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  className={cn('dd-docs__file', selected === doc.id && 'is-active')}
                  onClick={() => setSelected(doc.id)}
                >
                  <FileText
                    size={14}
                    className={doc.kind === 'pdf' ? 'is-pdf' : 'is-xml'}
                  />
                  <span>{doc.name}</span>
                </button>
              ))}
            </div>
          )
        })}
      </aside>

      <section className="dd-card dd-docs__preview">
        {active ? (
          <>
            <div className="dd-docs__preview-head">
              <div>
                <div className="dd-docs__preview-name">{active.name}</div>
                <div className="dd-docs__preview-meta">
                  {active.source} · {active.date}
                </div>
              </div>
              <div className="dd-docs__preview-actions">
                <button type="button" className="dd-icon-btn" aria-label="Open">
                  <ExternalLink size={14} />
                </button>
                <button type="button" className="dd-icon-btn" aria-label="Download">
                  <Download size={14} />
                </button>
              </div>
            </div>
            <div className="dd-docs__canvas">
              <div className="dd-docs__sheet">
                <div className="dd-docs__sheet-brand">TS TRUCKING</div>
                <div className="dd-docs__sheet-title">Document preview</div>
                <p>
                  Preview for <strong>{active.name}</strong>. Full PDF/XML rendering
                  would appear here in production.
                </p>
                <div className="dd-docs__sheet-grid">
                  <div>
                    <span>Probill</span>
                    <strong>{detail.load.id}</strong>
                  </div>
                  <div>
                    <span>Customer</span>
                    <strong>{detail.load.customer}</strong>
                  </div>
                  <div>
                    <span>Route</span>
                    <strong>
                      {detail.load.origin} → {detail.load.destination}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="dd-empty">No documents</div>
        )}
      </section>
    </div>
  )
}


const AI_KIND_ICON: Record<AiActivityKind, typeof Zap> = {
  check: ClipboardCheck,
  rate: DollarSign,
  email: Mail,
  whatsapp: MessageCircle,
  board: RadioTower,
  score: Gauge,
}

function AiActivityFeed({ entries }: { entries: AiActivityEntry[] }) {
  const failed = entries.filter((e) => e.status === 'warn').length
  const done = entries.filter((e) => e.status === 'success').length
  const lastRun = entries[0]

  if (entries.length === 0) {
    return (
      <div className="dd-rail-stack">
        <div className="dd-empty">No AI activity on this load yet</div>
      </div>
    )
  }

  return (
    <div className="dd-rail-stack dd-ai">
      <div className="dd-ai__sum">
        <strong>{entries.length} actions</strong>
        <span className="is-ok">{done} succeeded</span>
        {failed > 0 && <span className="is-warn">{failed} failed</span>}
        <em>Last {lastRun.when}</em>
      </div>

      <ol className="dd-ai-tl">
        {entries.map((entry) => {
          const Icon = AI_KIND_ICON[entry.kind]
          return (
            <li key={entry.id} className={cn('dd-ai-tl__item', `is-${entry.status}`)}>
              <i className="dd-ai-tl__mark">
                <Icon size={12} />
              </i>
              <div className="dd-ai-tl__body">
                <div className="dd-ai-tl__top">
                  <strong>{entry.title}</strong>
                  <em>{entry.when}</em>
                </div>
                <span className="dd-ai-tl__run">{entry.run}</span>
                <p>{entry.detail}</p>
                {entry.stats && entry.stats.length > 0 && (
                  <dl className="dd-ai-tl__stats">
                    {entry.stats.map((stat) => (
                      <div key={stat.label}>
                        <dt>{stat.label}</dt>
                        <dd>{stat.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function DetailRail({
  detail,
  collapsed,
  onToggle,
  onAssignBroker,
  aiLog,
}: {
  detail: LoadDetail
  collapsed: boolean
  onToggle: () => void
  onAssignBroker: () => void
  aiLog: AiActivityEntry[]
}) {
  const [tab, setTab] = useState<'rate' | 'ai'>('rate')

  if (collapsed) {
    return (
      <button type="button" className="dd-rail-bar" onClick={onToggle} aria-label="Expand rate coverage">
        <span>Rate — Coverage</span>
      </button>
    )
  }

  const bookUnset = !detail.bookNowRate || detail.bookNowRate === '—'
  const maxUnset = !detail.maxBuy || detail.maxBuy === '—' || detail.maxBuy === '$0.00'

  return (
    <aside className="dd-rail dd-rail--ov">
      <div className="dd-rail__head">
        <div className="dd-rail-tabs" role="tablist" aria-label="Right rail sections">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'rate'}
            className={cn('dd-rail-tab', tab === 'rate' && 'is-on')}
            onClick={() => setTab('rate')}
          >
            Rate & coverage
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'ai'}
            className={cn('dd-rail-tab', tab === 'ai' && 'is-on')}
            onClick={() => setTab('ai')}
          >
            AI activity
            <span className="dd-rail-tab__count">{aiLog.length}</span>
          </button>
        </div>
        <button type="button" className="dd-icon-btn" aria-label="Collapse right rail" onClick={onToggle}>
          <PanelRightClose size={14} />
        </button>
      </div>

      {tab === 'ai' ? (
        <AiActivityFeed entries={aiLog} />
      ) : (
      <div className="dd-rail-stack">
        <div className="dd-rail-rate-pair">
          <button type="button" className="dd-rail-rate-tile">
            <em className={bookUnset ? 'is-empty' : undefined}>
              {bookUnset ? 'Not set' : detail.bookNowRate}
            </em>
            <strong>Book now</strong>
          </button>
          <button type="button" className="dd-rail-rate-tile is-max">
            <em className={maxUnset ? 'is-empty' : undefined}>
              {maxUnset ? 'Not set' : detail.maxBuy}
            </em>
            <strong>Max buy</strong>
          </button>
        </div>

        <section className="dd-rail-card">
          <div className="dd-rail-card__head">
            <strong>Live vendor benchmarks</strong>
            <span className="dd-live-pill">Live</span>
          </div>
          <div className="dd-bench-table">
            <div className="dd-bench-table__head">
              <span>Source</span>
              <span>Quote</span>
            </div>
            <div className="dd-bench-table__row">
              <strong>DAT</strong>
              <span>No quote market price</span>
            </div>
            <div className="dd-bench-table__row">
              <strong>Loadlink</strong>
              <span>No quote market price</span>
            </div>
          </div>
        </section>

        <section className="dd-rail-card">
          <div className="dd-rail-kv">
            <div>
              <span>Type</span>
              <strong>{detail.type}</strong>
            </div>
            <div>
              <span>Broker</span>
              {detail.load.broker ? (
                <strong>{detail.load.broker}</strong>
              ) : (
                <button type="button" className="dd-assign-link" onClick={onAssignBroker}>
                  + Assign
                </button>
              )}
            </div>
            <div>
              <span>Team</span>
              <strong>{detail.load.team}</strong>
            </div>
            <div>
              <span>Customer rate</span>
              <strong>
                {detail.load.fee.toFixed(2)} {detail.currency}
              </strong>
            </div>
            <div>
              <span>Target margin</span>
              <strong className="is-muted">—</strong>
            </div>
            <div>
              <span>Cargo value</span>
              <strong>{detail.cargoValue || 'Not provided'}</strong>
            </div>
          </div>
        </section>
      </div>
      )}
    </aside>
  )
}

function ActivityTab({ detail }: { detail: LoadDetail }) {
  const [filter, setFilter] = useState<'all' | ActivityAction>('all')
  const [events, setEvents] = useState<ActivityEvent[]>(() => [
    makeActivity({
      when: detail.startedAt,
      who: detail.csr,
      action: 'other',
      text: 'Opened Overview for load review',
      loadId: detail.load.id,
    }),
    ...SEED_ACTIVITY.map((e) => ({ ...e, loadId: detail.load.id })),
    makeActivity({
      when: 'Today',
      who: detail.salesRep,
      action: 'other',
      text: 'Customer rate confirmed on order',
      loadId: detail.load.id,
    }),
  ])

  const filtered =
    filter === 'all' ? events : events.filter((e) => e.action === filter)

  return (
    <div className="dd-activity">
      <div className="dd-activity__toolbar">
        <strong>Activity log</strong>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          aria-label="Filter activity"
        >
          <option value="all">All actions</option>
          <option value="max_buy">Max buy</option>
          <option value="stage_move">Stage moves</option>
          <option value="post_dat">DAT post</option>
          <option value="post_loadlink">Loadlink post</option>
          <option value="blast_email">Blast email</option>
          <option value="blast_whatsapp">Blast WhatsApp</option>
          <option value="cmt_approve">CMT approve</option>
          <option value="cmt_reject">CMT reject</option>
          <option value="offer_add">Offers</option>
          <option value="other">Other</option>
        </select>
        <button
          type="button"
          className="dd-pill-btn"
          onClick={() =>
            setEvents((prev) => [
              makeActivity({
                when: 'Just now',
                who: 'Sukhdeep Dhillon',
                action: 'stage_move',
                text: `Mock note logged on ${detail.load.id}`,
                loadId: detail.load.id,
              }),
              ...prev,
            ])
          }
        >
          Add mock event
        </button>
      </div>
      {filtered.map((e) => (
        <article key={e.id} className="dd-activity__item">
          <div className="dd-activity__dot" />
          <div>
            <strong>{e.text}</strong>
            <span>
              {e.who} · {e.when} · <em className="dd-activity__action">{e.action.replace(/_/g, ' ')}</em>
            </span>
          </div>
        </article>
      ))}
      {filtered.length === 0 && <div className="dd-muted">No events for this filter.</div>}
    </div>
  )
}

/* ══════════════ View 2 (redesign preview) building blocks ══════════════ */

type DetailView = 'v1' | 'v2' | 'v3' | 'v4'

const VIEW_OPTIONS = [
  ['v1', 'View 1', 'Current theme'],
  ['v2', 'View 2', 'Redesign preview'],
  ['v3', 'View 3', 'Case layout'],
  ['v4', 'View 4', 'Single sourcing desk'],
] as const

const VIEW_STORAGE_KEY = 'cs-detail-view'

function readStoredView(): DetailView {
  try {
    const v = localStorage.getItem(VIEW_STORAGE_KEY)
    if (v === 'v1' || v === 'v2' || v === 'v3' || v === 'v4') return v
  } catch {
    /* ignore */
  }
  return 'v1'
}

function ViewSwitch({ view, onView }: { view: DetailView; onView: (v: DetailView) => void }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const current = VIEW_OPTIONS.find((o) => o[0] === view) ?? VIEW_OPTIONS[0]

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className="dd-viewdd" ref={rootRef}>
      <button
        type="button"
        className="dd-viewdd__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {current[1]}
        <ChevronDown size={12} />
      </button>
      {open && (
        <ul className="dd-viewdd__menu" role="listbox" aria-label="Layout view">
          {VIEW_OPTIONS.map(([id, label, hint]) => (
            <li key={id}>
              <button
                type="button"
                role="option"
                aria-selected={view === id}
                className={cn(view === id && 'is-active')}
                onClick={() => {
                  onView(id)
                  setOpen(false)
                }}
              >
                <strong>{label}</strong>
                <span>{hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* Compact lane bar replaces the full stop-card gallery in View 2 */
function LaneBar({
  detail,
  routeOpen,
  onExpand,
}: {
  detail: LoadDetail
  routeOpen: boolean
  onExpand: () => void
}) {
  const stops = detail.stops
  const first = stops[0]
  const last = stops[stops.length - 1]
  const apptCount = stops.filter((s) => s.appointmentRequired).length
  const pendingCount = stops.filter((s) => s.statusTone === 'pending').length
  const crossBorder = stops.some((s) =>
    /mexico|nuevo|monterrey|guadalajara|mx\b/i.test(`${s.city} ${s.address}`)
  )

  return (
    <div className="dd-lane">
      <div className="dd-lane__end">
        <span className="dd-lane__role">Hook</span>
        <strong>{first?.city}</strong>
        <em>{first?.when}</em>
      </div>

      <div className="dd-lane__link" aria-hidden>
        <span className="dd-lane__miles">{detail.load.miles.toLocaleString()} mi</span>
      </div>

      <div className="dd-lane__end is-drop">
        <span className="dd-lane__role">Drop</span>
        <strong>{last?.city}</strong>
        <em>{last?.when}</em>
      </div>

      <div className="dd-lane__flags">
        {stops.length > 2 && <span className="dd-lane__chip">{stops.length} stops</span>}
        {apptCount > 0 && (
          <span className="dd-lane__chip is-warn">
            <AlertTriangle size={11} />
            {apptCount} appt needed
          </span>
        )}
        {pendingCount > 0 && <span className="dd-lane__chip is-warn">{pendingCount} pending</span>}
        {crossBorder && <span className="dd-lane__chip is-info">Cross-border</span>}
        <button
          type="button"
          className={cn('dd-lane__more', routeOpen && 'is-open')}
          onClick={onExpand}
          aria-expanded={routeOpen}
        >
          {routeOpen ? 'Hide stops' : 'All stops'}
          <ChevronDown size={12} />
        </button>
      </div>
    </div>
  )
}

type RailCheck = { label: string; ok: boolean; hint?: string }

/* Stage-aware right rail: shows the context that matters for the current sub-stage */
function ContextRail({
  detail,
  stage,
  subStage,
  collapsed,
  onToggle,
  onAssignBroker,
  onGoto,
  onAuto,
  autoLabel,
}: {
  detail: LoadDetail
  stage: DetailStage
  subStage: string
  collapsed: boolean
  onToggle: () => void
  onAssignBroker: () => void
  onGoto: (stage: DetailStage, sub: string) => void
  onAuto: () => void
  autoLabel: string | null
}) {
  if (collapsed) {
    return (
      <button type="button" className="dd-rail-bar" onClick={onToggle} aria-label="Expand context rail">
        <span>Context</span>
      </button>
    )
  }

  const bookUnset = !detail.bookNowRate || detail.bookNowRate === '—'
  const maxUnset = !detail.maxBuy || detail.maxBuy === '—' || detail.maxBuy === '$0.00'
  const apptOpen = detail.stops.filter((s) => s.appointmentRequired).length

  const bids = detail.bids
  const accepted = bids.find((b) => b.status === 'Accepted')
  const best = bids.find((b) => b.best) ?? accepted ?? bids[0]
  const pending = bids.filter((b) => b.status === 'Pending' || b.status === 'Countered').length

  const readiness: RailCheck[] = [
    { label: 'Equipment', ok: Boolean(detail.load.equipment), hint: detail.load.equipment },
    { label: 'Book now rate', ok: !bookUnset, hint: bookUnset ? 'Not set' : detail.bookNowRate },
    { label: 'Max buy (hard limit)', ok: !maxUnset, hint: maxUnset ? 'Not set' : detail.maxBuy },
    { label: 'Broker assigned', ok: Boolean(detail.load.broker), hint: detail.load.broker || 'Unassigned' },
    {
      label: 'Appointments',
      ok: apptOpen === 0,
      hint: apptOpen === 0 ? 'All booked' : `${apptOpen} to book`,
    },
  ]
  const blockers = readiness.filter((c) => !c.ok).length

  /* one primary next action per sub-stage */
  const next: { title: string; body: string; cta: string; run: () => void } = (() => {
    if (stage === 'Sourcing' && !isFindPost(subStage))
      return {
        title: blockers ? `${blockers} item${blockers > 1 ? 's' : ''} to resolve` : 'Ready to post',
        body: blockers ? 'Fill the highlighted gates to post this load.' : 'Rates and gates are set.',
        cta: 'Go to Find & Post',
        run: () => onGoto('Sourcing', 'Find & Post'),
      }
    if (isFindPost(subStage))
      return {
        title: 'Reach carriers',
        body: 'Blast your shortlist or post to DAT / Loadlink.',
        cta: 'Review offers',
        run: () => onGoto('Tender', 'Offers & Bids'),
      }
    if (subStage === 'Offers & Bids')
      return {
        title: accepted ? 'Offer accepted' : `${bids.length} offers in`,
        body: accepted ? `${accepted.carrier} at ${accepted.amount}.` : `${pending} awaiting your reply.`,
        cta: 'Finalize tender',
        run: () => onGoto('Tender', 'Finalize Tender'),
      }
    if (subStage === 'Finalize Tender')
      return {
        title: 'Confirm the carrier',
        body: accepted ? `${accepted.carrier} is awarded.` : 'No accepted offer yet.',
        cta: 'Send to CMT',
        run: () => onGoto('Award', 'CMT'),
      }
    if (stage === 'Award')
      return {
        title: 'Validate & award',
        body: 'Check compliance, then move to booking.',
        cta: 'Go to Booking',
        run: () => onGoto('Booking', 'Create Contract'),
      }
    return {
      title: 'Booking',
      body: 'Build the contract and send confirmation.',
      cta: 'Open Resources',
      run: () => onGoto('Booking', 'Resources'),
    }
  })()

  return (
    <aside className="dd-rail dd-rail--ctx">
      <div className="dd-rail__head">
        <span className="dd-rail__title">Context</span>
        <button type="button" className="dd-icon-btn" aria-label="Collapse right rail" onClick={onToggle}>
          <PanelRightClose size={14} />
        </button>
      </div>

      <div className="dd-rail-stack">
        <section className={cn('dd-ctx-next', blockers > 0 && stage === 'Sourcing' && 'is-warn')}>
          <span className="dd-ctx-next__eyebrow">Next action</span>
          <strong>{next.title}</strong>
          <p>{next.body}</p>
          <div className="dd-ctx-next__row">
            <button type="button" className="dd-ctx-next__cta" onClick={next.run}>
              {next.cta}
              <ChevronRight size={13} />
            </button>
            {autoLabel && (
              <button type="button" className="dd-ctx-next__auto" onClick={onAuto}>
                <Zap size={12} />
                {autoLabel}
              </button>
            )}
          </div>
        </section>

        {/* Rates travel with every stage — single source, no duplicate entry */}
        <section className="dd-ctx-card">
          <div className="dd-ctx-card__head">
            <strong>Rates & gates</strong>
            <span className="dd-ctx-card__note">{detail.currency}</span>
          </div>
          <div className="dd-ctx-rates">
            <div className={cn('dd-ctx-rate', bookUnset && 'is-empty')}>
              <span>Book now</span>
              <strong>{bookUnset ? 'Not set' : detail.bookNowRate}</strong>
            </div>
            <div className={cn('dd-ctx-rate is-max', maxUnset && 'is-empty')}>
              <span>Max buy</span>
              <strong>{maxUnset ? 'Not set' : detail.maxBuy}</strong>
            </div>
          </div>
          <div className="dd-ctx-market">
            <span>Market mid</span>
            <strong>{detail.marketMid}</strong>
          </div>
        </section>

        {stage === 'Sourcing' && (
          <section className="dd-ctx-card">
            <div className="dd-ctx-card__head">
              <strong>Readiness</strong>
              <span className={cn('dd-ctx-pill', blockers === 0 ? 'is-ok' : 'is-warn')}>
                {blockers === 0 ? 'Ready' : `${blockers} open`}
              </span>
            </div>
            <ul className="dd-ctx-checks">
              {readiness.map((c) => (
                <li key={c.label} className={c.ok ? 'is-ok' : 'is-open'}>
                  <i>{c.ok ? <Check size={11} /> : <AlertTriangle size={11} />}</i>
                  <span>{c.label}</span>
                  {c.label === 'Broker assigned' && !c.ok ? (
                    <button type="button" className="dd-assign-link" onClick={onAssignBroker}>
                      + Assign
                    </button>
                  ) : (
                    <em>{c.hint}</em>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {(stage === 'Tender' || stage === 'Award') && (
          <section className="dd-ctx-card">
            <div className="dd-ctx-card__head">
              <strong>Offers</strong>
              <span className="dd-ctx-card__note">{bids.length} total</span>
            </div>
            {best ? (
              <div className="dd-ctx-offer">
                <div className="dd-ctx-offer__top">
                  <strong>{best.carrier}</strong>
                  <span className={cn('dd-ctx-pill', best.status === 'Accepted' ? 'is-ok' : 'is-info')}>
                    {best.status}
                  </span>
                </div>
                <div className="dd-ctx-offer__nums">
                  <div>
                    <span>Amount</span>
                    <strong>{best.amount}</strong>
                  </div>
                  <div>
                    <span>vs target</span>
                    <strong>{best.vsTarget}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  className="dd-ctx-linkbtn"
                  onClick={() => onGoto('Tender', 'Offers & Bids')}
                >
                  Open negotiation
                  <ChevronRight size={12} />
                </button>
              </div>
            ) : (
              <div className="dd-muted">No offers yet.</div>
            )}
            <div className="dd-ctx-mini">
              <div>
                <span>Pending</span>
                <strong>{pending}</strong>
              </div>
              <div>
                <span>Accepted</span>
                <strong>{accepted ? 1 : 0}</strong>
              </div>
            </div>
          </section>
        )}

        <section className="dd-ctx-card">
          <div className="dd-ctx-kv">
            <div>
              <span>Broker</span>
              {detail.load.broker ? (
                <strong>{detail.load.broker}</strong>
              ) : (
                <button type="button" className="dd-assign-link" onClick={onAssignBroker}>
                  + Assign
                </button>
              )}
            </div>
            <div>
              <span>Team</span>
              <strong>{detail.load.team}</strong>
            </div>
            <div>
              <span>Customer rate</span>
              <strong>
                {detail.load.fee.toFixed(2)} {detail.currency}
              </strong>
            </div>
          </div>
        </section>
      </div>
    </aside>
  )
}

/* where a stage/sub pair sits in the lifecycle, as indices */
function lifecyclePos(stages: LoadDetail['stages'], stage: string, sub: string) {
  const s = Math.max(0, stages.findIndex((b) => b.stage === stage))
  const u = Math.max(0, (stages[s]?.items ?? []).findIndex((it) => it.label === sub))
  return { stage: s, sub: u }
}

export function LoadDetailsPage({ load, onBack, onOpenCarrierPrefs }: LoadDetailsPageProps) {
  const base = useMemo(() => buildLoadDetail(load), [load])
  const [detail, setDetail] = useState(base)
  const [tab, setTab] = useState<TabId>('summary')
  const [stage, setStage] = useState<DetailStage>(load.stage as DetailStage)
  const [subStage, setSubStage] = useState<string>(load.subStage)
  const [lifeCollapsed, setLifeCollapsed] = useState(false)
  const [railCollapsed, setRailCollapsed] = useState(false)
  const [tags, setTags] = useState<string[]>(base.tags)
  const [postOpen, setPostOpen] = useState(false)
  const [offerOpen, setOfferOpen] = useState(false)
  const [autoAsk, setAutoAsk] = useState(false)
  const [autoOpen, setAutoOpen] = useState(false)
  const [view, setView] = useState<DetailView>(() => readStoredView())
  const [factsOpen, setFactsOpen] = useState(false)
  const [routeOpen, setRouteOpen] = useState(false)
  const [aiLog, setAiLog] = useState<AiActivityEntry[]>(() => buildAiActivity(base))
  const [v3Tab, setV3Tab] = useState<'overview' | 'instructions' | 'documents'>('overview')
  const [caseEvents, setCaseEvents] = useState<CaseEvent[]>([])
  const [actCollapsed, setActCollapsed] = useState(false)
  /* every stage portals its buttons into this slot in the work bar */
  const [actionSlot, setActionSlot] = useState<HTMLDivElement | null>(null)
  /* Overview is one workspace with two steps: setup, then Find & Post */
  const [setupOpen, setSetupOpen] = useState(true)
  const [findOpen, setFindOpen] = useState(false)
  const findStepRef = useRef<HTMLElement | null>(null)
  /* furthest point reached — browsing back to review history must not un-check a stage */
  const [reached, setReached] = useState(() =>
    lifecyclePos(base.stages, load.stage, load.subStage)
  )

  const logCase = (e: {
    key?: string
    title: string
    detail?: string
    who?: string
    status?: CaseEvent['status']
  }) => {
    setCaseEvents((prev) => {
      const entry: CaseEvent = {
        id: `case-${Date.now()}-${prev.length}`,
        key: e.key,
        title: e.title,
        detail: e.detail,
        who: e.who ?? 'You',
        when: clockNow(),
        status: e.status ?? 'ok',
      }
      if (e.key && prev[0]?.key === e.key) return [entry, ...prev.slice(1)]
      return [entry, ...prev]
    })
  }

  const setDetailView = (next: DetailView) => {
    setView(next)
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    setDetail(base)
    setStage(load.stage as DetailStage)
    setSubStage(load.subStage)
    setTags(base.tags)
    setAutoOpen(false)
    setAiLog(buildAiActivity(base))
    setCaseEvents([])
    setReached(lifecyclePos(base.stages, load.stage, load.subStage))
    setSetupOpen(true)
    setFindOpen(false)

    const sourcingDone = base.stages
      .find((s) => s.stage === 'Sourcing')
      ?.items.every((it) => it.done)
    const hasOffers = base.bids.length > 0
    const atTender = load.stage === 'Tender'
    const atAward = load.stage === 'Award'
    const atSourcing = load.stage === 'Sourcing'

    /* Ask Auto Sourcing on sourcing loads; Auto Tender when sourcing is done + offers; Auto Award on award */
    if (atAward) setAutoAsk(true)
    else if (atTender || (Boolean(sourcingDone) && hasOffers)) setAutoAsk(true)
    else if (atSourcing) setAutoAsk(true)
    else setAutoAsk(false)
  }, [base, load])

  const autoMissing =
    (detail.maxBuy === '—' || detail.maxBuy === '$0.00' ? 1 : 0) +
    (detail.bookNowRate === '—' ? 1 : 0)

  const sourcingComplete = detail.stages
    .find((s) => s.stage === 'Sourcing')
    ?.items.every((it) => it.done)

  /* sourcing not done → Auto Sourcing; done (or Tender) → Auto Tender; Award → Auto Award */
  const autoMode: AutoMode | null =
    stage === 'Award'
      ? 'award'
      : stage === 'Tender' || (stage === 'Sourcing' && Boolean(sourcingComplete) && detail.bids.length > 0)
        ? 'tender'
        : stage === 'Sourcing'
          ? 'sourcing'
          : null

  const completeSourcingAndAskTender = () => {
    setDetail((d) => {
      const stages = d.stages.map((s) =>
        s.stage === 'Sourcing' ? { ...s, items: s.items.map((it) => ({ ...it, done: true })) } : s
      )
      const completedSubs = stages.reduce((n, s) => n + s.items.filter((i) => i.done).length, 0)
      return { ...d, stages, completedSubs }
    })
    setAiLog((prev) => [
      {
        id: `ai-run-${prev.length}`,
        run: 'Auto Sourcing',
        when: clockNow(),
        title: 'Run completed',
        detail: 'Sourcing marked complete — Overview and Find & Post are now done.',
        status: 'success',
        kind: 'check',
        stats: [{ label: 'Next', value: 'Auto Tender' }],
      },
      ...prev,
    ])
    logCase({
      title: 'Auto Sourcing run completed',
      detail: 'Overview and Find & Post marked done — Auto Tender is next.',
      who: 'Auto Sourcing',
    })
    setAutoOpen(false)
    setStage('Tender')
    setSubStage('Offers & Bids')
    setAutoAsk(true)
  }

  /* progress only ever moves forward, so clicking back into a finished stage keeps its check */
  useEffect(() => {
    const pos = lifecyclePos(detail.stages, stage, subStage)
    setReached((r) =>
      pos.stage > r.stage || (pos.stage === r.stage && pos.sub > r.sub) ? pos : r
    )
  }, [detail.stages, stage, subStage])

  /* lifecycle reflects the furthest point reached, not where the user is currently looking */
  const lifeDetail = useMemo(() => {
    const stages = detail.stages.map((s, i) => {
      if (i > reached.stage) return s
      if (i < reached.stage) return { ...s, items: s.items.map((it) => ({ ...it, done: true })) }
      return {
        ...s,
        items: s.items.map((it, j) => ({ ...it, done: it.done || j < reached.sub })),
      }
    })
    const completedSubs = stages.reduce((n, s) => n + s.items.filter((i) => i.done).length, 0)
    return { ...detail, stages, completedSubs }
  }, [detail, reached])

  /* Find & Post is no longer its own workspace — it is step 2 of the Overview */
  const stageWorkspace =
    subStage === 'Offers & Bids' ||
    subStage === 'Finalize Tender' ||
    subStage === 'CMT' ||
    subStage === 'Finalize Carrier Award' ||
    subStage === 'Create Contract' ||
    subStage === 'Send Confirmation' ||
    subStage === 'Signed Confirmation' ||
    subStage === 'Resources'

  const isV2 = view === 'v2'
  const isV3 = view === 'v3'
  const isV4 = view === 'v4'
  /* V4 keeps the case shell but folds Overview and Find & Post into one desk */
  const isCase = isV3 || isV4

  const caseAlerts = useMemo(() => buildCaseAlerts(detail), [detail])
  const caseBlockers = openAlerts(caseAlerts).filter((a) => a.level === 'blocker').length
  const setupReady = caseBlockers === 0

  /* once nothing is blocking, setup folds away and Find & Post takes the space */
  useEffect(() => {
    if (!setupReady) return
    setSetupOpen(false)
    setFindOpen(true)
  }, [setupReady])

  /* picking Find & Post in the rail scrolls to step 2 instead of leaving the Overview */
  useEffect(() => {
    if (!isV3 || !isFindPost(subStage)) return
    setSetupOpen(false)
    setFindOpen(true)
    const id = window.setTimeout(
      () => findStepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      0
    )
    return () => window.clearTimeout(id)
  }, [isV3, subStage])
  /* Alerts that carry an input resolve straight from the Next actions popover. */
  const resolveCaseAlert = (id: CaseActionId, value: string) => {
    const asMoney = () => {
      const n = Number(value.replace(/[^0-9.]/g, ''))
      return n > 0 ? `$${n.toFixed(2)}` : ''
    }

    if (id === 'hook' || id === 'drop') {
      const wantPickup = id === 'hook'
      const match = (s: RouteStop) =>
        wantPickup ? s.role === 'Hook' || s.kind === 'Pickup' : s.role === 'Drop' || s.kind === 'Delivery'
      setDetail((d) => ({
        ...d,
        stops: d.stops.map((s) =>
          match(s)
            ? {
                ...s,
                appointmentRequired: false,
                when: /\d{1,2}:\d{2}/.test(s.when)
                  ? s.when.replace(/\d{1,2}:\d{2}/, value)
                  : `${s.when} · ${value}`,
                status: 'Live Appointment',
                statusTone: 'live',
              }
            : s
        ),
      }))
      logCase({
        title: `${wantPickup ? 'Pickup' : 'Delivery'} appointment booked`,
        detail: `Time set to ${value}.`,
      })
      return
    }
    if (id === 'maxbuy' || id === 'booknow' || id === 'reject') {
      const money = asMoney()
      if (!money) return
      const field = id === 'maxbuy' ? 'maxBuy' : id === 'booknow' ? 'bookNowRate' : 'rejectAbove'
      setDetail((d) => ({ ...d, [field]: money }))
      logCase({
        key: 'rates',
        title:
          id === 'maxbuy' ? 'Max buy set' : id === 'booknow' ? 'Book now set' : 'Reject above set',
        detail: `${money} on this load.`,
      })
      return
    }
    if (id === 'equipment') {
      setDetail((d) => ({ ...d, load: { ...d.load, equipment: value } }))
      logCase({ title: 'Equipment type set', detail: value })
      return
    }
    if (id === 'broker') {
      setDetail((d) => ({ ...d, load: { ...d.load, broker: value } }))
      logCase({ title: 'Owning broker assigned', detail: `${value} now owns this load.` })
      return
    }
    if (id === 'contact' || id === 'channel') {
      const isChannel = id === 'channel'
      setDetail((d) => ({
        ...d,
        bids: d.bids.map((b) =>
          b.status === 'Accepted'
            ? isChannel
              ? { ...b, channel: value as BidOffer['channel'] }
              : { ...b, ...(value.includes('@') ? { email: value } : { phone: value }) }
            : b
        ),
      }))
      logCase({
        title: isChannel ? 'Preferred channel set' : 'Carrier contact added',
        detail: value,
      })
      return
    }
    runCaseAction(id)
  }

  const runCaseAction = (id: CaseActionId) => {
    if (id === 'maxbuy') {
      setV3Tab('overview')
      logCase({ title: 'Opened max buy', detail: 'Waiting on a hard limit for this load.', status: 'info' })
      window.setTimeout(() => {
        const el = document.getElementById('dd-max-buy-input') as HTMLInputElement | null
        el?.focus()
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }, 0)
      return
    }
    if (id === 'booknow') {
      setV3Tab('overview')
      const ceiling = toRate(detail.maxBuy)
      if (ceiling > 0 && (!detail.bookNowRate || detail.bookNowRate === '—')) {
        const book = ceiling * 0.925
        setDetail((d) => ({
          ...d,
          bookNowRate: `$${book.toFixed(2)}`,
          rejectAbove: d.rejectAbove === '—' ? `$${(ceiling * 1.08).toFixed(2)}` : d.rejectAbove,
        }))
        logCase({
          title: 'Book now set from max buy',
          detail: `$${book.toFixed(2)} — 7.5% under the ${detail.maxBuy} hard limit.`,
        })
      } else {
        logCase({
          title: 'Opened book now',
          detail: 'Set the auto-accept line under Max Buy.',
          status: 'info',
        })
        window.setTimeout(() => {
          const el = document.getElementById('dd-max-buy-input') as HTMLInputElement | null
          el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }, 0)
      }
      return
    }
    if (id === 'reject') {
      const ceiling = toRate(detail.maxBuy)
      if (ceiling > 0) {
        const reject = ceiling * 1.08
        setDetail((d) => ({ ...d, rejectAbove: `$${reject.toFixed(2)}` }))
        logCase({
          title: 'Reject above set',
          detail: `$${reject.toFixed(2)} — 8% above the ${detail.maxBuy} hard limit.`,
        })
      }
      return
    }
    if (id === 'hook' || id === 'drop') {
      const wantPickup = id === 'hook'
      const stop = detail.stops.find((s) =>
        wantPickup ? s.role === 'Hook' || s.kind === 'Pickup' : s.role === 'Drop' || s.kind === 'Delivery'
      )
      setDetail((d) => ({
        ...d,
        stops: d.stops.map((s) =>
          (wantPickup ? s.role === 'Hook' || s.kind === 'Pickup' : s.role === 'Drop' || s.kind === 'Delivery')
            ? { ...s, appointmentRequired: false }
            : s
        ),
      }))
      logCase({
        title: `${wantPickup ? 'Hook' : 'Drop'} appointment added`,
        detail: stop ? `${stop.facility} · ${stop.when}` : undefined,
      })
      return
    }
    if (id === 'broker') {
      setDetail((d) => ({ ...d, load: { ...d.load, broker: d.load.broker || d.salesRep } }))
      logCase({
        title: 'Owning broker assigned',
        detail: `${detail.load.broker || detail.salesRep} now owns this load.`,
      })
      return
    }
    if (id === 'equipment') {
      logCase({
        title: 'Equipment type needs setting',
        detail: 'Set the equipment type on the order so carriers can be matched.',
        status: 'warn',
      })
      return
    }
    if (id === 'network') {
      setStage('Sourcing')
      setSubStage('Find & Post')
      const expired = detail.carriers.filter((c) => c.insurance === 'Expired').length
      logCase({
        title: 'Opened managed carrier network',
        detail:
          expired > 0
            ? `${detail.carriers.length} carriers on this lane — ${expired} blocked on expired insurance.`
            : `${detail.carriers.length} carriers on this lane, all compliant.`,
        status: expired > 0 ? 'warn' : 'info',
      })
      return
    }
    if (id === 'contact' || id === 'channel' || id === 'insurance' || id === 'cmt') {
      const awarded = detail.bids.find((b) => b.status === 'Accepted')
      setStage('Award')
      setSubStage(id === 'cmt' ? 'CMT' : 'Finalize Carrier Award')
      logCase({
        title:
          id === 'contact'
            ? 'Opened carrier contacts'
            : id === 'channel'
              ? 'Opened communication preferences'
              : id === 'insurance'
                ? 'Requested insurance certificate'
                : 'Opened CMT validation',
        detail: awarded ? `${awarded.carrier} · MC# ${awarded.mc}` : undefined,
        status: 'info',
      })
      return
    }
    if (id === 'boards' || id === 'shortlist') {
      setStage('Sourcing')
      setSubStage('Find & Post')
      logCase({
        title: id === 'boards' ? 'Opened posting boards' : 'Opened carrier shortlist',
        detail:
          id === 'boards'
            ? 'Choose DAT, Loadlink, or keep this load internal.'
            : `Review preferred and past carriers for ${detail.load.origin} → ${detail.load.destination}.`,
        status: 'info',
      })
      return
    }
    if (id === 'post' || id === 'findpost') {
      setStage('Sourcing')
      setSubStage('Find & Post')
      logCase({
        title: id === 'post' ? 'Moved to Find & Post' : 'Opened Find & Post',
        detail:
          id === 'post'
            ? 'Readiness cleared — the load can be posted.'
            : 'Finish the remaining readiness items, then post and blast.',
        status: 'info',
      })
      return
    }
    if (id === 'blast') {
      setStage('Sourcing')
      setSubStage('Find & Post')
      logCase({
        title: 'Opened carrier blast',
        detail: `Ready to reach carriers for ${detail.load.origin} → ${detail.load.destination}.`,
        status: 'info',
      })
      return
    }
    if (id === 'ai-rate') {
      /* mock suggestion: 88% of the customer rate as the hard limit */
      const suggested = detail.load.fee * 0.88
      setDetail((d) => ({
        ...d,
        maxBuy: `$${suggested.toFixed(2)}`,
        bookNowRate: `$${(suggested * 0.925).toFixed(2)}`,
        rejectAbove: `$${(suggested * 1.08).toFixed(2)}`,
      }))
      logCase({
        key: 'rates',
        title: 'AI suggested max buy',
        detail: `$${suggested.toFixed(2)} hard limit — 88% of the ${detail.currency} customer rate on this lane.`,
        who: 'AI assist',
      })
      return
    }
    if (id === 'ai-book') {
      const ceiling = toRate(detail.maxBuy)
      if (ceiling <= 0) {
        logCase({
          title: 'Set max buy first',
          detail: 'Book now is derived from the hard limit.',
          who: 'AI assist',
          status: 'warn',
        })
        return
      }
      const book = ceiling * 0.925
      setDetail((d) => ({
        ...d,
        bookNowRate: `$${book.toFixed(2)}`,
        rejectAbove: d.rejectAbove === '—' ? `$${(ceiling * 1.08).toFixed(2)}` : d.rejectAbove,
      }))
      logCase({
        key: 'rates',
        title: 'AI suggested book now',
        detail: `$${book.toFixed(2)} — 7.5% under Max Buy ${detail.maxBuy}.`,
        who: 'AI assist',
      })
      return
    }
    if (id === 'ai-email') {
      logCase({
        title: 'AI drafted carrier blast',
        detail: `Subject line and load card ready for ${detail.load.origin} → ${detail.load.destination}.`,
        who: 'AI assist',
        status: 'info',
      })
      return
    }
    if (id === 'ai-score') {
      if (detail.bids.length === 0) {
        logCase({
          title: 'Nothing to score yet',
          detail: 'No offers on this load — run a blast or post to the boards first.',
          who: 'AI assist',
          status: 'warn',
        })
        return
      }
      const best = [...detail.bids].sort((a, b) => toRate(a.allIn ?? a.amount) - toRate(b.allIn ?? b.amount))[0]
      logCase({
        title: 'AI scored offers',
        detail: `${detail.bids.length} offers ranked — ${best.carrier} at ${best.allIn ?? best.amount} scores best.`,
        who: 'AI assist',
      })
      return
    }
    if (id === 'ai-explain') {
      const missing = [
        (!detail.maxBuy || detail.maxBuy === '—' || detail.maxBuy === '$0.00') && 'Max buy',
        (!detail.bookNowRate || detail.bookNowRate === '—') && 'Book now',
        detail.stops.some((s) => (s.role === 'Hook' || s.kind === 'Pickup') && s.appointmentRequired) &&
          'Hook appointment',
        detail.stops.some((s) => (s.role === 'Drop' || s.kind === 'Delivery') && s.appointmentRequired) &&
          'Drop appointment',
        !detail.load.broker && 'Owning broker',
      ].filter(Boolean) as string[]
      logCase({
        title: 'Why this load can’t post yet',
        detail:
          missing.length === 0
            ? 'Readiness is clear — run Auto Sourcing or Post to sourcing.'
            : `Still needed: ${missing.join(', ')}.`,
        who: 'AI assist',
        status: 'info',
      })
      return
    }
    setStage('Tender')
    setSubStage('Offers & Bids')
    logCase({
      title: 'Opened Offers & Bids',
      detail: `${detail.bids.length} offer${detail.bids.length === 1 ? '' : 's'} waiting for review.`,
      status: 'info',
    })
  }

  return (
    <div className={cn('dd-page', isV2 && 'dd-page--v2', isCase && 'dd-page--v3')}>
      <header className={cn('dd-top', isV2 && 'dd-top--v2', isCase && 'dd-top--v3')}>
        <div className="dd-top__row">
          <button type="button" className="dd-back" onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </button>

          {isV2 ? (
            <div className="dd-v2id">
              <strong>{load.id}</strong>
              <ModeBadge mode={load.mode} />
              <span className="dd-v2id__cust">{load.customer}</span>
              <span className="dd-v2id__stage">
                {stage} · {subStage}
              </span>
            </div>
          ) : (
            <div className="dd-top__ids">
            <div className="dd-top__group">
              <span className="dd-top__label">Probill</span>
              <strong>{load.id}</strong>
              <ModeBadge mode={load.mode} />
            </div>
            <div className="dd-top__divider" />
            <div className="dd-top__group">
              <span className="dd-top__label">Order</span>
              <strong className="is-link">{detail.orderNumber}</strong>
            </div>
            <div className="dd-top__divider" />
            <div className="dd-top__group">
              <span className="dd-top__po">
                # PO {detail.poNumber}
                <span className="dd-po-status">{detail.poStatus}</span>
              </span>
              <strong>{load.customer}</strong>
            </div>
            </div>
          )}

          <div className="dd-top__right">
            <ViewSwitch view={view} onView={setDetailView} />
            {isV2 && (
              <button
                type="button"
                className={cn('dd-v2facts', factsOpen && 'is-open')}
                onClick={() => setFactsOpen((v) => !v)}
                aria-expanded={factsOpen}
              >
                <Info size={13} />
                Facts
                <ChevronDown size={12} />
              </button>
            )}
            {/* case views keep Auto on the work bar; only Views 1/2 need it up here */}
            {!isCase && autoMode && (
              <button
                type="button"
                className="dd-auto-btn"
                onClick={() => {
                  setAutoAsk(false)
                  setAutoOpen(true)
                }}
              >
                <Zap size={14} />
                {AUTO_MODE_LABEL[autoMode]}
                {autoMode === 'sourcing' && autoMissing > 0 && (
                  <i className="dd-auto-btn__badge">{autoMissing}</i>
                )}
              </button>
            )}
            <button type="button" className="dd-icon-btn dd-icon-btn--light" aria-label="Refresh">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </header>

      {(!isV2 || factsOpen) && (
      <div className={cn('dd-meta', isV2 && 'dd-meta--v2')}>
        <div className="dd-meta__item">
          <span>Trailer</span>
          <strong>{load.equipment}</strong>
        </div>
        <div className="dd-meta__item">
          <span>Billing</span>
          <strong>
            <span
              className={cn(
                'dd-billing',
                detail.billing === 'PENDING' && 'dd-billing--pending',
                detail.billing === 'READY' && 'dd-billing--ready',
                detail.billing === 'INVOICED' && 'dd-billing--invoiced'
              )}
            >
              {detail.billing === 'PENDING' ? 'Pending' : detail.billing}
            </span>
          </strong>
        </div>
        <div className="dd-meta__item">
          <span>Currency</span>
          <strong className="dd-currency">
            <span className="dd-flag" aria-hidden>
              {detail.currency === 'CAD' ? '🇨🇦' : '🇺🇸'}
            </span>
            {detail.currency}
          </strong>
        </div>
        <div className="dd-meta__item">
          <span>Execution</span>
          <strong>{detail.execution}</strong>
        </div>
        <div className="dd-meta__item">
          <span>Properties</span>
          <strong>{detail.properties}</strong>
        </div>
        <div className="dd-meta__item">
          <span>PO CAT</span>
          <strong>{detail.poCategory}</strong>
        </div>
        <div className="dd-meta__item">
          <span>Order CAT</span>
          <strong>{detail.orderCategory}</strong>
        </div>
        <div className="dd-meta__item">
          <span>Type</span>
          <strong>{detail.type}</strong>
        </div>
        <div className="dd-meta__item">
          <span>Sales rep</span>
          <strong>{detail.salesRep}</strong>
        </div>
        <div className="dd-meta__item">
          <span>CSR</span>
          <strong>{detail.csr}</strong>
        </div>
        <div className="dd-meta__item">
          <span>Account mgr</span>
          <strong>{detail.accountManager}</strong>
        </div>
        <div className="dd-meta__item">
          <span>Division</span>
          <strong title={detail.division}>{detail.division}</strong>
        </div>
        <div className="dd-meta__item dd-meta__item--tags">
          <span>Tags</span>
          <strong>
            <TagPopover tags={tags} onChange={setTags} />
          </strong>
        </div>
        <div className="dd-meta__item dd-meta__item--edit">
          <button type="button" className="dd-icon-btn" aria-label="Edit load details">
            <Pencil size={14} />
          </button>
        </div>
      </div>
      )}

      {isV2 && (
        <LaneBar
          detail={detail}
          routeOpen={routeOpen}
          onExpand={() => setRouteOpen((v) => !v)}
        />
      )}

      {(!isV2 || routeOpen) && (
      <div className="dd-route dd-route--ov">
        {detail.stops.map((stop, i) => {
          const isLastStop = i === detail.stops.length - 1
          /* first stop reads as Pickup, final as Delivery, mid-stops keep their hook/drop role */
          const role =
            i === 0 ? 'Pickup' : isLastStop ? 'Delivery' : (stop.role ?? stop.kind)
          const crossBorder =
            /mexico|nuevo|monterrey|guadalajara|mx\b/i.test(`${stop.city} ${stop.address}`) ||
            /mexico|nuevo|monterrey|guadalajara|mx\b/i.test(
              `${detail.stops[i + 1]?.city ?? ''} ${detail.stops[i + 1]?.address ?? ''}`
            )
          const showStatusAlert = stop.statusTone === 'pending'
          return (
            <div key={`${stop.facility}-${i}`} className="dd-route__pair">
              <article
                className={cn(
                  'dd-stop-card',
                  i === 0 ? 'is-pickup' : isLastStop ? 'is-drop' : 'is-hook',
                  (stop.appointmentRequired || showStatusAlert) && 'has-alert'
                )}
              >
                <div className="dd-stop-card__head">
                  <span className="dd-stop-card__num">{stop.index ?? i + 1}</span>
                  <span className="dd-stop-card__role">{role}</span>
                  <em className="dd-stop-card__when">{stop.when}</em>
                </div>

                <strong className="dd-stop-card__name" title={stop.facility}>
                  {stop.facility}
                </strong>

                <div className="dd-stop-card__foot">
                  <span className="dd-stop-card__addr" title={stop.address}>
                    {stop.address}
                  </span>
                  <span className={cn('dd-stop-card__status', `is-${stop.statusTone}`)}>
                    {stop.status}
                  </span>
                  {stop.appointmentRequired && (
                    <button type="button" className="dd-stop-card__add">
                      <Plus size={11} />
                      Appointment
                    </button>
                  )}
                </div>
              </article>
              {i < detail.stops.length - 1 && (
                <div className="dd-route__bridge" aria-hidden>
                  {crossBorder && <span className="dd-route__note">Cross-border · pedimento</span>}
                  <span className="dd-route__miles">
                    {(stop.legMiles ?? load.miles).toLocaleString()} mi
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
      )}

      {!isCase && (
      <div
        className={cn(
          'dd-body',
          lifeCollapsed && 'is-life-collapsed',
          railCollapsed && 'is-rail-collapsed'
        )}
      >
        <DetailLifecycle
          detail={lifeDetail}
          stage={stage}
          subStage={subStage}
          collapsed={lifeCollapsed}
          onToggle={() => setLifeCollapsed((v) => !v)}
          onSelect={(s, sub) => {
            setStage(s)
            setSubStage(sub)
            setTab('summary')
          }}
        />

        <div className="dd-main">
          {!stageWorkspace && (
            <div className="dd-tabs">
              {(
                [
                  ['summary', 'Summary'],
                  ['instructions', 'Instructions'],
                  ['documents', `Documents ${detail.documents.length}`],
                  ['activity', 'Activity'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={cn(tab === id && 'is-active')}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="dd-main__content">
            {stageWorkspace ? (
              <>
                {isFindPost(subStage) && (
                  <FindPostView
                    detail={detail}
                    onPostLoad={() => setPostOpen(true)}
                    onAdvanceToOffers={() => {
                      setStage('Tender')
                      setSubStage('Offers & Bids')
                    }}
                  />
                )}
                {subStage === 'Offers & Bids' && (
                  <OffersBidsView detail={detail} onAddOffer={() => setOfferOpen(true)} />
                )}
                {subStage === 'Finalize Tender' && <FinalizeTenderView detail={detail} />}
                {subStage === 'CMT' && <CmtValidateView detail={detail} />}
                {subStage === 'Finalize Carrier Award' && <FinalizeAwardView detail={detail} />}
                {subStage === 'Create Contract' && <CreateContractView detail={detail} />}
                {(subStage === 'Send Confirmation' ||
                  subStage === 'Signed Confirmation' ||
                  subStage === 'Resources') && (
                  <BookingStageView
                    detail={detail}
                    kind={subStage as 'Send Confirmation' | 'Signed Confirmation' | 'Resources'}
                  />
                )}
              </>
            ) : (
              <>
                {tab === 'summary' && (
                  <SummaryTab
                    detail={detail}
                    tags={tags}
                    onTags={setTags}
                    onPatchDetail={(patch) => setDetail((d) => ({ ...d, ...patch }))}
                    onPostToSourcing={() => {
                      setStage('Sourcing')
                      setSubStage('Find & Post')
                    }}
                  />
                )}
                {tab === 'instructions' && (
                  <InstructionsTab
                    detail={detail}
                    onCarrier={(v) => setDetail((d) => ({ ...d, carrierInstructions: v }))}
                    onInternal={(v) => setDetail((d) => ({ ...d, internalInstructions: v }))}
                  />
                )}
                {tab === 'documents' && <DocumentsTab detail={detail} />}
                {tab === 'activity' && <ActivityTab detail={detail} />}
              </>
            )}
          </div>
        </div>

        {isV2 ? (
          <ContextRail
            detail={detail}
            stage={stage}
            subStage={subStage}
            collapsed={railCollapsed}
            onToggle={() => setRailCollapsed((v) => !v)}
            onAssignBroker={() =>
              setDetail((d) => ({
                ...d,
                load: { ...d.load, broker: d.load.broker || d.salesRep },
              }))
            }
            onGoto={(s, sub) => {
              setStage(s)
              setSubStage(sub)
              setTab('summary')
            }}
            onAuto={() => {
              setAutoAsk(false)
              setAutoOpen(true)
            }}
            autoLabel={autoMode ? AUTO_MODE_LABEL[autoMode] : null}
          />
        ) : (
        <DetailRail
          detail={{
            ...detail,
            action:
              subStage === 'Find & Post'
                ? 'Find & post'
                : subStage === 'Offers & Bids'
                  ? 'Negotiate offers'
                  : subStage === 'Finalize Tender'
                    ? 'Confirm carrier'
                    : detail.action,
          }}
          collapsed={railCollapsed}
          onToggle={() => setRailCollapsed((v) => !v)}
          onAssignBroker={() =>
            setDetail((d) => ({
              ...d,
              load: { ...d.load, broker: d.load.broker || d.salesRep },
            }))
          }
          aiLog={aiLog}
        />
        )}
      </div>
      )}

      {isV3 && (
        <div className={cn('v3-body', actCollapsed && 'is-act-closed')}>
          <LoadStructureTree
            detail={lifeDetail}
            stage={stage}
            subStage={subStage}
            onSelect={(s, sub) => {
              setStage(s)
              setSubStage(sub)
              setV3Tab('overview')
            }}
          />

          <StageActionSlotProvider value={actionSlot}>
          <div className="v3-main">
            <CaseWorkBar
              tab={v3Tab}
              onTab={setV3Tab}
              docCount={detail.documents.length}
              stage={stage}
              subStage={subStage}
              status={load.status}
              showTabs={!stageWorkspace}
              slotRef={setActionSlot}
              autoLabel={autoMode ? AUTO_MODE_LABEL[autoMode] : null}
              onAuto={() => {
                setAutoAsk(false)
                setAutoOpen(true)
              }}
            />
            {!stageWorkspace && (
              <>
                <div className="v3-main__content">
                  {v3Tab === 'overview' && (
                    <div className="v3-steps">
                      <CaseStep
                        n={1}
                        title="Load setup"
                        hint="Appointments, equipment and bidding thresholds"
                        badge={
                          setupReady
                            ? 'Ready'
                            : `${caseBlockers} blocking item${caseBlockers === 1 ? '' : 's'}`
                        }
                        badgeTone={setupReady ? 'ok' : 'blocker'}
                        open={setupOpen}
                        onToggle={() => setSetupOpen((v) => !v)}
                        summary={
                          <>
                            <span>
                              Max buy <b>{detail.maxBuy}</b>
                            </span>
                            <span>
                              Book now <b>{detail.bookNowRate}</b>
                            </span>
                            <span>
                              Reject above <b>{detail.rejectAbove}</b>
                            </span>
                            <span>
                              Equipment <b>{detail.load.equipment}</b>
                            </span>
                          </>
                        }
                      >
                        <CaseCenterHeader
                          detail={detail}
                          onAction={runCaseAction}
                          onResolve={resolveCaseAlert}
                        />
                        <SummaryTab
                          detail={detail}
                          tags={tags}
                          onTags={setTags}
                          hideReadiness
                          onPatchDetail={(patch) => {
                            setDetail((d) => ({ ...d, ...patch }))
                            if (patch.maxBuy && patch.maxBuy !== detail.maxBuy) {
                              const cleared = patch.maxBuy === '$0.00'
                              logCase({
                                key: 'rates',
                                title: cleared ? 'Max buy cleared' : 'Max buy set',
                                detail: cleared
                                  ? 'No hard limit on this load right now.'
                                  : `${patch.maxBuy} hard limit · book now ${patch.bookNowRate}`,
                                status: cleared ? 'warn' : 'ok',
                              })
                            }
                          }}
                          onPostToSourcing={() => {
                            setStage('Sourcing')
                            setSubStage('Find & Post')
                          }}
                        />
                      </CaseStep>

                      <CaseStep
                        n={2}
                        title="Find & Post"
                        hint="Shortlist carriers, blast them, post to the boards"
                        badge={`${detail.carriers.length} carriers`}
                        open={findOpen}
                        onToggle={() => setFindOpen((v) => !v)}
                        locked={
                          setupReady
                            ? undefined
                            : `Clear ${caseBlockers} blocking item${caseBlockers === 1 ? '' : 's'} in step 1 to post`
                        }
                        bodyRef={(el) => {
                          findStepRef.current = el
                        }}
                      >
                        <FindPostView
                          detail={detail}
                          variant="cards"
                          onPostLoad={() => setPostOpen(true)}
                          onAdvanceToOffers={() => {
                            setStage('Tender')
                            setSubStage('Offers & Bids')
                          }}
                        />
                      </CaseStep>
                    </div>
                  )}
                  {v3Tab === 'instructions' && (
                    <InstructionsTab
                      detail={detail}
                      onCarrier={(v) => setDetail((d) => ({ ...d, carrierInstructions: v }))}
                      onInternal={(v) => setDetail((d) => ({ ...d, internalInstructions: v }))}
                    />
                  )}
                  {v3Tab === 'documents' && <DocumentsTab detail={detail} />}
                </div>
              </>
            )}

            {stageWorkspace && (
              <div className="v3-main__workspace">
                {subStage === 'Offers & Bids' && (
                  <OffersBidsView detail={detail} onAddOffer={() => setOfferOpen(true)} />
                )}
                {subStage === 'Finalize Tender' && <FinalizeTenderView detail={detail} />}
                {subStage === 'CMT' && <CmtValidateView detail={detail} />}
                {subStage === 'Finalize Carrier Award' && <FinalizeAwardView detail={detail} />}
                {subStage === 'Create Contract' && <CreateContractView detail={detail} />}
                {(subStage === 'Send Confirmation' ||
                  subStage === 'Signed Confirmation' ||
                  subStage === 'Resources') && (
                  <BookingStageView
                    detail={detail}
                    kind={subStage as 'Send Confirmation' | 'Signed Confirmation' | 'Resources'}
                  />
                )}
              </div>
            )}
          </div>
          </StageActionSlotProvider>

          <CaseActivityRail
            events={caseEvents}
            collapsed={actCollapsed}
            onToggle={() => setActCollapsed((v) => !v)}
          />
        </div>
      )}

      {isV4 && (
        <div className={cn('v3-body v4-body', actCollapsed && 'is-act-closed')}>
          <LoadStructureTree
            detail={lifeDetail}
            stage={stage}
            subStage={subStage}
            onSelect={(s, sub) => {
              setStage(s)
              setSubStage(sub)
              setV3Tab('overview')
            }}
          />

          <StageActionSlotProvider value={actionSlot}>
          <div className="v3-main">
            <CaseWorkBar
              tab={v3Tab}
              onTab={setV3Tab}
              docCount={detail.documents.length}
              stage={stage}
              subStage={subStage}
              status={load.status}
              showTabs={!stageWorkspace}
              slotRef={setActionSlot}
              autoLabel={autoMode ? AUTO_MODE_LABEL[autoMode] : null}
              onAuto={() => {
                setAutoAsk(false)
                setAutoOpen(true)
              }}
            />
            {!stageWorkspace && (
              <>
                <div className="v3-main__content v4-desk">
                  {v3Tab === 'overview' && (
                    <>
                      <V4Thresholds
                        detail={detail}
                        posted={isFindPost(subStage) || stage !== 'Sourcing'}
                        onPostSourcing={() => {
                          setStage('Sourcing')
                          setSubStage('Find & Post')
                          logCase({
                            title: 'Posted to Sourcing',
                            detail: 'Load is live for the carrier desk.',
                          })
                        }}
                        onResolve={resolveCaseAlert}
                      />
                      <V4CarrierBoard
                        detail={detail}
                        onPostBoard={() => setPostOpen(true)}
                        onOpenCarrierPrefs={onOpenCarrierPrefs}
                        onBlast={(channel, count) => {
                          logCase({
                            title: `${channel} blast sent`,
                            detail: `${count} carrier${count === 1 ? '' : 's'} contacted from the board.`,
                          })
                          setStage('Tender')
                          setSubStage('Offers & Bids')
                        }}
                      />
                    </>
                  )}
                  {v3Tab === 'instructions' && (
                    <InstructionsTab
                      detail={detail}
                      onCarrier={(v) => setDetail((d) => ({ ...d, carrierInstructions: v }))}
                      onInternal={(v) => setDetail((d) => ({ ...d, internalInstructions: v }))}
                    />
                  )}
                  {v3Tab === 'documents' && <DocumentsTab detail={detail} />}
                </div>
              </>
            )}

            {stageWorkspace && (
              <div className="v3-main__workspace">
                {subStage === 'Offers & Bids' && (
                  <OffersBidsView detail={detail} onAddOffer={() => setOfferOpen(true)} />
                )}
                {subStage === 'Finalize Tender' && <FinalizeTenderView detail={detail} />}
                {subStage === 'CMT' && <CmtValidateView detail={detail} />}
                {subStage === 'Finalize Carrier Award' && <FinalizeAwardView detail={detail} />}
                {subStage === 'Create Contract' && <CreateContractView detail={detail} />}
                {(subStage === 'Send Confirmation' ||
                  subStage === 'Signed Confirmation' ||
                  subStage === 'Resources') && (
                  <BookingStageView
                    detail={detail}
                    kind={subStage as 'Send Confirmation' | 'Signed Confirmation' | 'Resources'}
                  />
                )}
              </div>
            )}
          </div>
          </StageActionSlotProvider>

          <aside className={cn('v4-side', actCollapsed && 'is-closed')}>
            {!actCollapsed && (
              <section className="v4-next">
                <CaseNextActions
                  detail={detail}
                  onAction={runCaseAction}
                  onResolve={resolveCaseAlert}
                  expanded
                />
              </section>
            )}
            <CaseActivityRail
              events={caseEvents}
              collapsed={actCollapsed}
              onToggle={() => setActCollapsed((v) => !v)}
            />
          </aside>
        </div>
      )}

      {postOpen && (
        <PostMarketplaceModal detail={detail} onClose={() => setPostOpen(false)} />
      )}
      {offerOpen && <ManualOfferModal onClose={() => setOfferOpen(false)} />}

      {autoAsk && autoMode && (
        <AutoSourcingConfirm
          mode={autoMode}
          probill={load.id}
          missingCount={autoMissing}
          offerCount={detail.bids.length}
          onYes={() => {
            setAutoAsk(false)
            setAutoOpen(true)
          }}
          onNo={() => setAutoAsk(false)}
        />
      )}
      {autoOpen && autoMode && (
        <AutoSourcingPanel
          detail={detail}
          mode={autoMode}
          onClose={() => setAutoOpen(false)}
          onApplyRates={(patch) => {
            setDetail((d) => ({ ...d, ...patch }))
            logCase({
              title: 'Rates confirmed in the run',
              detail: `Max buy ${patch.maxBuy} hard limit · book now ${patch.bookNowRate}`,
              who: AUTO_MODE_LABEL[autoMode],
            })
          }}
          onGoFindPost={() => {
            setAutoOpen(false)
            setStage('Sourcing')
            setSubStage('Find & Post')
          }}
          onSourcingComplete={completeSourcingAndAskTender}
        />
      )}
    </div>
  )
}
