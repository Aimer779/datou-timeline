export type SoundKind = 'tick' | 'mono' | 'color'

/** Quiet, percussive feedback. No context is created until a user gesture. */
export function createSoundFeedback(
  createContext: () => AudioContext = () => new AudioContext({ latencyHint: 'interactive' }),
) {
  let context: AudioContext | null = null
  let enabled = true
  let lastSound = -Infinity
  const voices = new Set<GainNode>()

  function unlock(): Promise<void> {
    if (!enabled) return Promise.resolve()
    try {
      context ??= createContext()
      return context.state === 'running' ? Promise.resolve() : context.resume().catch(() => {})
    } catch {
      // Audio is optional: unsupported or blocked playback must not break navigation.
      return Promise.resolve()
    }
  }

  function play(kind: SoundKind) {
    if (!enabled || !context || context.state !== 'running') return
    const now = context.currentTime
    // Drop excess ticks; never queue a burst that plays after the gesture ends.
    if (now - lastSound < 0.055) return
    lastSound = now
    const oscillator = context.createOscillator()
    const envelope = context.createGain()
    const tick = kind === 'tick'
    const duration = tick ? 0.025 : 0.055
    const frequency = tick ? 780 : kind === 'color' ? 620 : 460
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(frequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.55, now + duration)
    envelope.gain.setValueAtTime(0, now)
    envelope.gain.linearRampToValueAtTime(tick ? 0.035 : 0.05, now + 0.002)
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration - 0.003)
    envelope.gain.linearRampToValueAtTime(0, now + duration)
    oscillator.connect(envelope)
    envelope.connect(context.destination)
    voices.add(envelope)
    oscillator.onended = () => {
      oscillator.disconnect()
      envelope.disconnect()
      voices.delete(envelope)
    }
    oscillator.start(now)
    oscillator.stop(now + duration)
  }

  function gesture(kind: SoundKind) {
    const started = performance.now()
    void unlock().then(() => {
      // A delayed permission/resume must not produce an unrelated late click.
      if (performance.now() - started < 120) play(kind)
    })
  }

  function setEnabled(value: boolean) {
    enabled = value
    if (!value) {
      voices.forEach(voice => voice.disconnect())
      voices.clear()
    }
  }

  function dispose() {
    voices.forEach(voice => voice.disconnect())
    voices.clear()
    if (context) void context.close().catch(() => {})
    context = null
    lastSound = -Infinity
  }

  return { unlock, play, gesture, setEnabled, dispose }
}
