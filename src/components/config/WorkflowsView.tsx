import { Check, Copy, Plus, SlidersHorizontal, Zap } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Workflow } from '@/data/autoWorkflows'
import { ConfigCard } from './parts'

type WorkflowsViewProps = {
  workflows: Workflow[]
  total: number
  selectedId: string
  onSelect: (id: string) => void
  onToggle: (id: string) => void
  onNew: () => void
  onEdit: (id: string) => void
}

export function WorkflowsView({
  workflows,
  total,
  selectedId,
  onSelect,
  onToggle,
  onNew,
  onEdit,
}: WorkflowsViewProps) {
  const active = workflows.find((w) => w.id === selectedId) ?? workflows[0]
  const enabledCount = workflows.filter((w) => w.enabled).length

  return (
    <div className="cfg-split">
      <aside className="cfg-list">
        <header className="cfg-list__head">
          <span className="cfg-eyebrow">Saved workflows</span>
          <em>
            {workflows.length < total
              ? `${workflows.length} of ${total} shown`
              : `${enabledCount} of ${total} enabled`}
          </em>
        </header>

        <button type="button" className="cfg-list__new" onClick={onNew}>
          <Plus size={14} strokeWidth={2.2} />
          New workflow
          <small>One page, pre-filled, priced against a real lane as you go</small>
        </button>

        <div className="cfg-list__body">
          {workflows.length === 0 && (
            <p className="cfg-empty">No workflow matches that search.</p>
          )}
          {workflows.map((wf) => (
            <button
              key={wf.id}
              type="button"
              className={cn('cfg-wf', wf.id === active?.id && 'is-on')}
              onClick={() => onSelect(wf.id)}
            >
              <span className="cfg-wf__top">
                <i className={cn('cfg-dot', wf.enabled ? 'is-live' : 'is-off')} aria-hidden />
                <strong>{wf.name}</strong>
              </span>
            </button>
          ))}
        </div>
      </aside>

      {!active && (
        <section className="cfg-detail">
          <div className="cfg-detail__blank">Nothing to show for this search.</div>
        </section>
      )}

      {active && (
        <section className="cfg-detail">
          <header className="cfg-detail__head is-dark">
            <div className="cfg-detail__topline">
              <div className="cfg-detail__title">
                <Zap size={14} strokeWidth={2.2} aria-hidden />
                <h2>{active.name}</h2>
                <span className={cn('cfg-badge', active.enabled ? 'is-pos' : 'is-muted')}>
                  {active.enabled ? 'Enabled' : 'Paused'}
                </span>
              </div>
              <div className="cfg-detail__acts">
                <button
                  type="button"
                  className="cfg-btn is-ghost"
                  onClick={() => onEdit(active.id)}
                >
                  <SlidersHorizontal size={13} strokeWidth={2} />
                  Edit workflow
                </button>
                <button type="button" className="cfg-btn is-ghost" onClick={onNew}>
                  <Copy size={13} strokeWidth={2} />
                  Duplicate
                </button>
              </div>
            </div>

            <div className="cfg-meta">
              <span>
                Runs today <b>{active.stats.runsToday}</b>
              </span>
              <span>
                Avg cover <b>{active.stats.cover}</b>
              </span>
              <span>
                Under Max Buy <b>{active.stats.underMaxBuy}</b>
              </span>
              <span>
                Auto-awarded <b>{active.stats.auto}</b>
              </span>
              <span>
                In flight <b>{active.stats.inFlight}</b>
              </span>
            </div>
          </header>

          <div className="cfg-detail__body">
            <ConfigCard
              title="When it runs"
              hint={active.summary}
              right={
                <label className="cfg-toggle">
                  <span>{active.enabled ? 'Enabled' : 'Paused'}</span>
                  <input
                    type="checkbox"
                    checked={active.enabled}
                    onChange={() => onToggle(active.id)}
                  />
                  <i aria-hidden />
                </label>
              }
            >
              <div className="cfg-row">
                <span className="cfg-row__label">Matches</span>
                <div className="cfg-row__value cfg-chips">
                  {active.matches.map((m) => (
                    <span key={m} className="cfg-chip is-static">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="cfg-row">
                <span className="cfg-row__label">Entry points</span>
                <ul className="cfg-row__value cfg-checks">
                  {active.entryPoints.map((e) => (
                    <li key={e}>
                      <Check size={13} strokeWidth={2.4} />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            </ConfigCard>

            <ConfigCard
              title="What it does, in order"
              hint="Every stage below runs without a human unless a guardrail stops it"
            >
              <ol className="cfg-steps">
                {active.steps.map((s) => (
                  <li key={s.n}>
                    <span className="cfg-steps__n">
                      {s.n} · {s.label}
                    </span>
                    <div className="cfg-steps__main">
                      <strong>{s.value}</strong>
                      {s.note.split('\n').map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            </ConfigCard>

            <ConfigCard title="Guardrails" hint="Where the automation deliberately stops">
              <dl className="cfg-guards">
                {active.guardrails.map((g) => (
                  <div key={g.label}>
                    <dt>{g.label}</dt>
                    <dd>{g.value}</dd>
                  </div>
                ))}
              </dl>
            </ConfigCard>
          </div>
        </section>
      )}
    </div>
  )
}
