import type { ReactNode } from 'react'
import { Lock, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'

export function ConfigCard({
  title,
  hint,
  right,
  children,
  className,
}: {
  title: string
  hint?: string
  right?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('cfg-card', className)}>
      <header className="cfg-card__head">
        <div>
          <h3>{title}</h3>
          {hint && <p>{hint}</p>}
        </div>
        {right}
      </header>
      <div className="cfg-card__body">{children}</div>
    </section>
  )
}

export function NumCard({
  n,
  title,
  hint,
  right,
  children,
  cardRef,
}: {
  n: number
  title: string
  hint?: string
  right?: ReactNode
  children: ReactNode
  cardRef?: (el: HTMLElement | null) => void
}) {
  return (
    <section className="cfg-card cfg-card--num" ref={cardRef}>
      <header className="cfg-card__head">
        <div className="cfg-card__lead">
          <span className="cfg-card__n" aria-hidden>
            {n}
          </span>
          <div>
            <h3>{title}</h3>
            {hint && <p>{hint}</p>}
          </div>
        </div>
        {right}
      </header>
      <div className="cfg-card__body">{children}</div>
    </section>
  )
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className={cn('cfg-switch', checked && 'is-on')}>
      <input
        type="checkbox"
        checked={checked}
        aria-label={label}
        onChange={(e) => onChange(e.target.checked)}
      />
      <i aria-hidden />
    </label>
  )
}

export function Field({
  label,
  hint,
  children,
  wide,
}: {
  label: string
  hint?: string
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div className={cn('cfg-field', wide && 'is-wide')}>
      <span className="cfg-field__label">{label}</span>
      {children}
      {hint && <span className="cfg-field__hint">{hint}</span>}
    </div>
  )
}

export function Chip({
  label,
  active,
  locked,
  onClick,
}: {
  label: string
  active?: boolean
  locked?: boolean
  onClick?: () => void
}) {
  if (locked) {
    return (
      <span className="cfg-chip is-locked">
        <Lock size={11} strokeWidth={2} />
        {label}
      </span>
    )
  }
  return (
    <button
      type="button"
      className={cn('cfg-chip', active && 'is-on')}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export function Stepper({
  value,
  onChange,
  step = 0.5,
  min = 0,
  max = 100,
  unit = '%',
}: {
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  max?: number
  unit?: string
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 100) / 100))
  return (
    <div className="cfg-step">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
      >
        <Minus size={13} strokeWidth={2.2} />
      </button>
      <span className="cfg-step__value">
        <strong>{value}</strong>
        <em>{unit}</em>
      </span>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
      >
        <Plus size={13} strokeWidth={2.2} />
      </button>
    </div>
  )
}

export function Metric({
  label,
  value,
  note,
  tone,
}: {
  label: string
  value: string
  note: string
  tone?: 'pos' | 'neg' | 'accent'
}) {
  return (
    <article className={cn('cfg-metric', tone && `is-${tone}`)}>
      <span className="cfg-metric__label">{label}</span>
      <strong className="cfg-metric__value">{value}</strong>
      <span className="cfg-metric__note">{note}</span>
    </article>
  )
}

export function money(n: number, currency = 'USD') {
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

export function plain(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
