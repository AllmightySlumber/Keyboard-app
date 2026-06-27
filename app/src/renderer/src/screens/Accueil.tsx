import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../components/StatCard'
import { FriendActivity, getFriendActivity } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { DISMISS_AFTER_MS, useFriendActivityStore } from '../store/friendActivityStore'
import {
  selectBestWpm,
  selectDailyGoalProgress,
  selectWeeklyActivity,
  useStatsStore
} from '../store/statsStore'

const MAX_FRIEND_NOTIFICATIONS = 20

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function Accueil(): JSX.Element {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const sessions = useStatsStore((s) => s.sessions)
  const goal = selectDailyGoalProgress(sessions)
  const bestWpm = selectBestWpm(sessions)
  const weekly = selectWeeklyActivity(sessions)
  const maxWeekly = Math.max(1, ...weekly)
  const [friendActivity, setFriendActivity] = useState<FriendActivity[]>([])
  const [tick, setTick] = useState(0)
  const seenAt = useFriendActivityStore((s) => s.seenAt)
  const markSeen = useFriendActivityStore((s) => s.markSeen)

  useEffect(() => {
    if (!token) {
      setFriendActivity([])
      return
    }
    getFriendActivity(token)
      .then(setFriendActivity)
      .catch(() => setFriendActivity([]))
  }, [token])

  // Mark each notification as "seen" the moment it's fetched/displayed, so
  // its dismiss timer starts running.
  useEffect(() => {
    friendActivity.forEach((a) => markSeen(a.id))
  }, [friendActivity, markSeen])

  // Re-evaluate periodically so seen notifications fade out once their
  // dismiss delay elapses, without needing a refetch.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const visibleFriendActivity = useMemo(() => {
    void tick
    const now = Date.now()
    return friendActivity
      .filter((a) => {
        const seen = seenAt[a.id]
        return seen === undefined || now - seen < DISMISS_AFTER_MS
      })
      .slice(0, MAX_FRIEND_NOTIFICATIONS)
  }, [friendActivity, seenAt, tick])

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)' }}>Accueil</h1>

      <div style={{ display: 'flex', gap: 16, margin: '20px 0' }}>
        <StatCard label="Record de vitesse" value={`${bestWpm} MPM`} />
        <StatCard label="Sessions" value={`${sessions.length}`} />
      </div>

      <div
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
          borderRadius: 20,
          padding: 26,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 24
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -30,
            top: -30,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)'
          }}
        />
        <span style={{ fontWeight: 700, fontSize: 15 }}>Objectif du jour</span>
        <span style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
          Plus que {Math.max(0, goal.goal - goal.words)} mots avant ton objectif
        </span>
        <div
          style={{
            height: 8,
            background: 'rgba(255,255,255,0.25)',
            borderRadius: 6,
            marginTop: 18,
            overflow: 'hidden',
            width: '70%'
          }}
        >
          <div
            style={{
              width: `${Math.round(goal.ratio * 100)}%`,
              height: '100%',
              background: '#fff',
              borderRadius: 6
            }}
          />
        </div>
        <button
          onClick={() => navigate('/exercice')}
          style={{
            position: 'relative',
            alignSelf: 'flex-start',
            marginTop: 20,
            background: '#fff',
            color: 'var(--color-primary-dark)',
            border: 'none',
            borderRadius: 12,
            padding: '13px 26px',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(0,0,0,0.18)'
          }}
        >
          Continuer
        </button>
      </div>

      {visibleFriendActivity.length > 0 && (
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: 20,
            padding: 22,
            marginBottom: 24
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 14 }}>Activité de tes amis</span>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginTop: 12,
              maxHeight: 180,
              overflowY: 'auto'
            }}
          >
            {visibleFriendActivity.map((a) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
                <span style={{ fontSize: 18 }}>🏆</span>
                <span>
                  <strong>{a.displayName}</strong> a battu son record avec{' '}
                  <strong>{Math.round(a.wpm)} MPM</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          background: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: 20,
          padding: 22
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14 }}>Activité de la semaine</span>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, height: 110, alignItems: 'flex-end' }}>
          {weekly.map((value, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: '100%',
                  height: Math.max(8, (value / maxWeekly) * 90),
                  background: value > 0 ? 'var(--color-primary)' : 'var(--color-bg-soft)',
                  borderRadius: 8
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                {DAY_LABELS[i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
