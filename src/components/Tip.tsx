import { useCallback, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type Placement = { left: number; top: number; flipped: boolean }

type Props = {
  /** What the tooltip says. Keep it to one short sentence. */
  tip: ReactNode
  children: ReactNode
  className?: string
  /** Render as a block so the wrapper can sit in a grid or flex row. */
  block?: boolean
  /** Override the wrapper tag when the parent expects a specific child. */
  as?: 'span' | 'div' | 'li'
}

const GAP = 9
const EDGE = 10

/**
 * Hover hint anchored to its trigger and drawn in a portal, so a card with
 * `overflow: hidden` can never clip it. Keyboard focus opens it too.
 */
export function Tip({ tip, children, className, block, as }: Props) {
  const host = useRef<HTMLElement | null>(null)
  const bubble = useRef<HTMLDivElement | null>(null)
  const [place, setPlace] = useState<Placement | null>(null)

  const position = useCallback(() => {
    const anchor = host.current?.getBoundingClientRect()
    if (!anchor) return
    /* Measure once open so the first frame can already be flipped or clamped. */
    const width = bubble.current?.offsetWidth ?? 240
    const height = bubble.current?.offsetHeight ?? 34
    const flipped = anchor.top - height - GAP < EDGE
    const left = Math.min(
      Math.max(EDGE, anchor.left + anchor.width / 2 - width / 2),
      Math.max(EDGE, window.innerWidth - width - EDGE)
    )
    setPlace({
      left,
      top: flipped ? anchor.bottom + GAP : anchor.top - height - GAP,
      flipped,
    })
  }, [])

  const open = useCallback(() => {
    setPlace({ left: -9999, top: -9999, flipped: false })
    requestAnimationFrame(position)
  }, [position])

  const Wrapper = as ?? (block ? 'div' : 'span')

  return (
    <>
      <Wrapper
        ref={host as never}
        className={className}
        onMouseEnter={open}
        onMouseLeave={() => setPlace(null)}
        onFocus={open}
        onBlur={() => setPlace(null)}
      >
        {children}
      </Wrapper>

      {place
        ? createPortal(
            <div
              ref={bubble}
              role="tooltip"
              className={`sr-tip${place.flipped ? ' is-below' : ''}`}
              style={{ left: place.left, top: place.top }}
            >
              {tip}
            </div>,
            document.body
          )
        : null}
    </>
  )
}
