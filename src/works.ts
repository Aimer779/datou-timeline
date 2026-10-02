import { clampPosition } from './timeline'
import { NODE_YEARS, type NodeYear } from './types'

export const WORKS: Record<NodeYear, string> = {
  1995: '原版第一部',
  2013: '新版第一季',
  2014: '秘密计划',
  2016: '一日成才',
  2018: '俄罗斯奇遇记',
  2021: '完美爸爸',
  2022: '我的外星朋友',
  2024: '迷你大冒险',
  2026: '天眼系列：失控的第七天 · 童年形象',
}

export function describeYear(value: number): string {
  const position = clampPosition(value)
  if (position > 2026) {
    return `天眼系列：失控的第七天 · ${position === 2027 ? '成年形象' : '童年 → 成年 · 过渡'}`
  }
  const year = position
  const exact = NODE_YEARS.find((node) => Math.abs(node - year) < 0.01)
  if (exact) return WORKS[exact]
  const upperIndex = NODE_YEARS.findIndex((node) => node > year)
  const lower = NODE_YEARS[upperIndex - 1]
  const upper = NODE_YEARS[upperIndex]
  return `${lower} ${WORKS[lower]} → ${upper} ${WORKS[upper]} · 过渡`
}
