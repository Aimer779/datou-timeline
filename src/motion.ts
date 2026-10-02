interface FrameClock {
  now: () => number
  request: (callback: FrameRequestCallback) => number
  cancel: (id: number) => void
}

const browserClock: FrameClock = {
  now: () => performance.now(),
  request: (callback) => requestAnimationFrame(callback),
  cancel: (id) => cancelAnimationFrame(id),
}

/** One interruptible transition. Cancelling prevents any later frame from publishing. */
export function animateValue(
  from: number,
  to: number,
  duration: number,
  update: (value: number) => void,
  clock: FrameClock = browserClock,
): () => void {
  if (duration <= 0 || from === to) {
    update(to)
    return () => {}
  }
  const start = clock.now()
  let active = true
  let frame: number
  const tick: FrameRequestCallback = (now) => {
    if (!active) return
    const progress = Math.min(1, Math.max(0, (now - start) / duration))
    update(progress === 1 ? to : from + (to - from) * (1 - (1 - progress) ** 3))
    if (progress < 1 && active) frame = clock.request(tick)
    else active = false
  }
  frame = clock.request(tick)
  return () => {
    active = false
    clock.cancel(frame)
  }
}
