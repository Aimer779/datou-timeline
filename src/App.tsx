import { useCallback, useState } from 'react'
import { clampAge, formatAge, MIN_AGE } from './age'
import { AgeRuler } from './components/AgeRuler'
import { FaceCanvas } from './components/FaceCanvas'
import { ModeSwitch } from './components/ModeSwitch'
import { useFrameImages } from './hooks/useFrameImages'
import type { DisplayMode } from './types'

const HINT_STORAGE_KEY = 'age-progression-hint-seen'

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
  const [age, setAge] = useState<number>(MIN_AGE)
  const [mode, setMode] = useState<DisplayMode>('mono')
  const [hintVisible, setHintVisible] = useState(readHintVisibility)

  const handleAgeChange = useCallback((nextAge: number, cause: 'drag' | 'click' | 'keyboard') => {
    setAge(clampAge(nextAge))
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
        <section className="portrait-panel" aria-label="Age progression portrait">
          <div className="portrait-frame">
            <FaceCanvas age={age} mode={mode} frames={frames} />
          </div>
          <div className="age-readout" aria-live="polite">
            Age: {formatAge(age)}
          </div>
          {frames.error ? (
            <p className="asset-status" role="status">
              Age portraits are unavailable. Please try again later.
            </p>
          ) : frames.failedAges.length > 0 ? (
            <p className="asset-status" role="status">
              Showing the nearest available portrait; {frames.failedAges.length} age frame
              {frames.failedAges.length === 1 ? '' : 's'} could not be loaded.
            </p>
          ) : null}
        </section>

        <section className="controls-panel" aria-label="Age navigation">
          <div className={`hint${hintVisible ? '' : ' hint--hidden'}`} aria-hidden={!hintVisible}>
            <span className="hint-dot" aria-hidden="true" />
            Drag to travel through age
          </div>
          <AgeRuler age={age} onAgeChange={handleAgeChange} />
          <p className="sr-only">
            Use the slider, arrow keys, or Page Up/Page Down. Home and End jump to the bounds.
          </p>
        </section>

        <footer className="footer-note">
          <span>Illustrated simulation, not a prediction</span>
        </footer>
      </main>
    </div>
  )
}
