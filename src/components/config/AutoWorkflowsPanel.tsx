import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { RUNS, WORKFLOWS, type Workflow } from '@/data/autoWorkflows'
import { WorkflowsView } from './WorkflowsView'
import { RunsView } from './RunsView'
import { WorkflowBuilder } from './WorkflowBuilder'

export type ConfigView = 'workflows' | 'runs' | 'new'

type AutoWorkflowsPanelProps = {
  search?: string
  onOpenLoad: (probill: string) => void
}

export function AutoWorkflowsPanel({ search = '', onOpenLoad }: AutoWorkflowsPanelProps) {
  const [view, setView] = useState<ConfigView>('workflows')
  const [workflows, setWorkflows] = useState<Workflow[]>(WORKFLOWS)
  const [selectedWorkflow, setSelectedWorkflow] = useState(WORKFLOWS[0].id)
  const [selectedRun, setSelectedRun] = useState(RUNS[0].id)
  const [toast, setToast] = useState<string | null>(null)

  const needsYou = RUNS.filter((r) => r.state === 'needs-you').length
  const q = search.trim().toLowerCase()

  const shownWorkflows = useMemo(
    () =>
      q
        ? workflows.filter((w) =>
            [w.name, w.blurb, ...w.matches].join(' ').toLowerCase().includes(q)
          )
        : workflows,
    [workflows, q]
  )

  const shownRuns = useMemo(
    () =>
      q
        ? RUNS.filter((r) =>
            [r.runNo, r.workflow, r.probill, r.customer, r.origin, r.destination]
              .join(' ')
              .toLowerCase()
              .includes(q)
          )
        : RUNS,
    [q]
  )

  return (
    <div className="cfg">
      <header className="cfg__bar">
        <div className="cfg__tabs" role="tablist" aria-label="Configuration section">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'workflows'}
            className={cn(view === 'workflows' && 'is-on')}
            onClick={() => setView('workflows')}
          >
            Workflows
            <i>{shownWorkflows.length}</i>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'runs'}
            className={cn(view === 'runs' && 'is-on')}
            onClick={() => setView('runs')}
          >
            Live runs
            <i className={cn(needsYou > 0 && 'is-alert')}>{shownRuns.length}</i>
          </button>
          {view === 'new' && (
            <button type="button" role="tab" aria-selected className="is-on">
              New workflow
            </button>
          )}
        </div>

        <div className="cfg__bar-right">
          <span className="cfg-health">
            <i aria-hidden />
            Engine healthy · 1s tick
          </span>
          {needsYou > 0 && (
            <button
              type="button"
              className="cfg-health is-alert"
              onClick={() => setView('runs')}
            >
              {needsYou} need you
            </button>
          )}
          {view !== 'new' && (
            <button type="button" className="cfg-btn is-primary" onClick={() => setView('new')}>
              <Plus size={13} strokeWidth={2.4} />
              New workflow
            </button>
          )}
        </div>
      </header>

      {toast && (
        <div className="cfg-toast">
          <span>{toast}</span>
          <button type="button" aria-label="Dismiss" onClick={() => setToast(null)}>
            <X size={13} strokeWidth={2.2} />
          </button>
        </div>
      )}

      <div className="cfg__body">
        {view === 'workflows' && (
          <WorkflowsView
            workflows={shownWorkflows}
            total={workflows.length}
            selectedId={selectedWorkflow}
            onSelect={setSelectedWorkflow}
            onToggle={(id) =>
              setWorkflows((list) =>
                list.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
              )
            }
            onNew={() => setView('new')}
            onEdit={() => setView('new')}
          />
        )}

        {view === 'runs' && (
          <RunsView
            runs={shownRuns}
            selectedId={selectedRun}
            onSelect={setSelectedRun}
            onOpenLoad={onOpenLoad}
          />
        )}

        {view === 'new' && (
          <WorkflowBuilder
            onCancel={() => setView('workflows')}
            onSave={(draft) => {
              setWorkflows((list) => [draft, ...list])
              setSelectedWorkflow(draft.id)
              setToast(
                `${draft.name} saved${draft.enabled ? ' and enabled' : ' as paused'} — it now shows in Saved workflows.`
              )
              setView('workflows')
            }}
          />
        )}
      </div>
    </div>
  )
}
