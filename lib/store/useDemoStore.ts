import { create } from 'zustand'

interface DemoState {
  // Flashcard demo
  currentCard: number
  flipCard: () => void
  nextCard: () => void
  prevCard: () => void

  // Speaking demo
  isRecording: boolean
  startRecording: () => void
  stopRecording: () => void

  // Toggle UI
  showDemo: boolean
  toggleDemo: () => void
}

export const useDemoStore = create<DemoState>((set) => ({
  // Flashcard
  currentCard: 0,
  flipCard: () => set((state) => ({ currentCard: (state.currentCard + 1) % 3 })),
  nextCard: () => set((state) => ({ currentCard: (state.currentCard + 1) % 3 })),
  prevCard: () => set((state) => ({ currentCard: (state.currentCard - 1 + 3) % 3 })),

  // Speaking
  isRecording: false,
  startRecording: () => set({ isRecording: true }),
  stopRecording: () => set({ isRecording: false }),

  // UI
  showDemo: false,
  toggleDemo: () => set((state) => ({ showDemo: !state.showDemo })),
}))
