import { describe, expect, it } from 'vitest'
import { describeYear } from '../src/works'
import { parseManifest } from '../src/manifest'
import { NODE_YEARS } from '../src/types'

describe('work-year semantics', () => {
  it('labels real works and explicitly distinguishes interpolated years', () => {
    expect(describeYear(1995)).toBe('原版第一部')
    expect(describeYear(2014)).toBe('秘密计划')
    expect(describeYear(2026)).toContain('童年形象')
    expect(describeYear(2004)).toBe('1995 原版第一部 → 2013 新版第一季 · 过渡')
    expect(describeYear(2014.5)).toContain('过渡')
  })

  it('accepts only the complete catalog with safe local portrait paths', () => {
    const manifest = { version: 1, width: 1254, height: 1254,
      frames: NODE_YEARS.map(year => ({ year, file: `year-${year}.png`,
        width: 1254, height: 1254, sha256: 'a'.repeat(64) })) }
    expect(parseManifest(manifest).frames).toHaveLength(9)
    expect(() => parseManifest({ ...manifest, frames: manifest.frames.slice(1) })).toThrow()
    expect(() => parseManifest({ ...manifest, frames: manifest.frames.map((frame, i) =>
      i === 0 ? { ...frame, file: '../outside.png' } : frame) })).toThrow()
  })
})
