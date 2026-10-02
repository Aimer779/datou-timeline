import { useCallback, useState } from 'react'
import { clampYear, formatYear, MIN_YEAR } from './year'
import { YearRuler } from './components/YearRuler'
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
  const frames = useFrameImages()
  const [year, setYear] = useState<number>(MIN_YEAR)
  const [mode, setMode] = useState<DisplayMode>('mono')
  const [hintVisible, setHintVisible] = useState(readHintVisibility)

  const handleYearChange = useCallback((nextYear: number, cause: 'drag' | 'click' | 'keyboard') => {
    setYear(clampYear(nextYear))
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
            <FaceCanvas year={year} mode={mode} frames={frames} />
          </div>
          <div className="year-readout" aria-live="polite">
            年份：{formatYear(year)}
          </div>
          <p className="work-caption" aria-live="polite">{describeYear(year)}</p>
          {frames.error ? (
            <p className="asset-status" role="status">
              人物图像暂时无法加载，请刷新重试。
            </p>
          ) : frames.failedYears.length > 0 ? (
            <p className="asset-status" role="status">
              {frames.failedYears.length} 张图像加载失败，正在显示最近的可用形象。
            </p>
          ) : null}
        </section>

        <section className="controls-panel" aria-label="作品年份导航">
          <div className={`hint${hintVisible ? '' : ' hint--hidden'}`} aria-hidden={!hintVisible}>
            <span className="hint-dot" aria-hidden="true" />
            拖动，回看每一年的大头儿子
          </div>
          <YearRuler year={year} onYearChange={handleYearChange} />
          <p className="sr-only">
            方向键逐年切换，Shift 加方向键跨五年，Page Up 和 Page Down 跨十年，Home 和 End 到达首尾。
          </p>
        </section>

        <footer className="footer-note">
          <span>大头儿子 · 1995—2026 · 形象经正面化重绘，年份间为混合过渡</span>
        </footer>
      </main>
    </div>
  )
}
