import { describe, expect, it } from 'vitest'
import { positionFromDragDelta, positionFromRulerOffset, clampPosition, getAdjacentFrames, formatPosition } from '../src/timeline'
import { NODE_POSITIONS, type YearFrameManifestEntry, type NodeYear } from '../src/types'
import { finalizeFrameLoading, type FrameImageState } from '../src/hooks/useFrameImages'

const frames: YearFrameManifestEntry[] = NODE_POSITIONS.map((position) => ({
  position,
  year: Math.min(position, 2026) as NodeYear,
  file: `position-${position}.png`,
  width: 1254,
  height: 1254,
  sha256: 'a'.repeat(64),
}))

describe('position mapping', () => {
  it('clamps invalid and out-of-range years to the supported interval', () => {
    expect(clampPosition(Number.NaN)).toBe(1995)
    expect(clampPosition(-20)).toBe(1995)
    expect(clampPosition(2100)).toBe(2027)
    expect(clampPosition(2017.5)).toBe(2017.5)
  })

  it('maps ruler clicks and drag deltas without jumping from the current position', () => {
    expect(positionFromRulerOffset(1995, 0, 28)).toBe(1995)
    expect(positionFromRulerOffset(2014, 56, 28)).toBe(2016)
    expect(positionFromDragDelta(2014, -56, 28)).toBe(2016)
    expect(positionFromDragDelta(2014, 56, 28)).toBe(2012)
    expect(positionFromDragDelta(1995, 56, 28)).toBe(1995)
    expect(positionFromRulerOffset(2026, 56, 28)).toBe(2027)
  })

  it('returns adjacent nodes and a normalized blend ratio', () => {
    const start = getAdjacentFrames(1995, frames)
    expect(start?.lower.position).toBe(1995)
    expect(start?.upper.position).toBe(1995)
    expect(start?.ratio).toBe(0)

    const middle = getAdjacentFrames(2015, frames)
    expect(middle?.lower.position).toBe(2014)
    expect(middle?.upper.position).toBe(2016)
    expect(middle?.ratio).toBe(0.5)

    const end = getAdjacentFrames(2100, frames)
    expect(end?.lower.position).toBe(2027)
    expect(end?.upper.position).toBe(2027)
    expect(end?.ratio).toBe(0)
  })

  it('blends both 2026 portrayals without inventing a new release year', () => {
    const pair = getAdjacentFrames(2026.5, frames)
    expect(pair?.lower.year).toBe(2026)
    expect(pair?.upper.year).toBe(2026)
    expect(pair?.lower.position).not.toBe(pair?.upper.position)
    expect(pair?.ratio).toBe(0.5)
    expect(formatPosition(2026)).toBe('2026 · 童年')
    expect(formatPosition(2026.5)).toBe('2026 · 童年 → 成年')
    expect(formatPosition(2027)).toBe('2026 · 成年')
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
    failedPositions: [],
  })

  it('promotes an all-frame failure to a terminal error', () => {
    const completed = finalizeFrameLoading(state(0))
    expect(completed.loading).toBe(false)
    expect(completed.error).toBe('No position portraits could be loaded')
  })

  it('finishes without an error when at least one fallback frame is available', () => {
    const completed = finalizeFrameLoading(state(1))
    expect(completed.loading).toBe(false)
    expect(completed.error).toBeNull()
  })
})
