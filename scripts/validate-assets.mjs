import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const assetRoot = path.join(root, 'public', 'year-frames')
const expectedYears = [1995, 2013, 2014, 2016, 2018, 2021, 2022, 2024, 2026]
const failures = []
const fail = (message) => failures.push(message)
const manifest = JSON.parse(await readFile(path.join(assetRoot, 'manifest.json'), 'utf8'))

if (manifest.version !== 1 || manifest.width !== 1254 || manifest.height !== 1254) {
  fail('Expected version 1 and 1254x1254 canvas')
}
const frames = manifest.frames
if (!Array.isArray(frames)) throw new Error('Missing frames')
const years = frames.map((frame) => frame.year)
if (frames.length !== expectedYears.length || expectedYears.some((year) => !years.includes(year))) {
  fail('Expected exactly the nine catalog years')
}
if (new Set(years).size !== frames.length) fail('Duplicate years')
if (new Set(frames.map((frame) => frame.file)).size !== frames.length) fail('Duplicate files')

for (const frame of frames) {
  if (!/^[\w-]+\.png$/.test(frame.file)) {
    fail(`Unsafe filename: ${frame.file}`)
    continue
  }
  try {
    const bytes = await readFile(path.join(assetRoot, frame.file))
    if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
      fail(`${frame.file}: invalid PNG`)
      continue
    }
    if (bytes.readUInt32BE(16) !== 1254 || bytes.readUInt32BE(20) !== 1254 ||
        frame.width !== 1254 || frame.height !== 1254) fail(`${frame.file}: wrong dimensions`)
    if (bytes[25] !== 6) fail(`${frame.file}: expected RGBA transparency`)
    const digest = createHash('sha256').update(bytes).digest('hex')
    if (digest !== frame.sha256) fail(`${frame.file}: SHA-256 mismatch`)
  } catch (error) {
    fail(`${frame.file}: ${error.message}`)
  }
}
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Validated ${frames.length} PNG portraits: 1254x1254, RGBA, SHA-256.`)
}
