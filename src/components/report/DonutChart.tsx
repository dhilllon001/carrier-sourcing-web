import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

export type DonutSlice = {
  id: string
  label: string
  value: number
  color: string
}

type DonutChartProps = {
  slices: DonutSlice[]
  centerLabel?: string
  selectedIds?: string[]
  onSliceClick?: (id: string) => void
}

const SIZE = 168
const STROKE = 26
const R = (SIZE - STROKE) / 2

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(startAngle: number, endAngle: number) {
  const start = polarToCartesian(SIZE / 2, SIZE / 2, R, endAngle)
  const end = polarToCartesian(SIZE / 2, SIZE / 2, R, startAngle)
  const large = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${R} ${R} 0 ${large} 0 ${end.x} ${end.y}`
}

export function DonutChart({
  slices,
  centerLabel = 'loads',
  selectedIds = [],
  onSliceClick,
}: DonutChartProps) {
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)

  const total = useMemo(() => slices.reduce((s, x) => s + x.value, 0), [slices])

  const arcs = useMemo(() => {
    let angle = 0
    return slices.map((slice) => {
      const sweep = total === 0 ? 0 : (slice.value / total) * 360
      const start = angle
      const end = angle + Math.max(sweep, 0.01)
      angle = end
      return { ...slice, start, end, pct: total === 0 ? 0 : (slice.value / total) * 100 }
    })
  }, [slices, total])

  const active = arcs.find((a) => a.id === hoverId)
  const hasSelection = selectedIds.length > 0

  return (
    <div className="sr-donut">
      <div className="sr-donut__chart">
        <svg className="sr-donut__svg" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Distribution">
          {arcs.map((arc) => {
            const isActive = hoverId === arc.id || selectedIds.includes(arc.id)
            const isDim =
              (hoverId != null && hoverId !== arc.id) ||
              (hasSelection && !selectedIds.includes(arc.id) && hoverId == null)
            return (
              <path
                key={arc.id}
                d={describeArc(arc.start, arc.end)}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE}
                strokeLinecap="butt"
                className={cn('sr-donut__seg', isActive && 'is-active', isDim && 'is-dim')}
                tabIndex={0}
                role="button"
                aria-label={`${arc.label}: ${arc.value}`}
                aria-pressed={selectedIds.includes(arc.id)}
                onMouseEnter={(e) => {
                  setHoverId(arc.id)
                  setPointer({ x: e.clientX, y: e.clientY })
                }}
                onMouseMove={(e) => setPointer({ x: e.clientX, y: e.clientY })}
                onMouseLeave={() => {
                  setHoverId(null)
                  setPointer(null)
                }}
                onFocus={() => setHoverId(arc.id)}
                onBlur={() => setHoverId(null)}
                onClick={() => onSliceClick?.(arc.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSliceClick?.(arc.id)
                  }
                }}
              />
            )
          })}
          {/* invisible full ring fallback when empty */}
          {arcs.length === 0 && (
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="var(--sr-border-2)"
              strokeWidth={STROKE}
            />
          )}
        </svg>
        <div className="sr-donut__center">
          <strong>{active ? active.value.toLocaleString() : total.toLocaleString()}</strong>
          <span>{active ? active.label : centerLabel}</span>
        </div>
      </div>

      <div className="sr-donut__legend">
        {arcs.map((arc) => {
          const isActive = hoverId === arc.id || selectedIds.includes(arc.id)
          const isDim =
            (hoverId != null && hoverId !== arc.id) ||
            (hasSelection && !selectedIds.includes(arc.id) && hoverId == null)
          return (
            <button
              key={arc.id}
              type="button"
              className={cn(
                'sr-donut__legend-item',
                isActive && 'is-active',
                isDim && 'is-dim'
              )}
              onMouseEnter={() => setHoverId(arc.id)}
              onMouseLeave={() => setHoverId(null)}
              onFocus={() => setHoverId(arc.id)}
              onBlur={() => setHoverId(null)}
              onClick={() => onSliceClick?.(arc.id)}
            >
              <span className="sr-donut__swatch" style={{ background: arc.color }} />
              <span className="sr-donut__legend-label">{arc.label}</span>
              <span className="sr-donut__legend-value">{arc.value.toLocaleString()}</span>
            </button>
          )
        })}
      </div>

      {active && pointer &&
        createPortal(
          <div
            className="sr-chart-tooltip"
            style={{ left: pointer.x + 12, top: pointer.y + 12 }}
            role="tooltip"
          >
            <div className="sr-chart-tooltip__label">{active.label}</div>
            <div className="sr-chart-tooltip__value">{active.value.toLocaleString()}</div>
            <div className="sr-chart-tooltip__pct">{active.pct.toFixed(1)}%</div>
          </div>,
          document.body
        )}

    </div>
  )
}
