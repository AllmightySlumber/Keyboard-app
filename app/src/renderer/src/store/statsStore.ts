import { create } from 'zustand'
import { LayoutId } from '../lib/layouts'

export interface SessionRecord {
  wpm: number
  accuracy: number
  durationSec: number
  layout: LayoutId
  createdAt: number
}

const DAILY_GOAL_WORDS = 500

interface StatsState {
  sessions: SessionRecord[]
  addSession: (session: SessionRecord) => void
  setSessions: (sessions: SessionRecord[]) => void
  clearSessions: () => void
}

// Deliberately not persisted to localStorage: a logged-in user's history
// lives on the server and is fetched on login (see useSyncStatsWithAuth).
// A guest's sessions only live for the current run of the app.
export const useStatsStore = create<StatsState>()((set) => ({
  sessions: [],
  addSession: (session) => set((s) => ({ sessions: [...s.sessions, session] })),
  setSessions: (sessions) => set({ sessions }),
  clearSessions: () => set({ sessions: [] })
}))

function isSameDay(a: number, b: number): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return da.toDateString() === db.toDateString()
}

export function selectBestWpm(sessions: SessionRecord[]): number {
  return sessions.reduce((max, s) => Math.max(max, s.wpm), 0)
}

export function selectAverageWpm(sessions: SessionRecord[]): number {
  if (sessions.length === 0) return 0
  return Math.round(sessions.reduce((sum, s) => sum + s.wpm, 0) / sessions.length)
}

export function selectTotalTimeSec(sessions: SessionRecord[]): number {
  return sessions.reduce((sum, s) => sum + s.durationSec, 0)
}

export function selectTodayWordsTyped(sessions: SessionRecord[]): number {
  const now = Date.now()
  return sessions
    .filter((s) => isSameDay(s.createdAt, now))
    .reduce((sum, s) => sum + Math.round((s.wpm * s.durationSec) / 60), 0)
}

export function selectDailyGoalProgress(sessions: SessionRecord[]): {
  words: number
  goal: number
  ratio: number
} {
  const words = selectTodayWordsTyped(sessions)
  return { words, goal: DAILY_GOAL_WORDS, ratio: Math.min(1, words / DAILY_GOAL_WORDS) }
}

export function selectWeeklyActivity(sessions: SessionRecord[]): number[] {
  const days: number[] = [0, 0, 0, 0, 0, 0, 0] // Mon..Sun
  for (const s of sessions) {
    const jsDay = new Date(s.createdAt).getDay() // 0=Sun..6=Sat
    const index = (jsDay + 6) % 7 // 0=Mon..6=Sun
    days[index] += Math.round((s.wpm * s.durationSec) / 60)
  }
  return days
}
