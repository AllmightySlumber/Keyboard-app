import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const DISMISS_AFTER_MS = 24 * 60 * 60 * 1000 // disappears 1 day after first seen

interface FriendActivityState {
  seenAt: Record<string, number>
  markSeen: (id: string) => void
}

// Persisted so a dismissed notification stays gone across app restarts,
// not just for the current run.
export const useFriendActivityStore = create<FriendActivityState>()(
  persist(
    (set, get) => ({
      seenAt: {},
      markSeen: (id) => {
        if (get().seenAt[id] !== undefined) return
        set((s) => ({ seenAt: { ...s.seenAt, [id]: Date.now() } }))
      }
    }),
    { name: 'keyboard-friend-activity' }
  )
)
