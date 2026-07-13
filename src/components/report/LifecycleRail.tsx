import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { LIFECYCLE_DISPLAY } from '@/data/report'

type StageName = (typeof LIFECYCLE_DISPLAY.stages)[number]['stage']

type LifecycleRailProps = {
  collapsed: boolean
  onToggle: () => void
  stage: string
  subStage: string
  onSelectAll: () => void
  onSelectStage: (stage: StageName) => void
  onSelectSubStage: (stage: StageName, subStage: string) => void
}

export function LifecycleRail({
  collapsed,
  onToggle,
  stage,
  subStage,
  onSelectAll,
  onSelectStage,
  onSelectSubStage,
}: LifecycleRailProps) {
  return (
    <aside className={cn('sr-life-rail', collapsed && 'is-collapsed')}>
      <div className="sr-life-rail__head">
        {!collapsed && (
          <div>
            <div className="sr-life-rail__eyebrow">Lifecycle</div>
            <div className="sr-life-rail__title">Stages</div>
          </div>
        )}
        <button
          type="button"
          className="sr-life-rail__toggle"
          aria-label={collapsed ? 'Expand lifecycle' : 'Collapse lifecycle'}
          onClick={onToggle}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {!collapsed && (
        <>
          <button
            type="button"
            className={cn(
              'sr-life-rail__all',
              stage === 'ALL' && subStage === 'ALL' && 'is-active'
            )}
            onClick={onSelectAll}
          >
            <span>All stages</span>
            <strong>{LIFECYCLE_DISPLAY.all.toLocaleString()}</strong>
          </button>

          <div className="sr-life-rail__list">
            {LIFECYCLE_DISPLAY.stages.map((block) => {
              const stageActive = stage === block.stage && subStage === 'ALL'
              return (
                <div key={block.stage} className="sr-life-rail__block">
                  <button
                    type="button"
                    className={cn('sr-life-rail__stage', stageActive && 'is-active')}
                    onClick={() => {
                      if (stage === block.stage && subStage === 'ALL') onSelectAll()
                      else onSelectStage(block.stage)
                    }}
                    title={block.stage}
                  >
                    <span className="sr-life-rail__num">{block.number}</span>
                    <span className="sr-life-rail__name">{block.stage}</span>
                    <span className="sr-life-rail__count">{block.count.toLocaleString()}</span>
                  </button>

                  <div className="sr-life-rail__subs">
                    {block.items.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        className={cn(
                          'sr-life-rail__sub',
                          subStage === item.label && 'is-active'
                        )}
                        onClick={() =>
                          onSelectSubStage(
                            block.stage,
                            subStage === item.label ? 'ALL' : item.label
                          )
                        }
                      >
                        <span>{item.label}</span>
                        <span>{item.count.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {collapsed && (
        <div className="sr-life-rail__mini">
          <button
            type="button"
            className={cn(
              'sr-life-rail__mini-btn',
              stage === 'ALL' && subStage === 'ALL' && 'is-active'
            )}
            title="All stages"
            onClick={onSelectAll}
          >
            All
          </button>
          {LIFECYCLE_DISPLAY.stages.map((block) => (
            <button
              key={block.stage}
              type="button"
              className={cn(
                'sr-life-rail__mini-btn',
                stage === block.stage && 'is-active'
              )}
              title={`${block.stage} · ${block.count.toLocaleString()}`}
              onClick={() => onSelectStage(block.stage)}
            >
              {block.number}
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}
