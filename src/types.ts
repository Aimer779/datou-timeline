export const NODE_YEARS = [1995, 2013, 2014, 2016, 2018, 2021, 2022, 2024, 2026] as const

export type NodeYear = (typeof NODE_YEARS)[number]
export type DisplayMode = 'mono' | 'color'

export interface YearFrameManifestEntry {
  year: NodeYear
  file: string
  width: number
  height: number
  sha256: string
}

export interface YearFrameManifest {
  version: 1
  width: 1254
  height: 1254
  frames: YearFrameManifestEntry[]
}

export interface AdjacentFrames {
  lower: YearFrameManifestEntry
  upper: YearFrameManifestEntry
  ratio: number
}

export interface LoadedFrame {
  entry: YearFrameManifestEntry
  image: HTMLImageElement
}
