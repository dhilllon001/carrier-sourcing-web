import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Info,
  Layers,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  PanelRightClose,
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
import { cn } from '@/lib/cn'
import {
  buildLoadDetail,
  isFindPost,
  type CommodityLine,
  type DetailStage,
  type LoadDetail,
} from '@/data/loadDetail'
import type { ReportLoad } from '@/data/report'

type TabId = 'summary' | 'instructions' | 'documents' | 'activity'

type LoadDetailsPageProps = {
  load: ReportLoad
  onBack: () => void
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
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(detail.stages.map((s) => [s.stage, s.stage === stage]))
  )
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

      <div className="dd-life__progress">
        <div className="dd-life__progress-meta">
          <span>
            {detail.completedSubs}/{detail.totalSubs} sub-stages
          </span>
          <span>{pct}%</span>
        </div>
        <div className="dd-life__bar">
          <div style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="dd-life__list">
        {detail.stages.map((block) => {
          const isOpen = open[block.stage] !== false
          const doneCount = block.items.filter((i) => i.done).length
          const active = block.stage === stage
          return (
            <section key={block.stage} className={cn('dd-life-stage', active && 'is-active')}>
              <div className="dd-life-stage__head">
                <button
                  type="button"
                  className="dd-life-stage__main"
                  onClick={() => {
                    onSelect(block.stage, block.items[0]?.label ?? 'ALL')
                    setOpen((p) => ({ ...p, [block.stage]: true }))
                  }}
                >
                  <span className="dd-life-stage__num">{block.number}</span>
                  <span className="dd-life-stage__name">{block.stage}</span>
                  <span className="dd-life-stage__count">
                    {doneCount}/{block.items.length}
                  </span>
                  {active && <span className="dd-life-stage__dot" aria-hidden />}
                </button>
                <button
                  type="button"
                  className="dd-life-stage__chev"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpen((p) => ({ ...p, [block.stage]: !isOpen }))
                  }
                >
                  <ChevronDown size={14} className={cn(!isOpen && 'is-rot')} />
                </button>
              </div>
              {isOpen && (
                <div className="dd-life-stage__body">
                  {block.items.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className={cn(
                        'dd-life-sub',
                        subStage === item.label && 'is-active'
                      )}
                      onClick={() => onSelect(block.stage, item.label)}
                    >
                      <span
                        className={cn(
                          'dd-life-check',
                          item.done && 'is-done',
                          subStage === item.label && !item.done && 'is-current'
                        )}
                      >
                        {item.done ? <Check size={10} strokeWidth={3} /> : null}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </aside>
  )
}

function SummaryTab({
  detail,
  tags,
  onTags,
  onPostToSourcing,
  onPatchDetail,
}: {
  detail: LoadDetail
  tags: string[]
  onTags: (t: string[]) => void
  onPostToSourcing: () => void
  onPatchDetail: (patch: Partial<LoadDetail>) => void
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


function DetailRail({
  detail,
  collapsed,
  onToggle,
  onAssignBroker,
}: {
  detail: LoadDetail
  collapsed: boolean
  onToggle: () => void
  onAssignBroker: () => void
}) {
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
        <button type="button" className="dd-rail__title-btn" onClick={onToggle}>
          <span className="dd-rail__title">Rate & coverage</span>
          <ChevronDown size={15} />
        </button>
        <button type="button" className="dd-icon-btn" aria-label="Collapse right rail" onClick={onToggle}>
          <PanelRightClose size={14} />
        </button>
      </div>

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
    </aside>
  )
}

function ActivityTab({ detail }: { detail: LoadDetail }) {
  const events = [
    { when: detail.startedAt, who: detail.csr, text: 'Opened Overview for load review' },
    { when: 'Just now', who: 'System', text: 'Readiness checklist evaluated against posting rules' },
    { when: 'Today', who: detail.salesRep, text: 'Customer rate confirmed on order' },
  ]
  return (
    <div className="dd-activity">
      {events.map((e) => (
        <article key={`${e.when}-${e.text}`} className="dd-activity__item">
          <div className="dd-activity__dot" />
          <div>
            <strong>{e.text}</strong>
            <span>
              {e.who} · {e.when}
            </span>
          </div>
        </article>
      ))}
    </div>
  )
}

export function LoadDetailsPage({ load, onBack }: LoadDetailsPageProps) {
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

  useEffect(() => {
    setDetail(base)
    setStage(load.stage as DetailStage)
    setSubStage(load.subStage)
    setTags(base.tags)
  }, [base, load])

  const stageWorkspace =
    isFindPost(subStage) ||
    subStage === 'Offers & Bids' ||
    subStage === 'Finalize Tender' ||
    subStage === 'CMT' ||
    subStage === 'Finalize Carrier Award' ||
    subStage === 'Create Contract' ||
    subStage === 'Send Confirmation' ||
    subStage === 'Signed Confirmation' ||
    subStage === 'Resources'

  return (
    <div className="dd-page">
      <header className="dd-top">
        <div className="dd-top__row">
          <button type="button" className="dd-back" onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </button>

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

          <div className="dd-top__right">
            <button type="button" className="dd-icon-btn dd-icon-btn--light" aria-label="Refresh">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="dd-meta">
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

      <div className="dd-route dd-route--ov">
        {detail.stops.map((stop, i) => {
          const role = stop.role ?? (stop.kind === 'Delivery' ? 'Drop' : 'Hook')
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
                  stop.kind === 'Delivery' ? 'is-drop' : 'is-hook',
                  (stop.appointmentRequired || showStatusAlert) && 'has-alert'
                )}
              >
                <div className="dd-stop-card__top">
                  <span className="dd-stop-card__num">{stop.index ?? i + 1}</span>
                  <div className="dd-stop-card__main">
                    <div className="dd-stop-card__role">{role}</div>
                    <strong>{stop.facility}</strong>
                    <span>{stop.address}</span>
                  </div>
                  <div className="dd-stop-card__when">
                    <em>{stop.when}</em>
                    {showStatusAlert && (
                      <span className="dd-stop-card__status is-pending">{stop.status}</span>
                    )}
                  </div>
                </div>
                {stop.appointmentRequired && (
                  <div className="dd-stop-card__appt">
                    <span>Appointment required</span>
                    <button type="button" className="dd-stop-card__add">
                      Add
                    </button>
                  </div>
                )}
              </article>
              {i < detail.stops.length - 1 && (
                <div className="dd-route__bridge" aria-hidden>
                  {crossBorder && <span className="dd-route__note">Cross-border · pedimento</span>}
                  <span className="dd-route__miles">{load.miles.toLocaleString()} mi</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div
        className={cn(
          'dd-body',
          lifeCollapsed && 'is-life-collapsed',
          railCollapsed && 'is-rail-collapsed'
        )}
      >
        <DetailLifecycle
          detail={detail}
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
        />
      </div>

      {postOpen && (
        <PostMarketplaceModal detail={detail} onClose={() => setPostOpen(false)} />
      )}
      {offerOpen && <ManualOfferModal onClose={() => setOfferOpen(false)} />}
    </div>
  )
}
