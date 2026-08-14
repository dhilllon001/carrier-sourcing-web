import { ChevronLeft, Layers } from 'lucide-react'
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
  if (collapsed) {
    return (
      <button
        type="button"
        className="sr-life-float"
        aria-label="Expand lifecycle stages"
        onClick={onToggle}
      >
        <Layers size={14} strokeWidth={2} />
        <span>Stages</span>
      </button>
    )
  }

  return (
    <aside className="sr-life-rail">
      <div className="sr-life-rail__head">
        <div className="sr-life-rail__eyebrow">Lifecycle</div>
        <button
          type="button"
          className="sr-life-rail__toggle"
          aria-label="Collapse lifecycle"
          onClick={onToggle}
        >
          <ChevronLeft size={14} />
        </button>
      </div>

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
                  <i className="sr-tl-stage__mark">{Number(block.number)}</i>
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
    </aside>
  )
}
