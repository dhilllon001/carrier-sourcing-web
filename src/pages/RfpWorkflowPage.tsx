import { useState, type CSSProperties, type ReactNode } from 'react'
import {
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  FileCheck2,
  FileSignature,
  Filter,
  Mail,
  MessageSquareText,
  PenLine,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { capacityLanes, laneMetrics } from '@/data/capacityLanes'
import { getColorByType, tagColors } from '@/data/statusColors'
import { cn } from '@/lib/cn'

export type RfpStage = 'design' | 'publish' | 'bids' | 'evaluate' | 'award'

type Props = {
  stage: RfpStage
  search: string
  initialLaneIds: string[]
  onStageChange: (stage: RfpStage) => void
  onOpenDashboard: () => void
}

type Source = 'Historic' | 'DAT' | 'Load Link' | 'Highway' | 'Gen Log'
type InviteStatus = 'Ready' | 'Invited' | 'Viewed' | 'Interested' | 'Declined'

type Candidate = {
  id: string
  name: string
  mc: string
  source: Source
  lanes: number
  fit: number
  status: InviteStatus
  bidRate: number | null
  volume: number
  confidence: number
  onTime: number
  acceptance: number
}

const STAGES: Array<{ id: RfpStage; label: string; note: string }> = [
  { id: 'design', label: 'Design', note: 'Scope lanes' },
  { id: 'publish', label: 'Publish & Invite', note: 'Find carriers' },
  { id: 'bids', label: 'Bids', note: 'Track interest' },
  { id: 'evaluate', label: 'Evaluate', note: 'Compare & negotiate' },
  { id: 'award', label: 'Award', note: 'Contract & sign' },
]

const SOURCE_STATUS_TYPE: Record<Source, string> = {
  Historic: 'Asset',
  DAT: 'Spot',
  'Load Link': 'Brokerage',
  Highway: 'CDL',
  'Gen Log': 'B1',
}

const INITIAL_CANDIDATES: Candidate[] = [
  { id: 'c1', name: 'Manney Cross-Border SA', mc: 'MC 1941466', source: 'Historic', lanes: 5, fit: 96, status: 'Interested', bidRate: 2385, volume: 8, confidence: 94, onTime: 97, acceptance: 96 },
  { id: 'c2', name: 'TransNorte Bonded', mc: 'MC 3390112', source: 'Highway', lanes: 4, fit: 91, status: 'Interested', bidRate: 2410, volume: 6, confidence: 89, onTime: 94, acceptance: 91 },
  { id: 'c3', name: 'Smart Choice Transport', mc: 'MC 4483133', source: 'Historic', lanes: 3, fit: 88, status: 'Viewed', bidRate: null, volume: 5, confidence: 86, onTime: 94, acceptance: 92 },
  { id: 'c4', name: 'Laredo Link Freight', mc: 'MC 2277910', source: 'DAT', lanes: 6, fit: 84, status: 'Invited', bidRate: null, volume: 7, confidence: 78, onTime: 86, acceptance: 81 },
  { id: 'c5', name: 'Maple Crown Logistics', mc: 'MC 5512088', source: 'Load Link', lanes: 3, fit: 81, status: 'Interested', bidRate: 2465, volume: 4, confidence: 82, onTime: 92, acceptance: 88 },
  { id: 'c6', name: 'GenPro Freight Systems', mc: 'MC 7780192', source: 'Gen Log', lanes: 2, fit: 74, status: 'Declined', bidRate: null, volume: 3, confidence: 66, onTime: 84, acceptance: 76 },
  { id: 'c7', name: 'Titan Dedicated Logistics', mc: 'MC 6021844', source: 'DAT', lanes: 4, fit: 79, status: 'Ready', bidRate: null, volume: 6, confidence: 76, onTime: 90, acceptance: 85 },
  { id: 'c8', name: 'Northstar Highway Freight', mc: 'MC 8104492', source: 'Highway', lanes: 5, fit: 87, status: 'Ready', bidRate: null, volume: 7, confidence: 84, onTime: 95, acceptance: 89 },
  { id: 'c9', name: 'Québec Ontario Transport', mc: 'MC 7301881', source: 'Load Link', lanes: 3, fit: 83, status: 'Ready', bidRate: null, volume: 4, confidence: 80, onTime: 93, acceptance: 87 },
  { id: 'c10', name: 'Apex Automotive Carriers', mc: 'MC 4928870', source: 'Historic', lanes: 4, fit: 92, status: 'Viewed', bidRate: 2398, volume: 5, confidence: 91, onTime: 96, acceptance: 94 },
  { id: 'c11', name: 'Sierra Madre Freight', mc: 'MC 3650902', source: 'Gen Log', lanes: 2, fit: 72, status: 'Invited', bidRate: null, volume: 3, confidence: 69, onTime: 86, acceptance: 80 },
]

const sourcingLanes = capacityLanes.filter((lane) => laneMetrics(lane).gap > 0)

export function RfpWorkflowPage({ stage, search, initialLaneIds, onStageChange, onOpenDashboard }: Props) {
  const [selectedLanes, setSelectedLanes] = useState(() =>
    initialLaneIds.length ? initialLaneIds : sourcingLanes.map((lane) => lane.id)
  )
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES)
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>(['c7', 'c8', 'c9'])
  const [shortlist, setShortlist] = useState<string[]>(['c1', 'c2', 'c5'])
  const [negotiating, setNegotiating] = useState<string | null>(null)
  const [awarded, setAwarded] = useState('c1')
  const [signed, setSigned] = useState(false)
  const [sourceFilter, setSourceFilter] = useState<Source | 'All'>('All')
  const [documentOpen, setDocumentOpen] = useState(false)
  const [activity, setActivity] = useState<string[]>([
    'Maple Crown Logistics submitted a bid · 18 min ago',
    'Smart Choice Transport viewed the invitation · 41 min ago',
    'TransNorte Bonded updated committed volume · 1 hr ago',
  ])
  const [toast, setToast] = useState<string | null>(null)
  const [localQ, setLocalQ] = useState('')

  const q = (search || localQ).trim().toLowerCase()
  const visibleCandidates = candidates.filter((carrier) =>
    (sourceFilter === 'All' || carrier.source === sourceFilter) &&
    (!q || [carrier.name, carrier.mc, carrier.source, carrier.status].join(' ').toLowerCase().includes(q))
  )
  const winner = candidates.find((carrier) => carrier.id === awarded) ?? candidates[0]

  const say = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2400)
  }

  return (
    <div className="sr-page rfpflow-page">
      <section className="rfpflow-context">
        <button type="button" onClick={onOpenDashboard}>RFP Manager</button>
        <ChevronRight size={12} />
        <strong>FY27 Capacity Gap RFP</strong>
        <span>RFP-2464</span>
        <em>Due Sep 08, 2026</em>
      </section>

      <section className="rfpflow-steps" aria-label="RFP workflow">
        {STAGES.map((item, index) => {
          const activeIndex = STAGES.findIndex((candidate) => candidate.id === stage)
          const complete = index < activeIndex
          return (
            <button
              type="button"
              key={item.id}
              className={cn(stage === item.id && 'is-active', complete && 'is-complete')}
              onClick={() => onStageChange(item.id)}
            >
              <i>{complete ? <Check size={13} /> : index + 1}</i>
              <span><strong>{item.label}</strong><em>{item.note}</em></span>
              {index < STAGES.length - 1 && <b />}
            </button>
          )
        })}
      </section>

      {stage === 'design' && (
        <DesignStage
          selected={selectedLanes}
          onToggle={(id) =>
            setSelectedLanes((current) =>
              current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
            )
          }
          onNext={() => onStageChange('publish')}
        />
      )}

      {stage === 'publish' && (
        <PublishStage
          candidates={visibleCandidates}
          selected={selectedCarriers}
          source={sourceFilter}
          query={localQ}
          onQuery={setLocalQ}
          onSource={setSourceFilter}
          onToggle={(id) =>
            setSelectedCarriers((current) =>
              current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
            )
          }
          onInvite={() => {
            setCandidates((current) =>
              current.map((carrier) =>
                selectedCarriers.includes(carrier.id) &&
                !['Interested', 'Declined'].includes(carrier.status)
                  ? { ...carrier, status: 'Invited' }
                  : carrier
              )
            )
            setActivity((current) => [
              `Invitation wave sent to ${selectedCarriers.length} carriers · just now`,
              ...current,
            ])
            say(`Invitation sent to ${selectedCarriers.length} carriers`)
          }}
          onNext={() => onStageChange('bids')}
        />
      )}

      {stage === 'bids' && (
        <BidsStage
          candidates={visibleCandidates}
          activity={activity}
          onReminder={() => {
            setCandidates((current) =>
              current.map((carrier) =>
                carrier.status === 'Invited' ? { ...carrier, status: 'Viewed' } : carrier
              )
            )
            setActivity((current) => ['Reminder sent to every pending carrier · just now', ...current])
            say('Reminder sent to pending carriers')
          }}
          onNext={() => onStageChange('evaluate')}
        />
      )}

      {stage === 'evaluate' && (
        <EvaluateStage
          candidates={candidates.filter((carrier) => carrier.bidRate)}
          shortlist={shortlist}
          negotiating={negotiating}
          onShortlist={(id) =>
            setShortlist((current) =>
              current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
            )
          }
          onNegotiate={setNegotiating}
          onPatch={(id, patch) =>
            setCandidates((current) =>
              current.map((carrier) => (carrier.id === id ? { ...carrier, ...patch } : carrier))
            )
          }
          onCounter={(carrier) => {
            setNegotiating(null)
            setActivity((current) => [
              `Counter sent to ${carrier.name}: $${carrier.bidRate?.toLocaleString()} at ${carrier.volume} loads/week · just now`,
              ...current,
            ])
            say(`Counter proposal sent to ${carrier.name}`)
          }}
          onAward={(id) => {
            setAwarded(id)
            onStageChange('award')
          }}
        />
      )}

      {stage === 'award' && (
        <AwardStage
          winner={winner}
          signed={signed}
          documentOpen={documentOpen}
          onReview={() => setDocumentOpen((open) => !open)}
          onSign={() => {
            setSigned(true)
            say('Contract signed and carrier award confirmed')
          }}
        />
      )}

      {toast && <div className="rfp-toast">{toast}</div>}
    </div>
  )
}

