import { LAYOUT_LABELS, LayoutId } from '../lib/layouts'
import { useSettingsStore } from '../store/settingsStore'

const LAYOUTS = Object.keys(LAYOUT_LABELS) as LayoutId[]

export default function Profil(): JSX.Element {
  const layout = useSettingsStore((s) => s.layout)
  const setLayout = useSettingsStore((s) => s.setLayout)

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)' }}>Profil</h1>
      <section style={{ marginTop: 20 }}>
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
