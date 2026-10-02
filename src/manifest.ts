import { NODE_YEARS, type YearFrameManifest, type YearFrameManifestEntry, type NodeYear } from './types'

const SHA256_PATTERN = /^[a-f0-9]{64}$/i

function isNodeYear(value: unknown): value is NodeYear {
  return typeof value === 'number' && (NODE_YEARS as readonly number[]).includes(value)
}

export function parseManifest(value: unknown): YearFrameManifest {
  if (!value || typeof value !== 'object') throw new Error('manifest must be an object')
  const candidate = value as Partial<YearFrameManifest>
  if (candidate.version !== 1) throw new Error('manifest version must be 1')
  if (candidate.width !== 1254 || candidate.height !== 1254) {
    throw new Error('manifest canvas dimensions must be 1254x1254')
  }
  if (!Array.isArray(candidate.frames)) throw new Error('manifest frames must be an array')

  const frames = candidate.frames.map((frame, index) => validateEntry(frame, index))
  const years = frames.map((frame) => frame.year)
  const expected = [...NODE_YEARS]
  if (frames.length !== expected.length || expected.some((year) => !years.includes(year))) {
    throw new Error(`manifest must contain exactly years ${expected.join(', ')}`)
  }
  if (new Set(years).size !== years.length) throw new Error('manifest contains duplicate years')
  if (new Set(frames.map((frame) => frame.file)).size !== frames.length) {
    throw new Error('manifest contains duplicate files')
  }

  return {
    version: 1,
    width: 1254,
    height: 1254,
    frames: frames.sort((a, b) => a.year - b.year),
  }
}

function validateEntry(value: unknown, index: number): YearFrameManifestEntry {
  if (!value || typeof value !== 'object') throw new Error(`frame ${index} must be an object`)
  const frame = value as Partial<YearFrameManifestEntry>
  if (!isNodeYear(frame.year)) throw new Error(`frame ${index} has an unsupported year`)
  if (typeof frame.file !== 'string' || !/^[-\w./]+\.png$/i.test(frame.file)) {
    throw new Error(`frame ${index} file must be a relative PNG path`)
  }
  if (frame.file.startsWith('/') || frame.file.includes('..')) {
    throw new Error(`frame ${index} file must stay below year-frames`)
  }
  if (frame.width !== 1254 || frame.height !== 1254) {
    throw new Error(`frame ${index} dimensions must be 1254x1254`)
  }
  if (typeof frame.sha256 !== 'string' || !SHA256_PATTERN.test(frame.sha256)) {
    throw new Error(`frame ${index} sha256 must be a 64-character hex digest`)
  }
  return {
    year: frame.year,
    file: frame.file,
    width: 1254,
    height: 1254,
    sha256: frame.sha256.toLowerCase(),
  }
}
