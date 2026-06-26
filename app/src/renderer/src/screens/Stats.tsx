import StatCard from '../components/StatCard'
import {
  selectAverageWpm,
  selectBestWpm,
  selectTotalTimeSec,
  useStatsStore
} from '../store/statsStore'

function formatDuration(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60)
  const seconds = totalSec % 60
  return `${minutes} min ${seconds} s`
}

export default function Stats(): JSX.Element {
  const sessions = useStatsStore((s) => s.sessions)
  const bestWpm = selectBestWpm(sessions)
  const avgWpm = selectAverageWpm(sessions)
  const totalTime = selectTotalTimeSec(sessions)
  const avgAccuracy = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length)
    : 0

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)' }}>Statistiques</h1>
      <div style={{ display: 'flex', gap: 16, margin: '20px 0' }}>
        <StatCard label="Vitesse moyenne" value={`${avgWpm} MPM`} />
        <StatCard label="Record de vitesse" value={`${bestWpm} MPM`} />
        <StatCard label="Précision moyenne" value={`${avgAccuracy}%`} />
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <StatCard label="Sessions" value={`${sessions.length}`} />
        <StatCard label="Temps total" value={formatDuration(totalTime)} />
      </div>

      {sessions.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', marginTop: 24 }}>
          Termine un exercice pour voir tes statistiques apparaître ici.
        </p>
      )}
    </div>
  )
}
