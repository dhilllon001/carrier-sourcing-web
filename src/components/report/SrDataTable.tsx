import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { useRowHover } from '@/hooks/useRowHover'
import { RowHoverPopover, type HoverDetail } from './RowHoverPopover'
import { ColumnFilterHeader } from './ColumnFilterHeader'

export type SrColumn<T> = {
  key: string
  header: string
  align?: 'left' | 'right'
  filter?: { type: 'text' | 'range' }
  className?: string
  thClassName?: string
  width?: number
  minWidth?: number
  cell: (row: T) => React.ReactNode
}

type SrDataTableProps<T extends { id: string }> = {
  rows: T[]
  columns: SrColumn<T>[]
  colFilters?: Record<string, string | { min?: string; max?: string }>
  onColFilterChange?: (next: Record<string, string | { min?: string; max?: string }>) => void
  selectedIds?: Set<string>
  onRowClick?: (row: T) => void
  hoverTitle?: (row: T) => string
  hoverSubtitle?: (row: T) => string
  hoverDetails?: (row: T) => HoverDetail[]
  footer?: { label: string; cells: React.ReactNode[] }
  footerBar?: string
  emptyTitle?: string
  emptyHint?: string
  maxHeight?: string
  tableClassName?: string
  wrapClassName?: string
  resizable?: boolean
}

export function SrDataTable<T extends { id: string }>({
  rows,
  columns,
  colFilters = {},
  onColFilterChange,
  selectedIds,
  onRowClick,
  hoverTitle,
  hoverSubtitle,
  hoverDetails,
  footer,
  footerBar,
  emptyTitle = 'No rows',
  emptyHint,
  maxHeight = 'min(58vh, 640px)',
  tableClassName,
  wrapClassName,
  resizable = true,
}: SrDataTableProps<T>) {
  const rowHover = useRowHover<T>()
  const showHover = Boolean(hoverTitle && hoverDetails)

  const defaultWidths = useMemo(
    () =>
      Object.fromEntries(
        columns.map((col) => [col.key, col.width ?? 120])
      ) as Record<string, number>,
    [columns]
  )

  const [widths, setWidths] = useState<Record<string, number>>(defaultWidths)
  const dragRef = useRef<{
    key: string
    startX: number
    startW: number
  } | null>(null)

  useEffect(() => {
    setWidths((prev) => {
      const next = { ...prev }
      for (const col of columns) {
        if (next[col.key] == null) next[col.key] = col.width ?? 120
      }
      return next
    })
  }, [columns])

  const onResizeMove = useCallback(
    (e: MouseEvent) => {
      const drag = dragRef.current
      if (!drag) return
      const col = columns.find((c) => c.key === drag.key)
      const min = col?.minWidth ?? 64
      const next = Math.max(min, drag.startW + (e.clientX - drag.startX))
      setWidths((prev) => ({ ...prev, [drag.key]: next }))
    },
    [columns]
  )

  const onResizeUp = useCallback(() => {
    dragRef.current = null
    document.body.classList.remove('sr-col-resizing')
    window.removeEventListener('mousemove', onResizeMove)
    window.removeEventListener('mouseup', onResizeUp)
  }, [onResizeMove])

  const startResize = (key: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = {
      key,
      startX: e.clientX,
      startW: widths[key] ?? defaultWidths[key] ?? 120,
    }
    document.body.classList.add('sr-col-resizing')
    window.addEventListener('mousemove', onResizeMove)
    window.addEventListener('mouseup', onResizeUp)
  }

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', onResizeMove)
      window.removeEventListener('mouseup', onResizeUp)
      document.body.classList.remove('sr-col-resizing')
    }
  }, [onResizeMove, onResizeUp])

  const tableMinWidth = useMemo(
    () => columns.reduce((sum, col) => sum + (widths[col.key] ?? col.width ?? 120), 0),
    [columns, widths]
  )

  if (rows.length === 0) {
    return (
      <div className="sr-table-empty">
        <p style={{ fontWeight: 600, color: 'var(--sr-text-primary)', margin: 0 }}>{emptyTitle}</p>
        {emptyHint && (
          <p style={{ margin: '4px 0 0', fontSize: 12 }}>{emptyHint}</p>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={cn('sr-table-shell', wrapClassName?.includes('flush') && 'is-flush')}>
        <div className={cn('sr-table-wrap', wrapClassName)} style={{ maxHeight }}>
          <table
            className={cn('sr-table', tableClassName)}
            style={{ minWidth: tableMinWidth, width: '100%' }}
          >
            <colgroup>
              {columns.map((col) => (
                <col
                  key={col.key}
                  style={{ width: widths[col.key] ?? col.width ?? 120 }}
                />
              ))}
            </colgroup>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(col.align === 'right' && 'num', col.thClassName)}
                    style={{ width: widths[col.key] ?? col.width ?? 120 }}
                  >
                    <div className="sr-th-inner">
                      <div className="sr-th-label">
                        {col.filter && onColFilterChange ? (
                          <ColumnFilterHeader
                            label={col.header}
                            filterKey={col.key}
                            type={col.filter.type}
                            value={colFilters[col.key]}
                            onApply={(key, val) => {
                              const next = { ...colFilters }
                              if (val === undefined) delete next[key]
                              else next[key] = val
                              onColFilterChange(next)
                            }}
                          />
                        ) : (
                          col.header
                        )}
                      </div>
                      {resizable && (
                        <button
                          type="button"
                          className="sr-col-resizer"
                          aria-label={`Resize ${col.header} column`}
                          onMouseDown={(e) => startResize(col.key, e)}
                          onClick={(e) => e.stopPropagation()}
                          onDoubleClick={(e) => {
                            e.stopPropagation()
                            setWidths((prev) => ({
                              ...prev,
                              [col.key]: col.width ?? 120,
                            }))
                          }}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const selected = selectedIds?.has(row.id)
                const hoverProps = showHover ? rowHover.bind(row.id, row) : {}
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      showHover && 'sr-table-row--hoverable',
                      onRowClick && 'sr-table-row--clickable',
                      selected && 'is-selected',
                      rowHover.isHovered(row.id) && 'is-hovered'
                    )}
                    onClick={() => onRowClick?.(row)}
                    {...hoverProps}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(col.align === 'right' && 'num', col.className)}
                      >
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
            {footer && (
              <tfoot>
                <tr>
                  <td className="rep-name">{footer.label}</td>
                  {footer.cells.map((cell, i) => (
                    <td key={i} className="num mono">
                      {cell}
                    </td>
                  ))}
                  {columns.length > footer.cells.length + 1 &&
                    Array.from({ length: columns.length - footer.cells.length - 1 }).map((_, i) => (
                      <td key={`pad-${i}`} />
                    ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {footerBar && (
          <div className="sr-table-footerbar">
            <span>{footerBar}</span>
          </div>
        )}
      </div>

      {showHover && hoverTitle && hoverDetails && (
        <RowHoverPopover
          hover={rowHover.hover}
          getTitle={hoverTitle}
          getSubtitle={hoverSubtitle}
          getDetails={hoverDetails}
        />
      )}
    </>
  )
}
