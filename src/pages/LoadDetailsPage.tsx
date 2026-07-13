import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Layers,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  PanelRightClose,
} from 'lucide-react'
import { TagPopover } from '@/components/report/TagPopover'
import {
  FindPostView,
  FinalizeTenderView,
  ManualOfferModal,
  OffersBidsView,
  PostMarketplaceModal,
} from '@/components/details/StageViews'
import { cn } from '@/lib/cn'
import {
  buildLoadDetail,
  isFindPost,
  type CommodityLine,
  type DetailStage,
  type LoadDetail,
} from '@/data/loadDetail'
import type { ReportLoad } from '@/data/report'

type TabId = 'summary' | 'instructions' | 'documents'

type LoadDetailsPageProps = {
  load: ReportLoad
  onBack: () => void
}

function Field({
  label,
  value,
  link,
  empty,
  mono,
}: {
  label: string
  value?: string
  link?: boolean
  empty?: boolean
  mono?: boolean
}) {
  const blank = empty || value == null || value === ''
  return (
    <div className="dd-field">
      <div className="dd-field__label">{label}</div>
      <div
        className={cn(
          'dd-field__value',
          link && !blank && 'is-link',
          blank && 'is-empty',
          mono && 'mono'
        )}
      >
        {blank ? '—' : value}
      </div>
    </div>
  )
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
}: {
  detail: LoadDetail
  tags: string[]
  onTags: (t: string[]) => void
}) {
  const [activeProbill, setActiveProbill] = useState(detail.commodities[0]?.probill)
  const [commodities, setCommodities] = useState<CommodityLine[]>(detail.commodities)

  useEffect(() => {
    setCommodities(detail.commodities)
    setActiveProbill(detail.commodities[0]?.probill)
  }, [detail.commodities])

  const activeLines = commodities.filter((c) => c.probill === activeProbill)
  const pickup = detail.stops.find((s) => s.kind === 'Pickup') ?? detail.stops[0]
  const delivery =
    [...detail.stops].reverse().find((s) => s.kind === 'Delivery') ??
    detail.stops[detail.stops.length - 1]

  const addCommodity = () => {
    const n = commodities.length + 1
    const line: CommodityLine = {
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
    }
    setCommodities((prev) => [...prev, line])
  }

  const addProbill = () => {
    const next = `P${Number(detail.load.id) + commodities.length + 1}`
    const line: CommodityLine = {
      probill: next,
      bol: `${detail.poNumber}-NEW`,
      qty: '1 SKID',
      weight: '500 LBS',
      description: 'Added commodity · awaiting confirmation',
      pieces: '1',
      classCode: '70',
      hazmat: false,
      dims: '48×40×40 in',
      stackable: true,
    }
    setCommodities((prev) => [...prev, line])
    setActiveProbill(next)
  }

  const probills = [...new Set(commodities.map((c) => c.probill))]

  return (
    <div className="dd-summary">
      <section className="dd-card dd-thresh">
        <div className="dd-thresh__head">
          <div>
            <div className="dd-card__title">Bidding thresholds</div>
            <p className="dd-card__hint">
              Guide offers against book-now, max buy, and reject rules · {detail.currency}
            </p>
          </div>
          <div className="dd-thresh__actions">
            <button type="button" className="dd-icon-btn" aria-label="Edit thresholds">
              <Pencil size={14} />
            </button>
            <button type="button" className="dd-btn dd-btn--primary">
              <Check size={14} />
              Post to Sourcing
            </button>
          </div>
        </div>

        <div className="dd-thresh__grid">
          <article className="dd-thresh-tile dd-thresh-tile--book">
            <span className="dd-thresh-tile__label">Book now</span>
            <strong>{detail.bookNowRate}</strong>
            <em>Target acceptance rate</em>
          </article>
          <article className="dd-thresh-tile dd-thresh-tile--max">
            <span className="dd-thresh-tile__label">Max buy</span>
            <strong>{detail.maxBuy}</strong>
            <em>Ceiling before escalation</em>
          </article>
          <article className="dd-thresh-tile dd-thresh-tile--reject">
            <span className="dd-thresh-tile__label">Reject above</span>
            <strong>{detail.rejectAbove}</strong>
            <em>Auto-reject threshold</em>
          </article>
          <article className="dd-thresh-tile">
            <span className="dd-thresh-tile__label">Market</span>
            <strong>{detail.market === '—' ? detail.bookNowRate : detail.market}</strong>
            <em>Lane indication · {detail.load.miles.toLocaleString()} mi</em>
          </article>
        </div>

        <div className="dd-thresh__bar" aria-hidden>
          <div className="dd-thresh__fill" />
          <span className="dd-thresh__tick is-book" title="Book now" />
          <span className="dd-thresh__tick is-max" title="Max buy" />
          <span className="dd-thresh__tick is-reject" title="Reject above" />
        </div>
        <div className="dd-thresh__legend">
          <span>
            <i className="is-book" /> Book now {detail.bookNowRate}
          </span>
          <span>
            <i className="is-max" /> Max buy {detail.maxBuy}
          </span>
          <span>
            <i className="is-reject" /> Reject above {detail.rejectAbove}
          </span>
        </div>
      </section>

      <div className="dd-summary__grid">
        <section className="dd-card dd-apple-group">
          <div className="dd-card__head">
            <div className="dd-card__title">Order information</div>
            <button type="button" className="dd-icon-btn" aria-label="Edit order">
              <Pencil size={14} />
            </button>
          </div>
          <div className="dd-list">
            <div className="dd-list__row">
              <span>Order #</span>
              <strong className="is-link">{detail.orderNumber}</strong>
            </div>
            <div className="dd-list__row">
              <span>PO #</span>
              <strong>{detail.poNumber}</strong>
            </div>
            <div className="dd-list__row">
              <span>Division</span>
              <strong>{detail.division}</strong>
            </div>
            <div className="dd-list__row">
              <span>Order category</span>
              <strong>{detail.orderCategory}</strong>
            </div>
            <div className="dd-list__row">
              <span>Properties</span>
              <strong>{detail.properties}</strong>
            </div>
            <div className="dd-list__row">
              <span>Execution</span>
              <strong className="is-link">{detail.execution}</strong>
            </div>
            <div className="dd-list__row">
              <span>Cargo value</span>
              <strong>{detail.cargoValue || '—'}</strong>
            </div>
          </div>
        </section>

        <section className="dd-card dd-apple-group">
          <div className="dd-card__head">
            <div className="dd-card__title">Customer & service</div>
          </div>
          <div className="dd-list">
            <div className="dd-list__row">
              <span>Customer</span>
              <strong className="is-link">{detail.load.customer}</strong>
            </div>
            <div className="dd-list__row">
              <span>Sales rep</span>
              <strong>{detail.salesRep}</strong>
            </div>
            <div className="dd-list__row">
              <span>CSR</span>
              <strong>{detail.csr}</strong>
            </div>
            <div className="dd-list__row">
              <span>Account manager</span>
              <strong>{detail.accountManager}</strong>
            </div>
            <div className="dd-list__row">
              <span>Mode</span>
              <strong>
                <ModeBadge mode={detail.load.mode} />
              </strong>
            </div>
            <div className="dd-list__row">
              <span>Type</span>
              <strong>{detail.type}</strong>
            </div>
            <div className="dd-list__row dd-list__row--tags">
              <span>Tags</span>
              <strong>
                <TagPopover tags={tags} onChange={onTags} />
              </strong>
            </div>
          </div>
        </section>

        <section className="dd-card dd-apple-group dd-commodity">
          <div className="dd-card__head">
            <div>
              <div className="dd-card__title">Commodity & routing</div>
              <p className="dd-card__hint">Stops workflow and freight lines on this load</p>
            </div>
            <div className="dd-commodity__actions">
              <button type="button" className="dd-pill-btn" onClick={addCommodity}>
                <Plus size={14} />
                Line
              </button>
              <button type="button" className="dd-pill-btn" onClick={addProbill}>
                <Plus size={14} />
                Probill
              </button>
            </div>
          </div>

          <div className="dd-route-flow">
            <div className="dd-route-flow__step">
              <span className="dd-route-flow__dot is-pu" />
              <div>
                <span>Pickup</span>
                <strong>{pickup?.facility ?? '—'}</strong>
                <em>
                  {pickup?.city} · {pickup?.when}
                </em>
              </div>
            </div>
            <div className="dd-route-flow__bridge">
              <MapPin size={12} />
              <span>{detail.load.miles.toLocaleString()} mi</span>
            </div>
            <div className="dd-route-flow__step">
              <span className="dd-route-flow__dot is-del" />
              <div>
                <span>Delivery</span>
                <strong>{delivery?.facility ?? '—'}</strong>
                <em>
                  {delivery?.city} · {delivery?.when}
                </em>
              </div>
            </div>
          </div>

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

          <div className="dd-commodity-lines">
            {activeLines.map((c) => (
              <article key={`${c.probill}-${c.bol}`} className="dd-commodity-line">
                <div className="dd-commodity-line__top">
                  <strong>{c.description ?? 'Commodity'}</strong>
                  <div className="dd-commodity-line__tags">
                    {c.hazmat && <span className="dd-tag-haz">Hazmat</span>}
                    {c.stackable && <span className="dd-tag-ok">Stackable</span>}
                    <span className="dd-tag-status">Class {c.classCode ?? '—'}</span>
                  </div>
                </div>
                <div className="dd-commodity-line__grid">
                  <span>
                    BOL <em className="mono">{c.bol}</em>
                  </span>
                  <span>
                    Qty <em>{c.qty}</em>
                  </span>
                  <span>
                    Weight <em>{c.weight}</em>
                  </span>
                  <span>
                    Pieces <em>{c.pieces ?? '—'}</em>
                  </span>
                  <span>
                    Dims <em>{c.dims ?? '—'}</em>
                  </span>
                  <span>
                    Equip <em>{detail.load.equipment}</em>
                  </span>
                </div>
              </article>
            ))}
            {activeLines.length === 0 && (
              <div className="dd-empty-state">No commodity lines on this probill</div>
            )}
          </div>
        </section>

        <section className="dd-card dd-apple-group dd-refs">
          <div className="dd-card__head">
            <div className="dd-card__title">References</div>
          </div>
          <div className="dd-list dd-list--2">
            <div className="dd-list__row">
              <span>PRO #</span>
              <strong className="mono">{detail.references.pro}</strong>
            </div>
            <div className="dd-list__row">
              <span>Shipper ref</span>
              <strong className="mono">{detail.references.shipper || '—'}</strong>
            </div>
            <div className="dd-list__row">
              <span>Consignee ref</span>
              <strong className="mono">{detail.references.consignee || '—'}</strong>
            </div>
            <div className="dd-list__row">
              <span>Customer ref</span>
              <strong className="mono">{detail.references.customer || '—'}</strong>
            </div>
            <div className="dd-list__row">
              <span>Tender ref</span>
              <strong className="mono">{detail.references.tender || '—'}</strong>
            </div>
            <div className="dd-list__row">
              <span>BOL ref</span>
              <strong className="mono">{detail.references.bol || '—'}</strong>
            </div>
            <div className="dd-list__row">
              <span>Appointment</span>
              <strong>{detail.references.appointment || '—'}</strong>
            </div>
            <div className="dd-list__row">
              <span>Trailer / equip</span>
              <strong>{detail.references.trailer || '—'}</strong>
            </div>
          </div>
        </section>
      </div>
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
}: {
  detail: LoadDetail
  collapsed: boolean
  onToggle: () => void
}) {
  if (collapsed) {
    return (
      <button type="button" className="dd-rail-bar" onClick={onToggle} aria-label="Expand rate coverage">
        <span>Rate — Coverage</span>
      </button>
    )
  }

  return (
    <aside className="dd-rail">
      <div className="dd-rail__head">
        <span className="dd-card__title">Rate · Coverage</span>
        <button type="button" className="dd-icon-btn" aria-label="Collapse right rail" onClick={onToggle}>
          <PanelRightClose size={14} />
        </button>
      </div>

      <section className="dd-card dd-rail-card">
        <div className="dd-card__title">Rate context</div>
        <div className="dd-fields">
          <Field label="Book now rate" value={detail.bookNowRate} mono />
          <Field label="Max buy" value={detail.maxBuy} mono />
          <Field label="Market" value={detail.market} empty={detail.market === '—'} />
        </div>
      </section>

      <section className="dd-card dd-rail-card">
        <div className="dd-card__title">Coverage & ownership</div>
        <div className="dd-fields">
          <Field label="Type" value={detail.type} />
          <Field label="Broker" value={detail.load.broker} empty={!detail.load.broker} />
          <Field label="Team" value={detail.load.team} />
          <Field label="Cargo value" value={detail.cargoValue} empty={!detail.cargoValue} />
        </div>
      </section>

      <section className="dd-card dd-rail-card">
        <div className="dd-card__title">Area coverage</div>
        <div className="dd-fields">
          <Field label="Origin" value={detail.load.origin} />
          <Field label="Destination" value={detail.load.destination} />
          <Field label="Miles" value={detail.load.miles.toLocaleString()} mono />
          <Field label="Equipment" value={detail.load.equipment} />
        </div>
      </section>

      <section className="dd-card dd-rail-card">
        <div className="dd-card__title">Sub-stage state</div>
        <div className="dd-fields">
          <Field label="Action" value={detail.action} />
          <Field label="Status" value={detail.subStatus} />
          <Field label="Started" value={detail.startedAt} />
        </div>
      </section>
    </aside>
  )
}

