import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, LeaderboardEntry, getLeaderboard } from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function Classement(): JSX.Element {
  const token = useAuthStore((s) => s.token)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError(null)
    getLeaderboard(token)
      .then(setEntries)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Impossible de charger le classement'))
      .finally(() => setLoading(false))
  }, [token])

  if (!token) {
    return (
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)' }}>Classement</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 12 }}>
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Connecte-toi
          </Link>{' '}
          pour voir le top 5 et te comparer aux autres joueurs.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)' }}>Classement</h1>

      {loading && <p style={{ color: 'var(--color-text-muted)', marginTop: 12 }}>Chargement…</p>}
      {error && <p style={{ color: 'oklch(0.55 0.2 28)', marginTop: 12 }}>{error}</p>}

      {!loading && !error && entries.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', marginTop: 12 }}>
          Aucun score enregistré encore. Termine un exercice pour apparaître ici.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
        {entries.map((entry, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 14,
              padding: '12px 18px'
            }}
          >
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, width: 24 }}>{i + 1}</span>
            <span style={{ flex: 1, fontWeight: 600 }}>{entry.pseudo}</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 13.5 }}>{entry.accuracy}%</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{entry.wpm} MPM</span>
          </div>
        ))}
      </div>
    </div>
  )
}
