import type { Phase } from '../types'
import { diffDays } from './dates'

// Thresholds in percentage points (actual - expected).
export const ON_TRACK_MIN = -5
export const SLIGHTLY_BEHIND_MIN = -15

export type TrackStatus = 'on_track' | 'slightly_behind' | 'behind'

export function countTasks(phases: Phase[]): { done: number; total: number } {
  let done = 0
  let total = 0
  for (const p of phases) {
    total += p.tasks.length
    done += p.tasks.filter((t) => t.done).length
  }
  return { done, total }
}

/** Overall progress in percent, weighted by number of tasks. 0 when there are no tasks. */
export function overallProgress(phases: Phase[]): number {
  const { done, total } = countTasks(phases)
  return total === 0 ? 0 : (done / total) * 100
}

export function phaseProgress(phase: Phase): number {
  return phase.tasks.length === 0
    ? 0
    : (phase.tasks.filter((t) => t.done).length / phase.tasks.length) * 100
}

/** Share of the phase's time window elapsed by `today`, clamped to 0..1. */
export function elapsedFraction(phase: Phase, today: string): number {
  if (today < phase.startDate) return 0
  if (today > phase.endDate) return 1
  const length = diffDays(phase.startDate, phase.endDate) + 1
  const elapsed = diffDays(phase.startDate, today) + 1
  return elapsed / length
}

/**
 * Expected progress in percent by `today`: tasks of finished phases count fully,
 * tasks of running phases count by the linear share of elapsed time.
 */
export function expectedProgress(phases: Phase[], today: string): number {
  const { total } = countTasks(phases)
  if (total === 0) return 0
  const expected = phases.reduce(
    (sum, p) => sum + p.tasks.length * elapsedFraction(p, today),
    0,
  )
  return (expected / total) * 100
}

export function trackStatus(diff: number): TrackStatus {
  if (diff >= ON_TRACK_MIN) return 'on_track'
  if (diff >= SLIGHTLY_BEHIND_MIN) return 'slightly_behind'
  return 'behind'
}

export function daysLeft(deadline: string, today: string): number {
  return diffDays(today, deadline)
}
