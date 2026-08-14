import { ArrowUpRight, Check, Clock, Loader2, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Run } from '@/data/autoWorkflows'
import { ConfigCard, Metric, money, plain } from './parts'

type RunsViewProps = {
  runs: Run[]
  selectedId: string
  onSelect: (id: string) => void
  onOpenLoad: (probill: string) => void
}

function RunCard({
  run,
  active,
  onSelect,
}: {
  run: Run
  active: boolean
  onSelect: () => void
}) {
  return (
    <button type="button" className={cn('cfg-run', active && 'is-on')} onClick={onSelect}>
      <span className="cfg-run__top">
        <i
          className={cn('cfg-dot', run.state === 'needs-you' ? 'is-alert' : 'is-live')}
          aria-hidden
        />
        <strong>{run.workflow}</strong>
        <em>{run.clock}</em>
      </span>
      <span className="cfg-run__load">
        <b>{run.probill}</b>
        {run.customer}
      </span>
      <span className="cfg-run__lane">
        {run.origin}
        <i aria-hidden />
        {run.destination}
        <em>{run.miles.toLocaleString()} mi</em>
      </span>
      <span className="cfg-run__bars" aria-hidden>
        {run.bars.map((b, i) => (
          <i key={i} className={`is-${b}`} />
        ))}
      </span>
      <span className="cfg-run__foot">
        {run.footLabel}
        <em className={cn(run.state === 'needs-you' && 'is-alert')}>{run.footValue}</em>
      </span>
    </button>
  )
}

