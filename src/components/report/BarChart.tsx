import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

export type BarItem = {
  id: string
  label: string
  value: number
}

type BarChartProps = {
  items: BarItem[]
  selectedIds?: string[]
  onBarClick?: (id: string) => void
}

export function BarChart({ items, selectedIds = [], onBarClick }: BarChartProps) {
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)
  const max = useMemo(() => Math.max(...items.map((i) => i.value), 1), [items])
  const total = useMemo(() => items.reduce((s, i) => s + i.value, 0), [items])
  const active = items.find((i) => i.id === hoverId)
  const hasSelection = selectedIds.length > 0

  return (
    <div className="sr-bar-chart">
      {items.map((item) => {
        const isActive = hoverId === item.id || selectedIds.includes(item.id)
        const isDim =
          (hoverId != null && hoverId !== item.id) ||
          (hasSelection && !selectedIds.includes(item.id) && hoverId == null)
        const pct = total === 0 ? 0 : (item.value / total) * 100
        return (
          <button
            key={item.id}
            type="button"
            className={cn('sr-bar-row', isActive && 'is-active', isDim && 'is-dim')}
            onMouseEnter={(e) => {
              setHoverId(item.id)
              setPointer({ x: e.clientX, y: e.clientY })
            }}
            onMouseMove={(e) => setPointer({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => {
              setHoverId(null)
              setPointer(null)
            }}
            onFocus={() => setHoverId(item.id)}
            onBlur={() => setHoverId(null)}
            onClick={() => onBarClick?.(item.id)}
          >
            <span className="sr-bar-row__label">{item.label}</span>
            <span className="sr-bar-row__track">
              <span
                className="sr-bar-row__fill"
                style={{ width: `${(item.value / max) * 100}%` }}
                data-pct={pct.toFixed(1)}
              />
            </span>
            <span className="sr-bar-row__value">{item.value.toLocaleString()}</span>
          </button>
        )
      })}

      {active && pointer &&
        createPortal(
          <div
            className="sr-chart-tooltip"
            style={{ left: pointer.x + 12, top: pointer.y + 12 }}
            role="tooltip"
          >
            <div className="sr-chart-tooltip__label">{active.label}</div>
            <div className="sr-chart-tooltip__value">{active.value.toLocaleString()}</div>
            <div className="sr-chart-tooltip__pct">
              {total === 0 ? '0.0' : ((active.value / total) * 100).toFixed(1)}%
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
