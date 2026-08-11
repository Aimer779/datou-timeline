import type { DisplayMode } from '../types'

interface ModeSwitchProps {
  mode: DisplayMode
  onModeChange: (mode: DisplayMode) => void
}

export function ModeSwitch({ mode, onModeChange }: ModeSwitchProps) {
  return (
    <div className="mode-switch" role="group" aria-label="Portrait color mode">
      <button
        className={mode === 'mono' ? 'mode-button mode-button--active' : 'mode-button'}
        type="button"
        aria-pressed={mode === 'mono'}
        onClick={() => onModeChange('mono')}
      >
        Mono
      </button>
      <button
        className={mode === 'color' ? 'mode-button mode-button--active' : 'mode-button'}
        type="button"
        aria-pressed={mode === 'color'}
        onClick={() => onModeChange('color')}
      >
        Color
      </button>
    </div>
  )
}
