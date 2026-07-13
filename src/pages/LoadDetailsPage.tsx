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
  Mail,
  MessageCircle,
  Pencil,
  RefreshCw,
  Search,
  Star,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'
import { TagPopover } from '@/components/report/TagPopover'
import { cn } from '@/lib/cn'
import {
  buildLoadDetail,
  isFindPost,
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
      <button type="button" className="dd-life-float" onClick={onToggle}>
        <Layers size={13} />
        <span className="dd-flap__text">Stages</span>
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

  return (
    <div className="dd-summary">
      <section className="dd-card dd-bid">
        <div className="dd-bid__top">
          <div>
            <div className="dd-card__title">
              Bidding thresholds <span className="dd-card__soft">{detail.currency}</span>
            </div>
            <div className="dd-bid__legend">
              <span>
                <i className="dd-bid__swatch dd-bid__swatch--max" /> Max buy
              </span>
              <span>
                <i className="dd-bid__swatch dd-bid__swatch--book" /> Book now
              </span>
              <span>
                <i className="dd-bid__swatch dd-bid__swatch--reject" /> Reject above
              </span>
            </div>
          </div>
          <div className="dd-bid__actions">
            <button type="button" className="dd-icon-btn" aria-label="Edit thresholds">
              <Pencil size={14} />
            </button>
            <button type="button" className="dd-btn dd-btn--primary">
              <Check size={14} />
              Post to Sourcing
            </button>
          </div>
        </div>
        <div className="dd-bid__scale" aria-hidden>
          <div className="dd-bid__track">
            <span className="dd-bid__mark dd-bid__mark--max" />
            <span className="dd-bid__mark dd-bid__mark--book" />
            <span className="dd-bid__mark dd-bid__mark--reject" />
          </div>
        </div>
      </section>

      <div className="dd-summary__grid">
        <section className="dd-card">
          <div className="dd-card__head">
            <div className="dd-card__title">Order information</div>
            <button type="button" className="dd-icon-btn" aria-label="Edit order">
              <Pencil size={14} />
            </button>
          </div>
          <div className="dd-fields">
            <Field label="Order #" value={detail.orderNumber} link />
            <Field label="PO #" value={detail.poNumber} />
            <Field label="Division" value={detail.division} />
            <Field label="Order category" value={detail.orderCategory} />
            <Field label="Properties" value={detail.properties} />
            <Field label="Execution type" value={detail.execution} link />
            <Field label="Cargo value" value={detail.cargoValue} empty={!detail.cargoValue} />
          </div>
        </section>

        <section className="dd-card">
          <div className="dd-card__head">
            <div className="dd-card__title">Customer & service</div>
          </div>
          <div className="dd-fields">
            <Field label="Customer" value={detail.load.customer} link />
            <Field label="Sales rep" value={detail.salesRep} />
            <Field label="CSR" value={detail.csr} />
            <Field label="Account manager" value={detail.accountManager} />
            <div className="dd-field">
              <div className="dd-field__label">Mode</div>
              <div className="dd-field__value">
                <ModeBadge mode={detail.load.mode} />
              </div>
            </div>
            <Field label="Type" value={detail.type} />
            <div className="dd-field">
              <div className="dd-field__label">Tags</div>
              <div className="dd-field__value">
                <TagPopover tags={tags} onChange={onTags} />
              </div>
            </div>
          </div>
        </section>

        <section className="dd-card dd-commodity">
          <div className="dd-card__head">
            <div className="dd-card__title">Commodity & routing</div>
          </div>
          {detail.commodities.length > 1 && (
            <div className="dd-probill-tabs">
              {detail.commodities.map((c) => (
                <button
                  key={c.probill}
                  type="button"
                  className={cn(activeProbill === c.probill && 'is-active')}
                  onClick={() => setActiveProbill(c.probill)}
                >
                  {c.probill}
                </button>
              ))}
            </div>
          )}
          <table className="dd-mini-table">
            <thead>
              <tr>
                <th>BOL #</th>
                <th>QTY</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {detail.commodities
                .filter((c) => c.probill === activeProbill)
                .map((c) => (
                  <tr key={c.bol}>
                    <td className="mono">{c.bol}</td>
                    <td>{c.qty}</td>
                    <td>{c.weight}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>

        <section className="dd-card dd-refs">
          <div className="dd-card__head">
            <div className="dd-card__title">References</div>
          </div>
          <div className="dd-fields dd-fields--wide">
            <Field label="PRO #" value={detail.references.pro} mono />
            <Field label="Shipper ref" value={detail.references.shipper} empty />
            <Field label="Consignee ref" value={detail.references.consignee} empty />
            <Field label="Customer ref" value={detail.references.customer} empty />
            <Field label="Tender ref" value={detail.references.tender} empty />
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

function FindPostTab({ detail }: { detail: LoadDetail }) {
  const [q, setQ] = useState('')
  const rows = detail.carriers.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      (c.mc ?? '').includes(q) ||
      (c.dot ?? '').toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="dd-find">
      <div className="dd-find__bar">
        <label className="dd-docs__search dd-find__search">
          <Search size={13} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search carrier, MC #, or contact…"
          />
        </label>
        <div className="dd-find__chips">
          <span>Mode: {detail.load.mode}</span>
          <span>Workflow: Simultaneous</span>
        </div>
        <div className="dd-find__actions">
          <button type="button" className="dd-btn">
            <Mail size={14} />
            Blast Email
          </button>
          <button type="button" className="dd-btn">
            <MessageCircle size={14} />
            Blast WhatsApp
          </button>
          <button type="button" className="dd-btn dd-btn--primary">
            Post to Load Board
          </button>
        </div>
      </div>

      <div className="dd-card dd-find__table-wrap">
        <table className="dd-carrier-table">
          <thead>
            <tr>
              <th>Carrier</th>
              <th>MC # / DOT #</th>
              <th>Source</th>
              <th>Last used</th>
              <th>DH-P</th>
              <th>DH-D</th>
              <th>Last rate</th>
              <th>Loads</th>
              <th>Legs</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="dd-carrier-name">
                    {c.favorite && <Star size={12} className="is-star" />}
                    <span>{c.name}</span>
                  </div>
                </td>
                <td className="mono">
                  {c.mc ? `MC: ${c.mc}` : c.dot ? `DOT: ${c.dot}` : '—'}
                </td>
                <td>
                  <span className={cn('dd-source', `dd-source--${c.source.toLowerCase()}`)}>
                    {c.source}
                  </span>
                </td>
                <td>
                  <div className="dd-last-used">
                    <span>{c.lastUsed}</span>
                    <span>{c.lastUsedRel}</span>
                  </div>
                </td>
                <td className="mono">{c.dhP}</td>
                <td className="mono">{c.dhD}</td>
                <td className="mono">{c.lastRate}</td>
                <td className="mono">{c.loads}</td>
                <td className="mono">{c.legs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      <button type="button" className="dd-rail-float" onClick={onToggle}>
        <span className="dd-flap__text">Rate · Coverage</span>
      </button>
    )
  }

  return (
    <aside className="dd-rail">
      <div className="dd-rail__head">
        <span className="dd-card__title">Context</span>
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
  const [railCollapsed, setRailCollapsed] = useState(false)
  const [tags, setTags] = useState<string[]>(base.tags)

  useEffect(() => {
    setDetail(base)
    setStage(load.stage as DetailStage)
    setSubStage(load.subStage)
    setTags(base.tags)
  }, [base, load])

  const showFindPost = isFindPost(subStage) && stage === 'Sourcing'

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
                'dd-pill',
                detail.billing === 'PENDING' && 'dd-pill--pending',
                detail.billing === 'READY' && 'dd-pill--ready',
                detail.billing === 'INVOICED' && 'dd-pill--invoiced'
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
                <span className="dd-stop__addr">{stop.address}</span>
              </div>
            </article>
            {i < detail.stops.length - 1 && (
              <div className="dd-route__bridge" aria-hidden>
                <span className="dd-route__miles">{load.miles.toLocaleString()} mi</span>
                <span className="dd-route__line" />
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
            if (isFindPost(sub)) setTab('summary')
          }}
        />

        <div className="dd-main">
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
            {railCollapsed && (
              <button
                type="button"
                className="dd-tabs__rail"
                onClick={() => setRailCollapsed(false)}
              >
                <PanelRightOpen size={14} />
                Context
              </button>
            )}
          </div>

          <div className="dd-main__content">
            {tab === 'summary' &&
              (showFindPost ? (
                <FindPostTab detail={detail} />
              ) : (
                <SummaryTab detail={detail} tags={tags} onTags={setTags} />
              ))}
            {tab === 'instructions' && (
              <InstructionsTab
                detail={detail}
                onCarrier={(v) => setDetail((d) => ({ ...d, carrierInstructions: v }))}
                onInternal={(v) => setDetail((d) => ({ ...d, internalInstructions: v }))}
              />
            )}
            {tab === 'documents' && <DocumentsTab detail={detail} />}
          </div>
        </div>

        <DetailRail
          detail={{ ...detail, action: subStage === 'Find & Post' ? 'Find & post' : detail.action }}
          collapsed={railCollapsed}
          onToggle={() => setRailCollapsed((v) => !v)}
        />
      </div>
    </div>
  )
}
