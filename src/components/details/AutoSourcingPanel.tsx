import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Award,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Gauge,
  Layers,
  Loader2,
  Mail,
  MessageCircle,
  Plus,
  RadioTower,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import type { BidOffer, LoadDetail } from '@/data/loadDetail'

export type AutoMode = 'sourcing' | 'tender' | 'award'

export const AUTO_MODE_LABEL: Record<AutoMode, string> = {
  sourcing: 'Auto Sourcing',
  tender: 'Auto Tender',
  award: 'Auto Award',
}

/* ── Mock outreach counts ── */
const INTERNAL_EMAIL = 25
const INTERNAL_WA = 20
const HIGHWAY_CARRIERS = 32
const UNIQUE_CONTACTS = 30

type ChannelId = 'internal' | 'highway' | 'email' | 'whatsapp' | 'dat' | 'loadlink'

const CHANNEL_META: Record<ChannelId, { label: string; hint: string; icon: typeof Mail }> = {
  internal: { label: 'Internal carrier base', hint: '45 approved carriers', icon: Users },
  highway: { label: 'Highway-sourced carriers', hint: `${HIGHWAY_CARRIERS} verified via Highway`, icon: ShieldCheck },
  email: { label: 'Blast email', hint: `${INTERNAL_EMAIL} with verified email`, icon: Mail },
  whatsapp: { label: 'Blast WhatsApp', hint: `${INTERNAL_WA} WhatsApp enabled`, icon: MessageCircle },
  dat: { label: 'Post to DAT', hint: 'Auto-refresh every 20 min', icon: RadioTower },
  loadlink: { label: 'Post to Loadlink', hint: 'Load board posting', icon: RadioTower },
}

type SourcingRule = {
  id: string
  name: string
  description: string
  channels: ChannelId[]
  custom?: boolean
}

const PRESET_RULES: SourcingRule[] = [
  {
    id: 'internal-only',
    name: 'Internal carriers only',
    description: 'Blast email + WhatsApp to our approved carrier base. No public boards.',
    channels: ['internal', 'email', 'whatsapp'],
  },
  {
    id: 'internal-dat',
    name: 'Internal + DAT',
    description: 'Blast the internal base and post to DAT only.',
    channels: ['internal', 'email', 'dat'],
  },
  {
    id: 'max-reach',
    name: 'Maximum reach',
    description: 'Internal base, Highway-sourced carriers, DAT and Loadlink — everything.',
    channels: ['internal', 'highway', 'email', 'whatsapp', 'dat', 'loadlink'],
  },
]

