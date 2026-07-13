import type { ReactNode } from 'react'

/** Shared top action bar — same pattern as Find & Post across all stages. */
export function StageActionBar({
  label,
  workflow = 'Workflow · Simultaneous',
  leading,
  actions,
}: {
  label?: string
  workflow?: string | null
  leading?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="dd-find__bar dd-stage-bar">
      {leading}
      {label ? <span className="dd-chip-soft">{label}</span> : null}
      {workflow ? <span className="dd-chip-soft">{workflow}</span> : null}
      {actions ? <div className="dd-find__actions">{actions}</div> : null}
    </div>
  )
}
