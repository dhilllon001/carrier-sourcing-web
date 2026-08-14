import { useState } from 'react'
import { Activity, Plus, X } from 'lucide-react'
import { RUNS, WORKFLOWS, type Workflow } from '@/data/autoWorkflows'
import { WorkflowsView } from './WorkflowsView'
import { RunsView } from './RunsView'
import { WorkflowBuilder } from './WorkflowBuilder'

export type ConfigView = 'workflows' | 'runs' | 'new'

type AutoWorkflowsPanelProps = {
  view: ConfigView
  onViewChange: (view: ConfigView) => void
  onOpenLoad: (probill: string) => void
}

const TITLE: Record<ConfigView, { title: string; hint: string }> = {
  workflows: {
    title: 'Auto-sourcing workflows',
    hint: 'The rules that cover a load without a person touching it',
  },
  runs: {
    title: 'Live runs',
    hint: 'Every automated run in flight and everything covered today',
  },
  new: {
    title: 'New workflow',
    hint: 'Nothing goes live until you save it',
  },
}

export function AutoWorkflowsPanel({
  view,
  onViewChange,
  onOpenLoad,
}: AutoWorkflowsPanelProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>(WORKFLOWS)
  const [selectedWorkflow, setSelectedWorkflow] = useState(WORKFLOWS[0].id)
  const [selectedRun, setSelectedRun] = useState(RUNS[0].id)
  const [toast, setToast] = useState<string | null>(null)

  const inFlight = RUNS.filter((r) => r.state === 'needs-you').length

  return (
    <div className="cfg">
      <header className="cfg__bar">
        <div className="cfg__bar-title">
          <h2>{TITLE[view].title}</h2>
          <p>{TITLE[view].hint}</p>
        </div>

        <div className="cfg__bar-right">
          <span className="cfg-health">
            <i aria-hidden />
            Engine healthy · 1s tick
          </span>
          {inFlight > 0 && (
            <button
              type="button"
              className="cfg-health is-alert"
              onClick={() => onViewChange('runs')}
            >
              <Activity size={12} strokeWidth={2.2} />
              {inFlight} need you
            </button>
          )}
          {view !== 'new' && (
            <button
              type="button"
              className="cfg-btn is-primary"
              onClick={() => onViewChange('new')}
            >
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
            workflows={workflows}
            selectedId={selectedWorkflow}
            onSelect={setSelectedWorkflow}
            onToggle={(id) =>
              setWorkflows((list) =>
                list.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
              )
            }
            onNew={() => onViewChange('new')}
            onEdit={() => onViewChange('new')}
          />
        )}

        {view === 'runs' && (
          <RunsView
            runs={RUNS}
            selectedId={selectedRun}
            onSelect={setSelectedRun}
            onOpenLoad={onOpenLoad}
          />
        )}

        {view === 'new' && (
          <WorkflowBuilder
            onCancel={() => onViewChange('workflows')}
            onSave={(draft) => {
              setWorkflows((list) => [draft, ...list])
              setSelectedWorkflow(draft.id)
              setToast(
                `${draft.name} saved${draft.enabled ? ' and enabled' : ' as paused'} — it now shows in Saved workflows.`
              )
              onViewChange('workflows')
            }}
          />
        )}
      </div>
    </div>
  )
}
