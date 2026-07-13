import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Plus, Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'

export const SUGGESTED_TAGS = [
  'Hot lane',
  'Priority',
  'Hazmat',
  'Team driver',
  'Drop trailer',
  'Border',
  'Appointment',
  'High value',
  'Reefer',
  'Power only',
] as const

type TagPopoverProps = {
  tags: string[]
  onChange: (tags: string[]) => void
}

type PanelPos = { top: number; left: number; width: number }

export function TagPopover({ tags, onChange }: TagPopoverProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState<PanelPos | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const place = () => {
    const btn = btnRef.current
    if (!btn) return
    const r = btn.getBoundingClientRect()
    const width = 300
    const pad = 10
    const left = Math.min(
      Math.max(pad, r.left),
      window.innerWidth - width - pad
    )
    const below = r.bottom + 8
    const panelH = panelRef.current?.offsetHeight ?? 360
    const top =
      below + panelH > window.innerHeight - pad
        ? Math.max(pad, r.top - panelH - 8)
        : below
    setPos({ top, left, width })
  }

  useLayoutEffect(() => {
    if (!open) return
    place()
    const onScroll = () => place()
    window.addEventListener('resize', onScroll)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, tags.length, query])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = SUGGESTED_TAGS.filter((t) => !q || t.toLowerCase().includes(q))
    const customMatch =
      q &&
      !SUGGESTED_TAGS.some((t) => t.toLowerCase() === q) &&
      !tags.some((t) => t.toLowerCase() === q)
        ? [`Create “${query.trim()}”`]
        : []
    return [...base, ...customMatch]
  }, [query, tags])

  const toggle = (tag: string) => {
    if (tags.includes(tag)) onChange(tags.filter((t) => t !== tag))
    else onChange([...tags, tag])
  }

  const createOrToggle = (item: string) => {
    if (item.startsWith('Create “')) {
      const name = query.trim()
      if (!name) return
      if (!tags.includes(name)) onChange([...tags, name])
      setQuery('')
      return
    }
    toggle(item)
  }

  return (
    <div className="sr-tag-pop">
      <button
        ref={btnRef}
        type="button"
        className={cn('sr-tag-btn', tags.length > 0 && 'has-tags', open && 'is-open')}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
      >
        {tags.length === 0 ? (
          <>
            <Plus size={12} strokeWidth={2.25} />
            Tag
          </>
        ) : (
          <>
            <span className="sr-tag-btn__count">{tags.length}</span>
            <span className="sr-tag-btn__label">{tags[0]}</span>
            {tags.length > 1 ? (
              <span className="sr-tag-btn__more">+{tags.length - 1}</span>
            ) : null}
          </>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            className="sr-tag-panel"
            role="dialog"
            aria-label="Add tags"
            style={
              pos
                ? { top: pos.top, left: pos.left, width: pos.width }
                : { visibility: 'hidden', top: 0, left: 0 }
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sr-tag-panel__head">
              <div>
                <div className="sr-tag-panel__title">Tags</div>
                <div className="sr-tag-panel__subtitle">
                  Organize this load for your desk
                </div>
              </div>
              <button
                type="button"
                className="sr-tag-panel__close"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                <X size={14} />
              </button>
            </div>

            <label className="sr-tag-panel__search">
              <Search size={14} strokeWidth={1.75} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search or create a tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filtered[0]) {
                    e.preventDefault()
                    createOrToggle(filtered[0])
                  }
                }}
              />
            </label>

            {tags.length > 0 && (
              <div className="sr-tag-panel__applied">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="sr-tag-chip is-on"
                    onClick={() => toggle(tag)}
                  >
                    {tag}
                    <X size={11} strokeWidth={2.25} />
                  </button>
                ))}
              </div>
            )}

            <div className="sr-tag-panel__list">
              <div className="sr-tag-panel__label">Suggestions</div>
              {filtered.length === 0 && (
                <div className="sr-tag-panel__empty">No matching tags</div>
              )}
              {filtered.map((item) => {
                const isCreate = item.startsWith('Create “')
                const active = !isCreate && tags.includes(item)
                return (
                  <button
                    key={item}
                    type="button"
                    className={cn(
                      'sr-tag-option',
                      active && 'is-active',
                      isCreate && 'is-create'
                    )}
                    onClick={() => createOrToggle(item)}
                  >
                    <span>{item}</span>
                    {active && <Check size={14} strokeWidth={2.25} />}
                    {isCreate && <Plus size={14} strokeWidth={2.25} />}
                  </button>
                )
              })}
            </div>

            <div className="sr-tag-panel__foot">
              <span>{tags.length} selected</span>
              <button type="button" onClick={() => setOpen(false)}>
                Done
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
