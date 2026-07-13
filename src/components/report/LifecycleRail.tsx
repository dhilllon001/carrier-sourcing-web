import { useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [openStages, setOpenStages] = useState<Record<string, boolean>>({
    Sourcing: true,
    Tender: true,
    Award: true,
    Booking: true,
  })

  const toggleOpen = (stageName: string) => {
    setOpenStages((prev) => ({ ...prev, [stageName]: !prev[stageName] }))
  }

  return (
    <aside className={cn('sr-life-rail', collapsed && 'is-collapsed')}>
      <div className="sr-life-rail__head">
        {!collapsed && <div className="sr-life-rail__eyebrow">Lifecycle</div>}
        <button
          type="button"
          className="sr-life-rail__toggle"
          aria-label={collapsed ? 'Expand lifecycle' : 'Collapse lifecycle'}
          onClick={onToggle}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {!collapsed && (
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

          <div className="sr-life-rail__sections">
            {LIFECYCLE_DISPLAY.stages.map((block) => {
              const isOpen = openStages[block.stage] !== false
              const stageActive = stage === block.stage && subStage === 'ALL'
              return (
                <section
                  key={block.stage}
                  className={cn('sr-life-section', stageActive && 'is-active')}
                >
                  <div className="sr-life-section__head">
                    <button
                      type="button"
                      className={cn(
                        'sr-life-section__stage',
                        stageActive && 'is-active'
                      )}
                      onClick={() => {
                        if (stage === block.stage && subStage === 'ALL') onSelectAll()
                        else onSelectStage(block.stage)
                      }}
                    >
                      <span className="sr-life-section__num">{block.number}</span>
                      <span className="sr-life-section__name">{block.stage}</span>
                      <span className="sr-life-section__badge">
                        {block.count.toLocaleString()}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="sr-life-section__chevron"
                      aria-label={isOpen ? `Collapse ${block.stage}` : `Expand ${block.stage}`}
                      aria-expanded={isOpen}
                      onClick={() => toggleOpen(block.stage)}
                    >
                      <ChevronDown
                        size={14}
                        className={cn(!isOpen && 'is-rotated')}
                      />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="sr-life-section__body">
                      {block.items.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          className={cn(
                            'sr-life-section__sub',
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
                          <span className="sr-life-section__sub-count">
                            {item.count.toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </div>
      )}

      {collapsed && (
        <div className="sr-life-rail__mini">
          <button
            type="button"
            className={cn(
              'sr-life-rail__mini-btn',
              stage === 'ALL' && subStage === 'ALL' && 'is-active'
            )}
            title="All Stages"
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
