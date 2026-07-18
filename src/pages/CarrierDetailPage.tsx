import { Fragment, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Lock,
  MapPin,
  Phone,
  Mail,
  Search,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { getCarrierDetail, type CarrierDetail } from '@/data/carriers'

export type CarrierTabId =
  | 'overview'
  | 'coverage'
  | 'availability'
  | 'resources'
  | 'compliance'
  | 'compare'
  | 'banking'
  | 'directory'
  | 'classification'
  | 'documents'
  | 'notes'

const TABS: { id: CarrierTabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'coverage', label: 'Coverage' },
  { id: 'availability', label: 'Availability' },
  { id: 'resources', label: 'Resources' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'compare', label: 'Highway vs Genlog' },
  { id: 'banking', label: 'Banking' },
  { id: 'directory', label: 'Directory' },
  { id: 'classification', label: 'Classification' },
  { id: 'documents', label: 'Documents' },
  { id: 'notes', label: 'Notes' },
]

type Props = {
  carrierId: string
  onBack: () => void
}

function FactRow({ label, value, tone }: { label: string; value: ReactNode; tone?: 'ok' | 'bad' | 'warn' }) {
  return (
    <div className="cd-fact">
      <span className="cd-fact__label">{label}</span>
      <span className={cn('cd-fact__value', tone && `is-${tone}`)}>{value}</span>
    </div>
  )
}

function yn(v: boolean) {
  return v ? <span className="is-ok">Yes</span> : <span className="is-bad">No</span>
}

