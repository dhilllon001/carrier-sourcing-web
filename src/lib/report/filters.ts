export type AppliedFilterChip = {
  key: string
  label: string
  value: string
  onClear: () => void
}

export type ColFilterDef = {
  key: string
  label: string
  type: 'text' | 'range'
}

export type DatePreset = {
  id: string
  label: string
}

export function selectApplied<T extends Record<string, unknown>>(
  filters: T,
  defs: { key: keyof T; label: string }[],
  patch: (p: Partial<T>) => void,
  defaultVal = 'ALL'
): AppliedFilterChip[] {
  return defs
    .filter((d) => {
      const v = filters[d.key]
      return v != null && v !== defaultVal && v !== ''
    })
    .map((d) => ({
      key: String(d.key),
      label: d.label,
      value: String(filters[d.key]),
      onClear: () => patch({ [d.key]: defaultVal } as Partial<T>),
    }))
}

export function searchApplied(search: string, onClear: () => void): AppliedFilterChip[] {
  if (!search.trim()) return []
  return [{ key: 'search', label: 'Search', value: search, onClear }]
}

export function presetApplied(
  presetId: string,
  presets: DatePreset[],
  defaultId: string,
  patch: (presetId: string) => void
): AppliedFilterChip[] {
  if (!presetId || presetId === defaultId) return []
  const preset = presets.find((p) => p.id === presetId)
  return [
    {
      key: 'datePreset',
      label: 'Period',
      value: preset?.label ?? presetId,
      onClear: () => patch(defaultId),
    },
  ]
}

export function dateRangeApplied(
  from: string,
  to: string,
  defaults: { from: string; to: string },
  patch: (next: { dateFrom?: string; dateTo?: string }) => void
): AppliedFilterChip[] {
  const chips: AppliedFilterChip[] = []
  if (from && from !== defaults.from) {
    chips.push({
      key: 'dateFrom',
      label: 'From',
      value: from,
      onClear: () => patch({ dateFrom: defaults.from }),
    })
  }
  if (to && to !== defaults.to) {
    chips.push({
      key: 'dateTo',
      label: 'To',
      value: to,
      onClear: () => patch({ dateTo: defaults.to }),
    })
  }
  return chips
}

export function multiSelectApplied<T extends Record<string, unknown>>(
  filters: T,
  key: keyof T,
  label: string,
  patch: (p: Partial<T>) => void,
  defaultVal: string[] = []
): AppliedFilterChip[] {
  const raw = filters[key]
  const values = Array.isArray(raw) ? (raw as string[]) : []
  if (values.length === 0 || JSON.stringify(values) === JSON.stringify(defaultVal)) return []
  return [
    {
      key: String(key),
      label,
      value: values.join(', '),
      onClear: () => patch({ [key]: defaultVal } as Partial<T>),
    },
  ]
}

export function colFiltersApplied(
  colFilters: Record<string, string | { min?: string; max?: string }>,
  cols: ColFilterDef[],
  onPatch: (next: Record<string, string | { min?: string; max?: string }>) => void
): AppliedFilterChip[] {
  const chips: AppliedFilterChip[] = []
  for (const col of cols) {
    const v = colFilters[col.key]
    if (!v) continue
    if (col.type === 'text' && typeof v === 'string' && v.trim()) {
      chips.push({
        key: `col-${col.key}`,
        label: col.label,
        value: `contains "${v}"`,
        onClear: () => {
          const next = { ...colFilters }
          delete next[col.key]
          onPatch(next)
        },
      })
    }
    if (col.type === 'range' && typeof v === 'object') {
      const { min, max } = v
      if (min || max) {
        chips.push({
          key: `col-${col.key}`,
          label: col.label,
          value: [min && `≥${min}`, max && `≤${max}`].filter(Boolean).join(' '),
          onClear: () => {
            const next = { ...colFilters }
            delete next[col.key]
            onPatch(next)
          },
        })
      }
    }
  }
  return chips
}

export function countActiveFilters(
  filters: Record<string, unknown>,
  selectKeys: string[],
  colFilters: Record<string, unknown>,
  defaultVal = 'ALL'
): number {
  let n = 0
  if (filters.search && String(filters.search).trim()) n++
  for (const k of selectKeys) {
    if (filters[k] != null && filters[k] !== defaultVal && filters[k] !== '') n++
  }
  n += Object.keys(colFilters).filter((k) => {
    const v = colFilters[k]
    if (typeof v === 'string') return v.trim() !== ''
    if (typeof v === 'object' && v) {
      const range = v as { min?: string; max?: string }
      return !!(range.min || range.max)
    }
    return false
  }).length
  return n
}

export function matchesColFilter(
  value: string | number | undefined,
  filter: string | { min?: string; max?: string } | undefined
): boolean {
  if (!filter) return true
  if (typeof filter === 'string') {
    if (!filter.trim()) return true
    return String(value ?? '')
      .toLowerCase()
      .includes(filter.toLowerCase())
  }
  const num = typeof value === 'number' ? value : parseFloat(String(value ?? ''))
  if (filter.min && !Number.isNaN(num) && num < parseFloat(filter.min)) return false
  if (filter.max && !Number.isNaN(num) && num > parseFloat(filter.max)) return false
  return true
}
