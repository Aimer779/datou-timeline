import { useEffect, useState } from 'react'
import { parseManifest } from '../manifest'
import type { AgeFrameManifest, LoadedFrame } from '../types'

export interface FrameImageState {
  manifest: AgeFrameManifest | null
  loaded: ReadonlyMap<number, LoadedFrame>
  loading: boolean
  error: string | null
  failedAges: readonly number[]
}

export function finalizeFrameLoading(state: FrameImageState): FrameImageState {
  if (state.loaded.size === 0) {
    return {
      ...state,
      loading: false,
      error: 'No age portraits could be loaded',
    }
  }
  return { ...state, loading: false }
}

function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Unable to load ${path}`))
    image.src = `/age-frames/${path}`
  })
}

export function useFrameImages(): FrameImageState {
  const [state, setState] = useState<FrameImageState>({
    manifest: null,
    loaded: new Map(),
    loading: true,
    error: null,
    failedAges: [],
  })

  useEffect(() => {
    const controller = new AbortController()
    let disposed = false

    async function loadFrames() {
      try {
        const response = await fetch('/age-frames/manifest.json', { signal: controller.signal })
        if (!response.ok) throw new Error(`Manifest request failed (${response.status})`)
        const manifest = parseManifest(await response.json())
        if (disposed) return
        setState((previous) => ({ ...previous, manifest, loading: true, error: null }))

        const first = manifest.frames[0]
        if (first) {
          try {
            const image = await loadImage(first.file)
            if (!disposed) {
              setState((previous) => {
                const loaded = new Map(previous.loaded)
                loaded.set(first.age, { entry: first, image })
                return { ...previous, loaded, loading: false }
              })
            }
          } catch {
            if (!disposed) {
              setState((previous) => ({
                ...previous,
                failedAges: [...previous.failedAges, first.age],
              }))
            }
          }
        }

        await Promise.all(
          manifest.frames.slice(1).map(async (entry) => {
            try {
              const image = await loadImage(entry.file)
              if (!disposed) {
                setState((previous) => {
                  const loaded = new Map(previous.loaded)
                  loaded.set(entry.age, { entry, image })
                  return { ...previous, loaded }
                })
              }
            } catch {
              if (!disposed) {
                setState((previous) => ({
                  ...previous,
                  failedAges: previous.failedAges.includes(entry.age)
                    ? previous.failedAges
                    : [...previous.failedAges, entry.age],
                }))
              }
            }
          }),
        )
        if (!disposed) setState(finalizeFrameLoading)
      } catch (error) {
        if (disposed || (error instanceof DOMException && error.name === 'AbortError')) return
        setState((previous) => ({
          ...previous,
          loading: false,
          error: error instanceof Error ? error.message : 'Unable to load age frames',
        }))
      }
    }

    void loadFrames()
    return () => {
      disposed = true
      controller.abort()
    }
  }, [])

  return state
}
