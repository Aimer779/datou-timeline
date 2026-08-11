export const NODE_AGES = [5, 12, 20, 30, 40, 50, 62, 75, 88] as const

export type NodeAge = (typeof NODE_AGES)[number]
export type DisplayMode = 'mono' | 'color'

export interface AgeFrameManifestEntry {
  age: NodeAge
  file: string
  width: number
  height: number
  sha256: string
}

export interface AgeFrameManifest {
  version: 1
  width: 768
  height: 768
  frames: AgeFrameManifestEntry[]
}

export interface AdjacentFrames {
  lower: AgeFrameManifestEntry
  upper: AgeFrameManifestEntry
  ratio: number
}

export interface LoadedFrame {
  entry: AgeFrameManifestEntry
  image: HTMLImageElement
}
