/** Bounded background work; reprioritization affects pending tasks, never duplicates in-flight work. */
export function createFrameQueue<T, R>(
  entries: readonly T[],
  load: (entry: T) => Promise<R>,
  loaded: (entry: T, result: R) => void,
  failed: (entry: T) => void,
  idle: () => void,
  concurrency = 2,
) {
  let pending = [...entries]
  let active = 0
  let stopped = false
  let started = false
  const pump = () => {
    if (stopped || !started) return
    if (active === 0 && pending.length === 0) { idle(); return }
    while (active < concurrency && pending.length) {
      const entry = pending.shift()!
      active++
      void Promise.resolve().then(() => load(entry)).then(
        result => { if (!stopped) loaded(entry, result) },
        () => { if (!stopped) failed(entry) },
      ).finally(() => { active--; pump() })
    }
  }
  return {
    prioritize: (priority: (entry: T) => number) => {
      pending.sort((a, b) => priority(a) - priority(b))
    },
    start: () => { started = true; pump() },
    stop: () => { stopped = true; pending = [] },
  }
}
