import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FaceCanvas } from '../src/components/FaceCanvas'
import type { FrameImageState } from '../src/hooks/useFrameImages'

function frameState(error: string | null): FrameImageState {
  return {
    manifest: null,
    loaded: new Map(),
    loading: false,
    error,
    failedPositions: [],
  }
}

describe('FaceCanvas terminal fallback', () => {
  it('replaces a misleading empty image canvas when no portrait can load', () => {
    const html = renderToStaticMarkup(
      <FaceCanvas position={1995} mode="mono" frames={frameState('No position portraits could be loaded')} />,
    )

    expect(html).toContain('portrait-unavailable')
    expect(html).toContain('人物图像暂不可用')
    expect(html).not.toContain('<canvas')
    expect(html).not.toContain('role="img"')
  })

  it('retains the portrait canvas outside the terminal error state', () => {
    const html = renderToStaticMarkup(
      <FaceCanvas position={1995} mode="mono" frames={frameState(null)} />,
    )

    expect(html).toContain('<canvas')
    expect(html).toContain('role="img"')
  })
})
