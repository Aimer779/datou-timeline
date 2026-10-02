import { useEffect, useRef, useState } from 'react'
import { parseManifest } from '../manifest'
import manifestData from '../data/frames.json'
import { createFrameQueue } from '../frameQueue'
import { portraitUrl } from '../assets'
import { getAdjacentFrames } from '../timeline'
import type { YearFrameManifest, LoadedFrame } from '../types'

const manifest = parseManifest(manifestData)

export interface FrameImageState {
  manifest: YearFrameManifest | null
  loaded: ReadonlyMap<number, LoadedFrame>
  loading: boolean
  error: string | null
  failedPositions: readonly number[]
}

export function finalizeFrameLoading(state: FrameImageState): FrameImageState {
  return { ...state, loading: false,
    error: state.loaded.size === 0 ? 'No position portraits could be loaded' : null }
}

function loadImage(file: string, priority: 'high' | 'low', signal: AbortSignal, attempt: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.fetchPriority = priority
    const cleanup = () => {
      image.onload = image.onerror = null
      signal.removeEventListener('abort', abort)
    }
    const abort = () => {
      cleanup()
      image.removeAttribute('src')
      reject(new DOMException('Aborted', 'AbortError'))
    }
    if (signal.aborted) { abort(); return }
    signal.addEventListener('abort', abort, { once: true })
    image.onerror = () => { cleanup(); reject(new Error(`Unable to load ${file}`)) }
    image.onload = () => {
      void image.decode().then(() => {
        cleanup()
        if (!signal.aborted) resolve(image)
      }, error => { cleanup(); reject(error) })
    }
    // A fresh retry URL also bypasses a document's cached failed image resource.
    image.src = portraitUrl(file) + (attempt > 0 ? `?retry=${attempt}` : '')
  })
}

const initialState = (): FrameImageState => ({
  manifest, loaded: new Map(), loading: true, error: null, failedPositions: [],
})

export function useFrameImages(position: number): FrameImageState & { retry: () => void } {
  const [state, setState] = useState(initialState)
  const [attempt, setAttempt] = useState(0)
  const currentPosition = useRef(position)
  currentPosition.current = position
  const prioritize = useRef<() => void>(() => {})

  useEffect(() => {
    const controller = new AbortController()
    setState(initialState())
    const queue = createFrameQueue(manifest.frames,
      entry => loadImage(entry.file, entry.position === manifest.frames[0].position ? 'high' : 'low', controller.signal, attempt),
      (entry, image) => setState(previous => {
        const loaded = new Map(previous.loaded)
        loaded.set(entry.position, { entry, image })
        return { ...previous, loaded }
      }),
      entry => setState(previous => ({ ...previous, failedPositions: [...previous.failedPositions, entry.position] })),
      () => setState(finalizeFrameLoading),
    )
    prioritize.current = () => {
      const target = currentPosition.current
      const pair = getAdjacentFrames(target, manifest.frames)
      queue.prioritize(entry => {
        const needed = pair && (entry.position === pair.lower.position || entry.position === pair.upper.position)
        return (needed ? -100 : 0) + Math.abs(entry.position - target)
      })
    }
    prioritize.current()
    queue.start()
    return () => {
      queue.stop()
      controller.abort()
      prioritize.current = () => {}
    }
  }, [attempt])

  useEffect(() => { prioritize.current() }, [position])
  return { ...state, retry: () => setAttempt(value => value + 1) }
}
