export type LayoutId = 'AZERTY' | 'QWERTY' | 'QWERTZ' | 'BEPO'

export type Finger =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky'

export const LAYOUT_LABELS: Record<LayoutId, string> = {
  AZERTY: 'AZERTY',
  QWERTY: 'QWERTY',
  QWERTZ: 'QWERTZ',
  BEPO: 'Bépo'
}

interface KeyDef {
  code: string
  finger: Finger
}

// Physical key position -> finger assignment. Touch-typing finger placement is
// the same regardless of which characters the layout prints on each key.
const ROWS: KeyDef[][] = [
  [
    { code: 'Digit1', finger: 'left-pinky' },
    { code: 'Digit2', finger: 'left-ring' },
    { code: 'Digit3', finger: 'left-middle' },
    { code: 'Digit4', finger: 'left-index' },
    { code: 'Digit5', finger: 'left-index' },
    { code: 'Digit6', finger: 'right-index' },
    { code: 'Digit7', finger: 'right-index' },
    { code: 'Digit8', finger: 'right-middle' },
    { code: 'Digit9', finger: 'right-ring' },
    { code: 'Digit0', finger: 'right-pinky' }
  ],
  [
    { code: 'KeyQ', finger: 'left-pinky' },
    { code: 'KeyW', finger: 'left-ring' },
    { code: 'KeyE', finger: 'left-middle' },
    { code: 'KeyR', finger: 'left-index' },
    { code: 'KeyT', finger: 'left-index' },
    { code: 'KeyY', finger: 'right-index' },
    { code: 'KeyU', finger: 'right-index' },
    { code: 'KeyI', finger: 'right-middle' },
    { code: 'KeyO', finger: 'right-ring' },
    { code: 'KeyP', finger: 'right-pinky' }
  ],
  [
    { code: 'KeyA', finger: 'left-pinky' },
    { code: 'KeyS', finger: 'left-ring' },
    { code: 'KeyD', finger: 'left-middle' },
    { code: 'KeyF', finger: 'left-index' },
    { code: 'KeyG', finger: 'left-index' },
    { code: 'KeyH', finger: 'right-index' },
    { code: 'KeyJ', finger: 'right-index' },
    { code: 'KeyK', finger: 'right-middle' },
    { code: 'KeyL', finger: 'right-ring' },
    { code: 'Semicolon', finger: 'right-pinky' }
  ],
  [
    { code: 'KeyZ', finger: 'left-pinky' },
    { code: 'KeyX', finger: 'left-ring' },
    { code: 'KeyC', finger: 'left-middle' },
    { code: 'KeyV', finger: 'left-index' },
    { code: 'KeyB', finger: 'left-index' },
    { code: 'KeyN', finger: 'right-index' },
    { code: 'KeyM', finger: 'right-index' },
    { code: 'Comma', finger: 'right-middle' },
    { code: 'Period', finger: 'right-ring' },
    { code: 'Slash', finger: 'right-pinky' }
  ]
]

export const FINGER_BY_CODE: Record<string, Finger> = Object.fromEntries(
  ROWS.flat().map((k) => [k.code, k.finger])
)

// Character printed at each physical code, per layout. Digits row simplified
// to unshifted digits for every layout (real AZERTY requires Shift for digits).
export const SPACE_CODE = 'Space'

const QWERTY_CHARS: Record<string, string> = {
  Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5',
  Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9', Digit0: '0',
  KeyQ: 'q', KeyW: 'w', KeyE: 'e', KeyR: 'r', KeyT: 't',
  KeyY: 'y', KeyU: 'u', KeyI: 'i', KeyO: 'o', KeyP: 'p',
  KeyA: 'a', KeyS: 's', KeyD: 'd', KeyF: 'f', KeyG: 'g',
  KeyH: 'h', KeyJ: 'j', KeyK: 'k', KeyL: 'l', Semicolon: ';',
  KeyZ: 'z', KeyX: 'x', KeyC: 'c', KeyV: 'v', KeyB: 'b',
  KeyN: 'n', KeyM: 'm', Comma: ',', Period: '.', Slash: '/',
  [SPACE_CODE]: ' '
}

const AZERTY_CHARS: Record<string, string> = {
  ...QWERTY_CHARS,
  KeyQ: 'a', KeyA: 'q', KeyZ: 'w', KeyW: 'z',
  KeyM: ',', Comma: 'm', Semicolon: 'm',
  KeyP: 'p', Period: ';', Slash: ':'
}

const QWERTZ_CHARS: Record<string, string> = {
  ...QWERTY_CHARS,
  KeyY: 'z', KeyZ: 'y'
}

// Bépo is a fully different physical layout in reality; approximated here
// with a French-friendly subset for v1 so lessons can still be generated.
const BEPO_CHARS: Record<string, string> = {
  ...QWERTY_CHARS,
  KeyQ: 'b', KeyW: 'é', KeyE: 'p', KeyR: 'o', KeyT: 'è',
  KeyA: 'a', KeyS: 'u', KeyD: 'i', KeyF: 'e', KeyG: ',',
  KeyZ: 'x', KeyX: 'j', KeyC: 'd', KeyV: 'l', KeyB: 'z'
}

export const LAYOUT_CHARS: Record<LayoutId, Record<string, string>> = {
  QWERTY: QWERTY_CHARS,
  AZERTY: AZERTY_CHARS,
  QWERTZ: QWERTZ_CHARS,
  BEPO: BEPO_CHARS
}

export const KEYBOARD_ROWS: string[][] = [...ROWS.map((row) => row.map((k) => k.code)), [SPACE_CODE]]

export function charForCode(layout: LayoutId, code: string): string | undefined {
  return LAYOUT_CHARS[layout][code]
}

export function codeForChar(layout: LayoutId, char: string): string | undefined {
  const chars = LAYOUT_CHARS[layout]
  const lower = char.toLowerCase()
  return Object.keys(chars).find((code) => chars[code] === lower)
}

export function fingerForChar(layout: LayoutId, char: string): Finger | undefined {
  const code = codeForChar(layout, char)
  return code ? FINGER_BY_CODE[code] : undefined
}
