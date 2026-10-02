import { describe, expect, it } from 'vitest'
import { createFrameQueue } from '../src/frameQueue'
import { portraitUrl } from '../src/assets'

const flush = async () => { for (let i = 0; i < 6; i++) await Promise.resolve() }

describe('portrait scheduling', () => {
  it('limits concurrency, reprioritizes a new target and never duplicates requests', async () => {
    const requests: number[] = []
    const complete = new Map<number, (result: number) => void>()
    const results: number[] = []
    let idle = false
    const queue = createFrameQueue([0, 1, 2, 3, 4], entry => {
      requests.push(entry)
      return new Promise<number>(resolve => complete.set(entry, resolve))
    }, (_entry, result) => results.push(result), () => {}, () => { idle = true })
    queue.start()
    await flush()
    expect(requests).toEqual([0, 1])
    queue.prioritize(entry => Math.abs(4 - entry))
    complete.get(0)!(0)
    await flush()
    expect(requests).toEqual([0, 1, 4])
    complete.get(1)!(1)
    await flush()
    expect(requests).toEqual([0, 1, 4, 3])
    complete.get(4)!(4)
    await flush()
    complete.get(3)!(3)
    complete.get(2)!(2)
    await flush()
    expect(new Set(results).size).toBe(5)
    expect(idle).toBe(true)
  })

  it('continues after a failed frame and suppresses late results after disposal', async () => {
    const failures: number[] = []
    const loaded: number[] = []
    let resolveLate!: (value: number) => void
    const queue = createFrameQueue([0, 1, 2], entry => entry === 0
      ? Promise.reject(new Error('offline'))
      : new Promise<number>(resolve => { resolveLate = resolve }),
    entry => loaded.push(entry), entry => failures.push(entry), () => {}, 1)
    queue.start()
    await flush()
    expect(failures).toEqual([0])
    queue.stop()
    resolveLate(1)
    await flush()
    expect(loaded).toEqual([])
  })

  it('resolves the same assets at a root domain and a GitHub repository path', () => {
    expect(portraitUrl('frame.webp', '/')).toBe('/year-frames/frame.webp')
    expect(portraitUrl('frame.webp', '/datou-timeline/')).toBe('/datou-timeline/year-frames/frame.webp')
  })
})
