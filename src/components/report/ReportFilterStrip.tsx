import { X } from 'lucide-react'

export type FilterStripItem = {
  key: string
  label: string
  active?: boolean
  onClick?: () => void
  onClear?: () => void
}

type ReportFilterStripProps = {
  items: FilterStripItem[]
  activeCount?: number
  onReset?: () => void
  children?: React.ReactNode
}

function SrFilterChip({ label, active, onClick, onClear }: Omit<FilterStripItem, 'key'>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`sr-filter-chip${active ? ' is-active' : ''}`}
    >
      {label}
      {active && onClear && (
        <span
          role="button"
          tabIndex={0}
          aria-label={`Clear ${label}`}
          onClick={(e) => {
            e.stopPropagation()
            onClear()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onClear()
            }
          }}
          style={{ display: 'inline-flex', borderRadius: 999, padding: 2 }}
        >
          <X size={11} strokeWidth={2.5} />
        </span>
      )}
    </button>
  )
}

export function ReportFilterStrip({
  items,
  activeCount = 0,
  onReset,
  children,
}: ReportFilterStripProps) {
  return (
    <div className="sr-filter-strip">
      {children}
      {items.map((item) => (
        <SrFilterChip
          key={item.key}
          label={item.label}
          active={item.active}
          onClick={item.onClick}
          onClear={item.onClear}
        />
      ))}
      {activeCount > 0 && onReset && (
        <button type="button" className="sr-btn sr-btn--ghost sr-btn--sm" onClick={onReset}>
          Reset ({activeCount})
        </button>
      )}
    </div>
  )
}
