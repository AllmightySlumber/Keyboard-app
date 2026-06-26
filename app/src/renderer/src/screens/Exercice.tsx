import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import TypingText from '../components/TypingText'
import VirtualKeyboard from '../components/VirtualKeyboard'
import { useTypingSession } from '../hooks/useTypingSession'
import { FingerGroup, generateText } from '../lib/wordlists'
import { useSettingsStore } from '../store/settingsStore'
import { useStatsStore } from '../store/statsStore'
import { useAuthStore } from '../store/authStore'
import { syncSession } from '../lib/api'

const GROUPS: { id: FingerGroup; label: string }[] = [
  { id: 'index', label: 'Index' },
  { id: 'majeur', label: 'Majeur' },
  { id: 'annulaire', label: 'Annulaire' },
  { id: 'auriculaire', label: 'Auriculaire' },
  { id: 'complet', label: 'Texte complet' }
]

const VALID_GROUPS = GROUPS.map((g) => g.id)

function readInitialGroup(state: unknown, loggedIn: boolean): FingerGroup {
  if (!loggedIn) return 'complet'
  const candidate = (state as { group?: FingerGroup } | null)?.group
  return candidate && VALID_GROUPS.includes(candidate) ? candidate : 'complet'
}

export default function Exercice(): JSX.Element {
  const layout = useSettingsStore((s) => s.layout)
  const location = useLocation()
  const token = useAuthStore((s) => s.token)
  const initialGroup = readInitialGroup(location.state, Boolean(token))
  const [group, setGroup] = useState<FingerGroup>(initialGroup)
  const [target, setTarget] = useState(() => generateText(initialGroup))
  const [tick, setTick] = useState(0)

  const { typed, isFinished, liveStats, result, handleKey, reset } = useTypingSession(target)
  const addSession = useStatsStore((s) => s.addSession)
  const availableGroups = token ? GROUPS : GROUPS.filter((g) => g.id === 'complet')

  useEffect(() => {
    if (isFinished) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [isFinished])

  useEffect(() => {
    if (!result) return
    const record = {
      wpm: result.wpm,
      accuracy: result.accuracy,
      durationSec: Math.max(result.durationSec, 1),
      layout
    }
    addSession({ ...record, createdAt: Date.now() })
    if (token) {
      syncSession(token, record).catch(() => {
        // best-effort sync; local stats already saved above
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  useEffect(() => {
    void tick
  }, [tick])

  useEffect(() => {
    if (!token && group !== 'complet') {
      startNewExercise('complet')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Backspace' || e.key.length === 1) {
        e.preventDefault()
        handleKey(e.key)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleKey])

  const nextChar = target[typed.length]

  function startNewExercise(nextGroup: FingerGroup): void {
    setGroup(nextGroup)
    setTarget(generateText(nextGroup))
    reset()
  }

  const cardStyle = useMemo(
    () => ({
      background: '#fff',
      border: '1px solid var(--color-border)',
      borderRadius: 18,
      padding: 24
    }),
    []
  )

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)' }}>Exercice</h1>

      <div style={{ display: 'flex', gap: 8, margin: '16px 0 24px' }}>
        {availableGroups.map((g) => (
          <button
            key={g.id}
            onClick={() => startNewExercise(g.id)}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13.5,
              border: g.id === group ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: g.id === group ? 'var(--color-primary)' : '#fff',
              color: g.id === group ? '#fff' : 'var(--color-text)'
            }}
          >
            {g.label}
          </button>
        ))}
      </div>

      {!token && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: -16, marginBottom: 24 }}>
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Connecte-toi
          </Link>{' '}
          pour accéder aux leçons par doigt et garder ta progression.
        </p>
      )}

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <Stat label="Vitesse" value={`${liveStats.wpm} MPM`} />
        <Stat label="Précision" value={`${liveStats.accuracy}%`} />
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <TypingText target={target} typed={typed} />
      </div>

      {isFinished && result && (
        <div style={{ ...cardStyle, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Résultat</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700 }}>
              {result.wpm} MPM · {result.accuracy}% précision
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <button
              onClick={() => reset()}
              style={{
                padding: '12px 22px',
                borderRadius: 12,
                border: '1px solid var(--color-primary)',
                background: 'transparent',
                color: 'var(--color-primary)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Réessayer
            </button>
            <button
              onClick={() => startNewExercise(group)}
              style={{
                padding: '12px 22px',
                borderRadius: 12,
                border: 'none',
                background: 'var(--color-primary)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Nouveau texte
            </button>
          </div>
        </div>
      )}

      <div style={cardStyle}>
        <VirtualKeyboard layout={layout} nextChar={nextChar} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div
      style={{
        background: 'var(--color-bg-soft)',
        border: '1px solid var(--color-border)',
        borderRadius: 14,
        padding: '12px 18px',
        minWidth: 120
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700 }}>{value}</div>
    </div>
  )
}
