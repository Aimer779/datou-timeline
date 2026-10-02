import type { AdjacentFrames, YearFrameManifestEntry } from './types'
import { ADULT_POSITION, NODE_POSITIONS } from './types'

export const MIN_POSITION = NODE_POSITIONS[0]
export const MAX_POSITION = NODE_POSITIONS[NODE_POSITIONS.length - 1]

export function clampPosition(position: number): number {
  if (!Number.isFinite(position)) return MIN_POSITION
  return Math.min(MAX_POSITION, Math.max(MIN_POSITION, position))
}

export function getAdjacentFrames(
  position: number,
  frames: readonly YearFrameManifestEntry[],
): AdjacentFrames | null {
  if (frames.length === 0) return null

  const ordered = [...frames].sort((a, b) => a.position - b.position)
  const safePosition = clampPosition(position)
  const first = ordered[0]
  const last = ordered[ordered.length - 1]
  if (!first || !last) return null
  if (safePosition <= first.position) return { lower: first, upper: first, ratio: 0 }
  if (safePosition >= last.position) return { lower: last, upper: last, ratio: 0 }

  for (let index = 1; index < ordered.length; index += 1) {
    const upper = ordered[index]
    const lower = ordered[index - 1]
    if (upper && lower && safePosition <= upper.position) {
      const span = upper.position - lower.position
      const ratio = span === 0 ? 0 : (safePosition - lower.position) / span
      return { lower, upper, ratio: Math.min(1, Math.max(0, ratio)) }
    }
  }
  return { lower: last, upper: last, ratio: 0 }
}

export function positionFromRulerOffset(position: number, offset: number, spacing: number): number {
  if (!Number.isFinite(offset) || !Number.isFinite(spacing) || spacing <= 0) {
    return clampPosition(position)
  }
  return clampPosition(position + offset / spacing)
}

export function positionFromDragDelta(startPosition: number, delta: number, spacing: number): number {
  if (!Number.isFinite(delta) || !Number.isFinite(spacing) || spacing <= 0) {
    return clampPosition(startPosition)
  }
  return clampPosition(startPosition - delta / spacing)
}

export function formatPosition(position: number): string {
  const value = clampPosition(position)
  if (value === ADULT_POSITION) return '2026 · 成年'
  if (value > 2026) return '2026 · 童年 → 成年'
  if (value === 2026) return '2026 · 童年'
  return String(Math.round(value))
}

export function nearestPosition(position: number): number {
  return Math.round(clampPosition(position))
}
