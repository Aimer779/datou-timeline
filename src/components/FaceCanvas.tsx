import { useCallback, useEffect, useRef } from 'react'
import { getAdjacentFrames } from '../age'
import type { DisplayMode, LoadedFrame } from '../types'
import type { FrameImageState } from '../hooks/useFrameImages'

interface FaceCanvasProps {
  age: number
  mode: DisplayMode
  frames: FrameImageState
}

function nearestLoaded(
  age: number,
  frames: FrameImageState,
): LoadedFrame | null {
  if (!frames.manifest) return null
  return frames.manifest.frames
    .map((entry) => frames.loaded.get(entry.age))
    .filter((frame): frame is LoadedFrame => Boolean(frame))
    .sort((a, b) => Math.abs(a.entry.age - age) - Math.abs(b.entry.age - age))[0] ?? null
}

export function FaceCanvas({ age, mode, frames }: FaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const unavailable = Boolean(frames.error) && frames.loaded.size === 0

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = Math.max(1, Math.round(rect.width * dpr))
    const height = Math.max(1, Math.round(rect.height * dpr))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

    const context = canvas.getContext('2d')
    if (!context) return
    context.clearRect(0, 0, width, height)
    context.save()
    context.scale(dpr, dpr)
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.filter = mode === 'mono' ? 'grayscale(1)' : 'none'

    const adjacent = frames.manifest ? getAdjacentFrames(age, frames.manifest.frames) : null
    const lower = adjacent ? frames.loaded.get(adjacent.lower.age) : null
    const upper = adjacent ? frames.loaded.get(adjacent.upper.age) : null
    const fallback = nearestLoaded(age, frames)
    const drawImage = (frame: LoadedFrame, alpha: number) => {
      context.globalAlpha = alpha
      context.drawImage(frame.image, 0, 0, rect.width, rect.height)
    }

    if (lower && upper && lower.entry.age !== upper.entry.age && adjacent) {
      drawImage(lower, 1 - adjacent.ratio)
      drawImage(upper, adjacent.ratio)
    } else if (lower) {
      drawImage(lower, 1)
    } else if (upper) {
      drawImage(upper, 1)
    } else if (fallback) {
      drawImage(fallback, 1)
    }
    context.restore()
  }, [age, frames, mode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [draw])

  if (unavailable) {
    return (
      <div className="portrait-unavailable" aria-hidden="true">
        <span>Portrait unavailable</span>
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className="face-canvas"
      role="img"
      aria-label={`Illustrated face at age ${Math.round(age)}`}
    />
  )
}
