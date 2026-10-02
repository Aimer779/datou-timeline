import { describe, expect, it } from 'vitest'
import { describeYear } from '../src/works'
import { parseManifest } from '../src/manifest'
import { NODE_POSITIONS } from '../src/types'

describe('work-year semantics', () => {
  it('labels real works and explicitly distinguishes interpolated years', () => {
    expect(describeYear(1995)).toBe('原版第一部')
    expect(describeYear(2014)).toBe('秘密计划')
    expect(describeYear(2026)).toContain('童年形象')
    expect(describeYear(2027)).toContain('成年形象')
    expect(describeYear(2026.5)).toContain('童年 → 成年 · 过渡')
    expect(describeYear(2004)).toBe('1995 原版第一部 → 2013 新版第一季 · 过渡')
    expect(describeYear(2014.5)).toContain('过渡')
  })

  it('accepts only the complete catalog with safe local portrait paths', () => {
    const manifest = { version: 1, width: 1254, height: 1254,
      frames: NODE_POSITIONS.map(position => ({ position, year: Math.min(position, 2026), file: `frame-${position}.png`,
        width: 1254, height: 1254, sha256: 'a'.repeat(64) })) }
    expect(parseManifest(manifest).frames).toHaveLength(10)
    expect(parseManifest(manifest).frames.filter(frame => frame.year === 2026)).toHaveLength(2)
    expect(() => parseManifest({ ...manifest, frames: manifest.frames.map((frame, i) =>
      i === 9 ? { ...frame, year: 2027 } : frame) })).toThrow()
    expect(() => parseManifest({ ...manifest, frames: manifest.frames.map((frame, i) =>
      i === 9 ? { ...frame, position: 2026 } : frame) })).toThrow()
    expect(() => parseManifest({ ...manifest, frames: manifest.frames.slice(1) })).toThrow()
    expect(() => parseManifest({ ...manifest, frames: manifest.frames.map((frame, i) =>
      i === 0 ? { ...frame, file: '../outside.png' } : frame) })).toThrow()
  })
})
