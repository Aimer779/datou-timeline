import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const assetRoot = path.join(root, 'public', 'year-frames')
const expectedPositions = [1995, 2013, 2014, 2016, 2018, 2021, 2022, 2024, 2026, 2027]
const failures = []
const fail = (message) => failures.push(message)
const manifest = JSON.parse(await readFile(path.join(root, 'src/data/frames.json'), 'utf8'))

if (manifest.version !== 1 || manifest.width !== 768 || manifest.height !== 768) {
  fail('Expected version 1 and 768x768 canvas')
}
const frames = manifest.frames
if (!Array.isArray(frames)) throw new Error('Missing frames')
const positions = frames.map((frame) => frame.position)
if (frames.length !== expectedPositions.length || expectedPositions.some((position) => !positions.includes(position))) {
  fail('Expected ten portraits across nine catalog years')
}
if (new Set(positions).size !== frames.length) fail('Duplicate positions')
if (new Set(frames.map((frame) => frame.file)).size !== frames.length) fail('Duplicate files')

for (const frame of frames) {
  if (frame.year !== Math.min(frame.position, 2026)) fail(`${frame.file}: invalid position/year pairing`)
  if (!/^[\w-]+\.[a-f0-9]{12}\.webp$/.test(frame.file)) {
    fail(`Unsafe filename: ${frame.file}`)
    continue
  }
  try {
    const bytes = await readFile(path.join(assetRoot, frame.file))
    if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') {
      fail(`${frame.file}: invalid WebP`)
      continue
    }
    const chunk = bytes.toString('ascii', 12, 16)
    let width = 0, height = 0, alpha = false
    if (chunk === 'VP8X') {
      width = bytes.readUIntLE(24, 3) + 1
      height = bytes.readUIntLE(27, 3) + 1
      alpha = Boolean(bytes[20] & 0x10)
    } else if (chunk === 'VP8L' && bytes[20] === 0x2f) {
      const bits = bytes.readUInt32LE(21)
      width = (bits & 0x3fff) + 1
      height = ((bits >>> 14) & 0x3fff) + 1
      alpha = Boolean((bits >>> 28) & 1)
    }
    if (width !== 768 || height !== 768 || frame.width !== 768 || frame.height !== 768) {
      fail(`${frame.file}: wrong dimensions`)
    }
    if (!alpha) fail(`${frame.file}: expected transparency`)
    const digest = createHash('sha256').update(bytes).digest('hex')
    if (digest !== frame.sha256) fail(`${frame.file}: SHA-256 mismatch`)
    if (!frame.file.includes(digest.slice(0, 12))) fail(`${frame.file}: incorrect fingerprint`)
  } catch (error) {
    fail(`${frame.file}: ${error.message}`)
  }
}
const publishedFiles = await readdir(assetRoot)
if (publishedFiles.some(file => !frames.some(frame => frame.file === file))) fail('Unreferenced public portrait assets')
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Validated ${frames.length} WebP portraits: 768x768, alpha, fingerprints, SHA-256.`)
}
