import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useStageActionSlot } from './stageActionSlot'

/** Stage actions.
 *  In the case shell the buttons are portalled up into the work bar so they share the
 *  row with the Auto Sourcing / Auto Tender button; only filters stay with the content.
 *  Elsewhere the old standalone bar is kept. */
export function StageActionBar({
  leading,
  actions,
}: {
  label?: string
  workflow?: string | null
  leading?: ReactNode
  actions?: ReactNode
}) {
  const slot = useStageActionSlot()

  if (slot) {
    return (
      <>
        {actions ? createPortal(actions, slot) : null}
        {leading ? <div className="dd-acts dd-acts--lead-only">{leading}</div> : null}
      </>
    )
  }

  return (
    <div className="dd-acts">
      <span className="dd-acts__label">Next actions</span>
      {leading ? <div className="dd-acts__lead">{leading}</div> : null}
      {actions ? <div className="dd-acts__row">{actions}</div> : null}
    </div>
  )
}
