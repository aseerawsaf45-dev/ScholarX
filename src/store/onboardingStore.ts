import { create } from 'zustand'

interface OnboardingState {
  data: Record<string, unknown>;
  updateData: (newData: Record<string, unknown>) => void;
  clearData: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  data: {},
  updateData: (newData) => set((state) => ({ data: { ...state.data, ...newData } })),
  clearData: () => set({ data: {} }),
}))