/* ── Carrier intelligence (deterministic mock) ── */
function seedOf(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

type CarrierIntel = {
  rating: number
  highwayVerified: boolean
  onboarding: 'Complete' | 'Pending'
  monitoringAlerts: number
}

function intelFor(name: string): CarrierIntel {
  const seed = seedOf(name)
  return {
    rating: Math.round((3.5 + ((seed >> 3) % 15) / 10) * 10) / 10,
    highwayVerified: seed % 3 !== 0,
    onboarding: seed % 4 === 0 ? 'Pending' : 'Complete',
    monitoringAlerts: seed % 5 === 0 ? 1 : 0,
  }
}

function moneyToNumber(v?: string) {
  if (!v) return NaN
  return Number(v.replace(/[^0-9.]/g, ''))
}

type ScoredOffer = {
  bid: BidOffer
  intel: CarrierIntel
  allIn: number
  score: number
  overLimit: boolean
  reasons: string[]
}

function scoreOffers(bids: BidOffer[], hardLimit: number): ScoredOffer[] {
  const scored = bids.map((bid) => {
    const intel = intelFor(bid.carrier)
    const allIn = moneyToNumber(bid.allIn ?? bid.amount)
    const overLimit = hardLimit > 0 && allIn > hardLimit
    const rateScore =
      hardLimit > 0 && Number.isFinite(allIn)
        ? Math.max(0, Math.min(34, ((hardLimit - allIn) / hardLimit) * 260))
        : 15
    const score = overLimit
      ? 0
      : Math.min(
          100,
          Math.round(
            rateScore +
              intel.rating * 8 +
              (intel.highwayVerified ? 12 : 0) +
              (intel.onboarding === 'Complete' ? 8 : 0) -
              intel.monitoringAlerts * 15
          )
        )
    const reasons: string[] = []
    if (overLimit) reasons.push(`All-in $${allIn.toLocaleString()} exceeds hard limit`)
    else {
      if (hardLimit > 0 && allIn < hardLimit)
        reasons.push(`$${(hardLimit - allIn).toLocaleString()} under max buy`)
      reasons.push(`${intel.rating.toFixed(1)}★ carrier rating`)
      if (intel.highwayVerified) reasons.push('Highway identity verified')
      else reasons.push('Not Highway verified')
      reasons.push(
        intel.onboarding === 'Complete' ? 'Onboarding complete' : 'Onboarding pending'
      )
      if (intel.monitoringAlerts > 0) reasons.push(`${intel.monitoringAlerts} open monitoring alert`)
    }
    return { bid, intel, allIn, score, overLimit, reasons }
  })
  return scored.sort((a, b) => b.score - a.score)
}

type TaskState = 'queued' | 'running' | 'done' | 'failed'

type RunTask = {
  id: string
  label: string
  result: string
  failResult?: string
  state: TaskState
}

/* ── Yes / No confirmation popup ── */
export function AutoSourcingConfirm({
  mode,
  probill,
  missingCount,
  offerCount,
  onYes,
  onNo,
}: {
  mode: AutoMode
  probill: string
  missingCount: number
  offerCount: number
  onYes: () => void
  onNo: () => void
}) {
  const label = AUTO_MODE_LABEL[mode]
  const Icon = mode === 'sourcing' ? Zap : mode === 'tender' ? Gauge : Award
  return (
    <div className="dd-modal-root" role="dialog" aria-modal="true" aria-labelledby="dd-auto-confirm-title">
      <button type="button" className="dd-modal-backdrop" aria-label="Close" onClick={onNo} />
      <div className="dd-modal dd-auto-confirm">
        <div className="dd-auto-confirm__icon">
          <Icon size={22} />
        </div>
        <h3 id="dd-auto-confirm-title">Run {label}?</h3>
        {mode === 'sourcing' ? (
          <p>
            Auto Sourcing will check missing data points on <strong>{probill}</strong>
            {missingCount > 0 ? (
              <>
                {' '}
                (<strong>{missingCount}</strong> found), let you fix them in one place, then run your
                automation rule — carrier blasts and board postings — from a single screen.
              </>
            ) : (
              <> — all required data is present. Pick an automation rule and run everything from one screen.</>
            )}
          </p>
        ) : mode === 'tender' ? (
          <p>
            Sourcing is done on <strong>{probill}</strong>. Auto Tender will analyze all{' '}
            <strong>{offerCount}</strong> offers — rate vs your max buy hard limit, carrier rating,
            Highway data, onboarding and monitoring — and suggest which offer to accept.
          </p>
        ) : (
          <p>
            <strong>{probill}</strong> is at the award stage. Auto Award will run final checks across{' '}
            <strong>{offerCount}</strong> offers — hard limit, carrier rating, Highway identity,
            onboarding and monitoring — and suggest the carrier to award.
          </p>
        )}
        <div className="dd-auto-confirm__actions">
          <button type="button" className="dd-btn" onClick={onNo}>
            No, not now
          </button>
          <button type="button" className="dd-btn dd-btn--primary" onClick={onYes}>
            <Sparkles size={14} />
            Yes, run {label}
          </button>
        </div>
        <span className="dd-auto-confirm__note">Mock workflow · no live sends, tenders or awards</span>
      </div>
    </div>
  )
}

/* ── Result popup (shown when a run finishes) ── */
function ResultPopup({
  title,
  lines,
  primaryLabel,
  onPrimary,
  onClose,
  tone = 'success',
}: {
  title: string
  lines: string[]
  primaryLabel: string
  onPrimary: () => void
  onClose: () => void
  tone?: 'success' | 'warn'
}) {
  return (
    <div className="dd-modal-root dd-auto-result-root" role="dialog" aria-modal="true">
      <button type="button" className="dd-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="dd-modal dd-auto-result">
        <div className={cn('dd-auto-result__icon', tone === 'warn' && 'is-warn')}>
          {tone === 'warn' ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
        </div>
        <h3>{title}</h3>
        <ul>
          {lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <div className="dd-auto-confirm__actions">
          <button type="button" className="dd-btn" onClick={onClose}>
            Stay here
          </button>
          <button type="button" className="dd-btn dd-btn--primary" onClick={onPrimary}>
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main panel ── */
export function AutoSourcingPanel({
  detail,
  mode,
  onClose,
  onApplyRates,
  onGoFindPost,
}: {
  detail: LoadDetail
  mode: AutoMode
  onClose: () => void
  onApplyRates: (patch: Partial<Pick<LoadDetail, 'maxBuy' | 'bookNowRate' | 'rejectAbove'>>) => void
  onGoFindPost: () => void
}) {
  const maxMissing = !detail.maxBuy || detail.maxBuy === '—' || detail.maxBuy === '$0.00'
  const bookMissing = !detail.bookNowRate || detail.bookNowRate === '—'

  /* shared */
  const [popup, setPopup] = useState<{ title: string; lines: string[]; tone?: 'success' | 'warn' } | null>(null)

  /* sourcing flow */
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [ruleId, setRuleId] = useState<string>(PRESET_RULES[2].id)
  const [customChannels, setCustomChannels] = useState<Set<ChannelId>>(
    () => new Set<ChannelId>(['internal', 'email', 'dat'])
  )
  const [maxBuy, setMaxBuy] = useState(maxMissing ? '' : detail.maxBuy.replace(/[^0-9.]/g, ''))
  const [bookNow, setBookNow] = useState(bookMissing ? '' : detail.bookNowRate.replace(/[^0-9.]/g, ''))
  const [bookTouched, setBookTouched] = useState(!bookMissing)
  const [tasks, setTasks] = useState<RunTask[]>([])
  const popupShown = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* tender / award flow */
  const [analysis, setAnalysis] = useState<'idle' | 'running' | 'done'>('idle')
  const [analysisStep, setAnalysisStep] = useState(0)

  const maxNum = Number(maxBuy)
  const maxOk = Boolean(maxBuy) && !Number.isNaN(maxNum) && maxNum > 0
  const suggestedBook = maxOk ? (maxNum * 0.925).toFixed(2) : ''
  const bookVal = bookTouched && bookNow ? bookNow : suggestedBook
  const dataReady = maxOk && Boolean(bookVal)

  const rule: SourcingRule =
    ruleId === 'custom'
      ? {
          id: 'custom',
          name: 'Custom rule',
          description: 'Your own channel mix for this run.',
          channels: [...customChannels],
          custom: true,
        }
      : PRESET_RULES.find((r) => r.id === ruleId)!

  const channels = new Set(rule.channels)
  const blastPicked = channels.has('email') || channels.has('whatsapp')

  const checks = useMemo(
    () => [
      {
        label: 'Customer rate',
        ok: detail.load.fee > 0,
        note: `$${detail.load.fee.toFixed(2)} ${detail.currency}`,
      },
      { label: 'Equipment', ok: Boolean(detail.load.equipment), note: detail.load.equipment },
      {
        label: 'Max buy — hard limit',
        ok: maxOk,
        note: maxOk ? `$${maxNum.toFixed(2)} ${detail.currency} · never exceeded` : 'Required · hard ceiling for all offers',
      },
      {
        label: 'Book now rate',
        ok: Boolean(bookVal),
        note: bookVal ? `$${Number(bookVal).toFixed(2)} auto-accept` : 'Required · auto-accept rate',
      },
    ],
    [detail, maxOk, maxNum, bookVal]
  )
  const missingNow = checks.filter((c) => !c.ok).length

  const buildTasks = (): RunTask[] => {
    const list: RunTask[] = [
      {
        id: 'rates',
        label: 'Apply rates to order',
        result: `Max buy $${maxNum.toFixed(2)} (hard limit) · Book now $${Number(bookVal).toFixed(2)}`,
        state: 'queued',
      },
    ]
    if (channels.has('email'))
      list.push({
        id: 'blast_email',
        label: 'Blast email — internal base',
        result: `Sent to ${INTERNAL_EMAIL} carriers`,
        state: 'queued',
      })
    if (channels.has('whatsapp'))
      list.push({
        id: 'blast_whatsapp',
        label: 'Blast WhatsApp — internal base',
        result: `Sent to ${INTERNAL_WA} carriers`,
        state: 'queued',
      })
    if (channels.has('highway'))
      list.push({
        id: 'highway',
        label: 'Outreach Highway-sourced carriers',
        result: `${HIGHWAY_CARRIERS} verified carriers contacted`,
        state: 'queued',
      })
    if (channels.has('dat'))
      list.push({
        id: 'post_dat',
        label: 'Post to DAT',
        result: 'Posted · repost every 20 min',
        state: 'queued',
      })
    if (channels.has('loadlink'))
      list.push({
        id: 'post_loadlink',
        label: 'Post to Loadlink',
        result: 'Posted to Loadlink',
        failResult: 'Failed · Loadlink session expired',
        state: 'queued',
      })
    return list
  }

  const summaryLines = () => {
    const lines: string[] = []
    if (channels.has('email')) lines.push(`Blast email sent to ${INTERNAL_EMAIL} carriers`)
    if (channels.has('whatsapp')) lines.push(`Blast WhatsApp sent to ${INTERNAL_WA} carriers`)
    if (blastPicked) lines.push(`${UNIQUE_CONTACTS} unique contacts reached`)
    if (channels.has('highway')) lines.push(`${HIGHWAY_CARRIERS} Highway-sourced carriers contacted`)
    if (channels.has('dat')) lines.push('Load posted to DAT')
    if (channels.has('loadlink'))
      lines.push(
        tasks.find((t) => t.id === 'post_loadlink')?.state === 'done'
          ? 'Load posted to Loadlink'
          : 'Loadlink posting failed — retry available'
      )
    lines.push(`Rates applied — max buy $${maxNum.toFixed(2)}, book now $${Number(bookVal || 0).toFixed(2)}`)
    return lines
  }

  const startRun = () => {
    onApplyRates({
      maxBuy: `$${maxNum.toFixed(2)}`,
      bookNowRate: `$${Number(bookVal).toFixed(2)}`,
      rejectAbove: `$${(maxNum * 1.08).toFixed(2)}`,
    })
    popupShown.current = false
    setTasks(buildTasks())
    setStep(3)
  }

  /* advance the mock run one task at a time */
  useEffect(() => {
    if (mode !== 'sourcing' || step !== 3) return
    const idx = tasks.findIndex((t) => t.state === 'queued' || t.state === 'running')
    if (idx === -1) {
      if (tasks.length > 0 && !popupShown.current) {
        popupShown.current = true
        const failed = tasks.some((t) => t.state === 'failed')
        setPopup({
          title: failed ? 'Auto Sourcing finished with issues' : 'Auto Sourcing complete',
          lines: summaryLines(),
          tone: failed ? 'warn' : 'success',
        })
      }
      return
    }
    if (tasks[idx].state === 'queued') {
      setTasks((prev) => prev.map((t, i) => (i === idx ? { ...t, state: 'running' } : t)))
      return
    }
    timerRef.current = setTimeout(() => {
      setTasks((prev) =>
        prev.map((t, i) => (i === idx ? { ...t, state: t.failResult ? 'failed' : 'done' } : t))
      )
    }, 850)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, step, tasks])

  const retryTask = (id: string) => {
    popupShown.current = true /* don't re-popup after retry */
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, failResult: undefined, state: 'running' } : t))
    )
  }

  /* tender / award analysis run */
  const ANALYSIS_STEPS = [
    'Pulling offers & bids',
    'Checking Highway identity & authority',
    'Checking onboarding & monitoring tools',
    'Scoring against max buy hard limit',
  ]

  useEffect(() => {
    if (analysis !== 'running') return
    if (analysisStep >= ANALYSIS_STEPS.length) {
      setAnalysis('done')
      return
    }
    const t = setTimeout(() => setAnalysisStep((s) => s + 1), 620)
    return () => clearTimeout(t)
  }, [analysis, analysisStep, ANALYSIS_STEPS.length])

  const scored = useMemo(
    () => (analysis === 'done' ? scoreOffers(detail.bids, maxOk ? maxNum : 0) : []),
    [analysis, detail.bids, maxOk, maxNum]
  )
  const recommended = scored.find((s) => !s.overLimit)

  const running = tasks.some((t) => t.state === 'queued' || t.state === 'running')
  const failCount = tasks.filter((t) => t.state === 'failed').length
  const modeLabel = AUTO_MODE_LABEL[mode]

  return (
    <>
      <button
        type="button"
        className="dd-auto-panel-shade"
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside className="dd-auto-panel" role="dialog" aria-label={modeLabel}>
        <header className="dd-auto-panel__head">
          <div className="dd-auto-panel__title">
            {mode === 'sourcing' ? <Zap size={16} /> : mode === 'tender' ? <Gauge size={16} /> : <Award size={16} />}
            <div>
              <strong>{modeLabel}</strong>
              <span>
                {detail.load.id} · {detail.load.origin} → {detail.load.destination} ·{' '}
                {detail.load.equipment}
              </span>
            </div>
          </div>
          <div className="dd-auto-panel__head-right">
            <span className="dd-auto-phase">Phase 1 · single order</span>
            <button type="button" className="dd-icon-btn dd-icon-btn--light" aria-label="Close" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="dd-auto-panel__cols">
          {/* ── main workflow column ── */}
          <div className="dd-auto-panel__mainc">
            {mode === 'sourcing' && (
              <div className="dd-auto-steps">
                {(
                  [
                    [1, 'Automation rule'],
                    [2, 'Data & limits'],
                    [3, 'Run & results'],
                  ] as const
                ).map(([n, label]) => (
                  <div
                    key={n}
                    className={cn('dd-auto-steps__item', step === n && 'is-active', step > n && 'is-done')}
                  >
                    <i>{step > n ? <Check size={11} /> : n}</i>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="dd-auto-panel__body">
              {/* ── SOURCING · step 1: rules ── */}
              {mode === 'sourcing' && step === 1 && (
                <>
                  <p className="dd-auto-panel__intro">
                    Choose what this run should do. Rules are reusable — create your own mix of
                    carrier reach and load boards.
                  </p>
                  <div className="dd-auto-rules">
                    {PRESET_RULES.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className={cn('dd-auto-rule', ruleId === r.id && 'is-on')}
                        onClick={() => setRuleId(r.id)}
                      >
                        <div className="dd-auto-rule__head">
                          <strong>{r.name}</strong>
                          <i className="dd-auto-action__tick">{ruleId === r.id && <Check size={12} />}</i>
                        </div>
                        <span>{r.description}</span>
                        <div className="dd-auto-rule__chips">
                          {r.channels.map((c) => (
                            <em key={c}>{CHANNEL_META[c].label}</em>
                          ))}
                        </div>
                      </button>
                    ))}

                    <button
                      type="button"
                      className={cn('dd-auto-rule dd-auto-rule--custom', ruleId === 'custom' && 'is-on')}
                      onClick={() => setRuleId('custom')}
                    >
                      <div className="dd-auto-rule__head">
                        <strong>
                          <Plus size={13} />
                          Create your own rule
                        </strong>
                        <i className="dd-auto-action__tick">{ruleId === 'custom' && <Check size={12} />}</i>
                      </div>
                      <span>Pick exactly which channels this run uses.</span>
                      {ruleId === 'custom' && (
                        <div className="dd-auto-rule__picker" role="group">
                          {(Object.keys(CHANNEL_META) as ChannelId[]).map((c) => {
                            const on = customChannels.has(c)
                            const Icon = CHANNEL_META[c].icon
                            return (
                              <span
                                key={c}
                                role="checkbox"
                                aria-checked={on}
                                tabIndex={0}
                                className={cn('dd-auto-chan', on && 'is-on')}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setCustomChannels((prev) => {
                                    const next = new Set(prev)
                                    if (next.has(c)) next.delete(c)
                                    else next.add(c)
                                    return next
                                  })
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setCustomChannels((prev) => {
                                      const next = new Set(prev)
                                      if (next.has(c)) next.delete(c)
                                      else next.add(c)
                                      return next
                                    })
                                  }
                                }}
                              >
                                <Icon size={13} />
                                {CHANNEL_META[c].label}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* ── SOURCING · step 2: data & limits ── */}
              {mode === 'sourcing' && step === 2 && (
                <>
                  <p className="dd-auto-panel__intro">
                    {missingNow > 0 ? (
                      <>
                        <strong>{missingNow}</strong> data point{missingNow === 1 ? ' is' : 's are'} missing.
                        Max buy is a <strong>hard limit</strong> — no offer or auto-accept can ever exceed it.
                      </>
                    ) : (
                      <>All required data points are present. Max buy acts as a hard limit for the whole run.</>
                    )}
                  </p>

                  <div className="dd-auto-checks dd-auto-checks--grid">
                    {checks.map((c) => (
                      <div key={c.label} className={cn('dd-auto-check', !c.ok && 'is-missing')}>
                        {c.ok ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                        <div>
                          <strong>{c.label}</strong>
                          <span>{c.note}</span>
                        </div>
                        <em>{c.ok ? 'OK' : 'Missing'}</em>
                      </div>
                    ))}
                  </div>

                  <div className="dd-auto-fields">
                    <label>
                      Max buy — hard limit ({detail.currency})
                      <input
                        value={maxBuy}
                        placeholder="0.00"
                        inputMode="decimal"
                        onChange={(e) => setMaxBuy(e.target.value.replace(/[^0-9.]/g, ''))}
                      />
                      <span>Auto Sourcing will never offer above this.</span>
                    </label>
                    <label>
                      Book now rate ({detail.currency})
                      <input
                        value={bookVal}
                        placeholder={maxOk ? suggestedBook : '0.00'}
                        inputMode="decimal"
                        onChange={(e) => {
                          setBookTouched(true)
                          setBookNow(e.target.value.replace(/[^0-9.]/g, ''))
                        }}
                      />
                      <span>Suggested: max buy − 7.5%</span>
                    </label>
                  </div>
                </>
              )}

              {/* ── SOURCING · step 3: run ── */}
              {mode === 'sourcing' && step === 3 && (
                <>
                  <p className="dd-auto-panel__intro">
                    {running ? (
                      <>
                        Running <strong>{rule.name}</strong> — stay on this screen, results pop up when done.
                      </>
                    ) : failCount > 0 ? (
                      <>
                        Finished with <strong>{failCount}</strong> failure{failCount === 1 ? '' : 's'}. Retry
                        below or continue.
                      </>
                    ) : (
                      <>All actions completed successfully.</>
                    )}
                  </p>

                  <div className="dd-auto-run">
                    {tasks.map((t) => (
                      <div
                        key={t.id}
                        className={cn(
                          'dd-auto-run__item',
                          t.state === 'done' && 'is-done',
                          t.state === 'failed' && 'is-failed',
                          t.state === 'running' && 'is-running'
                        )}
                      >
                        <i>
                          {t.state === 'done' && <CheckCircle2 size={15} />}
                          {t.state === 'failed' && <AlertTriangle size={15} />}
                          {t.state === 'running' && <Loader2 size={15} className="dd-auto-spin" />}
                          {t.state === 'queued' && <span className="dd-auto-run__dot" />}
                        </i>
                        <div>
                          <strong>{t.label}</strong>
                          <span>
                            {t.state === 'queued' && 'Queued'}
                            {t.state === 'running' && 'Running…'}
                            {t.state === 'done' && t.result}
                            {t.state === 'failed' && (t.failResult ?? 'Failed')}
                          </span>
                        </div>
                        {t.state === 'failed' && (
                          <button type="button" className="dd-auto-retry" onClick={() => retryTask(t.id)}>
                            <RotateCcw size={12} />
                            Retry
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── TENDER / AWARD ── */}
              {mode !== 'sourcing' && (
                <>
                  <p className="dd-auto-panel__intro">
                    {modeLabel} analyzes every offer on this order — rate vs your hard limit, carrier
                    rating, Highway data, onboarding and monitoring — and suggests which one to accept.
                  </p>

                  {analysis === 'idle' && (
                    <div className="dd-auto-analyze">
                      <label className="dd-auto-analyze__limit">
                        Max buy — hard limit ({detail.currency})
                        <input
                          value={maxBuy}
                          placeholder="0.00"
                          inputMode="decimal"
                          onChange={(e) => setMaxBuy(e.target.value.replace(/[^0-9.]/g, ''))}
                        />
                        <span>Offers above this are excluded automatically.</span>
                      </label>
                      <button
                        type="button"
                        className="dd-btn dd-btn--primary"
                        disabled={!maxOk}
                        onClick={() => {
                          onApplyRates({ maxBuy: `$${maxNum.toFixed(2)}` })
                          setAnalysisStep(0)
                          setAnalysis('running')
                        }}
                      >
                        <Sparkles size={14} />
                        Analyze {detail.bids.length} offers
                      </button>
                    </div>
                  )}

                  {analysis === 'running' && (
                    <div className="dd-auto-run">
                      {ANALYSIS_STEPS.map((label, i) => (
                        <div
                          key={label}
                          className={cn(
                            'dd-auto-run__item',
                            i < analysisStep && 'is-done',
                            i === analysisStep && 'is-running'
                          )}
                        >
                          <i>
                            {i < analysisStep && <CheckCircle2 size={15} />}
                            {i === analysisStep && <Loader2 size={15} className="dd-auto-spin" />}
                            {i > analysisStep && <span className="dd-auto-run__dot" />}
                          </i>
                          <div>
                            <strong>{label}</strong>
                            <span>{i < analysisStep ? 'Done' : i === analysisStep ? 'Running…' : 'Queued'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {analysis === 'done' && (
                    <div className="dd-auto-offers">
                      {scored.map((s, rank) => {
                        const isRec = recommended === s
                        return (
                          <article
                            key={s.bid.id}
                            className={cn(
                              'dd-auto-offer',
                              isRec && 'is-recommended',
                              s.overLimit && 'is-excluded'
                            )}
                          >
                            {isRec && (
                              <div className="dd-auto-offer__banner">
                                <BadgeCheck size={13} />
                                Suggested — accept this offer
                              </div>
                            )}
                            <div className="dd-auto-offer__row">
                              <div className="dd-auto-offer__who">
                                <strong>{s.bid.carrier}</strong>
                                <span>
                                  MC {s.bid.mc} · {s.bid.source ?? '—'} · {s.bid.loads ?? 0} loads with us
                                </span>
                              </div>
                              <div className="dd-auto-offer__rate">
                                <strong>{s.bid.allIn ?? s.bid.amount}</strong>
                                <span>{s.bid.rpm ?? s.bid.amount} / mi</span>
                              </div>
                              <div className={cn('dd-auto-offer__score', s.overLimit && 'is-zero')}>
                                {s.overLimit ? (
                                  <span>Excluded</span>
                                ) : (
                                  <>
                                    <strong>{s.score}</strong>
                                    <span>score</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="dd-auto-offer__facts">
                              <em className={cn(!s.overLimit && 'is-good')}>
                                <Star size={11} />
                                {s.intel.rating.toFixed(1)} rating
                              </em>
                              <em className={cn(s.intel.highwayVerified ? 'is-good' : 'is-bad')}>
                                <ShieldCheck size={11} />
                                {s.intel.highwayVerified ? 'Highway verified' : 'Not Highway verified'}
                              </em>
                              <em className={cn(s.intel.onboarding === 'Complete' ? 'is-good' : 'is-warn')}>
                                <Layers size={11} />
                                Onboarding {s.intel.onboarding.toLowerCase()}
                              </em>
                              <em className={cn(s.intel.monitoringAlerts === 0 ? 'is-good' : 'is-bad')}>
                                <Gauge size={11} />
                                {s.intel.monitoringAlerts === 0
                                  ? 'Monitoring clear'
                                  : `${s.intel.monitoringAlerts} monitoring alert`}
                              </em>
                              {s.overLimit && (
                                <em className="is-bad">
                                  <AlertTriangle size={11} />
                                  Over ${maxNum.toLocaleString()} hard limit
                                </em>
                              )}
                            </div>
                            <div className="dd-auto-offer__why">{s.reasons.join(' · ')}</div>
                            {rank === 0 && !s.overLimit && (
                              <button
                                type="button"
                                className="dd-btn dd-btn--primary dd-auto-offer__accept"
                                onClick={() =>
                                  setPopup({
                                    title: `${modeLabel}: offer accepted (mock)`,
                                    lines: [
                                      `${s.bid.carrier} — ${s.bid.allIn ?? s.bid.amount} all-in`,
                                      ...s.reasons,
                                      'No live tender was sent · mock only',
                                    ],
                                  })
                                }
                              >
                                <Check size={14} />
                                Accept suggestion
                              </button>
                            )}
                          </article>
                        )
                      })}
                      {!recommended && (
                        <div className="dd-auto-offers__none">
                          <AlertTriangle size={15} />
                          No offer clears the hard limit — raise the max buy or keep sourcing.
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <footer className="dd-auto-panel__foot">
              {mode === 'sourcing' && step === 1 && (
                <>
                  <button type="button" className="dd-btn" onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="dd-btn dd-btn--primary"
                    disabled={rule.channels.length === 0}
                    onClick={() => setStep(2)}
                  >
                    Continue
                    <ChevronRight size={14} />
                  </button>
                </>
              )}
              {mode === 'sourcing' && step === 2 && (
                <>
                  <button type="button" className="dd-btn" onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button type="button" className="dd-btn dd-btn--primary" disabled={!dataReady} onClick={startRun}>
                    <Zap size={14} />
                    Run {rule.name}
                  </button>
                </>
              )}
              {mode === 'sourcing' && step === 3 && (
                <>
                  <button type="button" className="dd-btn" disabled={running} onClick={onGoFindPost}>
                    Open Find &amp; Post
                  </button>
                  <button type="button" className="dd-btn dd-btn--primary" disabled={running} onClick={onClose}>
                    <Check size={14} />
                    Done
                  </button>
                </>
              )}
              {mode !== 'sourcing' && (
                <>
                  <button type="button" className="dd-btn" onClick={onClose}>
                    Close
                  </button>
                  {analysis === 'done' && (
                    <button
                      type="button"
                      className="dd-btn"
                      onClick={() => {
                        setAnalysis('idle')
                        setAnalysisStep(0)
                      }}
                    >
                      <RotateCcw size={13} />
                      Re-run analysis
                    </button>
                  )}
                </>
              )}
            </footer>
          </div>

          {/* ── context rail ── */}
          <aside className="dd-auto-ctx">
            <section>
              <h4>Order</h4>
              <dl>
                <div>
                  <dt>Probill</dt>
                  <dd>{detail.load.id}</dd>
                </div>
                <div>
                  <dt>Lane</dt>
                  <dd>
                    {detail.load.origin} → {detail.load.destination}
                  </dd>
                </div>
                <div>
                  <dt>Equipment</dt>
                  <dd>{detail.load.equipment}</dd>
                </div>
                <div>
                  <dt>Miles</dt>
                  <dd>{detail.load.miles.toLocaleString()} mi</dd>
                </div>
                <div>
                  <dt>Customer rate</dt>
                  <dd>
                    ${detail.load.fee.toFixed(2)} {detail.currency}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="dd-auto-ctx__limit">
              <h4>Hard limit</h4>
              <strong>{maxOk ? `$${maxNum.toFixed(2)} ${detail.currency}` : 'Not set'}</strong>
              <p>Max buy is enforced on every blast, post and suggestion in this run.</p>
            </section>

            {mode === 'sourcing' && (
              <section>
                <h4>This run</h4>
                <div className="dd-auto-ctx__chips">
                  {rule.channels.map((c) => (
                    <em key={c}>{CHANNEL_META[c].label}</em>
                  ))}
                  {rule.channels.length === 0 && <p>No channels selected yet.</p>}
                </div>
              </section>
            )}

            {mode !== 'sourcing' && (
              <section>
                <h4>Signals used</h4>
                <div className="dd-auto-ctx__chips">
                  <em>Rate vs hard limit</em>
                  <em>Carrier rating</em>
                  <em>Highway identity</em>
                  <em>Onboarding status</em>
                  <em>Monitoring alerts</em>
                </div>
              </section>
            )}

            <section className="dd-auto-ctx__scope">
              <h4>Scope</h4>
              <p>Runs on this order only.</p>
              <button type="button" disabled>
                Run on multiple orders — Phase 2
              </button>
            </section>
          </aside>
        </div>
      </aside>

      {popup && (
        <ResultPopup
          title={popup.title}
          lines={popup.lines}
          tone={popup.tone}
          primaryLabel={mode === 'sourcing' ? 'Open Find & Post' : 'Done'}
          onPrimary={() => {
            setPopup(null)
            if (mode === 'sourcing') onGoFindPost()
            else onClose()
          }}
          onClose={() => setPopup(null)}
        />
      )}
    </>
  )
}
