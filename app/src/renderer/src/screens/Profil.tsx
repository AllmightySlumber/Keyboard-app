import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LAYOUT_LABELS, LayoutId } from '../lib/layouts'
import { useSettingsStore } from '../store/settingsStore'
import { useAuthStore } from '../store/authStore'

const LAYOUTS = Object.keys(LAYOUT_LABELS) as LayoutId[]

export default function Profil(): JSX.Element {
  const layout = useSettingsStore((s) => s.layout)
  const setLayout = useSettingsStore((s) => s.setLayout)
  const user = useAuthStore((s) => s.user)
  const [copied, setCopied] = useState(false)

  function copyPseudo(): void {
    if (!user) return
    navigator.clipboard.writeText(user.pseudo).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)' }}>Profil</h1>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 16, fontFamily: 'var(--font-heading)' }}>Ton identifiant</h2>
        {user && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginTop: 4 }}>
            Connecté en tant que <strong>{user.displayName}</strong>
          </p>
        )}
        {user ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 10,
              background: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 14,
              padding: '14px 18px',
              maxWidth: 420
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, flex: 1 }}>
              {user.pseudo}
            </span>
            <button
              onClick={copyPseudo}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '1px solid var(--color-primary)',
                background: 'transparent',
                color: 'var(--color-primary)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted)', marginTop: 10 }}>
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Connecte-toi
            </Link>{' '}
            pour voir ton identifiant.
          </p>
        )}
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 10, maxWidth: 420 }}>
          C'est cet identifiant (et pas juste ton nom) que tes amis doivent taper
          dans la recherche de la page{' '}
          <Link to="/amis" style={{ color: 'var(--color-primary)' }}>
            Amis
          </Link>{' '}
          pour te trouver et t'envoyer une demande. Partage-le seulement avec des
          personnes que tu connais.
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 16, fontFamily: 'var(--font-heading)' }}>Disposition du clavier</h2>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {LAYOUTS.map((id) => {
            const active = id === layout
            return (
              <button
                key={id}
                onClick={() => setLayout(id)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: active ? 'var(--color-primary)' : '#fff',
                  color: active ? '#fff' : 'var(--color-text)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {LAYOUT_LABELS[id]}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
