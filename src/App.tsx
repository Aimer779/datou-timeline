import { useCallback, useState } from 'react'
import { clampPosition, formatPosition, MIN_POSITION, getAdjacentFrames } from './timeline'
import { TimelineRuler } from './components/TimelineRuler'
import { FaceCanvas } from './components/FaceCanvas'
import { ModeSwitch } from './components/ModeSwitch'
import { useFrameImages } from './hooks/useFrameImages'
import type { DisplayMode } from './types'
import { describeYear } from './works'

const HINT_STORAGE_KEY = 'datou-timeline-hint-seen'

function readHintVisibility(): boolean {
  try {
    return window.localStorage.getItem(HINT_STORAGE_KEY) !== '1'
  } catch {
    return true
  }
}

function markHintSeen() {
  try {
    window.localStorage.setItem(HINT_STORAGE_KEY, '1')
  } catch {
    // Private browsing can deny storage; the hint still fades for this session.
  }
}

export default function App() {
  const [position, setPosition] = useState<number>(MIN_POSITION)
  const frames = useFrameImages(position)
  const pair = frames.manifest ? getAdjacentFrames(position, frames.manifest.frames) : null
  const required = pair ? (pair.ratio === 0 ? [pair.lower] : pair.ratio === 1 ? [pair.upper] : [pair.lower, pair.upper]) : []
  const missing = required.filter(entry => !frames.loaded.has(entry.position))
  const targetFailed = missing.some(entry => frames.failedPositions.includes(entry.position))
  const [mode, setMode] = useState<DisplayMode>('mono')
  const [hintVisible, setHintVisible] = useState(readHintVisibility)

  const handlePositionChange = useCallback((nextPosition: number, cause: 'drag' | 'click' | 'keyboard') => {
    setPosition(clampPosition(nextPosition))
    if (cause === 'drag' || cause === 'click' || cause === 'keyboard') {
      setHintVisible((visible) => {
        if (visible) markHintSeen()
        return false
      })
    }
  }, [])

  return (
    <div className="app-shell">
      <header className="topbar">
        <ModeSwitch mode={mode} onModeChange={setMode} />
      </header>

      <main className="main-content">
        <section className="portrait-panel" aria-label="大头儿子作品形象变迁">
          <div className="portrait-frame">
            <FaceCanvas position={position} mode={mode} frames={frames} />
            {frames.loaded.size === 0 && !frames.error && (
              <div className="portrait-loading" role="status">正在加载人物…</div>
            )}
          </div>
          <div className="year-readout">
            年份：{formatPosition(position)}
          </div>
          <p className="work-caption">{describeYear(position)}</p>
          <div className="asset-status-slot" role="status">
            {frames.error || targetFailed ? (
              <span className="asset-status">该形象加载失败。<button className="retry-button" onClick={frames.retry}>重试</button></span>
            ) : missing.length > 0 && frames.loaded.size > 0 ? (
              <span className="asset-status">正在加载所选形象，暂显示已加载版本…</span>
            ) : null}
          </div>
        </section>

        <section className="controls-panel" aria-label="作品年份导航">
          <div className={`hint${hintVisible ? '' : ' hint--hidden'}`} aria-hidden={!hintVisible}>
            <span className="hint-dot" aria-hidden="true" />
            左右拖动，松手停在整年
          </div>
          <TimelineRuler position={position} onPositionChange={handlePositionChange} />
          <p className="sr-only" id="timeline-help">
            方向键逐年切换，2026 年后是同年成年形象。Shift 加方向键跨五格，Page Up 和 Page Down 跨十格，Home 和 End 到达首尾。
          </p>
        </section>

        <footer className="footer-note">
          <span>大头儿子 · 1995—2026 · 形象经正面化重绘，年份间为混合过渡</span>
        </footer>
      </main>
    </div>
  )
}
