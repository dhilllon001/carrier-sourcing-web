import { X } from 'lucide-react'
import type { AppliedFilterChip } from '@/lib/report/filters'

type AppliedFiltersRowProps = {
  chips: AppliedFilterChip[]
  onClearAll?: () => void
}

export function AppliedFiltersRow({ chips, onClearAll }: AppliedFiltersRowProps) {
  if (chips.length === 0) return null

  return (
    <div className="sr-applied-row">
      <span
        className="sr-applied-row__label"
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}
      >
        Filtered
      </span>
      {chips.map((chip) => (
        <span key={chip.key} className="sr-applied-pill">
          <span>
            {chip.label}: <strong>{chip.value}</strong>
          </span>
          <button type="button" onClick={chip.onClear} aria-label={`Clear ${chip.label}`}>
            <X size={12} strokeWidth={2} />
          </button>
        </span>
      ))}
      {onClearAll && chips.length > 1 && (
        <button type="button" className="sr-btn sr-btn--ghost sr-btn--sm" onClick={onClearAll}>
          Clear all
        </button>
      )}
    </div>
  )
}
