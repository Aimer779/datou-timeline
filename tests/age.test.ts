import { describe, expect, it } from 'vitest'
import { ageFromDragDelta, ageFromRulerOffset, clampAge, getAdjacentFrames } from '../src/age'
import { NODE_AGES, type AgeFrameManifestEntry } from '../src/types'
import { finalizeFrameLoading, type FrameImageState } from '../src/hooks/useFrameImages'

const frames: AgeFrameManifestEntry[] = NODE_AGES.map((age) => ({
  age,
  file: `age-${age}.webp`,
  width: 768,
  height: 768,
  sha256: 'a'.repeat(64),
}))

describe('age mapping', () => {
  it('clamps invalid and out-of-range ages to the supported interval', () => {
    expect(clampAge(Number.NaN)).toBe(5)
    expect(clampAge(-20)).toBe(5)
    expect(clampAge(120)).toBe(88)
    expect(clampAge(42.5)).toBe(42.5)
  })

  it('maps ruler clicks and drag deltas without jumping from the current age', () => {
    expect(ageFromRulerOffset(5, 0, 28)).toBe(5)
    expect(ageFromRulerOffset(20, 56, 28)).toBe(22)
    expect(ageFromDragDelta(20, -56, 28)).toBe(22)
    expect(ageFromDragDelta(20, 56, 28)).toBe(18)
    expect(ageFromDragDelta(5, 56, 28)).toBe(5)
    expect(ageFromRulerOffset(88, 56, 28)).toBe(88)
  })

  it('returns adjacent nodes and a normalized blend ratio', () => {
    const start = getAdjacentFrames(5, frames)
    expect(start?.lower.age).toBe(5)
    expect(start?.upper.age).toBe(5)
    expect(start?.ratio).toBe(0)

    const middle = getAdjacentFrames(16, frames)
    expect(middle?.lower.age).toBe(12)
    expect(middle?.upper.age).toBe(20)
    expect(middle?.ratio).toBe(0.5)

    const end = getAdjacentFrames(100, frames)
    expect(end?.lower.age).toBe(88)
    expect(end?.upper.age).toBe(88)
    expect(end?.ratio).toBe(0)
  })
})

describe('frame loading completion', () => {
  const state = (loadedCount: number): FrameImageState => ({
    manifest: null,
    loaded: new Map(
      Array.from({ length: loadedCount }, (_, index) => [index, {} as never]),
    ),
    loading: true,
    error: null,
    failedAges: [],
  })

  it('promotes an all-frame failure to a terminal error', () => {
    const completed = finalizeFrameLoading(state(0))
    expect(completed.loading).toBe(false)
    expect(completed.error).toBe('No age portraits could be loaded')
  })

  it('finishes without an error when at least one fallback frame is available', () => {
    const completed = finalizeFrameLoading(state(1))
    expect(completed.loading).toBe(false)
    expect(completed.error).toBeNull()
  })
})
