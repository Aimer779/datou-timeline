import { NODE_YEARS, NODE_POSITIONS, type YearFrameManifest, type YearFrameManifestEntry, type NodeYear, type NodePosition } from './types'

const SHA256_PATTERN = /^[a-f0-9]{64}$/i

function isNodeYear(value: unknown): value is NodeYear {
  return typeof value === 'number' && (NODE_YEARS as readonly number[]).includes(value)
}

function isNodePosition(value: unknown): value is NodePosition {
  return typeof value === 'number' && (NODE_POSITIONS as readonly number[]).includes(value)
}

export function parseManifest(value: unknown): YearFrameManifest {
  if (!value || typeof value !== 'object') throw new Error('manifest must be an object')
  const candidate = value as Partial<YearFrameManifest>
  if (candidate.version !== 1) throw new Error('manifest version must be 1')
  if (candidate.width !== 768 || candidate.height !== 768) {
    throw new Error('manifest canvas dimensions must be 768x768')
  }
  if (!Array.isArray(candidate.frames)) throw new Error('manifest frames must be an array')

  const frames = candidate.frames.map((frame, index) => validateEntry(frame, index))
  const positions = frames.map((frame) => frame.position)
  const expected = [...NODE_POSITIONS]
  if (frames.length !== expected.length || expected.some((position) => !positions.includes(position))) {
    throw new Error(`manifest must contain exactly positions ${expected.join(', ')}`)
  }
  if (new Set(positions).size !== positions.length) throw new Error('manifest contains duplicate positions')
  if (new Set(frames.map((frame) => frame.file)).size !== frames.length) {
    throw new Error('manifest contains duplicate files')
  }

  return {
    version: 1,
    width: 768,
    height: 768,
    frames: frames.sort((a, b) => a.position - b.position),
  }
}

function validateEntry(value: unknown, index: number): YearFrameManifestEntry {
  if (!value || typeof value !== 'object') throw new Error(`frame ${index} must be an object`)
  const frame = value as Partial<YearFrameManifestEntry>
  if (!isNodeYear(frame.year)) throw new Error(`frame ${index} has an unsupported year`)
  if (!isNodePosition(frame.position) || frame.year !== Math.min(frame.position, 2026)) {
    throw new Error(`frame ${index} has an invalid position/year pairing`)
  }
  if (typeof frame.file !== 'string' || !/^[-\w./]+\.webp$/i.test(frame.file)) {
    throw new Error(`frame ${index} file must be a relative WebP path`)
  }
  if (frame.file.startsWith('/') || frame.file.includes('..')) {
    throw new Error(`frame ${index} file must stay below year-frames`)
  }
  if (frame.width !== 768 || frame.height !== 768) {
    throw new Error(`frame ${index} dimensions must be 768x768`)
  }
  if (typeof frame.sha256 !== 'string' || !SHA256_PATTERN.test(frame.sha256)) {
    throw new Error(`frame ${index} sha256 must be a 64-character hex digest`)
  }
  return {
    position: frame.position,
    year: frame.year,
    file: frame.file,
    width: 768,
    height: 768,
    sha256: frame.sha256.toLowerCase(),
  }
}