function DesignStage({
  selected,
  onToggle,
  onNext,
}: {
  selected: string[]
  onToggle: (id: string) => void
  onNext: () => void
}) {
  const loads = sourcingLanes
    .filter((lane) => selected.includes(lane.id))
    .reduce((sum, lane) => sum + laneMetrics(lane).gap, 0)
  return (
    <>
      <StageHeader
        kicker="Stage 1 · Design"
        title="Build the RFP from uncovered capacity"
        description="These lanes come from the Carrier Capacity Dashboard. Confirm scope, volume, equipment, and commercial terms before publishing."
        action={<button type="button" className="rfpflow-primary" disabled={!selected.length} onClick={onNext}>Continue to invites <ArrowRight size={14} /></button>}
      />
      <section className="rfpflow-metrics">
        <Metric label="Selected lanes" value={String(selected.length)} note={`${sourcingLanes.length} recommended`} />
        <Metric label="Capacity required" value={`${loads}/wk`} note="uncovered forecast" tone="danger" />
        <Metric label="Annualized loads" value={(loads * 52).toLocaleString()} note="contract opportunity" />
        <Metric label="Bid due" value="Sep 08" note="17 days remaining" tone="action" />
      </section>
      <section className="rfpflow-layout">
        <div className="rfpflow-card">
          <CardHead title="Recommended lanes" note="Selected from current capacity gaps">
            <span className="rfpflow-ai"><Sparkles size={12} /> AI prioritized</span>
          </CardHead>
          <div className="rfpflow-lanes">
            {sourcingLanes.map((lane) => {
              const metrics = laneMetrics(lane)
              const on = selected.includes(lane.id)
              return (
                <button type="button" className={cn('rfpflow-lane', on && 'is-selected')} key={lane.id} onClick={() => onToggle(lane.id)}>
                  <i className="rfpflow-check">{on && <Check size={12} />}</i>
                  <span><strong>{lane.origin} → {lane.destination}</strong><em>{lane.customer} · {lane.equipment} · {lane.miles.toLocaleString()} mi</em></span>
                  <span className="rfpflow-lane__volume"><b>{metrics.gap}</b><em>loads short / wk</em></span>
                  <span className={cn('rfpflow-risk', metrics.coverage < 75 ? 'is-danger' : 'is-watch')}>{metrics.coverage}% covered</span>
                </button>
              )
            })}
          </div>
        </div>
        <aside className="rfpflow-card rfpflow-settings">
          <CardHead title="RFP terms" note="Applies to selected lanes" />
          <Field label="RFP name"><input defaultValue="FY27 Capacity Gap RFP" /></Field>
          <div className="rfpflow-fields">
            <Field label="Response due"><input type="date" defaultValue="2026-09-08" /></Field>
            <Field label="Contract start"><input type="date" defaultValue="2026-10-01" /></Field>
          </div>
          <div className="rfpflow-fields">
            <Field label="Contract term"><select defaultValue="12"><option value="12">12 months</option><option value="6">6 months</option><option value="24">24 months</option></select></Field>
            <Field label="Currency"><select><option>USD</option><option>CAD</option><option>MXN</option></select></Field>
          </div>
          <Field label="Carrier requirements"><textarea defaultValue="Asset or bonded capacity preferred. Minimum 95% on-time performance. Bid must include fuel." /></Field>
          <label className="rfpflow-toggle"><input type="checkbox" defaultChecked /><span /><b>Allow lane-level bids</b></label>
          <label className="rfpflow-toggle"><input type="checkbox" defaultChecked /><span /><b>Allow alternate volume proposals</b></label>
        </aside>
      </section>
    </>
  )
}

