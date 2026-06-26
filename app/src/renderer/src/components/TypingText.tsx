interface TypingTextProps {
  target: string
  typed: string
}

export default function TypingText({ target, typed }: TypingTextProps): JSX.Element {
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 22,
        lineHeight: 1.7,
        letterSpacing: 0.5,
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap'
      }}
    >
      {target.split('').map((char, i) => {
        let color = 'var(--color-text-muted)'
        let background = 'transparent'
        if (i < typed.length) {
          const correct = typed[i] === char
          color = correct ? 'var(--color-text)' : '#fff'
          background = correct ? 'transparent' : 'oklch(0.6 0.2 28)'
        } else if (i === typed.length) {
          background = 'oklch(0.9 0.05 280)'
        }
        return (
          // inline-block keeps a space's colored background visible even at
          // a line wrap, where browsers otherwise collapse plain whitespace.
          <span key={i} style={{ color, background, borderRadius: 3, display: 'inline-block' }}>
            {char}
          </span>
        )
      })}
    </div>
  )
}
