import type { AdjacentFrames, YearFrameManifestEntry } from './types'
import { NODE_YEARS } from './types'

export const MIN_YEAR = NODE_YEARS[0]
export const MAX_YEAR = NODE_YEARS[NODE_YEARS.length - 1]

export function clampYear(year: number): number {
  if (!Number.isFinite(year)) return MIN_YEAR
  return Math.min(MAX_YEAR, Math.max(MIN_YEAR, year))
}

export function getAdjacentFrames(
  year: number,
  frames: readonly YearFrameManifestEntry[],
): AdjacentFrames | null {
  if (frames.length === 0) return null

  const ordered = [...frames].sort((a, b) => a.year - b.year)
  const safeYear = clampYear(year)
  const first = ordered[0]
  const last = ordered[ordered.length - 1]
  if (!first || !last) return null
  if (safeYear <= first.year) return { lower: first, upper: first, ratio: 0 }
  if (safeYear >= last.year) return { lower: last, upper: last, ratio: 0 }

  for (let index = 1; index < ordered.length; index += 1) {
    const upper = ordered[index]
    const lower = ordered[index - 1]
    if (upper && lower && safeYear <= upper.year) {
      const span = upper.year - lower.year
      const ratio = span === 0 ? 0 : (safeYear - lower.year) / span
      return { lower, upper, ratio: Math.min(1, Math.max(0, ratio)) }
    }
  }
  return { lower: last, upper: last, ratio: 0 }
}

export function yearFromRulerOffset(year: number, offset: number, spacing: number): number {
  if (!Number.isFinite(offset) || !Number.isFinite(spacing) || spacing <= 0) {
    return clampYear(year)
  }
  return clampYear(year + offset / spacing)
}

export function yearFromDragDelta(startYear: number, delta: number, spacing: number): number {
  if (!Number.isFinite(delta) || !Number.isFinite(spacing) || spacing <= 0) {
    return clampYear(startYear)
  }
  return clampYear(startYear - delta / spacing)
}

export function formatYear(year: number): string {
  return String(Math.round(clampYear(year)))
}

export function nearestYear(year: number): number {
  return Math.round(clampYear(year))
}
