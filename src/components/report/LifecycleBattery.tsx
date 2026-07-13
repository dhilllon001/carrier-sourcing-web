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

  return (
    <section className="sr-battery" aria-label="Lifecycle filters">
      <div className="sr-battery__head">
        <div>
          <div className="sr-battery__eyebrow">Lifecycle</div>
          <h2 className="sr-battery__title">Pipeline stages</h2>
        </div>
        <button
          type="button"
          className={cn('sr-battery__all', stage === 'ALL' && subStage === 'ALL' && 'is-active')}
          onClick={onSelectAll}
        >
          All stages
          <strong>{totalCount.toLocaleString()}</strong>
        </button>
      </div>

      <div className="sr-battery__track" role="list">
        {blocks.map((block) => {
          const fill = Math.max(8, (block.count / max) * 100)
          const stageActive = stage === block.stage && subStage === 'ALL'
          return (
            <div key={block.stage} className="sr-battery__cell" role="listitem">
              <button
                type="button"
                className={cn('sr-battery__stage', stageActive && 'is-active')}
                onClick={() => onSelectStage(block.stage)}
              >
                <div className="sr-battery__stage-top">
                  <span className="sr-battery__num">{block.number}</span>
                  <span className="sr-battery__stage-name">{block.stage}</span>
                  <span className="sr-battery__count">{block.count.toLocaleString()}</span>
                </div>
                <div className="sr-battery__meter" aria-hidden>
                  <span className="sr-battery__meter-fill" style={{ width: `${fill}%` }} />
                </div>
              </button>

              <div className="sr-battery__subs">
                {block.items.map((item) => {
                  const active = subStage === item.label
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className={cn('sr-battery__sub', active && 'is-active')}
                      onClick={() => onSelectSubStage(block.stage, item.label)}
                    >
                      <span>{item.label}</span>
                      <span className="sr-battery__sub-count">{item.count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
