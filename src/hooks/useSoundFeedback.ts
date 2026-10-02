import { useEffect, useState } from 'react'
import { createSoundFeedback } from '../sound'

const STORAGE_KEY = 'datou-timeline-sound'

export function useSoundFeedback() {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) !== 'off' }
    catch { return true }
  })
  const [sound] = useState(() => {
    const feedback = createSoundFeedback()
    feedback.setEnabled(enabled)
    return feedback
  })

  useEffect(() => () => sound.dispose(), [sound])

  function toggle() {
    const next = !enabled
    sound.setEnabled(next)
    setEnabled(next)
    try { localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off') }
    catch { /* Storage can be denied; the current session still respects mute. */ }
    if (next) sound.gesture('mono')
  }

  return { enabled, toggle, sound }
}
