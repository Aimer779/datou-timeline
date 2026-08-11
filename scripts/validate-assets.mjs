import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const assetRoot = path.resolve(root, 'public', 'age-frames')
const expectedAges = [5, 12, 20, 30, 40, 50, 62, 75, 88]
const shaPattern = /^[a-f0-9]{64}$/i

const failures = []
const fail = (message) => failures.push(message)

let manifest
try {
  manifest = JSON.parse(await readFile(path.join(assetRoot, 'manifest.json'), 'utf8'))
} catch (error) {
  fail(`cannot read public/age-frames/manifest.json: ${error instanceof Error ? error.message : String(error)}`)
}

if (manifest) {
  if (manifest.version !== 1) fail('manifest.version must be 1')
  if (manifest.width !== 768 || manifest.height !== 768) fail('manifest canvas dimensions must be 768x768')
  if (!Array.isArray(manifest.frames)) {
    fail('manifest.frames must be an array')
  } else {
    const ages = manifest.frames.map((frame) => frame?.age)
    if (manifest.frames.length !== expectedAges.length) fail(`expected ${expectedAges.length} frames`)
    for (const age of expectedAges) {
      if (!ages.includes(age)) fail(`missing age ${age}`)
    }
    if (new Set(ages).size !== ages.length) fail('duplicate frame ages')
    const files = manifest.frames.map((frame) => frame?.file)
    if (new Set(files).size !== files.length) fail('duplicate frame files')

    await Promise.all(manifest.frames.map((frame) => validateFrame(frame)))
  }
}

if (failures.length > 0) {
  console.error('Age progression asset validation failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(`Age progression assets valid: ${manifest.frames.length} WebP frames, 768x768, SHA-256 verified.`)
}

async function validateFrame(frame) {
  const age = frame?.age
  const prefix = `age ${String(age)}`
  if (!expectedAges.includes(age)) {
    fail(`${prefix}: unsupported age`)
    return
  }
  if (typeof frame.file !== 'string' || !/^[-\w./]+\.webp$/i.test(frame.file)) {
    fail(`${prefix}: file must be a relative WebP path`)
    return
  }
  if (frame.file.startsWith('/') || frame.file.includes('..')) {
    fail(`${prefix}: file escapes public/age-frames`)
    return
  }
  if (frame.width !== 768 || frame.height !== 768) fail(`${prefix}: manifest dimensions must be 768x768`)
  if (typeof frame.sha256 !== 'string' || !shaPattern.test(frame.sha256)) {
    fail(`${prefix}: sha256 must be a 64-character hex digest`)
    return
  }

  const filePath = path.resolve(assetRoot, frame.file)
  if (!filePath.startsWith(`${assetRoot}${path.sep}`)) {
    fail(`${prefix}: file escapes public/age-frames`)
    return
  }

  let bytes
  try {
    bytes = await readFile(filePath)
  } catch (error) {
    fail(`${prefix}: missing ${frame.file} (${error instanceof Error ? error.message : String(error)})`)
    return
  }

  const digest = createHash('sha256').update(bytes).digest('hex')
  if (digest !== frame.sha256.toLowerCase()) fail(`${prefix}: SHA-256 mismatch for ${frame.file}`)
  const dimensions = readWebpDimensions(bytes)
  if (!dimensions) {
    fail(`${prefix}: ${frame.file} is not a readable WebP file`)
  } else if (dimensions.width !== 768 || dimensions.height !== 768) {
    fail(`${prefix}: image dimensions are ${dimensions.width}x${dimensions.height}, expected 768x768`)
  }
}

function readWebpDimensions(bytes) {
  if (bytes.length < 30 || ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WEBP') return null
  const chunk = ascii(bytes, 12, 4)
  const offset = 20
  if (chunk === 'VP8X' && bytes.length >= offset + 10) {
    const width = 1 + bytes[offset + 4] + (bytes[offset + 5] << 8) + (bytes[offset + 6] << 16)
    const height = 1 + bytes[offset + 7] + (bytes[offset + 8] << 8) + (bytes[offset + 9] << 16)
    return { width, height }
  }
  if (chunk === 'VP8L' && bytes[offset] === 0x2f && bytes.length >= offset + 5) {
    const width = 1 + bytes[offset + 1] + ((bytes[offset + 2] & 0x3f) << 8)
    const height = 1 + ((bytes[offset + 2] >> 6) | (bytes[offset + 3] << 2) | ((bytes[offset + 4] & 0xf) << 10))
    return { width, height }
  }
  if (chunk === 'VP8 ' && bytes.length >= offset + 10) {
    const frame = offset + 6
    const width = bytes[frame] | (bytes[frame + 1] << 8)
    const height = bytes[frame + 2] | (bytes[frame + 3] << 8)
    return { width: width & 0x3fff, height: height & 0x3fff }
  }
  return null
}

function ascii(bytes, start, length) {
  return String.fromCharCode(...bytes.slice(start, start + length))
}