export function RunsView({ runs, selectedId, onSelect, onOpenLoad }: RunsViewProps) {
  const active = runs.find((r) => r.id === selectedId) ?? runs[0]
  const needsYou = runs.filter((r) => r.state === 'needs-you')
  const covered = runs.filter((r) => r.state === 'covered')

  return (
    <div className="cfg-split">
      <aside className="cfg-list">
        <header className="cfg-list__head">
          <span className="cfg-eyebrow">Runs in flight</span>
          <em>{needsYou.length} live</em>
        </header>

        <div className="cfg-list__body">
          <div className="cfg-group">
            <span className="cfg-group__label is-alert">
              Needs you <b>{needsYou.length}</b>
            </span>
            {needsYou.map((run) => (
              <RunCard
                key={run.id}
                run={run}
                active={run.id === active?.id}
                onSelect={() => onSelect(run.id)}
              />
            ))}
          </div>

          <div className="cfg-group">
            <span className="cfg-group__label">
              Covered today <b>{covered.length}</b>
            </span>
            {covered.map((run) => (
              <RunCard
                key={run.id}
                run={run}
                active={run.id === active?.id}
                onSelect={() => onSelect(run.id)}
              />
            ))}
          </div>
        </div>
      </aside>

      {active && (
        <section className="cfg-detail">
          <header className="cfg-detail__head">
            <div className="cfg-detail__title">
              <i
                className={cn(
                  'cfg-dot',
                  active.state === 'needs-you' ? 'is-alert' : 'is-live'
                )}
                aria-hidden
              />
              <h2>{active.workflow}</h2>
              <span
                className={cn('cfg-badge', active.state === 'needs-you' ? 'is-neg' : 'is-pos')}
              >
                {active.state === 'needs-you' ? 'Needs you' : 'Covered'}
              </span>
            </div>
            <div className="cfg-detail__acts">
              <button
                type="button"
                className="cfg-btn is-primary"
                onClick={() => onOpenLoad(active.probill)}
              >
                Open in Sourcing
                <ArrowUpRight size={13} strokeWidth={2.2} />
              </button>
            </div>
          </header>

          <div className="cfg-detail__body">
            <div className="cfg-meta">
              <span>
                Run <b>{active.runNo}</b>
              </span>
              <span>
                Probill <b>{active.probill}</b>
              </span>
              <span>
                Order <b>{active.order}</b>
              </span>
              <span>
                PO <b>{active.po}</b>
              </span>
              <span>{active.customer}</span>
              <span>{active.equipment}</span>
              <span>{active.currency}</span>
              <span className="cfg-meta__lane">
                {active.origin} → {active.destination} · {active.miles.toLocaleString()} mi
              </span>
            </div>

            <div className="cfg-metrics">
              <Metric
                label="Max buy"
                value={money(active.metrics.maxBuy, active.currency)}
                note={active.metrics.maxBuyNote}
              />
              <Metric
                label="Book now"
                value={plain(active.metrics.bookNow)}
                note={active.metrics.bookNowNote}
                tone="accent"
              />
              <Metric
                label="Best bid"
                value={plain(active.metrics.bestBid)}
                note={active.metrics.bestBidNote}
              />
              <Metric
                label="Elapsed"
                value={active.metrics.elapsed}
                note={active.metrics.elapsedNote}
              />
              <Metric
                label="Carriers reached"
                value={String(active.metrics.reached)}
                note={active.metrics.reachedNote}
              />
              <Metric
                label="Saved"
                value={plain(active.metrics.saved)}
                note={active.metrics.savedNote}
                tone={active.metrics.saved >= 0 ? 'pos' : 'neg'}
              />
            </div>

            <ConfigCard
              title="Stage trace"
              hint="What the workflow did, and why"
              right={<span className="cfg-pill">{active.stagesDone}</span>}
            >
              <ol className="cfg-trace">
                {active.trace.map((t) => (
                  <li key={t.title} className={`is-${t.state}`}>
                    <i className="cfg-trace__mark" aria-hidden>
                      {t.state === 'done' ? (
                        <Check size={11} strokeWidth={3} />
                      ) : t.state === 'live' ? (
                        <Loader2 size={11} strokeWidth={3} />
                      ) : (
                        <Clock size={11} strokeWidth={2.5} />
                      )}
                    </i>
                    <div>
                      <span className="cfg-trace__top">
                        <strong>{t.title}</strong>
                        <em>{t.at}</em>
                      </span>
                      <p>{t.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </ConfigCard>

            <ConfigCard
              title="Broadcast waves"
              hint="Email + WhatsApp · waterfall widens on a timer"
            >
              <ul className="cfg-waves">
                {active.waves.map((w) => (
                  <li key={w.title} className={`is-${w.state}`}>
                    {w.state === 'sent' ? (
                      <Check size={13} strokeWidth={2.6} />
                    ) : (
                      <Clock size={13} strokeWidth={2.2} />
                    )}
                    <strong>{w.title}</strong>
                    <em>{w.at}</em>
                  </li>
                ))}
              </ul>
            </ConfigCard>

            <ConfigCard
              title="Offers & bids"
              hint={`${active.bids.length} live · thresholds enforced automatically`}
            >
              <div className="cfg-rule">
                <ShieldAlert size={13} strokeWidth={2} />
                {active.awardRule}
              </div>

              <ul className="cfg-bids">
                {active.bids.map((b) => (
                  <li key={b.carrier} className={`is-${b.outcome}`}>
                    <div className="cfg-bids__who">
                      <strong>{b.carrier}</strong>
                      <span>
                        MC {b.mc} · DOT {b.dot} · received {b.at}
                      </span>
                    </div>
                    <div className="cfg-bids__amt">
                      <strong>
                        {plain(b.amount)} <em>{active.currency}</em>
                      </strong>
                      <span className={b.delta > 0 ? 'is-neg' : 'is-pos'}>
                        {b.delta > 0 ? '+' : ''}
                        {plain(b.delta)} vs Max Buy
                      </span>
                    </div>
                    <span className={cn('cfg-outcome', `is-${b.outcome}`)}>
                      {b.outcome === 'awarded'
                        ? 'Awarded'
                        : b.outcome === 'rejected'
                          ? 'Auto-rejected'
                          : b.outcome === 'live'
                            ? 'Live'
                            : 'Held'}
                    </span>
                  </li>
                ))}
              </ul>
            </ConfigCard>
          </div>
        </section>
      )}
    </div>
  )
}
