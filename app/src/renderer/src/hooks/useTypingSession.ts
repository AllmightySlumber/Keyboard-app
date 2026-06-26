import { useCallback, useMemo, useRef, useState } from 'react'

export interface TypingResult {
  wpm: number
  accuracy: number
  durationSec: number
  errorCount: number
}

interface TypingSessionState {
  typed: string
  startedAt: number | null
  finishedAt: number | null
  errorCount: number
}

export function useTypingSession(targetText: string) {
  const [state, setState] = useState<TypingSessionState>({
    typed: '',
    startedAt: null,
    finishedAt: null,
    errorCount: 0
  })
  const errorsAtIndex = useRef<Set<number>>(new Set())

  const isFinished = state.finishedAt !== null

  const handleKey = useCallback(
    (key: string) => {
      if (isFinished) return

      setState((prev) => {
        if (key === 'Backspace') {
          if (prev.typed.length === 0) return prev
          return { ...prev, typed: prev.typed.slice(0, -1) }
        }

        if (key.length !== 1) return prev

        const startedAt = prev.startedAt ?? Date.now()
        const nextIndex = prev.typed.length
        const expected = targetText[nextIndex]
        const isCorrect = key === expected

        if (!isCorrect && !errorsAtIndex.current.has(nextIndex)) {
          errorsAtIndex.current.add(nextIndex)
        }

        const typed = prev.typed + key
        const finishedAt = typed.length >= targetText.length ? Date.now() : null

        return {
          typed,
          startedAt,
          finishedAt,
          errorCount: errorsAtIndex.current.size
        }
      })
    },
    [targetText, isFinished]
  )

  const reset = useCallback(() => {
    errorsAtIndex.current = new Set()
    setState({ typed: '', startedAt: null, finishedAt: null, errorCount: 0 })
  }, [])

  const liveStats = useMemo(() => {
    const elapsedMs = (state.finishedAt ?? Date.now()) - (state.startedAt ?? Date.now())
    const elapsedMin = Math.max(elapsedMs / 60000, 1 / 60)
    const wordsTyped = state.typed.length / 5
    const wpm = state.startedAt ? Math.round(wordsTyped / elapsedMin) : 0
    const accuracy =
      state.typed.length > 0
        ? Math.max(0, Math.round(((state.typed.length - state.errorCount) / state.typed.length) * 100))
        : 100
    return { wpm, accuracy }
  }, [state])

  const result: TypingResult | null = isFinished
    ? {
        wpm: liveStats.wpm,
        accuracy: liveStats.accuracy,
        durationSec: Math.round(((state.finishedAt as number) - (state.startedAt as number)) / 1000),
        errorCount: state.errorCount
      }
    : null

  return {
    typed: state.typed,
    isFinished,
    liveStats,
    result,
    handleKey,
    reset
  }
}
