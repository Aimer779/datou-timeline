import { useEffect, useRef } from 'react'
import {
  ageFromDragDelta,
  ageFromRulerOffset,
  clampAge,
  MAX_AGE,
  MIN_AGE,
  nearestAge,
} from '../age'

interface AgeRulerProps {
  age: number
  onAgeChange: (age: number, cause: 'drag' | 'click' | 'keyboard') => void
}

const TICK_SPACING = 20
const PEAK_TICK_HEIGHT = 80
const TICKS = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, index) => MIN_AGE + index)

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function AgeRuler({ age, onAgeChange }: AgeRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<{
    id: number
    startX: number
    startAge: number
    moved: boolean
  }>({ id: -1, startX: 0, startAge: MIN_AGE, moved: false })
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  const cancelActiveAnimation = () => {
    if (animationRef.current === null) return
    cancelAnimationFrame(animationRef.current)
    animationRef.current = null
  }

  const ageAtClientX = (clientX: number) => {
    const element = rulerRef.current
    if (!element) return age
    const rect = element.getBoundingClientRect()
    return ageFromRulerOffset(age, clientX - (rect.left + rect.width / 2), TICK_SPACING)
  }

  const animateTo = (target: number) => {
    const next = clampAge(target)
    if (prefersReducedMotion()) {
      onAgeChange(next, 'click')
      return
    }
    cancelActiveAnimation()
    const start = performance.now()
    const from = age
    const duration = 160
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      onAgeChange(from + (next - from) * eased, 'click')
      if (progress < 1) animationRef.current = requestAnimationFrame(tick)
      else animationRef.current = null
    }
    animationRef.current = requestAnimationFrame(tick)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    cancelActiveAnimation()
    pointerRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startAge: age,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.focus()
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current
    if (pointer.id !== event.pointerId) return
    if (!pointer.moved && Math.abs(event.clientX - pointer.startX) < 3) return
    pointer.moved = true
    onAgeChange(
      ageFromDragDelta(pointer.startAge, event.clientX - pointer.startX, TICK_SPACING),
      'drag',
    )
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current
    if (pointer.id !== event.pointerId) return
    if (!pointer.moved) animateTo(ageAtClientX(event.clientX))
    pointerRef.current = { id: -1, startX: 0, startAge: age, moved: false }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current.id !== event.pointerId) return
    pointerRef.current = { id: -1, startX: 0, startAge: age, moved: false }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 5 : 1
    let next: number | null = null
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = age - step
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = age + step
    if (event.key === 'PageDown') next = age - 10
    if (event.key === 'PageUp') next = age + 10
    if (event.key === 'Home') next = MIN_AGE
    if (event.key === 'End') next = MAX_AGE
    if (next === null) return
    cancelActiveAnimation()
    event.preventDefault()
    onAgeChange(nearestAge(next), 'keyboard')
  }

  return (
    <div className="ruler-block">
      <div
        ref={rulerRef}
        className="ruler-viewport"
        role="slider"
        tabIndex={0}
        aria-label="Age"
        aria-orientation="horizontal"
        aria-valuemin={MIN_AGE}
        aria-valuemax={MAX_AGE}
        aria-valuenow={Math.round(clampAge(age))}
        aria-valuetext={`Age ${Math.round(clampAge(age))}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
      >
        {TICKS.map((tick) => {
          const distance = Math.abs(tick - age)
          const profile = 1 / (1 + (distance / 4.5) ** 2)
          return (
            <span
              aria-hidden="true"
              className="ruler-tick"
              key={tick}
              style={{
                left: `calc(50% + ${(tick - age) * TICK_SPACING}px)`,
                opacity: distance < 0.45 ? 0 : 0.18 + profile * 0.62,
                height: `${profile * PEAK_TICK_HEIGHT}px`,
              }}
            />
          )
        })}
        <span className="ruler-center" aria-hidden="true" />
      </div>
    </div>
  )
}
