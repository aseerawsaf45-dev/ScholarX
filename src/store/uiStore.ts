import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  searchPaletteOpen: boolean;
  setSearchPaletteOpen: (open: boolean) => void;
  toggleSearchPalette: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      searchPaletteOpen: false,
      setSearchPaletteOpen: (open) => set({ searchPaletteOpen: open }),
      toggleSearchPalette: () => set((state) => ({ searchPaletteOpen: !state.searchPaletteOpen })),
    }),
    {
      name: 'ui-storage',
    }
  )
)
