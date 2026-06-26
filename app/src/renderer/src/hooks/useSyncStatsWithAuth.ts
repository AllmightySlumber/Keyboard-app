import { useEffect } from 'react'
import { getMySessions } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { LayoutId } from '../lib/layouts'
import { useStatsStore } from '../store/statsStore'

// Keeps Accueil/Stats in sync with who's logged in: fetches the account's
// history from the server on login (and on app boot if already logged in),
// and blanks the view for guests / right after logout.
export function useSyncStatsWithAuth(): void {
  const token = useAuthStore((s) => s.token)
  const setSessions = useStatsStore((s) => s.setSessions)
  const clearSessions = useStatsStore((s) => s.clearSessions)

  useEffect(() => {
    if (!token) {
      clearSessions()
      return
    }

    clearSessions() // avoid flashing the previous account's stats while fetching
    getMySessions(token)
      .then((remote) => {
        setSessions(
          remote.map((s) => ({
            wpm: s.wpm,
            accuracy: s.accuracy,
            durationSec: s.durationSec,
            layout: s.layout as LayoutId,
            createdAt: new Date(s.createdAt).getTime()
          }))
        )
      })
      .catch(() => {
        // offline or server unreachable: keep showing local-only stats for this run
      })
  }, [token, setSessions, clearSessions])
}
