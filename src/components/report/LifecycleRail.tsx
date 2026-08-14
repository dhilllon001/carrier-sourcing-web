import { ChevronLeft, Layers, PlusCircle, Radio, Workflow } from 'lucide-react'
import { cn } from '@/lib/cn'
import { LIFECYCLE_DISPLAY } from '@/data/report'
import type { ConfigView } from '@/components/config/AutoWorkflowsPanel'

type StageName = (typeof LIFECYCLE_DISPLAY.stages)[number]['stage']

export type RailTab = 'lifecycle' | 'config'

type LifecycleRailProps = {
  collapsed: boolean
  onToggle: () => void
  stage: string
  subStage: string
  onSelectAll: () => void
  onSelectStage: (stage: StageName) => void
  onSelectSubStage: (stage: StageName, subStage: string) => void
  tab: RailTab
  onTabChange: (tab: RailTab) => void
  configView: ConfigView
  onConfigView: (view: ConfigView) => void
  workflowCount: number
  enabledCount: number
  runsLive: number
  needsYou: number
}

export function LifecycleRail({
  collapsed,
  onToggle,
  stage,
  subStage,
  onSelectAll,
  onSelectStage,
  onSelectSubStage,
  tab,
  onTabChange,
  configView,
  onConfigView,
  workflowCount,
  enabledCount,
  runsLive,
  needsYou,
}: LifecycleRailProps) {
  if (collapsed) {
    return (
      <button
        type="button"
        className="sr-life-float"
        aria-label="Expand lifecycle stages"
        onClick={onToggle}
      >
        <Layers size={14} strokeWidth={2} />
        <span>{tab === 'config' ? 'Configuration' : 'Stages'}</span>
      </button>
    )
  }

  return (
    <aside className="sr-life-rail">
      <div className="sr-life-rail__head">
        <div className="sr-rail-tabs" role="tablist" aria-label="Rail section">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'lifecycle'}
            className={cn(tab === 'lifecycle' && 'is-on')}
            onClick={() => onTabChange('lifecycle')}
          >
            Lifecycle
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'config'}
            className={cn(tab === 'config' && 'is-on')}
            onClick={() => onTabChange('config')}
          >
            Configuration
            {needsYou > 0 && <i>{needsYou}</i>}
          </button>
        </div>
        <button
          type="button"
          className="sr-life-rail__toggle"
          aria-label="Collapse rail"
          onClick={onToggle}
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      {tab === 'config' ? (
        <div className="sr-life-rail__body">
          <p className="sr-rail-note">
            Automation that covers a load end to end — the rules, and every run they produced.
          </p>

          <nav className="sr-rail-nav">
            <button
              type="button"
              className={cn('sr-rail-nav__item', configView === 'workflows' && 'is-active')}
              onClick={() => onConfigView('workflows')}
            >
              <Workflow size={14} strokeWidth={1.9} />
              <span>
                Workflows
                <em>
                  {enabledCount} of {workflowCount} enabled
                </em>
              </span>
              <b>{workflowCount}</b>
            </button>

            <button
              type="button"
              className={cn('sr-rail-nav__item', configView === 'runs' && 'is-active')}
              onClick={() => onConfigView('runs')}
            >
              <Radio size={14} strokeWidth={1.9} />
              <span>
                Live runs
                <em>{needsYou > 0 ? `${needsYou} waiting on you` : 'nothing waiting'}</em>
              </span>
              <b className={cn(needsYou > 0 && 'is-alert')}>{runsLive}</b>
            </button>

            <button
              type="button"
              className={cn('sr-rail-nav__item', configView === 'new' && 'is-active')}
              onClick={() => onConfigView('new')}
            >
              <PlusCircle size={14} strokeWidth={1.9} />
              <span>
                New workflow
                <em>pre-filled, priced live</em>
              </span>
            </button>
          </nav>
        </div>
      ) : (
      <div className="sr-life-rail__body">
        <button
          type="button"
          className={cn(
            'sr-life-rail__all',
            stage === 'ALL' && subStage === 'ALL' && 'is-active'
          )}
          onClick={onSelectAll}
        >
          <span>All Stages</span>
          <strong>{LIFECYCLE_DISPLAY.all.toLocaleString()}</strong>
        </button>

        <ol className="sr-tl">
          {LIFECYCLE_DISPLAY.stages.map((block) => {
            const stageActive = stage === block.stage && subStage === 'ALL'
            const inStage = stage === block.stage
            return (
              <li
                key={block.stage}
                className={cn('sr-tl-stage', inStage && 'is-on', stageActive && 'is-active')}
              >
                <button
                  type="button"
                  className="sr-tl-stage__row"
                  onClick={() => {
                    if (stage === block.stage && subStage === 'ALL') onSelectAll()
                    else onSelectStage(block.stage)
                  }}
                >
                  <i className="sr-tl-stage__mark">{block.number}</i>
                  <span className="sr-tl-stage__name">{block.stage}</span>
                  <em className="sr-tl-stage__count">{block.count.toLocaleString()}</em>
                </button>

                <ul className="sr-tl-subs">
                  {block.items.map((item) => {
                    const subActive = subStage === item.label
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          className={cn('sr-tl-sub', subActive && 'is-active')}
                          onClick={() =>
                            onSelectSubStage(block.stage, subActive ? 'ALL' : item.label)
                          }
                        >
                          <i className="sr-tl-sub__mark" aria-hidden />
                          <span>{item.label}</span>
                          <em>{item.count.toLocaleString()}</em>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </li>
            )
          })}
        </ol>
      </div>
      )}
    </aside>
  )
}