export function CarrierDetailPage({ carrierId, onBack }: Props) {
  const carrier = getCarrierDetail(carrierId)
  const [tab, setTab] = useState<CarrierTabId>('overview')
  const [highwayOn, setHighwayOn] = useState(true)
  const [genlogsOn, setGenlogsOn] = useState(true)
  const [docId, setDocId] = useState<string | null>(null)
  const [noteFilter, setNoteFilter] = useState<'All' | 'Internal' | 'External' | 'Carrier Dispatch Alert'>('All')
  const [noteQ, setNoteQ] = useState('')

  if (!carrier) {
    return (
      <div className="cd-page">
        <button type="button" className="cd-back" onClick={onBack}>
          <ArrowLeft size={16} /> Back to My Carriers
        </button>
        <div className="cd-card cd-empty">Carrier not found.</div>
      </div>
    )
  }

  const selectedDoc = carrier.documents.find((d) => d.id === (docId ?? carrier.documents[0]?.id))

  return (
    <div className="cd-page">
      <div className="cd-topbar">
        <button type="button" className="cd-back" onClick={onBack}>
          <ArrowLeft size={16} />
          My Carriers
        </button>
      </div>

      <header className="cd-hero">
        <div className="cd-hero__main">
          <h1 className="cd-hero__name">{carrier.name}</h1>
          <div className="cd-hero__meta">
            <span>MC {carrier.mc}</span>
            <span>DOT {carrier.dot}</span>
            <span>
              <MapPin size={12} /> {carrier.city}, {carrier.state}
            </span>
            <span>
              <Phone size={12} /> {carrier.phone}
            </span>
            <span>
              <Mail size={12} /> {carrier.email}
            </span>
          </div>
          <div className="cd-hero__badges">
            {carrier.badges.map((b) => (
              <span key={b.label} className={cn('cd-badge', b.active && 'is-on')}>
                {b.label}
              </span>
            ))}
          </div>
        </div>
        <div className="cd-hero__side">
          <span className="cd-pass">PASS · {carrier.passMonths} Months</span>
          <span className="cd-units">{carrier.units} units</span>
        </div>
        <div className="cd-hero__fleet">
          <span className="cd-fleet-active">ACTIVE SINCE {carrier.activeSince}</span>
          <span>Power Units · {carrier.units}</span>
          <span>Drivers · {carrier.drivers}</span>
          <span>Trailers · {carrier.trailers}</span>
          <span>Terminals · {carrier.terminals}</span>
          <span>Offices · {carrier.offices}</span>
        </div>
      </header>

      <div className="cd-layout">
        <aside className="cd-rail">
          <div className="cd-rail__card">
            <div className="cd-rail__label">Tabs</div>
            <nav className="cd-tabs">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={cn('cd-tab', tab === t.id && 'is-active')}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="cd-rail__card">
            <div className="cd-rail__label">Data sources</div>
            <label className="cd-source">
              <input type="checkbox" checked={highwayOn} onChange={(e) => setHighwayOn(e.target.checked)} />
              <span className="cd-dot is-hw" /> Highway
            </label>
            <label className="cd-source">
              <input type="checkbox" checked={genlogsOn} onChange={(e) => setGenlogsOn(e.target.checked)} />
              <span className="cd-dot is-gl" /> GenLogs
            </label>
          </div>
        </aside>

        <main className="cd-main">
          {tab === 'overview' && <OverviewTab c={carrier} />}
          {tab === 'coverage' && <CoverageTab c={carrier} />}
          {tab === 'availability' && <AvailabilityTab c={carrier} />}
          {tab === 'resources' && <ResourcesTab c={carrier} />}
          {tab === 'compliance' && <ComplianceTab c={carrier} />}
          {tab === 'compare' && <CompareTab c={carrier} highwayOn={highwayOn} genlogsOn={genlogsOn} />}
          {tab === 'banking' && <BankingTab c={carrier} />}
          {tab === 'directory' && <DirectoryTab c={carrier} />}
          {tab === 'classification' && <ClassificationTab c={carrier} />}
          {tab === 'documents' && (
            <DocumentsTab
              c={carrier}
              selected={selectedDoc}
              onSelect={setDocId}
            />
          )}
          {tab === 'notes' && (
            <NotesTab
              c={carrier}
              filter={noteFilter}
              setFilter={setNoteFilter}
              q={noteQ}
              setQ={setNoteQ}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function OverviewTab({ c }: { c: CarrierDetail }) {
  return (
    <div className="cd-stack">
      <div className="cd-metrics">
        <div className="cd-metric">
          <span className="cd-metric__label">Active assignments</span>
          <strong>{c.assignmentsInProgress}</strong>
          <span className="cd-metric__sub">In progress</span>
        </div>
        <div className="cd-metric">
          <span className="cd-metric__label">Loads (30 days)</span>
          <strong>{c.loads30d}</strong>
          <span className="cd-metric__sub">Recent volume</span>
        </div>
        <div className="cd-metric">
          <span className="cd-metric__label">Safety rating</span>
          <strong className="is-ok">{c.compliance.safetyRating}</strong>
          <span className="cd-metric__sub">Rated {c.compliance.ratedOn}</span>
        </div>
        <div className="cd-metric">
          <span className="cd-metric__label">Cargo coverage</span>
          <strong>{c.insurance.cargoCoverage}</strong>
          <span className="cd-metric__sub">Current limit</span>
        </div>
      </div>

      <section className="cd-card">
        <h3 className="cd-card__title">Insurance & coverage</h3>
        <div className="cd-facts">
          <FactRow label="Cargo Coverage" value={c.insurance.cargoCoverage} />
          <FactRow label="Interchange Insurance" value={c.insurance.interchange} />
          <FactRow label="Hazmat Certified" value={c.insurance.hazmat} tone={c.insurance.hazmat === 'Yes' ? 'ok' : 'bad'} />
        </div>
      </section>

      <section className="cd-card">
        <h3 className="cd-card__title">Compliance & documentation</h3>
        <div className="cd-facts">
          <FactRow label="ELD Verified" value={yn(c.compliance.eldVerified)} />
          <FactRow label="TIN Verified" value={yn(c.compliance.tinVerified)} />
          <FactRow label="W-9 on File" value={yn(c.compliance.w9OnFile)} />
          <FactRow label="Hazmat Certified" value={yn(c.compliance.hazmatCertified)} />
          <FactRow label="High-Value Approved" value={yn(c.compliance.highValueApproved)} />
        </div>
      </section>

      <section className="cd-card">
        <div className="cd-card__head">
          <h3 className="cd-card__title">FMCSA safety & inspections</h3>
          <span className="cd-tag is-gl">GenLogs</span>
        </div>
        <div className="cd-safety">
          <div>
            <div className="cd-metric__label">Safety rating</div>
            <div className="cd-safety__rating is-ok">{c.compliance.safetyRating}</div>
            <div className="cd-muted">Compliance review · Reviewed {c.compliance.reviewedOn}</div>
          </div>
          <div className="cd-crash-grid">
            {(
              [
                ['Total', c.compliance.crashes.total],
                ['Fatal', c.compliance.crashes.fatal],
                ['Injury', c.compliance.crashes.injury],
                ['Tow-Away', c.compliance.crashes.towAway],
              ] as const
            ).map(([label, n]) => (
              <div key={label} className="cd-crash">
                <span>{label}</span>
                <strong className={label === 'Fatal' && n > 0 ? 'is-bad' : undefined}>{n}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cd-card">
        <div className="cd-card__head">
          <h3 className="cd-card__title">BIPD insurance</h3>
          <span className="cd-tag is-gl">GenLogs</span>
        </div>
        <div className="cd-facts">
          <FactRow label="Insurer" value={c.insurance.bipdInsurer} />
          <FactRow label="Policy Number" value={c.insurance.bipdPolicy} />
          <FactRow label="BIPD Limit" value={c.insurance.bipdLimit} />
          <FactRow label="Effective Date" value={c.insurance.bipdEffective} />
          <FactRow label="Expiration Date" value={c.insurance.bipdExpiry} />
        </div>
        <p className="cd-footnote">Sourced from FMCSA filing via GenLogs.</p>
      </section>
    </div>
  )
}

function CoverageTab({ c }: { c: CarrierDetail }) {
  return (
    <div className="cd-stack">
      <section className="cd-card">
        <div className="cd-card__head">
          <h3 className="cd-card__title">Operating coverage map</h3>
          <button type="button" className="mc-btn mc-btn--ghost mc-btn--sm">
            + Add Coverage
          </button>
        </div>
        <div className="cd-map-row">
          <div className="cd-map-placeholder">
            <div className="cd-map-placeholder__label">North America coverage</div>
            <div className="cd-map-legend">
              <span><i className="cd-dot is-hw" /> Active</span>
              <span><i className="cd-dot is-muted" /> No coverage</span>
              <span><i className="cd-dot is-gl" /> Observed · GenLogs</span>
            </div>
          </div>
          <div className="cd-country-stack">
            {(
              [
                ['Canada', c.coverage.canada],
                ['USA', c.coverage.usa],
                ['Mexico', c.coverage.mexico],
              ] as const
            ).map(([label, val]) => (
              <div key={label} className="cd-country">
                <strong>{label}</strong>
                <span className={val.startsWith('No') ? 'cd-muted' : 'is-ok'}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cd-card">
        <h3 className="cd-card__title">Lane activity</h3>
        <div className="cd-lane-grid">
          <div className="cd-lane-block">
            <div className="cd-card__title">Preferred lanes ({c.preferredLanes.length})</div>
            <table className="cd-mini-table">
              <thead>
                <tr>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Volume</th>
                </tr>
              </thead>
              <tbody>
                {c.preferredLanes.map((l) => (
                  <tr key={`${l.origin}-${l.destination}`}>
                    <td>{l.origin}</td>
                    <td>{l.destination}</td>
                    <td>{l.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="cd-lane-block">
            <div className="cd-card__title">Dedicated lanes ({c.dedicatedLanes.length})</div>
            <table className="cd-mini-table">
              <thead>
                <tr>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Contract</th>
                </tr>
              </thead>
              <tbody>
                {c.dedicatedLanes.map((l) => (
                  <tr key={l.contract}>
                    <td>{l.origin}</td>
                    <td>{l.destination}</td>
                    <td className="mc-mono">{l.contract}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

function AvailabilityTab({ c }: { c: CarrierDetail }) {
  return (
    <section className="cd-card">
      <div className="cd-card__head">
        <h3 className="cd-card__title">Availability ({c.availabilityPosts.length})</h3>
      </div>
      {c.availabilityPosts.length === 0 ? (
        <p className="cd-empty">No availability posted for this carrier.</p>
      ) : (
        <table className="cd-mini-table">
          <thead>
            <tr>
              <th>Origin</th>
              <th>Destination</th>
              <th>Trailer</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {c.availabilityPosts.map((a) => (
              <tr key={a.id}>
                <td>{a.origin}</td>
                <td>{a.destination}</td>
                <td>{a.trailer}</td>
                <td>{a.start}</td>
                <td>{a.end}</td>
                <td>
                  <span className="mc-status is-active">{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function ResourcesTab({ c }: { c: CarrierDetail }) {
  const cards = [
    { label: 'Trucks', value: `${c.resources.trucks} Power Units`, tone: 'blue' },
    { label: 'Trailers', value: `${c.resources.trailers} Equipment`, tone: 'purple' },
    { label: 'Drivers', value: `${c.resources.drivers.length} Personnel`, tone: 'green' },
    { label: 'Terminals', value: `${c.resources.terminals} Locations`, tone: 'orange' },
    { label: 'Offices', value: `${c.resources.offices} Locations`, tone: 'gray' },
  ] as const

  return (
    <div className="cd-stack">
      <div className="cd-resource-cards">
        {cards.map((card) => (
          <div key={card.label} className={cn('cd-res-card', `is-${card.tone}`)}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>

      <section className="cd-card">
        <h3 className="cd-card__title">Drivers</h3>
        <table className="cd-mini-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {c.resources.drivers.map((d) => (
              <tr key={d.email}>
                <td>
                  <strong>{d.name}</strong>
                </td>
                <td>{d.phone}</td>
                <td>{d.email}</td>
                <td>
                  <span className="mc-status is-active">{d.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {(['Trucks', 'Trailers', 'Terminals', 'Offices'] as const).map((label) => (
        <section key={label} className="cd-card">
          <h3 className="cd-card__title">{label}</h3>
          <p className="cd-empty">
            {label === 'Trucks' && c.resources.trucks === 0
              ? `No ${label.toLowerCase()} on file for this carrier.`
              : label === 'Trailers' && c.resources.trailers === 0
                ? `No ${label.toLowerCase()} on file for this carrier.`
                : `${label} summary reflected in fleet metrics above. Detail records sync from GenLogs.`}
          </p>
        </section>
      ))}
    </div>
  )
}

function ComplianceTab({ c }: { c: CarrierDetail }) {
  return (
    <div className="cd-stack">
      <section className="cd-card">
        <div className="cd-card__head">
          <h3 className="cd-card__title">Vetting results</h3>
          <div className="cd-head-tags">
            {c.vetting.blocked > 0 ? (
              <span className="cd-tag is-bad">Blocked</span>
            ) : (
              <span className="cd-tag is-ok">Clear to proceed</span>
            )}
            <span className="cd-tag is-gl">GenLogs</span>
          </div>
        </div>
        <div className="cd-vet-metrics">
          <div className="cd-vet is-bad">
            <strong>{c.vetting.blocked}</strong>
            <span>Blocking issues</span>
          </div>
          <div className="cd-vet is-warn">
            <strong>{c.vetting.warnings}</strong>
            <span>Warnings</span>
          </div>
          <div className="cd-vet is-ok">
            <strong>{c.vetting.passed}</strong>
            <span>Checks passed</span>
          </div>
          <div className="cd-vet">
            <strong>{c.vetting.total}</strong>
            <span>Total checks run</span>
          </div>
        </div>
        <div className="cd-issues">
          {c.vetting.issues.map((issue) => (
            <div key={issue.title} className={cn('cd-issue', issue.severity === 'Blocking' ? 'is-bad' : 'is-warn')}>
              <div>
                <strong>{issue.title}</strong>
                <div className="cd-muted">{issue.detail}</div>
              </div>
              <span className={cn('cd-tag', issue.severity === 'Blocking' ? 'is-bad' : 'is-warn')}>
                {issue.severity}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="cd-card">
        <div className="cd-card__head">
          <h3 className="cd-card__title">BIPD insurance</h3>
          <span className="cd-tag is-gl">GenLogs</span>
        </div>
        <div className="cd-facts">
          <FactRow label="Insurer" value={c.insurance.bipdInsurer} />
          <FactRow label="Policy Number" value={c.insurance.bipdPolicy} />
          <FactRow label="BIPD Limit" value={c.insurance.bipdLimit} />
          <FactRow label="Effective Date" value={c.insurance.bipdEffective} />
          <FactRow label="Expiration Date" value={c.insurance.bipdExpiry} />
        </div>
      </section>

      <section className="cd-card">
        <div className="cd-card__head">
          <h3 className="cd-card__title">Upcoming expirations</h3>
          <span className="cd-tag is-warn">{c.expirations.length} items</span>
        </div>
        <div className="cd-exp-list">
          {c.expirations.map((e) => (
            <div key={e.title} className="cd-exp">
              <div>
                <strong>
                  {e.title} — {e.policy}
                </strong>
                <div className="cd-muted">Expires: {e.expires}</div>
              </div>
              <span className={cn('cd-tag', e.status === 'Expired' ? 'is-bad' : 'is-warn')}>{e.status}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="cd-card">
        <h3 className="cd-card__title">Insurance policies ({c.policies.length})</h3>
        <div className="cd-policy-grid">
          {c.policies.map((p) => (
            <div key={p.policyNo} className={cn('cd-policy', p.status === 'Expired' && 'is-expired')}>
              <div className="cd-policy__head">
                <strong>{p.type}</strong>
                <span className={cn('cd-tag', p.status === 'Active' ? 'is-ok' : 'is-bad')}>{p.status}</span>
              </div>
              <div className="cd-policy__grid">
                <FactRow label="Broker" value={p.broker} />
                <FactRow label="Policy #" value={p.policyNo} />
                <FactRow label="Effective" value={p.effective} />
                <FactRow label="Expiry" value={p.expiry} />
                <FactRow label="Limit" value={p.limit} />
                <FactRow label="Deductible" value={p.deductible} />
                <FactRow label="Source" value={p.source} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function CompareTab({
  c,
  highwayOn,
  genlogsOn,
}: {
  c: CarrierDetail
  highwayOn: boolean
  genlogsOn: boolean
}) {
  const rows = c.comparison
  const match = rows.filter((r) => r.status === 'Match').length
  const mismatch = rows.filter((r) => r.status === 'Mismatch').length
  const single = rows.filter((r) => r.status !== 'Match' && r.status !== 'Mismatch').length
  const groups = useMemo(() => {
    const map = new Map<string, typeof rows>()
    for (const r of rows) {
      const list = map.get(r.group) ?? []
      list.push(r)
      map.set(r.group, list)
    }
    return [...map.entries()]
  }, [rows])

  return (
    <div className="cd-stack">
      <div className="cd-compare-summary">
        <h3 className="cd-card__title">Highway vs GenLogs — data comparison</h3>
        <div className="cd-head-tags">
          <span>{rows.length} comparable fields</span>
          <span className="cd-tag is-ok">{match} match</span>
          <span className="cd-tag">{mismatch} mismatch</span>
          <span className="cd-tag">{single} single-source</span>
        </div>
      </div>
      <section className="cd-card cd-card--flush">
        <table className="cd-mini-table cd-compare-table">
          <thead>
            <tr>
              <th>Field</th>
              {highwayOn && <th>Highway</th>}
              {genlogsOn && <th>GenLogs</th>}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(([group, items]) => (
              <Fragment key={group}>
                <tr className="cd-group-row">
                  <td colSpan={2 + (highwayOn ? 1 : 0) + (genlogsOn ? 1 : 0)}>{group}</td>
                </tr>
                {items.map((r) => (
                  <tr key={r.field}>
                    <td>{r.field}</td>
                    {highwayOn && <td>{r.highway}</td>}
                    {genlogsOn && <td>{r.genlogs}</td>}
                    <td>
                      <span className={cn('cd-tag', r.status === 'Match' ? 'is-ok' : undefined)}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function BankingTab({ c }: { c: CarrierDetail }) {
  return (
    <section className="cd-card">
      <h3 className="cd-card__title">Banking information ({c.banking.length})</h3>
      <table className="cd-mini-table">
        <thead>
          <tr>
            <th>Country</th>
            <th>AP Code</th>
            <th>Bank</th>
            <th>Account</th>
            <th>Method</th>
            <th>Terms</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {c.banking.map((b) => (
            <tr key={b.apCode}>
              <td>
                <div className="mc-cell-2">
                  <strong>
                    {b.flag} {b.country} {b.currency}
                  </strong>
                </div>
              </td>
              <td className="mc-mono">{b.apCode}</td>
              <td>{b.bank}</td>
              <td className="mc-mono">{b.account}</td>
              <td>{b.method}</td>
              <td>{b.terms}</td>
              <td>
                <span className="mc-status is-active">
                  <CheckCircle2 size={12} /> {b.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function DirectoryTab({ c }: { c: CarrierDetail }) {
  return (
    <div className="cd-stack">
      <section className="cd-card">
        <div className="cd-card__head">
          <h3 className="cd-card__title">Contacts & fraud prevention</h3>
          <span className="cd-tag">
            <Lock size={12} /> Read-Only
          </span>
        </div>
        <div className="cd-alert is-bad">
          Fraud prevention is active — contact information is read-only and free domains are flagged.
        </div>
        <div className="cd-dir-grid">
          <div className="cd-dir-block">
            <div className="cd-card__title">TMS records</div>
            {c.contacts.map((ct) => (
              <div key={ct.email} className="cd-contact">
                <div className="cd-contact__top">
                  <strong>{ct.name}</strong>
                  <span className={cn('cd-role', `is-${ct.role.toLowerCase()}`)}>{ct.role}</span>
                </div>
                <div className={cn('cd-contact__email', ct.domain.includes('gmail') && 'is-flag')}>
                  {ct.email}
                </div>
                <div className="cd-muted">{ct.phone}</div>
                <span className={cn('cd-tag', ct.status === 'Approved' ? 'is-ok' : 'is-warn')}>
                  {ct.status}
                </span>
              </div>
            ))}
          </div>
          <div className="cd-dir-block">
            <div className="cd-card__title">Highway platform match</div>
            {(
              [
                ['Dispatch', 'Verified'],
                ['Physical', `${c.address}, ${c.city}, ${c.state} ${c.postal}`],
                ['ELD', 'Verified'],
                ['Domain', c.email.split('@')[1] ?? '—'],
              ] as const
            ).map(([label, val]) => (
              <div key={label} className="cd-fact">
                <span className="cd-fact__label">{label}</span>
                <span className={cn('cd-fact__value', val === 'Verified' && 'is-ok')}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cd-card">
        <div className="cd-card__head">
          <h3 className="cd-card__title">Historical contacts ({c.contacts.length})</h3>
          <span className="cd-tag">Approved list locked</span>
        </div>
        <table className="cd-mini-table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Role</th>
              <th>Status</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Domain</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {c.contacts.map((ct) => (
              <tr key={`h-${ct.email}`}>
                <td>
                  <strong>{ct.name}</strong>
                </td>
                <td>
                  <span className={cn('cd-role', `is-${ct.role.toLowerCase()}`)}>{ct.role}</span>
                </td>
                <td>
                  <span className={cn('cd-tag', ct.status === 'Approved' ? 'is-ok' : 'is-warn')}>
                    {ct.status}
                  </span>
                </td>
                <td className={ct.domain.includes('gmail') ? 'is-flag' : undefined}>{ct.email}</td>
                <td>{ct.phone}</td>
                <td className={ct.domain.includes('gmail') ? 'is-flag' : undefined}>{ct.domain}</td>
                <td>{ct.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="cd-footnote">Free email domains are automatically flagged for fraud review.</p>
      </section>
    </div>
  )
}

function ClassificationTab({ c }: { c: CarrierDetail }) {
  return (
    <section className="cd-card">
      <h3 className="cd-card__title">Contract types ({c.contractTypes.length})</h3>
      <div className="cd-class-grid">
        {c.contractTypes.map((t) => (
          <div key={t} className="cd-class-item">
            <strong>{t}</strong>
            <CheckCircle2 size={18} className="is-ok" />
          </div>
        ))}
      </div>
    </section>
  )
}

function DocumentsTab({
  c,
  selected,
  onSelect,
}: {
  c: CarrierDetail
  selected?: CarrierDetail['documents'][number]
  onSelect: (id: string) => void
}) {
  const folders = useMemo(() => {
    const map = new Map<string, typeof c.documents>()
    for (const d of c.documents) {
      const list = map.get(d.folder) ?? []
      list.push(d)
      map.set(d.folder, list)
    }
    return [...map.entries()]
  }, [c.documents])

  return (
    <div className="cd-docs">
      <aside className="cd-docs__list">
        <button type="button" className="cd-upload">
          <Upload size={14} /> Upload
        </button>
        <div className="cd-docs__search">
          <Search size={14} />
          <input placeholder="Search documents…" />
        </div>
        {folders.map(([folder, docs]) => (
          <div key={folder} className="cd-docs__folder">
            <div className="cd-docs__folder-title">
              {folder} ({docs.length})
            </div>
            {docs.map((d) => (
              <button
                key={d.id}
                type="button"
                className={cn('cd-docs__item', selected?.id === d.id && 'is-active')}
                onClick={() => onSelect(d.id)}
              >
                <FileText size={14} />
                <span>{d.name}</span>
              </button>
            ))}
          </div>
        ))}
        <div className="cd-footnote">{c.documents.length} of {c.documents.length} documents</div>
      </aside>
      <section className="cd-docs__preview">
        {selected ? (
          <>
            <div className="cd-docs__preview-head">
              <div>
                <strong>{selected.name}</strong>
                <div className="cd-muted">Uploaded {selected.date}</div>
              </div>
              <div className="cd-docs__preview-actions">
                <button type="button" className="mc-btn mc-btn--ghost mc-btn--sm" aria-label="Open">
                  <ExternalLink size={14} />
                </button>
                <button type="button" className="mc-btn mc-btn--ghost mc-btn--sm" aria-label="Download">
                  <Download size={14} />
                </button>
              </div>
            </div>
            <div className="cd-docs__canvas">
              <div className="cd-docs__sheet">
                <h4>Carrier document preview</h4>
                <p>{selected.name}</p>
                <p className="cd-muted">
                  Folder: {selected.folder} · Type: {selected.kind.toUpperCase()} · Carrier: {c.name}
                </p>
                <p>
                  This preview pane mirrors the Documents workspace. Connect the document service to
                  render live PDFs here.
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="cd-empty">Select a document to preview.</p>
        )}
      </section>
    </div>
  )
}

function NotesTab({
  c,
  filter,
  setFilter,
  q,
  setQ,
}: {
  c: CarrierDetail
  filter: 'All' | 'Internal' | 'External' | 'Carrier Dispatch Alert'
  setFilter: (f: 'All' | 'Internal' | 'External' | 'Carrier Dispatch Alert') => void
  q: string
  setQ: (v: string) => void
}) {
  const notes = c.notes.filter((n) => {
    if (filter !== 'All' && n.type !== filter) return false
    if (q && !n.text.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  return (
    <section className="cd-card cd-notes">
      <div className="cd-notes__head">
        <div className="cd-notes__tabs">
          {(['All', 'Internal', 'External', 'Carrier Dispatch Alert'] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={cn('cd-notes__tab', filter === f && 'is-active')}
              onClick={() => setFilter(f)}
            >
              {f} {f === 'All' ? c.notes.length : c.notes.filter((n) => n.type === f).length}
            </button>
          ))}
        </div>
        <div className="cd-docs__search">
          <Search size={14} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search notes…"
          />
        </div>
      </div>

      <div className="cd-notes__body">
        {notes.length === 0 ? (
          <p className="cd-empty">No notes found.</p>
        ) : (
          notes.map((n) => (
            <article key={n.id} className="cd-note">
              <div className="cd-note__meta">
                <span className="cd-tag">{n.type}</span>
                <span className="cd-muted">
                  {n.who} · {n.when}
                </span>
              </div>
              <p>{n.text}</p>
            </article>
          ))
        )}
      </div>

      <div className="cd-notes__composer">
        <input placeholder="Type here…" />
        <select defaultValue="Internal">
          <option>Internal</option>
          <option>External</option>
          <option>Carrier Dispatch Alert</option>
        </select>
        <button type="button" className="mc-btn mc-btn--primary mc-btn--sm">
          Send
        </button>
      </div>
    </section>
  )
}
