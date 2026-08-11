import type { AdjacentFrames, AgeFrameManifestEntry } from './types'
import { NODE_AGES } from './types'

export const MIN_AGE = NODE_AGES[0]
export const MAX_AGE = NODE_AGES[NODE_AGES.length - 1]

export function clampAge(age: number): number {
  if (!Number.isFinite(age)) return MIN_AGE
  return Math.min(MAX_AGE, Math.max(MIN_AGE, age))
}

export function getAdjacentFrames(
  age: number,
  frames: readonly AgeFrameManifestEntry[],
): AdjacentFrames | null {
  if (frames.length === 0) return null

  const ordered = [...frames].sort((a, b) => a.age - b.age)
  const safeAge = clampAge(age)
  const first = ordered[0]
  const last = ordered[ordered.length - 1]
  if (!first || !last) return null
  if (safeAge <= first.age) return { lower: first, upper: first, ratio: 0 }
  if (safeAge >= last.age) return { lower: last, upper: last, ratio: 0 }

  for (let index = 1; index < ordered.length; index += 1) {
    const upper = ordered[index]
    const lower = ordered[index - 1]
    if (upper && lower && safeAge <= upper.age) {
      const span = upper.age - lower.age
      const ratio = span === 0 ? 0 : (safeAge - lower.age) / span
      return { lower, upper, ratio: Math.min(1, Math.max(0, ratio)) }
    }
  }
  return { lower: last, upper: last, ratio: 0 }
}

export function ageFromRulerOffset(age: number, offset: number, spacing: number): number {
  if (!Number.isFinite(offset) || !Number.isFinite(spacing) || spacing <= 0) {
    return clampAge(age)
  }
  return clampAge(age + offset / spacing)
}

export function ageFromDragDelta(startAge: number, delta: number, spacing: number): number {
  if (!Number.isFinite(delta) || !Number.isFinite(spacing) || spacing <= 0) {
    return clampAge(startAge)
  }
  return clampAge(startAge - delta / spacing)
}

export function formatAge(age: number): string {
  return String(Math.round(clampAge(age)))
}

export function nearestAge(age: number): number {
  return Math.round(clampAge(age))
}