function PublishStage({
  candidates,
  selected,
  source,
  query,
  onQuery,
  onSource,
  onToggle,
  onInvite,
  onNext,
}: {
  candidates: Candidate[]
  selected: string[]
  source: Source | 'All'
  query: string
  onQuery: (value: string) => void
  onSource: (source: Source | 'All') => void
  onToggle: (id: string) => void
  onInvite: () => void
  onNext: () => void
}) {
  return (
    <>
      <StageHeader
        kicker="Stage 2 · Publish & Invite"
        title="Build the carrier audience"
        description="One candidate list, ranked across our history and external carrier sources. Select who should receive the private RFP."
        action={<><button className="rfpflow-secondary" onClick={onNext}>View bid activity</button><button className="rfpflow-primary" onClick={onInvite}><Send size={14} /> Invite {selected.length} carriers</button></>}
      />
      <section className="rfpflow-source-strip">
        {(['Historic', 'DAT', 'Load Link', 'Highway', 'Gen Log'] as Source[]).map((sourceName) => (
          <button
            type="button"
            key={sourceName}
            className={source === sourceName ? 'is-active' : undefined}
            aria-pressed={source === sourceName}
            onClick={() => onSource(source === sourceName ? 'All' : sourceName)}
          >
            <SourceBadge source={sourceName} />
            <b>{INITIAL_CANDIDATES.filter((carrier) => carrier.source === sourceName).length}</b>
            <em>matched</em>
          </button>
        ))}
      </section>
      <section className="rfpflow-card">
        <div className="rfpflow-toolbar">
          <label><Search size={14} /><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Carrier, MC, source…" />{query && <button onClick={() => onQuery('')}><X size={12} /></button>}</label>
          <label className="rfpflow-source-filter">
            <Filter size={13} />
            <select value={source} onChange={(event) => onSource(event.target.value as Source | 'All')}>
              <option value="All">All sources</option>
              {(['Historic', 'DAT', 'Load Link', 'Highway', 'Gen Log'] as Source[]).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <span>{selected.length} selected · ranked by lane fit</span>
        </div>
        <div className="rfpflow-grid rfpflow-grid--invite">
          <div className="rfpflow-grid__head"><span /><span>Carrier</span><span>Source</span><span>Lane fit</span><span>Matched lanes</span><span>Performance</span><span>Status</span></div>
          {candidates.map((carrier) => (
            <button type="button" className={cn('rfpflow-grid__row', selected.includes(carrier.id) && 'is-selected')} key={carrier.id} onClick={() => onToggle(carrier.id)}>
              <i className="rfpflow-check">{selected.includes(carrier.id) && <Check size={12} />}</i>
              <span className="rfpflow-carrier"><strong>{carrier.name}</strong><em>{carrier.mc}</em></span>
              <SourceBadge source={carrier.source} />
              <span className="rfpflow-score"><b>{carrier.fit}</b><i><em style={{ width: `${carrier.fit}%` }} /></i></span>
              <span><b>{carrier.lanes}</b> lanes</span>
              <span>{carrier.onTime}% on time · {carrier.acceptance}% accept</span>
              <Status status={carrier.status} />
            </button>
          ))}
        </div>
      </section>
    </>
  )
}

function BidsStage({
  candidates,
  activity,
  onReminder,
  onNext,
}: {
  candidates: Candidate[]
  activity: string[]
  onReminder: () => void
  onNext: () => void
}) {
  const interested = candidates.filter((carrier) => carrier.status === 'Interested')
  return (
    <>
      <StageHeader
        kicker="Stage 3 · Bids"
        title="Track every response and carrier decision"
        description="See who opened the invitation, who expressed interest, who declined, and the confidence behind each usable bid."
        action={<button className="rfpflow-primary" onClick={onNext}>Evaluate {interested.length} bids <ArrowRight size={14} /></button>}
      />
      <section className="rfpflow-metrics">
        <Metric label="Carriers invited" value="18" note="5 data sources" />
        <Metric label="Invitation viewed" value="12" note="67% open rate" tone="action" />
        <Metric label="Interested / bid in" value={String(interested.length)} note="ready to evaluate" tone="good" />
        <Metric label="Declined" value="3" note="reason captured" tone="danger" />
      </section>
      <section className="rfpflow-card">
        <CardHead title="Carrier response log" note="Updated 4 minutes ago">
          <button type="button" className="rfpflow-quiet" onClick={onReminder}><Mail size={13} /> Send reminder</button>
        </CardHead>
        <div className="rfpflow-grid rfpflow-grid--bids">
          <div className="rfpflow-grid__head"><span>Carrier</span><span>Source</span><span>Response</span><span>Bid rate</span><span>Volume</span><span>Confidence</span><span>Last activity</span></div>
          {candidates.map((carrier, index) => (
            <div className="rfpflow-grid__row" key={carrier.id}>
              <span className="rfpflow-carrier"><strong>{carrier.name}</strong><em>{carrier.mc}</em></span>
              <SourceBadge source={carrier.source} />
              <Status status={carrier.status} />
              <span className="rfpflow-money">{carrier.bidRate ? `$${carrier.bidRate.toLocaleString()}` : '—'}</span>
              <span>{carrier.bidRate ? `${carrier.volume} / week` : '—'}</span>
              <Confidence score={carrier.confidence} />
              <span className="rfpflow-muted">{index === 0 ? '4 min ago' : `${index + 1} hr ago`}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="rfpflow-bid-summary">
        <div className="rfpflow-card">
          <CardHead title="Response funnel" note="Invitation to usable bid" />
          <div className="rfpflow-funnel">
            <span><b>18</b><em>Invited</em><i style={{ width: '100%' }} /></span>
            <span><b>12</b><em>Viewed</em><i style={{ width: '67%' }} /></span>
            <span><b>7</b><em>Interested</em><i style={{ width: '39%' }} /></span>
            <span><b>4</b><em>Bid received</em><i style={{ width: '22%' }} /></span>
          </div>
        </div>
        <div className="rfpflow-card">
          <CardHead title="Recent activity" note="Carrier portal and outreach log" />
          <div className="rfpflow-activity">
            {activity.slice(0, 4).map((item) => <span key={item}><i /><em>{item}</em></span>)}
          </div>
        </div>
      </section>
    </>
  )
}

function EvaluateStage({
  candidates,
  shortlist,
  negotiating,
  onShortlist,
  onNegotiate,
  onPatch,
  onCounter,
  onAward,
}: {
  candidates: Candidate[]
  shortlist: string[]
  negotiating: string | null
  onShortlist: (id: string) => void
  onNegotiate: (id: string | null) => void
  onPatch: (id: string, patch: Partial<Candidate>) => void
  onCounter: (carrier: Candidate) => void
  onAward: (id: string) => void
}) {
  return (
    <>
      <StageHeader
        kicker="Stage 4 · Evaluate"
        title="Compare the bid, confidence, and execution fit"
        description="Shortlist the strongest carriers, negotiate rate or committed volume, then select who should move to award."
      />
      <section className="rfpflow-card">
        <CardHead title="Bid comparison" note={`${shortlist.length} carriers shortlisted`}>
          <span className="rfpflow-ai"><Sparkles size={12} /> Ranked by award confidence</span>
        </CardHead>
        <div className="rfpflow-evaluate">
          {candidates.sort((a, b) => b.confidence - a.confidence).map((carrier, index) => (
            <article className={cn('rfpflow-bidcard', shortlist.includes(carrier.id) && 'is-shortlisted')} key={carrier.id}>
              <div className="rfpflow-bidcard__rank">#{index + 1}</div>
              <div className="rfpflow-bidcard__carrier"><SourceBadge source={carrier.source} /><strong>{carrier.name}</strong><em>{carrier.mc}</em></div>
              <Confidence score={carrier.confidence} large />
              <div className="rfpflow-bidcard__facts">
                <span><em>Bid rate</em><b>${carrier.bidRate?.toLocaleString()}</b></span>
                <span><em>Volume</em><b>{carrier.volume}/wk</b></span>
                <span><em>On-time</em><b>{carrier.onTime}%</b></span>
                <span><em>Acceptance</em><b>{carrier.acceptance}%</b></span>
              </div>
              <div className="rfpflow-bidcard__actions">
                <button className={shortlist.includes(carrier.id) ? 'is-on' : undefined} onClick={() => onShortlist(carrier.id)}><Check size={13} /> Shortlist</button>
                <button onClick={() => onNegotiate(negotiating === carrier.id ? null : carrier.id)}><MessageSquareText size={13} /> Negotiate</button>
                <button className="is-award" onClick={() => onAward(carrier.id)}>Select for award <ArrowRight size={13} /></button>
              </div>
              {negotiating === carrier.id && (
                <div className="rfpflow-negotiate">
                  <strong>Counter proposal</strong>
                  <label>Rate <span>$</span><input type="number" value={carrier.bidRate ?? 0} onChange={(event) => onPatch(carrier.id, { bidRate: Number(event.target.value) })} /></label>
                  <label>Loads / week <input type="number" value={carrier.volume} onChange={(event) => onPatch(carrier.id, { volume: Number(event.target.value) })} /></label>
                  <button type="button" onClick={() => onCounter(carrier)}><Send size={12} /> Send counter</button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function AwardStage({
  winner,
  signed,
  documentOpen,
  onReview,
  onSign,
}: {
  winner: Candidate
  signed: boolean
  documentOpen: boolean
  onReview: () => void
  onSign: () => void
}) {
  return (
    <>
      <StageHeader
        kicker="Stage 5 · Award"
        title={signed ? 'Award confirmed and contract signed' : 'Turn the selected bid into an executable contract'}
        description="Confirm the commercial award, generate the legal agreement, and collect the carrier’s electronic signature."
        action={signed ? <span className="rfpflow-complete"><CircleCheckBig size={16} /> Complete</span> : undefined}
      />
      <section className="rfpflow-award">
        <div className="rfpflow-card">
          <CardHead title="Award summary" note="Selected carrier and commitment" />
          <div className="rfpflow-winner">
            <i><Building2 size={20} /></i>
            <span><SourceBadge source={winner.source} /><strong>{winner.name}</strong><em>{winner.mc}</em></span>
            <Confidence score={winner.confidence} large />
          </div>
          <div className="rfpflow-award-facts">
            <span><em>Awarded lanes</em><strong>{winner.lanes}</strong></span>
            <span><em>Committed volume</em><strong>{winner.volume} / week</strong></span>
            <span><em>Contract rate</em><strong>${winner.bidRate?.toLocaleString()}</strong></span>
            <span><em>Term</em><strong>12 months</strong></span>
            <span><em>Effective date</em><strong>Oct 01, 2026</strong></span>
            <span><em>Estimated value</em><strong>${(((winner.bidRate ?? 0) * winner.volume * 52) / 1_000_000).toFixed(2)}M</strong></span>
          </div>
          <div className="rfpflow-award-note">
            <ShieldCheck size={16} />
            <span><strong>Execution commitment</strong><em>{winner.name} agrees to cover {winner.volume} loads per week across {winner.lanes} awarded lanes, subject to the service-level terms in the agreement.</em></span>
          </div>
        </div>

        <aside className="rfpflow-card rfpflow-contract">
          <CardHead title="Carrier agreement" note={signed ? 'All signatures collected' : 'Ready for electronic signature'}>
            <FileCheck2 size={16} />
          </CardHead>
          <div className="rfpflow-document">
            <FileSignature size={28} />
            <strong>FY27_Carrier_Agreement_{winner.name.split(' ')[0]}.pdf</strong>
            <span>14 pages · generated Aug 22, 2026</span>
            <button type="button" onClick={onReview}><PenLine size={13} /> {documentOpen ? 'Close agreement' : 'Review agreement'}</button>
          </div>
          {documentOpen && (
            <div className="rfpflow-terms">
              <strong>Agreement terms</strong>
              <span><b>1.</b> Carrier commits to {winner.volume} loads per week across {winner.lanes} awarded lanes.</span>
              <span><b>2.</b> Contract rate is ${winner.bidRate?.toLocaleString()} per load, inclusive of the agreed fuel program.</span>
              <span><b>3.</b> Minimum service level: 95% acceptance and 95% on-time delivery.</span>
              <span><b>4.</b> Either party may request a volume review with 30 days written notice.</span>
            </div>
          )}
          <div className="rfpflow-signers">
            <Signer name="Mandeep Singh" role="Charger Logistics · Authorized signer" done />
            <Signer name="Antonio Reyes" role={`${winner.name} · Authorized signer`} done={signed} />
          </div>
          {!signed ? (
            <button className="rfpflow-primary rfpflow-sign" onClick={onSign}><FileSignature size={14} /> Send and simulate e-signature</button>
          ) : (
            <div className="rfpflow-signed"><CircleCheckBig size={18} /><span><strong>Agreement executed</strong><em>Signed Aug 22, 2026 · Audit trail saved</em></span></div>
          )}
        </aside>
      </section>
    </>
  )
}

function StageHeader({ kicker, title, description, action }: { kicker: string; title: string; description: string; action?: ReactNode }) {
  return <section className="rfpflow-head"><div><span>{kicker}</span><h2>{title}</h2><p>{description}</p></div>{action && <aside>{action}</aside>}</section>
}

function CardHead({ title, note, children }: { title: string; note: string; children?: ReactNode }) {
  return <header className="rfpflow-card__head"><div><strong>{title}</strong><span>{note}</span></div>{children}</header>
}

function Metric({ label, value, note, tone }: { label: string; value: string; note: string; tone?: 'danger' | 'action' | 'good' }) {
  return <article className={cn('rfpflow-metric', tone && `is-${tone}`)}><em>{label}</em><strong>{value}</strong><span>{note}</span></article>
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="rfpflow-field"><span>{label}</span>{children}</label>
}

function SourceBadge({ source }: { source: Source }) {
  const color = getColorByType(tagColors, SOURCE_STATUS_TYPE[source])?.hex ?? '#64748B'
  return <span className="rfpflow-source" style={{ '--source': color } as CSSProperties}><i />{source}</span>
}

function Status({ status }: { status: InviteStatus }) {
  return <span className={`rfpflow-status is-${status.toLowerCase()}`}>{status}</span>
}

function Confidence({ score, large }: { score: number; large?: boolean }) {
  const tone = score >= 85 ? 'good' : score >= 70 ? 'watch' : 'danger'
  return <span className={cn('rfpflow-confidence', `is-${tone}`, large && 'is-large')}><b>{score}</b><span><i style={{ width: `${score}%` }} /></span><em>{score >= 85 ? 'High' : score >= 70 ? 'Workable' : 'Thin'}</em></span>
}

function Signer({ name, role, done }: { name: string; role: string; done: boolean }) {
  return <div className={cn('rfpflow-signer', done && 'is-done')}><i>{done ? <Check size={13} /> : <Clock3 size={13} />}</i><span><strong>{name}</strong><em>{role}</em></span><b>{done ? 'Signed' : 'Awaiting signature'}</b></div>
}
