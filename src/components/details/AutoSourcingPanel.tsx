import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Mail,
  MessageCircle,
  RadioTower,
  RotateCcw,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import type { LoadDetail } from '@/data/loadDetail'

/* ── Mock outreach counts (network-level, not just visible grid) ── */
const EMAIL_TARGETS = 25
const WA_TARGETS = 20
const UNIQUE_CONTACTS = 30

type ActionId = 'blast_email' | 'blast_whatsapp' | 'post_dat' | 'post_loadlink'

const ACTIONS: {
  id: ActionId
  label: string
  hint: string
  icon: typeof Mail
}[] = [
  {
    id: 'blast_email',
    label: 'Blast email',
    hint: `${EMAIL_TARGETS} carriers with verified email`,
    icon: Mail,
  },
  {
    id: 'blast_whatsapp',
    label: 'Blast WhatsApp',
    hint: `${WA_TARGETS} carriers with WhatsApp enabled`,
    icon: MessageCircle,
  },
  {
    id: 'post_dat',
    label: 'Post to DAT',
    hint: 'Load board posting · auto-refresh 20 min',
    icon: RadioTower,
  },
  {
    id: 'post_loadlink',
    label: 'Post to Loadlink',
    hint: 'Load board posting · mock session',
    icon: RadioTower,
  },
]

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
  probill,
  missingCount,
  onYes,
  onNo,
}: {
  probill: string
  missingCount: number
  onYes: () => void
  onNo: () => void
}) {
  return (
    <div className="dd-modal-root" role="dialog" aria-modal="true" aria-labelledby="dd-auto-confirm-title">
      <button type="button" className="dd-modal-backdrop" aria-label="Close" onClick={onNo} />
      <div className="dd-modal dd-auto-confirm">
        <div className="dd-auto-confirm__icon">
          <Zap size={22} />
        </div>
        <h3 id="dd-auto-confirm-title">Run Auto Sourcing?</h3>
        <p>
          Auto Sourcing will check missing data points on <strong>{probill}</strong>
          {missingCount > 0 ? (
            <>
              {' '}
              (<strong>{missingCount}</strong> found), let you fix them in one place, then blast
              carriers and post to load boards from a single screen.
            </>
          ) : (
            <> — all required data is present. Pick actions and run everything from one screen.</>
          )}
        </p>
        <div className="dd-auto-confirm__actions">
          <button type="button" className="dd-btn" onClick={onNo}>
            No, not now
          </button>
          <button type="button" className="dd-btn dd-btn--primary" onClick={onYes}>
            <Sparkles size={14} />
            Yes, run Auto Sourcing
          </button>
        </div>
        <span className="dd-auto-confirm__note">Mock workflow · no live sends or postings</span>
      </div>
    </div>
  )
}

