import type { ReactNode } from 'react'

/** Shared "Next actions" bar — same treatment on every stage workspace.
 *  `label` and `workflow` are still accepted so call sites don't need to change,
 *  but the bar leads with Next actions instead of stage chips. */
export function StageActionBar({
  leading,
  actions,
}: {
  label?: string
  workflow?: string | null
  leading?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="dd-acts">
      <span className="dd-acts__label">Next actions</span>
      {leading ? <div className="dd-acts__lead">{leading}</div> : null}
      {actions ? <div className="dd-acts__row">{actions}</div> : null}
    </div>
  )
}
