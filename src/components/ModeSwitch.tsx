import type { DisplayMode } from '../types'

interface ModeSwitchProps {
  mode: DisplayMode
  onModeChange: (mode: DisplayMode) => void
}

export function ModeSwitch({ mode, onModeChange }: ModeSwitchProps) {
  return (
    <div className="mode-switch" role="group" aria-label="头像色彩模式">
      <button
        className={mode === 'mono' ? 'mode-button mode-button--active' : 'mode-button'}
        type="button"
        aria-pressed={mode === 'mono'}
        onClick={() => onModeChange('mono')}
      >
        黑白
      </button>
      <button
        className={mode === 'color' ? 'mode-button mode-button--active' : 'mode-button'}
        type="button"
        aria-pressed={mode === 'color'}
        onClick={() => onModeChange('color')}
      >
        彩色
      </button>
    </div>
  )
}
