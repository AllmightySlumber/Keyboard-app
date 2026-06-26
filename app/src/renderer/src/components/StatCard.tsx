interface StatCardProps {
  label: string
  value: string
}

export default function StatCard({ label, value }: StatCardProps): JSX.Element {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--color-border)',
        borderRadius: 18,
        padding: 18,
        flex: 1
      }}
    >
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, marginTop: 6 }}>
        {value}
      </div>
    </div>
  )
}