export function LoadDetailsPage({ load, onBack }: LoadDetailsPageProps) {
  const base = useMemo(() => buildLoadDetail(load), [load])
  const [detail, setDetail] = useState(base)
  const [tab, setTab] = useState<TabId>('summary')
  const [stage, setStage] = useState<DetailStage>(load.stage as DetailStage)
  const [subStage, setSubStage] = useState<string>(load.subStage)
  const [lifeCollapsed, setLifeCollapsed] = useState(false)
  const [railCollapsed, setRailCollapsed] = useState(true)
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
    subStage === 'Finalize Tender'

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
              {detail.billing}
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
          <span>Sales rep</span>
          <strong>{detail.salesRep}</strong>
        </div>
        <div className="dd-meta__item">
          <span>CSR</span>
          <strong>{detail.csr}</strong>
        </div>
        <div className="dd-meta__item">
          <span>Account manager</span>
          <strong>{detail.accountManager}</strong>
        </div>
        <div className="dd-meta__item">
          <span>Division</span>
          <strong>{detail.division}</strong>
        </div>
      </div>

      <div className="dd-route">
        {detail.stops.map((stop, i) => (
          <div key={`${stop.facility}-${i}`} className="dd-route__pair">
            <article
              className={cn(
                'dd-stop',
                stop.kind === 'Delivery' ? 'dd-stop--delivery' : 'dd-stop--pickup'
              )}
            >
              <div className="dd-stop__line1">
                <span className="dd-stop__kind">
                  {stop.kind}
                  {stop.index ? ` ${stop.index}` : ''}
                </span>
                <span className="dd-stop__when">{stop.when}</span>
                <span className={cn('dd-stop__status', `is-${stop.statusTone}`)}>
                  {stop.status}
                </span>
              </div>
              <div className="dd-stop__line2">
                <span className="dd-stop__facility">{stop.facility}</span>
                <span className="dd-stop__sep" aria-hidden>
                  ·
                </span>
                <span className="dd-stop__addr">{stop.address}</span>
              </div>
            </article>
            {i < detail.stops.length - 1 && (
              <div className="dd-route__bridge" aria-hidden>
                <span className="dd-route__miles">{load.miles.toLocaleString()} mi</span>
              </div>
            )}
          </div>
        ))}
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
                  ['documents', 'Documents'],
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
              </>
            ) : (
              <>
                {tab === 'summary' && (
                  <SummaryTab detail={detail} tags={tags} onTags={setTags} />
                )}
                {tab === 'instructions' && (
                  <InstructionsTab
                    detail={detail}
                    onCarrier={(v) => setDetail((d) => ({ ...d, carrierInstructions: v }))}
                    onInternal={(v) => setDetail((d) => ({ ...d, internalInstructions: v }))}
                  />
                )}
                {tab === 'documents' && <DocumentsTab detail={detail} />}
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
        />
      </div>

      {postOpen && (
        <PostMarketplaceModal detail={detail} onClose={() => setPostOpen(false)} />
      )}
      {offerOpen && <ManualOfferModal onClose={() => setOfferOpen(false)} />}
    </div>
  )
}
