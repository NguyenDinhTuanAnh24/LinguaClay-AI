import { beforeEach, describe, expect, it } from 'vitest'
import { useDemoStore } from '@/lib/store/useDemoStore'

describe('useDemoStore', () => {
  beforeEach(() => {
    useDemoStore.setState({
      currentCard: 0,
      isRecording: false,
      showDemo: false,
    })
  })

  it('should have expected initial state', () => {
    const state = useDemoStore.getState()
    expect(state.currentCard).toBe(0)
    expect(state.isRecording).toBe(false)
    expect(state.showDemo).toBe(false)
  })

  it('flipCard should increment and wrap around 0..2', () => {
    const { flipCard } = useDemoStore.getState()

    flipCard()
    expect(useDemoStore.getState().currentCard).toBe(1)
    flipCard()
    expect(useDemoStore.getState().currentCard).toBe(2)
    flipCard()
    expect(useDemoStore.getState().currentCard).toBe(0)
  })

  it('nextCard should increment and wrap around', () => {
    const { nextCard } = useDemoStore.getState()

    nextCard()
    nextCard()
    nextCard()

    expect(useDemoStore.getState().currentCard).toBe(0)
  })

  it('prevCard should decrement and wrap from 0 to 2', () => {
    const { prevCard } = useDemoStore.getState()

    prevCard()
    expect(useDemoStore.getState().currentCard).toBe(2)
    prevCard()
    expect(useDemoStore.getState().currentCard).toBe(1)
  })

  it('startRecording and stopRecording should toggle recording state', () => {
    const { startRecording, stopRecording } = useDemoStore.getState()

    startRecording()
    expect(useDemoStore.getState().isRecording).toBe(true)
    stopRecording()
    expect(useDemoStore.getState().isRecording).toBe(false)
  })

  it('toggleDemo should invert showDemo state', () => {
    const { toggleDemo } = useDemoStore.getState()

    toggleDemo()
    expect(useDemoStore.getState().showDemo).toBe(true)
    toggleDemo()
    expect(useDemoStore.getState().showDemo).toBe(false)
  })

  it('card actions should not modify recording and demo flags', () => {
    const { nextCard, prevCard, flipCard } = useDemoStore.getState()

    nextCard()
    prevCard()
    flipCard()

    const state = useDemoStore.getState()
    expect(state.isRecording).toBe(false)
    expect(state.showDemo).toBe(false)
  })
})
