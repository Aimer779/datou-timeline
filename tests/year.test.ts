import { describe, expect, it } from 'vitest'
import { yearFromDragDelta, yearFromRulerOffset, clampYear, getAdjacentFrames } from '../src/year'
import { NODE_YEARS, type YearFrameManifestEntry } from '../src/types'
import { finalizeFrameLoading, type FrameImageState } from '../src/hooks/useFrameImages'

const frames: YearFrameManifestEntry[] = NODE_YEARS.map((year) => ({
  year,
  file: `year-${year}.png`,
  width: 1254,
  height: 1254,
  sha256: 'a'.repeat(64),
}))

describe('year mapping', () => {
  it('clamps invalid and out-of-range years to the supported interval', () => {
    expect(clampYear(Number.NaN)).toBe(1995)
    expect(clampYear(-20)).toBe(1995)
    expect(clampYear(2100)).toBe(2026)
    expect(clampYear(2017.5)).toBe(2017.5)
  })

  it('maps ruler clicks and drag deltas without jumping from the current year', () => {
    expect(yearFromRulerOffset(1995, 0, 28)).toBe(1995)
    expect(yearFromRulerOffset(2014, 56, 28)).toBe(2016)
    expect(yearFromDragDelta(2014, -56, 28)).toBe(2016)
    expect(yearFromDragDelta(2014, 56, 28)).toBe(2012)
    expect(yearFromDragDelta(1995, 56, 28)).toBe(1995)
    expect(yearFromRulerOffset(2026, 56, 28)).toBe(2026)
  })

  it('returns adjacent nodes and a normalized blend ratio', () => {
    const start = getAdjacentFrames(1995, frames)
    expect(start?.lower.year).toBe(1995)
    expect(start?.upper.year).toBe(1995)
    expect(start?.ratio).toBe(0)

    const middle = getAdjacentFrames(2015, frames)
    expect(middle?.lower.year).toBe(2014)
    expect(middle?.upper.year).toBe(2016)
    expect(middle?.ratio).toBe(0.5)

    const end = getAdjacentFrames(2100, frames)
    expect(end?.lower.year).toBe(2026)
    expect(end?.upper.year).toBe(2026)
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
    failedYears: [],
  })

  it('promotes an all-frame failure to a terminal error', () => {
    const completed = finalizeFrameLoading(state(0))
    expect(completed.loading).toBe(false)
    expect(completed.error).toBe('No year portraits could be loaded')
  })

  it('finishes without an error when at least one fallback frame is available', () => {
    const completed = finalizeFrameLoading(state(1))
    expect(completed.loading).toBe(false)
    expect(completed.error).toBeNull()
  })
})
