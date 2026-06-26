import { FINGER_BY_CODE, KEYBOARD_ROWS, LayoutId, SPACE_CODE, charForCode, codeForChar } from '../lib/layouts'

const FINGER_COLORS: Record<string, string> = {
  'left-pinky': 'oklch(0.75 0.15 28)',
  'left-ring': 'oklch(0.78 0.13 75)',
  'left-middle': 'oklch(0.8 0.12 140)',
  'left-index': 'oklch(0.78 0.13 200)',
  'right-index': 'oklch(0.78 0.13 200)',
  'right-middle': 'oklch(0.8 0.12 140)',
  'right-ring': 'oklch(0.78 0.13 75)',
  'right-pinky': 'oklch(0.75 0.15 28)'
}

interface VirtualKeyboardProps {
  layout: LayoutId
  nextChar?: string
}

export default function VirtualKeyboard({ layout, nextChar }: VirtualKeyboardProps): JSX.Element {
  const nextCode = nextChar ? codeForChar(layout, nextChar) : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
      {KEYBOARD_ROWS.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: 6 }}>
          {row.map((code) => {
            const char = charForCode(layout, code)
            const finger = FINGER_BY_CODE[code]
            const isNext = code === nextCode
            const isSpace = code === SPACE_CODE
            return (
              <div
                key={code}
                style={{
                  width: isSpace ? 320 : 40,
                  height: 40,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  fontSize: isSpace ? 12 : 15,
                  letterSpacing: isSpace ? 1.5 : undefined,
                  textTransform: 'uppercase',
                  border: isNext ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: isNext ? 'var(--color-primary)' : isSpace ? 'var(--color-bg-soft)' : FINGER_COLORS[finger] ?? '#fff',
                  color: isNext ? '#fff' : 'var(--color-text)',
                  transition: 'all .1s'
                }}
              >
                {isSpace ? 'ESPACE' : char}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
