import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LayoutId } from '../lib/layouts'

interface SettingsState {
  layout: LayoutId
  setLayout: (layout: LayoutId) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      layout: 'AZERTY',
      setLayout: (layout) => set({ layout })
    }),
    { name: 'keyboard-settings' }
  )
)
