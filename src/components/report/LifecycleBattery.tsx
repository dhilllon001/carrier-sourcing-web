import { cn } from '@/lib/cn'
import type { countLifecycle } from '@/data/report'

type LifecycleBlock = ReturnType<typeof countLifecycle>[number]
type StageName = LifecycleBlock['stage']

type LifecycleBatteryProps = {
  blocks: LifecycleBlock[]
  totalCount: number
  stage: string
  subStage: string
  onSelectAll: () => void
  onSelectStage: (stage: StageName) => void
  onSelectSubStage: (stage: StageName, subStage: string) => void
}

export function LifecycleBattery({
  blocks,
  totalCount,
  stage,
  subStage,
  onSelectAll,
  onSelectStage,
  onSelectSubStage,
}: LifecycleBatteryProps) {
  const max = Math.max(...blocks.map((b) => b.count), 1)
  const activeBlock = blocks.find((b) => b.stage === stage)

  return (
    <section className="sr-pipeline" aria-label="Lifecycle pipeline">
      <div className="sr-pipeline__row" role="list">
        <button
          type="button"
          className={cn(
            'sr-pipeline__seg sr-pipeline__seg--all',
            stage === 'ALL' && subStage === 'ALL' && 'is-active'
          )}
          onClick={onSelectAll}
          role="listitem"
        >
          <span className="sr-pipeline__name">All</span>
          <span className="sr-pipeline__value">{totalCount.toLocaleString()}</span>
        </button>

        {blocks.map((block) => {
          const fill = Math.max(12, (block.count / max) * 100)
          const stageActive = stage === block.stage
          return (
            <button
              key={block.stage}
              type="button"
              role="listitem"
              className={cn('sr-pipeline__seg', stageActive && 'is-active')}
              onClick={() => onSelectStage(block.stage)}
            >
              <span className="sr-pipeline__num">{block.number}</span>
              <span className="sr-pipeline__name">{block.stage}</span>
              <span className="sr-pipeline__value">{block.count.toLocaleString()}</span>
              <span className="sr-pipeline__meter" aria-hidden>
                <span style={{ width: `${fill}%` }} />
              </span>
            </button>
          )
        })}
      </div>

      {activeBlock && (
        <div className="sr-pipeline__subs" role="list">
          {activeBlock.items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="listitem"
              className={cn('sr-pipeline__sub', subStage === item.label && 'is-active')}
              onClick={() => onSelectSubStage(activeBlock.stage, item.label)}
            >
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
