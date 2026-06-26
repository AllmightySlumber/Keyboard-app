import { Link, useNavigate } from 'react-router-dom'
import { FingerGroup } from '../lib/wordlists'
import { useStatsStore } from '../store/statsStore'
import { useAuthStore } from '../store/authStore'

const LESSONS: { id: FingerGroup; label: string; description: string }[] = [
  { id: 'index', label: 'Index', description: 'T, Y, G, H, B, N et les colonnes centrales' },
  { id: 'majeur', label: 'Majeur', description: 'E, I, D, K, C, virgule' },
  { id: 'annulaire', label: 'Annulaire', description: 'W, O, S, L, X, point' },
  { id: 'auriculaire', label: 'Auriculaire', description: 'Q, P, A, M, Z, slash' }
]

export default function Lecons(): JSX.Element {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const sessions = useStatsStore((s) => s.sessions)
  const sessionCount = sessions.length

  if (!token) {
    return (
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)' }}>Leçons</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 12 }}>
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Connecte-toi
          </Link>{' '}
          pour accéder aux leçons par doigt et garder ta progression d'une session à l'autre.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)' }}>Leçons</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
        Choisis une leçon pour t'entraîner sur un groupe de doigts précis.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
        {LESSONS.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => navigate('/exercice', { state: { group: lesson.id } })}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: '18px 22px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>
                {lesson.label}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginTop: 2 }}>
                {lesson.description}
              </div>
            </div>
            <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: 14 }}>
              Commencer →
            </span>
          </button>
        ))}
      </div>

      {sessionCount === 0 && (
        <p style={{ color: 'var(--color-text-muted)', marginTop: 20, fontSize: 13.5 }}>
          Aucune session enregistrée pour l'instant — termine une leçon pour voir ta progression.
        </p>
      )}
    </div>
  )
}
