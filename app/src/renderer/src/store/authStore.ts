import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  id: string
  email: string
  displayName: string
  pseudo: string
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  setSession: (token: string, user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null })
    }),
    {
      name: 'keyboard-auth',
      version: 1,
      // v0 sessions were stored without displayName; rather than crash on
      // the missing field, sign those sessions out so the user just logs
      // back in and gets the current shape.
      migrate: (persisted) => {
        const state = persisted as Partial<AuthState> | undefined
        if (!state?.user || typeof (state.user as Partial<AuthUser>).displayName !== 'string') {
          return { token: null, user: null }
        }
        return state as AuthState
      }
    }
  )
)
