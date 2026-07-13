import { X } from 'lucide-react'
import type { AppliedFilterChip } from '@/lib/report/filters'
import { cn } from '@/lib/cn'

type AppliedFiltersRowProps = {
  chips: AppliedFilterChip[]
  onClearAll?: () => void
}

function chipTone(chip: AppliedFilterChip) {
  if (chip.label.toLowerCase() !== 'mode') return null
  const v = chip.value.toLowerCase()
  if (v.includes('spot')) return 'spot'
  if (v.includes('expedited')) return 'expedited'
  if (v.includes('managed')) return 'managed'
  if (v.includes('mexico')) return 'mexico'
  if (v.includes('power') || v === 'p/o') return 'power'
  return null
}

export function AppliedFiltersRow({ chips, onClearAll }: AppliedFiltersRowProps) {
  if (chips.length === 0) return null

  return (
    <div className="sr-applied-row">
      <span className="sr-applied-row__label">Filters</span>
      {chips.map((chip) => {
        const tone = chipTone(chip)
        return (
          <span
            key={chip.key}
            className={cn('sr-applied-pill', tone && `sr-applied-pill--${tone}`)}
          >
            <span>
              {chip.label}: <strong>{chip.value}</strong>
            </span>
            <button type="button" onClick={chip.onClear} aria-label={`Clear ${chip.label}`}>
              <X size={12} strokeWidth={2} />
            </button>
          </span>
        )
      })}
      {onClearAll && chips.length > 1 && (
        <button type="button" className="sr-btn sr-btn--ghost sr-btn--sm" onClick={onClearAll}>
          Clear all
        </button>
      )}
    </div>
  )
}
