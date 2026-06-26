import { CSSProperties, FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, login, register } from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function Login(): JSX.Element {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response =
        mode === 'login' ? await login(email, password) : await register(email, password, pseudo)
      setSession(response.token, response.user)
      navigate('/classement')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 360 }}>
      <h1 style={{ fontFamily: 'var(--font-heading)' }}>{mode === 'login' ? 'Connexion' : 'Inscription'}</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
        Connecte-toi pour synchroniser tes stats et voir le classement.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
        {mode === 'register' && (
          <input
            placeholder="Pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            required
            style={inputStyle}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          style={inputStyle}
        />

        {error && <div style={{ color: 'oklch(0.55 0.2 28)', fontSize: 13.5 }}>{error}</div>}

        <button type="submit" disabled={loading} style={submitStyle}>
          {loading ? 'Patiente…' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
      >
        {mode === 'login' ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
      </button>
    </div>
  )
}

const inputStyle: CSSProperties = {
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  fontSize: 14
}

const submitStyle: CSSProperties = {
  padding: '12px 14px',
  borderRadius: 10,
  border: 'none',
  background: 'var(--color-primary)',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer'
}
