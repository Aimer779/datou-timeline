import { describe, expect, it, vi } from 'vitest'
import { createSoundFeedback } from '../src/sound'

function audioFixture() {
  const param = () => ({
    setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  })
  const oscillators: Array<{ start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>; onended: (() => void) | null }> = []
  const envelopes: Array<{ disconnect: ReturnType<typeof vi.fn> }> = []
  const context = {
    state: 'running', currentTime: 0, destination: {},
    resume: vi.fn(async () => {}), close: vi.fn(async () => {}),
    createOscillator: vi.fn(() => {
      const node = { type: '', frequency: param(), connect: vi.fn(), disconnect: vi.fn(),
        start: vi.fn(), stop: vi.fn(), onended: null as (() => void) | null }
      oscillators.push(node)
      return node
    }),
    createGain: vi.fn(() => {
      const node = { gain: param(), connect: vi.fn(), disconnect: vi.fn() }
      envelopes.push(node)
      return node
    }),
  }
  const factory = vi.fn(() => context as unknown as AudioContext)
  return { context, factory, oscillators, envelopes, sound: createSoundFeedback(factory) }
}

describe('interaction sound lifecycle', () => {
  it('stays silent before a gesture and while disabled', async () => {
    const f = audioFixture()
    f.sound.play('tick')
    expect(f.factory).not.toHaveBeenCalled()
    f.sound.setEnabled(false)
    await f.sound.unlock()
    expect(f.factory).not.toHaveBeenCalled()
    f.sound.setEnabled(true)
    await f.sound.unlock()
    f.sound.play('tick')
    expect(f.oscillators).toHaveLength(1)
    f.sound.setEnabled(false)
    expect(f.envelopes[0].disconnect).toHaveBeenCalled()
    f.context.currentTime = 1
    f.sound.play('color')
    expect(f.oscillators).toHaveLength(1)
  })

  it('drops rapid ticks without a backlog and releases finished voices', async () => {
    const f = audioFixture()
    await f.sound.unlock()
    f.sound.play('tick')
    f.context.currentTime = 0.02
    f.sound.play('tick')
    expect(f.oscillators).toHaveLength(1)
    f.context.currentTime = 0.06
    f.sound.play('tick')
    expect(f.oscillators).toHaveLength(2)
    expect(f.oscillators[0].stop).toHaveBeenCalledWith(0.025)
    f.oscillators[0].onended?.()
    expect(f.oscillators[0].disconnect).toHaveBeenCalled()
    f.sound.dispose()
    expect(f.context.close).toHaveBeenCalled()
  })

  it('fails silently when audio is unavailable or resume is rejected', async () => {
    const unavailable = createSoundFeedback(() => { throw new Error('unsupported') })
    await expect(unavailable.unlock()).resolves.toBeUndefined()
    expect(() => unavailable.play('tick')).not.toThrow()
    const f = audioFixture()
    f.context.state = 'suspended'
    f.context.resume.mockRejectedValue(new Error('blocked'))
    await expect(f.sound.unlock()).resolves.toBeUndefined()
    f.sound.play('tick')
    expect(f.oscillators).toHaveLength(0)
  })

  it('does not play a pending resume after the user mutes', async () => {
    const f = audioFixture()
    let resume!: () => void
    f.context.state = 'suspended'
    f.context.resume.mockImplementation(() => new Promise<void>(resolve => { resume = resolve }))
    f.sound.gesture('color')
    f.sound.setEnabled(false)
    f.context.state = 'running'
    resume()
    await Promise.resolve()
    await Promise.resolve()
    expect(f.oscillators).toHaveLength(0)
  })
})
