import { describe, expect, it } from 'vitest'
import { animateValue } from '../src/motion'

function manualClock() {
  let now = 0
  let id = 0
  const callbacks = new Map<number, FrameRequestCallback>()
  return {
    now: () => now,
    request: (callback: FrameRequestCallback) => {
      callbacks.set(++id, callback)
      return id
    },
    cancel: (frame: number) => { callbacks.delete(frame) },
    advance: (time: number) => {
      now = time
      const ready = [...callbacks.values()]
      callbacks.clear()
      ready.forEach(callback => callback(now))
    },
    pending: () => callbacks.size,
  }
}

describe('interruptible ruler motion', () => {
  it('settles exactly without overshoot or endless frames', () => {
    const clock = manualClock()
    const values: number[] = []
    animateValue(2026.4, 2026, 100, value => values.push(value), clock)
    clock.advance(50)
    expect(values[0]).toBeGreaterThan(2026)
    expect(values[0]).toBeLessThan(2026.4)
    clock.advance(100)
    expect(values.at(-1)).toBe(2026)
    expect(clock.pending()).toBe(0)
  })

  it('a new action cancels the old target instead of fighting it', () => {
    const clock = manualClock()
    const values: number[] = []
    const cancel = animateValue(2000, 2027, 160, value => values.push(value), clock)
    clock.advance(40)
    const current = values.at(-1)!
    cancel()
    animateValue(current, 1995, 100, value => values.push(value), clock)
    clock.advance(140)
    clock.advance(300)
    expect(values.at(-1)).toBe(1995)
    expect(values).not.toContain(2027)
    expect(clock.pending()).toBe(0)
  })

  it('reduced motion publishes immediately without scheduling a frame', () => {
    const clock = manualClock()
    const values: number[] = []
    animateValue(2026.5, 2027, 0, value => values.push(value), clock)
    expect(values).toEqual([2027])
    expect(clock.pending()).toBe(0)
  })
})
