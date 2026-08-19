import type { ReactElement } from 'react'

/* Brand icons for the sourcing stages and the three carrier groups.
   Drawn inline so they stay crisp at rail sizes and keep their two-tone fill.
   Swap the paths here when the source SVG files land. */

const NAVY = '#142c4d'
const BLUE = '#2b8cf5'
const GREEN = '#35bd8b'
const PURPLE = '#7a41d1'
const PINK = '#f9506f'

export type DomainIconName =
  | 'sourcing'
  | 'tender'
  | 'award'
  | 'favCarrier'
  | 'myCarrier'
  | 'pastCarrier'

export const DOMAIN_ICON_LABEL: Record<DomainIconName, string> = {
  sourcing: 'Sourcing',
  tender: 'Tender',
  award: 'Award',
  favCarrier: 'Fav Carrier',
  myCarrier: 'My Carrier',
  pastCarrier: 'Past Carrier',
}

type Props = { size?: number }

const frame = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  xmlns: 'http://www.w3.org/2000/svg',
})

export function SourcingIcon({ size = 16 }: Props) {
  return (
    <svg {...frame(size)}>
      <circle cx="10.4" cy="10.4" r="6.6" stroke={NAVY} strokeWidth="2" />
      <path
        d="M7.1 7.4A4.7 4.7 0 0 1 10.4 5.9"
        stroke={BLUE}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M15.3 15.3 17 17" stroke={BLUE} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M17 17l3.1 3.1" stroke={NAVY} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export function TenderIcon({ size = 16 }: Props) {
  return (
    <svg {...frame(size)}>
      <path
        d="M4.9 3.6h8.2l4 4v12.8H4.9z"
        stroke={NAVY}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13.1 3.6v4h4" stroke={NAVY} strokeWidth="2" strokeLinejoin="round" />
      <path
        d="M7.7 9.4h5M7.7 12.2h5M7.7 15h3.1"
        stroke={GREEN}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="17.2" cy="16.6" r="4.6" fill="#fff" stroke={GREEN} strokeWidth="2" />
      <path d="M17.2 14.3v4.7" stroke={GREEN} strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M18.6 15.2c-.4-.5-2.6-.8-2.6.6 0 1.2 2.6.5 2.6 1.8 0 1.3-2.2 1-2.6.5"
        stroke={GREEN}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AwardIcon({ size = 16 }: Props) {
  return (
    <svg {...frame(size)}>
      <path
        d="M7 3.9h10v4.4a5 5 0 0 1-10 0z"
        stroke={NAVY}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M7 5.3H4.5v1.5a3.2 3.2 0 0 0 3.2 3.2"
        stroke={NAVY}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M17 5.3h2.5v1.5A3.2 3.2 0 0 1 16.3 10"
        stroke={NAVY}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 13.3v3.5" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
      <path d="M9.6 16.8h4.8" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
      <path d="M7.4 20.3h9.2" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 5.5l1.05 2.13 2.35.35-1.7 1.65.4 2.34L12 10.86l-2.1 1.1.4-2.34-1.7-1.65 2.35-.35z"
        stroke={PURPLE}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function FavCarrierIcon({ size = 16 }: Props) {
  return (
    <svg {...frame(size)}>
      <path
        d="M12 2.9l8 2.8v5.9c0 4.4-3.2 7.7-8 9.5-4.8-1.8-8-5.1-8-9.5V5.7z"
        stroke={BLUE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 7.4l1.02 2.06 2.28.33-1.65 1.61.39 2.27L12 12.6l-2.04 1.07.39-2.27L8.7 9.79l2.28-.33z"
        stroke={BLUE}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MyCarrierIcon({ size = 16 }: Props) {
  return (
    <svg {...frame(size)}>
      <path
        d="M12 20.5c-1.6-1-8.4-5.4-8.4-11A4.7 4.7 0 0 1 12 6.7a4.7 4.7 0 0 1 8.4 2.8c0 5.6-6.8 10-8.4 11z"
        stroke={PINK}
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PastCarrierIcon({ size = 16 }: Props) {
  return (
    <svg {...frame(size)}>
      {/* the broken arc on the right reads as elapsed time */}
      <circle
        cx="12"
        cy="12"
        r="8.6"
        stroke={PURPLE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="34 3.4 5.4 3.4 5.4 3.4"
        transform="rotate(-52 12 12)"
      />
      <path d="M12 7.2V12h4" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const ICONS: Record<DomainIconName, (props: Props) => ReactElement> = {
  sourcing: SourcingIcon,
  tender: TenderIcon,
  award: AwardIcon,
  favCarrier: FavCarrierIcon,
  myCarrier: MyCarrierIcon,
  pastCarrier: PastCarrierIcon,
}

/** Stage names map straight onto the three lifecycle icons. */
export function stageIconName(stage: string): DomainIconName | undefined {
  const key = stage.trim().toLowerCase()
  if (key === 'sourcing') return 'sourcing'
  if (key === 'tender') return 'tender'
  if (key === 'award') return 'award'
  return undefined
}

/** Wrapper adds the hover label, so an icon always names itself. */
export function DomainIcon({
  name,
  size = 16,
  label,
}: {
  name: DomainIconName
  size?: number
  /** Overrides the default hover text. */
  label?: string
}) {
  const Icon = ICONS[name]
  const text = label ?? DOMAIN_ICON_LABEL[name]
  return (
    <span className="dom-ico" title={text} aria-label={text} role="img">
      <Icon size={size} />
    </span>
  )
}
