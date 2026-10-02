import { useEffect, useRef, useState } from 'react'
import { animateValue } from '../motion'
import { describeYear } from '../works'
import { NODE_POSITIONS } from '../types'
import {
  positionFromDragDelta,
  positionFromRulerOffset,
  clampPosition,
  MAX_POSITION,
  MIN_POSITION,
  nearestPosition,
  formatPosition,
} from '../timeline'

interface TimelineRulerProps {
  position: number
  onPositionChange: (position: number, cause: 'drag' | 'click' | 'keyboard') => void
}

const TICK_SPACING = 20
const PEAK_TICK_HEIGHT = 80
const TICKS = Array.from({ length: MAX_POSITION - MIN_POSITION + 1 }, (_, index) => MIN_POSITION + index)

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function TimelineRuler({ position, onPositionChange }: TimelineRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const latestPosition = useRef(position)
  const latestChange = useRef(onPositionChange)
  latestPosition.current = position
  latestChange.current = onPositionChange
  const pointerRef = useRef<{
    id: number
    startX: number
    startPosition: number
    moved: boolean
  }>({ id: -1, startX: 0, startPosition: MIN_POSITION, moved: false })
  const animationRef = useRef<() => void>(() => {})
  const targetRef = useRef<number | null>(null)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const stopMotion = () => {
      if (!media.matches || targetRef.current === null) return
      animationRef.current()
      const target = targetRef.current
      targetRef.current = null
      latestPosition.current = target
      latestChange.current(target, 'click')
    }
    media.addEventListener('change', stopMotion)
    return () => {
      animationRef.current()
      media.removeEventListener('change', stopMotion)
    }
  }, [])

  const cancelActiveAnimation = () => {
    animationRef.current()
    targetRef.current = null
  }

  const publish = (next: number, cause: 'drag' | 'click' | 'keyboard') => {
    latestPosition.current = next
    onPositionChange(next, cause)
  }

  const positionAtClientX = (clientX: number) => {
    const element = rulerRef.current
    if (!element) return position
    const rect = element.getBoundingClientRect()
    return positionFromRulerOffset(latestPosition.current, clientX - (rect.left + rect.width / 2), TICK_SPACING)
  }

  const animateTo = (target: number, cause: 'drag' | 'click' = 'click') => {
    cancelActiveAnimation()
    const next = nearestPosition(target)
    targetRef.current = next
    animationRef.current = animateValue(latestPosition.current, next,
      prefersReducedMotion() ? 0 : cause === 'drag' ? 100 : 160,
      (value) => {
        publish(value, cause)
        if (value === next) targetRef.current = null
      })
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0 || pointerRef.current.id !== -1) return
    cancelActiveAnimation()
    setDragging(true)
    pointerRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startPosition: latestPosition.current,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.focus({ preventScroll: true })
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current
    if (pointer.id !== event.pointerId) return
    if (!pointer.moved && Math.abs(event.clientX - pointer.startX) < 3) return
    pointer.moved = true
    publish(
      positionFromDragDelta(pointer.startPosition, event.clientX - pointer.startX, TICK_SPACING),
      'drag',
    )
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current
    if (pointer.id !== event.pointerId) return
    if (!pointer.moved) animateTo(positionAtClientX(event.clientX))
    else animateTo(positionFromDragDelta(pointer.startPosition,
      event.clientX - pointer.startX, TICK_SPACING), 'drag')
    setDragging(false)
    pointerRef.current = { id: -1, startX: 0, startPosition: position, moved: false }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current.id !== event.pointerId) return
    cancelActiveAnimation()
    setDragging(false)
    publish(nearestPosition(latestPosition.current), 'drag')
    pointerRef.current = { id: -1, startX: 0, startPosition: position, moved: false }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (pointerRef.current.id !== -1) return
    const step = event.shiftKey ? 5 : 1
    let next: number | null = null
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = position - step
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = position + step
    if (event.key === 'PageDown') next = position - 10
    if (event.key === 'PageUp') next = position + 10
    if (event.key === 'Home') next = MIN_POSITION
    if (event.key === 'End') next = MAX_POSITION
    if (next === null) return
    cancelActiveAnimation()
    event.preventDefault()
    publish(nearestPosition(next), 'keyboard')
  }

  return (
    <div className="ruler-block">
      <div
        ref={rulerRef}
        className="ruler-viewport"
        data-dragging={dragging}
        role="slider"
        tabIndex={0}
        aria-label="作品年份"
        aria-orientation="horizontal"
        aria-valuemin={MIN_POSITION}
        aria-valuemax={MAX_POSITION}
        aria-valuenow={clampPosition(position)}
        aria-valuetext={`${formatPosition(position)}，${describeYear(position)}`}
        aria-describedby="timeline-help"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handlePointerCancel}
        onKeyDown={handleKeyDown}
      >
        {TICKS.map((tick) => {
          const distance = Math.abs(tick - position)
          const profile = 1 / (1 + (distance / 4.5) ** 2)
          return (
            <span
              aria-hidden="true"
              className={`ruler-tick${(NODE_POSITIONS as readonly number[]).includes(tick) ? ' ruler-tick--work' : ''}`}
              key={tick}
              style={{
                left: `calc(50% + ${(tick - position) * TICK_SPACING}px)`,
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
