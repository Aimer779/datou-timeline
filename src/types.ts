export const NODE_YEARS = [1995, 2013, 2014, 2016, 2018, 2021, 2022, 2024, 2026] as const
// The final slot is a second portrayal in 2026, not a work released in 2027.
export const ADULT_POSITION = 2027
export const NODE_POSITIONS = [...NODE_YEARS, ADULT_POSITION] as const
export type NodePosition = (typeof NODE_POSITIONS)[number]

export type NodeYear = (typeof NODE_YEARS)[number]
export type DisplayMode = 'mono' | 'color'

export interface YearFrameManifestEntry {
  position: NodePosition
  year: NodeYear
  file: string
  width: number
  height: number
  sha256: string
}

export interface YearFrameManifest {
  version: 1
  width: 768
  height: 768
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
