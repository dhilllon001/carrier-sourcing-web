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
}: SrDataTableProps<T>) {
  const rowHover = useRowHover<T>()
  const showHover = Boolean(hoverTitle && hoverDetails)

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
          <table className={cn('sr-table', tableClassName)}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={cn(col.align === 'right' && 'num', col.thClassName)}>
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
