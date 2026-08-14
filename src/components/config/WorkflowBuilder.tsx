import { useMemo, useRef, useState } from 'react'
import { AlertTriangle, Check, Plus, ShieldCheck, Shuffle, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  BOARD_OPTIONS,
  BUILDER_STEPS,
  CATEGORY_OPTIONS,
  CHANNEL_OPTIONS,
  EQUIPMENT_OPTIONS,
  EXTRA_CONDITIONS,
  LANE_OPTIONS,
  MATCHES_TODAY_TOTAL,
  PREVIEW_LANES,
  REFERENCE_OPTIONS,
  REFRESH_OPTIONS,
  WAVE_SIZES,
  type Currency,
  type Workflow,
} from '@/data/autoWorkflows'
import { Chip, Field, NumCard, Stepper, plain } from './parts'

type Wave = { id: number; size: string; at: number }

type WorkflowBuilderProps = {
  workflows: Workflow[]
  onCancel: () => void
  onSave: (workflow: Workflow) => void
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function roundUp5(n: number) {
  return Math.ceil(n / 5) * 5
}

export function WorkflowBuilder({ workflows, onCancel, onSave }: WorkflowBuilderProps) {
  const [nameTouched, setNameTouched] = useState(false)
  const [typedName, setTypedName] = useState('')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [priority, setPriority] = useState(5)

  const [equipment, setEquipment] = useState<string[]>(['DRY-VAN'])
  const [lanes, setLanes] = useState<string[]>(['US → US'])
  const [categories, setCategories] = useState<string[]>(['Spot'])
  const [extras, setExtras] = useState<string[]>([])
  const [refineOpen, setRefineOpen] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLElement | null)[]>([])
  const [step, setStep] = useState(0)

  const goToStep = (i: number) => {
    setStep(i)
    stepRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const [reference, setReference] = useState<string>('dat')
  const [margin, setMargin] = useState(5)
  const [bookNowPct, setBookNowPct] = useState(7.5)
  const [rejectPct, setRejectPct] = useState(25)

  const [boards, setBoards] = useState<string[]>(['DAT'])
  const [refresh, setRefresh] = useState<string>('30 mins')

  const [waves, setWaves] = useState<Wave[]>([
    { id: 1, size: 'top 4', at: 0 },
    { id: 2, size: 'top 6', at: 20 },
    { id: 3, size: 'all carriers', at: 45 },
  ])
  const [channels, setChannels] = useState<string[]>(['Email', 'WhatsApp'])
  const [approvalAbove, setApprovalAbove] = useState(4000)

  const [laneId, setLaneId] = useState(PREVIEW_LANES[0].id)
  const lane = PREVIEW_LANES.find((l) => l.id === laneId) ?? PREVIEW_LANES[0]

  const suggestedName = useMemo(() => {
    const cat = categories[0] ?? 'All'
    const scope = (lanes[0] ?? 'Any lane').replace(/\s/g, '')
    const equip = equipment[0] ?? 'ANY'
    return `${cat} · ${scope} ${equip} Auto-Cover`
  }, [categories, lanes, equipment])

  const name = nameTouched ? typedName : suggestedName

  const priced = useMemo(() => {
    const maxBuy = roundUp5(lane.reference * (1 + margin / 100))
    const bookNow = maxBuy * (1 - bookNowPct / 100)
    const reject = maxBuy * (1 + rejectPct / 100)
    const bids = lane.bids.map((b) => {
      const outcome =
        b.amount <= bookNow
          ? ('award' as const)
          : b.amount > reject
            ? ('reject' as const)
            : b.amount > maxBuy
              ? ('over' as const)
              : ('approve' as const)
      return { ...b, outcome }
    })
    return { maxBuy, bookNow, reject, bids }
  }, [lane, margin, bookNowPct, rejectPct])

  const postsPublicly = boards.length > 0 && !boards.includes("Don't post publicly")

  const overlaps = useMemo(
    () =>
      workflows.filter(
        (w) =>
          w.enabled &&
          equipment.some((e) => w.matches.includes(`Equipment ${e}`)) &&
          lanes.some((l) => w.matches.includes(l))
      ),
    [workflows, equipment, lanes]
  )

  const matchSummary = [...equipment, ...lanes, ...categories].join(' · ') || 'nothing yet'

  const problems = useMemo(() => {
    const out: string[] = []
    if (!equipment.length) out.push('Pick at least one equipment type or nothing will match.')
    if (!lanes.length) out.push('Pick at least one lane scope or nothing will match.')
    if (!postsPublicly && !channels.length)
      out.push('No load board and no broadcast channel — this workflow would reach nobody.')
    if (!waves.length) out.push('Add at least one broadcast wave.')
    if (bookNowPct >= 100) out.push('Book Now discount cannot reach 100% of Max Buy.')
    if (priced.bookNow > priced.maxBuy) out.push('Book Now sits above Max Buy — it would never fire.')
    return out
  }, [equipment, lanes, postsPublicly, channels, waves, bookNowPct, priced])

  const reachText = useMemo(() => {
    const board = boards.filter((b) => b !== "Don't post publicly")
    const first = waves[0]
    const rest = waves.slice(1)
    return (
      <>
        {board.length > 0 ? (
          <>
            Posts to <b>{board.join(' and ')}</b>, refreshing every {refresh}, then{' '}
          </>
        ) : (
          <>No public board. </>
        )}
        {first && (
          <>
            broadcasts <b>{first.size}</b> immediately
          </>
        )}
        {rest.map((w) => (
          <span key={w.id}>
            , then <b>{w.size}</b> at +{w.at} min
          </span>
        ))}
        {channels.length > 0 && (
          <>
            {' '}
            via <b>{channels.join(' + ')}</b>
          </>
        )}
        . Books itself at or below Book Now up to <b>{plain(approvalAbove)} {currency}</b>; anything
        dearer goes to a person.
      </>
    )
  }, [boards, refresh, waves, channels, approvalAbove, currency])

  const buildDraft = (enabled: boolean): Workflow => {
    const referenceLabel = REFERENCE_OPTIONS.find((r) => r.id === reference)?.label ?? 'DAT benchmark'
    const board = boards.filter((b) => b !== "Don't post publicly")
    const summary = `Covers ${lanes.join(', ') || 'any lane'} ${equipment.join('/') || 'any equipment'} legs${
      enabled ? '' : ' — paused'
    }, widening the waterfall until it books.`
    return {
      id: `wf-${Date.now()}`,
      name,
      enabled,
      currency,
      blurb: summary,
      summary,
      matches: [
        ...equipment.map((e) => `Equipment ${e}`),
        ...lanes,
        ...categories.map((c) => `Order cat ${c}`),
        'Brokerage board accepted',
      ],
      entryPoints: [
        'Order Board — ⋮ menu → Post to Sourcing → run this workflow',
        'Sourcing portal — Overview → Find & Post → run workflow',
        'Automatic — fires when a brokerage planning board accepts a matching leg',
      ],
      steps: [
        {
          n: 1,
          label: 'Thresholds',
          value: `Max Buy = ${referenceLabel} + ${margin}%`,
          note: `Book Now −${bookNowPct}% of Max Buy · Reject Above +${rejectPct}% of Max Buy`,
        },
        {
          n: 2,
          label: 'Sourcing',
          value: 'Post leg to Carrier Sourcing',
          note: 'Marks Overview and Find & Post complete on the lifecycle rail',
        },
        {
          n: 3,
          label: 'Load board',
          value: board.length ? board.join(' + ') : "Don't post publicly",
          note: board.length ? `Posted at Book Now, every ${refresh}` : 'Private broadcast only',
        },
        {
          n: 4,
          label: 'Broadcast',
          value: waves.map((w, i) => `wave ${i + 1}: ${w.size} at +${w.at} min`).join(' → '),
          note: `Channels: ${channels.join(' + ') || 'none'}`,
        },
        {
          n: 5,
          label: 'Award',
          value: 'Any bid at or below Book Now',
          note: `Anything above ${plain(approvalAbove)} ${currency} is escalated to a human`,
        },
        {
          n: 6,
          label: 'Booking',
          value: 'Create contract, send rate confirmation',
          note: 'Then the run closes and the load leaves the monitor',
        },
      ],
      guardrails: [
        { label: 'Human approval', value: `Above ${plain(approvalAbove)} ${currency}` },
        {
          label: 'Above Max Buy',
          value: 'Run halts and escalates — never auto-books over the ceiling',
        },
        { label: 'Above Reject', value: 'Bid auto-rejected, carrier notified, waterfall continues' },
        { label: 'Take over', value: 'Any user can seize a run mid-flight' },
      ],
      stats: { runsToday: 0, cover: '—', auto: '—', inFlight: 0, underMaxBuy: '—' },
    }
  }

  return (
    <div className="cfg-builder">
      <div className="cfg-builder__scroll" ref={scrollRef}>
        <div className="cfg-builder__form">
          <header className="cfg-builder__intro">
            <h2>New auto-sourcing workflow</h2>
            <p>
              Everything is on one page and pre-filled from the defaults that work on most lanes.
              The panel on the right prices your rules against a real lane as you type, so you can
              see exactly what the automation would do before you save it.
            </p>
          </header>

          <nav className="cfg-stepnav" aria-label="Workflow sections">
            <div className="cfg-stepnav__list">
              {BUILDER_STEPS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  className={cn('cfg-stepnav__item', i === step && 'is-on')}
                  onClick={() => goToStep(i)}
                >
                  <i aria-hidden>{i + 1}</i>
                  {label}
                </button>
              ))}
            </div>
            <span className="cfg-stepnav__count">{lane.matches.length} matching legs</span>
          </nav>

          <NumCard
            n={1}
            title="Basics"
            hint="The name writes itself from your rules — override it if you want"
            cardRef={(el) => {
              stepRefs.current[0] = el
            }}
          >
            <div className="cfg-grid cfg-grid--name">
              <Field label="Workflow name" hint="Suggested from your selections. Type to take control.">
                <input
                  className="cfg-input"
                  value={name}
                  onChange={(e) => {
                    setNameTouched(true)
                    setTypedName(e.target.value)
                  }}
                />
              </Field>
              <Field label="Currency">
                <div className="cfg-chips">
                  {(['CAD', 'MXN', 'USD'] as Currency[]).map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      active={currency === c}
                      onClick={() => setCurrency(c)}
                    />
                  ))}
                </div>
              </Field>
              <Field
                label="Priority"
                hint="Priority decides which workflow claims a leg when more than one matches. 1 runs first."
              >
                <Stepper value={priority} onChange={setPriority} step={1} min={1} max={9} unit="" />
              </Field>
            </div>
          </NumCard>

          <NumCard
            n={2}
            title="When it runs"
            hint={`${lane.matches.length} legs on today's board match these conditions`}
            right={<span className="cfg-card__aside">{matchSummary}</span>}
            cardRef={(el) => {
              stepRefs.current[1] = el
            }}
          >
            <div className="cfg-grid cfg-grid--3">
              <Field label="Equipment">
                <div className="cfg-chips">
                  {EQUIPMENT_OPTIONS.map((e) => (
                    <Chip
                      key={e}
                      label={e}
                      active={equipment.includes(e)}
                      onClick={() => setEquipment((v) => toggle(v, e))}
                    />
                  ))}
                </div>
              </Field>
              <Field label="Lane scope">
                <div className="cfg-chips">
                  {LANE_OPTIONS.map((l) => (
                    <Chip
                      key={l}
                      label={l}
                      active={lanes.includes(l)}
                      onClick={() => setLanes((v) => toggle(v, l))}
                    />
                  ))}
                </div>
              </Field>
              <Field label="Order category">
                <div className="cfg-chips">
                  {CATEGORY_OPTIONS.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      active={categories.includes(c)}
                      onClick={() => setCategories((v) => toggle(v, c))}
                    />
                  ))}
                </div>
              </Field>
            </div>

            <Field label="Refine further" wide>
              <div className="cfg-chips">
                {extras.map((x) => (
                  <span key={x} className="cfg-chip is-on">
                    {x}
                    <button
                      type="button"
                      aria-label={`Remove ${x}`}
                      onClick={() => setExtras((v) => v.filter((e) => e !== x))}
                    >
                      <X size={10} strokeWidth={2.6} />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  className="cfg-add"
                  aria-expanded={refineOpen}
                  onClick={() => setRefineOpen((v) => !v)}
                >
                  <Plus size={12} strokeWidth={2.4} />
                  Add condition ({EXTRA_CONDITIONS.length - extras.length})
                </button>
              </div>
              {refineOpen && (
                <div className="cfg-chips cfg-chips--drawer">
                  {EXTRA_CONDITIONS.filter((c) => !extras.includes(c)).map((c) => (
                    <Chip key={c} label={c} onClick={() => setExtras((v) => [...v, c])} />
                  ))}
                </div>
              )}
            </Field>

            <Field
              label="Always required"
              hint="These can't be switched off — they're what makes a leg sourceable at all."
              wide
            >
              <div className="cfg-chips">
                <Chip locked label="Leg accepted by a brokerage planning board" />
                <Chip locked label="No carrier already awarded" />
              </div>
            </Field>
          </NumCard>

          <NumCard
            n={3}
            title="Pricing"
            hint="One reference rate plus a margin — Book Now and Reject Above follow from it"
            right={
              <span className="cfg-card__aside">
                {plain(priced.maxBuy)} {currency} max buy
              </span>
            }
            cardRef={(el) => {
              stepRefs.current[2] = el
            }}
          >
            <Field label="Max buy reference" wide>
              <div className="cfg-chips">
                {REFERENCE_OPTIONS.map((r) => (
                  <Chip
                    key={r.id}
                    label={r.label}
                    active={reference === r.id}
                    onClick={() => setReference(r.id)}
                  />
                ))}
              </div>
              <span className="cfg-field__hint">
                {REFERENCE_OPTIONS.find((r) => r.id === reference)?.note}
              </span>
            </Field>

            <div className="cfg-grid cfg-grid--3">
              <Field label="Margin on reference">
                <Stepper value={margin} onChange={setMargin} step={0.5} max={60} />
              </Field>
              <Field label="Book now below max buy">
                <Stepper value={bookNowPct} onChange={setBookNowPct} step={0.5} max={60} />
              </Field>
              <Field label="Reject above max buy">
                <Stepper value={rejectPct} onChange={setRejectPct} step={5} max={100} />
              </Field>
            </div>
          </NumCard>

          <NumCard
            n={4}
            title="Posting"
            hint="Public marketplaces, or nothing at all"
            right={
              <span className="cfg-card__aside">
                {postsPublicly ? `${boards.join(' + ')} · every ${refresh}` : 'private only'}
              </span>
            }
            cardRef={(el) => {
              stepRefs.current[3] = el
            }}
          >
            <div className="cfg-grid cfg-grid--2">
              <Field label="Load boards">
                <div className="cfg-chips">
                  {BOARD_OPTIONS.map((b) => (
                    <Chip
                      key={b}
                      label={b}
                      active={boards.includes(b)}
                      onClick={() =>
                        setBoards((v) =>
                          b === "Don't post publicly"
                            ? v.includes(b)
                              ? []
                              : [b]
                            : toggle(v.filter((x) => x !== "Don't post publicly"), b)
                        )
                      }
                    />
                  ))}
                </div>
              </Field>
              <Field label="Refresh interval">
                <div className="cfg-chips">
                  {REFRESH_OPTIONS.map((r) => (
                    <Chip
                      key={r}
                      label={r}
                      active={refresh === r}
                      onClick={() => setRefresh(r)}
                    />
                  ))}
                </div>
              </Field>
            </div>
          </NumCard>

          <NumCard
            n={5}
            title="Broadcast"
            hint="Widens on a timer until someone bids"
            cardRef={(el) => {
              stepRefs.current[4] = el
            }}
            right={
              <button
                type="button"
                className="cfg-btn"
                onClick={() =>
                  setWaves((v) => [
                    ...v,
                    {
                      id: Date.now(),
                      size: 'all carriers',
                      at: (v[v.length - 1]?.at ?? 0) + 20,
                    },
                  ])
                }
              >
                <Plus size={13} strokeWidth={2.2} />
                Add wave
              </button>
            }
          >
            <ul className="cfg-waves-edit">
              {waves.map((w, i) => (
                <li key={w.id}>
                  <span className="cfg-waves-edit__n">Wave {i + 1}</span>
                  <div className="cfg-chips">
                    {WAVE_SIZES.map((s) => (
                      <Chip
                        key={s}
                        label={s}
                        active={w.size === s}
                        onClick={() =>
                          setWaves((v) => v.map((x) => (x.id === w.id ? { ...x, size: s } : x)))
                        }
                      />
                    ))}
                  </div>
                  <Stepper
                    value={w.at}
                    unit="min"
                    step={5}
                    max={240}
                    onChange={(at) =>
                      setWaves((v) => v.map((x) => (x.id === w.id ? { ...x, at } : x)))
                    }
                  />
                  <button
                    type="button"
                    className="cfg-waves-edit__x"
                    aria-label={`Remove wave ${i + 1}`}
                    onClick={() => setWaves((v) => v.filter((x) => x.id !== w.id))}
                  >
                    <X size={13} strokeWidth={2.2} />
                  </button>
                </li>
              ))}
            </ul>

            <Field label="Channels" wide>
              <div className="cfg-chips">
                {CHANNEL_OPTIONS.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    active={channels.includes(c)}
                    onClick={() => setChannels((v) => toggle(v, c))}
                  />
                ))}
              </div>
            </Field>
          </NumCard>

          <NumCard
            n={6}
            title="Award"
            hint="Where the automation stops and a person takes over"
            right={
              <span className="cfg-card__aside">
                auto up to {plain(approvalAbove)} {currency}
              </span>
            }
            cardRef={(el) => {
              stepRefs.current[5] = el
            }}
          >
            <Field
              label="Human approval above"
              hint="Automation never books over this ceiling — anything dearer waits for a person."
              wide
            >
              <Stepper
                value={approvalAbove}
                unit={currency}
                step={250}
                max={50000}
                onChange={setApprovalAbove}
              />
            </Field>

            <Field label="Auto sourcing configuration" wide>
              <p className="cfg-note">
                Any bid at or below <b>Book Now</b> ({plain(priced.bookNow)} {currency}) is awarded
                without a human. Between Book Now and <b>Max Buy</b> the bid is held for review.
                Above <b>Reject Above</b> ({plain(priced.reject)}) it is auto-rejected and the
                waterfall carries on.
              </p>
            </Field>
          </NumCard>
        </div>

        <aside className="cfg-preview">
          <section className="cfg-preview__block">
            <span className="cfg-eyebrow">Priced on a real lane</span>
            <div className="cfg-preview__lanes">
              {PREVIEW_LANES.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className={cn('cfg-lane-tab', l.id === laneId && 'is-on')}
                  onClick={() => setLaneId(l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <dl className="cfg-price">
              <div>
                <dt>Reference · {REFERENCE_OPTIONS.find((r) => r.id === reference)?.label}</dt>
                <dd>{plain(lane.reference)}</dd>
              </div>
              <div className="is-strong">
                <dt>Max buy</dt>
                <dd>
                  {plain(priced.maxBuy)} {currency}
                </dd>
              </div>
              <div className="is-pos">
                <dt>Book now · auto-award line</dt>
                <dd>{plain(priced.bookNow)}</dd>
              </div>
              <div className="is-neg">
                <dt>Reject above</dt>
                <dd>{plain(priced.reject)}</dd>
              </div>
            </dl>
            <p className="cfg-preview__lane-note">
              {lane.lane} · {lane.miles.toLocaleString()} mi · {lane.scope}
            </p>
          </section>

          <section className="cfg-preview__block">
            <span className="cfg-eyebrow">What it would do with the last 3 bids</span>
            <ul className="cfg-preview__bids">
              {priced.bids.map((b) => (
                <li key={b.carrier} className={`is-${b.outcome}`}>
                  <i aria-hidden>
                    {b.outcome === 'award' ? (
                      <Check size={11} strokeWidth={3} />
                    ) : (
                      <AlertTriangle size={11} strokeWidth={2.4} />
                    )}
                  </i>
                  <span>
                    {b.carrier} —{' '}
                    {b.outcome === 'award'
                      ? 'auto-awarded · books itself'
                      : b.outcome === 'reject'
                        ? 'auto-rejected · above Reject line'
                        : b.outcome === 'over'
                          ? 'held · above Max Buy'
                          : 'held · needs a person'}
                  </span>
                  <em>{plain(b.amount)}</em>
                </li>
              ))}
            </ul>
          </section>

          <section className="cfg-preview__block">
            <span className="cfg-eyebrow">Reach</span>
            <p className="cfg-preview__prose">{reachText}</p>
          </section>

          <section className="cfg-preview__block">
            <span className="cfg-eyebrow">
              Matches today
              <em>
                {lane.matches.length} of {MATCHES_TODAY_TOTAL}
              </em>
            </span>
            <ul className="cfg-preview__matches">
              {lane.matches.map((m) => (
                <li key={m.probill}>
                  <b>{m.probill}</b>
                  <span>{m.customer}</span>
                  <em>{m.lane}</em>
                </li>
              ))}
            </ul>
          </section>

          {overlaps.length > 0 && (
            <section className="cfg-preview__block">
              <span className="cfg-eyebrow is-warn">Overlaps another workflow</span>
              <ul className="cfg-overlap">
                {overlaps.map((w) => (
                  <li key={w.id}>
                    <Shuffle size={12} strokeWidth={2.2} />
                    <span>
                      <b>{w.name}</b> also matches {lane.matches.length} of these legs.
                    </span>
                  </li>
                ))}
              </ul>
              <p className="cfg-preview__prose">
                Priority {priority} decides who claims the leg — the lower number wins.
              </p>
            </section>
          )}

          <section className="cfg-preview__block">
            <span className="cfg-eyebrow">Checks</span>
            {problems.length === 0 ? (
              <p className="cfg-check is-pos">
                <ShieldCheck size={13} strokeWidth={2.2} />
                No problems found. This workflow is ready to save.
              </p>
            ) : (
              <ul className="cfg-check-list">
                {problems.map((p) => (
                  <li key={p}>
                    <AlertTriangle size={13} strokeWidth={2.2} />
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <footer className="cfg-builder__foot">
        <span className={cn('cfg-builder__status', problems.length > 0 && 'is-warn')}>
          {problems.length > 0
            ? `${problems.length} thing${problems.length > 1 ? 's' : ''} to fix before this can run`
            : `Ready · matches ${lane.matches.length} legs on today's board`}
        </span>
        <div className="cfg-builder__btns">
          <button type="button" className="cfg-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="cfg-btn" onClick={() => onSave(buildDraft(false))}>
            Save as paused
          </button>
          <button
            type="button"
            className="cfg-btn is-primary"
            disabled={problems.length > 0}
            onClick={() => onSave(buildDraft(true))}
          >
            Save & enable
          </button>
          <button
            type="button"
            className="cfg-btn is-run"
            disabled={problems.length > 0}
            onClick={() => onSave(buildDraft(true))}
          >
            Save & run on {lane.matches.length}
          </button>
        </div>
      </footer>
    </div>
  )
}