/* ── Right-side workflow panel ── */
export function AutoSourcingPanel({
  detail,
  onClose,
  onApplyRates,
  onGoFindPost,
}: {
  detail: LoadDetail
  onClose: () => void
  onApplyRates: (patch: { maxBuy: string; bookNowRate: string; rejectAbove: string }) => void
  onGoFindPost: () => void
}) {
  const maxMissing = !detail.maxBuy || detail.maxBuy === '—' || detail.maxBuy === '$0.00'
  const bookMissing = !detail.bookNowRate || detail.bookNowRate === '—'

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [maxBuy, setMaxBuy] = useState(
    maxMissing ? '' : detail.maxBuy.replace(/[^0-9.]/g, '')
  )
  const [bookNow, setBookNow] = useState(
    bookMissing ? '' : detail.bookNowRate.replace(/[^0-9.]/g, '')
  )
  const [bookTouched, setBookTouched] = useState(!bookMissing)
  const [picked, setPicked] = useState<Set<ActionId>>(
    () => new Set<ActionId>(['blast_email', 'blast_whatsapp', 'post_dat', 'post_loadlink'])
  )
  const [tasks, setTasks] = useState<RunTask[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const maxNum = Number(maxBuy)
  const maxOk = Boolean(maxBuy) && !Number.isNaN(maxNum) && maxNum > 0
  const suggestedBook = maxOk ? (maxNum * 0.925).toFixed(2) : ''
  const bookVal = bookTouched && bookNow ? bookNow : suggestedBook
  const dataReady = maxOk && Boolean(bookVal)

  const checks = useMemo(
    () => [
      {
        label: 'Customer rate',
        ok: detail.load.fee > 0,
        note: `$${detail.load.fee.toFixed(2)} ${detail.currency}`,
      },
      { label: 'Equipment', ok: Boolean(detail.load.equipment), note: detail.load.equipment },
      {
        label: 'Max buy rate',
        ok: maxOk,
        note: maxOk ? `$${maxNum.toFixed(2)} ${detail.currency}` : 'Required · internal ceiling',
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
        result: `Max buy $${maxNum.toFixed(2)} · Book now $${Number(bookVal).toFixed(2)}`,
        state: 'queued',
      },
    ]
    if (picked.has('blast_email'))
      list.push({
        id: 'blast_email',
        label: 'Blast email',
        result: `Sent to ${EMAIL_TARGETS} carriers`,
        state: 'queued',
      })
    if (picked.has('blast_whatsapp'))
      list.push({
        id: 'blast_whatsapp',
        label: 'Blast WhatsApp',
        result: `Sent to ${WA_TARGETS} carriers`,
        state: 'queued',
      })
    if (picked.has('post_dat'))
      list.push({
        id: 'post_dat',
        label: 'Post to DAT',
        result: 'Posted · repost every 20 min',
        state: 'queued',
      })
    if (picked.has('post_loadlink'))
      list.push({
        id: 'post_loadlink',
        label: 'Post to Loadlink',
        result: 'Posted to Loadlink',
        failResult: 'Failed · Loadlink session expired',
        state: 'queued',
      })
    return list
  }

  const startRun = () => {
    onApplyRates({
      maxBuy: `$${maxNum.toFixed(2)}`,
      bookNowRate: `$${Number(bookVal).toFixed(2)}`,
      rejectAbove: `$${(maxNum * 1.08).toFixed(2)}`,
    })
    setTasks(buildTasks())
    setStep(3)
  }

  /* advance the mock run one task at a time */
  useEffect(() => {
    if (step !== 3) return
    const idx = tasks.findIndex((t) => t.state === 'queued' || t.state === 'running')
    if (idx === -1) return
    if (tasks[idx].state === 'queued') {
      setTasks((prev) => prev.map((t, i) => (i === idx ? { ...t, state: 'running' } : t)))
      return
    }
    timerRef.current = setTimeout(() => {
      setTasks((prev) =>
        prev.map((t, i) =>
          i === idx ? { ...t, state: t.failResult ? 'failed' : 'done' } : t
        )
      )
    }, 850)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [step, tasks])

  const retryTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, failResult: undefined, state: 'running' } : t
      )
    )
  }

  const running = tasks.some((t) => t.state === 'queued' || t.state === 'running')
  const failCount = tasks.filter((t) => t.state === 'failed').length
  const blastPicked = picked.has('blast_email') || picked.has('blast_whatsapp')

  return (
    <aside className="dd-auto-panel" role="dialog" aria-label="Auto Sourcing">
      <header className="dd-auto-panel__head">
        <div className="dd-auto-panel__title">
          <Zap size={16} />
          <div>
            <strong>Auto Sourcing</strong>
            <span>
              {detail.load.id} · {detail.load.origin} → {detail.load.destination}
            </span>
          </div>
        </div>
        <button type="button" className="dd-icon-btn dd-icon-btn--light" aria-label="Close" onClick={onClose}>
          <X size={16} />
        </button>
      </header>

      <div className="dd-auto-steps">
        {(
          [
            [1, 'Missing data'],
            [2, 'Actions'],
            [3, 'Run & results'],
          ] as const
        ).map(([n, label]) => (
          <div
            key={n}
            className={cn(
              'dd-auto-steps__item',
              step === n && 'is-active',
              step > n && 'is-done'
            )}
          >
            <i>{step > n ? <Check size={11} /> : n}</i>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="dd-auto-panel__body">
        {step === 1 && (
          <>
            <p className="dd-auto-panel__intro">
              {missingNow > 0 ? (
                <>
                  <strong>{missingNow}</strong> data point{missingNow === 1 ? ' is' : 's are'}{' '}
                  missing to move this order through sourcing. Fill{' '}
                  {missingNow === 1 ? 'it' : 'them'} in below.
                </>
              ) : (
                <>All required data points are present. Continue to actions.</>
              )}
            </p>

            <div className="dd-auto-checks">
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
                Max buy rate ({detail.currency})
                <input
                  value={maxBuy}
                  placeholder="0.00"
                  inputMode="decimal"
                  onChange={(e) => setMaxBuy(e.target.value.replace(/[^0-9.]/g, ''))}
                />
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

        {step === 2 && (
          <>
            <p className="dd-auto-panel__intro">
              Pick everything Auto Sourcing should do — it runs all of it from this one screen.
            </p>
            <div className="dd-auto-actions">
              {ACTIONS.map((a) => {
                const on = picked.has(a.id)
                const Icon = a.icon
                return (
                  <button
                    key={a.id}
                    type="button"
                    className={cn('dd-auto-action', on && 'is-on')}
                    onClick={() =>
                      setPicked((prev) => {
                        const next = new Set(prev)
                        if (next.has(a.id)) next.delete(a.id)
                        else next.add(a.id)
                        return next
                      })
                    }
                  >
                    <Icon size={16} />
                    <div>
                      <strong>{a.label}</strong>
                      <span>{a.hint}</span>
                    </div>
                    <i className="dd-auto-action__tick">{on && <Check size={12} />}</i>
                  </button>
                )
              })}
            </div>
            {blastPicked && (
              <p className="dd-auto-panel__foot-note">
                ≈ {UNIQUE_CONTACTS} unique contacts across selected blast channels.
              </p>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <p className="dd-auto-panel__intro">
              {running ? (
                <>Running {tasks.length} actions — no need to leave this page.</>
              ) : failCount > 0 ? (
                <>
                  Finished with <strong>{failCount}</strong> failure
                  {failCount === 1 ? '' : 's'}. Retry below or continue.
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

            {!running && (
              <div className="dd-auto-summary">
                <strong>Summary</strong>
                <ul>
                  {picked.has('blast_email') && <li>Blast email sent to {EMAIL_TARGETS} carriers</li>}
                  {picked.has('blast_whatsapp') && (
                    <li>Blast WhatsApp sent to {WA_TARGETS} carriers</li>
                  )}
                  {blastPicked && <li>{UNIQUE_CONTACTS} unique contacts reached</li>}
                  {picked.has('post_dat') && <li>Load posted to DAT</li>}
                  {picked.has('post_loadlink') && (
                    <li>
                      {tasks.find((t) => t.id === 'post_loadlink')?.state === 'done'
                        ? 'Load posted to Loadlink'
                        : 'Loadlink posting failed — retry available'}
                    </li>
                  )}
                  <li>
                    Rates applied — max buy ${maxNum.toFixed(2)}, book now $
                    {Number(bookVal || 0).toFixed(2)}
                  </li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="dd-auto-panel__foot">
        {step === 1 && (
          <>
            <button type="button" className="dd-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="dd-btn dd-btn--primary"
              disabled={!dataReady}
              onClick={() => setStep(2)}
            >
              Continue
              <ChevronRight size={14} />
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <button type="button" className="dd-btn" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="dd-btn dd-btn--primary"
              disabled={picked.size === 0}
              onClick={startRun}
            >
              <Zap size={14} />
              Run Auto Sourcing
            </button>
          </>
        )}
        {step === 3 && (
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
      </footer>
    </aside>
  )
}
