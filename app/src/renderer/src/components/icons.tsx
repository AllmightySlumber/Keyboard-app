interface IconProps {
  size?: number
}

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const
}

export function HomeIcon({ size = 20 }: IconProps): JSX.Element {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  )
}

export function LessonsIcon({ size = 20 }: IconProps): JSX.Element {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <rect x="4" y="4" width="16" height="4" rx="1.5" />
      <rect x="4" y="10" width="16" height="4" rx="1.5" />
      <rect x="4" y="16" width="10" height="4" rx="1.5" />
    </svg>
  )
}

export function KeyboardIcon({ size = 20 }: IconProps): JSX.Element {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <line x1="7" y1="14.5" x2="17" y2="14.5" />
    </svg>
  )
}

export function StatsIcon({ size = 20 }: IconProps): JSX.Element {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2.2}>
      <line x1="6" y1="20" x2="6" y2="13" />
      <line x1="12" y1="20" x2="12" y2="6" />
      <line x1="18" y1="20" x2="18" y2="10" />
    </svg>
  )
}

export function TrophyIcon({ size = 20 }: IconProps): JSX.Element {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <path d="M7 4h10v4a5 5 0 01-10 0z" />
      <path d="M7 6H4v1a3 3 0 003 3" />
      <path d="M17 6h3v1a3 3 0 01-3 3" />
      <line x1="12" y1="13" x2="12" y2="17" />
      <path d="M8.5 20h7" />
    </svg>
  )
}

export function FriendsIcon({ size = 20 }: IconProps): JSX.Element {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20a6 6 0 0112 0" />
      <circle cx="17" cy="7" r="2.6" />
      <path d="M15 10.5a5 5 0 016 4.7" />
    </svg>
  )
}

export function ProfileIcon({ size = 20 }: IconProps): JSX.Element {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20a7.5 7.5 0 0115 0" />
    </svg>
  )
}
