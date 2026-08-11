import { NODE_AGES, type AgeFrameManifest, type AgeFrameManifestEntry, type NodeAge } from './types'

const SHA256_PATTERN = /^[a-f0-9]{64}$/i

function isNodeAge(value: unknown): value is NodeAge {
  return typeof value === 'number' && (NODE_AGES as readonly number[]).includes(value)
}

export function parseManifest(value: unknown): AgeFrameManifest {
  if (!value || typeof value !== 'object') throw new Error('manifest must be an object')
  const candidate = value as Partial<AgeFrameManifest>
  if (candidate.version !== 1) throw new Error('manifest version must be 1')
  if (candidate.width !== 768 || candidate.height !== 768) {
    throw new Error('manifest canvas dimensions must be 768x768')
  }
  if (!Array.isArray(candidate.frames)) throw new Error('manifest frames must be an array')

  const frames = candidate.frames.map((frame, index) => validateEntry(frame, index))
  const ages = frames.map((frame) => frame.age)
  const expected = [...NODE_AGES]
  if (frames.length !== expected.length || expected.some((age) => !ages.includes(age))) {
    throw new Error(`manifest must contain exactly ages ${expected.join(', ')}`)
  }
  if (new Set(ages).size !== ages.length) throw new Error('manifest contains duplicate ages')
  if (new Set(frames.map((frame) => frame.file)).size !== frames.length) {
    throw new Error('manifest contains duplicate files')
  }

  return {
    version: 1,
    width: 768,
    height: 768,
    frames: frames.sort((a, b) => a.age - b.age),
  }
}

function validateEntry(value: unknown, index: number): AgeFrameManifestEntry {
  if (!value || typeof value !== 'object') throw new Error(`frame ${index} must be an object`)
  const frame = value as Partial<AgeFrameManifestEntry>
  if (!isNodeAge(frame.age)) throw new Error(`frame ${index} has an unsupported age`)
  if (typeof frame.file !== 'string' || !/^[-\w./]+\.webp$/i.test(frame.file)) {
    throw new Error(`frame ${index} file must be a relative WebP path`)
  }
  if (frame.file.startsWith('/') || frame.file.includes('..')) {
    throw new Error(`frame ${index} file must stay below age-frames`)
  }
  if (frame.width !== 768 || frame.height !== 768) {
    throw new Error(`frame ${index} dimensions must be 768x768`)
  }
  if (typeof frame.sha256 !== 'string' || !SHA256_PATTERN.test(frame.sha256)) {
    throw new Error(`frame ${index} sha256 must be a 64-character hex digest`)
  }
  return {
    age: frame.age,
    file: frame.file,
    width: 768,
    height: 768,
    sha256: frame.sha256.toLowerCase(),
  }
}
