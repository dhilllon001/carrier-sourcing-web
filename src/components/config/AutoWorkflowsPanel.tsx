import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { CARRIER_PREFS, RUNS, WORKFLOWS, type CarrierPref, type Workflow } from '@/data/autoWorkflows'
import { WorkflowsView } from './WorkflowsView'
import { RunsView } from './RunsView'
import { CarrierPrefsView } from './CarrierPrefsView'
import { FavoritesView } from './FavoritesView'
import { WorkflowBuilder } from './WorkflowBuilder'

export type ConfigView = 'workflows' | 'runs' | 'carriers' | 'favorites' | 'new'

type AutoWorkflowsPanelProps = {
  search?: string
  onOpenLoad: (probill: string) => void
  initialView?: ConfigView
}

export function AutoWorkflowsPanel({
  search = '',
  onOpenLoad,
  initialView = 'workflows',
}: AutoWorkflowsPanelProps) {
  const [view, setView] = useState<ConfigView>(initialView)
  const [workflows, setWorkflows] = useState<Workflow[]>(WORKFLOWS)
  const [selectedWorkflow, setSelectedWorkflow] = useState(WORKFLOWS[0].id)
  const [selectedRun, setSelectedRun] = useState(RUNS[0].id)
  const [carriers, setCarriers] = useState<CarrierPref[]>(CARRIER_PREFS)
  const [savedCarriers, setSavedCarriers] = useState<CarrierPref[]>(CARRIER_PREFS)
  const [selectedCarrier, setSelectedCarrier] = useState(CARRIER_PREFS[0].id)
  const [toast, setToast] = useState<string | null>(null)

  const needsYou = RUNS.filter((r) => r.state === 'needs-you').length
  const inFlight = RUNS.filter((r) => r.state !== 'covered').length
  const carriersDirty = carriers.some((c, i) => c !== savedCarriers[i])
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

  const shownCarriers = useMemo(
    () =>
      q
        ? carriers.filter((c) => [c.name, c.mc, c.city].join(' ').toLowerCase().includes(q))
        : carriers,
    [carriers, q]
  )

  return (
    <div className="cfg">
      <header className="cfg__bar">
        <div className="cfg__tabs" role="tablist" aria-label="Auto sourcing configuration">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'runs'}
            className={cn(view === 'runs' && 'is-on')}
            onClick={() => setView('runs')}
          >
            Live runs
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'workflows'}
            className={cn(view === 'workflows' && 'is-on')}
            onClick={() => setView('workflows')}
          >
            Workflows
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'carriers'}
            className={cn(view === 'carriers' && 'is-on')}
            onClick={() => setView('carriers')}
          >
            Carrier prefs
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'favorites'}
            className={cn(view === 'favorites' && 'is-on')}
            onClick={() => setView('favorites')}
          >
            Favourites
          </button>
          {view === 'new' && (
            <button type="button" role="tab" aria-selected className="is-on">
              New workflow
            </button>
          )}
        </div>

        <button type="button" className="cfg__pulse" onClick={() => setView('runs')}>
          <i aria-hidden />
          {inFlight} runs in flight
          {needsYou > 0 && <em>· {needsYou} need you</em>}
        </button>

        <div className="cfg__bar-right">
          {view !== 'new' && (
            <button type="button" className="cfg-btn is-primary" onClick={() => setView('new')}>
              <Plus size={13} strokeWidth={2.4} />
              New workflow
            </button>
          )}
          <span className="cfg-health">
            <i aria-hidden />
            Engine healthy · 1s tick
          </span>
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
            onCarrierPrefs={() => setView('carriers')}
          />
        )}

        {view === 'carriers' && (
          <CarrierPrefsView
            carriers={shownCarriers}
            total={carriers.length}
            selectedId={selectedCarrier}
            onSelect={setSelectedCarrier}
            onChange={(next) =>
              setCarriers((list) => list.map((c) => (c.id === next.id ? next : c)))
            }
            onReset={(id) =>
              setCarriers((list) =>
                list.map((c, i) => (c.id === id ? savedCarriers[i] : c))
              )
            }
            dirty={carriersDirty}
            onSave={() => {
              setSavedCarriers(carriers)
              setToast('Carrier preferences saved — every future sourcing run uses them.')
            }}
          />
        )}

        {view === 'favorites' && <FavoritesView />}

        {view === 'new' && (
          <WorkflowBuilder
            workflows={workflows}
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
